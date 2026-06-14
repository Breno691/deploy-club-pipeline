// pipeline/server.js — HTTP server para integração com n8n
// Uso: node pipeline/server.js
// O n8n chama POST /run-pipeline via HTTP Request node (sem child_process)
require('dotenv').config();
const express = require('express');
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const { getReportsByDate, getAvailableDates, getDailySummary, getReportById, getAgentHistory } = require('../scripts/reports_db');

const app  = express();
const PORT = process.env.PIPELINE_PORT || 3099;
const ROOT = path.resolve(__dirname, '..');

app.use(express.json());

// ── Healthcheck ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Run Pipeline ─────────────────────────────────────────────────────────────
app.post('/run-pipeline', async (req, res) => {
  const { taskName, taskDate, skipPost = true } = req.body;

  if (!taskName || !taskDate) {
    return res.status(400).json({ error: 'taskName e taskDate são obrigatórios' });
  }
  if (!/^\w[\w-]*$/.test(taskName)) {
    return res.status(400).json({ error: 'taskName inválido (somente letras, números, _ e -)' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(taskDate)) {
    return res.status(400).json({ error: 'taskDate deve ser YYYY-MM-DD' });
  }

  const taskDir = path.join(ROOT, 'outputs', `${taskName}_${taskDate}`);

  try {
    const skipPostFlag = skipPost ? '--skip-post' : '';
    const cmd = `node pipeline/run_auto.js --task ${taskName} --date ${taskDate} ${skipPostFlag}`.trim();

    console.log(`[${new Date().toISOString()}] Iniciando: ${cmd}`);

    const output = execSync(cmd, {
      cwd: ROOT,
      timeout: 300000,
      encoding: 'utf8',
    });

    // Extrai JSON do marcador __RESULT__
    const marker = output.indexOf('__RESULT__');
    let result;
    if (marker !== -1) {
      result = JSON.parse(output.slice(marker + 10).trim());
    } else {
      // Fallback: lê do arquivo
      const resultPath = path.join(taskDir, 'auto_result.json');
      result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
    }

    // Lê caption completa e separa hashtags
    const captionPath = path.join(taskDir, 'copy', 'instagram_caption.txt');
    const captionRaw  = fs.existsSync(captionPath)
      ? fs.readFileSync(captionPath, 'utf8').trim()
      : '';

    const linhas      = captionRaw.split('\n');
    const hashtagIdx  = linhas.findIndex(l => l.trim().startsWith('#'));
    const legenda     = hashtagIdx > 0 ? linhas.slice(0, hashtagIdx).join('\n').trim() : captionRaw;
    const hashtags    = hashtagIdx > 0 ? linhas.slice(hashtagIdx).join('\n').trim() : '';

    const payload = {
      taskName,
      taskDate,
      titulo:      `${taskName} — ${taskDate}`,
      tipo_post:   'imagem',
      url_imagem:  result.image_url,
      legenda,
      cta:         'Diagnóstico gratuito: link na bio',
      hashtags,
      status:      'aprovado',
      gerado_em:   new Date().toLocaleString('pt-BR'),
      origem:      'pipeline_claude',
    };

    console.log(`[${new Date().toISOString()}] ✓ Pipeline completa: ${taskName}`);
    res.json(payload);

  } catch (e) {
    const msg = e.message?.slice(0, 300) || 'Erro desconhecido';
    console.error(`[${new Date().toISOString()}] ✗ Erro: ${msg}`);
    res.status(500).json({ error: msg });
  }
});

// ── Agent Report → @IAAgentesmartopsbot ──────────────────────────────────────
// Recebe relatório de qualquer agente e envia via bot dedicado
// Body: { agent, message, date? }
app.post('/send-agent-report', async (req, res) => {
  const { agent, message, date } = req.body;
  if (!agent || !message) {
    return res.status(400).json({ error: 'agent e message são obrigatórios' });
  }

  const AGENT_BOT_TOKEN = process.env.TELEGRAM_AGENT_BOT_TOKEN;
  const AGENT_CHAT_ID   = process.env.TELEGRAM_AGENT_CHAT_ID || '1349738505';

  if (!AGENT_BOT_TOKEN) {
    return res.status(500).json({ error: 'TELEGRAM_AGENT_BOT_TOKEN não configurado' });
  }

  const today = date || new Date().toISOString().split('T')[0];
  const text  = `${message}`;

  try {
    const params = new URLSearchParams({ chat_id: AGENT_CHAT_ID, text, parse_mode: 'Markdown' });
    const response = await fetch(
      `https://api.telegram.org/bot${AGENT_BOT_TOKEN}/sendMessage`,
      { method: 'POST', body: params }
    );
    const data = await response.json();
    if (!data.ok) throw new Error(data.description);
    console.log(`[${new Date().toISOString()}] Agente ${agent} (${today}): mensagem enviada`);
    res.json({ ok: true, agent, date: today, message_id: data.result.message_id });
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Erro send-agent-report: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ── Reports Dashboard ─────────────────────────────────────────────────────────

// GET /reports — serve o portal HTML
app.get('/reports', (_, res) => {
  const html = path.join(ROOT, 'pipeline', 'reports-dashboard.html');
  if (fs.existsSync(html)) res.sendFile(html);
  else res.status(404).send('Dashboard não encontrado');
});

// GET /api/reports?date=YYYY-MM-DD — relatórios do dia
app.get('/api/reports', async (req, res) => {
  try {
    const date    = req.query.date || new Date().toISOString().split('T')[0];
    const reports = await getReportsByDate(date);
    const summary = await getDailySummary(date);
    res.json({ date, reports, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reports/dates — datas disponíveis
app.get('/api/reports/dates', async (_, res) => {
  try {
    const dates = await getAvailableDates();
    res.json({ dates });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reports/history/:agentKey — histórico de um agente
app.get('/api/reports/history/:agentKey', async (req, res) => {
  try {
    const history = await getAgentHistory(req.params.agentKey);
    res.json({ history });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reports/:id — 1 relatório completo
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ report });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Send Prospecting — dispara send_daily.js de prospecção ───────────────────
app.post('/send-prospecting', (req, res) => {
  const date = new Date().toISOString().split('T')[0];

  res.json({ ok: true, date, message: 'Envio de prospecção iniciado em background' });

  const { spawn } = require('child_process');
  const proc = spawn('node', ['prospecting/send_daily.js'], {
    cwd:      ROOT,
    detached: true,
    stdio:    ['ignore', fs.openSync(path.join(ROOT, 'outputs/prospecting/server.log'), 'a'),
                          fs.openSync(path.join(ROOT, 'outputs/prospecting/server.log'), 'a')],
    env:      process.env,
  });
  proc.unref();

  console.log(`[${new Date().toISOString()}] Prospecção iniciada (PID ${proc.pid})`);
});

// ── Weekly Briefing — todos os squads apresentam novidades da semana ─────────
app.post('/run-weekly-briefing', (req, res) => {
  const date = new Date().toISOString().split('T')[0];
  const noTelegram = req.body?.noTelegram === true;

  res.json({ ok: true, date, message: 'Briefing semanal iniciado em background' });

  const { spawn } = require('child_process');
  const logPath = path.join(ROOT, `outputs/weekly_briefing_${date}/logs/server.log`);
  require('fs').mkdirSync(path.dirname(logPath), { recursive: true });

  const nodeArgs = ['scripts/weekly_briefing.js'];
  if (noTelegram) nodeArgs.push('--no-telegram');

  const proc = spawn('node', nodeArgs, {
    cwd:      ROOT,
    detached: true,
    stdio:    ['ignore',
               require('fs').openSync(logPath, 'a'),
               require('fs').openSync(logPath, 'a')],
    env:      process.env,
  });
  proc.unref();

  console.log(`[${new Date().toISOString()}] Weekly briefing iniciado (PID ${proc.pid})`);
});

// ── Run Daily — dispara o daily_master_runner.js ─────────────────────────────
// Body: { level?: 'daily'|'weekly'|'full' }
app.post('/run-daily', (req, res) => {
  const level = req.body?.level || 'daily';
  const date  = new Date().toISOString().split('T')[0];

  res.json({ ok: true, level, date, message: `Rotina ${level} iniciada em background` });

  // Executa em background — não bloqueia a resposta
  const { spawn } = require('child_process');
  const proc = spawn('node', ['scripts/daily_master_runner.js', '--level', level], {
    cwd:      ROOT,
    detached: true,
    stdio:    'ignore',
    env:      process.env,
  });
  proc.unref();

  console.log(`[${new Date().toISOString()}] Rotina ${level} iniciada (PID ${proc.pid})`);
});

// ── WhatsApp Webhook Relay ────────────────────────────────────────────────────
// Recebe webhooks do Meta e retransmite para n8n + Chatwoot em paralelo
// Configura no Meta: URL = https://smartops-pipeline.61gu86.easypanel.host/webhook/whatsapp
//                   Verify Token = smartops_cw_2025
const N8N_WH_URL  = 'https://smartops-n8n.61gu86.easypanel.host/webhook/whatsapp';
const CW_WH_URL   = 'https://smartops-chatwoot-web.61gu86.easypanel.host/webhooks/whatsapp/%2B5531972039180';
const WH_VERIFY   = process.env.WH_VERIFY_TOKEN || 'smartops_cw_2025';

// GET — Meta verifica o token
app.get('/webhook/whatsapp', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === WH_VERIFY) {
    console.log(`[${new Date().toISOString()}] Webhook Meta verificado OK`);
    return res.status(200).send(challenge);
  }
  console.warn(`[${new Date().toISOString()}] Webhook verify FALHOU token="${token}"`);
  res.sendStatus(403);
});

// POST — Meta envia mensagens; relay para n8n e Chatwoot
app.post('/webhook/whatsapp', async (req, res) => {
  const body = req.body;
  res.sendStatus(200); // responde imediatamente para o Meta

  const payloadStr = JSON.stringify(body);
  const ts = new Date().toISOString();
  console.log(`[${ts}] Webhook WA recebido: ${payloadStr.slice(0, 120)}`);

  const forward = async (targetUrl, label) => {
    try {
      const r = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr,
      });
      console.log(`[${ts}] Relay → ${label}: ${r.status}`);
    } catch (e) {
      console.error(`[${ts}] Relay → ${label} ERRO: ${e.message}`);
    }
  };

  // Encaminha em paralelo para n8n e Chatwoot
  await Promise.all([
    forward(N8N_WH_URL, 'n8n'),
    forward(CW_WH_URL, 'chatwoot'),
  ]);
});

app.listen(PORT, () => {
  console.log(`Pipeline server rodando em http://localhost:${PORT}`);
  console.log(`  POST /run-pipeline        { taskName, taskDate, skipPost? }`);
  console.log(`  POST /send-agent-report   { agent, message, date? }`);
  console.log(`  POST /run-weekly-briefing { noTelegram? } → briefing semanal todos os squads`);
  console.log(`  POST /run-daily           { level? }  → dispara daily_master_runner`);
  console.log(`  POST /send-prospecting    {}          → dispara send_daily.js (prospecção)`);
  console.log(`  GET  /reports             → portal web de relatórios`);
  console.log(`  GET  /api/reports?date=   → JSON relatórios do dia`);
  console.log(`  GET  /webhook/whatsapp    → Meta verify (GET) + relay para n8n + Chatwoot (POST)`);
  console.log(`  GET  /health`);
});
