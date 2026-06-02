// CreativeTestingAgent.js — Testa criativos (imagens, vídeos, hooks) em ads e redes sociais
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Elementos de criativo a testar (por prioridade de impacto)
const CREATIVE_ELEMENTS = [
  { element: 'hook_texto',    impact: 10, desc: 'Primeira frase/texto do anúncio ou legenda',   easy: 9 },
  { element: 'thumbnail',     impact: 9,  desc: 'Imagem de capa do vídeo ou carrossel',          easy: 7 },
  { element: 'headline_ad',   impact: 9,  desc: 'Título principal do anúncio',                   easy: 10 },
  { element: 'cta_texto',     impact: 8,  desc: 'Texto do botão ou chamada para ação',           easy: 10 },
  { element: 'formato',       impact: 8,  desc: 'Reels vs Carrossel vs Estático vs Story',       easy: 6  },
  { element: 'cor_dominante', impact: 7,  desc: 'Cor principal do visual',                       easy: 8  },
  { element: 'person_vs_sem', impact: 8,  desc: 'Rosto humano vs imagem de produto/resultado',  easy: 7  },
  { element: 'storytelling',  impact: 9,  desc: 'Angulo da história: dor / desejo / solução',   easy: 8  },
  { element: 'prova_social',  impact: 8,  desc: 'Com ou sem depoimento/número/logo',             easy: 7  },
  { element: 'duracao_video', impact: 7,  desc: '15s vs 30s vs 60s vs 90s',                     easy: 6  },
];

function scoreCreativeElement(element, currentCTR, variantCTR) {
  const uplift = currentCTR > 0 ? ((variantCTR - currentCTR) / currentCTR) * 100 : 0;
  const elem   = CREATIVE_ELEMENTS.find(e => e.element === element);
  return {
    element,
    impact_weight: elem?.impact || 5,
    current_ctr:   currentCTR,
    variant_ctr:   variantCTR,
    uplift_pct:    Math.round(uplift * 10) / 10,
    significant:   Math.abs(uplift) >= 15,
    winner:        variantCTR > currentCTR ? 'variante' : variantCTR < currentCTR ? 'controle' : 'empate',
  };
}

function prioritizeCreativeTests(current_metrics = {}) {
  const { ctr = 0, platform = 'meta_ads', frequency = 0 } = current_metrics;
  const priorities = [];

  if (ctr < 1.5 && platform === 'meta_ads')  priorities.push({ element: 'hook_texto', reason: 'CTR < 1.5% Meta — gancho textual fraco', priority: 1 });
  if (ctr < 3 && platform === 'google_ads')  priorities.push({ element: 'headline_ad', reason: 'CTR < 3% Google — headline sem apelo', priority: 1 });
  if (frequency >= 3)                        priorities.push({ element: 'formato', reason: `Frequência ${frequency} — criativo saturado`, priority: 1 });
  if (ctr > 2 && current_metrics.cpa > 400)  priorities.push({ element: 'cta_texto', reason: 'CTR ok mas CPA alto — CTA não converte', priority: 2 });

  // Adiciona elementos de alto impacto não testados
  CREATIVE_ELEMENTS.filter(e => !priorities.find(p => p.element === e.element))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .forEach((e, i) => priorities.push({ element: e.element, reason: `Alto impacto (${e.impact}/10) — não testado ainda`, priority: 3 + i }));

  return priorities;
}

async function analyzeCreativesWithClaude(creativeData, platform = 'meta_ads') {
  const priorities = prioritizeCreativeTests(creativeData.metrics || {});

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Creative Testing Agent da SmartOps IA.

Missão: Identificar problemas nos criativos e criar testes A/B específicos para aumentar CTR, engajamento e conversão.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Plataforma: ${platform}
Dados do criativo: ${JSON.stringify(creativeData, null, 2)}

Elementos prioritários a testar:
${priorities.slice(0, 5).map((p, i) => `${i + 1}. ${p.element} — ${p.reason} (prioridade ${p.priority})`).join('\n')}

Elementos de criativo por impacto:
${CREATIVE_ELEMENTS.map(e => `${e.element}: impacto ${e.impact}/10`).join(' | ')}

Responda:

# CREATIVE TESTING REPORT — ${platform}

## DIAGNÓSTICO DOS CRIATIVOS ATUAIS
[O que está funcionando e o que não está — baseado nos dados]

## TESTES A/B RECOMENDADOS (TOP 3)
Para cada teste:
ELEMENTO: [o que testar]
HIPÓTESE: [por que a variante deve ganhar]
CONTROLE (A): [descrição do criativo atual]
VARIANTE (B): [descrição do criativo novo — seja específico]
MÉTRICA: [CTR / CPA / ROAS / Engajamento]
DURAÇÃO: [dias ou impressões mínimas]
CRITÉRIO VENCEDOR: [o que precisa acontecer]
ESFORÇO DE PRODUÇÃO: [Baixo/Médio/Alto]

## HOOKS SUGERIDOS PARA SMARTOPS
[5 hooks de abertura para testar em anúncios sobre Lean + IA]

## ÂNGULOS DE STORYTELLING A EXPLORAR
[3 ângulos diferentes para a mesma oferta]

## QUICK WIN DE CRIATIVO
[O criativo mais simples de mudar com maior probabilidade de melhora]

## PRÓXIMA AÇÃO
[O que produzir/testar esta semana]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { analyzeCreativesWithClaude, prioritizeCreativeTests, scoreCreativeElement, CREATIVE_ELEMENTS };
