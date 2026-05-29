require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { tavily } = require('@tavily/core');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || 'competitor';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const outputDir      = path.join('outputs', `${taskName}_${taskDate}`);
const competitorDir  = path.join(outputDir, 'competitor');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'competitor_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

const SEARCH_QUERIES = [
  { q: 'consultoria lean six sigma belo horizonte bh preço serviços 2026', label: 'concorrentes_bh' },
  { q: 'consultoria melhoria processos automação pequenas empresas BH MG 2026', label: 'concorrentes_automacao' },
  { q: 'lean six sigma consultoria brasil instagram marketing conteúdo 2026', label: 'concorrentes_digital' },
  { q: 'black belt lean six sigma consultoria belo horizonte freelancer', label: 'concorrentes_diretos' },
];

async function runCompetitorAgent() {
  console.log(`\nCompetitor Intelligence Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [competitorDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('competitor_agent started');

  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const productInfo   = readFileSafe('knowledge/product_campaign.md');

  // Search competitors
  const rawResults = {};
  if (process.env.TAVILY_API_KEY) {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    for (const search of SEARCH_QUERIES) {
      console.log(`  → Pesquisando: ${search.label}...`);
      try {
        const r = await tvly.search(search.q, { searchDepth: 'advanced', maxResults: 5, includeAnswer: true });
        rawResults[search.label] = { answer: r.answer, results: r.results?.map(x => ({ title: x.title, url: x.url, content: x.content?.slice(0, 400) })) };
        appendLog(`Search [${search.label}] complete`);
      } catch (e) {
        rawResults[search.label] = { error: e.message };
        appendLog(`Search [${search.label}] failed: ${e.message}`);
      }
    }
  } else {
    appendLog('TAVILY_API_KEY missing — using AI-only analysis');
    console.log('  ⚠ Sem Tavily — análise só com Claude');
  }

  console.log('  → Gerando análise competitiva com IA...');
  appendLog('Generating competitive analysis...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Você é o Competitor Intelligence Agent da SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH.

## DADOS DE PESQUISA DE CONCORRENTES

${JSON.stringify(rawResults, null, 2)}

## DIFERENCIAIS DA SMARTOPS IA

${productInfo.slice(0, 1500)}

## IDENTIDADE DA MARCA

${brandIdentity.slice(0, 800)}

## TASK

Gere análise competitiva completa em Markdown:

# Competitor Intelligence Report — ${taskDate}

## Panorama Competitivo em BH e Brasil

### Concorrentes Diretos (Lean + Automação em BH)
[Liste 3-5 concorrentes identificados com nome, website, posicionamento e preço estimado]

### Concorrentes Indiretos (cursos online, consultores grandes empresas)
[Liste 2-3 com diferenciação]

## Gaps e Oportunidades

### O que os concorrentes NÃO fazem que a SmartOps IA pode fazer
[Liste 5 gaps reais identificados na pesquisa]

### Segmentos subatendidos
[Quais tipos de empresa não estão sendo bem atendidos pelos concorrentes]

## Posicionamento Recomendado

### O que diferenciar na comunicação
[3 pontos de diferenciação que devem aparecer em todo conteúdo]

### Ângulo de marketing que os concorrentes não usam
[1 ângulo único que pode gerar vantagem competitiva]

## Alertas
[Qualquer ameaça ou movimento competitivo relevante identificado]

## Ação Recomendada
[1 ação concreta para fortalecer o posicionamento nos próximos 7 dias]`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Analysis generated');

  // Extract gaps as JSON
  const gapsResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Com base nesta análise competitiva, liste os 5 principais gaps em JSON:
[{"gap": "string", "oportunidade": "string", "acao": "string", "urgencia": "alta|media|baixa"}]
Retorne APENAS o array JSON.

ANÁLISE:
${reportMD.slice(0, 2000)}`,
    }],
  });

  let gaps = [];
  try {
    const raw = gapsResp.content[0].text.trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    gaps = JSON.parse(raw);
  } catch { gaps = []; }

  fs.writeFileSync(path.join(competitorDir, 'report.md'), reportMD);
  fs.writeFileSync(path.join(competitorDir, 'gaps.json'), JSON.stringify({ date: taskDate, gaps, raw: rawResults }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Relatório: ${path.join(competitorDir, 'report.md')}`);
  console.log(`  ✓ Gaps: gaps.json (${gaps.length} gaps identificados)`);
  gaps.slice(0, 3).forEach(g => console.log(`    • ${g.gap}`));

  appendLog('competitor_agent complete ✓');
}

runCompetitorAgent().catch(err => {
  console.error('Competitor Agent error:', err.message);
  process.exit(1);
});
