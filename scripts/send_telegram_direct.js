/**
 * send_telegram_direct.js — SmartOps IA
 * Utilitário standalone para enviar mensagens ao Telegram.
 * NÃO depende do pipeline/server.js — faz chamada direta à API do Telegram.
 * Suporta mensagens longas (divide automaticamente em chunks de 3800 chars).
 *
 * Usage (CLI):
 *   node scripts/send_telegram_direct.js --agent "CEO Advisor" --message "texto"
 *   node scripts/send_telegram_direct.js --file /path/to/report.md --agent "Lean"
 *
 * Usage (module):
 *   const { sendTelegram, sendFile, sendSquadReport } = require('./send_telegram_direct');
 *   await sendTelegram({ agent: 'Lean', message: '...' });
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_AGENT_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_AGENT_CHAT_ID   || process.env.TELEGRAM_CHAT_ID || '1349738505';
const MAX_CHARS = 3800; // Telegram limit is 4096 — keep buffer

// ─── CORE: enviar mensagem via HTTPS direto ───────────────────────────────────

function telegramPost(text, parse_mode = 'Markdown') {
  return new Promise((resolve, reject) => {
    if (!BOT_TOKEN) return reject(new Error('TELEGRAM_AGENT_BOT_TOKEN não configurado no .env'));

    // Escapar underscores em contexto não-markdown para não quebrar parsing
    const safeText = text.slice(0, MAX_CHARS);

    const body = JSON.stringify({
      chat_id: CHAT_ID,
      text: safeText,
      parse_mode,
      disable_web_page_preview: true,
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.ok) resolve(parsed.result);
          else reject(new Error(`Telegram error: ${parsed.description}`));
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

// ─── Divide mensagem longa em chunks ─────────────────────────────────────────

function splitMessage(text) {
  if (text.length <= MAX_CHARS) return [text];

  const chunks = [];
  let current  = '';
  const lines  = text.split('\n');

  for (const line of lines) {
    if ((current + '\n' + line).length > MAX_CHARS) {
      if (current) chunks.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ─── Delay helper ────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

/**
 * Envia uma mensagem ao Telegram.
 * Divide automaticamente se > MAX_CHARS.
 */
async function sendTelegram({ agent, message, title, emoji = '🤖' }) {
  const header = title
    ? `${emoji} *${title}*`
    : `${emoji} *${agent}*`;

  const fullText = `${header}\n\n${message}`;
  const chunks   = splitMessage(fullText);
  const results  = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk  = i === 0 ? chunks[i] : `_...continuação (${i+1}/${chunks.length})_\n\n${chunks[i]}`;
    const result = await telegramPost(chunk);
    results.push(result);
    if (i < chunks.length - 1) await sleep(500); // rate limit
  }

  return results;
}

/**
 * Envia conteúdo de um arquivo .md ao Telegram.
 */
async function sendFile({ agent, filePath, emoji = '📄' }) {
  if (!fs.existsSync(filePath)) throw new Error(`Arquivo não encontrado: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return sendTelegram({ agent, message: content, emoji });
}

/**
 * Envia relatório de um squad completo (múltiplos agentes).
 * reports = [{ agent, title, content, emoji }]
 */
async function sendSquadReport({ squadName, reports, emoji = '📦' }) {
  if (!reports || reports.length === 0) return;

  // Header do squad
  const header = `${emoji} *SQUAD ${squadName.toUpperCase()}*\n${'─'.repeat(30)}`;
  await telegramPost(header);
  await sleep(300);

  for (const report of reports) {
    if (!report.content || report.content.trim().length < 10) continue;
    await sendTelegram({
      agent: report.agent,
      title: report.title || report.agent,
      message: report.content,
      emoji:   report.emoji || '📊',
    });
    await sleep(400); // rate limit entre mensagens
  }
}

/**
 * Envia resumo diário consolidado (mensagem única compacta).
 */
async function sendDailySummary({ date, results, scoreTotal }) {
  const ok      = results.filter(r => r.status === 'ok').length;
  const failed  = results.filter(r => r.status === 'error').length;
  const partial = results.filter(r => r.status === 'partial').length;

  const statusLine = failed > 0
    ? `⚠️ ${failed} agente(s) com erro`
    : `✅ Todos os agentes OK`;

  const text = `🎯 *SMARTOPS IA — RELATÓRIO DIÁRIO*
📅 *${date}*
${'═'.repeat(30)}

*Status:* ${statusLine}
*Agentes rodados:* ${results.length} | ✅ ${ok} | ⚠️ ${partial} | ❌ ${failed}
*Score geral:* ${scoreTotal ? `${scoreTotal}/100` : 'calculando...'}

${results.filter(r => r.status === 'ok').map(r => `✅ ${r.title}`).join('\n')}
${failed > 0 ? '\n*Erros:*\n' + results.filter(r => r.status === 'error').map(r => `❌ ${r.title}: ${r.error}`).join('\n') : ''}

_SmartOps IA · ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}_`;

  return telegramPost(text);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const agent   = (() => { const i = process.argv.indexOf('--agent');   return i !== -1 ? process.argv[i+1] : 'Sistema'; })();
  const message = (() => { const i = process.argv.indexOf('--message'); return i !== -1 ? process.argv[i+1] : null; })();
  const file    = (() => { const i = process.argv.indexOf('--file');    return i !== -1 ? process.argv[i+1] : null; })();

  (async () => {
    try {
      if (file) {
        await sendFile({ agent, filePath: file });
        console.log('✅ Arquivo enviado ao Telegram');
      } else if (message) {
        await sendTelegram({ agent, message });
        console.log('✅ Mensagem enviada ao Telegram');
      } else {
        console.error('Uso: --message "texto" ou --file caminho/arquivo.md');
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Erro:', e.message);
      process.exit(1);
    }
  })();
}

module.exports = { sendTelegram, sendFile, sendSquadReport, sendDailySummary, telegramPost };
