// calculations.js — Statistical pure functions for experimentation
const { CONFIG } = require('../config');

/**
 * Detecta se um KPI caiu abaixo do threshold de alerta.
 */
function detectKPIAlert(kpiName, currentValue, baselineValue) {
  const triggers = CONFIG.alert_triggers;
  const delta_pct = baselineValue > 0
    ? ((currentValue - baselineValue) / baselineValue) * 100
    : 0;

  const thresholds = {
    conversao:   -triggers.conversao_queda_pct,
    ctr:         -triggers.ctr_queda_pct,
    cpa:          triggers.cpa_alta_pct,
    bounce:       triggers.bounce_alta_pct,
  };

  const key = Object.keys(thresholds).find(k => kpiName.toLowerCase().includes(k));
  const threshold = key ? thresholds[key] : -20;
  const alert = threshold < 0 ? delta_pct <= threshold : delta_pct >= threshold;

  return {
    kpi:         kpiName,
    baseline:    baselineValue,
    current:     currentValue,
    delta_pct:   Math.round(delta_pct * 10) / 10,
    alert,
    severity:    Math.abs(delta_pct) >= Math.abs(threshold) * 1.5 ? 'CRITICO' : alert ? 'ATENCAO' : 'OK',
    hypothesis_needed: alert,
  };
}

/**
 * Calcula uplift de um experimento.
 */
function calcUplift(controlValue, variantValue) {
  if (!controlValue) return { uplift_pct: 0, delta_absolute: 0, direction: 'neutro' };
  const delta = variantValue - controlValue;
  const uplift_pct = (delta / controlValue) * 100;
  return {
    uplift_pct:     Math.round(uplift_pct * 100) / 100,
    delta_absolute: Math.round(delta * 1000) / 1000,
    direction:      uplift_pct > 0 ? 'positivo' : uplift_pct < 0 ? 'negativo' : 'neutro',
    meaningful:     Math.abs(uplift_pct) >= 5,
  };
}

/**
 * Calcula duração estimada do experimento.
 */
function calcTestDuration({ daily_visitors, n_per_variant, n_variants = 2 }) {
  if (!daily_visitors) return { days: null, note: 'Tráfego diário não informado' };
  const visitors_per_variant = daily_visitors / n_variants;
  const days = Math.ceil(n_per_variant / visitors_per_variant);
  return {
    days,
    weeks: Math.ceil(days / 7),
    daily_visitors_needed: Math.ceil(n_per_variant / 14),
    note: days > 90 ? 'Tráfego insuficiente — considere MDE maior' : days < 7 ? 'Mínimo 7 dias para evitar viés de dia da semana' : 'Duração adequada',
  };
}

/**
 * Detecta vieses comuns em experimentos.
 */
function detectExperimentBiases({ duration_days, n_control, n_variant, start_date }) {
  const biases = [];
  const ratio = n_variant / n_control;

  if (duration_days < 7)   biases.push({ type: 'novelty_effect', risk: 'alto',  desc: 'Menos de 7 dias: possível efeito novidade' });
  if (duration_days > 90)  biases.push({ type: 'seasonal_bias',  risk: 'medio', desc: 'Mais de 90 dias: possível viés sazonal' });
  if (ratio < 0.8 || ratio > 1.2) biases.push({ type: 'sample_ratio_mismatch', risk: 'alto', desc: `SRM: ratio variante/controle = ${ratio.toFixed(2)} (esperado ~1.0)` });

  const startDay = start_date ? new Date(start_date).getDay() : null;
  if (startDay === 0 || startDay === 6) biases.push({ type: 'weekend_start', risk: 'medio', desc: 'Experimento iniciado no fim de semana' });

  return {
    biases_found:   biases.length,
    biases,
    clean:          biases.length === 0,
    recommendation: biases.length === 0 ? 'Experimento sem vieses detectados'
      : biases.some(b => b.risk === 'alto') ? 'Parar experimento e corrigir viés alto antes de analisar'
      : 'Analisar com cautela — viés médio detectado',
  };
}

/**
 * Gera recomendação de próximo teste baseado em KPIs baseline.
 */
function recommendNextTest(kpis = {}) {
  const baseline = CONFIG.baseline_kpis;
  const opportunities = [];

  if ((kpis.conversao_site_pct || baseline.conversao_site_pct) < 2.5) {
    opportunities.push({ area: 'site', test: 'Headline + CTA acima da dobra', expected_lift: '15-25%', priority: 10 });
  }
  if ((kpis.ctr_google_ads_pct || baseline.ctr_google_ads_pct) < 5) {
    opportunities.push({ area: 'google_ads', test: 'Testar 3 títulos diferentes', expected_lift: '20-40%', priority: 9 });
  }
  if ((kpis.taxa_resposta_wa_pct || baseline.taxa_resposta_wa_pct) < 50) {
    opportunities.push({ area: 'whatsapp', test: 'Primeira mensagem com pergunta vs statement', expected_lift: '10-20%', priority: 8 });
  }
  if ((kpis.taxa_fechamento_pct || baseline.taxa_fechamento_pct) < 30) {
    opportunities.push({ area: 'propostas', test: 'Adicionar ROI calculado e garantia', expected_lift: '15-30%', priority: 8 });
  }
  if ((kpis.bounce_rate_pct || baseline.bounce_rate_pct) > 65) {
    opportunities.push({ area: 'site', test: 'Prova social acima da dobra', expected_lift: '-10 a -20% bounce', priority: 7 });
  }

  return opportunities.sort((a, b) => b.priority - a.priority);
}

module.exports = {
  detectKPIAlert, calcUplift, calcTestDuration,
  detectExperimentBiases, recommendNextTest,
};
