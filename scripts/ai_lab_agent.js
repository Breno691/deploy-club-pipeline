require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { tavily } = require('@tavily/core');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'ai_lab';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const labDir    = path.join(outputDir, 'ai_lab');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'ai_lab.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runAILabAgent() {
  console.log(`\nAI Lab Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [labDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('ai_lab_agent started');

  let researchResults = '';

  if (process.env.TAVILY_API_KEY) {
    console.log('  → Pesquisando novidades em LLMs e ferramentas IA...');
    appendLog('Searching for AI news via Tavily...');
    try {
      const tc = tavily({ apiKey: process.env.TAVILY_API_KEY });

      const [llmNews, toolNews, automationNews] = await Promise.all([
        tc.search('LLM novidades Claude OpenAI Gemini 2025 novos modelos', { maxResults: 5 }),
        tc.search('ferramentas IA automação n8n LangChain agentes 2025', { maxResults: 5 }),
        tc.search('AI consultoria negócios PME automação processos 2025', { maxResults: 4 }),
      ]);

      researchResults = [
        '## Novos Modelos e LLMs\n' + (llmNews.results || []).map(r => `- **${r.title}** — ${r.content?.slice(0, 200)}`).join('\n'),
        '## Ferramentas e Frameworks\n' + (toolNews.results || []).map(r => `- **${r.title}** — ${r.content?.slice(0, 200)}`).join('\n'),
        '## IA para Negócios\n' + (automationNews.results || []).map(r => `- **${r.title}** — ${r.content?.slice(0, 200)}`).join('\n'),
      ].join('\n\n');

      appendLog('AI research completed');
    } catch (e) {
      appendLog(`Tavily error: ${e.message}`);
      researchResults = '(pesquisa Tavily indisponível — análise baseada em conhecimento interno)';
    }
  } else {
    researchResults = '(TAVILY_API_KEY não configurado — análise baseada em conhecimento interno)';
  }

  console.log('  → Analisando impacto para SmartOps IA...');
  appendLog('Analyzing AI trends for SmartOps IA...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    messages: [{
      role: 'user',
      content: `Você é o AI Lab Agent da SmartOps IA. Monitora novidades em LLMs, ferramentas de IA e automação, avaliando o que é relevante para a consultoria e seus clientes.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Stack atual:** Claude (Anthropic), n8n, Tavily, Playwright, Supabase, BullMQ
**Data:** ${taskDate}

## PESQUISA RECENTE
${researchResults}

---

## TASK — Relatório AI Lab

# AI Lab — Radar de Novidades
**SmartOps IA | ${taskDate}**

---

## TL;DR — O Que Importa Agora
[3 bullet points: as 3 coisas mais relevantes desta semana para a SmartOps IA]

---

## 1. Novidades em LLMs

| Modelo | Novidade | Impacto para SmartOps | Ação Sugerida |
|---|---|---|---|
| Claude (Anthropic) | [última versão/feature] | [alto/médio/baixo] | [testar / migrar / ignorar] |
| GPT (OpenAI) | [novidade] | | |
| Gemini (Google) | [novidade] | | |
| [outros] | | | |

---

## 2. Ferramentas e Automação

| Ferramenta | Novidade | Aplicação no SmartOps | Prioridade |
|---|---|---|---|
| n8n | [updates] | [onde usar] | Alta/Média/Baixa |
| LangChain/LangGraph | [novidade] | | |
| CrewAI | [novidade] | | |
| [outra] | | | |

---

## 3. Casos de Uso para Clientes

[Novidades de IA que podem ser aplicadas nos clientes PME da SmartOps IA]

| Caso de Uso | Tecnologia | Benefício para PME | Dificuldade |
|---|---|---|---|
| [ex: classificação de pedidos automática] | [LLM + n8n] | [redução de 4h/dia] | Baixa |
| | | | |

---

## 4. Oportunidades de Produto

[Novos produtos/serviços que a SmartOps IA poderia criar com estas tecnologias]

1. **[Produto 1]:** [descrição + mercado-alvo + preço estimado]
2. **[Produto 2]:** [descrição]

---

## 5. Riscos e Ameaças

| Risco | Origem | Impacto | Como Mitigar |
|---|---|---|---|
| Concorrente usa IA mais avançada | [origem] | Médio | Atualizar stack |
| Cliente faz in-house com IA | Democratização | Alto | Posicionar como parceiro, não executor |

---

## 6. Experimentos Sugeridos (Esta Semana)

1. **[Experimento 1]:** [o que testar, como, tempo estimado: X horas]
2. **[Experimento 2]:** [o que testar]

---

## 7. Próximas Atualizações no Stack SmartOps IA

| Item | Ação | Prioridade | Prazo |
|---|---|---|---|
| [ex: migrar para Claude 4] | Testar novo modelo | Alta | Esta semana |
| [ex: adicionar memory via pgvector] | Implementar RAG | Média | Próximo mês |`,
    }],
  });

  const labMD = resp.content[0].text.trim();
  appendLog('AI Lab report generated');

  fs.writeFileSync(path.join(labDir, 'ai_lab_report.md'), labMD);
  if (researchResults && !researchResults.includes('indisponível')) {
    fs.writeFileSync(path.join(labDir, 'raw_research.md'), researchResults);
  }
  fs.writeFileSync(path.join(labDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    tavily_used: !!process.env.TAVILY_API_KEY,
    file: 'ai_lab_report.md',
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Relatório AI Lab: ${path.join(labDir, 'ai_lab_report.md')}`);

  appendLog('ai_lab_agent complete ✓');
}

runAILabAgent().catch(err => {
  console.error('AI Lab Agent error:', err.message);
  process.exit(1);
});
