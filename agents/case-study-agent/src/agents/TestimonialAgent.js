// TestimonialAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

const TESTIMONIAL_QUESTIONS = [
  'Qual era o principal problema antes do projeto?',
  'Como esse problema impactava a operação no dia a dia?',
  'O que mudou depois da implementação?',
  'Qual resultado mais chamou atenção?',
  'Como você descreveria a experiência com a SmartOps?',
  'Você recomendaria para outras empresas? Por quê?',
];

function scoreTestimonialStrength({ hasNumbers, hasEmotion, hasRecommendation, hasBefore, hasAfter, wordCount }) {
  let score = 0;
  if (hasNumbers)         score += 25;
  if (hasEmotion)         score += 20;
  if (hasRecommendation)  score += 20;
  if (hasBefore)          score += 15;
  if (hasAfter)           score += 15;
  if (wordCount > 50)     score += 5;

  let level = '';
  if (score >= 80) level = 'EXCELENTE — usar em site, proposta e anúncio';
  else if (score >= 55) level = 'FORTE — usar em proposta e post';
  else if (score >= 35) level = 'VÁLIDO — usar em reunião de venda';
  else level = 'FRACO — usar apenas internamente';

  return { score, level };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateTestimonialRequest({ clientName, sector, result, context = '' }) {
  const prompt = `Você é o Testimonial Agent da SmartOps IA.
Sua missão é coletar e transformar depoimentos de clientes em prova social poderosa.

CLIENTE: ${clientName}
SETOR: ${sector}
RESULTADO PRINCIPAL: ${result}
CONTEXTO: ${context || 'nenhum'}

PERGUNTAS RECOMENDADAS PARA COLETAR O DEPOIMENTO:
${TESTIMONIAL_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Com base no resultado "${result}", gere:

REQUEST_MESSAGE: [mensagem amigável pedindo o depoimento — tom natural, sem pressão]

SCRIPT_DE_COLETA: [roteiro de 5-6 perguntas específicas para este caso]

DEPOIMENTO_CURTO_SUGERIDO: [versão curta de 1-2 frases para usar em proposta]

DEPOIMENTO_LONGO_SUGERIDO: [versão completa de 4-6 frases para usar no site]

QUOTE_PARA_POST: [frase de impacto com aspas para usar em post]

QUOTE_PARA_PROPOSTA: [frase de autoridade para incluir em proposta comercial]

QUOTE_PARA_SLIDE: [frase curta e forte para slide comercial]

USO_RECOMENDADO: [onde usar cada versão do depoimento]

NIVEL_PERMISSAO_NECESSARIO: [nível mínimo de permissão para usar]

DICA_DE_COLETA: [como abordar o cliente para maximizar qualidade do depoimento]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    clientName,
    sector,
    result,
    questions: TESTIMONIAL_QUESTIONS,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

async function formatTestimonial({ rawTestimonial, clientName, sector }) {
  const prompt = `Você é o Testimonial Agent da SmartOps IA.
Formate este depoimento bruto em versões otimizadas para diferentes canais.

CLIENTE: ${clientName} — ${sector}
DEPOIMENTO BRUTO:
"${rawTestimonial}"

Gere:

DEPOIMENTO_EDITADO: [versão limpa, mantendo a voz do cliente]
VERSAO_CURTA: [1-2 frases com o mais impactante]
VERSAO_LONGA: [4-6 frases completas]
QUOTE_DESTAQUE: [a melhor frase isolada para highlight]
HEADLINE_SUGERIDA: ["[Nome], [cargo/setor], sobre a SmartOps IA"]
PONTUACAO: [0-100, explicar o que fortalece e o que falta]
RECOMENDACAO_DE_USO: [site / proposta / post / slide / anúncio]
COMPLEMENTO_SUGERIDO: [qual pergunta adicional completaria o depoimento]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    clientName,
    sector,
    rawTestimonial,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { generateTestimonialRequest, formatTestimonial, scoreTestimonialStrength, TESTIMONIAL_QUESTIONS };
