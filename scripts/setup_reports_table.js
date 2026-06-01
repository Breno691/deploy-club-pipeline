#!/usr/bin/env node
/**
 * setup_reports_table.js — SmartOps IA
 * Cria a tabela agent_daily_reports no Supabase via API de management.
 * Executar uma única vez: node scripts/setup_reports_table.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY são necessários no .env');
  process.exit(1);
}

// Extrai o project ref da URL (ex: https://abcdefg.supabase.co → abcdefg)
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

const SQL = `
CREATE TABLE IF NOT EXISTS agent_daily_reports (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date            DATE NOT NULL,
  agent_key       TEXT NOT NULL,
  agent_name      TEXT NOT NULL,
  squad           TEXT NOT NULL,
  mode            TEXT,
  status          TEXT,
  content         TEXT,
  content_clean   TEXT,
  elapsed_seconds FLOAT DEFAULT 0,
  telegram_sent   BOOLEAN DEFAULT false,
  telegram_chunks INT DEFAULT 0,
  daily_tasks     JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_reports_date  ON agent_daily_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_agent_reports_squad ON agent_daily_reports(squad);
CREATE INDEX IF NOT EXISTS idx_agent_reports_key   ON agent_daily_reports(agent_key);
`;

function supabasePost(endpoint, body) {
  return new Promise((resolve, reject) => {
    const url    = new URL(endpoint, SUPABASE_URL);
    const data   = JSON.stringify(body);
    const opts = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('\n📦 SmartOps IA — Setup Tabela de Relatórios\n');
  console.log(`  Project: ${projectRef}`);
  console.log(`  URL: ${SUPABASE_URL}\n`);

  // Tenta via SQL via REST endpoint
  try {
    const { createClient } = require('@supabase/supabase-js');
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Tenta criar via função RPC se existir
    const stmts = SQL.split(';').map(s => s.trim()).filter(s => s.length > 20);

    for (const stmt of stmts) {
      // Usa o endpoint de SQL do Supabase
      const res = await supabasePost('/rest/v1/rpc/exec', { query: stmt });
      if (res.status >= 400 && !JSON.stringify(res.body).includes('already exists')) {
        // Ignora erros de "já existe"
      }
    }

    // Verifica se a tabela existe
    const { data, error } = await db.from('agent_daily_reports').select('id').limit(1);

    if (error && error.code === '42P01') {
      // Tabela não existe — tenta via insert de teste que vai falhar mas com outro erro
      console.log('\n⚠️  A tabela precisa ser criada manualmente no Supabase SQL Editor.');
      console.log('\nCopie e cole o SQL abaixo no Supabase → SQL Editor → New Query:\n');
      console.log('─'.repeat(60));
      console.log(SQL.trim());
      console.log('─'.repeat(60));
      console.log('\nAcesse: https://app.supabase.com/project/' + projectRef + '/sql/new\n');
    } else if (!error) {
      console.log('✅ Tabela agent_daily_reports já existe e está acessível!\n');
      console.log('Tudo pronto. Os relatórios serão salvos automaticamente.\n');
    } else {
      console.log(`  Status: ${JSON.stringify(error)}`);
    }

  } catch (e) {
    console.error('Erro:', e.message);
  }
}

run();
