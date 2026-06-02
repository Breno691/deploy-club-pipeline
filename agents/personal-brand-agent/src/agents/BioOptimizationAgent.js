// BioOptimizationAgent.js — Personal Brand Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { BRENO } = require('../config');

const client = new Anthropic();

// ── Generate optimized bio for a platform ─────────────────────────────────────
async function generateBio({ platform, version = 'medium', objective = 'lead_generation', context = '' }) {
  const lengths = { short: 50, medium: 120, long: 300, linkedin_about: 600, speaker: 100 };
  const maxWords = lengths[version] || 120;

  const prompt = `Você é o Bio Optimization Agent da SmartOps IA.

Crie a melhor bio para ${BRENO.name} na plataforma: ${platform}.

Perfil:
- ${BRENO.title}
- Fundador da ${BRENO.company}
- ${BRENO.location}
- Especialidades: ${BRENO.specialty.join(', ')}
- Público: Donos de PMEs em BH/MG
- CTA principal: "${BRENO.headlines.linkedin.split('|').pop().trim()}"

Versão: ${version} (máximo ~${maxWords} palavras)
Objetivo: ${objective}
Contexto: ${context || 'uso geral'}

Toda bio deve responder:
1. Quem é Breno?
2. Quem ele ajuda?
3. Qual problema resolve?
4. Qual autoridade tem?
5. Qual ação tomar?

Retorne JSON:
{
  "platform": "${platform}",
  "version": "${version}",
  "bio": "...",
  "headline": "...",
  "cta": "...",
  "character_count": 0,
  "why_it_works": "...",
  "improvement_notes": "...",
  "emoji_version": "versão com emojis para Instagram"
}`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 1500,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('BioOptimizationAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate all bio versions at once ─────────────────────────────────────────
async function generateAllBios() {
  const platforms = [
    { platform: 'instagram',     version: 'short'  },
    { platform: 'linkedin',      version: 'linkedin_about' },
    { platform: 'speaker_event', version: 'speaker' },
    { platform: 'proposal',      version: 'medium' },
  ];

  const results = [];
  for (const p of platforms) {
    const bio = await generateBio(p);
    results.push(bio);
  }
  return results;
}

// ── Score current bio ──────────────────────────────────────────────────────────
function scoreBio(bioText) {
  let score = 50;
  const text = bioText.toLowerCase();

  if (/lean|six sigma|kaizen/i.test(text))      score += 10;
  if (/pme|pequena|empresa/i.test(text))        score += 10;
  if (/bh|belo horizonte|minas/i.test(text))   score += 8;
  if (/black belt/i.test(text))                 score += 10;
  if (/automação|automacao|ia|inteligência/i.test(text)) score += 8;
  if (/diagnóstico|contato|agende|call/i.test(text))     score += 10;
  if (bioText.split(' ').length <= 12)          score += 5;  // concise
  else if (bioText.split(' ').length > 60)      score -= 5;  // too long for Instagram

  return Math.min(100, score);
}

module.exports = { generateBio, generateAllBios, scoreBio };
