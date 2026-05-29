require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'kaizen';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const area      = get('--area')   || 'operacoes_internas';
const client_   = get('--client') || 'SmartOps IA';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const kaizenDir = path.join(outputDir, 'kaizen');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'kaizen.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runKaizenAgent() {
  console.log(`\nKaizen Agent — SmartOps IA`);
  console.log(`Área: ${area} | Cliente: ${client_}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [kaizenDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('kaizen_agent started');

  const brandIdentity = readFileSafe('knowledge/brand_identity.md');

  console.log('  → Gerando plano Kaizen com melhorias contínuas...');
  appendLog(`Generating Kaizen plan for: ${area}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Kaizen Agent da SmartOps IA. Aplica Kaizen (melhoria contínua incremental) para identificar e implementar melhorias de alto impacto com baixo esforço.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Área de melhoria:** ${area.replace(/_/g, ' ')}
**Cliente/contexto:** ${client_}
**Data:** ${taskDate}

---

## TASK — Plano Kaizen

# Kaizen Plan — ${area.replace(/_/g, ' ')}
**${client_} | SmartOps IA | ${taskDate}**

---

## 1. Gemba Walk — Situação Atual

### Processo Atual (como é HOJE)
[Descrição do fluxo atual — passo a passo do que acontece]

### Observações do Gemba
[O que se observa no local — desperdícios visíveis, gargalos, reclamações]

### Os 8 Desperdícios Identificados

| Desperdício | Presente? | Exemplo Concreto | Impacto Estimado |
|---|---|---|---|
| 1. Superprodução | Sim/Não | [exemplo] | [R$/h perdido] |
| 2. Espera | Sim/Não | [exemplo] | |
| 3. Transporte | Sim/Não | [exemplo] | |
| 4. Processamento excessivo | Sim/Não | [exemplo] | |
| 5. Estoque excessivo | Sim/Não | [exemplo] | |
| 6. Movimentação | Sim/Não | [exemplo] | |
| 7. Defeitos/Retrabalho | Sim/Não | [exemplo] | |
| 8. Talento não utilizado | Sim/Não | [exemplo] | |

---

## 2. Matriz de Priorização

| Melhoria | Esforço (1-5) | Impacto (1-10) | Score | Categoria |
|---|---|---|---|---|
| [melhoria A] | [X] | [X] | [impacto/esforço] | 🎯 Quick Win |
| [melhoria B] | [X] | [X] | | 📋 Planejada |
| [melhoria C] | [X] | [X] | | 🚀 Projeto |

**Critério Quick Win:** Esforço ≤ 2 + Impacto ≥ 7

---

## 3. Kanban Board de Melhorias

### 🎯 Quick Wins (fazer esta semana)

| # | Melhoria | Responsável | Tempo | Status |
|---|---|---|---|---|
| 1 | [melhoria] | Breno | 30min | ⬜ A fazer |
| 2 | [melhoria] | | 1h | ⬜ |
| 3 | [melhoria] | | 2h | ⬜ |

### 📋 Melhorias Planejadas (próximas 2 semanas)

| # | Melhoria | Semana | Resultado Esperado |
|---|---|---|---|
| 4 | [melhoria] | Sem 1 | [resultado] |
| 5 | [melhoria] | Sem 2 | |

### 🚀 Projetos Kaizen (próximos 30 dias)

| Projeto | Objetivo | Duração | KPI |
|---|---|---|---|
| [projeto] | [objetivo] | [X dias] | [métrica] |

---

## 4. PDCA — Ciclo de Melhoria

### Plan (Planejar)
**Problema:** [descrição específica]
**Causa raiz (5 Porquês):**
1. Por que o problema ocorre? → [resposta]
2. Por que isso ocorre? → [resposta]
3. Por que isso ocorre? → [resposta]
4. Por que isso ocorre? → [resposta]
5. Causa raiz: [causa raiz real]

**Solução proposta:** [descrição da solução]
**Meta:** [métrica antes → meta]

### Do (Executar)
[Plano de implementação passo a passo]

### Check (Verificar)
**Como medir:** [método + frequência]
**Prazo para avaliação:** [data]

### Act (Agir)
**Se funcionar:** [padronizar — criar SOP]
**Se não funcionar:** [próxima hipótese]

---

## 5. Impacto Acumulado

| Mês | Melhorias Implementadas | Economia/Mês | Economia Acumulada |
|---|---|---|---|
| Mês 1 | [X] melhorias | R$ [X] | R$ [X] |
| Mês 2 | [X] | R$ [X] | R$ [X] |
| Mês 3 | [X] | R$ [X] | R$ [X] |

**ROI do Kaizen:** [X]x em 3 meses

---

## 6. Cultura Kaizen

**Reunião Kaizen (15 min/dia):**
\`\`\`
1. O que melhorou ontem?
2. Qual o maior problema de hoje?
3. Quem resolve? Quando?
\`\`\`

**Registro de Melhorias:**
[Onde registrar (planilha/notion) e como celebrar victories]`,
    }],
  });

  const kaizenMD = resp.content[0].text.trim();
  appendLog('Kaizen plan generated');

  const safeArea = area.replace(/\s+/g, '_');
  fs.writeFileSync(path.join(kaizenDir, `kaizen_plan_${safeArea}.md`), kaizenMD);
  fs.writeFileSync(path.join(kaizenDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    area,
    client: client_,
    file: `kaizen_plan_${safeArea}.md`,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Plano Kaizen: ${path.join(kaizenDir, `kaizen_plan_${safeArea}.md`)}`);

  appendLog('kaizen_agent complete ✓');
}

runKaizenAgent().catch(err => {
  console.error('Kaizen Agent error:', err.message);
  process.exit(1);
});
