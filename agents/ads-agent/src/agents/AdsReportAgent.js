// AdsReportAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const calcs = require('../calculations/adsCalculators');
const { analyzeGoogleAdsLocally } = require('./GoogleAdsAgent');
const { analyzeMetaAdsLocally }   = require('./MetaAdsAgent');

const client = new Anthropic();

function buildAdsSnapshot(googleData = {}, metaData = {}) {
  const google = analyzeGoogleAdsLocally(googleData);
  const meta   = analyzeMetaAdsLocally(metaData);
  const total_cost = (googleData.cost || 0) + (metaData.cost || 0);
  const total_conversions = (googleData.conversions || 0) + (metaData.conversions || 0);
  const total_revenue = (googleData.revenue || 0) + (metaData.revenue || 0);

  return {
    date: new Date().toISOString().split('T')[0],
    google: { metrics: google.metrics, health: google.health, alerts: google.alerts },
    meta:   { metrics: meta.metrics,   health: meta.health,   alerts: meta.alerts },
    consolidated: {
      total_cost,
      total_conversions,
      total_revenue,
      blended_cpa:  calcs.calcCPA(total_cost, total_conversions),
      blended_roas: calcs.calcROAS(total_revenue, total_cost),
      health_avg:   Math.round((google.health.score + meta.health.score) / 2),
    },
  };
}

async function generateWeeklyReportWithClaude(snapshot) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Ads Agent Pro da SmartOps IA.

Missão: Gerar relatório semanal de ads com análise profunda e plano de ação.

Data: ${snapshot.date}
Empresa: SmartOps IA — consultoria Lean + Automação, BH

DADOS CONSOLIDADOS:
Investimento total: R$ ${snapshot.consolidated.total_cost?.toLocaleString('pt-BR')}
Conversões: ${snapshot.consolidated.total_conversions}
Receita: R$ ${snapshot.consolidated.total_revenue?.toLocaleString('pt-BR')}
CPA blendado: R$ ${snapshot.consolidated.blended_cpa}
ROAS blendado: ${snapshot.consolidated.blended_roas}
Score médio: ${snapshot.consolidated.health_avg}/100

GOOGLE ADS:
CTR: ${snapshot.google.metrics.ctr}% | CPC: R$ ${snapshot.google.metrics.cpc} | CPA: R$ ${snapshot.google.metrics.cpa} | ROAS: ${snapshot.google.metrics.roas}
Score: ${snapshot.google.health.score}/100 (${snapshot.google.health.label})
Alertas críticos: ${snapshot.google.alerts.critico.join(', ') || 'nenhum'}

META ADS:
CTR: ${snapshot.meta.metrics.ctr}% | CPM: R$ ${snapshot.meta.metrics.cpm} | CPA: R$ ${snapshot.meta.metrics.cpa} | ROAS: ${snapshot.meta.metrics.roas} | Freq: ${snapshot.meta.metrics.frequency}
Score: ${snapshot.meta.health.score}/100 (${snapshot.meta.health.label})
Alertas críticos: ${snapshot.meta.alerts.critico.join(', ') || 'nenhum'}

---

Gere relatório semanal no padrão SmartOps:

# RELATÓRIO SEMANAL DE ADS — ${snapshot.date}

## RESUMO EXECUTIVO
[Estado geral: melhorou/piorou/estável vs semana anterior]

## RESULTADO GERAL
[KPIs consolidados + variação]

## GOOGLE ADS
[Análise detalhada: o que funcionou, o que falhou, oportunidades]

## META ADS
[Análise detalhada: criativos, públicos, frequência, fadiga]

## PRINCIPAIS VITÓRIAS
[O que performou bem esta semana]

## PRINCIPAIS PROBLEMAS
[O que precisa de atenção]

## PLANO DA PRÓXIMA SEMANA
Fazer Agora: [urgente]
Testar: [novos experimentos]
Pausar: [o que desligar]
Escalar: [o que aumentar budget]
Investigar: [o que precisa de mais dados]

## TESTES A/B RECOMENDADOS
[Top 2 testes para a semana]

## CONCLUSÃO
[Primeira ação nas próximas 24h]`,
    }],
  });

  return response.content[0].text;
}

async function generateCEOBriefWithClaude(snapshot) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `CEO Brief de Ads para Breno Luiz — SmartOps IA.

Data: ${snapshot.date}
Investimento total: R$ ${snapshot.consolidated.total_cost}
Conversões: ${snapshot.consolidated.total_conversions}
ROAS: ${snapshot.consolidated.blended_roas}
Score Google: ${snapshot.google.health.score}/100
Score Meta: ${snapshot.meta.health.score}/100

Em 5 pontos:
1. STATUS: [performance geral em 1 linha]
2. OPORTUNIDADE PRINCIPAL: [maior ganho de curto prazo]
3. PROBLEMA PRINCIPAL: [o que está custando mais dinheiro agora]
4. DECISÃO NECESSÁRIA: [o que Breno precisa aprovar hoje]
5. PRÓXIMA AÇÃO: [ação específica em 24h]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { buildAdsSnapshot, generateWeeklyReportWithClaude, generateCEOBriefWithClaude };
