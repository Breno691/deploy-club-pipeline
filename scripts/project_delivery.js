require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'delivery';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const delDir    = path.join(outputDir, 'project_delivery');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'project_delivery.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runProjectDelivery() {
  console.log(`\nProject Delivery Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [delDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('project_delivery started');

  const clients = readJsonSafe('data/clients.json') || [];

  console.log(`  → Monitorando status de entrega de ${clients.length} projetos...\n`);
  appendLog(`Checking delivery status for ${clients.length} projects...`);

  const clientsContext = clients.length > 0
    ? clients.map((c, i) => `Projeto ${i+1}: ${JSON.stringify(c)}`).join('\n')
    : 'Nenhum projeto ativo ainda.';

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Project Delivery Agent da SmartOps IA. Controla a execução de todos os projetos de consultoria, monitora prazos, entregáveis e qualidade, garantindo que cada projeto entregue o ROI prometido na proposta.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Data:** ${taskDate}
**Projetos ativos:** ${clients.length}

## PROJETOS ATIVOS
${clientsContext}

---

# Project Delivery Report — SmartOps IA
**${taskDate}**

---

## 1. Status Geral de Todos os Projetos

| Cliente | Projeto | Semana | % Concluído | Status | Risco | Próxima Entrega |
|---|---|---|---|---|---|---|
${clients.length > 0
  ? clients.map(c => `| ${c.nome || '-'} | ${c.projeto || '-'} | ${c.semana || '-'} | [X]% | [No prazo/Atrasado] | [Baixo/Alto] | [entregável] |`).join('\n')
  : '| _(nenhum projeto ativo)_ | - | - | - | - | - | - |'}

---

## 2. Detalhamento por Projeto

${clients.length > 0 ? clients.map(c => `
### ${c.nome || 'Cliente'} — ${c.projeto || 'Projeto'}

**Semana:** ${c.semana || '?'} | **Início:** ${c.data_inicio || '-'} | **Ticket:** R$ ${c.ticket || 0}
**Status:** [no prazo / ligeiramente atrasado / crítico]

#### Fases do Projeto

| Fase | Descrição | Status | Entrega | Resultado Esperado |
|---|---|---|---|---|
| 1 — Diagnóstico | VSM + coleta de dados | [✅/⏳/🔴] | Semana 2 | Mapa de desperdícios |
| 2 — Análise | Causa raiz + priorização | [✅/⏳/🔴] | Semana 3 | Pareto de problemas |
| 3 — Quick Wins | Implementação imediata | [✅/⏳/🔴] | Semana 5 | -20% retrabalho |
| 4 — Implementação | Mudanças estruturais | [✅/⏳/🔴] | Semana 8 | -30% lead time |
| 5 — Controle | SOP + monitoramento | [✅/⏳/🔴] | Semana 10 | Sustentação |

#### KPIs do Projeto (Before x After)

| Métrica | Baseline | Atual | Meta | % Atingido |
|---|---|---|---|---|
| Lead time | [X dias] | [X dias] | [Y dias] | [Z]% |
| Retrabalho | [X]% | [X]% | [Y]% | [Z]% |
| Desperdício diário | R$ [X] | R$ [X] | R$ [Y] | [Z]% |

#### Risco Principal
[descrição do maior risco atual e plano de mitigação]

#### Próximo Check-in
[data + pauta prevista]
`).join('') : `
*(Adicionar projetos em data/clients.json para monitoramento detalhado)*
`}

---

## 3. Entregas das Próximas 2 Semanas

| Data | Cliente | Entregável | Responsável | Status |
|---|---|---|---|---|
${clients.length > 0 ? clients.map(c => `| [${taskDate}+7d] | ${c.nome || '-'} | [entregável da semana ${(parseInt(c.semana) || 1) + 1}] | Breno | ⬜ A fazer |`).join('\n') : '| _(nenhum)_ | - | - | - | - |'}

---

## 4. Padrão de Qualidade por Entregável

### Checklist de Cada Entregável

**Antes de entregar qualquer documento/resultado:**
- [ ] Dado real coletado (não estimativa)
- [ ] Causa raiz validada com equipe do cliente
- [ ] ROI calculado com premissas explícitas
- [ ] Próximo passo claro e acordado
- [ ] Dono da ação definido (não "equipe")
- [ ] Prazo da próxima entrega confirmado

---

## 5. Retrospectiva de Projetos Concluídos

| Projeto | Resultado Prometido | Resultado Real | NPS | Lição Aprendida |
|---|---|---|---|---|
| [projeto] | [resultado proposta] | [resultado final] | [X/10] | [aprendizado] |

*(Registrar resultados quando projetos forem concluídos)*

---

## 6. Alertas de Risco de Entrega

### 🔴 CRÍTICO — Exige ação hoje
[Alertas críticos se houver]

### ⚠️ ATENÇÃO — Monitorar esta semana
[Alertas de atenção se houver]

---

TÍTULO: Project Delivery — ${taskDate}
CONTEXTO: Status de execução de ${clients.length} projetos SmartOps IA
DADOS ANALISADOS: Semana do projeto, entregas, prazos, KPIs
PROBLEMA IDENTIFICADO: ${clients.length === 0 ? 'Nenhum projeto ativo ainda' : 'Monitoramento de entregas e resultados'}
EVIDÊNCIA: ${clients.length} projetos ativos
IMPACTO: Atraso em entrega afeta NPS e probabilidade de upsell
RECOMENDAÇÃO: ${clients.length > 0 ? 'Verificar status de cada projeto e confirmar próximas entregas' : 'Fechar primeiro projeto para ativar este agente'}
AÇÃO SUGERIDA: Check-in com cada cliente ativo esta semana
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: Projeto no prazo = NPS alto = indicação + upsell
RISCO DE NÃO AGIR: Projeto sem acompanhamento vira insatisfação
PRAZO: Semanal
MÉTRICA DE SUCESSO: 100% das entregas no prazo + NPS > 8 por projeto
PRÓXIMO PASSO: ${clients.length > 0 ? 'Revisar status de cada projeto e enviar update para clientes' : 'Popular data/clients.json ao fechar primeiro projeto'}`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Project delivery report generated');

  fs.writeFileSync(path.join(delDir, 'delivery_report.md'), reportMD);
  fs.writeFileSync(path.join(delDir, 'metadata.json'), JSON.stringify({
    date: taskDate, total_projects: clients.length,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Project Delivery Report: ${path.join(delDir, 'delivery_report.md')}`);
  console.log(`  ✓ ${clients.length} projetos monitorados`);
  appendLog('project_delivery complete ✓');
}

runProjectDelivery().catch(err => {
  console.error('Project Delivery error:', err.message);
  process.exit(1);
});
