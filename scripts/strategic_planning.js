require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task')     || 'strategic_plan';
const taskDate = get('--date')     || new Date().toISOString().split('T')[0];
const horizon  = get('--horizon')  || '90'; // 30 | 90 | 180
const outputDir      = path.join('outputs', `${taskName}_${taskDate}`);
const strategyDir    = path.join(outputDir, 'strategy');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'strategic_planning.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runStrategicPlanning() {
  console.log(`\nStrategic Planning Agent — SmartOps IA`);
  console.log(`Horizonte: ${horizon} dias | Task: ${taskName}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [strategyDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('strategic_planning started');

  // Collect current state from available data
  const leads       = readJsonSafe('data/leads.json') || [];
  const financials  = (() => {
    const base = 'outputs';
    if (!fs.existsSync(base)) return null;
    const dirs = fs.readdirSync(base).filter(d => d.startsWith('finance')).sort().reverse();
    if (!dirs[0]) return null;
    return readJsonSafe(path.join(base, dirs[0], 'finance', 'metrics_snapshot.json'));
  })();
  const ceoActions  = (() => {
    const base = 'outputs';
    if (!fs.existsSync(base)) return null;
    const dirs = fs.readdirSync(base).filter(d => d.startsWith('ceo')).sort().reverse();
    if (!dirs[0]) return null;
    return readFileSafe(path.join(base, dirs[0], 'ceo', 'executive_action_plan.md'));
  })();

  const client = new Anthropic();
  appendLog(`Generating ${horizon}-day strategic plan...`);
  console.log(`  → Gerando plano estratégico de ${horizon} dias...`);

  const planResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Strategic Planning Agent da SmartOps IA.

**Contexto:** SmartOps IA é a consultoria de Breno Luiz — Black Belt Lean Six Sigma. Consultoria Lean + Automação com IA para PMEs em BH. Empresa nova, sem clientes ainda, construindo pipeline.

**Data atual:** ${taskDate}
**Horizonte do plano:** ${horizon} dias

## SITUAÇÃO ATUAL

**Leads:** ${leads.length} leads em data/leads.json
**Leads Alta Prioridade:** ${leads.filter(l => (l.score || 0) > 50).length}
**Receita:** ${financials ? `R$ ${financials.receita_total || 0}` : 'R$ 0 (sem dados)'}

**Últimas decisões do CEO Advisor:**
${ceoActions ? ceoActions.slice(0, 800) : '(sem briefing recente)'}

## TASK — Plano Estratégico ${horizon} Dias

Gere plano estratégico detalhado em Markdown:

# Plano Estratégico SmartOps IA — ${horizon} Dias
**Data:** ${taskDate} | **Horizonte:** até ${addDays(taskDate, parseInt(horizon))}

---

## Visão do Período
[Em 2-3 frases: onde a SmartOps IA estará em ${horizon} dias se o plano for executado]

---

## OKRs — Objectives and Key Results

### OKR 1 — Receita & Clientes
**Objective:** [objetivo ambicioso mas possível]
- KR 1: ${horizon <= 30 ? 'Fechar 1 cliente pagante' : horizon <= 90 ? 'Fechar 3-5 clientes pagantes' : 'Atingir R$ 30k/mês de receita'}
- KR 2: [key result 2 com número]
- KR 3: [key result 3 com número]

### OKR 2 — Pipeline & Marketing
**Objective:** Construir pipeline previsível de leads qualificados
- KR 1: ${horizon <= 30 ? '10 diagnósticos gratuitos realizados' : '30+ diagnósticos realizados'}
- KR 2: [KR com número de seguidores ou engajamento]
- KR 3: [KR de taxa de conversão]

### OKR 3 — Produto & Metodologia
**Objective:** Consolidar e documentar a metodologia SmartOps IA
- KR 1: [KR de documentação/SOPs]
- KR 2: [KR de automação implementada]

---

## Plano por Fase

${horizon >= 30 ? `### Fase 1 — Dias 1-30: VALIDAÇÃO
**Meta:** Fechar primeiro cliente pagante. Provar que o modelo funciona.
| Semana | Foco | Ação Principal | Meta |
|---|---|---|---|
| Sem 1 | Geração de leads | Abordar 20 donos de PME via WhatsApp | 5 respostas |
| Sem 2 | Diagnósticos | Realizar 3+ diagnósticos gratuitos | 3 realizados |
| Sem 3 | Proposta | Enviar 2 propostas personalizadas | 2 enviadas |
| Sem 4 | Fechamento | Seguir GPCTBA + quebrar objeções | 1 contrato |` : ''}

${horizon >= 90 ? `
### Fase 2 — Dias 31-90: CRESCIMENTO
**Meta:** Escalar para 3-5 clientes. Construir reputação em BH.
| Mês 2 | Foco | Ação |
|---|---|---|
| Marketing | Publicar resultado do 1º cliente (prova social) | Case study + post |
| Vendas | Pipeline de 15+ leads qualificados | Score > 50 cada |
| Produto | Criar template de SOPs por segmento | 3 setores |

| Mês 3 | Foco | Ação |
|---|---|---|
| Escala | 3+ projetos em andamento | Parceria recorrente |
| Autoridade | 1 palestra ou conteúdo viral | LinkedIn/Instagram |
| Financeiro | Margem bruta > 60% em todos os projetos | |` : ''}

${horizon >= 180 ? `
### Fase 3 — Dias 91-180: ESCALA
**Meta:** Posicionar como referência Lean + IA em BH. Receita recorrente.
- Meta de receita: R$ 30k+/mês
- Clientes ativos: 5-8
- Parceiros: 2+ indicadores ativos
- Presença digital: 1.000+ seguidores engajados
- Produto: 1 serviço digitalizado (SOP + automação pronto para vender)` : ''}

---

## Riscos e Plano de Contingência

| Risco | Probabilidade | Impacto | Plano B |
|---|---|---|---|
| Nenhum cliente em 30 dias | Alta | Alto | Reduzir preço do Quick Win + buscar parceiros |
| Pipeline seca sem indicações | Média | Alto | Ativar Google Ads + LinkedIn |
| Cliente pede desconto | Alta | Médio | Mostrar ROI calculado + pagamento parcelado |

---

## Cronograma Visual

\`\`\`
Dia 1-7:   🎯 Abordagem ativa (WhatsApp + Instagram DM)
Dia 8-14:  📅 Diagnósticos gratuitos
Dia 15-21: 📄 Proposta + follow-up GPCTBA
Dia 22-30: 🤝 Fechamento do 1º cliente
${horizon >= 90 ? 'Dia 31-60: 📢 Case study + escalar pipeline' : ''}
${horizon >= 90 ? 'Dia 61-90: 💰 3 clientes ativos + receita previsível' : ''}
\`\`\`

---

## Próximas 3 Ações (para amanhã)

1. **[Ação 1 — alta prioridade]:** [descrição exata, tempo: Xmin]
2. **[Ação 2]:** [descrição]
3. **[Ação 3]:** [descrição]`,
    }],
  });

  const planMD = planResp.content[0].text.trim();
  appendLog('Strategic plan generated');

  // OKRs JSON
  const okrResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Extraia os OKRs deste plano em JSON:
{"periodo_dias":${horizon},"okrs":[{"objetivo":"string","krs":[{"kr":"string","meta":"string","prazo_dias":number}]}],"proximas_acoes":["string"]}
Retorne APENAS o JSON sem markdown.
PLANO: ${planMD.slice(0, 2000)}`,
    }],
  });

  let okrsJSON = {};
  try {
    const raw = okrResp.content[0].text.trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    okrsJSON = JSON.parse(raw);
  } catch { okrsJSON = { periodo_dias: parseInt(horizon), okrs: [] }; }

  fs.writeFileSync(path.join(strategyDir, `plan_${horizon}d.md`), planMD);
  fs.writeFileSync(path.join(strategyDir, 'okrs.json'), JSON.stringify({ date: taskDate, ...okrsJSON }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Plano: ${path.join(strategyDir, `plan_${horizon}d.md`)}`);
  console.log(`  ✓ OKRs: okrs.json (${okrsJSON.okrs?.length || 0} OKRs)`);
  okrsJSON.proximas_acoes?.slice(0,3).forEach((a, i) => console.log(`    ${i+1}. ${a}`));

  appendLog('strategic_planning complete ✓');
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
}

runStrategicPlanning().catch(err => {
  console.error('Strategic Planning error:', err.message);
  process.exit(1);
});
