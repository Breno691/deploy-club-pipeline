// ProductLaunchAgent.js — Productization Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function createLaunchPlan(productId, launchData = {}) {
  const product = CONFIG.initial_products[productId] || launchData;
  const { launch_date = '', budget = 0, channels = [] } = launchData;

  const prompt = `Você é o Product Launch Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Fase: pré-receita — primeiro lançamento deve ser simples e rápido.

Crie o plano de lançamento para este produto.

Produto: ${product.name || productId}
Preço: R$ ${product.price}
Público: ${product.target}
Promessa: ${product.promise}
Canais disponíveis: ${channels.length > 0 ? channels.join(', ') : 'LinkedIn, Instagram, WhatsApp'}
Budget de lançamento: R$ ${budget || 0} (zero se orgânico)
Data alvo de lançamento: ${launch_date || 'em 2 semanas'}

Premissas da SmartOps:
- Breno ainda está construindo audiência (pré-receita)
- Foco em orgânico + rede de parceiros + LinkedIn
- Sem orçamento grande de ads no início
- Lançamento simples e validado antes

Retorne JSON:
{
  "launch_plan": {
    "product": "${product.name || productId}",
    "launch_date_target": "${launch_date || 'em 2 semanas'}",
    "launch_type": "soft | beta | público",
    "launch_strategy": "orgânico | pago | híbrido"
  },
  "pre_launch": {
    "days_before": 7,
    "actions": [
      { "day": "D-7", "action": "ação de preparação", "channel": "canal", "output": "resultado" }
    ],
    "warm_up_content": ["post 1 — problema", "post 2 — solução", "post 3 — oferta"],
    "outreach_list": "quem contatar diretamente (leads quentes, parceiros)"
  },
  "launch_day": {
    "content": ["post de lançamento", "stories", "DMs diretos"],
    "cta": "CTA principal",
    "response_scripts": {
      "interesse": "resposta para quem demonstrar interesse",
      "duvida":    "resposta para quem tiver dúvida",
      "objecao":   "resposta para objeção de preço"
    }
  },
  "post_launch": {
    "days_after": 7,
    "follow_up": ["follow-up D+1", "follow-up D+3", "follow-up D+7"],
    "social_proof": "como usar primeiros feedbacks para continuar vendendo"
  },
  "content_calendar": [
    { "day": "Dia X", "platform": "LinkedIn", "type": "post", "topic": "tema", "cta": "CTA" }
  ],
  "success_metrics": {
    "minimum": "meta mínima de lançamento",
    "expected": "meta realista",
    "excellent": "meta otimista"
  },
  "launch_checklist": ["✓ item 1", "✓ item 2", "✓ item 3"],
  "risk_mitigation": ["risco 1 e como mitigar"],
  "budget_allocation": {
    "total": ${budget || 0},
    "distribution": "como distribuir o budget"
  },
  "upsell_timing": "quando e como oferecer upsell aos compradores",
  "post_purchase_experience": "o que o cliente recebe após comprar"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ProductLaunchAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.product_id = productId;
  data.created_at = new Date().toISOString();
  return data;
}

async function generateProductRoadmap() {
  const products = Object.values(CONFIG.initial_products).sort((a, b) => b.score - a.score);

  const prompt = `Você é o Product Launch Agent da SmartOps IA.

Crie o roadmap de produtos para os próximos 90 dias.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Fase: pré-receita — primeira receita esperada nos próximos 30-60 dias.

Produtos disponíveis:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, tier: p.tier, score: p.score, upsell: p.upsell })), null, 2)}

Contexto: Breno ainda está construindo audiência. Foco em fechar primeiros clientes, gerar caixa e criar autoridade.

Retorne JSON:
{
  "roadmap_title": "Roadmap de Produtos — SmartOps IA 90 dias",
  "generated_at": "${new Date().toISOString().split('T')[0]}",
  "strategy": "estratégia geral dos próximos 90 dias",
  "phases": {
    "phase1_30d": {
      "label": "Fase 1 — Primeiros 30 dias",
      "goal": "objetivo desta fase",
      "products_to_launch": [
        { "product": "nome", "action": "criar | validar | lançar", "priority": "P1" }
      ],
      "expected_revenue": "R$ X",
      "key_action": "ação mais importante desta fase"
    },
    "phase2_60d": {
      "label": "Fase 2 — 30 a 60 dias",
      "goal": "objetivo desta fase",
      "products_to_launch": [],
      "expected_revenue": "R$ X",
      "key_action": "ação mais importante"
    },
    "phase3_90d": {
      "label": "Fase 3 — 60 a 90 dias",
      "goal": "objetivo desta fase",
      "products_to_launch": [],
      "expected_revenue": "R$ X",
      "key_action": "ação mais importante"
    }
  },
  "product_priority_ranking": [
    { "rank": 1, "product": "nome", "why": "por que priorizar", "expected_revenue_30d": "R$ X" }
  ],
  "first_product_to_launch": "produto para lançar primeiro",
  "first_product_reason": "por que este",
  "revenue_forecast": {
    "conservative": "R$ X em 90 dias",
    "realistic":    "R$ X em 90 dias",
    "optimistic":   "R$ X em 90 dias"
  },
  "critical_dependencies": ["o que precisa acontecer primeiro"],
  "recommendation": "recomendação estratégica principal"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ProductLaunchAgent roadmap: no JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateProductFunnel() {
  const products = Object.values(CONFIG.initial_products).sort((a, b) => a.price - b.price);

  const prompt = `Você é o Product Launch Agent da SmartOps IA.

Desenhe o funil completo de produtos da SmartOps IA.

Produtos disponíveis (em ordem de preço):
${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, tier: p.tier, funnel_role: p.funnel_role, upsell: p.upsell })), null, 2)}

Retorne JSON:
{
  "funnel_name": "Funil de Produtos SmartOps IA",
  "stages": [
    {
      "stage": 1,
      "name": "Atração",
      "product": "produto gratuito ou de entrada",
      "goal": "transformar desconhecido em lead",
      "cta": "CTA desta etapa",
      "conversion_target": "X%",
      "trigger_to_next": "quando oferecer próximo produto"
    }
  ],
  "journey_narrative": "história do lead ao cliente premium SmartOps",
  "lifetime_value_journey": "LTV estimado se cliente percorrer funil completo",
  "biggest_drop_off": "onde mais leads são perdidos no funil",
  "optimization_opportunity": "maior alavanca de melhoria no funil",
  "automation_opportunities": ["o que pode ser automatizado no funil"],
  "content_by_stage": {
    "awareness": "conteúdo para topo",
    "consideration": "conteúdo para meio",
    "decision": "conteúdo para fundo"
  }
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ProductFunnel: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { createLaunchPlan, generateProductRoadmap, generateProductFunnel };
