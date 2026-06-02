// automationScore.js — Pure automation scoring functions
const { CONFIG } = require('../config');

/**
 * Calcula o score de automação 0-100.
 * Todos os parâmetros são números de 0-10 (exceto indicado).
 */
function calcAutomationScore({
  frequencia      = 5,  // 0-10: diária=10, mensal=3
  tempo_economizado = 5, // 0-10: +40h/mês=10, 1h/mês=1
  erro_reduzido   = 5,  // 0-10: erro crítico/caro=10
  clareza_processo = 5, // 0-10: processo bem definido=10
  facilidade_tecnica = 5, // 0-10: API disponível=10, sem API=2
  impacto_financeiro = 5, // 0-10: >R$5k/mês=10
  reutilizacao    = 5,  // 0-10: multi-cliente=10
  baixo_risco     = 5,  // 0-10: sem risco=10
} = {}) {
  const w = CONFIG.score_weights;
  const raw =
    (frequencia        / 10) * w.frequencia          +
    (tempo_economizado / 10) * w.tempo_economizado   +
    (erro_reduzido     / 10) * w.erro_reduzido       +
    (clareza_processo  / 10) * w.clareza_processo    +
    (facilidade_tecnica/ 10) * w.facilidade_tecnica  +
    (impacto_financeiro/ 10) * w.impacto_financeiro  +
    (reutilizacao      / 10) * w.reutilizacao        +
    (baixo_risco       / 10) * w.baixo_risco;

  return Math.round(raw);
}

function classifyScore(score) {
  const t = CONFIG.score_thresholds;
  if (score >= t.AUTOMATIZAR_AGORA.min) return t.AUTOMATIZAR_AGORA;
  if (score >= t.POC.min)               return t.POC;
  if (score >= t.MELHORAR_ANTES.min)    return t.MELHORAR_ANTES;
  return t.NAO_AUTOMATIZAR;
}

function scoreAutomationOpportunity(opportunity) {
  const score = calcAutomationScore({
    frequencia:          mapFrequencyToScore(opportunity.frequency),
    tempo_economizado:   mapHoursToScore(opportunity.time_per_execution, opportunity.monthly_volume),
    erro_reduzido:       opportunity.error_rate_score     || 5,
    clareza_processo:    opportunity.process_clarity_score || 5,
    facilidade_tecnica:  opportunity.tech_ease_score       || 5,
    impacto_financeiro:  mapFinancialImpactToScore(opportunity.monthly_cost_brl),
    reutilizacao:        opportunity.reuse_score           || 5,
    baixo_risco:         opportunity.risk_score            || 5,
  });

  return {
    ...opportunity,
    automation_score: score,
    classification:   classifyScore(score),
    scored_at:        new Date().toISOString(),
  };
}

function rankOpportunities(opportunities) {
  return opportunities
    .map(o => scoreAutomationOpportunity(o))
    .sort((a, b) => b.automation_score - a.automation_score);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapFrequencyToScore(frequency) {
  const map = {
    'diaria': 10, 'daily': 10,
    '3x_semana': 9, 'semanal': 7, 'weekly': 7,
    '2x_semana': 8,
    'quinzenal': 5, 'mensal': 3, 'monthly': 3,
    'trimestral': 1,
  };
  return map[frequency?.toLowerCase()] || 5;
}

function mapHoursToScore(hoursPerExecution, monthlyVolume) {
  const monthly = (hoursPerExecution || 0) * (monthlyVolume || 1);
  if (monthly >= 40) return 10;
  if (monthly >= 20) return 8;
  if (monthly >= 10) return 6;
  if (monthly >= 5)  return 4;
  if (monthly >= 2)  return 2;
  return 1;
}

function mapFinancialImpactToScore(monthlyValueBRL) {
  const v = monthlyValueBRL || 0;
  if (v >= 5000) return 10;
  if (v >= 3000) return 8;
  if (v >= 1500) return 6;
  if (v >= 500)  return 4;
  if (v >= 200)  return 2;
  return 1;
}

// Detecta candidatos com alta probabilidade de automação a partir de texto
function detectAutomationSignals(text = '') {
  const signals = [
    { pattern: /toda (semana|segunda|ter[cç]a|quarta|quinta|sexta)/i, weight: 8, type: 'frequencia' },
    { pattern: /todo dia|diariamente|todo mês/i,                       weight: 9, type: 'frequencia' },
    { pattern: /copiar e colar|copy.paste/i,                           weight: 9, type: 'manual' },
    { pattern: /planilha|excel|google sheets/i,                        weight: 7, type: 'tool_manual' },
    { pattern: /mandar (no|pelo) whatsapp manualmente/i,               weight: 8, type: 'manual' },
    { pattern: /esqueço|esquece|atraso|atrasamos/i,                    weight: 7, type: 'error_prone' },
    { pattern: /demora|lento|demorado|consome tempo/i,                 weight: 6, type: 'time_waste' },
    { pattern: /repetitivo|sempre o mesmo|mesmo processo/i,           weight: 9, type: 'repetitive' },
    { pattern: /erro humano|erro de digitação|esqueci/i,              weight: 8, type: 'error_prone' },
    { pattern: /relatório semanal|relatório diário/i,                 weight: 8, type: 'report' },
  ];

  const found = signals.filter(s => s.pattern.test(text));
  const totalWeight = found.reduce((sum, s) => sum + s.weight, 0);
  const avgScore = found.length ? totalWeight / found.length : 0;

  return {
    signals_found:  found.map(s => s.type),
    signal_count:   found.length,
    automation_likelihood: Math.min(100, Math.round(avgScore * 10)),
    recommendation: avgScore >= 7 ? 'Forte candidato à automação' : avgScore >= 4 ? 'Avaliar processo primeiro' : 'Baixo potencial',
  };
}

module.exports = {
  calcAutomationScore,
  classifyScore,
  scoreAutomationOpportunity,
  rankOpportunities,
  mapFrequencyToScore,
  mapHoursToScore,
  mapFinancialImpactToScore,
  detectAutomationSignals,
};
