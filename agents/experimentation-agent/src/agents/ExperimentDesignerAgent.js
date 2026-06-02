// ExperimentDesignerAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcSampleSize, calcTestDuration, calcICEScore } = require('../scoring/iceScore');

const client = new Anthropic();

function designExperimentLocally(hypothesis) {
  const { baseline_rate = 0.02, min_effect = 0.15, daily_visitors = 0 } = hypothesis;
  const sample   = calcSampleSize({ baseline_rate, min_detectable_effect: min_effect });
  const duration = calcTestDuration({ daily_visitors, n_per_variant: sample.n_per_variant });
  const ice      = calcICEScore({ impact: hypothesis.impact || 5, confidence: hypothesis.confidence || 5, ease: hypothesis.ease || 5 });

  return {
    test_id:        `test_${Date.now()}`,
    hypothesis:     hypothesis.hypothesis,
    area:           hypothesis.area,
    ice_score:      ice,
    control:        hypothesis.control || 'Versão atual',
    variant:        hypothesis.variant || 'Versão alternativa',
    primary_metric: hypothesis.primary_metric || 'Taxa de conversão',
    secondary_metrics: hypothesis.secondary_metrics || ['CTR', 'Bounce rate'],
    sample_required: sample,
    duration:       duration,
    created_at:     new Date().toISOString(),
    status:         'designing',
  };
}

async function designExperimentWithClaude(hypothesisText, area = 'site') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Experiment Designer Agent da SmartOps IA.

Missão: Transformar uma hipótese em um plano de experimento A/B rigoroso, testável e com critérios claros.

Hipótese: "${hypothesisText}"
Área: ${area}
Baseline conversão site: ${CONFIG.baseline_kpis.conversao_site_pct}%
Baseline CTR Google: ${CONFIG.baseline_kpis.ctr_google_ads_pct}%
Significância mínima: ${CONFIG.stats.significancia_minima * 100}%

Responda:

# EXPERIMENT DESIGN

## IDENTIFICAÇÃO
TEST_ID: [código único]
HIPÓTESE: [afirmação clara e testável]
ÁREA: [onde o teste acontece]
OBJETIVO: [o que queremos provar]

## DESIGN
CONTROLE (A): [descrição da versão atual]
VARIANTE (B): [descrição da versão nova — o que muda]
VARIÁVEL ISOLADA: [a única coisa que muda de A para B]

## MÉTRICAS
PRIMÁRIA: [métrica que decide o vencedor]
SECUNDÁRIAS: [métricas de suporte para entender o impacto]
GUARDRAILS: [métricas que NÃO devem piorar]

## AMOSTRAGEM
Amostra mínima por variante: [N]
MDE (Mínimo Efeito Detectável): [%]
Poder estatístico: ${CONFIG.stats.poder_minimo * 100}%
Confiança: ${CONFIG.stats.significancia_minima * 100}%

## DURAÇÃO
Dias estimados: [N]
Cuidados: [evitar início em feriados, Black Friday, etc]

## CRITÉRIO DE SUCESSO
Vencedor: [condições precisas para declarar variante vencedora]
Empate: [o que fazer se não houver diferença significativa]
Falha: [o que fazer se variante piorar]

## RISCOS DO EXPERIMENTO
[Riscos técnicos, vieses possíveis, limitações]

## CHECKLIST PRÉ-LANÇAMENTO
[ ] Rastreamento configurado
[ ] Divisão de tráfego verificada
[ ] Garantia de não contaminação entre variantes
[ ] Data de início e fim definida
[ ] Responsável pelo monitoramento definido`,
    }],
  });

  return response.content[0].text;
}

module.exports = { designExperimentWithClaude, designExperimentLocally };
