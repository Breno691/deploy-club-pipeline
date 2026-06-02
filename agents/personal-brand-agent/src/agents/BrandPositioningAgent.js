// BrandPositioningAgent.js — Personal Brand Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { BRENO, CONTENT_PILLARS } = require('../config');

const client = new Anthropic();

// ── Audit current brand positioning ───────────────────────────────────────────
async function auditPositioning({ bio, lastPosts = [], recentMessages = [] }) {
  const prompt = `Você é o Brand Positioning Agent da SmartOps IA.

Analise o posicionamento atual de ${BRENO.name}.

Posicionamento ideal: "${BRENO.positioning}"
Headline alvo: "${BRENO.headlines.linkedin}"

Bio atual:
${bio || 'não fornecida'}

Últimos posts (amostra):
${(lastPosts || []).slice(0, 3).join('\n---\n')}

Retorne JSON:
{
  "positioning_clarity_score": 0-100,
  "strengths": ["..."],
  "gaps": ["..."],
  "inconsistencies": ["..."],
  "recommendations": [
    { "priority": "P1", "action": "...", "impact": "..." }
  ],
  "updated_bio_suggestion": "...",
  "updated_headline_suggestion": "...",
  "next_content_pillar": "...",
  "brand_message_clarity": "alta | média | baixa"
}

CRITÉRIOS:
- clareza de nicho
- promessa única
- diferenciação de concorrentes
- relevância para PMEs de BH
- presença de prova social
- CTA claro`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 2000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('BrandPositioningAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate positioning statement ────────────────────────────────────────────
async function generatePositioningStatement(platform = 'linkedin') {
  const prompt = `Você é o Brand Positioning Agent da SmartOps IA.

Gere o melhor posicionamento para ${BRENO.name} na plataforma: ${platform}.

Perfil:
- ${BRENO.title}
- Fundador da ${BRENO.company}
- Localização: ${BRENO.location}
- Especialidades: ${BRENO.specialty.join(', ')}
- Público: Donos de PMEs em BH/MG

Retorne JSON:
{
  "platform": "${platform}",
  "headline": "...",
  "subheadline": "...",
  "bio": "...",
  "cta": "...",
  "key_differentiators": ["..."],
  "why_it_works": "...",
  "test_variation": "..."
}`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 1500,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('generatePositioningStatement: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Calculate brand score ──────────────────────────────────────────────────────
function calculateBrandScore({ positioningClarity, contentConsistency, perceivedAuthority,
  socialProof, inboundGenerated, engagementQuality, localReputation }) {
  const weights = require('../config').BRAND_SCORE_WEIGHTS;
  const score = Math.round(
    (positioningClarity  / 10) * weights.positioningClarity  +
    (contentConsistency  / 10) * weights.contentConsistency  +
    (perceivedAuthority  / 10) * weights.perceivedAuthority  +
    (socialProof         / 10) * weights.socialProof         +
    (inboundGenerated    / 10) * weights.inboundGenerated    +
    (engagementQuality   / 10) * weights.engagementQuality   +
    (localReputation     / 10) * weights.localReputation
  );
  return {
    score, level: score >= 80 ? 'forte' : score >= 60 ? 'crescendo' : score >= 40 ? 'inicial' : 'fraco',
    next_milestone: score >= 80 ? 'consolidar e escalar' : score >= 60 ? 'fortalecer prova social' : 'clarear posicionamento',
  };
}

module.exports = { auditPositioning, generatePositioningStatement, calculateBrandScore };
