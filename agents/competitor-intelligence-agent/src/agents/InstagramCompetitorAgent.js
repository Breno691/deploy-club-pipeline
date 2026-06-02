// InstagramCompetitorAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Padrões detectáveis localmente ──────────────────────────────────────────

const COMMON_HOOKS = [
  'Se você [dor], isso vai te interessar',
  'O erro que 90% das empresas cometem',
  'Como [resultado] sem [esforço/custo]',
  'Você sabia que [dado surpreendente]?',
  'Por que [método] não funciona mais',
  'O que [tipo de empresa] está fazendo errado',
  '3 sinais de que sua empresa precisa de [solução]',
  'Antes e depois: como [cliente] foi de [problema] a [resultado]',
];

const COMMON_THEMES = [
  'produtividade', 'automação', 'redução de custo', 'retrabalho',
  'processos', 'lean', 'IA para negócios', 'empreendedorismo',
  'gestão', 'resultados', 'eficiência', 'lucro',
];

function detectContentGaps(competitorThemes) {
  const covered = (competitorThemes || []).map(t => t.toLowerCase());
  const gaps = COMMON_THEMES.filter(t => !covered.some(c => c.includes(t.split(' ')[0])));
  return gaps;
}

function scoreContentEngagement(likes, comments, shares, followers) {
  if (!followers) return 0;
  const er = ((likes + comments * 3 + (shares || 0) * 5) / followers) * 100;
  return parseFloat(er.toFixed(2));
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function analyzeInstagramCompetitor({ competitor, profile, context = '', recentContent = '' }) {
  const prompt = `Você é o Instagram Competitor Agent da SmartOps IA.
Sua missão é analisar um perfil concorrente e encontrar oportunidades de conteúdo para a SmartOps.

SmartOps IA: ${CONFIG.company.positioning}.
Instagram SmartOps: ${CONFIG.company.instagram}

CONCORRENTE: ${competitor}
PERFIL: ${profile}
CONTEXTO: ${context || 'consultor/agência de automação, lean ou processos'}
CONTEÚDO RECENTE OBSERVADO: ${recentContent || 'não informado — analisar baseado no perfil e tipo de empresa'}

HOOKS MAIS USADOS NO MERCADO:
${COMMON_HOOKS.map((h, i) => `${i+1}. ${h}`).join('\n')}

TEMAS COMUNS DO MERCADO:
${COMMON_THEMES.join(', ')}

Analise o perfil e gere:

COMPETITOR: ${competitor}
PROFILE: ${profile}
TYPE: [tipo — consultor solo/agência/software/criador]

TOP_CONTENT: [tipos de post que mais engajam para esse perfil]
TOP_HOOKS: [hooks que eles provavelmente usam]
THEMES: [temas principais]
POSTING_FREQUENCY: [frequência estimada]
VISUAL_IDENTITY: [padrão visual — cores, tipografia, estilo]
CTA_PATTERNS: [CTAs que usam]
OFFERS_VISIBLE: [ofertas que aparecem no perfil]
PROOF_SOCIAL: [que prova social mostram]

AUDIENCE_QUESTIONS: [que dúvidas o público deles provavelmente tem]
CONTENT_GAPS: [o que eles NÃO falam que a SmartOps deveria explorar]
WEAKNESSES: [fraquezas do conteúdo deles]

SMARTOPS_CONTENT_IDEAS:
1. [ideia de post — tema + hook — direto, não copiar]
2. [ideia de reel — roteiro básico]
3. [ideia de carrossel]
4. [ângulo diferente do mesmo tema]
5. [conteúdo que explora gap identificado]

DIFFERENTIATION_MESSAGE: [como a SmartOps se posiciona diferente desse perfil]
RECOMMENDATION: [ação prioritária de conteúdo baseada nessa análise]
OWNER_AGENT: Copywriter Agent + Design Agent`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    competitor,
    profile,
    commonHooks: COMMON_HOOKS,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { analyzeInstagramCompetitor, detectContentGaps, scoreContentEngagement, COMMON_HOOKS, COMMON_THEMES };
