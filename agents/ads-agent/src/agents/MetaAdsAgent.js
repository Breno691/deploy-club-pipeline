// MetaAdsAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const calcs = require('../calculations/adsCalculators');

const client = new Anthropic();

function analyzeMetaAdsLocally(data = {}) {
  const { impressions = 0, reach = 0, clicks = 0, cost = 0, conversions = 0, revenue = 0, frequency = 0, previous = {} } = data;

  const metrics = {
    impressions, reach, clicks, cost, conversions, revenue, frequency,
    ctr:      calcs.calcCTR(clicks, impressions),
    cpm:      calcs.calcCPM(cost, impressions),
    cpa:      calcs.calcCPA(cost, conversions),
    roas:     calcs.calcROAS(revenue, cost),
    conv_rate: calcs.calcConvRate(conversions, clicks),
  };

  const health = calcs.calcCampaignHealthScore({ ...metrics, frequency }, 'meta_ads');
  const alerts = calcs.detectAdsAlerts(metrics, previous);
  const bench  = CONFIG.benchmarks.meta_ads;

  const creative_fatigue = frequency > bench.freq_atencao;
  const scale_opportunity = metrics.roas > bench.roas_bom && conversions > 3 && !creative_fatigue;

  return { metrics, health, alerts, creative_fatigue, scale_opportunity };
}

async function analyzeMetaAdsWithClaude(data, campaignContext = '') {
  const local = analyzeMetaAdsLocally(data);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Ads Agent Pro da SmartOps IA — especialista sênior em Meta Ads.

Missão: Analisar Meta Ads (Facebook/Instagram) e transformar dados em decisões de alto impacto.

## DADOS DA CONTA META
Período: ${data.period || 'últimos 7 dias'}
Contexto: ${campaignContext || 'SmartOps IA — consultoria Lean + Automação'}

Métricas:
- Alcance: ${local.metrics.reach.toLocaleString('pt-BR')}
- Impressões: ${local.metrics.impressions.toLocaleString('pt-BR')}
- Frequência: ${local.metrics.frequency}
- CTR: ${local.metrics.ctr}%
- CPM: R$ ${local.metrics.cpm}
- Custo total: R$ ${local.metrics.cost}
- Conversões: ${local.metrics.conversions}
- CPA: R$ ${local.metrics.cpa}
- ROAS: ${local.metrics.roas}

Score: ${local.health.score}/100 (${local.health.label})
Fadiga criativa: ${local.creative_fatigue ? '⚠️ SIM — frequência > ' + CONFIG.benchmarks.meta_ads.freq_atencao : '✅ Não'}
Oportunidade de escala: ${local.scale_opportunity ? '🚀 SIM' : 'Não'}
Alertas: ${local.alerts.critico.join(', ') || 'nenhum crítico'}

---

Responda:

# META ADS PERFORMANCE ANALYSIS

## SCORE DA CONTA
Nota: ${local.health.score}/100 — ${local.health.label}

## DIAGNÓSTICO
[Cruzamento de métricas — nunca análise isolada]

## FADIGA CRIATIVA
[Estado atual dos criativos + recomendações de renovação se necessário]

## PROBLEMAS CRÍTICOS (P1)
[Com evidência numérica]

## TESTES DE CRIATIVO RECOMENDADOS
Para cada teste:
- Criativo atual vs variante proposta
- Hipótese (por que a variante deve ganhar)
- Métrica de decisão
- Duração e amostra mínima

## PÚBLICOS
[Oportunidades de novos públicos, lookalike, remarketing]

## PLANO DE AÇÃO
P1 (hoje): [ação urgente]
P2 (esta semana): [ação importante]
P3 (próxima semana): [otimização]

## ESCALA
[Se/como aumentar budget baseado nos dados]

## CONCLUSÃO
[Primeira ação nas próximas 2 horas]`,
    }],
  });

  return { analysis: response.content[0].text, data: local };
}

module.exports = { analyzeMetaAdsWithClaude, analyzeMetaAdsLocally };
