// TrendsResearchAgent.js — Pesquisa e análise enterprise de tendências
// v2.0.0-enterprise: classificação A-D, triangulação, score de confiança
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const TREND_CLASSIFICATION = {
  FORTE:    { label: 'Tendência Forte',    desc: 'Cresce em múltiplas fontes, aplicação prática clara, dor real',      action: 'Criar conteúdo imediatamente, considerar oferta' },
  EMERGENTE:{ label: 'Tendência Emergente',desc: 'Crescendo, pouco saturado, ainda sem concorrência forte',            action: 'Monitorar e testar pequeno' },
  SATURADA: { label: 'Tendência Saturada', desc: 'Muito explorada, difícil diferenciar, todos dizem o mesmo',          action: 'Evitar ou diferenciar muito' },
  MODINHA:  { label: 'Modinha',            desc: 'Depende de viral, sem base sólida, pode morrer rápido',              action: 'Não investir — risco de rejeição' },
  EMERGINDO:{ label: 'Sinal Emergente',    desc: 'Poucos sinais mas consistentes — vale monitorar',                    action: 'Monitorar por 2-4 semanas' },
  FRACA:    { label: 'Tendência Fraca',    desc: 'Pouca evidência, baixo interesse, sem urgência',                     action: 'Ignorar por enquanto' },
};

async function researchTrendsWithTavily(topic, niche = '') {
  if (!process.env.TAVILY_API_KEY) return { results: [], source: 'sem_tavily' };
  try {
    const { TavilyClient } = require('@tavily/core');
    const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
    const queries = [
      `${topic} tendências 2026 Brasil PME dados`,
      `${topic} market growth small business 2026`,
      `${niche || topic} oportunidade mercado crescimento`,
      `${topic} comportamento consumidor mudança recente`,
    ];
    const allResults = [];
    for (const q of queries.slice(0, 4)) {
      const res = await tavily.search({ query: q, maxResults: 3, searchDepth: 'basic' });
      allResults.push(...(res.results || []));
    }
    return { results: allResults.slice(0, 10), source: 'tavily', query_count: queries.length };
  } catch (e) {
    return { results: [], source: 'tavily_error', error: e.message };
  }
}

async function analyzeTrendsWithClaude(topic, tavilyResults = []) {
  const trendText = tavilyResults.map(r => `• ${r.title} [${r.url || 'sem URL'}]: ${r.content?.slice(0, 280)}`).join('\n\n');
  const hasRealData = trendText.length > 50;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Trends Research Agent Enterprise da SmartOps IA — área de Market Intelligence.

Missão: Identificar, classificar e transformar tendências de mercado em oportunidades práticas para marketing, vendas e produto.
Mantra: "Nunca achismo. Sempre evidência."

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH, MG
Público-alvo: ${CONFIG.target_audience.primary}
Dores conhecidas: ${CONFIG.target_audience.pain}
Concorrentes monitorados: ${CONFIG.competitors.map(c => c.name).join(', ')}

Tema pesquisado: "${topic}"

${hasRealData ? `DADOS EM TEMPO REAL (Tavily):\n${trendText}\n---` : 'Sem dados Tavily — análise baseada em conhecimento do modelo. Declarar como limitação.'}

## REGRAS DE EVIDÊNCIA
- Classificar cada fonte: A (oficial/confiável), B (boa/especializada), C (média/viés possível), D (fraca/isolada)
- Separar Fato / Sinal / Tendência / Hipótese / Opinião / Ruído
- Triangular: dados de mercado + voz do cliente + movimento de concorrentes
- Nunca inventar estatísticas. Quando incerto, declarar como hipótese.

## CLASSIFICAÇÕES DE TENDÊNCIA DISPONÍVEIS
${Object.entries(TREND_CLASSIFICATION).map(([k, v]) => `${v.label}: ${v.desc} → ${v.action}`).join('\n')}

Responda com o formato completo:

# TRENDS RESEARCH REPORT — ${topic}

## SCORE DE CONFIANÇA
Nota: X/100
Classificação: Alta (90-100) / Boa (75-89) / Moderada (60-74) / Baixa (<60)
${hasRealData ? 'Fonte: dados em tempo real Tavily' : 'Fonte: conhecimento do modelo — sem dados externos. Tratar como hipóteses.'}
Limitações: [O que ainda precisa ser validado]

## MATRIZ DE TRIANGULAÇÃO
| Hipótese/Tendência | Mercado confirma? | Cliente confirma? | Concorrente confirma? | Confiança |
|---|---|---|---|---|

## TENDÊNCIAS IDENTIFICADAS (máximo 5)

Para cada tendência:
TENDÊNCIA: [nome claro]
CLASSIFICAÇÃO: [Forte/Emergente/Saturada/Modinha/Sinal Emergente/Fraca]
TIPO DE INFORMAÇÃO: [Fato/Sinal/Tendência/Hipótese]
EVIDÊNCIA: [dado ou sinal que confirma — com fonte e classificação A/B/C/D]
FORÇA: 1-10
POR QUE IMPORTA PARA SMARTOPS: [impacto direto no negócio]
OPORTUNIDADE: [ação concreta — conteúdo, oferta, campanha ou SEO]
RISCO: [possível armadilha]
PRIORIDADE: P1/P2/P3
AÇÃO IMEDIATA: [o que fazer esta semana]

## SCORE DE TENDÊNCIA (para a mais forte)
| Critério | Nota 0-10 |
|---|---|
| Recência | |
| Repetição em fontes | |
| Força da dor | |
| Interesse do público | |
| Movimento de concorrentes | |
| Potencial comercial | |
| Baixo risco de modinha | |
| Facilidade de aplicar | |
Total: X/80

## OPORTUNIDADE PRINCIPAL
[A tendência com maior ROI para SmartOps agora — explicar por quê]

## IDEIAS BASEADAS NAS TENDÊNCIAS
| Tipo | Tema | Canal | Gancho | Prioridade |
|---|---|---|---|---|

## RED FLAGS IDENTIFICADOS
[Sinais perigosos ou de modinha — o que evitar]

## O QUE MONITORAR
[Sinais a acompanhar nas próximas semanas]

## HANDOFF RECOMENDADO
Agente: | Tarefa específica:`,
    }],
  });

  return response.content[0].text;
}

module.exports = { researchTrendsWithTavily, analyzeTrendsWithClaude, TREND_CLASSIFICATION };
