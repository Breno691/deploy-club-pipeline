/**
 * Morning Briefing — SmartOps IA
 * Roda os 5 agentes essenciais em sequência, cada um lendo o output do anterior.
 * Uso: npm run morning
 */
require('dotenv').config();
const { execFileSync } = require('child_process');
const { sendTelegram } = require('../lib/agent_notify');

const DATE = new Date().toISOString().split('T')[0];

const AGENTS = [
  { name: 'KPI Guardian',    cmd: 'kpi-guardian' },
  { name: 'Risk Agent',      cmd: 'risk' },
  { name: 'Lead Scoring',    cmd: 'lead-score' },
  { name: 'Chief of Staff',  cmd: 'cos' },
  { name: 'CEO Advisor',     cmd: 'ceo' },
];

async function runMorning() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   SmartOps IA — Morning Briefing       ║');
  console.log(`║   ${DATE}                       ║`);
  console.log('╚════════════════════════════════════════╝\n');

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

  const totalDuration = Math.round((Date.now() - start) / 1000);
  const ok = results.filter(r => r.status === '✅').length;
  const fail = results.filter(r => r.status === '❌').length;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Morning Briefing — Concluído         ║');
  console.log('╠════════════════════════════════════════╣');
  results.forEach(r => {
    console.log(`║  ${r.status} ${r.name.padEnd(28)} ${String(r.duration + 's').padStart(5)} ║`);
  });
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Total: ${String(totalDuration + 's').padEnd(8)} OK: ${ok}  Erros: ${fail}          ║`);
  console.log('╚════════════════════════════════════════╝\n');

  const summary = results.map(r => `${r.status} ${r.name}`).join('\n');
  await sendTelegram(`🌅 *Morning Briefing — ${DATE}*\n${summary}\n\nTotal: ${Math.floor(totalDuration/60)}m ${totalDuration%60}s`);
}

runMorning().catch(err => {
  console.error('Morning Briefing error:', err.message);
  process.exit(1);
});
