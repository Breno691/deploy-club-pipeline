require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3200;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS — permite acesso do celular
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── LEADS ─────────────────────────────────────────────────────────────────────
app.get('/api/leads', async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/leads', async (req, res) => {
  const lead = {
    ...req.body,
    created_at: new Date().toISOString(),
    ultimo_contato: req.body.ultimo_contato || new Date().toISOString().split('T')[0],
    status: req.body.status || 'novo',
    score: req.body.score || 0,
  };
  const { data, error } = await supabase.from('leads').insert([lead]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok', lead: data });
});

app.put('/api/leads/:id', async (req, res) => {
  const { data, error } = await supabase.from('leads').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok', lead: data });
});

app.delete('/api/leads/:id', async (req, res) => {
  const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok' });
});

// ── CLIENTS ───────────────────────────────────────────────────────────────────
app.get('/api/clients', async (req, res) => {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/clients', async (req, res) => {
  const client = {
    ...req.body,
    created_at: new Date().toISOString(),
    status: req.body.status || 'ativo',
    semana: req.body.semana || 1,
    ultimo_contato: new Date().toISOString().split('T')[0],
  };
  const { data, error } = await supabase.from('clients').insert([client]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok', client: data });
});

app.put('/api/clients/:id', async (req, res) => {
  const { data, error } = await supabase.from('clients').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok', client: data });
});

app.delete('/api/clients/:id', async (req, res) => {
  const { error } = await supabase.from('clients').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok' });
});

// ── FINANCIAL ─────────────────────────────────────────────────────────────────
app.get('/api/financial', async (req, res) => {
  const { data, error } = await supabase.from('financial').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  res.json(data || {});
});

app.put('/api/financial', async (req, res) => {
  const receita = req.body.receita || {};
  const custos  = req.body.custos  || {};
  const pipeline = req.body.pipeline_vendas || {};

  const receitaTotal = (receita.projetos_ativos || 0) + (receita.novos_fechamentos_mes || 0) + (receita.parceria_mensal_retainer || 0);
  const custoTotal   = custos.total_mensal || 600;
  const margem       = receitaTotal > 0 ? Math.round((receitaTotal - custoTotal) / receitaTotal * 100) : 0;

  const payload = {
    id: 1,
    receita_projetos:    receita.projetos_ativos || 0,
    receita_fechamentos: receita.novos_fechamentos_mes || 0,
    receita_retainers:   receita.parceria_mensal_retainer || 0,
    receita_total:       receitaTotal,
    custos_total:        custoTotal,
    margem_bruta:        margem,
    leads_ativos:        pipeline.leads_ativos || 0,
    pipeline_valor:      pipeline.valor_total_pipeline || 0,
    reunioes:            pipeline.reunioes_agendadas || 0,
    saude: receitaTotal === 0 ? 'pre-receita' : receitaTotal < custoTotal ? 'critico' : receitaTotal < custoTotal * 2 ? 'alerta' : 'saudavel',
    updated_at:          new Date().toISOString(),
  };

  const { data, error } = await supabase.from('financial').upsert([payload]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok', data });
});

app.listen(PORT, () => {
  console.log(`SmartOps IA — Mobile Server rodando na porta ${PORT}`);
});
