require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName    = get('--task')    || 'lean_analysis';
const taskDate    = get('--date')    || new Date().toISOString().split('T')[0];
const clientName  = get('--client')  || 'cliente';
const processFile = get('--process'); // path to process description file
const sector      = get('--sector')  || 'servicos'; // saude|restaurante|servicos|industria

const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const leanDir   = path.join(outputDir, 'lean');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'lean_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

// Defaults por setor
const SECTOR_CONTEXT = {
  saude:      { tipo: 'Clínica/Hospital',         foco: 'atendimento ao paciente, fluxo de prontuários, agendamento' },
  restaurante:{ tipo: 'Restaurante/Food Service',  foco: 'produção, estoque, atendimento de mesas, fluxo de pedidos' },
  servicos:   { tipo: 'Empresa de Serviços B2B',   foco: 'proposta, onboarding, entrega, faturamento, comunicação com cliente' },
  industria:  { tipo: 'Indústria/Manufatura',      foco: 'linha de produção, qualidade, setup, manutenção, logistics' },
  varejo:     { tipo: 'Varejo/Comércio',            foco: 'atendimento, estoque, checkout, devolução, reposição' },
};

async function runLeanAgent() {
  console.log(`\nLean Agent — SmartOps IA`);
  console.log(`Cliente: ${clientName} | Setor: ${sector} | Task: ${taskName}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [leanDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('lean_agent started');

  const processDesc = processFile ? readFileSafe(processFile) : '';
  const sectorCtx   = SECTOR_CONTEXT[sector] || SECTOR_CONTEXT.servicos;

  const client = new Anthropic();

  // ── Step 1: VSM + 8 Desperdícios ────────────────────────────────────────
  appendLog('Step 1: VSM + waste analysis...');
  console.log('  → Analisando VSM e 8 desperdícios...');

  const vsmResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Você é o Lean Agent da SmartOps IA — especialista em Lean Six Sigma para PMEs.

## CLIENTE: "${clientName}"
## SETOR: ${sectorCtx.tipo}
## FOCO DO PROCESSO: ${sectorCtx.foco}

## DESCRIÇÃO DO PROCESSO (se fornecida)
${processDesc || '(sem descrição específica — use o conhecimento do setor para gerar análise padrão)'}

## TASK — Análise Lean Completa

Gere análise Lean detalhada em Markdown:

# Análise Lean — ${clientName} — ${taskDate}

## Value Stream Map (VSM) — Estado Atual

### Fluxo do Processo (estado atual)
[Descreva cada etapa do processo no setor ${sectorCtx.tipo}, com:
- Nome da etapa
- Tempo de ciclo estimado
- Recursos envolvidos
- Pontos de handoff]

\`\`\`
ENTRADA → [Etapa 1] → [Etapa 2] → [Etapa N] → SAÍDA/CLIENTE
          Tc: ?min    Tc: ?min    Tc: ?min
\`\`\`

## Os 8 Desperdícios — Diagnóstico por Setor

| # | Desperdício | Manifestação em ${sectorCtx.tipo} | Impacto | Prioridade |
|---|---|---|---|---|
| 1 | Superprodução | [exemplo específico] | [impacto] | Alta/Média/Baixa |
| 2 | Espera | [exemplo] | | |
| 3 | Transporte | [exemplo] | | |
| 4 | Superprocessamento | [exemplo] | | |
| 5 | Estoque | [exemplo] | | |
| 6 | Movimentação | [exemplo] | | |
| 7 | Defeitos/Retrabalho | [exemplo] | | |
| 8 | Talento não usado | [exemplo] | | |

## Top 3 Desperdícios Críticos

### 1. [Maior Desperdício]
- **Situação atual:** [descrição]
- **Custo estimado:** R$ X/mês (estimativa)
- **Causa raiz:** [por que acontece]

### 2. [Segundo Maior]
- ...

### 3. [Terceiro Maior]
- ...

## Quick Wins — O Que Eliminar Primeiro (sem investimento)

| Ação | Desperdício eliminado | Esforço | Impacto | Prazo |
|---|---|---|---|---|
| [ação 1] | [qual desperdício] | Baixo | Alto | 1 semana |
| [ação 2] | | | | |
| [ação 3] | | | | |

## VSM Estado Futuro (meta em 60 dias)

[Descreva como o processo deveria ficar após as melhorias]

## ROI Estimado das Melhorias

- Redução de lead time: de X para Y
- Redução de retrabalho: X% → Y%
- Economia mensal estimada: R$ X
- Payback: X semanas

## Próximo Passo
[Uma ação específica para iniciar amanhã]`,
    }],
  });

  const vsmMD = vsmResp.content[0].text.trim();
  appendLog('VSM analysis generated');

  // ── Step 2: Quick wins JSON ─────────────────────────────────────────────
  console.log('  → Estruturando quick wins em JSON...');
  const qwResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Com base nesta análise Lean, gere os quick wins em JSON:
[{"acao":"string","desperdicio":"string","esforco":"baixo|medio|alto","impacto":"baixo|medio|alto","prazo_dias":number,"roi_estimado":"string"}]
Retorne APENAS o array JSON sem markdown.

ANÁLISE:
${vsmMD.slice(0, 2000)}`,
    }],
  });

  let quickWins = [];
  try {
    const raw = qwResp.content[0].text.trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    quickWins = JSON.parse(raw);
  } catch { quickWins = []; }

  // Save outputs
  fs.writeFileSync(path.join(leanDir, `vsm_analysis_${clientName.toLowerCase().replace(/\s/g,'_')}.md`), vsmMD);
  fs.writeFileSync(path.join(leanDir, 'waste_map.json'), JSON.stringify({
    date: taskDate, client: clientName, sector, quick_wins: quickWins,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ VSM: ${path.join(leanDir, `vsm_analysis_${clientName.toLowerCase().replace(/\s/g,'_')}.md`)}`);
  console.log(`  ✓ Quick wins: waste_map.json (${quickWins.length} ações)`);
  quickWins.slice(0, 3).forEach((qw, i) => console.log(`    ${i+1}. [${qw.esforco}/${qw.impacto}] ${qw.acao}`));

  appendLog('lean_agent complete ✓');
}

runLeanAgent().catch(err => {
  console.error('Lean Agent error:', err.message);
  process.exit(1);
});
