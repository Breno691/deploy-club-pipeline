#!/usr/bin/env node
/**
 * validate_all_agents.js — SmartOps IA
 * Valida todos os 51 agentes: existência de arquivos, package.json, entry point, node_modules.
 * NÃO faz chamadas à API — apenas validação de estrutura.
 *
 * Usage:
 *   node scripts/validate_all_agents.js
 *   node scripts/validate_all_agents.js --fix          (instala node_modules faltando)
 *   node scripts/validate_all_agents.js --squad sales
 *   node scripts/validate_all_agents.js --json         (output JSON)
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT       = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'agents');

const FIX_MODE   = process.argv.includes('--fix');
const JSON_MODE  = process.argv.includes('--json');
const SQUAD_FILTER = (() => { const i = process.argv.indexOf('--squad'); return i !== -1 ? process.argv[i+1] : null; })();

const { AGENTS } = require('./daily_tasks_config');

// ─── VALIDAÇÃO ────────────────────────────────────────────────────────────────

function validate(agent) {
  const result = {
    key:    agent.key,
    folder: agent.folder,
    squad:  agent.squad,
    priority: agent.priority,
    checks: {},
    status: 'ok',
    issues: [],
  };

  const agentDir  = path.join(AGENTS_DIR, agent.folder);
  const entryPath = path.join(agentDir, agent.entry);
  const pkgPath   = path.join(agentDir, 'package.json');
  const nmPath    = path.join(agentDir, 'node_modules');
  const cfgPath   = path.join(agentDir, 'agent_config.json');
  const srcPath   = path.join(agentDir, 'src');
  const outPath   = path.join(agentDir, 'outputs');

  // 1. Pasta existe
  result.checks.folder_exists = fs.existsSync(agentDir);
  if (!result.checks.folder_exists) {
    result.issues.push('Pasta não encontrada');
    result.status = 'error';
    return result;
  }

  // 2. Entry point existe
  result.checks.entry_exists = fs.existsSync(entryPath);
  if (!result.checks.entry_exists) {
    result.issues.push(`Entry point não encontrado: ${agent.entry}`);
    result.status = 'error';
  }

  // 3. package.json existe
  result.checks.package_json = fs.existsSync(pkgPath);
  if (!result.checks.package_json) {
    result.issues.push('package.json ausente');
    result.status = 'error';
  }

  // 4. node_modules existe
  result.checks.node_modules = fs.existsSync(nmPath);
  if (!result.checks.node_modules) {
    result.issues.push('node_modules ausente (npm install necessário)');
    if (result.status !== 'error') result.status = 'warning';

    if (FIX_MODE && result.checks.package_json) {
      try {
        console.log(`  📦 Instalando: ${agent.folder}...`);
        execSync('npm install --silent', { cwd: agentDir, timeout: 60000 });
        result.checks.node_modules = true;
        result.issues = result.issues.filter(i => !i.includes('node_modules'));
        if (result.status === 'warning') result.status = 'ok';
      } catch (e) {
        result.issues.push(`npm install falhou: ${e.message.slice(0, 100)}`);
        result.status = 'error';
      }
    }
  }

  // 5. agent_config.json existe
  result.checks.agent_config = fs.existsSync(cfgPath);
  if (!result.checks.agent_config) {
    result.issues.push('agent_config.json ausente');
    if (result.status === 'ok') result.status = 'warning';
  }

  // 6. src/ pasta existe
  result.checks.src_folder = fs.existsSync(srcPath);
  if (!result.checks.src_folder) {
    result.issues.push('src/ ausente (arquitetura não padronizada)');
    if (result.status === 'ok') result.status = 'warning';
  }

  // 7. outputs/ pasta (cria se não existe)
  result.checks.outputs_folder = fs.existsSync(outPath);
  if (!result.checks.outputs_folder) {
    try {
      fs.mkdirSync(outPath, { recursive: true });
      result.checks.outputs_folder = true;
    } catch {}
  }

  // 8. Sintaxe do entry point (node --check)
  if (result.checks.entry_exists) {
    try {
      execSync(`node --check "${entryPath}"`, { timeout: 5000 });
      result.checks.syntax_ok = true;
    } catch (e) {
      result.checks.syntax_ok = false;
      result.issues.push(`Erro de sintaxe no entry point: ${e.message.slice(0, 150)}`);
      result.status = 'error';
    }
  }

  // 9. dotenv path check (aviso se estiver incorreto)
  if (result.checks.entry_exists) {
    const content = fs.readFileSync(entryPath, 'utf-8').slice(0, 2000);
    if (content.includes('../../../../.env')) {
      result.issues.push('dotenv com path 4 níveis (correto é 2: ../../.env)');
      if (result.status === 'ok') result.status = 'warning';
    }
  }

  return result;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const filtered = SQUAD_FILTER
  ? AGENTS.filter(a => a.squad === SQUAD_FILTER)
  : AGENTS;

if (!JSON_MODE) {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   VALIDATOR — SmartOps IA Agents                        ║');
  console.log('║   Validando estrutura e dependências de todos os agentes ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  if (FIX_MODE) console.log('  Modo FIX ativo: npm install será executado se necessário\n');
}

const results = filtered.map(validate);

// ─── RELATÓRIO ────────────────────────────────────────────────────────────────

if (JSON_MODE) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

const OK      = results.filter(r => r.status === 'ok');
const WARN    = results.filter(r => r.status === 'warning');
const ERRORS  = results.filter(r => r.status === 'error');

// Agrupa por squad
const bySquad = {};
for (const r of results) {
  if (!bySquad[r.squad]) bySquad[r.squad] = [];
  bySquad[r.squad].push(r);
}

for (const [squad, agents] of Object.entries(bySquad)) {
  console.log(`\n📦 SQUAD ${squad.toUpperCase()}`);
  for (const r of agents) {
    const icon  = r.status === 'ok' ? '✅' : r.status === 'warning' ? '⚠️ ' : '❌';
    const badge = r.priority === 'daily' ? '[DIÁRIO]' : '[SEMANAL]';
    console.log(`  ${icon} ${r.folder.padEnd(38)} ${badge}`);
    if (r.issues.length > 0) {
      r.issues.forEach(issue => console.log(`       └─ ${issue}`));
    }
  }
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  Total:    ${results.length} agentes`);
console.log(`  ✅ OK:     ${OK.length}`);
console.log(`  ⚠️  Aviso:  ${WARN.length}`);
console.log(`  ❌ Erro:   ${ERRORS.length}`);
console.log('══════════════════════════════════════════════════════════════');

if (ERRORS.length > 0) {
  console.log('\n❌ AGENTES COM ERRO (requerem ação):');
  ERRORS.forEach(r => {
    console.log(`  • ${r.folder}: ${r.issues.join(' | ')}`);
  });
}

if (WARN.length > 0 && !FIX_MODE) {
  console.log('\n💡 Para corrigir avisos automaticamente: node scripts/validate_all_agents.js --fix');
}

const allOk = ERRORS.length === 0;
console.log(`\n${allOk ? '✅ Sistema validado — todos os agentes prontos para uso!' : '⚠️  Corrija os erros acima antes de rodar o daily runner.'}\n`);

// Salva resultado
const outDir  = path.join(ROOT, 'outputs', 'system_logs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const logPath = path.join(outDir, `validation_${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(logPath, JSON.stringify({ date: new Date().toISOString(), total: results.length, ok: OK.length, warnings: WARN.length, errors: ERRORS.length, results }, null, 2));
console.log(`  📁 Log salvo: ${logPath}\n`);

process.exit(ERRORS.length > 0 ? 1 : 0);
