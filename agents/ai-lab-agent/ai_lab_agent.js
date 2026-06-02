#!/usr/bin/env node
/**
 * AI Lab Intelligence Agent — SmartOps IA
 * Diretor de Inovação e Pesquisa Aplicada em IA
 *
 * Usage:
 *   node ai_lab_agent.js --mode scan
 *   node ai_lab_agent.js --mode evaluate --tool "ElevenLabs" --category voice
 *   node ai_lab_agent.js --mode poc --tech "ElevenLabs TTS" --problem "Narração manual de vídeos" --agent remotion-agent
 *   node ai_lab_agent.js --mode llm-benchmark --task copy-instagram
 *   node ai_lab_agent.js --mode roi --hours 10 --revenue 5000
 *   node ai_lab_agent.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { evaluateTechnology, weeklyTechScan, generateRadarReport } = require('./src/agents/TechRadarAgent');
const { evaluateTool }           = require('./src/agents/ToolEvaluationAgent');
const { compareModelsForTask, recommendModelsForAgents } = require('./src/agents/LLMResearchAgent');
const { createPoCPlan }          = require('./src/agents/PoCAgent');
const { calculateROI, costBenefitSummary } = require('./src/agents/ROIAnalysisAgent');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function hasFlag(name) { return process.argv.includes(`--${name}`); }

function saveOutput(filename, content) {
  const dir = path.join(process.cwd(), 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

async function main() {
  const mode = getArg('mode', 'scan');
  const ts   = Date.now();

  console.log('\n=== AI LAB INTELLIGENCE AGENT ===');
  console.log(`Modo: ${mode}`);

  // ── SCAN — weekly tech scan ────────────────────────────────────────────────
  if (mode === 'scan') {
    const focus = (getArg('focus', 'llm,automation,agent-framework')).split(',');
    console.log(`\n  → Weekly tech scan: ${focus.join(', ')}...`);
    const scan = await weeklyTechScan(focus);
    saveOutput(`tech-scan-${ts}.json`, scan);

    console.log('\n  Top Discoveries:');
    (scan.discoveries || []).forEach((d, i) => {
      console.log(`  ${i+1}. [${d.initial_score}] ${d.name} — ${d.urgency.toUpperCase()}`);
      console.log(`     ${d.why_relevant}`);
    });
    console.log(`\n  Insight: ${scan.weekly_insight}`);
    console.log(`  Top Recomendação: ${scan.top_recommendation}`);
    if (scan.risk_alert) console.log(`  ⚠️ Risco: ${scan.risk_alert}`);
  }

  // ── EVALUATE — evaluate a specific tool ────────────────────────────────────
  else if (mode === 'evaluate') {
    const toolName = getArg('tool', 'Tool desconhecida');
    const category = getArg('category', 'automation');
    const website  = getArg('website', '');
    const cost     = getArg('cost', 'desconhecido');

    console.log(`\n  → Avaliando: ${toolName}...`);
    const evaluation = await evaluateTool({ name: toolName, category, website, cost });
    saveOutput(`tool-eval-${toolName.replace(/\s/g, '-')}-${ts}.json`, evaluation);

    console.log(`\n  Score total: ${evaluation.total_score}/100`);
    console.log(`  Recomendação: ${evaluation.recommendation.toUpperCase()}`);
    console.log(`  Uso SmartOps: ${evaluation.use_case_smartops}`);
    console.log(`  Próximo passo: ${evaluation.next_action}`);
  }

  // ── TECH — evaluate a technology for tech radar ────────────────────────────
  else if (mode === 'tech') {
    const techName = getArg('name', 'Tecnologia X');
    const category = getArg('category', 'automation');
    const context  = getArg('context', '');

    console.log(`\n  → Avaliando no Tech Radar: ${techName}...`);
    const item = await evaluateTechnology(techName, category, context);
    saveOutput(`radar-item-${techName.replace(/\s/g, '-')}-${ts}.json`, item);

    console.log(`\n  Status: ${item.status.toUpperCase()} (score ${item.score})`);
    console.log(`  Uso SmartOps: ${item.use_case_smartops}`);
    console.log(`  Uso Clientes: ${item.use_case_clients}`);
    console.log(`  Próximo passo: ${item.next_action}`);
  }

  // ── POC — create a PoC plan ────────────────────────────────────────────────
  else if (mode === 'poc') {
    const tech    = getArg('tech',    'Tecnologia X');
    const problem = getArg('problem', 'Processo manual que consome tempo');
    const agent   = getArg('agent',   'ai-lab-agent');
    const benefit = getArg('benefit', 'Reduzir tempo manual em 70%');

    console.log(`\n  → Criando plano de PoC para: ${tech}...`);
    const poc = await createPoCPlan({ technology: tech, problem, targetAgent: agent, expectedBenefit: benefit });
    saveOutput(`poc-plan-${ts}.json`, poc);

    console.log(`\n  PoC: ${poc.name}`);
    console.log(`  Hipótese: ${poc.hypothesis}`);
    console.log(`  Timebox: ${poc.timebox} dias | Custo: $${poc.cost_estimate}`);
    console.log(`  Métrica: ${poc.success_metric}`);
    console.log(`  Passos:`);
    (poc.implementation_steps || []).forEach((s, i) => console.log(`    ${i+1}. ${s}`));
  }

  // ── LLM-BENCHMARK — compare models on a task ──────────────────────────────
  else if (mode === 'llm-benchmark') {
    const task = getArg('task', 'copy-instagram');
    console.log(`\n  → Benchmarking modelos para: ${task}...`);
    const results = await compareModelsForTask(task);
    saveOutput(`llm-benchmark-${task}-${ts}.json`, results);
    console.log(`\n  Mais rápido: ${results.fastest?.model} (${results.fastest?.latency_ms}ms)`);
  }

  // ── LLM-RECOMMEND — recommend models per agent ────────────────────────────
  else if (mode === 'llm-recommend') {
    console.log(`\n  → Gerando recomendações de LLM por agente...`);
    const recs = await recommendModelsForAgents();
    saveOutput(`llm-recommendations-${ts}.json`, recs);
    console.log(`\n  Recomendações geradas para ${recs.recommendations?.length || 0} agentes.`);
  }

  // ── ROI — calculate ROI of an innovation ──────────────────────────────────
  else if (mode === 'roi') {
    const hours   = parseFloat(getArg('hours',   '5'));
    const revenue = parseFloat(getArg('revenue', '0'));
    const costM   = parseFloat(getArg('cost',    '0'));
    const costI   = parseFloat(getArg('invest',  '0'));

    const analysis = calculateROI({
      costInitial: costI, costMonthly: costM,
      hoursPerWeek: hours, revenueMonthly: revenue,
    });
    saveOutput(`roi-analysis-${ts}.json`, analysis);
    console.log(`\n  ${costBenefitSummary(analysis)}`);
  }

  // ── REPORT — generate full radar report ───────────────────────────────────
  else if (mode === 'report') {
    const registry = require('./src/memory/toolRegistry.json');
    const allItems = [
      ...registry.approved.map(t => ({ ...t, status: 'adopt' })),
      ...registry.trial.map(t => ({ ...t, status: 'trial' })),
      ...registry.assess.map(t => ({ ...t, status: 'assess' })),
    ];
    const report = generateRadarReport(allItems);
    saveOutput(`radar-report-${ts}.json`, report);
    console.log(`\n  Radar: ${report.summary.adopt} adopt | ${report.summary.trial} trial | ${report.summary.assess} assess`);
    if (report.top_recommendation) {
      console.log(`  Top: ${report.top_recommendation.name} (score ${report.top_recommendation.score})`);
    }
  }

  else {
    console.log('Modos disponíveis: scan | evaluate | tech | poc | llm-benchmark | llm-recommend | roi | report');
  }
}

main().catch(err => {
  console.error('\n✗ AI Lab Agent error:', err.message);
  process.exit(1);
});
