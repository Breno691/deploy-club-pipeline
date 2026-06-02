// seoCalculators.js — Pure SEO calculation functions
const { CONFIG } = require('../config');

function calcCTROrganic(clicks, impressions) {
  return impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;
}

function calcOrgConvRate(conversions, sessions) {
  return sessions > 0 ? Math.round((conversions / sessions) * 10000) / 100 : 0;
}

function classifyPosition(position) {
  const t = CONFIG.position_thresholds;
  if (position <= t.TOP_3.max)    return { ...t.TOP_3,    position };
  if (position <= t.TOP_10.max)   return { ...t.TOP_10,   position };
  if (position <= t.TOP_20.max)   return { ...t.TOP_20,   position };
  if (position <= t.TOP_50.max)   return { ...t.TOP_50,   position };
  return { ...t.ABOVE_50, position };
}

function calcSEOScore(data = {}) {
  const w = CONFIG.score_weights;
  const { tech_issues = 0, content_quality = 5, keywords_optimized = 0,
    total_keywords = 1, ctr_pct = 0, clicks = 0, internal_links = 0,
    backlinks = 0, conversions_org = 0 } = data;

  const s_tech     = Math.max(0, w.tecnico - (tech_issues * 4));
  const s_content  = Math.round((content_quality / 10) * w.conteudo);
  const s_keywords = Math.round((keywords_optimized / Math.max(total_keywords, 1)) * w.keywords);
  const s_sc       = ctr_pct >= 3.5 ? w.search_console : ctr_pct >= 2 ? w.search_console * 0.7 : w.search_console * 0.3;
  const s_links    = Math.min(w.linkagem, Math.round(internal_links / 5 * w.linkagem));
  const s_auth     = Math.min(w.autoridade, Math.round(backlinks / 20 * w.autoridade));
  const s_conv     = conversions_org > 0 ? w.conversao : 0;

  const total = Math.round(s_tech + s_content + s_keywords + s_sc + s_links + s_auth + s_conv);
  const label_entry = Object.values(CONFIG.health_labels).find(l => total >= l.min) || CONFIG.health_labels.EMERGENCIA;

  return { score: Math.min(100, total), label: label_entry.label, color: label_entry.color,
    breakdown: { tecnico: s_tech, conteudo: s_content, keywords: s_keywords, search_console: Math.round(s_sc), linkagem: s_links, autoridade: s_auth, conversao: s_conv } };
}

function identifyQuickWins(queries = []) {
  const opportunities = queries
    .filter(q => q.position >= 4 && q.position <= 20 && q.impressions >= 100)
    .map(q => ({
      query:       q.query,
      position:    q.position,
      impressions: q.impressions,
      clicks:      q.clicks,
      ctr:         calcCTROrganic(q.clicks, q.impressions),
      opportunity: classifyPosition(q.position),
      estimated_gain: q.position <= 10
        ? `+${Math.round(q.impressions * 0.05)} cliques/sem com CTR melhorado`
        : `+${Math.round(q.impressions * 0.02)} cliques/sem chegando à 1ª página`,
    }))
    .sort((a, b) => b.impressions - a.impressions);

  return { quick_wins: opportunities, total: opportunities.length };
}

function detectSEOAlerts(current = {}, previous = {}) {
  const alerts = { critico: [], atencao: [], oportunidade: [] };
  const pct = (c, p) => p > 0 ? ((c - p) / p) * 100 : 0;

  if (current.clicks < previous.clicks * 0.7) alerts.critico.push(`Cliques orgânicos caíram ${Math.abs(pct(current.clicks, previous.clicks)).toFixed(0)}%`);
  if (current.impressions < previous.impressions * 0.7) alerts.critico.push(`Impressões orgânicas caíram ${Math.abs(pct(current.impressions, previous.impressions)).toFixed(0)}%`);
  if (current.position > (previous.position || 0) + 5) alerts.atencao.push(`Posição média piorou ${(current.position - previous.position).toFixed(1)} posições`);
  if (current.ctr < 2) alerts.atencao.push(`CTR orgânico de ${current.ctr}% abaixo do ideal`);
  if (current.clicks > (previous.clicks || 0) * 1.2) alerts.oportunidade.push(`Cliques cresceram ${pct(current.clicks, previous.clicks).toFixed(0)}% — manter otimização`);

  return alerts;
}

module.exports = { calcCTROrganic, calcOrgConvRate, classifyPosition, calcSEOScore, identifyQuickWins, detectSEOAlerts };
