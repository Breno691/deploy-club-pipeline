// CompetitorIntelligenceAgent.js — Inteligência competitiva enterprise
// v2.0.0-enterprise: classificação A-D, matriz enterprise, lacunas, handoff
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function searchCompetitorDataWithTavily(competitorName) {
  if (!process.env.TAVILY_API_KEY) return [];
  try {
    const { TavilyClient } = require('@tavily/core');
    const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
    const queries = [
      `${competitorName} consultoria lean automação preços reviews`,
      `${competitorName} reclamações pontos fracos lacunas`,
    ];
    const results = [];
    for (const q of queries) {
      const res = await tavily.search({ query: q, maxResults: 3, searchDepth: 'basic' });
      results.push(...(res.results || []));
    }
    return results;
  } catch { return []; }
}

async function analyzeCompetitorWithClaude(competitor, tavilyData = []) {
  const webText = tavilyData.map(r => `• ${r.title}: ${r.content?.slice(0, 220)}`).join('\n');

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Você é o Competitor Intelligence Agent Enterprise da SmartOps IA.

Mantra: "Nunca achismo. Sempre evidência."
Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Concorrente analisado: "${competitor.name}" (${competitor.type}) — segmento: ${competitor.segment}

${webText ? `DADOS DE PESQUISA (classificar confiança):\n${webText}\n---` : 'Sem dados externos — análise baseada em conhecimento do modelo.'}

REGRAS:
- Classificar cada dado como Fato/Sinal/Hipótese/Opinião
- Indicar confiança da fonte: A (oficial), B (boa), C (média), D (fraca)
- Nunca inventar dados específicos — declarar quando for hipótese
- Focar em lacunas exploráveis pela SmartOps

Análise enterprise completa:

## ${competitor.name}

POSICIONAMENTO: [como se apresenta ao mercado]
PROPOSTA PRINCIPAL: [promessa central — o resultado que vende]
DIFERENCIAL PERCEBIDO: [por que clientes escolhem]
PREÇO ESTIMADO: [faixa — Fato/Hipótese]
PONTOS FORTES: [3 pontos com tipo de informação]
PONTOS FRACOS / LACUNAS: [3 pontos com evidência]
CANAIS USADOS: [onde aparece — orgânico, ads, LinkedIn etc]
CONTEÚDO: [tipo e qualidade]
PROVA SOCIAL: [reviews, cases, depoimentos]
RECLAMAÇÕES IDENTIFICADAS: [o que clientes reclamam]
OPORTUNIDADE PARA SMARTOPS: [onde podemos superar — específico]
AMEAÇA PARA SMARTOPS: [onde nos ameaça]
CONFIANÇA DESTA ANÁLISE: A/B/C/D | Limitação:`,
    }],
  });

  return { competitor: competitor.name, type: competitor.type, segment: competitor.segment, analysis: response.content[0].text };
}

async function buildCompetitiveIntelligenceReport(competitors = null) {
  const compList = competitors || CONFIG.competitors;
  const analyses = [];

  for (const comp of compList) {
    console.log(`  → Analisando: ${comp.name}...`);
    const data = await searchCompetitorDataWithTavily(comp.name);
    const analysis = await analyzeCompetitorWithClaude(comp, data);
    analyses.push(analysis);
  }

  const consolidation = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Competitor Intelligence Agent Enterprise da SmartOps IA.

Mantra: "Encontrar lacunas é encontrar oportunidades."
Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Público-alvo: ${CONFIG.target_audience.primary}

ANÁLISES INDIVIDUAIS:
${analyses.map(a => `## ${a.competitor} (${a.type})\n${a.analysis}`).join('\n\n---\n\n')}

---

Gere o relatório consolidado enterprise:

# COMPETITIVE INTELLIGENCE REPORT — SmartOps IA

## ESTADO DO MERCADO
[Visão geral — quem lidera, quem está crescendo, onde há espaço]

## MATRIZ COMPETITIVA ENTERPRISE
| Critério | SmartOps IA | ${compList.map(c => c.name.split(' ')[0]).join(' | ')} |
|---|${compList.map(() => '---|').join('')}
| Preço | | |
| IA/Automação | | |
| Lean/Processos | | |
| Proximidade BH | | |
| Prazo de entrega | | |
| Prova social | | |
| Clareza da oferta | | |
| Canais digitais | | |

## LACUNAS DO MERCADO (o que ninguém resolve bem)
| Lacuna | Evidência | Oportunidade para SmartOps | Prioridade |
|---|---|---|---|

## VANTAGENS COMPETITIVAS DA SMARTOPS
[O que temos que nenhum concorrente tem — ser específico]

## DECLARAÇÃO DE POSICIONAMENTO RECOMENDADA
[Como SmartOps deve se posicionar para se diferenciar claramente]

## RED FLAGS DE CONCORRÊNCIA
[Onde a concorrência é forte demais por enquanto]

## MENSAGENS A EVITAR (usadas demais)
* [Frase]

## SCORE DE CONCORRÊNCIA GERAL
Dificuldade: Baixa / Média / Alta | Espaço para SmartOps: Grande / Médio / Pequeno

## AÇÕES DE MARKETING BASEADAS NA INTELIGÊNCIA
P1 — Prioridade Máxima: [ação imediata]
P2 — Alta: [segundo passo]
P3 — Média: [terceiro passo]

## HANDOFF
Ads Agent: [usar essas lacunas]
Content Agent: [criar esse diferencial]
Sales Agent: [argumentos contra cada concorrente]`,
    }],
  });

  return { individual: analyses, consolidated: consolidation.content[0].text };
}

module.exports = { buildCompetitiveIntelligenceReport, analyzeCompetitorWithClaude };
