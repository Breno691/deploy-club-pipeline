// PersonalBrandReportAgent.js — Personal Brand Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { BRENO, BRAND_SCORE_WEIGHTS } = require('../config');
const { calculateBrandScore } = require('./BrandPositioningAgent');
const { scoreAuthority } = require('./ProofOfAuthorityAgent');

const client = new Anthropic();

function calculateFullBrandScore(metrics = {}) {
  const {
    positioningClarity = 5, contentConsistency = 5, perceivedAuthority = 5,
    socialProof = 5, inboundGenerated = 5, engagementQuality = 5, localReputation = 5,
  } = metrics;

  const brandScore = calculateBrandScore({
    positioningClarity, contentConsistency, perceivedAuthority,
    socialProof, inboundGenerated, engagementQuality, localReputation,
  });

  const authorityScore = scoreAuthority({
    credentials: metrics.credentials || 2,
    cases:       metrics.cases || 0,
    testimonials: metrics.testimonials || 0,
    events:      metrics.events || 0,
    articles:    metrics.articles || 0,
    followers:   metrics.followers || 0,
  });

  return {
    brand_score:     brandScore.score,
    brand_level:     brandScore.level,
    authority_score: authorityScore,
    composite_score: Math.round((brandScore.score + authorityScore) / 2),
    target_90d:      40,
    target_12m:      80,
    gap_90d:         Math.max(0, 40 - Math.round((brandScore.score + authorityScore) / 2)),
    next_milestone:  brandScore.next_milestone,
  };
}

async function generateWeeklyBrandReport(data = {}) {
  const {
    posts_published = 0, best_post_reach = 0, inbound_leads = 0,
    profile_visits = 0, messages_received = 0, followers_gained = 0,
    linkedin_connections = 0, mentions = 0, speaking_invites = 0,
    meetings_from_brand = 0, revenue_from_brand = 0,
  } = data;

  const scores = calculateFullBrandScore(data.scores || {});

  const prompt = `Você é o Personal Brand Report Agent da SmartOps IA.

Gere o relatório semanal de marca pessoal de ${BRENO.name}.

${BRENO.title} | ${BRENO.company} | ${BRENO.location}

Dados da semana:
- Posts publicados: ${posts_published}
- Maior alcance de post: ${best_post_reach}
- Leads inbound: ${inbound_leads}
- Visitas ao perfil: ${profile_visits}
- Mensagens recebidas: ${messages_received}
- Seguidores ganhos: ${followers_gained}
- Conexões LinkedIn: ${linkedin_connections}
- Menções: ${mentions}
- Convites para palestras: ${speaking_invites}
- Reuniões originadas da marca: ${meetings_from_brand}
- Receita atribuída: R$ ${revenue_from_brand}
- Brand Score atual: ${scores.composite_score}/100

Metas: 90 dias → ${scores.target_90d}/100 | 12 meses → ${scores.target_12m}/100

Retorne JSON:
{
  "report_title": "Relatório Semanal de Marca Pessoal — ${BRENO.name}",
  "report_date": "${new Date().toISOString().split('T')[0]}",
  "brand_score": ${scores.composite_score},
  "brand_level": "${scores.brand_level}",
  "executive_summary": "resumo executivo em 3 linhas",
  "kpis": {
    "posts": ${posts_published},
    "inbound_leads": ${inbound_leads},
    "profile_visits": ${profile_visits},
    "messages": ${messages_received},
    "followers_gained": ${followers_gained},
    "meetings_from_brand": ${meetings_from_brand},
    "revenue_from_brand": ${revenue_from_brand}
  },
  "best_performing_content": "tipo/tema de conteúdo que mais performou",
  "highlights": ["destaque 1", "destaque 2"],
  "gaps": ["gap 1", "gap 2"],
  "trust_signals_added": ["prova social nova esta semana"],
  "positioning_consistency": "consistente | inconsistente | precisa ajuste",
  "weekly_insight": "principal insight de marca esta semana",
  "next_week_actions": ["ação 1", "ação 2", "ação 3"],
  "pillar_performance": {
    "autoridade_tecnica": "bom | regular | fraco",
    "autoridade_pratica": "bom | regular | fraco",
    "prova_social":       "bom | regular | fraco",
    "humanizacao":        "bom | regular | fraco"
  },
  "brand_roi": "estimativa de ROI da marca pessoal",
  "recommendation": "recomendação principal para semana seguinte",
  "format": "SMARTOPS_BRAND_REPORT_v1"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PersonalBrandReportAgent: no JSON from Claude');
  const report = JSON.parse(jsonMatch[0]);
  report.scores_detail = scores;
  return report;
}

async function generateProfileAuditReport(profileData = {}) {
  const {
    linkedin_bio = '', instagram_bio = '',
    linkedin_headline = '', posts_last_month = 0,
  } = profileData;

  const prompt = `Você é o Personal Brand Report Agent da SmartOps IA.

Audite os perfis de ${BRENO.name} e gere relatório de melhorias.

LinkedIn headline atual: "${linkedin_headline || BRENO.headlines.linkedin}"
LinkedIn bio atual: "${linkedin_bio || '(não fornecida)'}"
Instagram bio atual: "${instagram_bio || '(não fornecida)'}"
Posts publicados no último mês: ${posts_last_month}

Posicionamento ideal: "${BRENO.positioning}"

Retorne JSON:
{
  "audit_date": "${new Date().toISOString().split('T')[0]}",
  "overall_score": 0,
  "linkedin": {
    "headline_score": 0,
    "bio_score": 0,
    "cta_present": true,
    "strengths": ["..."],
    "improvements": ["melhoria 1", "melhoria 2"],
    "suggested_headline": "headline melhorada",
    "suggested_about_preview": "primeiras 3 linhas do About"
  },
  "instagram": {
    "bio_score": 0,
    "cta_present": true,
    "highlights_optimized": false,
    "strengths": ["..."],
    "improvements": ["melhoria 1", "melhoria 2"],
    "suggested_bio": "bio melhorada"
  },
  "content_audit": {
    "frequency": "${posts_last_month} posts/mês",
    "frequency_assessment": "ideal | baixo | muito baixo",
    "pillar_balance": "balanceado | desbalanceado",
    "missing_pillar": "pilar ausente"
  },
  "quick_wins": ["ação rápida 1", "ação rápida 2", "ação rápida 3"],
  "priority_improvements": [
    { "area": "LinkedIn | Instagram | Conteúdo", "action": "ação", "impact": "alto | médio", "effort": "baixo | médio | alto" }
  ],
  "brand_score_before": 0,
  "brand_score_after_fixes": 0
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PersonalBrandReportAgent audit: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateWeeklyBrandReport, generateProfileAuditReport, calculateFullBrandScore };
