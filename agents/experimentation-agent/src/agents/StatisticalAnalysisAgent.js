// StatisticalAnalysisAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcStatSignificance, calcSampleSize, calcUplift, detectExperimentBiases, calcTestDuration } = require('../scoring/iceScore');

const client = new Anthropic();

function analyzeExperimentLocally(experimentData = {}) {
  const {
    n_control = 0, conversions_control = 0,
    n_variant = 0, conversions_variant = 0,
    duration_days = 0, start_date = null,
    baseline_rate = null, min_detectable_effect = 0.15, daily_visitors = null,
  } = experimentData;

  const significance = (n_control && n_variant)
    ? calcStatSignificance({ n_control, conversions_control, n_variant, conversions_variant })
    : null;

  const uplift = (n_control && n_variant)
    ? calcUplift(conversions_control / n_control, conversions_variant / n_variant)
    : null;

  const biases = detectExperimentBiases({ duration_days, n_control, n_variant, start_date });

  const sample = calcSampleSize({
    baseline_rate:         baseline_rate || (n_control ? conversions_control / n_control : 0.02),
    min_detectable_effect,
  });

  const duration = calcTestDuration({ daily_visitors, n_per_variant: sample.n_per_variant });

  const sufficient_data = n_control >= CONFIG.stats.amostra_minima && n_variant >= CONFIG.stats.amostra_minima;

  return {
    significance,
    uplift,
    biases,
    sample_requirements: sample,
    duration_estimate:   duration,
    sufficient_data,
    ready_for_decision:  sufficient_data && !biases.biases.some(b => b.risk === 'alto') && significance?.significant,
    analysis_date:       new Date().toISOString(),
  };
}

async function analyzeExperimentWithClaude(experimentData, hypothesisDescription) {
  const local = analyzeExperimentLocally(experimentData);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Statistical Analysis Agent da SmartOps IA.

Missão: Analisar experimentos A/B com rigor estatístico. Nunca declarar vencedor sem dados suficientes.

DADOS DO EXPERIMENTO:
Hipótese testada: "${hypothesisDescription}"

Controle: N=${experimentData.n_control} | Conversões=${experimentData.conversions_control}
Variante: N=${experimentData.n_variant} | Conversões=${experimentData.conversions_variant}
Duração: ${experimentData.duration_days} dias

ANÁLISE LOCAL:
Significância estatística: ${local.significance?.confidence}% | Significativo: ${local.significance?.significant ? 'SIM' : 'NÃO'}
Uplift: ${local.uplift?.uplift_pct}% (${local.uplift?.direction})
Vencedor aparente: ${local.significance?.winner}
Dados suficientes: ${local.sufficient_data ? 'SIM' : 'NÃO'} (mín ${CONFIG.stats.amostra_minima} por variante)

Vieses detectados: ${local.biases.biases_found > 0 ? local.biases.biases.map(b => `${b.type} (${b.risk})`).join(', ') : 'nenhum'}

---

Analise e responda:

# STATISTICAL ANALYSIS REPORT

## RESULTADO DO EXPERIMENTO
[Status claro: VENCEDOR DECLARADO / INCONCLUSIVO / DADOS INSUFICIENTES / VIÉS DETECTADO]

## INTERPRETAÇÃO DOS DADOS
[O que os números realmente significam]

## VALIDADE ESTATÍSTICA
Significância: [X%]
Poder: [adequado ou não]
Vieses: [presentes ou ausentes]
Conclusão: [pode ou não pode declarar vencedor]

## DECISÃO RECOMENDADA
[Implementar variante / Continuar testando / Pausar e corrigir / Inconclusivo]

## PRÓXIMOS PASSOS
[O que fazer baseado nos dados]

## O QUE TESTAR A SEGUIR
[Próxima hipótese relacionada a explorar]`,
    }],
  });

  return { analysis: response.content[0].text, data: local };
}

module.exports = { analyzeExperimentWithClaude, analyzeExperimentLocally };
