// GoogleAdsAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const calcs = require('../calculations/adsCalculators');

const client = new Anthropic();

function analyzeGoogleAdsLocally(data = {}) {
  const { impressions = 0, clicks = 0, cost = 0, conversions = 0, revenue = 0, previous = {} } = data;

  const metrics = {
    impressions, clicks, cost, conversions, revenue,
    ctr:      calcs.calcCTR(clicks, impressions),
    cpc:      calcs.calcCPC(cost, clicks),
    cpa:      calcs.calcCPA(cost, conversions),
    roas:     calcs.calcROAS(revenue, cost),
    conv_rate: calcs.calcConvRate(conversions, clicks),
  };

  const health  = calcs.calcCampaignHealthScore(metrics, 'google_search');
  const alerts  = calcs.detectAdsAlerts(metrics, previous);
  const bench   = CONFIG.benchmarks.google_search;

  const scenarios = [];
  if (metrics.ctr < bench.ctr_atencao && metrics.cpa > bench.cpa_max_brl)
    scenarios.push({ id: 'S1', name: 'CTR baixo + CPA alto', diagnosis: 'Problema de relevância — criativo, keyword ou público mal alinhado' });
  if (metrics.ctr > bench.ctr_bom && metrics.cpa > bench.cpa_max_brl)
    scenarios.push({ id: 'S2', name: 'CTR alto + CPA alto', diagnosis: 'Anúncio chama atenção mas tráfego não converte — problema na landing page ou oferta' });
  if (metrics.roas > bench.roas_bom && conversions > 5)
    scenarios.push({ id: 'S5', name: 'ROAS alto + baixo investimento', diagnosis: 'Oportunidade de escala — aumentar budget gradualmente' });

  return { metrics, health, alerts, scenarios };
}

async function analyzeGoogleAdsWithClaude(data, campaignContext = '') {
  const local = analyzeGoogleAdsLocally(data);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Ads Agent Pro da SmartOps IA — especialista sênior em Google Ads.

Missão: Analisar dados de Google Ads e transformar em decisões práticas orientadas a lucro.

## DADOS DA CONTA
Período: ${data.period || 'últimos 7 dias'}
Contexto: ${campaignContext || 'SmartOps IA — consultoria Lean + Automação'}

Métricas:
- Impressões: ${local.metrics.impressions.toLocaleString('pt-BR')}
- Cliques: ${local.metrics.clicks.toLocaleString('pt-BR')}
- CTR: ${local.metrics.ctr}%
- CPC médio: R$ ${local.metrics.cpc}
- Custo total: R$ ${local.metrics.cost}
- Conversões: ${local.metrics.conversions}
- CPA: R$ ${local.metrics.cpa}
- Receita: R$ ${local.metrics.revenue}
- ROAS: ${local.metrics.roas}
- Taxa de conversão: ${local.metrics.conv_rate}%

Score de saúde: ${local.health.score}/100 (${local.health.label})
Issues detectados: ${local.health.issues.map(i => `${i.metric}: ${i.value} [${i.severity}]`).join(', ') || 'nenhum'}
Alertas críticos: ${local.alerts.critico.join(', ') || 'nenhum'}

Cenários identificados: ${local.scenarios.map(s => s.name).join(', ') || 'análise normal'}

Benchmarks Google Search:
CTR bom: > ${CONFIG.benchmarks.google_search.ctr_bom}% | CPA máx: R$ ${CONFIG.benchmarks.google_search.cpa_max_brl} | ROAS mín: ${CONFIG.benchmarks.google_search.roas_min}

---

Responda no formato padrão:

# GOOGLE ADS PERFORMANCE ANALYSIS

## SCORE DA CONTA
Nota: ${local.health.score}/100 — ${local.health.label}
[Motivo da nota em 2 linhas]

## DIAGNÓSTICO
[O que os dados indicam — nunca genérico, sempre com evidência]

## PROBLEMAS CRÍTICOS (P1)
[O que está custando dinheiro agora, com dado concreto]

## OPORTUNIDADES
[O que pode ser melhorado ou escalado]

## TESTES A/B RECOMENDADOS
[2-3 testes específicos para esta semana]

## PLANO DE AÇÃO PRIORIZADO
P1 - Urgente: [ação + motivo + impacto esperado]
P2 - Alta: [ação + motivo]
P3 - Média: [ação + motivo]

## PALAVRAS-CHAVE
[Oportunidades ou problemas identificados com as keywords]

## PREVISÃO
[Se implementar P1 e P2, o que deve acontecer com CTR, CPA e ROAS]

## CONCLUSÃO
[A primeira coisa a fazer nas próximas 2 horas]`,
    }],
  });

  return { analysis: response.content[0].text, data: local };
}

module.exports = { analyzeGoogleAdsWithClaude, analyzeGoogleAdsLocally };
