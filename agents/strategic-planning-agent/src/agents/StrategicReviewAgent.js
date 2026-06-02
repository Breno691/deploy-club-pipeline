// StrategicReviewAgent.js — Strategic Planning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function detectStrategicDrift({ activeInitiatives, weeksWithoutClient, contentWithoutLeads, agentsBuilt, clientsClosed }) {
  const signals = [];
  let driftScore = 0;

  if (activeInitiatives > CONFIG.alerts.drift_initiatives_max) {
    signals.push(`${activeInitiatives} iniciativas ativas — limite recomendado: ${CONFIG.alerts.drift_initiatives_max}`);
    driftScore += 30;
  }
  if (weeksWithoutClient >= CONFIG.alerts.weeks_without_client) {
    signals.push(`${weeksWithoutClient} semanas sem fechar cliente — revisar estratégia de aquisição`);
    driftScore += 40;
  }
  if (contentWithoutLeads >= 8) {
    signals.push(`${contentWithoutLeads} semanas de conteúdo sem gerar leads — rever canal ou CTA`);
    driftScore += 20;
  }
  if (agentsBuilt > 10 && clientsClosed === 0) {
    signals.push(`${agentsBuilt} agentes construídos, ${clientsClosed} clientes fechados — desbalanceado`);
    driftScore += 35;
  }

  let level = '';
  if (driftScore >= 60) level = 'CRITICAL — Mudar estratégia agora';
  else if (driftScore >= 30) level = 'WARNING — Revisar foco';
  else level = 'OK — Estratégia alinhada';

  return { driftScore, level, signals, hasDrift: driftScore >= 30 };
}

function buildWeeklySnapshot({ leads, meetings, proposals, clients, revenue, weekNumber }) {
  const targets = CONFIG.targets[30]; // meta de 30 dias pro-rated
  const weekFraction = weekNumber / 4;

  return {
    week:          weekNumber,
    leads:         { actual: leads,    target_week: Math.round(targets.leads * weekFraction),    progress_pct: Math.round((leads    / (targets.leads * weekFraction))    * 100) || 0 },
    meetings:      { actual: meetings, target_week: Math.round(targets.meetings * weekFraction), progress_pct: Math.round((meetings / (targets.meetings * weekFraction)) * 100) || 0 },
    proposals:     { actual: proposals,target_week: Math.round(targets.proposals * weekFraction),progress_pct: Math.round((proposals/ (targets.proposals * weekFraction))* 100) || 0 },
    clients:       { actual: clients,  target_week: 0,                                           progress_pct: clients > 0 ? 100 : 0 },
    revenue:       { actual: revenue,  target_week: Math.round(targets.revenue * weekFraction),  progress_pct: Math.round((revenue  / (targets.revenue * weekFraction))  * 100) || 0 },
  };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function weeklyReview({ period, leads = 0, meetings = 0, proposals = 0, clients = 0, revenue = 0, weekNumber = 1, highlights = '', bottlenecks = '', context = '' }) {
  const snap  = buildWeeklySnapshot({ leads, meetings, proposals, clients, revenue, weekNumber });
  const drift = detectStrategicDrift({
    activeInitiatives:  5,
    weeksWithoutClient: clients === 0 ? weekNumber : 0,
    contentWithoutLeads: leads === 0 ? weekNumber : 0,
    agentsBuilt:        47,
    clientsClosed:      clients,
  });

  const snapText = Object.entries(snap).filter(([k]) => k !== 'week').map(([k, v]) =>
    `  ${k}: ${v.actual} (meta semana: ${v.target_week}) — ${v.progress_pct}%`
  ).join('\n');

  const prompt = `Você é o Strategic Review Agent da SmartOps IA.
Cargo: Diretor de Estratégia, Planejamento e OKRs.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Revise a semana estrategicamente e dê prioridades claras para a próxima semana.

PERÍODO: ${period || `Semana ${weekNumber}`}
DESVIO ESTRATÉGICO: ${drift.level} (score: ${drift.driftScore})
Sinais: ${drift.signals.join(' | ') || 'nenhum'}

MÉTRICAS DA SEMANA:
${snapText}

DESTAQUES: ${highlights || 'nenhum informado'}
GARGALOS: ${bottlenecks || 'nenhum informado'}
CONTEXTO: ${context || 'fase inicial da empresa'}

Gere a revisão estratégica semanal:

PERIOD: [período]
OVERALL_ASSESSMENT: [avaliação geral — 2 frases]

OKR_PROGRESS:
- Aquisição: [progresso e status]
- Autoridade: [progresso e status]
- Site: [progresso e status]
- Financeiro: [progresso e status]

WHAT_WORKED: [o que avançou essa semana]
WHAT_STALLED: [o que travou]
BOTTLENECKS: [gargalos críticos]
${drift.hasDrift ? `\n⚠️ STRATEGIC_DRIFT_ALERT:\nWHAT_IS_HAPPENING: [descrição do desvio]\nWHY_IT_IS_RISKY: [por que prejudica]\nWHAT_TO_STOP: [o que parar agora]\nWHAT_TO_FOCUS_ON: [onde colocar energia]\nDECISION_REQUIRED: [decisão que o Breno precisa tomar]\n` : ''}
RISKS: [2-3 riscos ativos]
DECISIONS_NEEDED: [decisões que o CEO precisa tomar]
TOP_3_PRIORITIES_NEXT_WEEK:
1. [prioridade mais urgente]
2. [segunda prioridade]
3. [terceira prioridade]
AGENTS_TO_TRIGGER: [quais agentes acionar essa semana]
CEO_MESSAGE: [mensagem direta para o Breno — 2-3 frases — clara e acionável]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { snap, drift, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { weeklyReview, detectStrategicDrift, buildWeeklySnapshot };
