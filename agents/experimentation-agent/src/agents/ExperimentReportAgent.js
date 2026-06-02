// ExperimentReportAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { generateHypothesesLocally } = require('./HypothesisAgent');
const { recommendNextTest } = require('../statistical/calculations');
const { rankHypotheses } = require('../scoring/iceScore');

const client = new Anthropic();

function buildExperimentSnapshot(kpis = {}) {
  const hypotheses = generateHypothesesLocally(kpis);
  const nextTests  = recommendNextTest(kpis);
  const baseline   = CONFIG.baseline_kpis;

  const kpi_delta = {};
  Object.entries(kpis).forEach(([k, v]) => {
    if (baseline[k]) {
      kpi_delta[k] = { current: v, baseline: baseline[k], delta_pct: Math.round(((v - baseline[k]) / baseline[k]) * 1000) / 10 };
    }
  });

  return {
    date: new Date().toISOString().split('T')[0],
    kpis_current: kpis,
    kpis_delta:   kpi_delta,
    hypotheses:   hypotheses.top_3,
    next_tests:   nextTests.slice(0, 3),
    active_experiments: 0,
    wins_this_month:    0,
    total_uplift_pct:   0,
  };
}

async function generateExperimentReportWithClaude(snapshot, mode = 'weekly') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Experiment Report Agent da SmartOps IA.

Missão: Gerar relatório de experimentação para tomada de decisão.

Tipo: ${mode}
Data: ${snapshot.date}
Empresa: SmartOps IA — consultoria Lean + Automação, BH

KPIs atuais vs baseline:
${Object.entries(snapshot.kpis_delta || {}).map(([k, v]) => `${k}: ${v.current} vs ${v.baseline} baseline (${v.delta_pct > 0 ? '+' : ''}${v.delta_pct}%)`).join('\n') || 'Sem dados de KPI comparativo'}

Hipóteses prioritárias:
${snapshot.hypotheses?.map((h, i) => `${i + 1}. ${h.hypothesis} (ICE: ${h.ice_score})`).join('\n') || 'Nenhuma'}

Próximos testes sugeridos:
${snapshot.next_tests?.map(t => `${t.area}: ${t.test} (lift esperado: ${t.expected_lift})`).join('\n') || 'Nenhum'}

---

Gere o Experiment Report no padrão SmartOps:

TÍTULO: Experimentation Report — ${snapshot.date}
CONTEXTO: SmartOps IA — otimização contínua
DADOS ANALISADOS: KPIs e hipóteses priorizadas

PROBLEMA IDENTIFICADO: [gap de performance atual]
EVIDÊNCIA: [dados concretos]
IMPACTO: [custo de não otimizar]
RECOMENDAÇÃO: [top 3 experimentos]
AÇÃO SUGERIDA: [o que testar esta semana]
PRIORIDADE: Alta
ESFORÇO: Baixo/Médio
ROI ESPERADO: [uplift % em conversão e leads]
RISCO DE NÃO AGIR: [o que acontece sem testar]
PRAZO: 7 dias para primeiro resultado
MÉTRICA DE SUCESSO: [o que mede sucesso do experimento]
PRÓXIMO PASSO: [ação concreta em 24h]

---

## EXPERIMENTOS RECOMENDADOS DETALHADOS
[Top 3 com hipótese, variável, métrica, sample e duração]

## LEARNING BOARD
[O que aprendemos com experimentos anteriores que guia os próximos]`,
    }],
  });

  return response.content[0].text;
}

async function generateExperimentDashboard(snapshot) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o Experiment Report Agent da SmartOps IA.

Gere um Executive Dashboard de Experimentação para o CEO Breno Luiz.

Data: ${snapshot.date}
Experimentos ativos: ${snapshot.active_experiments}
Vitórias no mês: ${snapshot.wins_this_month}
Uplift total: ${snapshot.total_uplift_pct}%
KPIs atuais: ${JSON.stringify(snapshot.kpis_current || {}, null, 2)}

Metas trimestrais:
- +${CONFIG.growth_targets.conversao_delta_pct}% conversão
- +${CONFIG.growth_targets.ctr_delta_pct}% CTR
- ${CONFIG.growth_targets.cac_delta_pct}% CAC
- +${CONFIG.growth_targets.reunioes_delta_pct}% reuniões
- +${CONFIG.growth_targets.leads_delta_pct}% leads

Dashboard em 5 pontos:
1. STATUS: [onde estamos vs metas]
2. EXPERIMENTO MAIS IMPORTANTE AGORA: [nome + hipótese + ROI esperado]
3. DECISÃO NECESSÁRIA: [o que Breno precisa aprovar]
4. WIN DA SEMANA: [se houver]
5. PRÓXIMO PASSO: [ação em 24h]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { buildExperimentSnapshot, generateExperimentReportWithClaude, generateExperimentDashboard };
