// GoalTrackingAgent.js — Strategic Planning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function trackGoals({ leadsActual, leadsTarget, meetingsActual, meetingsTarget, revenueActual, revenueTarget, clientsActual = 0, clientsTarget = 3, daysElapsed = 30, totalDays = 90 }) {
  const timePct = Math.round((daysElapsed / totalDays) * 100);

  function pct(actual, target) { return target > 0 ? Math.round((actual / target) * 100) : 0; }
  function ratio(actual, target) { return target > 0 ? parseFloat((actual / target).toFixed(2)) : 0; }
  function status(progressPct, timePct) {
    const r = timePct > 0 ? progressPct / timePct : 1;
    if (r >= 0.9) return { s: 'ON_TRACK',    e: '🟢' };
    if (r >= 0.5) return { s: 'AT_RISK',     e: '🟡' };
    return              { s: 'OFF_TRACK',   e: '🔴' };
  }

  const goals = {
    leads:    { actual: leadsActual,    target: leadsTarget,    pct: pct(leadsActual, leadsTarget),    ...status(pct(leadsActual, leadsTarget), timePct) },
    meetings: { actual: meetingsActual, target: meetingsTarget, pct: pct(meetingsActual, meetingsTarget), ...status(pct(meetingsActual, meetingsTarget), timePct) },
    revenue:  { actual: revenueActual,  target: revenueTarget,  pct: pct(revenueActual, revenueTarget),  ...status(pct(revenueActual, revenueTarget), timePct) },
    clients:  { actual: clientsActual,  target: clientsTarget,  pct: pct(clientsActual, clientsTarget),  ...status(pct(clientsActual, clientsTarget), timePct) },
  };

  const conversionRate    = leadsActual > 0 ? Math.round((meetingsActual / leadsActual) * 100) : 0;
  const closingRate       = meetingsActual > 0 ? Math.round((clientsActual / meetingsActual) * 100) : 0;
  const revenuePerClient  = clientsActual > 0 ? Math.round(revenueActual / clientsActual) : 0;

  const atRisk    = Object.values(goals).filter(g => g.s === 'AT_RISK').length;
  const offTrack  = Object.values(goals).filter(g => g.s === 'OFF_TRACK').length;
  const overallHealth = offTrack > 1 ? 'CRÍTICO' : atRisk > 1 ? 'ATENÇÃO' : 'SAUDÁVEL';

  return { goals, timePct, daysElapsed, totalDays, conversionRate, closingRate, revenuePerClient, overallHealth, atRisk, offTrack };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function trackAndAnalyzeGoals({ leadsActual, leadsTarget, meetingsActual, meetingsTarget, revenueActual, revenueTarget, clientsActual = 0, clientsTarget = 3, daysElapsed = 30, totalDays = 90, context = '' }) {
  const tracking = trackGoals({ leadsActual, leadsTarget, meetingsActual, meetingsTarget, revenueActual, revenueTarget, clientsActual, clientsTarget, daysElapsed, totalDays });

  const goalText = Object.entries(tracking.goals).map(([k, v]) =>
    `  ${v.e} ${k}: ${v.actual}/${v.target} (${v.pct}%) — ${v.s}`
  ).join('\n');

  const prompt = `Você é o Goal Tracking Agent da SmartOps IA.
Sua missão é analisar o progresso de metas e gerar ações corretivas claras.

PERÍODO: ${daysElapsed} dias de ${totalDays}
SAÚDE GERAL: ${tracking.overallHealth}
TEMPO DECORRIDO: ${tracking.timePct}%

METAS vs REAL:
${goalText}

CONVERSÃO LEAD → REUNIÃO: ${tracking.conversionRate}%
TAXA DE FECHAMENTO: ${tracking.closingRate}%
RECEITA POR CLIENTE: R$ ${tracking.revenuePerClient}
CONTEXTO: ${context || 'nenhum'}

Analise e gere:

GOAL_TRACKING_PERIOD: [período]
OVERALL_HEALTH: ${tracking.overallHealth}

POR META:
LEADS: ${tracking.goals.leads.e} [status e análise]
MEETINGS: ${tracking.goals.meetings.e} [status e análise]
CLIENTS: ${tracking.goals.clients.e} [status e análise]
REVENUE: ${tracking.goals.revenue.e} [status e análise]

CONVERSION_ANALYSIS: [análise do funil — onde está a maior perda]
ROOT_CAUSE_OF_GAPS: [causa raiz dos gaps identificados]
CORRECTIVE_ACTIONS: [ações corretivas específicas — 1 por gap]
WHAT_TO_DOUBLE_DOWN: [onde colocar mais energia]
WHAT_TO_CUT: [o que parar para não dispersar]
FORECAST: [previsão de fechamento do período com dados atuais]
ALERT_FOR_CEO: [mensagem curta e direta para o Breno — máximo 3 frases]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { tracking, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { trackAndAnalyzeGoals, trackGoals };
