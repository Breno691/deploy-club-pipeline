/**
 * Weekly Review — SmartOps IA
 * Roda os agentes de revisão semanal em sequência.
 * Uso: npm run weekly
 */
require('dotenv').config();
const { execFileSync } = require('child_process');
const { sendTelegram } = require('../lib/agent_notify');

const DATE = new Date().toISOString().split('T')[0];

const AGENTS = [
  { name: 'Financial Intelligence', cmd: 'finance' },
  { name: 'Revenue Agent',          cmd: 'revenue' },
  { name: 'Sales Intelligence',     cmd: 'sales' },
  { name: 'Risk Agent',             cmd: 'risk' },
  { name: 'KPI Guardian',           cmd: 'kpi-guardian' },
  { name: 'Executive Dashboard',    cmd: 'exec-dash' },
  { name: 'Competitor Intelligence',cmd: 'competitor' },
  { name: 'Strategic Planning',     cmd: 'strategy' },
  { name: 'CEO Advisor',            cmd: 'ceo' },
  { name: 'Chief of Staff',         cmd: 'cos' },
];

async function runWeekly() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   SmartOps IA — Weekly Review          ║');
  console.log(`║   ${DATE}                       ║`);
  console.log('╚════════════════════════════════════════╝\n');
  console.log('  10 agentes em sequência. ~20-30 minutos.\n');

  const results = [];
  const start = Date.now();

  for (const agent of AGENTS) {
    console.log(`\n─── ${agent.name} ──────────────────────────────`);
    const agentStart = Date.now();
    try {
      execFileSync('npm', ['run', agent.cmd], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: process.env,
        shell: true,
      });
      const duration = Math.round((Date.now() - agentStart) / 1000);
      results.push({ name: agent.name, status: '✅', duration });
    } catch (err) {
      const duration = Math.round((Date.now() - agentStart) / 1000);
      results.push({ name: agent.name, status: '❌', duration, error: err.message });
      console.error(`\n  ❌ ${agent.name} falhou — continuando...`);
    }
  }

  const totalMin = Math.floor((Date.now() - start) / 60000);
  const totalSec = Math.round(((Date.now() - start) % 60000) / 1000);
  const ok = results.filter(r => r.status === '✅').length;
  const fail = results.filter(r => r.status === '❌').length;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Weekly Review — Concluído            ║');
  console.log('╠════════════════════════════════════════╣');
  results.forEach(r => {
    const dur = r.duration >= 60
      ? `${Math.floor(r.duration/60)}m${r.duration%60}s`
      : `${r.duration}s`;
    console.log(`║  ${r.status} ${r.name.padEnd(28)} ${dur.padStart(5)} ║`);
  });
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Total: ${String(totalMin + 'm ' + totalSec + 's').padEnd(8)} OK: ${ok}  Erros: ${fail}          ║`);
  console.log('╚════════════════════════════════════════╝\n');
  console.log('  Relatórios em: outputs/*/');

  const summary = results.map(r => `${r.status} ${r.name}`).join('\n');
  await sendTelegram(`📊 *Weekly Review — ${DATE}*\n${summary}\n\nTotal: ${totalMin}m ${totalSec}s | OK: ${ok} | Erros: ${fail}`);
}

runWeekly().catch(err => {
  console.error('Weekly Review error:', err.message);
  process.exit(1);
});
