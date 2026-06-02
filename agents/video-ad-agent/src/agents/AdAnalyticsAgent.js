import { CONFIG } from '../config.js';

// Performance status based on metrics
export function getPerformanceStatus(metrics) {
  const { ctr, cpa, retention, roas } = metrics;
  const issues   = [];
  const wins     = [];
  let   score    = 50;

  if (ctr >= CONFIG.targets.ctr)      { wins.push(`CTR ${ctr}% ≥ meta ${CONFIG.targets.ctr}%`);   score += 15; }
  else if (ctr < CONFIG.alerts.ctrLow){ issues.push(`CTR baixo: ${ctr}% < ${CONFIG.alerts.ctrLow}%`); score -= 20; }
  else                                  score += 5;

  if (cpa && cpa <= CONFIG.targets.cpa)      { wins.push(`CPA R$${cpa} ≤ meta R$${CONFIG.targets.cpa}`);    score += 20; }
  else if (cpa && cpa > CONFIG.alerts.cpaHigh){ issues.push(`CPA alto: R$${cpa} > limite R$${CONFIG.alerts.cpaHigh}`); score -= 25; }

  if (retention >= CONFIG.targets.retention) { wins.push(`Retenção ${retention}% ≥ meta ${CONFIG.targets.retention}%`); score += 10; }
  else if (retention < CONFIG.alerts.retentionLow){ issues.push(`Retenção baixa: ${retention}%`); score -= 15; }

  if (roas && roas >= CONFIG.targets.roas)   { wins.push(`ROAS ${roas} ≥ meta ${CONFIG.targets.roas}`);   score += 20; }

  const status = score >= 80 ? 'winner'
               : score >= 60 ? 'strong'
               : score >= 40 ? 'average'
               : score >= 20 ? 'weak'
               : 'loser';

  return { score, status, issues, wins };
}

// Recommend action based on performance
export function recommendAction(metrics) {
  const { ctr, cpa, retention, roas, frequency } = metrics;
  const actions = [];

  if (ctr < CONFIG.alerts.ctrLow) {
    actions.push({ priority: 'P1', action: 'Criar 5 novos hooks e trocar thumbnail' });
    actions.push({ priority: 'P1', action: 'Trocar primeiros 3 segundos do vídeo' });
  }

  if (cpa && cpa > CONFIG.alerts.cpaHigh) {
    actions.push({ priority: 'P1', action: 'Revisar oferta e CTA — testar nova landing page' });
    actions.push({ priority: 'P2', action: 'Criar versão WhatsApp click-to-chat' });
  }

  if (retention < CONFIG.alerts.retentionLow) {
    actions.push({ priority: 'P2', action: 'Reduzir duração do vídeo — tentar versão 30s' });
    actions.push({ priority: 'P2', action: 'Melhorar pacing com mais cortes nos primeiros 10s' });
  }

  if (frequency && frequency > CONFIG.alerts.frequencyHigh) {
    actions.push({ priority: 'P2', action: `Fadiga de criativo — criar nova variação visual (frequência ${frequency})` });
  }

  if (roas && roas >= CONFIG.targets.roas && cpa && cpa <= CONFIG.targets.cpa) {
    actions.push({ priority: 'P0', action: 'CRIATIVO VENCEDOR — criar 10 variações e escalar orçamento' });
  }

  return actions.sort((a, b) => a.priority.localeCompare(b.priority));
}

// Analyze hook performance from metrics
export function analyzeHook(metrics) {
  const { thumb_stop_rate, hook_rate, avg_watch_time, total_duration } = metrics;
  const analysis = { status: 'unknown', score: 0, recommendation: '' };

  if (thumb_stop_rate && thumb_stop_rate >= 30) {
    analysis.status = 'strong';
    analysis.score  = 80;
    analysis.recommendation = 'Hook forte — manter e criar variações com mesmo padrão';
  } else if (thumb_stop_rate && thumb_stop_rate < 15) {
    analysis.status = 'weak';
    analysis.score  = 20;
    analysis.recommendation = 'Hook fraco — substituir os primeiros 3s mantendo o resto';
  } else {
    analysis.status = 'average';
    analysis.score  = 50;
    analysis.recommendation = 'Hook mediano — testar 2 variações de hook mais agressivas';
  }

  if (avg_watch_time && total_duration) {
    const retention = (avg_watch_time / total_duration) * 100;
    if (retention < 25) analysis.recommendation += '. Retenção critica — revisar pacing';
  }

  return analysis;
}

// Generate analytics report
export function generateReport(creative) {
  const { ad_id, title, platform, metrics } = creative;
  if (!metrics) return { error: 'No metrics available' };

  const perf    = getPerformanceStatus(metrics);
  const actions = recommendAction(metrics);
  const hook    = analyzeHook(metrics);

  return {
    creative_id:        ad_id,
    title,
    platform,
    performance_status: perf.status,
    performance_score:  perf.score,
    wins:               perf.wins,
    issues:             perf.issues,
    hook_analysis:      hook,
    should_scale:       perf.score >= 80,
    should_pause:       perf.score < 20,
    recommended_actions: actions,
    next_variations:    actions.filter(a => a.priority === 'P0').length > 0
                          ? 'Criar 10 variações do criativo vencedor'
                          : null,
    generated_at:       new Date().toISOString(),
  };
}
