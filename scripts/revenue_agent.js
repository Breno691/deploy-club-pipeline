require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'revenue';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const revDir    = path.join(outputDir, 'revenue');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'revenue.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
const getData = require('../lib/data');

function findLatestJSON(prefix, subdir, file) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return null;
  const dirs = fs.readdirSync(base).filter(d => d.startsWith(prefix)).sort().reverse();
  return dirs[0] ? readJsonSafe(path.join(base, dirs[0], subdir, file)) : null;
}

async function runRevenueAgent() {
  console.log(`\nRevenue Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [revDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('revenue_agent started');

  const [leads, clients, financialData_] = await Promise.all([
    getData.getLeads(),
    getData.getClients(),
    getData.getFinancial(),
  ]);
  const financialData = financialData_;
  const financeMetrics = findLatestJSON('finance', 'finance', 'metrics_snapshot.json');

  const revenueData = financialData || financeMetrics || {
    receita_total: 0,
    receita_recorrente: 0,
    receita_projeto: 0,
    cac: 0,
    ltv: 0,
    margem_bruta: 0,
    receita_por_canal: {},
  };

  console.log('  → Analisando receita, CAC, LTV e atribuição por canal...');
  appendLog('Generating revenue analysis...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Revenue Agent da SmartOps IA. Analisa receita por canal, atribuição, CAC, LTV e gera estratégia de crescimento de receita.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Data:** ${taskDate}

## DADOS FINANCEIROS
- Receita total atual: R$ ${revenueData.receita_total || 0}
- Receita recorrente: R$ ${revenueData.receita_recorrente || 0}/mês
- Receita por projetos: R$ ${revenueData.receita_projeto || 0}
- Margem bruta: ${revenueData.margem_bruta || 0}%
- CAC atual: R$ ${revenueData.cac || 0}
- LTV estimado: R$ ${revenueData.ltv || 0}
- Clientes ativos: ${clients.length}
- Leads no pipeline: ${leads.length}

---

## TASK — Análise de Receita

# Revenue Intelligence — SmartOps IA
**Data:** ${taskDate}

---

## 1. Painel de Receita

### Receita Atual

| Métrica | Valor | Status | Benchmark |
|---|---|---|---|
| Receita mensal total | R$ ${revenueData.receita_total || 0} | ${(revenueData.receita_total || 0) >= 10000 ? '✅' : '🔴'} | R$ 10k+ |
| Receita recorrente | R$ ${revenueData.receita_recorrente || 0}/mês | ${(revenueData.receita_recorrente || 0) > 0 ? '✅' : '🔴'} | > 30% total |
| Margem bruta | ${revenueData.margem_bruta || 0}% | ${(revenueData.margem_bruta || 0) >= 60 ? '✅' : '⚠️'} | ≥ 60% |
| Clientes ativos | ${clients.length} | ${clients.length >= 3 ? '✅' : '🔴'} | 3+ |

---

## 2. Receita por Canal

| Canal | Receita Atual | % do Total | Meta | Gap |
|---|---|---|---|---|
| Indicação direta | R$ [X] | [X]% | 40% | |
| LinkedIn | R$ [X] | [X]% | 20% | |
| Instagram | R$ [X] | [X]% | 15% | |
| WhatsApp outbound | R$ [X] | [X]% | 15% | |
| Parceiros | R$ [X] | [X]% | 10% | |
| **Total** | **R$ ${revenueData.receita_total || 0}** | **100%** | | |

---

## 3. Análise de LTV e CAC

### Cálculo de CAC

| Canal | Leads | Clientes | Custo | CAC |
|---|---|---|---|---|
| Orgânico (Instagram/LinkedIn) | [X] | [X] | R$ [tempo] | R$ [X] |
| WhatsApp outbound | [X] | [X] | R$ [tempo] | R$ [X] |
| Indicação | [X] | [X] | R$ [comissão] | R$ [X] |
| **Médio** | | | | **R$ ${revenueData.cac || 500}** |

### Cálculo de LTV

| Tipo de cliente | Ticket médio/projeto | Projetos/ano | LTV 2 anos |
|---|---|---|---|
| PME Pequena | R$ 8-15k | 1-2 | R$ 16-30k |
| PME Média | R$ 15-35k | 2-3 | R$ 60-100k |
| Com retainer | R$ 3-5k/mês | Recorrente | R$ 72-120k |
| **LTV médio estimado** | | | **R$ ${revenueData.ltv || 25000}** |

**Relação LTV:CAC atual:** ${revenueData.cac > 0 ? (revenueData.ltv / revenueData.cac).toFixed(1) : '[calcular]'}x (meta: ≥ 3x)

---

## 4. Forecast de Receita

| Cenário | Premissas | Receita Mês 1 | Receita Mês 3 | Receita Mês 6 |
|---|---|---|---|---|
| Conservador | 1 cliente/mês, ticket médio R$ 12k | R$ 12k | R$ 36k | R$ 72k |
| Base | 2 clientes/mês + 1 retainer | R$ 27k | R$ 54k | R$ 108k |
| Otimista | 3+ clientes + 3 retainers | R$ 44k | R$ 88k | R$ 176k |

---

## 5. Mix de Receita Ideal (Meta 6 Meses)

\`\`\`
Receita Total Alvo: R$ 30.000/mês

Projeto Lean (R$ 15k × 1)      = R$ 15.000 (50%)
Projeto Six Sigma (R$ 25k × ½)  = R$ 12.500 (42%)
Retainers (R$ 2.5k × 1)        = R$ 2.500  (8%)
\`\`\`

---

## 6. Estratégia de Crescimento de Receita

### Alavancas Prioritárias

| Alavanca | Impacto na Receita | Prazo | Ação |
|---|---|---|---|
| Criar receita recorrente (retainer) | +R$ 5-15k/mês | 60 dias | Oferecer pós-projeto |
| Aumentar ticket médio | +30-50% | 30 dias | Pacote Premium + IA |
| Acelerar pipeline (diagnóstico) | +1-2 clientes/mês | 30 dias | 5 diagnósticos/semana |
| Parcerias de indicação | +2 leads/mês | 45 dias | 3 parceiros ativos |

---

## 7. Próximas Ações de Revenue

1. **Hoje:** [ação mais impactante na receita]
2. **Esta semana:** [criar oferta de retainer mensal]
3. **Este mês:** [meta de receita + plano para atingir]

---

## 8. Dashboard de Revenue (atualizar semanalmente)

| Semana | Reuniões | Propostas | Contratos | Receita Nova |
|---|---|---|---|---|
| Atual | 0 | 0 | 0 | R$ 0 |
| Meta | 3 | 2 | 1 | R$ 12k+ |`,
    }],
  });

  const revMD = resp.content[0].text.trim();
  appendLog('Revenue analysis generated');

  const snapshot = {
    date: taskDate,
    receita_total: revenueData.receita_total || 0,
    receita_recorrente: revenueData.receita_recorrente || 0,
    margem: revenueData.margem_bruta || 0,
    cac: revenueData.cac || 0,
    ltv: revenueData.ltv || 0,
    total_leads: leads.length,
    total_clients: clients.length,
  };

  fs.writeFileSync(path.join(revDir, 'revenue_report.md'), revMD);
  fs.writeFileSync(path.join(revDir, 'revenue_snapshot.json'), JSON.stringify(snapshot, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Revenue Report: ${path.join(revDir, 'revenue_report.md')}`);
  console.log(`  ✓ Receita: R$ ${snapshot.receita_total} | Margem: ${snapshot.margem}% | LTV: R$ ${snapshot.ltv}`);

  appendLog('revenue_agent complete ✓');
}

runRevenueAgent().catch(err => {
  console.error('Revenue Agent error:', err.message);
  process.exit(1);
});
