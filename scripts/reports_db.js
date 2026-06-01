/**
 * reports_db.js — SmartOps IA
 * Módulo para salvar e ler relatórios de agentes no Supabase.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getClient() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) { console.warn('⚠️  Supabase não configurado — relatórios não serão salvos online'); return null; }
  supabase = createClient(url, key, {
    realtime: { enabled: false },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

/**
 * Salva relatório de um agente no Supabase.
 */
async function saveReport({ date, agentKey, agentName, squad, mode, status, content, contentClean, elapsedSeconds, telegramSent, telegramChunks, dailyTasks }) {
  const db = getClient();
  if (!db) return null;

  try {
    const { data, error } = await db.from('agent_daily_reports').insert({
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
    }).select('id').single();

    if (error) { console.warn(`  ⚠️  Supabase save error (${agentKey}): ${error.message}`); return null; }
    return data?.id;
  } catch (e) {
    console.warn(`  ⚠️  Supabase error: ${e.message}`);
    return null;
  }
}

/**
 * Busca relatórios por data.
 */
async function getReportsByDate(date) {
  const db = getClient();
  if (!db) return [];
  const { data, error } = await db.from('agent_daily_reports')
    .select('*').eq('date', date).order('squad').order('agent_name');
  if (error) return [];
  return data || [];
}

/**
 * Busca datas disponíveis (últimos 30 dias).
 */
async function getAvailableDates() {
  const db = getClient();
  if (!db) return [];
  const { data, error } = await db.from('agent_daily_reports')
    .select('date').order('date', { ascending: false })
    .limit(200);
  if (error) return [];
  const dates = [...new Set((data || []).map(r => r.date))];
  return dates.slice(0, 30);
}

/**
 * Busca resumo diário (contagens por status).
 */
async function getDailySummary(date) {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db.from('agent_daily_reports')
    .select('status, squad, elapsed_seconds').eq('date', date);
  if (error || !data) return null;

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

/**
 * Busca 1 relatório por ID.
 */
async function getReportById(id) {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db.from('agent_daily_reports')
    .select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

/**
 * Busca relatórios por agente (histórico).
 */
async function getAgentHistory(agentKey, limit = 30) {
  const db = getClient();
  if (!db) return [];
  const { data, error } = await db.from('agent_daily_reports')
    .select('id, date, status, elapsed_seconds, telegram_sent')
    .eq('agent_key', agentKey)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

module.exports = { saveReport, getReportsByDate, getAvailableDates, getDailySummary, getReportById, getAgentHistory };
