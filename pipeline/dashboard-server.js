require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { sendTelegram } = require('../lib/agent_notify');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3100;

// ── Scheduler ─────────────────────────────────────────────────────────────────
// Roda agendamentos sem dependência de node-cron — verifica a cada minuto.

const SCHEDULE = [
  // morning: seg-sex às 7h00
  { name: 'Morning Briefing', script: 'scripts/morning.js', hour: 7, minute: 0, days: [1,2,3,4,5] },
  // weekly: segunda às 8h00
  { name: 'Weekly Review',    script: 'scripts/weekly.js',  hour: 8, minute: 0, days: [1] },
  // kpi-guardian: diário às 12h00 (meio-dia)
  { name: 'KPI Guardian',     script: 'scripts/kpi_guardian.js',   hour: 12, minute: 0, days: [0,1,2,3,4,5,6], args: ['--task','kpi_guardian'] },
  // risk: diário às 18h00
  { name: 'Risk Agent',       script: 'scripts/risk_agent.js',      hour: 18, minute: 0, days: [0,1,2,3,4,5,6], args: ['--task','risk_monitor'] },
  // revenue-intel: sexta às 17h00
  { name: 'Revenue Intel',    script: 'scripts/digital_revenue_agent.js', hour: 17, minute: 0, days: [5], args: ['--task','revenue_intel'] },
];

const lastRan = {};

function checkSchedule() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), d = now.getDay();
  const key = `${now.toISOString().slice(0,16)}`; // YYYY-MM-DDTHH:MM

  for (const job of SCHEDULE) {
    if (job.hour !== h || job.minute !== m) continue;
    if (!job.days.includes(d)) continue;
    const jobKey = `${job.name}::${key}`;
    if (lastRan[jobKey]) continue;
    lastRan[jobKey] = true;

    console.log(`\n[Scheduler] ▶ ${job.name} — ${now.toLocaleTimeString('pt-BR')}`);
    const scriptArgs = job.args || [];
    execFile('node', [job.script, ...scriptArgs], { cwd: process.cwd(), env: process.env }, (err, stdout) => {
      if (err) {
        console.error(`[Scheduler] ❌ ${job.name}: ${err.message}`);
        sendTelegram(`❌ *Scheduler — ${job.name}*\nErro: ${err.message}`).catch(() => {});
      } else {
        console.log(`[Scheduler] ✅ ${job.name} concluído`);
      }
    });
  }
}

setInterval(checkSchedule, 60 * 1000);

// CORS — permite o dashboard HTML acessar a API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve o dashboard HTML estático
app.use(express.static(path.join(__dirname, '..', 'dashboard')));

// ── Helpers ──────────────────────────────────────────────────────────────────
function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function getMostRecentOutput(prefix) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return null;
  const dirs = fs.readdirSync(base)
    .filter(d => prefix ? d.startsWith(prefix) : true)
    .sort()
    .reverse();
  return dirs[0] ? path.join(base, dirs[0]) : null;
}

// ── API: Dashboard data ───────────────────────────────────────────────────────
app.get('/api/dashboard-data', (req, res) => {
  const result = {
    timestamp: new Date().toISOString(),
    finance: null,
    leads: null,
    pipeline: null,
    content: null,
    agents: [],
    runs: 0,
  };

  // Finance data
  const financeDir = getMostRecentOutput('finance');
  if (financeDir) {
    const metrics = readJsonSafe(path.join(financeDir, 'finance', 'metrics_snapshot.json'));
    if (metrics) result.finance = metrics;
  }
  // Also try data/financial_data.json
  if (!result.finance) {
    const raw = readJsonSafe('data/financial_data.json');
    if (raw) {
      result.finance = { receita_total: (raw.receita?.projetos_ativos || 0) + (raw.receita?.novos_fechamentos || 0), ...raw };
    }
  }

  // CEO Advisor latest
  const ceoDir = getMostRecentOutput('ceo');
  if (ceoDir) {
    const decisions = readJsonSafe(path.join(ceoDir, 'ceo', 'decisions.json'));
    if (decisions) result.ceo = decisions;
  }

  // Count executions today
  const base = 'outputs';
  const today = new Date().toISOString().split('T')[0];
  if (fs.existsSync(base)) {
    result.runs = fs.readdirSync(base).filter(d => d.endsWith(today)).length;
  }

  // Leads from data/leads.json
  const leads = readJsonSafe('data/leads.json');
  if (leads) {
    result.leads = {
      total: leads.length,
      high_priority: leads.filter(l => l.score > 50).length,
      reunioes: leads.filter(l => l.etapa === 'reuniao').length,
      propostas: leads.filter(l => l.etapa === 'proposta').length,
      items: leads.slice(0, 20),
    };
  } else {
    result.leads = { total: 0, high_priority: 0, reunioes: 0, propostas: 0, items: [] };
  }

  // Content pipeline — latest output
  const contentDir = getMostRecentOutput('smartops');
  if (contentDir) {
    const layout = readJsonSafe(path.join(contentDir, 'ads', 'layout.json'));
    const caption = readFileSafe(path.join(contentDir, 'copy', 'instagram_caption.txt'));
    const media   = readJsonSafe(path.join(contentDir, 'media_urls.json'));
    result.content = { layout, caption: caption?.slice(0, 300), media_url: media?.instagram_url };
  }

  // Agent statuses (check if script files exist)
  const scripts = [
    { name: 'Marketing Research', file: 'scripts/research.js', squad: 'Marketing' },
    { name: 'Copywriter', file: 'scripts/generate_copy.js', squad: 'Marketing' },
    { name: 'Design Agent', file: 'scripts/generate_ad.js', squad: 'Marketing' },
    { name: 'Proposal Agent', file: 'scripts/proposal_agent.js', squad: 'Sales' },
    { name: 'CEO Advisor', file: 'scripts/ceo_advisor.js', squad: 'Executive' },
    { name: 'Financial Intelligence', file: 'scripts/financial_agent.js', squad: 'Finance' },
  ];
  result.agents = scripts.map(s => ({
    ...s,
    implemented: fs.existsSync(s.file),
  }));

  res.json(result);
});

// ── API: Run agent ────────────────────────────────────────────────────────────
app.post('/api/run-agent', express.json(), (req, res) => {
  const { agent, params = {} } = req.body;
  const allowed = ['ceo_advisor', 'financial_agent', 'research'];
  if (!allowed.includes(agent)) return res.status(400).json({ error: 'Agent not allowed via API' });

  const { execFile } = require('child_process');
  const today = new Date().toISOString().split('T')[0];
  const taskName = `${agent}_dashboard`;
  const scriptPath = path.join('scripts', agent + '.js');

  execFile('node', [scriptPath, '--task', taskName, '--date', today], { cwd: process.cwd() }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: err.message, stderr });
    res.json({ status: 'ok', agent, stdout: stdout.slice(0, 2000) });
  });
});

// ── API: Leads CRUD ───────────────────────────────────────────────────────────
app.get('/api/leads', (req, res) => {
  const leads = readJsonSafe('data/leads.json') || [];
  res.json(leads);
});

app.post('/api/leads', express.json(), (req, res) => {
  const leads = readJsonSafe('data/leads.json') || [];
  const newLead = {
    id: Date.now(),
    created_at: new Date().toISOString(),
    ...req.body,
    etapa: req.body.etapa || 'novo',
    score: req.body.score || 0,
  };
  leads.push(newLead);
  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/leads.json', JSON.stringify(leads, null, 2));
  res.json({ status: 'ok', lead: newLead });
});

app.put('/api/leads/:id', express.json(), (req, res) => {
  const leads = readJsonSafe('data/leads.json') || [];
  const idx = leads.findIndex(l => String(l.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  leads[idx] = { ...leads[idx], ...req.body, id: leads[idx].id };
  fs.writeFileSync('data/leads.json', JSON.stringify(leads, null, 2));
  res.json({ status: 'ok', lead: leads[idx] });
});

app.delete('/api/leads/:id', (req, res) => {
  const leads = (readJsonSafe('data/leads.json') || []).filter(l => String(l.id) !== req.params.id);
  fs.writeFileSync('data/leads.json', JSON.stringify(leads, null, 2));
  res.json({ status: 'ok' });
});

// ── API: Clients CRUD ─────────────────────────────────────────────────────────
app.get('/api/clients', (req, res) => {
  res.json(readJsonSafe('data/clients.json') || []);
});

app.post('/api/clients', express.json(), (req, res) => {
  const clients = readJsonSafe('data/clients.json') || [];
  const c = { id: Date.now(), created_at: new Date().toISOString(), status: 'ativo', semana: 1, ...req.body };
  clients.push(c);
  fs.writeFileSync('data/clients.json', JSON.stringify(clients, null, 2));
  res.json({ status: 'ok', client: c });
});

app.put('/api/clients/:id', express.json(), (req, res) => {
  const clients = readJsonSafe('data/clients.json') || [];
  const idx = clients.findIndex(c => String(c.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  clients[idx] = { ...clients[idx], ...req.body, id: clients[idx].id };
  fs.writeFileSync('data/clients.json', JSON.stringify(clients, null, 2));
  res.json({ status: 'ok', client: clients[idx] });
});

app.delete('/api/clients/:id', (req, res) => {
  const clients = (readJsonSafe('data/clients.json') || []).filter(c => String(c.id) !== req.params.id);
  fs.writeFileSync('data/clients.json', JSON.stringify(clients, null, 2));
  res.json({ status: 'ok' });
});

// ── API: Financial CRUD ───────────────────────────────────────────────────────
app.get('/api/financial', (req, res) => {
  res.json(readJsonSafe('data/financial_data.json') || {});
});

app.put('/api/financial', express.json(), (req, res) => {
  const current = readJsonSafe('data/financial_data.json') || {};
  const updated = { ...current, ...req.body, ultima_atualizacao: new Date().toISOString().split('T')[0] };
  // recalc total receita
  if (updated.receita) {
    updated.receita.total_mensal = Object.values(updated.receita).reduce((s, v) => typeof v === 'number' ? s + v : s, 0) - (updated.receita.total_mensal || 0);
    const r = updated.receita;
    updated.receita.total_mensal = (r.projetos_ativos||0) + (r.novos_fechamentos_mes||0) + (r.parceria_mensal_retainer||0) + (r.outros||0);
  }
  if (updated.receita && updated.custos) {
    const receita = updated.receita.total_mensal || 0;
    const custo   = updated.custos.total_mensal || 0;
    updated.metricas_calculadas = updated.metricas_calculadas || {};
    updated.metricas_calculadas.margem_bruta_pct = receita > 0 ? Math.round((receita - custo) / receita * 100) : 0;
    updated.metricas_calculadas.saude_financeira  = receita === 0 ? 'pre-receita' : receita < custo ? 'critico' : receita < custo * 2 ? 'alerta' : 'saudavel';
  }
  fs.writeFileSync('data/financial_data.json', JSON.stringify(updated, null, 2));
  res.json({ status: 'ok', data: updated });
});

// ── API: Latest outputs listing ────────────────────────────────────────────────
app.get('/api/outputs', (req, res) => {
  const base = 'outputs';
  if (!fs.existsSync(base)) return res.json([]);
  const dirs = fs.readdirSync(base).sort().reverse().slice(0, 20);
  const result = dirs.map(dir => {
    const files = [];
    function walk(d, rel) {
      try {
        fs.readdirSync(d).forEach(f => {
          const full = path.join(d, f), relPath = path.join(rel, f);
          if (fs.statSync(full).isDirectory()) walk(full, relPath);
          else files.push(relPath);
        });
      } catch {}
    }
    walk(path.join(base, dir), '');
    return { dir, files };
  });
  res.json(result);
});

// ── API: Schedule ─────────────────────────────────────────────────────────────
app.get('/api/schedule', (req, res) => {
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  res.json(SCHEDULE.map(j => ({
    name: j.name,
    time: `${String(j.hour).padStart(2,'0')}:${String(j.minute).padStart(2,'0')}`,
    days: j.days.map(d => days[d]).join(', '),
  })));
});

// ── API: Executions log ───────────────────────────────────────────────────────
app.get('/api/executions', (req, res) => {
  const list = readJsonSafe('data/executions.json') || [];
  const limit = parseInt(req.query.limit) || 100;
  res.json(list.slice(0, limit));
});

app.listen(PORT, () => {
  console.log(`\nSmartOps IA — Dashboard Server`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`API:       http://localhost:${PORT}/api/dashboard-data`);
  console.log(`Scheduler: ${SCHEDULE.length} agendamentos ativos\n`);

  // Sincroniza Supabase → data/*.json na inicialização
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    execFile('node', ['scripts/sync_supabase.js'], { cwd: process.cwd(), env: process.env }, (err) => {
      if (err) console.warn('[Startup] sync Supabase falhou — usando dados locais');
      else console.log('[Startup] Supabase sincronizado ✓');
    });
  }
});
