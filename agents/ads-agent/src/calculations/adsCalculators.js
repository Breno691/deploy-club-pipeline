// adsCalculators.js — Pure ads calculation functions
const { CONFIG } = require('../config');

function calcCTR(clicks, impressions) {
  return impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;
}

function calcCPC(cost, clicks) {
  return clicks > 0 ? Math.round((cost / clicks) * 100) / 100 : 0;
}

function calcCPM(cost, impressions) {
  return impressions > 0 ? Math.round((cost / impressions) * 1000 * 100) / 100 : 0;
}

function calcCPA(cost, conversions) {
  return conversions > 0 ? Math.round((cost / conversions) * 100) / 100 : 0;
}

function calcROAS(revenue, cost) {
  return cost > 0 ? Math.round((revenue / cost) * 100) / 100 : 0;
}

function calcConvRate(conversions, clicks) {
  return clicks > 0 ? Math.round((conversions / clicks) * 10000) / 100 : 0;
}

function calcCAC(totalSpend, clientsAcquired) {
  return clientsAcquired > 0 ? Math.round(totalSpend / clientsAcquired) : 0;
}

function calcLTV(ticketMedio, avgPurchases, retentionMonths) {
  return Math.round(ticketMedio * avgPurchases * retentionMonths);
}

function calcLTVCAC(ltv, cac) {
  return cac > 0 ? Math.round((ltv / cac) * 10) / 10 : 0;
}

/**
 * Calcula score de saúde de campanha 0-100
 */
function calcCampaignHealthScore(metrics = {}, platform = 'google_search') {
  const bench = CONFIG.benchmarks[platform] || CONFIG.benchmarks.google_search;
  const w = CONFIG.health_weights;
  let score = 100;
  const issues = [];

  // CTR
  if (metrics.ctr !== undefined) {
    const ctr_score = metrics.ctr >= (bench.ctr_bom || 5) ? w.ctr
      : metrics.ctr >= (bench.ctr_atencao || 3) ? w.ctr * 0.6
      : w.ctr * 0.2;
    if (ctr_score < w.ctr) {
      issues.push({ metric: 'CTR', value: `${metrics.ctr}%`, severity: metrics.ctr < bench.ctr_atencao ? 'critico' : 'atencao' });
    }
    score = score - (w.ctr - ctr_score);
  }

  // CPA
  if (metrics.cpa && bench.cpa_max_brl) {
    if (metrics.cpa > bench.cpa_max_brl * 1.5) { score -= w.cpa; issues.push({ metric: 'CPA', value: `R$ ${metrics.cpa}`, severity: 'critico' }); }
    else if (metrics.cpa > bench.cpa_max_brl)   { score -= w.cpa * 0.5; issues.push({ metric: 'CPA', value: `R$ ${metrics.cpa}`, severity: 'atencao' }); }
  }

  // ROAS
  if (metrics.roas && bench.roas_min) {
    if (metrics.roas < bench.roas_min * 0.7) { score -= w.roas; issues.push({ metric: 'ROAS', value: metrics.roas, severity: 'critico' }); }
    else if (metrics.roas < bench.roas_min)  { score -= w.roas * 0.5; issues.push({ metric: 'ROAS', value: metrics.roas, severity: 'atencao' }); }
  }

  // Frequência Meta
  if (metrics.frequency && bench.freq_max) {
    if (metrics.frequency > bench.freq_max) { score -= w.frequencia; issues.push({ metric: 'Frequência', value: metrics.frequency, severity: 'critico' }); }
    else if (metrics.frequency > bench.freq_atencao) { score -= w.frequencia * 0.5; }
  }

  // Zero conversões
  if (metrics.conversions === 0 && metrics.cost > 0) {
    score -= w.conversoes;
    issues.push({ metric: 'Conversões', value: '0', severity: 'critico' });
  }

  score = Math.max(0, Math.min(100, score));
  const label_entry = Object.values(CONFIG.health_labels).find(l => score >= l.min) || CONFIG.health_labels.EMERGENCIA;

  return { score, label: label_entry.label, color: label_entry.color, issues };
}

/**
 * Detecta alertas automáticos baseados em variação vs período anterior
 */
function detectAdsAlerts(current = {}, previous = {}) {
  const alerts = { critico: [], atencao: [], oportunidade: [] };
  const { critico: ca, atencao: aa } = CONFIG.alerts;

  const pctChange = (cur, prev) => prev > 0 ? ((cur - prev) / prev) * 100 : 0;

  if (current.cpa && previous.cpa) {
    const delta = pctChange(current.cpa, previous.cpa);
    if (delta > ca.cpa_alta_pct) alerts.critico.push(`CPA subiu ${delta.toFixed(0)}% (R$ ${previous.cpa} → R$ ${current.cpa})`);
    else if (delta > aa.cpc_alta_pct) alerts.atencao.push(`CPA subiu ${delta.toFixed(0)}%`);
  }
  if (current.roas && previous.roas) {
    const delta = pctChange(current.roas, previous.roas);
    if (delta < -ca.roas_queda_pct) alerts.critico.push(`ROAS caiu ${Math.abs(delta).toFixed(0)}% (${previous.roas} → ${current.roas})`);
  }
  if (current.conversions !== undefined && previous.conversions) {
    const delta = pctChange(current.conversions, previous.conversions);
    if (delta < -ca.conversoes_queda_pct) alerts.critico.push(`Conversões caíram ${Math.abs(delta).toFixed(0)}%`);
  }
  if (current.ctr && previous.ctr) {
    const delta = pctChange(current.ctr, previous.ctr);
    if (delta < -aa.ctr_queda_pct) alerts.atencao.push(`CTR caiu ${Math.abs(delta).toFixed(0)}% (${previous.ctr}% → ${current.ctr}%)`);
  }
  if (current.roas > (CONFIG.benchmarks.google_search.roas_bom) && current.conversions > 5) {
    alerts.oportunidade.push(`ROAS ${current.roas} com ${current.conversions} conversões — oportunidade de escalar`);
  }

  return { ...alerts, total_criticos: alerts.critico.length, has_alerts: alerts.critico.length > 0 || alerts.atencao.length > 0 };
}

module.exports = { calcCTR, calcCPC, calcCPM, calcCPA, calcROAS, calcConvRate, calcCAC, calcLTV, calcLTVCAC, calcCampaignHealthScore, detectAdsAlerts };
