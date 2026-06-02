// LinkedInThoughtLeadershipAgent.js — Authority Building Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const CONTENT_TYPES = {
  'opinion':    'Post de opinião controversa sobre gestão de PMEs',
  'framework':  'Framework próprio de análise ou diagnóstico',
  'case':       'Case de sucesso (antes/depois) com resultado concreto',
  'lesson':     'Lição aprendida do campo, com história real',
  'data':       'Dado surpreendente sobre desperdício em PMEs',
  'how_to':     'Guia prático de como fazer algo operacional',
  'thread':     'Thread com 5-7 insights encadeados',
  'carrossel':  'Roteiro de carrossel educativo',
  'article':    'Artigo longo de 800-1200 palavras',
};

async function generateLinkedInContent(topic, contentType = 'opinion', pillar = 'lean') {
  const typeDesc = CONTENT_TYPES[contentType] || contentType;

  const prompt = `Você é o LinkedIn Thought Leadership Agent da SmartOps IA.

Speaker: Breno Luiz — Black Belt Lean Six Sigma | Especialista em Automação e IA para PMEs
Empresa: SmartOps IA — BH/MG
Posicionamento: ${CONFIG.speaker.positioning_short}

Crie conteúdo LinkedIn para posicionar Breno como autoridade em PMEs.

Tema: ${topic}
Tipo: ${typeDesc}
Pilar: ${pillar}

Diretrizes de tom:
- Direto, sem academicismo
- Baseado em situações reais de PMEs
- Sempre com insight prático
- Nunca genérico — sempre específico
- CTA sutil mas presente
- Linguagem do empresário, não do consultor

Retorne JSON:
{
  "content_type": "${contentType}",
  "pillar": "${pillar}",
  "topic": "${topic}",
  "headline": "primeira linha — deve parar o scroll",
  "hook": "gancho das primeiras 3 linhas para não cortar texto",
  "full_content": "conteúdo completo para publicar",
  "cta": "call-to-action ao final",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "best_day_to_post": "segunda | terça | quarta | quinta | sexta",
  "best_time": "horário ideal",
  "engagement_prediction": "alto | médio | baixo",
  "repurpose_ideas": ["como reaproveitar este conteúdo"],
  "image_suggestion": "sugestão de imagem/visual para acompanhar",
  "follow_up_post": "ideia de post de continuação"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LinkedInAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.generated_at = new Date().toISOString();
  return data;
}

async function generateWeeklyLinkedInPlan(weekTheme = '') {
  const prompt = `Você é o LinkedIn Thought Leadership Agent da SmartOps IA.

Crie um plano de conteúdo LinkedIn para a semana.

Speaker: Breno Luiz — Lean Six Sigma + IA para PMEs — BH
Empresa: SmartOps IA

Tema da semana: ${weekTheme || 'livre — escolha o melhor tema para crescimento de autoridade'}

Pilares disponíveis: ${CONFIG.pillars.map(p => p.label).join(', ')}

Retorne JSON:
{
  "week_theme": "tema da semana",
  "pillar_focus": "pilar principal desta semana",
  "posts": [
    {
      "day": "Segunda",
      "type": "tipo de conteúdo",
      "topic": "tema específico",
      "headline": "primeira linha do post",
      "format": "texto | carrossel | artigo | thread",
      "goal": "objetivo deste post"
    }
  ],
  "content_calendar": "visão geral da semana",
  "authority_goal": "como esta semana constrói autoridade",
  "engagement_strategy": "como maximizar engajamento qualificado",
  "lead_generation_post": "qual post tem mais potencial de gerar leads diretos"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LinkedInAgent plan: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateLinkedInContent, generateWeeklyLinkedInPlan, CONTENT_TYPES };
