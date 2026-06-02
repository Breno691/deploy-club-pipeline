// KeywordResearchAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { classifyPosition, calcCTROrganic } = require('../calculations/seoCalculators');

const client = new Anthropic();

function analyzeKeywordsLocally(queries = []) {
  const classified = queries.map(q => ({
    ...q,
    ctr:          calcCTROrganic(q.clicks, q.impressions),
    position_class: classifyPosition(q.position),
    priority:     q.position <= 20 && q.impressions >= 100 ? 'alta' : q.position <= 50 ? 'media' : 'baixa',
  }));

  const opportunities = classified.filter(q => q.position >= 4 && q.position <= 20 && q.impressions >= 100);
  const top_by_impressions = [...classified].sort((a, b) => b.impressions - a.impressions).slice(0, 10);
  const low_ctr = classified.filter(q => q.ctr < 2 && q.impressions >= 200);

  return {
    total_queries: classified.length,
    opportunities: opportunities.slice(0, 10),
    top_impressions: top_by_impressions,
    low_ctr_opportunities: low_ctr.slice(0, 5),
    avg_position: classified.length ? Math.round(classified.reduce((s, q) => s + q.position, 0) / classified.length * 10) / 10 : 0,
    avg_ctr: classified.length ? Math.round(classified.reduce((s, q) => s + q.ctr, 0) / classified.length * 100) / 100 : 0,
  };
}

async function researchKeywordsWithClaude(queries = [], targetTopic = '') {
  const local = analyzeKeywordsLocally(queries);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Keyword Research Agent da SmartOps IA.

Missão: Identificar keywords estratégicas, organizar em clusters e recomendar ações por intenção de busca.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Tema: ${targetTopic || 'SmartOps IA — consultoria Lean, Automação e IA para PMEs'}

Keywords estratégicas definidas:
${CONFIG.strategic_keywords.map(k => `- ${k.kw} [${k.intent}] prioridade ${k.priority}`).join('\n')}

Dados do Search Console (${queries.length} consultas):
Posição média: ${local.avg_position}
CTR médio: ${local.avg_ctr}%
Top oportunidades (posição 4-20 com impressões): ${local.opportunities.length}
Consultas com CTR baixo (<2%): ${local.low_ctr_opportunities.length}

Responda:

# KEYWORD RESEARCH REPORT

## ANÁLISE DAS CONSULTAS
[O que as consultas revelam sobre intenção e oportunidades]

## CLUSTERS SEMÂNTICOS RECOMENDADOS
Para cada cluster:
CLUSTER: [tema central]
PÁGINA PILAR: URL + título + intenção
CONTEÚDOS SATÉLITE: [5-7 subtemas com título e URL]
LINKAGEM INTERNA: [estrutura de links]
META: [quando chegar ao top 5]

## QUICK WINS (posição 4-20)
Para cada oportunidade:
CONSULTA: [keyword]
POSIÇÃO ATUAL: [N]
IMPRESSÕES: [N]
CTR ATUAL: [%]
AÇÃO: [o que otimizar — título, conteúdo, meta]
GANHO ESTIMADO: [+X cliques/semana]

## CONSULTAS COM CTR BAIXO
[Títulos e metas a reescrever]

## NOVAS KEYWORDS A CRIAR CONTEÚDO
[5-10 keywords sem conteúdo que valem criar]

## CALENDÁRIO DE CONTEÚDO
[4 semanas de publicações priorizadas por impacto]`,
    }],
  });

  return { analysis: response.content[0].text, data: local };
}

module.exports = { researchKeywordsWithClaude, analyzeKeywordsLocally };
