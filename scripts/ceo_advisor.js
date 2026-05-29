require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || process.env.TASK_NAME || 'ceo_briefing';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const mode     = get('--mode') || 'daily'; // daily | weekly | monthly

const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const ceoDir    = path.join(outputDir, 'ceo');

function appendLog(msg) {
  fs.appendFileSync(
    path.join(outputDir, 'logs', 'ceo_advisor.log'),
    `[${new Date().toISOString()}] ${msg}\n`
  );
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

// ── Collect available data from outputs ─────────────────────────────────────
function collectAvailableData() {
  const data = { sources: [], content: '' };

  // Research from current task
  const research = readFileSafe(path.join(outputDir, 'research_brief.md'));
  if (research) {
    data.sources.push('research_brief');
    data.content += `\n## PESQUISA DE MERCADO\n${research.slice(0, 2000)}\n`;
  }

  // Copy outputs
  const copyDir = path.join(outputDir, 'copy');
  if (fs.existsSync(copyDir)) {
    const files = fs.readdirSync(copyDir);
    files.forEach(f => {
      const content = readFileSafe(path.join(copyDir, f));
      if (content) {
        data.sources.push(`copy/${f}`);
        data.content += `\n## COPY GERADA (${f})\n${content.slice(0, 500)}\n`;
      }
    });
  }

  // Ad layout
  const layoutJson = readJsonSafe(path.join(outputDir, 'ads', 'layout.json'));
  if (layoutJson) {
    data.sources.push('ads/layout.json');
    data.content += `\n## AD GERADO\nHeadline: ${layoutJson.headline}\nSubtext: ${layoutJson.subtext}\n`;
  }

  // Finance data
  const financeReport = readFileSafe(path.join(outputDir, 'finance', 'financial_report_weekly.md'));
  if (financeReport) {
    data.sources.push('finance/financial_report_weekly');
    data.content += `\n## DADOS FINANCEIROS\n${financeReport.slice(0, 1500)}\n`;
  }

  // Proposals
  const proposalDir = path.join(outputDir, 'proposals');
  if (fs.existsSync(proposalDir)) {
    const props = fs.readdirSync(proposalDir).filter(f => f.endsWith('.json'));
    props.forEach(f => {
      const p = readJsonSafe(path.join(proposalDir, f));
      if (p) {
        data.sources.push(`proposals/${f}`);
        data.content += `\n## PROPOSTA: ${p.client}\nTier: ${p.tier} | Score: ${p.analysis?.lead_score} | Urgência: ${p.analysis?.urgencia}\nDor: ${p.analysis?.dor_principal}\n`;
      }
    });
  }

  // Scan other output directories for recent reports
  const outputsBase = 'outputs';
  if (fs.existsSync(outputsBase)) {
    const allDirs = fs.readdirSync(outputsBase)
      .filter(d => d !== `${taskName}_${taskDate}`)
      .sort()
      .slice(-5); // last 5 tasks

    for (const dir of allDirs) {
      const brief = readFileSafe(path.join(outputsBase, dir, 'research_brief.md'));
      if (brief) {
        data.sources.push(`${dir}/research_brief`);
        data.content += `\n## PESQUISA ANTERIOR (${dir})\n${brief.slice(0, 800)}\n`;
        break; // just most recent
      }
    }
  }

  return data;
}

async function runCeoAdvisor() {
  console.log(`\nCEO Advisor Agent — SmartOps IA`);
  console.log(`Mode: ${mode} | Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [ceoDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('ceo_advisor started');

  const availableData = collectAvailableData();
  console.log(`  → Fontes coletadas: ${availableData.sources.length > 0 ? availableData.sources.join(', ') : 'nenhuma (modo stand-alone)'}`);
  appendLog(`Sources: ${availableData.sources.join(', ') || 'none'}`);

  const client = new Anthropic();

  // ── Generate executive action plan ──────────────────────────────────────
  appendLog('Generating executive action plan...');
  console.log('  → Gerando plano de ação executivo...');

  const systemPrompt = `Você é o CEO Advisor Agent da SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH.

O dono é Breno Luiz, Black Belt Lean Six Sigma.
Contato: (31) 97203-9180 | brenoluiz691@gmail.com

Seu papel: analisar todos os dados disponíveis e gerar um briefing executivo claro e acionável.
O Breno deve poder, em 10 minutos, saber exatamente o que priorizar hoje.

FRAMEWORK DE DECISÃO:
- Impacto Alto + Fácil + Urgente → FAZER HOJE
- Impacto Alto + Difícil + Urgente → PLANEJAR ESTA SEMANA
- Impacto Médio + Fácil → DELEGAR
- Impacto Baixo → IGNORAR

FORMATO OBRIGATÓRIO para cada recomendação:
TÍTULO:
PROBLEMA:
EVIDÊNCIA:
IMPACTO:
AÇÃO RECOMENDADA:
PRIORIDADE: [Alta/Média/Baixa]
ESFORÇO: [Baixo/Médio/Alto]
ROI ESPERADO:
PRAZO:
RESPONSÁVEL: Breno Luiz
MÉTRICA DE SUCESSO:
RISCO DE NÃO AGIR:`;

  const userPrompt = `## DADOS DISPONÍVEIS (${taskDate} — modo ${mode})

${availableData.content || '(sem dados de outras fontes — gere briefing com base na situação padrão da consultoria)'}

---

## SITUAÇÃO PADRÃO DA SMARTOPS IA

Empresa: consultoria recém-iniciada, sem clientes ainda
Produto: Lean Six Sigma + Automação com IA para PMEs em BH
Diferenciais: Black Belt certificado, diagnóstico gratuito 30 min, resultado mensurável
Canais: Instagram (3x/semana automático), WhatsApp (abordagem ativa), indicação
Pipeline atual: construindo primeiros leads via conteúdo
Meta imediata: fechar os primeiros 3 clientes pagantes

---

## TASK

Gere o briefing executivo para hoje (${mode === 'daily' ? 'DIÁRIO' : mode === 'weekly' ? 'SEMANAL' : 'MENSAL'}):

# CEO Briefing — SmartOps IA — ${taskDate}

## Situação Atual do Negócio
[3–5 linhas sobre onde está o negócio hoje, baseado nos dados]

## Top 3 Prioridades de Hoje
[3 ações em formato FAZER HOJE / PLANEJAR / DELEGAR]

## Análise por Área

### Marketing & Conteúdo
[O que o conteúdo está gerando? O que melhorar?]

### Pipeline de Vendas
[Leads ativos, propostas em aberto, próximos follow-ups]

### Operação
[O que pode ser otimizado ou automatizado agora?]

### Financeiro
[Receita atual vs meta, fluxo de caixa, próximas entradas]

## Recomendações Prioritárias

[3–5 recomendações no formato padrão CEO Advisor]

## Pergunta para o Breno
[1 pergunta estratégica que o Breno precisa responder hoje para desbloquear crescimento]

## Próximo Passo Imediato
[1 ação específica, com prazo de hoje]`;

  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const briefingMD = resp.content[0].text.trim();
  appendLog('Executive action plan generated');

  // ── Generate decisions JSON ─────────────────────────────────────────────
  appendLog('Generating decisions JSON...');
  console.log('  → Estruturando decisões em JSON...');

  const decisionsResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Com base neste briefing executivo, gere um array JSON com as decisões priorizadas:

[
  {
    "id": 1,
    "titulo": "string",
    "categoria": "marketing|vendas|operacao|financeiro|produto",
    "prioridade": "alta|media|baixa",
    "esforco": "baixo|medio|alto",
    "impacto": "alto|medio|baixo",
    "acao": "string curta e acionável",
    "prazo": "string (hoje|esta semana|este mes)",
    "metrica": "string",
    "roi_esperado": "string",
    "score": number (1-100, impacto×facilidade×urgência)
  }
]

Retorne APENAS o JSON array, ordenado por score decrescente. Sem markdown.

BRIEFING:
${briefingMD}`,
    }],
  });

  let decisions = [];
  try {
    const raw = decisionsResp.content[0].text.trim();
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    decisions = JSON.parse(jsonStr);
    if (!Array.isArray(decisions)) decisions = [decisions];
  } catch {
    decisions = [{ id: 1, titulo: 'Revisar briefing manualmente', prioridade: 'alta', esforco: 'baixo', acao: 'Ler o executive_action_plan.md', prazo: 'hoje', score: 90 }];
  }

  appendLog('Decisions JSON generated');

  // ── Save outputs ───────────────────────────────────────────────────────
  fs.writeFileSync(path.join(ceoDir, 'executive_action_plan.md'), briefingMD);
  fs.writeFileSync(
    path.join(ceoDir, 'decisions.json'),
    JSON.stringify({ date: taskDate, mode, sources: availableData.sources, decisions }, null, 2)
  );

  const weeklyBriefing = mode === 'weekly' ? briefingMD : '';
  if (weeklyBriefing) {
    fs.writeFileSync(path.join(ceoDir, 'weekly_briefing.md'), weeklyBriefing);
  }

  appendLog('All outputs saved ✓');

  console.log(`\n  ✓ Plano executivo: ${path.join(ceoDir, 'executive_action_plan.md')}`);
  console.log(`  ✓ Decisões: decisions.json (${decisions.length} itens)`);
  console.log(`\n  TOP 3 prioridades:`);
  decisions.slice(0, 3).forEach((d, i) => {
    console.log(`    ${i + 1}. [${d.prioridade?.toUpperCase()}] ${d.titulo} — ${d.prazo}`);
  });

  appendLog('ceo_advisor complete ✓');
  return { status: 'ok', decisions_count: decisions.length, top_priority: decisions[0]?.titulo };
}

runCeoAdvisor().catch(err => {
  console.error('CEO Advisor error:', err.message);
  process.exit(1);
});
