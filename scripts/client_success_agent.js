require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'client_success';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const csDir     = path.join(outputDir, 'client_success');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'client_success.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runClientSuccessAgent() {
  console.log(`\nClient Success Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [csDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('client_success_agent started');

  const clients      = readJsonSafe('data/clients.json') || [];
  const brandIdentity = readFileSafe('knowledge/brand_identity.md');

  console.log('  → Analisando saúde dos clientes e riscos de churn...');
  appendLog(`Analyzing ${clients.length} clients for churn risk...`);

  const clientSummary = clients.length > 0
    ? clients.map(c => `- **${c.nome || c.name || 'Cliente'}**: status=${c.status || 'ativo'}, projeto=${c.projeto || 'N/A'}, inicio=${c.data_inicio || 'N/A'}, ultimo_contato=${c.ultimo_contato || 'N/A'}`).join('\n')
    : '(sem clientes cadastrados em data/clients.json — análise baseada em PMEs típicas)';

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    messages: [{
      role: 'user',
      content: `Você é o Client Success Agent da SmartOps IA. Monitora saúde dos clientes, previne churn, maximiza satisfação e identifica oportunidades de upsell.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Clientes ativos:** ${clients.length}
**Data:** ${taskDate}

## CLIENTES
${clientSummary}

---

## TASK — Dashboard de Client Success

# Client Success — SmartOps IA
**Data:** ${taskDate}

---

## 1. Painel de Saúde dos Clientes

| Cliente | Projeto | Semana | NPS Est. | Churn Risk | Health Score | Ação |
|---|---|---|---|---|---|---|
${clients.length > 0
  ? clients.map(c => `| ${c.nome || 'Cliente'} | ${c.projeto || 'N/A'} | ${c.semana || '?'} | [X]/10 | Baixo/Médio/Alto | [X]/10 | [ação] |`).join('\n')
  : '| (Sem clientes) | — | — | — | — | — | Fechar 1º cliente |'}

---

## 2. Clientes em Risco de Churn

[Para cada cliente com health score < 7 ou risco alto — análise + plano de ação]

### Sinais de Alerta por Cliente
| Sinal | Indica | Ação Imediata |
|---|---|---|
| Não responde em 72h | Desengajamento | Ligar — não só WhatsApp |
| Questiona o valor | Insatisfação com resultado | Check-in de progresso urgente |
| Pede desconto | Pressão financeira | ROI call — mostrar números |
| Silêncio total | Risco crítico | Visita presencial |

---

## 3. Oportunidades de Upsell/Expansão

| Cliente | Projeto Atual | Oportunidade | Abordagem | Valor Est. |
|---|---|---|---|---|
${clients.length > 0
  ? clients.map(c => `| ${c.nome || 'Cliente'} | ${c.projeto || ''} | [próxima fase ou serviço adicional] | [quando abordar] | R$ [X] |`).join('\n')
  : '| (Primeiro cliente) | — | Retainer mensal após 1º projeto | Semana 10 do projeto | R$ 3-5k/mês |'}

---

## 4. Calendário de Touchpoints

| Frequência | Ação | Canal | Objetivo |
|---|---|---|---|
| Semanal | Check-in de progresso | WhatsApp | Validar entregáveis |
| Quinzenal | Reunião de acompanhamento | Video/presencial | Alinhamento + problemas |
| Mensal | Relatório de resultados | Email/PDF | Mostrar ROI acumulado |
| Por projeto | NPS survey | WhatsApp | Medir satisfação |
| Final de projeto | Review + upsell | Presencial | Renovação/expansão |

---

## 5. Templates de Comunicação

### Check-in Semanal (WhatsApp)
\`\`\`
Olá [Nome]! Breno aqui.

Semana [X] do projeto — tudo correndo bem?

Principais avanços desta semana:
✅ [entregável 1]
✅ [entregável 2]

Alguma dúvida ou precisando de algo?
\`\`\`

### ROI Call (quando cliente questiona valor)
\`\`\`
[Nome], deixa eu mostrar os números até agora:

📊 Antes: [métrica] era [X]
📊 Hoje: [métrica] está em [Y]
📊 Economia gerada: R$ [Z]/mês

O projeto já se pagou [X]% — e ainda temos [Y] semanas de projeto.
\`\`\`

---

## 6. Métricas de Client Success

| Métrica | Atual | Meta |
|---|---|---|
| NPS médio | — | ≥ 70 |
| Churn rate | ${clients.length === 0 ? '0% (sem clientes)' : '—'} | < 10%/trimestre |
| Upsell rate | — | ≥ 40% |
| Tempo médio de contrato | — | ≥ 6 meses |
| Receita de expansão | — | ≥ 30% da receita total |

---

## 7. Próximas Ações de CS

1. [Ação 1 — urgente]
2. [Ação 2 — esta semana]
3. [Ação 3 — este mês]`,
    }],
  });

  const csMD = resp.content[0].text.trim();
  appendLog('Client success report generated');

  const churnRisks = clients.filter(c => c.status === 'risco' || c.churn_risk === true);

  fs.writeFileSync(path.join(csDir, 'cs_report.md'), csMD);
  fs.writeFileSync(path.join(csDir, 'metrics.json'), JSON.stringify({
    date: taskDate,
    total_clients: clients.length,
    clients_at_risk: churnRisks.length,
    file: 'cs_report.md',
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Relatório CS: ${path.join(csDir, 'cs_report.md')}`);
  console.log(`  ✓ Clientes: ${clients.length} | Em risco: ${churnRisks.length}`);

  appendLog('client_success_agent complete ✓');
}

runClientSuccessAgent().catch(err => {
  console.error('Client Success Agent error:', err.message);
  process.exit(1);
});
