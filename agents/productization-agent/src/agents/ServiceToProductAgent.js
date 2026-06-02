// ServiceToProductAgent.js — Productization Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function scoreProductLocally(criteria = {}) {
  const w = CONFIG.scoring_weights;
  const score = Math.round(
    (criteria.demanda            || 0) / 10 * w.demanda +
    (criteria.dor_forte          || 0) / 10 * w.dor_forte +
    (criteria.facilidade_entrega || 0) / 10 * w.facilidade_entrega +
    (criteria.escalabilidade     || 0) / 10 * w.escalabilidade +
    (criteria.margem             || 0) / 10 * w.margem +
    (criteria.fit_smartops       || 0) / 10 * w.fit_smartops +
    (criteria.potencial_upsell   || 0) / 10 * w.potencial_upsell
  );

  const classification = Object.entries(CONFIG.score_classification)
    .sort((a, b) => b[1].min - a[1].min)
    .find(([, v]) => score >= v.min);

  return {
    score,
    classification_key: classification?.[0] || 'DISCARD',
    classification:     classification?.[1] || CONFIG.score_classification.DISCARD,
  };
}

async function discoverProductOpportunities(context = {}) {
  const { recent_services = [], client_pain_points = [], repeated_templates = [], cases = [] } = context;

  const initialProducts = Object.values(CONFIG.initial_products);

  const prompt = `Você é o Service To Product Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Fundada por Breno Luiz — Black Belt Lean Six Sigma.
Fase atual: pré-receita — ainda construindo base de clientes.

Missão: identificar quais serviços, conhecimentos e metodologias da SmartOps podem virar produtos digitais ou ofertas replicáveis.

Produtos já mapeados (não sugerir novamente):
${initialProducts.map(p => p.name).join(', ')}

Contexto adicional:
- Serviços recentes: ${JSON.stringify(recent_services)}
- Dores de leads: ${JSON.stringify(client_pain_points)}
- Templates mais usados: ${JSON.stringify(repeated_templates)}
- Cases existentes: ${JSON.stringify(cases)}

Conhecimento disponível da SmartOps:
- Lean Six Sigma (Black Belt)
- DMAIC, Kaizen, VSM, 5S, A3
- Automação com n8n
- Agentes de IA
- Mapeamento de processos
- Análise de gargalos
- Indicadores operacionais
- Redução de retrabalho

Identifique oportunidades de productização além das já mapeadas.

Retorne JSON:
{
  "discovery_date": "${new Date().toISOString().split('T')[0]}",
  "opportunities": [
    {
      "rank": 1,
      "service_or_knowledge": "o que existe que pode virar produto",
      "product_idea": "nome do produto",
      "product_type": "template | checklist | workshop | curso | ferramenta | diagnostico | assinatura",
      "target_audience": "para quem",
      "main_pain": "dor que resolve",
      "promise": "promessa em 1 frase",
      "deliverables": ["entregável 1", "entregável 2"],
      "price_range": "R$ X a R$ Y",
      "tier": "free | entry | b2b_low | core | premium | recurring",
      "funnel_role": "lead_magnet | tripwire | qualifier | main_revenue | mrr",
      "upsell_to": "próximo produto na escada",
      "cost_to_deliver": "baixo | médio | alto",
      "scalability": "alta | média | baixa",
      "scores": {
        "demanda": 0,
        "dor_forte": 0,
        "facilidade_entrega": 0,
        "escalabilidade": 0,
        "margem": 0,
        "fit_smartops": 0,
        "potencial_upsell": 0
      },
      "total_score": 0,
      "why_productize": "argumento principal para criar este produto",
      "validation_method": "como validar antes de construir",
      "next_step": "primeira ação"
    }
  ],
  "quick_wins": ["produto que pode ser criado em menos de 1 semana"],
  "escada_de_valor": "como os produtos se conectam em funil",
  "top_recommendation": "produto mais importante a criar agora",
  "insight": "insight sobre productização da SmartOps"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ServiceToProductAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);

  // Score local para cada oportunidade
  data.opportunities = (data.opportunities || []).map(opp => {
    const scored = scoreProductLocally(opp.scores || {});
    return { ...opp, total_score: scored.score, classification: scored.classification.label };
  }).sort((a, b) => b.total_score - a.total_score);

  return data;
}

async function scoreService({ service, context = '' }) {
  const prompt = `Você é o Service To Product Agent da SmartOps IA.

Avalie se este serviço pode virar produto e dê um score.

Serviço: ${service}
Contexto: ${context || 'serviço da consultoria SmartOps IA'}

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Retorne JSON:
{
  "service": "${service}",
  "can_productize": true,
  "product_formats": ["template", "checklist", "workshop", "diagnóstico", "curso"],
  "best_format": "melhor formato",
  "scores": {
    "demanda": 0,
    "dor_forte": 0,
    "facilidade_entrega": 0,
    "escalabilidade": 0,
    "margem": 0,
    "fit_smartops": 0,
    "potencial_upsell": 0
  },
  "total_score": 0,
  "classification": "Criar agora | Validar | Backlog | Não priorizar",
  "main_blocker": "principal obstáculo para productizar",
  "first_step": "primeira ação recomendada",
  "price_suggestion": "R$ X",
  "funnel_role": "onde entra na escada de valor"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('scoreService: no JSON');
  const data = JSON.parse(jsonMatch[0]);
  const local = scoreProductLocally(data.scores || {});
  data.total_score = local.score;
  data.classification = local.classification.label;
  return data;
}

function listInitialProducts() {
  return Object.values(CONFIG.initial_products)
    .sort((a, b) => b.score - a.score)
    .map(p => ({
      id:           p.id,
      name:         p.name,
      tier:         p.tier,
      price:        p.price,
      score:        p.score,
      funnel_role:  p.funnel_role,
      margin:       p.margin,
      upsell:       p.upsell,
      status:       p.status,
      classification: Object.entries(CONFIG.score_classification)
        .sort((a, b) => b[1].min - a[1].min)
        .find(([, v]) => p.score >= v.min)?.[1]?.label || 'Backlog',
    }));
}

module.exports = { discoverProductOpportunities, scoreService, scoreProductLocally, listInitialProducts };
