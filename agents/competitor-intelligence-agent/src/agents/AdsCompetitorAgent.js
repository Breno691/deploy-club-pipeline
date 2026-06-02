// AdsCompetitorAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Padrões de anúncios detectáveis ─────────────────────────────────────────

const AD_ANGLES = {
  pain:        'Ataca dor direta — ex: "Cansado de retrabalho?"',
  result:      'Promete resultado — ex: "Reduza 40% do retrabalho em 30 dias"',
  curiosity:   'Gera curiosidade — ex: "O erro que toda PME comete em processos"',
  authority:   'Posiciona autoridade — ex: "15 anos em Lean Six Sigma"',
  free:        'Oferta gratuita — ex: "Diagnóstico gratuito de processos"',
  social_proof:'Prova social — ex: "50+ empresas transformadas em BH"',
  urgency:     'Urgência/escassez — ex: "Últimas 3 vagas para diagnóstico"',
  comparison:  'Comparação implícita — ex: "Não é coaching, é resultado"',
};

const AD_CTAs = [
  'Agendar diagnóstico gratuito',
  'Falar no WhatsApp',
  'Ver como funciona',
  'Baixar guia gratuito',
  'Participar do evento',
  'Ver cases',
  'Simular economia',
];

function scoreAdStrength({ hasNumbers, hasSocialProof, hasUrgency, hasClearCTA, hasLandingPage }) {
  let score = 0;
  if (hasNumbers)      score += 25;
  if (hasSocialProof)  score += 20;
  if (hasUrgency)      score += 15;
  if (hasClearCTA)     score += 25;
  if (hasLandingPage)  score += 15;
  return { score, level: score >= 70 ? 'FORTE' : score >= 40 ? 'MÉDIO' : 'FRACO' };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function analyzeCompetitorAd({ competitor, platform, offer, adCopy = '', hook = '', context = '' }) {
  const adAnglesList = Object.entries(AD_ANGLES).map(([k, v]) => `- ${k}: ${v}`).join('\n');

  const prompt = `Você é o Ads Competitor Agent da SmartOps IA.
Sua missão é analisar anúncios de concorrentes e criar contra-movimentos para a SmartOps.

SmartOps IA: ${CONFIG.company.positioning}

CONCORRENTE: ${competitor}
PLATAFORMA: ${platform} (Meta Ads / Google Ads / YouTube)
OFERTA DETECTADA: ${offer}
COPY DO ANÚNCIO: ${adCopy || 'não informado — analisar com base no tipo de empresa e plataforma'}
HOOK: ${hook || 'não informado'}
CONTEXTO: ${context || 'anúncio típico de consultoria/automação em BH'}

ÂNGULOS DE ANÚNCIO COMUNS:
${adAnglesList}

CTAs MAIS USADOS NO SETOR:
${AD_CTAs.join(' | ')}

Analise e gere:

COMPETITOR: ${competitor}
PLATFORM: ${platform}
AD_ANGLE: [qual ângulo está usando]
HOOK: [hook provável ou analisado]
OFFER: ${offer}
DESTINATION: [vai para WhatsApp / landing page / formulário]
CTA: [CTA do anúncio]

STRENGTH: [o que o anúncio faz bem]
WEAKNESS: [o que o anúncio faz mal — fraqueza explorável]
MISSING_ELEMENT: [o que falta que a SmartOps pode ter]

SMARTOPS_COUNTER_MOVE:
ANGLE: [ângulo diferente para responder]
HOOK: [hook mais forte para a SmartOps]
OFFER: [oferta concorrente ou superior]
COPY_HEADLINE: [headline do anúncio SmartOps — máximo 10 palavras]
BODY_COPY: [copy do anúncio — 2-3 linhas]
CTA: [CTA recomendado]
LANDING_PAGE: [para onde enviar]
FORMAT: [formato recomendado — carrossel/vídeo/imagem]

DIFFERENTIATION: [mensagem que diferencia SmartOps desse anúncio]
OWNER_AGENT: Video Ad Agent + Copywriter Agent
PRIORITY: [Alta / Média / Baixa]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { competitor, platform, offer, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { analyzeCompetitorAd, scoreAdStrength, AD_ANGLES, AD_CTAs };
