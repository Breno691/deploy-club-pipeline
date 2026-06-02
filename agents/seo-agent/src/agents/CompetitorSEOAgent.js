// CompetitorSEOAgent.js — Analisa keywords e conteúdo dos concorrentes no orgânico
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Concorrentes a analisar no SEO
const SEO_COMPETITORS = [
  { name: 'Consultorias Lean BH genéricas', domain: 'concorrente-lean-bh.com.br', segment: 'Lean tradicional BH' },
  { name: 'Agências automação digital',     domain: 'agencia-automacao.com.br',   segment: 'n8n / automação' },
  { name: 'Sebrae BH',                      domain: 'sebrae.com.br',              segment: 'PME em geral' },
  { name: 'Consultores independentes',      domain: 'consultor-lean.com.br',      segment: 'Lean individual' },
];

// Framework de análise competitiva de SEO
const COMPETITIVE_ANALYSIS_FRAMEWORK = [
  'Quais keywords eles ranqueiam que nós não ranqueamos',
  'Quais conteúdos têm mais tráfego estimado',
  'Quais clusters semânticos eles dominam',
  'Quais backlinks eles têm que podemos conseguir',
  'Que perguntas do público eles respondem que nós não respondemos',
  'Qual o formato de conteúdo que gera mais engajamento',
  'Onde estão as lacunas que nenhum concorrente cobre',
];

function identifyContentGapsLocally(ourKeywords = [], competitorKeywords = []) {
  const ourSet = new Set(ourKeywords.map(k => k.toLowerCase().trim()));
  const gaps = competitorKeywords.filter(k => !ourSet.has(k.toLowerCase().trim()));
  const advantages = ourKeywords.filter(k => !competitorKeywords.map(c => c.toLowerCase()).includes(k.toLowerCase()));

  return {
    gaps:       gaps.slice(0, 20),
    advantages: advantages.slice(0, 10),
    overlap:    ourKeywords.filter(k => competitorKeywords.includes(k)).length,
    gap_count:  gaps.length,
  };
}

async function analyzeCompetitorSEOWithClaude(competitors = [], ourData = {}) {
  const compList = competitors.length ? competitors : SEO_COMPETITORS;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Competitor SEO Agent da SmartOps IA.

Missão: Identificar oportunidades de SEO analisando o que os concorrentes fazem melhor e as lacunas que podemos explorar.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Nossas keywords estratégicas: ${CONFIG.strategic_keywords.map(k => k.kw).join(', ')}

Concorrentes a analisar:
${compList.map(c => `- ${c.name} (${c.domain}) — segmento: ${c.segment}`).join('\n')}

Framework de análise:
${COMPETITIVE_ANALYSIS_FRAMEWORK.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Nossos dados: ${JSON.stringify(ourData, null, 2)}

Responda:

# COMPETITOR SEO ANALYSIS

## RESUMO COMPETITIVO
[Estado do mercado orgânico no nosso nicho]

## ANÁLISE POR CONCORRENTE
Para cada concorrente:
NOME: [concorrente]
PONTOS FORTES EM SEO: [o que fazem bem]
LACUNAS: [onde deixam espaço para nós]
KEYWORDS QUE DOMINAM: [estimativa]
CONTEÚDO MAIS FORTE: [tipo e tema]

## LACUNAS DO MERCADO (oportunidades únicas)
[Keywords/temas que nenhum concorrente cobre bem — nossa maior oportunidade]

## KEYWORDS A ROUBAR
[Keywords onde concorrentes rankeiam mal — posição 4-15 — onde podemos passar]

## CLUSTERS QUE PODEMOS DOMINAR
[Clusters completos ainda não trabalhados por ninguém]

## CONTEÚDOS PARA CRIAR (baseado nas lacunas)
[Top 5 conteúdos para superar concorrentes]

## ESTRATÉGIA DE DIFERENCIAÇÃO
[Como SmartOps pode se posicionar de forma única no orgânico]

## PLANO DE AÇÃO
[Top 3 ações para ganhar vantagem orgânica nos próximos 60 dias]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { analyzeCompetitorSEOWithClaude, identifyContentGapsLocally, SEO_COMPETITORS };
