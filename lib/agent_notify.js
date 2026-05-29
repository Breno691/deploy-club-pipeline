require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1349738505';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const EXEC_FILE = path.join('data', 'executions.json');

// Persistência Supabase — opcional, não bloqueia se falhar
async function saveToSupabase(entry) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;
  try {
    const body = JSON.stringify({ ...entry, id: String(entry.id) });
    await new Promise((resolve) => {
      const u = new URL(`${url}/rest/v1/agent_executions`);
      const opts = {
        hostname: u.hostname, path: u.pathname + '?on_conflict=id',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'resolution=merge-duplicates',
          'Content-Length': Buffer.byteLength(body),
        },
      };
      const req = https.request(opts, () => resolve());
      req.on('error', () => resolve());
      req.write(body);
      req.end();
    });
  } catch {}
}

function sendTelegram(text) {
  return new Promise((resolve) => {
    if (!BOT_TOKEN) return resolve();
    const body = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' });
    const opts = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(opts, () => resolve());
    req.on('error', () => resolve());
    req.write(body);
    req.end();
  });
}

function loadExecutions() {
  try { return JSON.parse(fs.readFileSync(EXEC_FILE, 'utf8')); } catch { return []; }
}

function saveExecutions(list) {
  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (list.length > 500) list.length = 500;
  fs.writeFileSync(EXEC_FILE, JSON.stringify(list, null, 2));
}

function logRunning(agentName) {
  const entry = { id: Date.now(), agent: agentName, status: 'running', startedAt: new Date().toISOString() };
  const list = loadExecutions();
  list.unshift(entry);
  saveExecutions(list);
  return entry.id;
}

function updateExecution(id, patch) {
  const list = loadExecutions();
  const idx = list.findIndex(e => e.id === id);
  if (idx !== -1) { list[idx] = { ...list[idx], ...patch }; saveExecutions(list); }
}

async function notifyCompletion(agentName, opts = {}) {
  const { status = 'completed', summary = '', alerts = [], outputPath = '', runId = null } = opts;

  const entry = {
    id: runId || Date.now(),
    agent: agentName,
    status,
    finishedAt: new Date().toISOString(),
    summary,
    alerts: (alerts || []).slice(0, 5),
    outputPath,
  };

  const list = loadExecutions();
  const idx = runId ? list.findIndex(e => e.id === runId) : -1;
  if (idx !== -1) { list[idx] = { ...list[idx], ...entry }; }
  else { list.unshift(entry); }
  saveExecutions(list);
  saveToSupabase(entry).catch(() => {});

  if (!BOT_TOKEN) return;

  const icon = status === 'error' ? '❌' : '✅';
  const alertLine = alerts.length ? `\n⚠️ ${alerts.slice(0, 3).join(' | ')}` : '';
  const summaryLine = summary ? `\n${summary}` : '';
  await sendTelegram(`${icon} *${agentName}*${summaryLine}${alertLine}`);
}

async function notifyError(agentName, err, runId = null) {
  const msg = err?.message || String(err);
  await notifyCompletion(agentName, { status: 'error', summary: msg, runId });
}

module.exports = { notifyCompletion, notifyError, logRunning, updateExecution, sendTelegram };
