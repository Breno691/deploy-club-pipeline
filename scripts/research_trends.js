/**
 * Research Trends Agent — SmartOps IA
 * Pesquisa diária de tendências de design, formatos virais e referências
 * para o agente de marketing e design usarem na criação de conteúdo.
 *
 * Uso: node scripts/research_trends.js
 * Saída: outputs/trends/trends_YYYY-MM-DD.json + trends_report.md
 */

require('dotenv').config();
const { tavily } = require('@tavily/core');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const today = new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', 'trends');
const outputFile = path.join(outputDir, `trends_${today}.json`);
const reportFile = path.join(outputDir, `trends_report_${today}.md`);
const latestFile = path.join(outputDir, 'trends_latest.json');

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TREND_QUERIES = [
  {
    category: 'instagram_design_trends',
    query: 'tendências design posts Instagram 2026 Brasil formato viral empresas B2B',
    searchDepth: 'advanced',
  },
  {
    category: 'reels_formats',
    query: 'formatos reels Instagram virais Brasil 2026 empreendedorismo negócios engajamento',
    searchDepth: 'advanced',
  },
  {
    category: 'design_references',
    query: 'estilo visual posts Instagram consultoria gestão empresarial design minimalista 2026',
    searchDepth: 'basic',
  },
  {
    category: 'content_hooks',
    query: 'hooks virais Instagram Brasil empreendedores PME 2026 primeiras palavras para parar scroll',
    searchDepth: 'advanced',
  },
  {
    category: 'competitor_content',
    query: 'posts virais consultoria lean six sigma automação IA Instagram Brasil conteúdo engajamento',
    searchDepth: 'basic',
  },
  {
    category: 'visual_trends',
    query: '"anti-design" OR "design minimal" OR "texto puro" Instagram tendência 2026 posts virais',
    searchDepth: 'basic',
  },
  {
    category: 'audio_trends',
    query: 'músicas trending reels Instagram Brasil junho 2026 áudio viral',
    searchDepth: 'basic',
  },
];

function appendLog(message) {
  const logFile = path.join(outputDir, 'research_trends.log');
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

async function searchTrends() {
  console.log(`\nResearch Trends Agent — ${today}`);
  console.log('Pesquisando tendências de design e conteúdo...\n');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  appendLog(`Research Trends started — ${today}`);

  const results = { date: today, categories: {} };

  for (const q of TREND_QUERIES) {
    process.stdout.write(`  Pesquisando: ${q.category}...`);
    try {
      const res = await tvly.search(q.query, {
        searchDepth: q.searchDepth,
        maxResults: 5,
        includeAnswer: true,
      });
      results.categories[q.category] = {
        query: q.query,
        answer: res.answer,
        sources: res.results.map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.content?.substring(0, 300),
        })),
      };
      console.log(' ✓');
      appendLog(`${q.category}: OK (${res.results.length} resultados)`);
    } catch (err) {
      console.log(` ✗ ${err.message}`);
      appendLog(`${q.category}: FAILED — ${err.message}`);
      results.categories[q.category] = { error: err.message };
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));
  appendLog('Dados brutos salvos');

  return results;
}

async function generateTrendsReport(rawData) {
  console.log('\n  Gerando relatório com Claude...');

  const prompt = `Você é o Marketing Research Agent + Design Agent da SmartOps IA.

SmartOps IA é uma consultoria de Lean Six Sigma, Melhoria Contínua e Automação com IA para PMEs em BH/MG.
Dono: Breno Luiz, Black Belt Lean Six Sigma.
Canais: Instagram, Reels, Stories, LinkedIn.
Paleta atual: fundo escuro (#0A0A0F), roxo (#7C3AED), verde (#10B981), fonte Bebas Neue.

Dados de pesquisa de tendências coletados hoje (${rawData.date}):
${JSON.stringify(rawData.categories, null, 2)}

Com base nesses dados, gere um relatório de tendências para orientar a criação de conteúdo nos próximos 7 dias.

O relatório deve ter:

## 1. TOP 5 TENDÊNCIAS DE DESIGN IDENTIFICADAS
Para cada tendência: nome, descrição, por que está performando, como aplicar na SmartOps IA.

## 2. FORMATOS DE REEL EM ALTA
3 formatos específicos com script/roteiro adaptado para consultoria B2B.

## 3. HOOKS QUE ESTÃO PARANDO O SCROLL
5 primeiras linhas/frases que o mercado está usando com alta performance. Adaptar para o contexto de Lean/Automação.

## 4. REFERÊNCIAS VISUAIS SUGERIDAS
Estilos, paletas ou contas de referência que o Design Agent deve estudar.

## 5. CALENDÁRIO SUGERIDO — PRÓXIMOS 7 DIAS
Para cada dia: formato recomendado, tema, hook de abertura, estilo visual.

## 6. RECOMENDAÇÃO PARA O DESIGN AGENT
Mudanças específicas na paleta/estilo da SmartOps IA para alinhar com as tendências sem perder a identidade.

Seja específico, direto e acionável. Nada de teoria vaga.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const report = message.content[0].text;

  const fullReport = `# Relatório de Tendências — SmartOps IA
*Gerado por: Research Trends Agent + Claude*
*Data: ${rawData.date}*
*Próxima atualização: automática amanhã*

---

${report}

---

## FONTES PESQUISADAS

${Object.entries(rawData.categories)
  .filter(([, v]) => !v.error && v.sources)
  .map(([cat, v]) => `### ${cat}\n${v.sources.map(s => `- [${s.title}](${s.url})`).join('\n')}`)
  .join('\n\n')}

---
*SmartOps IA · Research Trends Agent · ${rawData.date}*
`;

  fs.writeFileSync(reportFile, fullReport);
  appendLog('Relatório gerado e salvo');
  console.log(`  ✓ Relatório salvo: ${reportFile}`);

  return fullReport;
}

async function main() {
  try {
    const rawData = await searchTrends();
    await generateTrendsReport(rawData);

    console.log(`\n✅ Research Trends Agent concluído!`);
    console.log(`   Dados:     ${outputFile}`);
    console.log(`   Relatório: ${reportFile}`);
    console.log(`   Sempre atualizado: ${latestFile}\n`);

    appendLog('Research Trends Agent completed ✓');
  } catch (err) {
    console.error(`\nErro: ${err.message}`);
    appendLog(`FAILED: ${err.message}`);
    process.exit(1);
  }
}

main();
