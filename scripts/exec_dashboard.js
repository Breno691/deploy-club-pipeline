require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'exec_dashboard';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const mode      = get('--mode') || 'daily'; // daily | weekly | monthly
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const dashDir   = path.join(outputDir, 'exec_dashboard');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'exec_dashboard.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

function findLatest(prefix, subdir, file) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return '';
  const dirs = fs.readdirSync(base).filter(d => d.startsWith(prefix)).sort().reverse();
  return dirs[0] ? readFileSafe(path.join(base, dirs[0], subdir, file)) : '';
}

function findLatestJSON(prefix, subdir, file) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return null;
  const dirs = fs.readdirSync(base).filter(d => d.startsWith(prefix)).sort().reverse();
  return dirs[0] ? readJsonSafe(path.join(base, dirs[0], subdir, file)) : null;
}

async function runExecDashboard() {
  console.log(`\nExecutive Dashboard Agent — SmartOps IA`);
  console.log(`Modo: ${mode} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [dashDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('exec_dashboard started');

  const leads     = readJsonSafe('data/leads.json') || [];
  const clients   = readJsonSafe('data/clients.json') || [];
  const finances  = findLatestJSON('finance', 'finance', 'metrics_snapshot.json');
  const risks     = findLatestJSON('risk', 'risks', 'risks.json');
  const strategy  = findLatest('strateg', 'strategy', 'plan_90d.md');
  const ceo       = findLatest('ceo', 'ceo', 'executive_action_plan.md');
  const sales     = findLatest('sales', 'sales', 'sales_report.md');
  const seo       = findLatest('seo', 'seo', 'seo_report.md');
  const competitor = findLatest('competitor', 'competitor', 'competitor_report.md');

  console.log('  → Consolidando KPIs de todos os squads...');
  appendLog(`Generating ${mode} executive dashboard...`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Executive Dashboard Agent da SmartOps IA. Consolida KPIs de todos os squads e gera visão executiva para decisão rápida.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Modo:** ${mode} | **Data:** ${taskDate}

## DADOS POR SQUAD

### SQUAD VENDAS
- Leads no pipeline: ${leads.length}
- Leads hot (score > 70): ${leads.filter(l => (l.score || 0) > 70).length}
- Clientes ativos: ${clients.length}

### SQUAD FINANÇAS
${finances ? `- Receita: R$ ${finances.receita_total || 0}\n- Margem bruta: ${finances.margem_bruta || 0}%\n- Saúde financeira: ${finances.saude || 'desconhecida'}` : '- Sem dados financeiros'}

### SQUAD RISCO
${risks ? `- Total de riscos: ${risks.total_risks || 0}\n- Críticos: ${risks.critical || 0}` : '- Sem relatório de riscos recente'}

### SQUAD MARKETING
${seo ? '- SEO: relatório disponível' : '- SEO: sem relatório'}

### SQUAD COMPETIÇÃO
${competitor ? '- Inteligência competitiva: relatório disponível' : '- Sem relatório de concorrentes'}

### CEO ADVISOR
${ceo ? ceo.slice(0, 500) : '(sem briefing recente)'}

---

## TASK — Dashboard Executivo ${mode.toUpperCase()}

# Executive Dashboard — SmartOps IA
**${mode === 'daily' ? 'Briefing Diário' : mode === 'weekly' ? 'Relatório Semanal' : 'Relatório Mensal'}**
**Data:** ${taskDate}

---

## 🎯 Status Geral: [VERDE / AMARELO / VERMELHO]

**Resumo em 1 linha:** [O que está acontecendo com a SmartOps IA hoje em termos de negócio]

---

## 📊 KPIs Executivos

| Área | Métrica | Valor | Meta | Status |
|---|---|---|---|---|
| Vendas | Leads no pipeline | ${leads.length} | 10+ | ${leads.length >= 10 ? '✅' : leads.length >= 5 ? '⚠️' : '🔴'} |
| Vendas | Clientes ativos | ${clients.length} | 3+ | ${clients.length >= 3 ? '✅' : clients.length >= 1 ? '⚠️' : '🔴'} |
| Financeiro | Receita mensal | R$ ${finances?.receita_total || 0} | R$ 10k+ | ${(finances?.receita_total || 0) >= 10000 ? '✅' : '🔴'} |
| Financeiro | Margem bruta | ${finances?.margem_bruta || 0}% | ≥ 60% | ${(finances?.margem_bruta || 0) >= 60 ? '✅' : '⚠️'} |
| Risco | Alertas críticos | ${risks?.critical || 0} | 0 | ${(risks?.critical || 0) === 0 ? '✅' : '🔴'} |
| Marketing | Posts publicados/sem | [X] | 3 | [status] |

---

## 📈 Tendência por Squad

### SQUAD 1 — MARKETING
[Status + 1 insight + 1 ação]

### SQUAD 2 — GROWTH
[Status + 1 insight + 1 ação]

### SQUAD 3 — OPERATIONS
[Status de automações + pipelines ativos]

### SQUAD 4 — SALES
- Pipeline: ${leads.length} leads | ${leads.filter(l => (l.score || 0) > 70).length} hot
- [Próxima ação comercial prioritária]

### SQUAD 5 — EXECUTIVE
[Decisões pendentes]

---

## 🚨 Alertas e Prioridades

| Prioridade | Alerta | Impacto | Ação Imediata |
|---|---|---|---|
| 🔴 Alta | [alerta 1] | [impacto] | [ação hoje] |
| ⚠️ Média | [alerta 2] | | [ação esta semana] |

---

## ✅ Conquistas ${mode === 'daily' ? 'de Hoje' : mode === 'weekly' ? 'da Semana' : 'do Mês'}

[O que foi concluído — para celebrar e manter motivação]

---

## 🎯 Foco de Amanhã / Próxima Semana

| Prioridade | Ação | Responsável | Meta |
|---|---|---|---|
| 1 | [ação mais importante] | Breno | [resultado] |
| 2 | [segunda ação] | Breno | |
| 3 | [terceira ação] | Breno/Sistema | |

---

## 📅 Agenda Estratégica

${mode === 'weekly' ? `| Dia | Foco | Atividade Principal |
|---|---|---|
| Segunda | Vendas | Abordar leads hot |
| Terça | Conteúdo | Publicar + engajar |
| Quarta | Clientes | Check-ins ativos |
| Quinta | Conteúdo + Admin | |
| Sexta | Estratégia + Retrospectiva | |` : '[agenda do dia]'}`,
    }],
  });

  const dashMD = resp.content[0].text.trim();
  appendLog('Executive dashboard generated');

  const kpis = {
    date: taskDate,
    mode,
    squads: {
      sales: { leads: leads.length, hot_leads: leads.filter(l => (l.score || 0) > 70).length, clients: clients.length },
      finance: { receita: finances?.receita_total || 0, margem: finances?.margem_bruta || 0 },
      risk: { critical: risks?.critical || 0, total: risks?.total_risks || 0 },
    },
  };

  fs.writeFileSync(path.join(dashDir, `exec_dashboard_${mode}.md`), dashMD);
  fs.writeFileSync(path.join(dashDir, 'kpis_snapshot.json'), JSON.stringify(kpis, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Dashboard executivo: ${path.join(dashDir, `exec_dashboard_${mode}.md`)}`);
  console.log(`  ✓ KPIs: leads=${kpis.squads.sales.leads} | clientes=${kpis.squads.sales.clients} | receita=R$${kpis.squads.finance.receita}`);

  appendLog('exec_dashboard complete ✓');
}

runExecDashboard().catch(err => {
  console.error('Exec Dashboard error:', err.message);
  process.exit(1);
});
