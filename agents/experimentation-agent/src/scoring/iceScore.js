// iceScore.js — Pure ICE/PIE/RICE scoring functions
const { CONFIG } = require('../config');

/**
 * ICE Score = Impact × Confidence × Ease (normalizado 0-100)
 */
function calcICEScore({ impact = 5, confidence = 5, ease = 5 } = {}) {
  const raw = (impact / 10) * (confidence / 10) * (ease / 10) * 1000;
  return Math.round(raw);
}

/**
 * PIE Score = Potential × Importance × Ease
 */
function calcPIEScore({ potential = 5, importance = 5, ease = 5 } = {}) {
  return Math.round(((potential + importance + ease) / 3) * 10);
}

/**
 * RICE Score = (Reach × Impact × Confidence) / Effort
 */
function calcRICEScore({ reach = 100, impact = 5, confidence = 0.8, effort = 1 } = {}) {
  if (!effort) return 0;
  return Math.round((reach * impact * confidence) / effort);
}

function classifyICE(score) {
  const t = CONFIG.ice.thresholds;
  if (score >= t.EXECUTAR_AGORA) return { label: 'Executar Agora', priority: 'critica', color: 'verde' };
  if (score >= t.ALTA)           return { label: 'Alta Prioridade', priority: 'alta', color: 'azul' };
  if (score >= t.MEDIA)          return { label: 'Média Prioridade', priority: 'media', color: 'amarelo' };
  return { label: 'Backlog', priority: 'baixa', color: 'cinza' };
}

function scoreHypothesis(hypothesis) {
  const ice   = calcICEScore(hypothesis);
  const pie   = calcPIEScore({
    potential:  hypothesis.impact || 5,
    importance: hypothesis.confidence || 5,
    ease:       hypothesis.ease || 5,
  });

  return {
    ...hypothesis,
    ice_score:       ice,
    pie_score:       pie,
    classification:  classifyICE(ice),
    scored_at:       new Date().toISOString(),
  };
}

function rankHypotheses(hypotheses) {
  return hypotheses
    .map(h => scoreHypothesis(h))
    .sort((a, b) => b.ice_score - a.ice_score);
}

/**
 * Calcula sample size necessário para significância estatística.
 */
function calcSampleSize({
  baseline_rate = 0.02,
  min_detectable_effect = 0.15,
  significance = 0.95,
  power = 0.80,
} = {}) {
  // Simplified formula (for quick estimation)
  const alpha = 1 - significance;
  const z_alpha = significance >= 0.95 ? 1.96 : 1.645;
  const z_beta  = power >= 0.80 ? 0.84 : 0.52;
  const p1 = baseline_rate;
  const p2 = baseline_rate * (1 + min_detectable_effect);
  const pooled = (p1 + p2) / 2;
  const numerator   = Math.pow(z_alpha * Math.sqrt(2 * pooled * (1 - pooled)) + z_beta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(p2 - p1, 2);
  const n_per_variant = Math.ceil(numerator / denominator);
  return {
    n_per_variant,
    n_total:       n_per_variant * 2,
    baseline_rate: `${(p1 * 100).toFixed(1)}%`,
    target_rate:   `${(p2 * 100).toFixed(1)}%`,
    min_lift:      `${(min_detectable_effect * 100).toFixed(0)}%`,
    note:          n_per_variant < 100 ? 'Aumentar MDE ou aceitar n menor' : 'Amostra adequada',
  };
}

/**
 * Calcula p-value aproximado (one-sided z-test for proportions).
 */
function calcStatSignificance({ n_control, conversions_control, n_variant, conversions_variant }) {
  const p_c = conversions_control / n_control;
  const p_v = conversions_variant / n_variant;
  const p_pool = (conversions_control + conversions_variant) / (n_control + n_variant);
  const se = Math.sqrt(p_pool * (1 - p_pool) * (1 / n_control + 1 / n_variant));
  if (!se) return { z_score: 0, significant: false, lift_pct: 0 };
  const z = (p_v - p_c) / se;
  // Approximate confidence from z-score
  const confidence = z >= 1.96 ? 0.95 : z >= 1.645 ? 0.90 : z >= 1.28 ? 0.80 : z < 0 ? 0 : 0.5 + z / 4;
  const lift_pct = p_c > 0 ? Math.round(((p_v - p_c) / p_c) * 1000) / 10 : 0;
  return {
    z_score:    Math.round(z * 100) / 100,
    confidence: Math.round(confidence * 100),
    significant: confidence >= CONFIG.stats.significancia_minima,
    lift_pct,
    control_rate:  `${(p_c * 100).toFixed(2)}%`,
    variant_rate:  `${(p_v * 100).toFixed(2)}%`,
    winner:        confidence >= CONFIG.stats.significancia_minima ? (p_v > p_c ? 'VARIANTE' : 'CONTROLE') : 'INCONCLUSIVO',
  };
}

module.exports = {
  calcICEScore, calcPIEScore, calcRICEScore, classifyICE,
  scoreHypothesis, rankHypotheses, calcSampleSize, calcStatSignificance,
};
