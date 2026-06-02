// AdsTestingAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const ADS_BENCHMARKS = {
  google_search: { ctr_min: 3, ctr_good: 6, cpc_max_brl: 15, cpa_max_brl: 400, roas_min: 2 },
  meta_ads:      { ctr_min: 1, ctr_good: 2.5, cpm_max_brl: 30, cpa_max_brl: 300, roas_min: 2.5, freq_max: 3.5 },
};

function scoreAdsCampaign(metrics = {}) {
  const { platform = 'google_search', ctr, cpc, cpa, roas, frequency, conversions } = metrics;
  const bench = ADS_BENCHMARKS[platform] || ADS_BENCHMARKS.google_search;
  let score = 100;
  const issues = [];

  if (ctr && ctr < bench.ctr_min)   { score -= 20; issues.push(`CTR ${ctr}% < ${bench.ctr_min}% (benchmark)`); }
  if (cpa && cpa > bench.cpa_max_brl){ score -= 20; issues.push(`CPA R$ ${cpa} > R$ ${bench.cpa_max_brl} (limite)`); }
  if (roas && roas < bench.roas_min) { score -= 25; issues.push(`ROAS ${roas} < ${bench.roas_min} (meta)`); }
  if (frequency && frequency > bench.freq_max) { score -= 15; issues.push(`Frequência ${frequency} > ${bench.freq_max} (fadiga)`); }
  if (!conversions) { score -= 20; issues.push('Zero conversões registradas'); }

  const classification = score >= 90 ? 'Excelente' : score >= 75 ? 'Bom' : score >= 60 ? 'Atenção' : score >= 40 ? 'Crítico' : 'Emergência';
  return { score: Math.max(0, score), classification, issues, benchmarks: bench };
}

async function analyzeAdsWithClaude(adsData, platform = 'google_ads') {
  const scored = scoreAdsCampaign({ ...adsData, platform });

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Ads Testing Agent da SmartOps IA — especialista em Google Ads e Meta Ads.

Missão: Analisar campanhas, identificar problemas e criar testes A/B para melhorar CTR, CPA e ROAS.

Plataforma: ${platform}
Dados: ${JSON.stringify(adsData, null, 2)}
Score calculado: ${scored.score}/100 (${scored.classification})
Issues detectados: ${scored.issues.join(', ') || 'nenhum'}

Benchmarks ${platform}: ${JSON.stringify(scored.benchmarks)}

Responda:

# ADS PERFORMANCE ANALYSIS — ${platform.toUpperCase()}

## SCORE DA CONTA
Nota: ${scored.score}/100 — ${scored.classification}
[Motivo da nota em 2 linhas]

## DIAGNÓSTICO
[O que está bom, o que está ruim, e por quê]

## PROBLEMAS CRÍTICOS
[P1 — o que está custando dinheiro agora]

## TESTES A/B RECOMENDADOS
Para cada teste:
TÍTULO_ATUAL: [versão A]
TÍTULO_VARIANTE: [versão B]
HIPÓTESE: [por que B deve ganhar]
MÉTRICA: [CTR / CPA / ROAS]
DURAÇÃO: [dias]
CRITÉRIO DE SUCESSO: [o que precisaria acontecer para declarar vencedor]

## OPORTUNIDADES DE ESCALA
[Campanhas/públicos com potencial para aumentar budget]

## AÇÕES IMEDIATAS (esta semana)
P1: [urgente]
P2: [importante]
P3: [quando possível]`,
    }],
  });

  return { analysis: response.content[0].text, score: scored };
}

module.exports = { analyzeAdsWithClaude, scoreAdsCampaign, ADS_BENCHMARKS };
