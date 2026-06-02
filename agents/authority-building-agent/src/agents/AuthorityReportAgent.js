// AuthorityReportAgent.js — Authority Building Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function calculateAuthorityScore(metrics = {}) {
  const {
    palestras = 0, artigos = 0, convites = 0, mencoes = 0,
    seguidores_qualificados = 0, leads_inbound = 0, parcerias = 0,
    eventos_participados = 0, engajamento_qualificado = 0,
  } = metrics;

  const weights = {
    palestras:               15,
    artigos:                 12,
    convites:                12,
    mencoes:                 10,
    seguidores_qualificados:  8,
    leads_inbound:           15,
    parcerias:               10,
    eventos_participados:    10,
    engajamento_qualificado:  8,
  };

  const maxValues = {
    palestras: 4, artigos: 12, convites: 8, mencoes: 20,
    seguidores_qualificados: 500, leads_inbound: 20, parcerias: 10,
    eventos_participados: 6, engajamento_qualificado: 100,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const value = metrics[key] || 0;
    const max = maxValues[key] || 1;
    score += Math.min((value / max) * weight, weight);
  }

  return {
    score: Math.round(score),
    target_90d: CONFIG.authorityScore.target_90d,
    target_12m: CONFIG.authorityScore.target_12m,
    gap_90d: Math.max(0, CONFIG.authorityScore.target_90d - Math.round(score)),
    gap_12m: Math.max(0, CONFIG.authorityScore.target_12m - Math.round(score)),
    assessment: score >= 80 ? 'referência regional' : score >= 50 ? 'autoridade em crescimento' : score >= 30 ? 'construindo base' : 'início da jornada',
  };
}

async function generateWeeklyAuthorityReport(data = {}) {
  const {
    events_found = 0, pitches_sent = 0, speaking_engagements = 0,
    articles_published = 0, linkedin_posts = 0, podcast_appearances = 0,
    lives_done = 0, mentions = 0, leads_from_authority = 0,
    followers_gained = 0, revenue_attributed = 0,
  } = data;

  const authorityScore = calculateAuthorityScore(data);

  const prompt = `Você é o Authority Report Agent da SmartOps IA.

Gere o relatório semanal de construção de autoridade.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Speaker: Breno Luiz

Dados da semana:
- Eventos mapeados: ${events_found}
- Pitches de palestra enviados: ${pitches_sent}
- Palestras realizadas: ${speaking_engagements}
- Artigos publicados: ${articles_published}
- Posts LinkedIn: ${linkedin_posts}
- Podcasts participados: ${podcast_appearances}
- Lives realizadas: ${lives_done}
- Menções: ${mentions}
- Leads gerados via autoridade: ${leads_from_authority}
- Seguidores qualificados ganhos: ${followers_gained}
- Receita atribuída à autoridade: R$ ${revenue_attributed}
- Authority Score atual: ${authorityScore.score}/100

Metas:
- 90 dias: ${authorityScore.target_90d}/100 (gap: ${authorityScore.gap_90d})
- 12 meses: ${authorityScore.target_12m}/100 (gap: ${authorityScore.gap_12m})

Retorne JSON:
{
  "report_title": "Relatório Semanal de Autoridade — SmartOps IA",
  "report_date": "${new Date().toISOString().split('T')[0]}",
  "authority_score": ${authorityScore.score},
  "authority_assessment": "${authorityScore.assessment}",
  "executive_summary": "resumo executivo em 3 linhas",
  "kpis": {
    "events_found": ${events_found},
    "pitches_sent": ${pitches_sent},
    "speaking_engagements": ${speaking_engagements},
    "articles": ${articles_published},
    "linkedin_posts": ${linkedin_posts},
    "podcasts": ${podcast_appearances},
    "lives": ${lives_done},
    "mentions": ${mentions},
    "leads_from_authority": ${leads_from_authority},
    "revenue_attributed": ${revenue_attributed}
  },
  "highlights": ["destaque 1", "destaque 2"],
  "gaps_identified": ["gap 1", "gap 2"],
  "pillar_performance": {
    "lean": "desempenho",
    "automation": "desempenho",
    "local_authority": "desempenho"
  },
  "weekly_insight": "principal insight desta semana de autoridade",
  "next_week_priorities": ["prioridade 1", "prioridade 2", "prioridade 3"],
  "content_pipeline": "estado do pipeline de conteúdo",
  "speaking_pipeline": "estado do pipeline de palestras",
  "recommendation": "recomendação estratégica principal",
  "format": "SMARTOPS_AUTHORITY_REPORT_v1"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AuthorityReportAgent: no JSON from Claude');
  const report = JSON.parse(jsonMatch[0]);
  report.authority_score_detail = authorityScore;
  return report;
}

module.exports = { generateWeeklyAuthorityReport, calculateAuthorityScore };
