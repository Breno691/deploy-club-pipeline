// CreativeAnalysisAgent.js — Avalia criativos de ads (CTR, hook, saturação)
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Classificação de performance de criativo
const CREATIVE_STATUS = {
  WINNER:     { min_ctr: 3,    min_conv: 0.03, label: 'Vencedor',   action: 'Escalar e criar variações' },
  PROMISING:  { min_ctr: 1.5,  min_conv: 0.01, label: 'Promissor',  action: 'Testar com mais budget' },
  AVERAGE:    { min_ctr: 0.8,  min_conv: 0.005,label: 'Mediano',    action: 'Otimizar hook e CTA' },
  SATURATED:  { min_ctr: null, max_freq: 3.5,  label: 'Saturado',   action: 'Renovar ou pausar' },
  WEAK:       { min_ctr: 0,    min_conv: 0,    label: 'Fraco',      action: 'Pausar e substituir' },
};

function classifyCreative(metrics = {}) {
  const { ctr = 0, conv_rate = 0, frequency = 0, impressions = 0 } = metrics;

  if (frequency > 3.5) return { ...CREATIVE_STATUS.SATURATED, ctr, frequency };
  if (ctr >= 3 && conv_rate >= 0.03) return { ...CREATIVE_STATUS.WINNER, ctr, conv_rate };
  if (ctr >= 1.5 && conv_rate >= 0.01) return { ...CREATIVE_STATUS.PROMISING, ctr, conv_rate };
  if (ctr >= 0.8) return { ...CREATIVE_STATUS.AVERAGE, ctr, conv_rate };
  return { ...CREATIVE_STATUS.WEAK, ctr, conv_rate };
}

function auditCreativePortfolio(creatives = []) {
  const classified = creatives.map(c => ({
    ...c,
    status: classifyCreative(c.metrics || {}),
  }));

  return {
    total:      classified.length,
    winners:    classified.filter(c => c.status.label === 'Vencedor'),
    saturated:  classified.filter(c => c.status.label === 'Saturado'),
    weak:       classified.filter(c => c.status.label === 'Fraco'),
    to_pause:   classified.filter(c => ['Fraco', 'Saturado'].includes(c.status.label)).length,
    to_scale:   classified.filter(c => c.status.label === 'Vencedor').length,
    avg_ctr:    classified.length ? (classified.reduce((s, c) => s + (c.metrics?.ctr || 0), 0) / classified.length).toFixed(2) : 0,
    creatives:  classified,
  };
}

async function analyzeCreativesWithClaude(creativeData, platform = 'meta_ads') {
  const portfolio = Array.isArray(creativeData) ? auditCreativePortfolio(creativeData) : { creatives: [creativeData] };

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Creative Analysis Agent da SmartOps IA.

Missão: Analisar performance de criativos de ads, identificar padrões de sucesso e recomendar próximas criações.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Plataforma: ${platform}
Portfolio: ${portfolio.total} criativos | Vencedores: ${portfolio.winners?.length || 0} | Saturados: ${portfolio.saturated?.length || 0} | Fracos: ${portfolio.weak?.length || 0}

Dados detalhados: ${JSON.stringify(portfolio.creatives?.slice(0, 5) || creativeData, null, 2)}

Benchmarks ${platform}:
${JSON.stringify(CONFIG.benchmarks[platform.includes('meta') ? 'meta_ads' : 'google_search'], null, 2)}

Responda:

# CREATIVE ANALYSIS REPORT — ${platform}

## DIAGNÓSTICO DO PORTFOLIO
[O que está funcionando, o que está morto, o que precisa renovar]

## CRIATIVOS PARA PAUSAR (urgente)
[Saturados ou fracos — impacto de mantê-los rodando]

## CRIATIVOS PARA ESCALAR
[Vencedores — recomendação de budget e variações]

## PADRÕES DOS VENCEDORES
[O que os criativos com melhor performance têm em comum]

## PRÓXIMAS CRIAÇÕES (baseado nos padrões)
Para cada novo criativo sugerido:
TIPO: [formato]
HOOK: [primeira frase/imagem — exato]
ÂNGULO: [dor/desejo/solução/prova]
CTA: [call to action]
POR QUE VAI FUNCIONAR: [baseado nos dados]

## ANÁLISE DE FADIGA
[Frequência × CTR — quem está morrendo]

## PLANO DE PRODUÇÃO CRIATIVA
Semana 1: [o que produzir]
Semana 2: [variações dos vencedores]

## CONCLUSÃO
[O criativo mais urgente a pausar + o mais urgente a criar]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { analyzeCreativesWithClaude, auditCreativePortfolio, classifyCreative, CREATIVE_STATUS };
