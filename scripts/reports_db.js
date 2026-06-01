/**
 * reports_db.js — SmartOps IA
 * Salva e lê relatórios de agentes no Supabase via REST puro (sem WebSocket/realtime).
 * Compatível com Node.js 18, 20 e 22.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');
const http  = require('http');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const TABLE        = 'agent_daily_reports';

function isConfigured() {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}

// ─── REST helper ─────────────────────────────────────────────────────────────

function restRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    if (!isConfigured()) return resolve({ data: null, error: { message: 'Supabase não configurado' } });

    const url     = new URL(`/rest/v1/${path}`, SUPABASE_URL);
    const bodyStr = body ? JSON.stringify(body) : null;
    const lib     = url.protocol === 'https:' ? https : http;

    const opts = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname + url.search,
      method,
      headers: {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        method === 'POST' ? 'return=representation' : '',
      },
    };
    if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = lib.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (res.statusCode >= 400) resolve({ data: null, error: data });
          else resolve({ data, error: null });
        } catch { resolve({ data: raw, error: null }); }
      });
    });
    req.on('error', e => resolve({ data: null, error: { message: e.message } }));
    req.setTimeout(10000, () => { req.destroy(); resolve({ data: null, error: { message: 'Timeout' } }); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Operações ────────────────────────────────────────────────────────────────

async function saveReport({ date, agentKey, agentName, squad, mode, status, content, contentClean, elapsedSeconds, telegramSent, telegramChunks, dailyTasks }) {
  if (!isConfigured()) return null;
  try {
    const { data, error } = await restRequest('POST', TABLE, {
      date,
      agent_key:       agentKey,
      agent_name:      agentName,
      squad,
      mode,
      status,
      content:         (content || '').slice(0, 50000),
      content_clean:   (contentClean || '').slice(0, 50000),
      elapsed_seconds: elapsedSeconds || 0,
      telegram_sent:   telegramSent || false,
      telegram_chunks: telegramChunks || 0,
      daily_tasks:     dailyTasks || [],
    });
    if (error) { console.warn(`  ⚠️  DB save (${agentKey}): ${error.message || JSON.stringify(error)}`); return null; }
    return Array.isArray(data) ? data[0]?.id : data?.id;
  } catch (e) { console.warn(`  ⚠️  DB error: ${e.message}`); return null; }
}

async function getReportsByDate(date) {
  if (!isConfigured()) return [];
  const { data, error } = await restRequest('GET', `${TABLE}?date=eq.${date}&order=squad.asc,agent_name.asc&select=*`);
  if (error || !data) return [];
  return Array.isArray(data) ? data : [];
}

async function getAvailableDates() {
  if (!isConfigured()) return [];
  const { data, error } = await restRequest('GET', `${TABLE}?select=date&order=date.desc&limit=200`);
  if (error || !data) return [];
  const all   = Array.isArray(data) ? data : [];
  const dates = [...new Set(all.map(r => r.date))];
  return dates.slice(0, 30);
}

async function getDailySummary(date) {
  if (!isConfigured()) return null;
  const { data, error } = await restRequest('GET', `${TABLE}?date=eq.${date}&select=status,squad,elapsed_seconds`);
  if (error || !data || !Array.isArray(data)) return null;
  return {
    date,
    total:   data.length,
    ok:      data.filter(r => r.status === 'ok').length,
    partial: data.filter(r => r.status === 'partial').length,
    errors:  data.filter(r => r.status === 'error').length,
    squads:  [...new Set(data.map(r => r.squad))],
    avg_elapsed: data.length > 0
      ? (data.reduce((s, r) => s + (r.elapsed_seconds || 0), 0) / data.length).toFixed(1)
      : 0,
  };
}

async function getReportById(id) {
  if (!isConfigured()) return null;
  const { data, error } = await restRequest('GET', `${TABLE}?id=eq.${id}&select=*&limit=1`);
  if (error || !data) return null;
  return Array.isArray(data) ? data[0] : data;
}

async function getAgentHistory(agentKey, limit = 30) {
  if (!isConfigured()) return [];
  const { data, error } = await restRequest('GET', `${TABLE}?agent_key=eq.${agentKey}&select=id,date,status,elapsed_seconds,telegram_sent&order=date.desc&limit=${limit}`);
  if (error || !data) return [];
  return Array.isArray(data) ? data : [];
}

module.exports = { saveReport, getReportsByDate, getAvailableDates, getDailySummary, getReportById, getAgentHistory, isConfigured };
