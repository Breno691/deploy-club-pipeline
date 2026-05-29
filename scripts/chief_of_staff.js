require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || 'chief_of_staff';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const decisionFile = get('--decisions') || null;
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const cosDir = path.join(outputDir, 'chief_of_staff');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'chief_of_staff.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
const getData = require('../lib/data');

function findLatestOutput(prefix, subdir, file) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return '';
  const dirs = fs.readdirSync(base).filter(d => d.startsWith(prefix)).sort().reverse();
  return dirs[0] ? readFileSafe(path.join(base, dirs[0], subdir, file)) : '';
}

async function runChiefOfStaff() {
  console.log(`\nChief of Staff Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [cosDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('chief_of_staff started');

  const brandIdentity  = readFileSafe('knowledge/brand_identity.md');
  const salesPlaybook  = readFileSafe('knowledge/sales_playbook.md');
  const [leads, clients] = await Promise.all([
    getData.getLeads(),
    getData.getClients(),
  ]);

  const ceoReport      = findLatestOutput('ceo', 'ceo', 'executive_action_plan.md');
  const strategyReport = findLatestOutput('strateg', 'strategy', 'plan_90d.md');
  const riskReport     = findLatestOutput('risk', 'risks', 'risk_report.md');

  const manualDecisions = decisionFile ? readFileSafe(decisionFile) : '';

  console.log('  → Transformando decisões em plano de execução...');
  appendLog('Generating execution plan...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    messages: [{
      role: 'user',
      content: `Você é o Chief of Staff da SmartOps IA. Transforma decisões estratégicas em tarefas concretas e acionáveis.

## CONTEXTO — SmartOps IA (${taskDate})

**Empresa:** SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Leads no pipeline:** ${leads.length} | **Clientes ativos:** ${clients.length}

## DECISÕES E BRIEFING DO CEO
${ceoReport ? ceoReport.slice(0, 1200) : '(sem briefing do CEO disponível — usar estado atual do negócio)'}

## CONTEXTO ESTRATÉGICO
${strategyReport ? strategyReport.slice(0, 600) : '(sem plano estratégico disponível)'}

## ALERTAS DE RISCO
${riskReport ? riskReport.slice(0, 400) : '(sem relatório de riscos disponível)'}

## DECISÕES MANUAIS DO DIA
${manualDecisions || '(nenhuma decisão manual fornecida — basear no briefing do CEO)'}

---

## TASK — Plano de Execução do Chief of Staff

Gere plano de execução completo em Markdown seguindo o formato:

# Chief of Staff — Plano de Execução
**Data:** ${taskDate}

---

## Resumo Executivo
[2-3 frases: o que precisa acontecer hoje/esta semana e por quê]

---

## Tarefas de Hoje (Prioridade 1)

| # | Tarefa | Responsável | Tempo | Deadline | Resultado Esperado |
|---|---|---|---|---|---|
| 1 | [tarefa mais crítica] | Breno | Xmin | HH:MM | [resultado mensurável] |
| 2 | [segunda tarefa] | Breno | | | |
| 3 | [terceira tarefa] | Breno | | | |

---

## Tarefas da Semana (Prioridade 2)

| # | Tarefa | Categoria | Prazo | OKR Vinculado |
|---|---|---|---|---|
| 1 | [tarefa semanal 1] | Vendas | [data] | [qual OKR] |
| 2 | [tarefa semanal 2] | Marketing | | |
| 3 | [tarefa semanal 3] | Operações | | |

---

## Bloqueios e Dependências

| Tarefa Bloqueada | Bloqueio | Quem Resolve | Urgência |
|---|---|---|---|
| [tarefa] | [o que está bloqueando] | Breno | Alta/Média |

---

## Delegações e Automações

[O que pode ser automatizado via n8n ou delegado para os agentes de IA — com instrução exata]

| Item | Tipo | Ação no Sistema | Status |
|---|---|---|---|
| Pesquisa de concorrentes | Automação | npm run competitor | 🤖 Pode rodar agora |
| Pipeline de leads | Dados | Popular data/leads.json | 📋 Manual |

---

## Métricas de Acompanhamento

| Métrica | Valor Atual | Meta Hoje | Meta Semana |
|---|---|---|---|
| Leads abordados | 0 | 5 | 20 |
| Reuniões agendadas | 0 | 1 | 3 |
| Propostas enviadas | 0 | 1 | 2 |

---

## Comunicação Prioritária

[Mensagens/contatos que precisam de resposta ou ação hoje, com template]

---

## Checkpoint do Dia (revisar às 18h)

- [ ] Tarefa 1 concluída?
- [ ] Tarefa 2 concluída?
- [ ] Leads abordados?
- [ ] Registro atualizado?

---

## Amanhã: 3 Primeiras Ações

1. [primeira ação de amanhã]
2. [segunda ação]
3. [terceira ação]`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Execution plan generated');

  const tasksResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Extraia as tarefas deste plano em JSON:
{"data":"${taskDate}","tarefas_hoje":[{"id":1,"tarefa":"string","categoria":"string","tempo_min":number,"deadline":"string","resultado":"string"}],"tarefas_semana":[{"tarefa":"string","categoria":"string"}],"metricas":{"leads_meta_hoje":number,"reunioes_meta_hoje":number}}
Retorne APENAS o JSON sem markdown.
PLANO: ${reportMD.slice(0, 2000)}`,
    }],
  });

  let tasksJSON = { data: taskDate, tarefas_hoje: [], tarefas_semana: [] };
  try {
    const raw = tasksResp.content[0].text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    tasksJSON = JSON.parse(raw);
  } catch { /* use default */ }

  fs.writeFileSync(path.join(cosDir, 'execution_plan.md'), reportMD);
  fs.writeFileSync(path.join(cosDir, 'tasks.json'), JSON.stringify(tasksJSON, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Plano: ${path.join(cosDir, 'execution_plan.md')}`);
  console.log(`  ✓ Tarefas hoje: ${tasksJSON.tarefas_hoje?.length || 0}`);
  tasksJSON.tarefas_hoje?.slice(0, 3).forEach((t, i) => console.log(`    ${i + 1}. ${t.tarefa}`));

  appendLog('chief_of_staff complete ✓');
}

runChiefOfStaff().catch(err => {
  console.error('Chief of Staff error:', err.message);
  process.exit(1);
});
