// pipeline/server.js — HTTP server para integração com n8n
// Uso: node pipeline/server.js
// O n8n chama POST /run-pipeline via HTTP Request node (sem child_process)
require('dotenv').config();
const express = require('express');
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

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

app.listen(PORT, () => {
  console.log(`Pipeline server rodando em http://localhost:${PORT}`);
  console.log(`  POST /run-pipeline        { taskName, taskDate, skipPost? }`);
  console.log(`  POST /send-agent-report   { agent, message, date? }`);
  console.log(`  POST /run-daily           { level? }  → dispara daily_master_runner`);
  console.log(`  GET  /health`);
});
