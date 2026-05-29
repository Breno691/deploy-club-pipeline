require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName   = get('--task')   || 'six_sigma';
const taskDate   = get('--date')   || new Date().toISOString().split('T')[0];
const clientName = get('--client') || 'cliente';
const dataFile   = get('--data');  // optional JSON with process data
const phase      = get('--phase')  || 'full'; // define|measure|analyze|improve|control|full

const outputDir    = path.join('outputs', `${taskName}_${taskDate}`);
const sixSigmaDir  = path.join(outputDir, 'six_sigma');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'six_sigma_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runSixSigmaAgent() {
  console.log(`\nSix Sigma Agent — SmartOps IA (DMAIC)`);
  console.log(`Cliente: ${clientName} | Fase: ${phase.toUpperCase()} | Task: ${taskName}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [sixSigmaDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('six_sigma_agent started');

  const processData = dataFile ? readJsonSafe(dataFile) : null;
  const leanOutput  = readFileSafe(path.join(outputDir, 'lean', `vsm_analysis_${clientName.toLowerCase().replace(/\s/g,'_')}.md`));

  const client = new Anthropic();

  appendLog(`Running DMAIC phase: ${phase}`);
  console.log('  → Conduzindo análise DMAIC...');

  const dmaicResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Six Sigma Agent da SmartOps IA. Black Belt certificado conduz análise DMAIC rigorosa.

## CLIENTE: "${clientName}"
## DADOS DO PROCESSO:
${processData ? JSON.stringify(processData, null, 2) : '(sem dados específicos — use abordagem padrão de consultoria Lean Six Sigma para PMEs)'}

## ANÁLISE LEAN ANTERIOR (se disponível):
${leanOutput ? leanOutput.slice(0, 2000) : '(sem análise Lean anterior)'}

## TASK — Análise DMAIC Completa

Gere análise DMAIC em Markdown:

# Análise DMAIC — ${clientName} — ${taskDate}

---

## D — DEFINE (Definir)

### Problem Statement (Declaração do Problema)
[Formato: "No processo de [X], ocorre [problema] que causa [impacto] para [quem]. O objetivo é [meta mensurável] até [prazo]"]

### Project Charter
| Campo | Valor |
|---|---|
| Problema | [descrição] |
| Meta | [target mensurável] |
| Escopo | [o que está IN e OUT of scope] |
| Benefício esperado | R$ X/mês |
| Prazo do projeto | X semanas |

### VOC — Voz do Cliente
[O que o cliente (dono da empresa) reclama? Em suas próprias palavras]

### SIPOC
| Supplier | Input | Process | Output | Customer |
|---|---|---|---|---|
| [quem fornece] | [o que entra] | [processo] | [o que sai] | [quem recebe] |

---

## M — MEASURE (Medir)

### Métricas Baseline (estado atual)
| Métrica | Valor Atual | Meta | Unidade |
|---|---|---|---|
| [métrica 1] | [valor] | [meta] | [unidade] |
| Taxa de defeito/retrabalho | ?% | < 5% | % |
| Lead time | ? | meta | minutos/horas/dias |
| Custo do defeito | R$ ? | R$ meta | R$/mês |

### Sigma Level Estimado
- Defeitos por Oportunidade (DPO): ?
- DPMO (defeitos por milhão): ?
- Sigma Level atual: ? σ
- Sigma Level meta: ? σ

### Plano de Coleta de Dados
[Como coletar os dados que ainda faltam — 3 formas práticas para PME]

---

## A — ANALYZE (Analisar)

### Diagrama de Ishikawa (Causa e Efeito)

**Problema central:** [nome do problema]

**6M — Causas Raiz:**
- **Método:** [causas relacionadas ao processo]
- **Máquina/Sistema:** [causas relacionadas a ferramentas/sistemas]
- **Material:** [causas relacionadas a insumos/informações]
- **Mão de obra:** [causas relacionadas a pessoas]
- **Medição:** [causas relacionadas a como medem]
- **Meio Ambiente:** [causas relacionadas ao ambiente]

### Análise de Pareto — Top 5 Causas

| Rank | Causa | Frequência estimada | % acumulado |
|---|---|---|---|
| 1 | [maior causa] | 40% | 40% |
| 2 | | 25% | 65% |
| 3 | | 15% | 80% |
| 4 | | 10% | 90% |
| 5 | | 10% | 100% |

### Causa Raiz Confirmada
**A causa raiz principal é:** [declaração da causa raiz com evidência]

---

## I — IMPROVE (Melhorar)

### Soluções Propostas (ordenadas por impacto/esforço)

| Solução | Desperdício eliminado | Esforço | Impacto | Custo | Prazo |
|---|---|---|---|---|---|
| [solução 1] | | Baixo | Alto | R$ 0 | 1 sem |
| [solução 2] | | Médio | Alto | R$ X | 2 sem |
| [solução 3] | | Alto | Muito Alto | R$ X | 1 mês |

### Quick Wins (sem custo, implementar em 1 semana)
1. [ação específica]
2. [ação específica]
3. [ação específica]

### Plano de Implementação
| Semana | Ação | Responsável | Entregável |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3-4 | | | |

---

## C — CONTROL (Controlar)

### Plano de Controle
| Etapa | O que medir | Como medir | Frequência | Alerta se |
|---|---|---|---|---|
| [etapa] | [métrica] | [como] | Diário/Semanal | > X |

### SOP — Procedimento Operacional Padrão
[Descreva em 5 passos o novo processo padronizado]

### Indicadores de Sustentação
- KPI 1: [indicador] — meta: [valor] — frequência: [diário/semanal]
- KPI 2: [indicador] — meta: [valor]

---

## RESULTADO ESPERADO

| Antes | Depois | Melhoria |
|---|---|---|
| Sigma: ?σ | Sigma: ?σ | +? σ |
| Retrabalho: ?% | Retrabalho: ?% | -?% |
| Custo extra: R$ ?/mês | Custo extra: R$ ?/mês | -R$ ?/mês |
| ROI do projeto: | | R$ X em Y meses |`,
    }],
  });

  const dmaicMD = dmaicResp.content[0].text.trim();
  appendLog('DMAIC analysis generated');

  // Action plan JSON
  const actionResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Com base nesta análise DMAIC, gere o plano de ação em JSON:
{"causa_raiz":"string","sigma_atual":number,"sigma_meta":number,"quick_wins":[{"acao":"string","prazo_dias":number,"impacto":"string"}],"roi_mensal_estimado":number,"payback_semanas":number}
Retorne APENAS o JSON sem markdown.
DMAIC: ${dmaicMD.slice(0, 2000)}`,
    }],
  });

  let actionPlan = {};
  try {
    const raw = actionResp.content[0].text.trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    actionPlan = JSON.parse(raw);
  } catch { actionPlan = { causa_raiz: 'Ver relatório DMAIC', quick_wins: [] }; }

  const safeClient = clientName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  fs.writeFileSync(path.join(sixSigmaDir, `dmaic_${safeClient}.md`), dmaicMD);
  fs.writeFileSync(path.join(sixSigmaDir, 'action_plan.json'), JSON.stringify({ date: taskDate, client: clientName, ...actionPlan }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ DMAIC: ${path.join(sixSigmaDir, `dmaic_${safeClient}.md`)}`);
  console.log(`  ✓ Plano de ação: action_plan.json`);
  if (actionPlan.causa_raiz) console.log(`  Causa raiz: ${actionPlan.causa_raiz}`);
  if (actionPlan.roi_mensal_estimado) console.log(`  ROI estimado: R$ ${actionPlan.roi_mensal_estimado}/mês`);

  appendLog('six_sigma_agent complete ✓');
}

runSixSigmaAgent().catch(err => {
  console.error('Six Sigma Agent error:', err.message);
  process.exit(1);
});
