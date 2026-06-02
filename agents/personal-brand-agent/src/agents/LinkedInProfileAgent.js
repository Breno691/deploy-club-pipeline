// LinkedInProfileAgent.js — Personal Brand Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { BRENO } = require('../config');

const client = new Anthropic();

// ── Generate complete LinkedIn profile optimization ────────────────────────────
async function generateLinkedInProfile() {
  const prompt = `Você é o LinkedIn Profile Agent da SmartOps IA.

Crie uma página de LinkedIn completa e otimizada para ${BRENO.name}.

Objetivo: gerar autoridade B2B, leads inbound e reuniões comerciais.

Retorne JSON:
{
  "headline": "${BRENO.headlines.linkedin}",
  "about": "texto completo do about com parágrafos curtos, CTA no final",
  "featured_section": ["item 1: case ou diagnóstico grátis", "item 2: vídeo autoridade", "item 3: artigo"],
  "experience_first_line": "descrição da SmartOps IA em 1 frase",
  "skills_top5": ["Lean Six Sigma", "Six Sigma", "Melhoria Contínua", "Automação de Processos", "IA Aplicada"],
  "cta": "Me chame para uma avaliação operacional gratuita.",
  "banner_text": "texto curto para banner do LinkedIn",
  "creator_mode": "Temas: Lean | Automação | IA | Processos | PME | BH",
  "recommended_hashtags": ["#lean", "#sixsigma", "#automacao", "#PME", "#BH", "#melhoriaContinua"],
  "weekly_posting_plan": "2-3 posts/semana — mistura autoridade técnica + bastidor + opinião",
  "optimization_score": 0-100,
  "missing_elements": ["o que falta para perfil 100%"]
}

ABOUT deve:
- Começar com hook (dor ou promessa)
- Explicar o que faz em linguagem simples
- Listar especialidades
- Citar BH/MG explicitamente
- Terminar com CTA claro`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 3000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LinkedInProfileAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate a LinkedIn post from a topic ─────────────────────────────────────
async function generateLinkedInPost({ topic, type = 'autoridade', cta = 'suave' }) {
  const prompt = `Crie um post de LinkedIn para ${BRENO.name}.

Tom: claro, direto, educativo, sem jargão acadêmico, parágrafos curtos
Tema: ${topic}
Tipo: ${type}
CTA: ${cta}

Estrutura:
- Hook forte (1-2 linhas)
- Desenvolvimento em parágrafos curtos (3-4 blocos)
- Insight ou aprendizado concreto
- CTA suave

Retorne JSON:
{
  "topic": "${topic}",
  "hook": "...",
  "full_post": "...",
  "cta_line": "...",
  "estimated_performance": "...",
  "best_posting_time": "Terça ou quarta, 8h ou 12h"
}`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 1500,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('generateLinkedInPost: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateLinkedInProfile, generateLinkedInPost };
