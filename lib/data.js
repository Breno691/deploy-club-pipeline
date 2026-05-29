require('dotenv').config();
const fs = require('fs');

let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }
} catch {}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function writeJsonSafe(p, data) {
  try {
    const dir = require('path').dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  } catch {}
}

async function getLeads() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leads').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        writeJsonSafe('data/leads.json', data); // cache local
        return data;
      }
    } catch {}
  }
  return (readJsonSafe('data/leads.json') || []).filter(l => !l._exemplo);
}

async function getClients() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('clients').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        writeJsonSafe('data/clients.json', data);
        return data;
      }
    } catch {}
  }
  return (readJsonSafe('data/clients.json') || []).filter(c => !c._exemplo);
}

async function getFinancial() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('financial').select('*').eq('id', 1).single();
      if (!error && data) {
        const formatted = toLocalFormat(data);
        writeJsonSafe('data/financial_data.json', formatted);
        return formatted;
      }
    } catch {}
  }
  return readJsonSafe('data/financial_data.json') || {};
}

// Converte formato flat do Supabase para o formato esperado pelos agentes
function toLocalFormat(row) {
  return {
    receita_total:      row.receita_total      || 0,
    receita_recorrente: row.receita_retainers  || 0,
    receita_projeto:    row.receita_projetos   || 0,
    margem_bruta:       row.margem_bruta       || 0,
    cac:  0,
    ltv:  0,
    receita: {
      projetos_ativos:          row.receita_projetos    || 0,
      novos_fechamentos_mes:    row.receita_fechamentos || 0,
      parceria_mensal_retainer: row.receita_retainers   || 0,
      total_mensal:             row.receita_total       || 0,
    },
    custos: {
      total_mensal: row.custos_total || 600,
    },
    custos_totais: row.custos_total || 600,
    pipeline_vendas: {
      leads_ativos:         row.leads_ativos   || 0,
      valor_total_pipeline: row.pipeline_valor || 0,
      reunioes_agendadas:   row.reunioes       || 0,
    },
    metricas_calculadas: {
      margem_bruta_pct:   row.margem_bruta || 0,
      saude_financeira:   row.saude        || 'pre-receita',
      receita_recorrente: row.receita_retainers || 0,
    },
    metas: {
      receita_mensal_meta:      15000,
      margem_bruta_minima:      60,
      ltv_cac_ratio_minimo:     3,
    },
  };
}

module.exports = { getLeads, getClients, getFinancial };
