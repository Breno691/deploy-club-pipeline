/**
 * Wrapper universal para agentes SmartOps IA.
 * Uso: node lib/run.js "Nome do Agente" scripts/agent.js [args...]
 *
 * - Mostra output em tempo real no terminal
 * - Registra execução em data/executions.json
 * - Envia notificação Telegram ao concluir
 */
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { logRunning, updateExecution, notifyCompletion, notifyError } = require('./agent_notify');

const [agentName, scriptPath, ...scriptArgs] = process.argv.slice(2);

if (!agentName || !scriptPath) {
  console.error('Uso: node lib/run.js "Nome do Agente" scripts/agent.js [args...]');
  process.exit(1);
}

function findLatestOutputDir(taskArg) {
  if (!taskArg) return '';
  try {
    const base = 'outputs';
    if (!fs.existsSync(base)) return '';
    const dirs = fs.readdirSync(base).filter(d => d.startsWith(taskArg)).sort().reverse();
    return dirs[0] ? path.join(base, dirs[0]) : '';
  } catch { return ''; }
}

function readSummaryFromOutput(outputDir) {
  if (!outputDir) return '';
  try {
    const files = fs.readdirSync(outputDir, { withFileTypes: true });
    for (const f of files) {
      if (f.isDirectory()) {
        const sub = path.join(outputDir, f.name);
        const jsonFiles = fs.readdirSync(sub).filter(x => x.endsWith('.json'));
        for (const jf of jsonFiles) {
          const data = JSON.parse(fs.readFileSync(path.join(sub, jf), 'utf8'));
          const parts = [];
          if (data.total_leads != null)   parts.push(`Leads: ${data.total_leads}`);
          if (data.total_clients != null) parts.push(`Clientes: ${data.total_clients}`);
          if (data.receita != null)       parts.push(`Receita: R$ ${data.receita}`);
          if (data.hot_leads != null)     parts.push(`Quentes: ${data.hot_leads}`);
          if (data.pipeline_brl != null)  parts.push(`Pipeline: R$ ${data.pipeline_brl}`);
          if (data.total_alerts != null)  parts.push(`Alertas: ${data.total_alerts}`);
          if (parts.length) return parts.join(' | ');
        }
      }
    }
  } catch {}
  return '';
}

const taskArg = (() => {
  const idx = scriptArgs.indexOf('--task');
  return idx !== -1 ? scriptArgs[idx + 1] : null;
})();

const runId = logRunning(agentName);
const startTime = Date.now();

console.log(`\n▶  ${agentName}`);

const proc = spawn('node', [scriptPath, ...scriptArgs], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});

proc.on('close', async (code) => {
  const duration = Math.round((Date.now() - startTime) / 1000);
  const outputDir = findLatestOutputDir(taskArg);
  const summaryFromFiles = readSummaryFromOutput(outputDir);
  const durationStr = duration >= 60
    ? `${Math.floor(duration / 60)}m ${duration % 60}s`
    : `${duration}s`;
  const summary = summaryFromFiles
    ? `${summaryFromFiles} · ${durationStr}`
    : `Concluído em ${durationStr}`;

  if (code === 0) {
    await notifyCompletion(agentName, { status: 'completed', summary, outputPath: outputDir, runId });
    console.log(`\n✅ ${agentName} — ${durationStr}`);
  } else {
    await notifyError(agentName, { message: `Saiu com código ${code} após ${durationStr}` }, runId);
    console.error(`\n❌ ${agentName} — erro (código ${code})`);
  }

  process.exit(code || 0);
});

proc.on('error', async (err) => {
  await notifyError(agentName, err, runId);
  console.error(`\n❌ ${agentName} — ${err.message}`);
  process.exit(1);
});
