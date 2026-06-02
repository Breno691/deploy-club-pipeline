// NarrativeAgent.js — Personal Brand Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { BRENO } = require('../config');

const client = new Anthropic();

const NARRATIVE_TYPES = {
  origin:         'Por que Breno escolheu Lean e como chegou ao Black Belt',
  authority:      'O que qualifica Breno para ser referência',
  transformation: 'Resultado concreto que Breno gerou para uma empresa',
  mission:        'Por que ajuda PMEs especificamente',
  belief:         'Opinião forte sobre mercado, IA, processos ou gestão',
  backstage:      'Bastidor de um projeto ou diagnóstico real',
  lesson:         'Aprendizado de projeto que virou insight público',
};

// ── Generate a narrative for a specific type ───────────────────────────────────
async function generateNarrative({ type, context = '', platform = 'instagram', format = 'post' }) {
  const typeDesc = NARRATIVE_TYPES[type] || type;

  const prompt = `Você é o Narrative Agent da SmartOps IA.

Crie uma narrativa forte para ${BRENO.name} no estilo do perfil:

Posicionamento: "${BRENO.positioning}"
Tom de voz: claro, direto, confiante, prático, educativo, sem jargão acadêmico
Plataforma: ${platform}
Formato: ${format}
Tipo de narrativa: ${type} — ${typeDesc}
Contexto adicional: ${context || 'nenhum'}

Estrutura da narrativa:
1. Situação (contexto)
2. Problema (tensão)
3. Conflito ou desafio
4. Insight ou virada
5. Aprendizado ou resultado
6. CTA suave

Retorne JSON:
{
  "narrative_type": "${type}",
  "title": "...",
  "hook": "...",
  "full_narrative": "...",
  "platform_version": {
    "instagram": "versão curta para post",
    "linkedin": "versão para LinkedIn"
  },
  "cta": "...",
  "where_to_use": ["instagram", "proposta", "bio"],
  "emotional_trigger": "curiosidade | autoridade | empatia | urgência"
}

REGRAS:
- Nunca inventar credencial ou resultado específico de cliente
- Tom pessoal mas profissional
- Parágrafos curtos
- Conectar ao objetivo comercial da SmartOps`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 2000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('NarrativeAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate founder story ─────────────────────────────────────────────────────
async function generateFounderStory() {
  return generateNarrative({
    type:     'origin',
    context:  'Como Breno chegou ao Black Belt Lean Six Sigma e criou a SmartOps IA',
    platform: 'linkedin',
    format:   'long-form',
  });
}

// ── Generate an opinion post ───────────────────────────────────────────────────
async function generateOpinionPost(topic) {
  return generateNarrative({
    type:     'belief',
    context:  topic,
    platform: 'instagram',
    format:   'post',
  });
}

// ── Generate a storytelling post from a case ──────────────────────────────────
async function generateCaseStory({ problem, result, sector, location = 'BH' }) {
  const context = `Empresa do setor ${sector} em ${location}. Problema: ${problem}. Resultado: ${result}`;
  return generateNarrative({
    type:    'transformation',
    context,
    platform: 'instagram',
    format:   'carrossel',
  });
}

module.exports = { generateNarrative, generateFounderStory, generateOpinionPost, generateCaseStory, NARRATIVE_TYPES };
