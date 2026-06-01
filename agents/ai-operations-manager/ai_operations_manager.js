#!/usr/bin/env node
/**
 * AI Operations Manager — SmartOps IA
 * Maestro Central. Orquestra todos os 38+ agentes do sistema.
 * "O maestro não toca todos os instrumentos. Ele garante que cada um toque na hora certa."
 *
 * Usage:
 *   node ai_operations_manager.js --mode route --request "quero lançar um novo serviço"
 *   node ai_operations_manager.js --mode diagnose --area "vendas" --data '{"leads":2,"reunioes":0}'
 *   node ai_operations_manager.js --mode plan --objective "aumentar receita em 30% em 90 dias"
 *   node ai_operations_manager.js --mode project --name "Lançamento Serviço Lean" --desc "criar e lançar serviço de consultoria lean"
 *   node ai_operations_manager.js --mode weekly --priorities '["fechar 2 clientes","lançar campanha","estruturar proposta"]'
 *   node ai_operations_manager.js --mode agents --squad "marketing"
 *   node ai_operations_manager.js --mode status
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const fs   = require('fs');
const path = require('path');

const { routeRequest, generateAgentBriefings }       = require('./src/agents/RouterAgent');
const { consolidateResponses, formatSingleAgentResponse } = require('./src/agents/ConsolidatorAgent');
const { create5W2H, createProjectPlan, createWeeklyExecutionPlan } = require('./src/agents/PlannerAgent');
const { runDiagnostic, quickDiagnostic }             = require('./src/agents/DiagnosticAgent');
const { CONFIG }                                      = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `manager_${date}`);
  ['logs', 'reports', 'plans'].forEach(d => {
    if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true });
  });
  return { dir, date };
}

function saveOutput(dir, filename, content) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Salvo: ${p}`);
  return p;
}

function printHeader() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   AI OPERATIONS MANAGER — SmartOps IA                   ║');
  console.log('║   "O maestro não toca todos os instrumentos."            ║');
  console.log('║   38+ Agentes | 10 Squads | Arquitetura Universal v2.0   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

function printAgentMap(squad = null) {
  const squads = squad ? { [squad]: CONFIG.squads[squad] } : CONFIG.squads;

  console.log('═══ MAPA DE AGENTES ═══\n');
  for (const [squadName, agentKeys] of Object.entries(squads)) {
    console.log(`\n📦 SQUAD ${squadName.toUpperCase()}`);
    for (const key of agentKeys) {
      const a = CONFIG.agents[key];
      if (a) console.log(`  • ${a.name.padEnd(35)} │ ${a.description.substring(0, 60)}`);
    }
  }
}

async function main() {
  const mode = getArg('mode', 'status');

  printHeader();
  console.log(`Modo: ${mode}\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY não configurada');
    process.exit(1);
  }

  const { dir, date } = setupOutput();
  const timestamp = new Date().toISOString();

  try {
    // ─── MODE: STATUS ──────────────────────────────────────────────────
    if (mode === 'status') {
      const total = Object.keys(CONFIG.agents).length;
      const squads = Object.keys(CONFIG.squads).length;
      console.log(`Sistema SmartOps IA — AI Operations Manager v${CONFIG.agent.version}`);
      console.log(`Agentes registrados: ${total}`);
      console.log(`Squads ativos: ${squads}`);
      console.log(`Arquitetura: Universal v2.0`);
      console.log(`\nSquads:`);
      for (const [name, agents] of Object.entries(CONFIG.squads)) {
        console.log(`  ${name.padEnd(20)} ${agents.length} agentes`);
      }
      console.log(`\nStatus: ✅ Operacional`);
      return;
    }

    // ─── MODE: AGENTS ──────────────────────────────────────────────────
    if (mode === 'agents') {
      const squad = getArg('squad');
      printAgentMap(squad);
      return;
    }

    // ─── MODE: ROUTE ───────────────────────────────────────────────────
    if (mode === 'route') {
      const request = getArg('request');
      if (!request) { console.error('❌ Uso: --request "descrição do pedido"'); process.exit(1); }

      console.log(`Pedido: "${request}"\n`);
      console.log('🔍 Analisando e roteando...\n');

      const routing = await routeRequest(request);
      console.log('Agentes selecionados:');
      routing.agents.forEach(k => {
        const a = CONFIG.agents[k];
        console.log(`  • ${a?.name || k} (${a?.squad || '?'})`);
      });
      console.log(`\nTipo: ${routing.request_type} | Complexidade: ${routing.complexity} | Prioridade: ${routing.priority}`);
      console.log(`\nJustificativa: ${routing.reasoning}`);

      const briefings = await generateAgentBriefings(request, routing);
      saveOutput(dir, 'reports/routing_result.json', {
        timestamp, request, routing, briefings,
      });

      console.log('\n✅ Roteamento concluído.');
      return;
    }

    // ─── MODE: DIAGNOSE ────────────────────────────────────────────────
    if (mode === 'diagnose') {
      const area  = getArg('area', 'negócio');
      const quick = getArg('quick') === 'true';
      const dataRaw = getArg('data', '{}');
      let data = {};
      try { data = JSON.parse(dataRaw); } catch { data = { raw: dataRaw }; }

      console.log(`Área: ${area}`);
      console.log(`Tipo: ${quick ? 'Diagnóstico Rápido' : 'Diagnóstico Completo'}\n`);

      let result;
      if (quick) {
        result = await quickDiagnostic(`${area}: ${JSON.stringify(data)}`);
      } else {
        result = await runDiagnostic(area, data);
      }

      console.log('\n' + result);
      saveOutput(dir, `reports/diagnostic_${area.replace(/\s+/g, '_')}.md`, result);
      console.log('\n✅ Diagnóstico concluído.');
      return;
    }

    // ─── MODE: PLAN (5W2H) ─────────────────────────────────────────────
    if (mode === 'plan') {
      const objective = getArg('objective');
      if (!objective) { console.error('❌ Uso: --objective "objetivo"'); process.exit(1); }

      console.log(`Objetivo: "${objective}"\n`);
      console.log('📋 Criando Plano 5W2H...\n');

      const plan = await create5W2H(objective);
      console.log(plan);
      saveOutput(dir, 'plans/5w2h_plan.md', plan);
      console.log('\n✅ Plano 5W2H criado.');
      return;
    }

    // ─── MODE: PROJECT ─────────────────────────────────────────────────
    if (mode === 'project') {
      const name = getArg('name', 'Novo Projeto');
      const desc = getArg('desc', '');

      console.log(`Projeto: "${name}"\n`);
      console.log('🗂️  Criando Plano de Projeto...\n');

      const plan = await createProjectPlan(name, desc);
      console.log(plan);
      saveOutput(dir, `plans/project_${name.replace(/\s+/g, '_')}.md`, plan);
      console.log('\n✅ Plano de projeto criado.');
      return;
    }

    // ─── MODE: WEEKLY ──────────────────────────────────────────────────
    if (mode === 'weekly') {
      const prioritiesRaw = getArg('priorities', '[]');
      let priorities = [];
      try { priorities = JSON.parse(prioritiesRaw); } catch { priorities = [prioritiesRaw]; }

      console.log(`Prioridades: ${priorities.join(', ')}\n`);
      console.log('📅 Criando Plano Semanal...\n');

      const plan = await createWeeklyExecutionPlan(priorities);
      console.log(plan);
      saveOutput(dir, 'plans/weekly_plan.md', plan);
      console.log('\n✅ Plano semanal criado.');
      return;
    }

    console.error(`❌ Modo desconhecido: ${mode}`);
    console.log('Modos disponíveis: status | agents | route | diagnose | plan | project | weekly');

  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    saveOutput(dir, 'logs/error.json', { timestamp, mode, error: err.message, stack: err.stack });
    process.exit(1);
  }
}

main();
