#!/usr/bin/env node
/**
 * install_all_agents.js — SmartOps IA
 * Instala node_modules em todos os agentes que precisam.
 * Roda npm install em paralelo (máx 4 ao mesmo tempo).
 *
 * Usage:
 *   node scripts/install_all_agents.js              → instala todos que estão faltando
 *   node scripts/install_all_agents.js --force      → reinstala todos (mesmo que já tenham)
 *   node scripts/install_all_agents.js --squad ops  → só um squad
 */

const fs   = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { AGENTS } = require('./daily_tasks_config');

const ROOT       = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'agents');
const FORCE      = process.argv.includes('--force');
const SQUAD      = (() => { const i = process.argv.indexOf('--squad'); return i !== -1 ? process.argv[i+1] : null; })();
const CONCURRENCY = 4;

const filtered = SQUAD ? AGENTS.filter(a => a.squad === SQUAD) : AGENTS;

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   INSTALL ALL AGENTS — SmartOps IA                      ║');
console.log(`║   Agentes: ${String(filtered.length).padEnd(47)}║`);
console.log(`║   Modo: ${FORCE ? 'FORCE (todos)' : 'SMART (só faltando)'}${' '.repeat(FORCE ? 37 : 31)}║`);
console.log('╚══════════════════════════════════════════════════════════╝\n');

function needsInstall(agentDir) {
  if (FORCE) return true;
  const nm = path.join(agentDir, 'node_modules');
  if (!fs.existsSync(nm)) return true;
  // Verifica se package.json mudou depois do node_modules
  const pkgPath = path.join(agentDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  try {
    const pkgStat = fs.statSync(pkgPath);
    const nmStat  = fs.statSync(nm);
    return pkgStat.mtime > nmStat.mtime;
  } catch { return true; }
}

function installAgent(agent) {
  return new Promise((resolve) => {
    const agentDir = path.join(AGENTS_DIR, agent.folder);
    if (!fs.existsSync(agentDir)) {
      return resolve({ key: agent.key, status: 'skipped', reason: 'pasta não encontrada' });
    }
    if (!fs.existsSync(path.join(agentDir, 'package.json'))) {
      return resolve({ key: agent.key, status: 'skipped', reason: 'sem package.json' });
    }
    if (!needsInstall(agentDir)) {
      return resolve({ key: agent.key, status: 'skip_ok', reason: 'node_modules já existe' });
    }

    const start = Date.now();
    const proc  = spawn('npm', ['install', '--silent', '--no-fund'], {
      cwd: agentDir, shell: true,
      env: { ...process.env, npm_config_loglevel: 'error' },
    });

    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      if (code === 0) {
        resolve({ key: agent.key, status: 'installed', elapsed_s: parseFloat(elapsed) });
      } else {
        resolve({ key: agent.key, status: 'error', error: stderr.slice(0, 200), elapsed_s: parseFloat(elapsed) });
      }
    });

    proc.on('error', (e) => {
      resolve({ key: agent.key, status: 'error', error: e.message });
    });
  });
}

// Executa em batches de CONCURRENCY
async function runBatches() {
  const results = [];
  const toInstall = filtered.filter(a => {
    const dir = path.join(AGENTS_DIR, a.folder);
    return fs.existsSync(dir);
  });

  // Primeiro mostra quais vão rodar
  const needed = toInstall.filter(a => needsInstall(path.join(AGENTS_DIR, a.folder)));
  const skip   = toInstall.filter(a => !needsInstall(path.join(AGENTS_DIR, a.folder)));

  console.log(`  Já instalados (pular): ${skip.length}`);
  console.log(`  Precisam instalar:     ${needed.length}\n`);

  if (needed.length === 0) {
    console.log('  ✅ Todos os node_modules já estão instalados!\n');
    return [];
  }

  for (let i = 0; i < needed.length; i += CONCURRENCY) {
    const batch = needed.slice(i, i + CONCURRENCY);
    console.log(`  Batch ${Math.floor(i/CONCURRENCY)+1}: ${batch.map(a => a.folder).join(', ')}`);

    const batchResults = await Promise.all(batch.map(installAgent));
    batchResults.forEach(r => {
      const icon = r.status === 'installed' ? '✅' : r.status === 'error' ? '❌' : '⏭️ ';
      const info = r.status === 'installed' ? `(${r.elapsed_s}s)` : r.reason || r.error || '';
      console.log(`    ${icon} ${r.key.padEnd(40)} ${info}`);
      results.push(r);
    });
  }

  return results;
}

runBatches().then(results => {
  const installed = results.filter(r => r.status === 'installed').length;
  const errors    = results.filter(r => r.status === 'error').length;

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Instalados: ${installed}`);
  if (errors > 0) console.log(`  ❌ Erros:      ${errors}`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (errors > 0) {
    console.log('Erros:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`  • ${r.key}: ${r.error}`);
    });
  }

  process.exit(errors > 0 ? 1 : 0);
}).catch(e => {
  console.error('Erro fatal:', e.message);
  process.exit(1);
});
