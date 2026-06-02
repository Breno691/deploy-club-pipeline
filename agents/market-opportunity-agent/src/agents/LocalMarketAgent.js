// LocalMarketAgent.js — Market Opportunity Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const GEO_FOCUS = {
  primary:   CONFIG.geography.primary,
  secondary: CONFIG.geography.secondary,
};

// ── Research local market opportunities in BH/MG ──────────────────────────────
async function researchLocalMarket(city = 'Belo Horizonte', sector = null) {
  const prompt = `Você é o Local Market Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs. Breno Luiz, Black Belt BH/MG.

Analise o mercado local de ${city}, MG${sector ? `, focando no setor: ${sector}` : ''}.

Retorne JSON:
{
  "city": "${city}",
  "sector_focus": "${sector || 'geral'}",
  "market_profile": "...",
  "strongest_sectors": ["setor 1", "setor 2", "setor 3"],
  "business_density": "alta | média | baixa",
  "economic_activity": "...",
  "key_neighborhoods": ["bairro 1", "bairro 2"],
  "local_events": ["evento 1"],
  "trade_associations": ["associação 1"],
  "prospect_approach": "presencial | WhatsApp | LinkedIn | eventos",
  "recommended_offer": "...",
  "estimated_prospects": 0,
  "outreach_angle": "...",
  "first_prospect_action": "...",
  "local_score": 0-100
}`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LocalMarketAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate weekly local prospecting list ────────────────────────────────────
async function generateProspectList({ sector, city = 'Belo Horizonte', count = 20 }) {
  const prompt = `Você é o Local Market Agent da SmartOps IA.

Gere uma lista de ${count} tipos de empresas para prospectar no setor "${sector}" em ${city}.

Para cada tipo de empresa, retorne:
{
  "prospects": [
    {
      "type": "Metalúrgica de médio porte",
      "size": "10-50 funcionários",
      "city": "${city}",
      "main_pain": "retrabalho na produção",
      "offer": "diagnóstico Lean gratuito",
      "approach": "visita presencial + WhatsApp",
      "opening_message": "...",
      "priority": "P1 | P2 | P3",
      "score": 0-100
    }
  ],
  "top_prospect_today": "...",
  "weekly_action": "...",
  "expected_meetings": 0
}`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('generateProspectList: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Get geo score for a city ───────────────────────────────────────────────────
function geoScore(city) {
  if (CONFIG.geography.primary.includes(city))   return 10;
  if (CONFIG.geography.secondary.includes(city)) return 7;
  return 4; // unknown
}

module.exports = { researchLocalMarket, generateProspectList, geoScore, GEO_FOCUS };
