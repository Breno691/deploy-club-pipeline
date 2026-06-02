// AudienceResearchAgent.js — Mapa de público enterprise
// v2.0.0-enterprise: voz do cliente, triangulação, enterprise audience map
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const AUDIENCE_SOURCES = [
  'comentários Instagram e LinkedIn',
  'reviews Google Meu Negócio',
  'Reclame Aqui concorrentes',
  'Reddit r/empreendedorismo',
  'Grupos Facebook PME',
  'Fóruns Sebrae',
  'entrevistas com clientes',
  'WhatsApp — mensagens de potenciais clientes',
  'perguntas em DM',
];

async function researchAudienceWithTavily(niche = 'consultoria lean PME') {
  if (!process.env.TAVILY_API_KEY) return [];
  try {
    const { TavilyClient } = require('@tavily/core');
    const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
    const queries = [
      `${niche} problemas dores reclamações PME Brasil gestores`,
      `${niche} reviews clientes dificuldades operações`,
      `gestores donos pequenas empresas BH desafios 2026`,
      `${niche} fórum comentários linguagem real`,
    ];
    const results = [];
    for (const q of queries.slice(0, 3)) {
      const res = await tavily.search({ query: q, maxResults: 3, searchDepth: 'basic' });
      results.push(...(res.results || []));
    }
    return results;
  } catch { return []; }
}

async function buildAudienceMapWithClaude(audienceData = {}, tavilyResults = []) {
  const webText = tavilyResults.map(r => `• ${r.title}: ${r.content?.slice(0, 220)}`).join('\n');
  const hasRealData = webText.length > 50;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Audience Research Agent Enterprise da SmartOps IA.

Missão: Mapear com precisão o público-alvo — dores reais, desejos, objeções, linguagem e gatilhos de compra.
Mantra: "Falar a língua do cliente é a maior vantagem competitiva."

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH, MG
Público primário: ${CONFIG.target_audience.primary}
Dores conhecidas: ${CONFIG.target_audience.pain}
Desejo central: ${CONFIG.target_audience.desire}
Objeções conhecidas: ${CONFIG.target_audience.objections.join(', ')}
Canais usados: ${CONFIG.target_audience.channels.join(', ')}

${hasRealData ? `DADOS DE VOZ DO CLIENTE (Tavily):\n${webText}\n---` : 'Sem dados externos — construir com base em conhecimento. Declarar limitações.'}
Fontes de pesquisa monitoradas: ${AUDIENCE_SOURCES.join(', ')}
${Object.keys(audienceData).length ? `Dados internos: ${JSON.stringify(audienceData, null, 2)}` : ''}

REGRAS DE EVIDÊNCIA:
- Separar Fato / Sinal / Hipótese / Opinião para cada insight
- Indicar de onde veio cada dado (fonte e classificação A/B/C/D)
- Frases reais: usar linguagem coloquial, não corporativa
- Triangular: dados de mercado + voz do cliente + movimento de concorrentes

Construa o Mapa de Público Enterprise completo:

# AUDIENCE INTELLIGENCE MAP — SmartOps IA

## PERFIL DETALHADO
Quem é (demographics + psychographics):
Cargo/função: | Tamanho da empresa: | Setor principal: | Localização:
Dia a dia típico: | Maior frustração no trabalho: | O que o mantém acordado às 3h:

## TIPO DE INFORMAÇÃO DESTA ANÁLISE
${hasRealData ? 'Dados reais (Tavily) + conhecimento do modelo — confiança média/alta' : 'Conhecimento do modelo sem dados externos — tratar como hipóteses qualificadas'}

## MAPA DE DORES
| Dor | Tipo (Fato/Sinal/Hipótese) | Frequência | Impacto | Fonte |
|---|---|---|---|---|

### Dores Superficiais (o que reclamam)
* [Dor visível]

### Dores Profundas (o que realmente sentem)
* [Dor emocional]

### Dores Financeiras (custo do problema)
* [Impacto em R$]

## MAPA DE DESEJOS
* [Desejo expresso]
* [Desejo oculto — o que queriam mas nunca pediram]

## MAPA DE OBJEÇÕES
| Objeção | Origem | Resposta ideal SmartOps | Conteúdo que resolve |
|---|---|---|---|

## VOZ DO CLIENTE — FRASES REAIS
[20 frases que um gestor PME de BH realmente usaria — linguagem coloquial, sem corporativês]
1. "[Frase]"
2. "[Frase]"
[...]

## LINGUAGEM QUE FUNCIONA (usar no marketing)
* [Termo]

## LINGUAGEM A EVITAR (distancia o público)
* [Termo]

## GATILHOS DE COMPRA
* [O que faz esse público agir — urgência, prova, autoridade, simplicidade]

## JORNADA DO CLIENTE SmartOps
ESTÁGIO 1 — CONSCIÊNCIA: como descobre o problema
ESTÁGIO 2 — CONSIDERAÇÃO: como pesquisa soluções
ESTÁGIO 3 — DECISÃO: o que precisa ver para fechar
ESTÁGIO 4 — IMPLEMENTAÇÃO: o que precisa para ter sucesso
ESTÁGIO 5 — DEFESA: o que tornaria ele promotor

## CRITÉRIOS DE DECISÃO DE COMPRA
* [O que o cliente pergunta antes de fechar]

## MENSAGENS POR CANAL
| Canal | Tom | Gancho recomendado | CTA |
|---|---|---|---|

## SCORE DE CONFIANÇA DESTA ANÁLISE
Nota: X/100 | Classificação: | Limitações:

## INSIGHTS ACIONÁVEIS
[5 descobertas que devem mudar a comunicação da SmartOps imediatamente]
1. Insight: | Tipo: | Ação:

## HANDOFF
Ads Agent: [como usar esses dados em anúncio]
Content Agent: [como usar esses dados em conteúdo]
Sales Agent: [como usar em script de venda]
Copywriter Agent: [frases e ganchos para usar]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { buildAudienceMapWithClaude, researchAudienceWithTavily, AUDIENCE_SOURCES };
