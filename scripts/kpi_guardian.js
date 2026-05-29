require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'kpi_guardian';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const kpiDir    = path.join(outputDir, 'kpi_guardian');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'kpi_guardian.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
const getData = require('../lib/data');

function findLatestFile(prefix, subdir, file) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return '';
  const dirs = fs.readdirSync(base).filter(d => d.startsWith(prefix)).sort().reverse();
  return dirs[0] ? readFileSafe(path.join(base, dirs[0], subdir, file)) : '';
}

async function runKpiGuardian() {
  console.log(`\nKPI Guardian Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [kpiDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('kpi_guardian started');

  const [leads, clients, financialData] = await Promise.all([
    getData.getLeads(),
    getData.getClients(),
    getData.getFinancial(),
  ]);

  const riskReport      = findLatestFile('risk', 'risks', 'risk_report.md');
  const revenueReport   = findLatestFile('revenue', 'revenue', 'revenue_report.md');
  const financeReport   = findLatestFile('finance', 'finance', 'financial_report_weekly.md');

  console.log('  → Monitorando todos os KPIs e detectando desvios...');
  appendLog('Generating KPI Guardian report...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o KPI Guardian Agent da SmartOps IA. Monitora todos os indicadores do negócio, detecta o que piorou, e dispara alertas automáticos com ação corretiva imediata.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Data:** ${taskDate}

## DADOS DO NEGÓCIO
- Receita mensal: R$ ${financialData.receita_total || 0}
- Receita recorrente: R$ ${financialData.receita_recorrente || 0}
- Margem bruta: ${financialData.margem_bruta || 0}%
- Leads no pipeline: ${leads.length}
- Clientes ativos: ${clients.length}

## RELATÓRIOS ANTERIORES
${riskReport ? `### Último Relatório de Riscos:\n${riskReport.slice(0, 800)}` : ''}
${revenueReport ? `### Último Revenue Report:\n${revenueReport.slice(0, 800)}` : ''}

---

## TASK — Monitoramento Completo de KPIs

# KPI Guardian Report — SmartOps IA
**${taskDate}**

---

## 1. Painel de Alertas — O Que Piorou Hoje

### 🔴 ALERTAS CRÍTICOS (exige ação imediata)

| KPI | Valor Atual | Referência | Desvio | Alerta |
|---|---|---|---|---|
| [kpi] | [valor] | [meta] | [%] | 🔴 |

### ⚠️ ALERTAS MÉDIOS (monitorar esta semana)

| KPI | Valor Atual | Referência | Desvio | Alerta |
|---|---|---|---|---|
| [kpi] | [valor] | [meta] | [%] | ⚠️ |

### ✅ KPIs SAUDÁVEIS

| KPI | Valor Atual | Meta | Status |
|---|---|---|---|
| [kpi] | [valor] | [meta] | ✅ |

---

## 2. Dashboard Consolidado de KPIs

### Marketing & Conteúdo
| KPI | Meta | Atual | Trend | Alerta |
|---|---|---|---|---|
| Seguidores Instagram | +100/mês | [dado] | [↑↓] | |
| Alcance médio/post | 1.000+ | [dado] | | |
| Engajamento médio | >3% | [dado] | | |
| Conteúdos/semana | 3 | [dado] | | |

### Website & Leads
| KPI | Meta | Atual | Trend | Alerta |
|---|---|---|---|---|
| Visitantes/mês | 500+ | [dado] | | |
| Taxa conversão (visita→lead) | >2% | [dado] | | |
| Leads/mês | 10+ | [dado] | | |
| Custo por lead | <R$ 100 | [dado] | | |

### Vendas
| KPI | Meta | Atual | Trend | Alerta |
|---|---|---|---|---|
| Reuniões/mês | 8+ | [dado] | | |
| Taxa de fechamento | >25% | [dado] | | |
| Ticket médio | R$ 15k+ | [dado] | | |
| Pipeline total | R$ 60k+ | [dado] | | |

### Operações & Clientes
| KPI | Meta | Atual | Trend | Alerta |
|---|---|---|---|---|
| Clientes ativos | 3+ | ${clients.length} | | ${clients.length < 3 ? '🔴' : '✅'} |
| Projetos no prazo | 100% | [dado] | | |
| NPS estimado | >70 | [dado] | | |
| Churn rate | 0% | [dado] | | |

### Financeiro
| KPI | Meta | Atual | Trend | Alerta |
|---|---|---|---|---|
| Receita mensal | R$ 30k | R$ ${financialData.receita_total || 0} | | ${(financialData.receita_total || 0) < 30000 ? '🔴' : '✅'} |
| Margem bruta | ≥60% | ${financialData.margem_bruta || 0}% | | ${(financialData.margem_bruta || 0) < 60 ? '⚠️' : '✅'} |
| LTV:CAC ratio | ≥3x | [calcular] | | |
| Cobertura de caixa | ≥3 meses | [dado] | | |

---

## 3. Análise de Desvio — Por Que os KPIs Estão Assim

### KPI Mais Crítico: [nome]
**Valor esperado:** [X]
**Valor atual:** [Y]
**Desvio:** [%]
**Causa provável:** [análise das causas raiz]
**Impacto financeiro:** R$ [X]/mês se não corrigir

---

## 4. Plano de Ação Corretivo

| # | KPI em Desvio | Ação Corretiva | Responsável | Prazo | Resultado Esperado |
|---|---|---|---|---|---|
| 1 | [kpi] | [ação específica] | Breno | [data] | [resultado] |
| 2 | [kpi] | [ação] | | | |
| 3 | [kpi] | [ação] | | | |

---

## 5. Tendências e Projeções

### Forecast 30 dias (se manter tendência atual)
| KPI | Projeção | Risco |
|---|---|---|
| Receita mensal | R$ [X] | [Alto/Médio/Baixo] |
| Leads/mês | [X] | |
| Clientes ativos | [X] | |

---

## 6. Resumo Executivo para CEO

**O que mais preocupa hoje:**
[Top 3 KPIs em desvio crítico com impacto financeiro]

**O que está funcionando:**
[Top 3 KPIs saudáveis que devem ser mantidos]

**Ação mais urgente:**
[Uma ação específica que o CEO deve tomar hoje]

**Se nada mudar em 30 dias:**
[Consequência do inaction — receita perdida, oportunidade perdida]

---

TÍTULO: KPI Guardian — Monitoramento Completo ${taskDate}
CONTEXTO: Análise de todos os KPIs do negócio SmartOps IA
DADOS ANALISADOS: Receita, leads, clientes, margem, pipeline
PROBLEMA IDENTIFICADO: [principal desvio encontrado]
EVIDÊNCIA: [dado concreto que comprova]
IMPACTO: R$ [X] em receita em risco
RECOMENDAÇÃO: [ação principal]
AÇÃO SUGERIDA: [primeiro passo hoje]
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: Retorno ao target em [X] semanas
RISCO DE NÃO AGIR: Desvio acumula e vira problema estrutural
PRAZO: 7 dias
MÉTRICA DE SUCESSO: Todos os KPIs críticos de volta ao target
PRÓXIMO PASSO: Executar ação corretiva #1 hoje`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('KPI Guardian report generated');

  const summary = {
    date: taskDate,
    total_leads: leads.length,
    total_clients: clients.length,
    receita: financialData.receita_total || 0,
    margem: financialData.margem_bruta || 0,
  };

  fs.writeFileSync(path.join(kpiDir, 'kpi_guardian_report.md'), reportMD);
  fs.writeFileSync(path.join(kpiDir, 'kpi_snapshot.json'), JSON.stringify(summary, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ KPI Guardian Report: ${path.join(kpiDir, 'kpi_guardian_report.md')}`);

  appendLog('kpi_guardian complete ✓');
}

runKpiGuardian().catch(err => {
  console.error('KPI Guardian error:', err.message);
  process.exit(1);
});
