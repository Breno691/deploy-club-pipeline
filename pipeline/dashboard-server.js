require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3100;

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

app.listen(PORT, () => {
  console.log(`\nSmartOps IA — Dashboard Server`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`API:       http://localhost:${PORT}/api/dashboard-data\n`);
});
