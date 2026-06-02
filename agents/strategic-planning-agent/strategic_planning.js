#!/usr/bin/env node
/**
 * Strategic Planning Intelligence Agent — SmartOps IA
 * Diretor de Estratégia, Planejamento e OKRs
 *
 * Ciclo: Visão → OKRs → Roadmap → Prioridades → Execução → Revisão → Correção
 *
 * Usage:
 *   node strategic_planning.js --mode plan --horizon 30
 *   node strategic_planning.js --mode plan --horizon 90
 *   node strategic_planning.js --mode plan --horizon 180
 *   node strategic_planning.js --mode okr --objective "Gerar tração comercial local" --horizon 90
 *   node strategic_planning.js --mode priority --initiative "Google Ads local" --impact 9 --confidence 7 --ease 6
 *   node strategic_planning.js --mode priority --backlog
 *   node strategic_planning.js --mode review --period "Semana 1" --leads 5 --meetings 2 --revenue 0 --week 1
 *   node strategic_planning.js --mode goals --leads-actual 8 --leads-target 40 --meetings-actual 3 --meetings-target 15 --revenue-actual 0 --revenue-target 15000 --days-elapsed 30 --total-days 90
 *   node strategic_planning.js --mode risk --context "inicio da empresa, sem clientes ainda"
 *   node strategic_planning.js --mode drift --initiatives 8 --weeks-no-client 4
 *   node strategic_planning.js --mode brief
 *   node strategic_planning.js --mode roadmap --horizon 90
 *   node strategic_planning.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { createOKR, reviewOKRs }                   = require('./src/agents/OKRAgent');
const { generateRoadmap }                          = require('./src/agents/RoadmapAgent');
const { prioritizeInitiative, rankFullBacklog }    = require('./src/agents/PriorityAgent');
const { weeklyReview, detectStrategicDrift }       = require('./src/agents/StrategicReviewAgent');
const { trackAndAnalyzeGoals }                     = require('./src/agents/GoalTrackingAgent');
const { identifyAndMitigateRisks }                 = require('./src/agents/RiskStrategyAgent');
const { generateStrategicPlan, generateCEOBrief, generateReport, updateMemory } = require('./src/agents/StrategyReportAgent');
const { CONFIG }                                   = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function getNumArg(name, fallback = 0) {
  const v = getArg(name);
  return v !== null ? parseFloat(v) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function saveOutput(filename, content) {
  const dir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

function printSection(title, text) {
  console.log(`\n${'─'.repeat(62)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(62));
  console.log(text);
}

async function main() {
  const mode = getArg('mode', 'report');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   STRATEGIC PLANNING INTELLIGENCE AGENT — SmartOps IA     ║');
  console.log('║   Diretor de Estratégia, Planejamento e OKRs               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`  Modo: ${mode} | ${new Date().toLocaleString('pt-BR')}\n`);

  // ── PLAN ─────────────────────────────────────────────────────────────────
  if (mode === 'plan') {
    const horizon       = getNumArg('horizon') || 90;
    const currentStatus = getArg('status', '');
    const context       = getArg('context', '');

    console.log(`  Gerando plano estratégico de ${horizon} dias...`);
    const res = await generateStrategicPlan({ horizon, currentStatus, context });

    printSection(`PLANO ESTRATÉGICO ${horizon} DIAS`, res.analysis);
    saveOutput(`strategic_plan_${horizon}d_${Date.now()}.json`, res);

  // ── OKR ──────────────────────────────────────────────────────────────────
  } else if (mode === 'okr') {
    const objective = getArg('objective', 'Gerar tração comercial local');
    const horizon   = getNumArg('horizon') || 90;
    const context   = getArg('context', '');

    if (hasFlag('review')) {
      console.log('  Revisando OKRs atuais...');
      const daysElapsed = getNumArg('days-elapsed') || 15;
      const totalDays   = getNumArg('total-days') || 90;
      const res = await reviewOKRs({ okrs: CONFIG.initial_okrs, daysElapsed, totalDays, context });
      printSection('REVISÃO DE OKRs', res.analysis);
      saveOutput(`okr_review_${Date.now()}.json`, res);
    } else {
      console.log(`  Criando OKR: "${objective}" (${horizon}d)...`);
      const res = await createOKR({ objective, horizon, context });
      printSection('OKR CRIADO', JSON.stringify(res.record, null, 2));
      printSection('ANÁLISE DO OKR', res.analysis);
      updateMemory({ okrs_created: (require('./src/agents/StrategyReportAgent').loadMemory().okrs_created || 0) + 1 });
      saveOutput(`okr_${Date.now()}.json`, res);
    }

  // ── ROADMAP ───────────────────────────────────────────────────────────────
  } else if (mode === 'roadmap') {
    const horizon       = getNumArg('horizon') || 90;
    const currentStatus = getArg('status', '');
    const context       = getArg('context', '');

    console.log(`  Gerando roadmap de ${horizon} dias...`);
    const res = await generateRoadmap({ horizon, currentStatus, context });

    printSection(`ROADMAP ${horizon} DIAS — MILESTONES`, res.milestones.map(m => JSON.stringify(m)).join('\n'));
    printSection('ROADMAP COMPLETO', res.analysis);
    saveOutput(`roadmap_${horizon}d_${Date.now()}.json`, res);

  // ── PRIORITY ──────────────────────────────────────────────────────────────
  } else if (mode === 'priority') {
    if (hasFlag('backlog')) {
      console.log('  Rankeando backlog completo por ICE...');
      const context = getArg('context', '');
      const res = await rankFullBacklog({ context });

      printSection('BACKLOG RANKEADO POR ICE', res.scored.map((i, idx) =>
        `${idx+1}. ${i.classification.color} ${i.name} — ICE: ${i.ice_score} (${i.classification.level})`
      ).join('\n'));
      printSection('ANÁLISE ESTRATÉGICA', res.analysis);
      saveOutput(`priority_backlog_${Date.now()}.json`, res);
    } else {
      const initiative = getArg('initiative', 'Iniciativa não informada');
      const impact     = getNumArg('impact') || 5;
      const confidence = getNumArg('confidence') || 5;
      const ease       = getNumArg('ease') || 5;
      const context    = getArg('context', '');

      console.log(`  Priorizando: "${initiative}" (I:${impact} C:${confidence} E:${ease})...`);
      const res = await prioritizeInitiative({ initiative, impact, confidence, ease, context });

      printSection('SCORING DE PRIORIDADE', `ICE Score: ${res.ice_score} — ${res.classification.color} ${res.classification.level}`);
      printSection('ANÁLISE', res.analysis);
      saveOutput(`priority_${Date.now()}.json`, res);
    }

  // ── REVIEW ────────────────────────────────────────────────────────────────
  } else if (mode === 'review') {
    const period     = getArg('period', 'Semana atual');
    const leads      = getNumArg('leads');
    const meetings   = getNumArg('meetings');
    const proposals  = getNumArg('proposals');
    const clients    = getNumArg('clients');
    const revenue    = getNumArg('revenue');
    const weekNumber = getNumArg('week') || 1;
    const highlights = getArg('highlights', '');
    const bottlenecks= getArg('bottlenecks', '');
    const context    = getArg('context', '');

    console.log(`  Revisão estratégica semanal — ${period}...`);
    const res = await weeklyReview({ period, leads, meetings, proposals, clients, revenue, weekNumber, highlights, bottlenecks, context });

    printSection('SNAPSHOT DA SEMANA', JSON.stringify(res.snap, null, 2));
    if (res.drift.hasDrift) {
      printSection(`⚠️ DESVIO ESTRATÉGICO DETECTADO — ${res.drift.level}`, res.drift.signals.join('\n'));
    }
    printSection('REVISÃO ESTRATÉGICA', res.analysis);
    updateMemory({
      leads_total:    (require('./src/agents/StrategyReportAgent').loadMemory().leads_total || 0) + leads,
      meetings_total: (require('./src/agents/StrategyReportAgent').loadMemory().meetings_total || 0) + meetings,
      revenue_total:  (require('./src/agents/StrategyReportAgent').loadMemory().revenue_total || 0) + revenue,
      clients_total:  (require('./src/agents/StrategyReportAgent').loadMemory().clients_total || 0) + clients,
      weeks_running:  weekNumber,
      last_review:    new Date().toISOString(),
    });
    saveOutput(`weekly_review_${Date.now()}.json`, res);

  // ── GOALS ─────────────────────────────────────────────────────────────────
  } else if (mode === 'goals') {
    const leadsActual    = getNumArg('leads-actual');
    const leadsTarget    = getNumArg('leads-target')    || CONFIG.targets[90].leads;
    const meetingsActual = getNumArg('meetings-actual');
    const meetingsTarget = getNumArg('meetings-target') || CONFIG.targets[90].meetings;
    const revenueActual  = getNumArg('revenue-actual');
    const revenueTarget  = getNumArg('revenue-target')  || CONFIG.targets[90].revenue;
    const clientsActual  = getNumArg('clients-actual');
    const clientsTarget  = getNumArg('clients-target')  || CONFIG.targets[90].clients;
    const daysElapsed    = getNumArg('days-elapsed')    || 30;
    const totalDays      = getNumArg('total-days')      || 90;
    const context        = getArg('context', '');

    console.log('  Analisando progresso de metas...');
    const res = await trackAndAnalyzeGoals({ leadsActual, leadsTarget, meetingsActual, meetingsTarget, revenueActual, revenueTarget, clientsActual, clientsTarget, daysElapsed, totalDays, context });

    printSection('PROGRESSO DE METAS', Object.entries(res.tracking.goals).map(([k, v]) =>
      `${v.e} ${k.toUpperCase()}: ${v.actual}/${v.target} (${v.pct}%) — ${v.s}`
    ).join('\n'));
    printSection('ANÁLISE E AÇÕES CORRETIVAS', res.analysis);
    saveOutput(`goal_tracking_${Date.now()}.json`, res);

  // ── RISK ──────────────────────────────────────────────────────────────────
  } else if (mode === 'risk') {
    const context = getArg('context', '');
    console.log('  Analisando riscos estratégicos...');
    const res = await identifyAndMitigateRisks({ context });

    printSection('REGISTRO DE RISCOS', res.register.map(r =>
      `${r.color} [${r.level}] ${r.risk} — Score: ${r.score}`
    ).join('\n'));
    printSection('ANÁLISE E MITIGAÇÃO', res.analysis);
    saveOutput(`risk_analysis_${Date.now()}.json`, res);

  // ── DRIFT ─────────────────────────────────────────────────────────────────
  } else if (mode === 'drift') {
    const activeInitiatives  = getNumArg('initiatives') || 5;
    const weeksWithoutClient = getNumArg('weeks-no-client') || 0;
    const contentWithoutLeads= getNumArg('weeks-no-leads') || 0;
    const agentsBuilt        = getNumArg('agents') || 47;
    const clientsClosed      = getNumArg('clients') || 0;

    const drift = detectStrategicDrift({ activeInitiatives, weeksWithoutClient, contentWithoutLeads, agentsBuilt, clientsClosed });

    console.log(`\n  DESVIO ESTRATÉGICO — ${drift.level} (Score: ${drift.driftScore})`);
    if (drift.signals.length) {
      console.log('\n  Sinais detectados:');
      drift.signals.forEach(s => console.log(`  ⚠️  ${s}`));
    } else {
      console.log('  ✅ Nenhum sinal de desvio detectado.');
    }
    saveOutput(`drift_check_${Date.now()}.json`, drift);

  // ── BRIEF ─────────────────────────────────────────────────────────────────
  } else if (mode === 'brief') {
    const context = getArg('context', '');
    console.log('  Gerando CEO Planning Brief...');
    const res = await generateCEOBrief({ context });

    printSection('CEO PLANNING BRIEF', res.analysis);
    saveOutput(`ceo_brief_${Date.now()}.json`, res);

  // ── REPORT ────────────────────────────────────────────────────────────────
  } else if (mode === 'report') {
    const context = getArg('context', '');
    console.log('  Gerando relatório estratégico completo...');
    const res = await generateReport({ context });

    printSection('RELATÓRIO ESTRATÉGICO', res.analysis);
    saveOutput(`strategy_report_${Date.now()}.json`, res);

  } else {
    console.log(`\n  ❌ Modo desconhecido: "${mode}"`);
    console.log('  Modos: plan | okr | roadmap | priority | review | goals | risk | drift | brief | report\n');
    process.exit(1);
  }

  console.log('\n  ✅ Strategic Planning Intelligence Agent — concluído.\n');
}

main().catch(err => {
  console.error('\n❌ ERRO:', err.message);
  process.exit(1);
});
