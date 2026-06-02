// HypothesisAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { detectKPIAlert, recommendNextTest } = require('../statistical/calculations');
const { rankHypotheses } = require('../scoring/iceScore');

const client = new Anthropic();

// Biblioteca de hipóteses por área
const HYPOTHESIS_TEMPLATES = {
  site: [
    { area: 'site', problem: 'Conversão abaixo de 2%', hypothesis: 'Adicionar prova social (logo de clientes + depoimento) acima da dobra aumentará conversão em 15-25%', impact: 8, confidence: 7, ease: 8 },
    { area: 'site', problem: 'Alto bounce rate', hypothesis: 'Substituir headline genérico por headline com problema específico reduzirá bounce em 10-20%', impact: 7, confidence: 6, ease: 9 },
    { area: 'site', problem: 'CTA fraco', hypothesis: 'Mudar CTA de "Saiba mais" para "Ver diagnóstico gratuito" aumentará cliques em 20-40%', impact: 8, confidence: 8, ease: 10 },
  ],
  google_ads: [
    { area: 'google_ads', problem: 'CTR abaixo de 4%', hypothesis: 'Incluir números concretos no título (ex: "Reduza 30% do desperdício") aumentará CTR em 20-35%', impact: 8, confidence: 7, ease: 9 },
    { area: 'google_ads', problem: 'CPA alto', hypothesis: 'Criar grupo de anúncios separado por intenção (informacional vs transacional) reduzirá CPA em 20%', impact: 9, confidence: 6, ease: 6 },
  ],
  whatsapp: [
    { area: 'whatsapp', problem: 'Taxa de resposta < 40%', hypothesis: 'Iniciar mensagem com pergunta direta sobre dor (vs apresentação) aumentará taxa de resposta em 15-25%', impact: 7, confidence: 7, ease: 9 },
  ],
  propostas: [
    { area: 'propostas', problem: 'Taxa de fechamento < 25%', hypothesis: 'Adicionar cálculo de ROI personalizado na proposta aumentará taxa de fechamento em 20-35%', impact: 9, confidence: 7, ease: 7 },
  ],
};

function generateHypothesesLocally(kpis = {}) {
  const alerts = Object.entries(kpis).map(([k, v]) =>
    detectKPIAlert(k, v, CONFIG.baseline_kpis[k] || v * 1.2)
  ).filter(a => a.alert);

  const nextTests = recommendNextTest(kpis);
  const allHypotheses = Object.values(HYPOTHESIS_TEMPLATES).flat();
  const ranked = rankHypotheses(allHypotheses);

  return {
    kpi_alerts:  alerts,
    hypotheses:  ranked,
    top_3:       ranked.slice(0, 3),
    next_tests:  nextTests,
    total:       ranked.length,
    high_priority: ranked.filter(h => h.classification.priority === 'critica' || h.classification.priority === 'alta').length,
    generated_at: new Date().toISOString(),
  };
}

async function generateHypothesesWithClaude(kpis = {}, context = '') {
  const local = generateHypothesesLocally(kpis);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Hypothesis Agent da SmartOps IA.

Missão: Transformar problemas e KPIs em hipóteses testáveis e priorizadas. Dados vencem opiniões.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
KPIs atuais: ${JSON.stringify(kpis, null, 2)}
Baseline referência: ${JSON.stringify(CONFIG.baseline_kpis, null, 2)}
Contexto adicional: ${context || 'análise de rotina'}

Alertas detectados: ${local.kpi_alerts.map(a => `${a.kpi}: ${a.delta_pct}% vs baseline`).join(', ') || 'nenhum'}

Hipóteses locais já priorizadas:
${local.top_3.map((h, i) => `${i + 1}. ${h.hypothesis} (ICE: ${h.ice_score})`).join('\n')}

---

Gere o Hypothesis Report:

# HYPOTHESIS REPORT — SmartOps IA

## DIAGNÓSTICO DOS KPIs
[Analisar o que está bom, ruim e por quê]

## HIPÓTESES PRIORITÁRIAS (TOP 5)
Para cada hipótese:

HIPÓTESE: [afirmação testável]
ÁREA: [site/ads/whatsapp/propostas/criativos]
PROBLEMA: [KPI ou observação que motivou]
EXPERIMENTO PROPOSTO: [o que testar — controle vs variante]
IMPACTO ESPERADO: [% de melhoria estimado]
CONFIANÇA: [baseada em quê]
ICE SCORE: [número]
PRIORIDADE: [Executar Agora / Alta / Média / Backlog]
PRÓXIMO PASSO: [ação imediata]

## HIPÓTESES DE ALTO IMPACTO (FUTURO)
[3-5 hipóteses para o próximo trimestre]

## O QUE NÃO TESTAR AGORA
[hipóteses que não fazem sentido nesse momento — e por quê]

## CONCLUSÃO
[A hipótese #1 para executar esta semana]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { generateHypothesesWithClaude, generateHypothesesLocally, HYPOTHESIS_TEMPLATES };
