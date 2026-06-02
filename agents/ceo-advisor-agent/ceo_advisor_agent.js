#!/usr/bin/env node
/**
 * CEO Advisor Agent — SmartOps IA
 * Decisor Central. Consolida todos os agentes. Gera o plano do dia.
 * "Foco no que move a agulha. Tudo o mais é ruído."
 *
 * Usage:
 *   node ceo_advisor_agent.js --mode brief
 *   node ceo_advisor_agent.js --mode brief --receita 0 --leads 2 --reunioes 1 --propostas 1
 *   node ceo_advisor_agent.js --mode daily-plan
 *   node ceo_advisor_agent.js --mode priority
 *   node ceo_advisor_agent.js --mode decision --question "Devo focar em Google Ads ou prospecção ativa agora?"
 *   node ceo_advisor_agent.js --mode weekly-review --wins "fechei 1 cliente" --losses "sem reunioes"
 *   node ceo_advisor_agent.js --mode alert
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { generateDailyBriefWithClaude, buildDailySnapshot }         = require('./src/agents/DailyBriefAgent');
const { generatePriorityPlanWithClaude, buildPriorityMatrix }       = require('./src/agents/PriorityAgent');
const { supportDecisionWithClaude, generateWeeklyReviewWithClaude } = require('./src/agents/DecisionAgent');
const { scanForAlerts, generateAlertReportWithClaude }              = require('./src/agents/AlertMonitorAgent');
const { calcPipelineHealth, calcBusinessHealth }                     = require('./src/calculations/ceoCalculators');
const { CONFIG } = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function parseNum(name, fallback = 0) { return parseFloat(getArg(name, String(fallback))); }

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `ceo_${date}`);
  ['logs', 'reports'].forEach(d => { if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true }); });
  return { dir, date };
}

function saveOutput(dir, filename, content) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}

async function main() {
  const mode = getArg('mode', 'brief');

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  CEO ADVISOR AGENT — SmartOps IA                ║');
  console.log('║  "Foco no que move a agulha."                   ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode}\n`);

  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY não configurada'); process.exit(1); }

  const { dir, date } = setupOutput();

  // Dados do dia passados via args (integrar com banco futuramente)
  const businessData = {
    receita_mes:          parseNum('receita', 0),
    clientes_ativos:      parseNum('clientes', 0),
    leads_semana:         parseNum('leads', 0),
    reunioes_semana:      parseNum('reunioes', 0),
    propostas_abertas:    parseNum('propostas', 0),
    posts_semana:         parseNum('posts', 0),
    sessoes_site_semana:  parseNum('sessoes', 0),
    automacoes_ativas:    parseNum('automacoes', 0),
    horas_liberadas:      parseNum('horas', 0),
    workflow_falhas:      parseNum('falhas', 0),
    pipeline: {
      valor_total:     parseNum('pipeline', 0),
      leads:           parseNum('leads', 0),
      reunioes:        parseNum('reunioes', 0),
      propostas:       parseNum('propostas', 0),
    },
  };

  try {
    switch (mode) {

      case 'brief': {
        console.log('📋 Gerando Daily CEO Brief...\n');
        const snapshot = buildDailySnapshot(businessData);

        console.log(`Saúde: ${snapshot.health.total}/100 — ${snapshot.health.label} (${snapshot.health.color})`);
        console.log(`Pipeline: ${snapshot.pipeline.status} | Alertas: ${snapshot.alerts.total} (${snapshot.alerts.color})`);
        if (snapshot.alerts.criticos.length > 0) {
          console.log('\n🔴 ALERTAS CRÍTICOS:');
          snapshot.alerts.criticos.forEach(a => console.log(`  → ${a.data} — ${a.action}`));
        }
        console.log();

        const brief = await generateDailyBriefWithClaude(snapshot);
        console.log(brief);
        saveOutput(path.join(dir, 'reports'), `daily_brief_${date}.md`, brief);
        saveOutput(path.join(dir, 'reports'), 'snapshot.json', snapshot);
        break;
      }

      case 'daily-plan': {
        console.log('📅 Gerando plano de ação do dia...\n');
        const snapshot = buildDailySnapshot(businessData);
        const health   = calcBusinessHealth(businessData);
        const context  = `SmartOps IA — ${CONFIG.company.stage}. Saúde: ${health.total}/100. Receita: R$ ${businessData.receita_mes} / meta R$ ${CONFIG.goals.receita_meta_mes}.`;

        const plan = await generatePriorityPlanWithClaude(context);
        console.log(plan);
        saveOutput(path.join(dir, 'reports'), `daily_plan_${date}.md`, plan);
        break;
      }

      case 'priority': {
        console.log('🎯 Priorizando backlog por ROI...\n');
        const matrix = buildPriorityMatrix();
        console.log(`Total de ações no backlog: ${matrix.total}`);
        console.log('\nQ1 — FAZER AGORA:');
        matrix.q1.forEach((a, i) => console.log(`  ${i + 1}. ${a.name} (score: ${a.priority_score.toFixed(1)})`));
        console.log('\nQ2 — AGENDAR:');
        matrix.q2.forEach((a, i) => console.log(`  ${i + 1}. ${a.name}`));
        console.log();

        const plan = await generatePriorityPlanWithClaude(`Stage: ${CONFIG.company.stage}. Receita atual: R$ ${businessData.receita_mes}.`);
        console.log('\n' + plan);
        saveOutput(path.join(dir, 'reports'), `priority_plan_${date}.md`, plan);
        saveOutput(path.join(dir, 'reports'), 'priority_matrix.json', matrix);
        break;
      }

      case 'decision': {
        const question = getArg('question', 'Qual canal de aquisição de clientes focar agora?');
        const opt1 = getArg('option1', '');
        const opt2 = getArg('option2', '');
        const options = [opt1, opt2].filter(Boolean);
        const constraints = getArg('constraints', '');

        console.log(`🤔 Suporte à decisão: "${question}"\n`);
        const analysis = await supportDecisionWithClaude(question, options, constraints);
        console.log(analysis);
        saveOutput(path.join(dir, 'reports'), `decision_${Date.now()}.md`, analysis);
        break;
      }

      case 'weekly-review': {
        console.log('📊 Gerando revisão semanal...\n');
        const weekData = {
          week:       date,
          receita:    parseNum('receita', 0),
          leads:      parseNum('leads', 0),
          reunioes:   parseNum('reunioes', 0),
          propostas:  parseNum('propostas', 0),
          vendas:     parseNum('vendas', 0),
          posts:      parseNum('posts', 0),
          automacoes: parseNum('automacoes', 0),
          horas:      parseNum('horas', 0),
          wins:       getArg('wins', ''),
          losses:     getArg('losses', ''),
          learning:   getArg('learning', ''),
        };
        const review = await generateWeeklyReviewWithClaude(weekData);
        console.log(review);
        saveOutput(path.join(dir, 'reports'), `weekly_review_${date}.md`, review);
        break;
      }

      case 'alert': {
        console.log('🚨 Verificando alertas...\n');
        const scan = scanForAlerts(businessData);
        console.log(`Status: ${scan.color} | Alertas: ${scan.total} | Saúde: ${scan.health_score}/100`);
        if (scan.needs_action) {
          scan.alerts.forEach(a => console.log(`  [${a.urgency}] ${a.data} → ${a.action}`));
        }
        const report = await generateAlertReportWithClaude(businessData, businessData);
        console.log('\n' + report);
        saveOutput(path.join(dir, 'reports'), `alert_report_${date}.md`, report);
        break;
      }

      default:
        console.log(`Modo desconhecido: ${mode}\nDisponíveis: brief | daily-plan | priority | decision | weekly-review | alert`);
    }

    console.log(`\n✅ Output: ${dir}`);
  } catch (err) { console.error(`❌ ${err.message}`); process.exit(1); }
}

main();
