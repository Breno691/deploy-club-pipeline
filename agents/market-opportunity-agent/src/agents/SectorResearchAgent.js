// SectorResearchAgent.js — Market Opportunity Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const fs         = require('fs');
const path       = require('path');
const { CONFIG } = require('../config');
const { buildOpportunityFromSector, rankOpportunities } = require('../scoring/opportunityScore');

const client = new Anthropic();

function loadSectorPainMap() {
  const p = path.join(__dirname, '../research/sectorPainMap.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// ── Research a sector with Claude AI ──────────────────────────────────────────
async function researchSector(sectorId, geo = 'Belo Horizonte') {
  const painMap  = loadSectorPainMap();
  const sector   = painMap.sectors[sectorId];
  if (!sector)   throw new Error(`Sector not found: ${sectorId}`);

  const prompt = `Você é o Sector Research Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + Automação com IA para PMEs.

Analise o setor "${sector.label}" em ${geo}, MG.

Dores conhecidas: ${sector.main_pains.join(', ')}
Decisor: ${sector.decision_maker}
Ticket médio estimado: R$${sector.avg_ticket_brl}

Pesquise e retorne JSON:
{
  "sector": "${sectorId}",
  "location": "${geo}",
  "market_summary": "...",
  "top_3_pains": ["dor 1", "dor 2", "dor 3"],
  "urgency_level": "alta | média | baixa",
  "growth_signal": "...",
  "competition_level": "alta | média | baixa",
  "best_offer": "...",
  "best_channel": "Google Ads | Instagram | outreach presencial | LinkedIn | WhatsApp",
  "best_message": "headline da campanha para esse setor",
  "obstacles": ["obstáculo 1", "obstáculo 2"],
  "opportunity_score_estimate": 0-100,
  "first_action": "...",
  "entry_strategy": "...",
  "example_companies_type": "exemplos de empresas desse setor em BH"
}`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('SectorResearchAgent: no JSON from Claude');
  return { ...sector, ...JSON.parse(jsonMatch[0]), sector_id: sectorId };
}

// ── Get pre-built opportunities from all sectors ───────────────────────────────
function getAllSectorOpportunities(geo = 'Belo Horizonte') {
  const painMap  = loadSectorPainMap();
  const sectors  = painMap.sectors;
  const opps     = Object.entries(sectors).map(([id, data]) =>
    buildOpportunityFromSector(id, data, geo)
  );
  return rankOpportunities(opps);
}

// ── Get top N opportunities for a geo ─────────────────────────────────────────
function getTopOpportunities(n = 5, geo = 'Belo Horizonte') {
  return getAllSectorOpportunities(geo).slice(0, n);
}

module.exports = { researchSector, getAllSectorOpportunities, getTopOpportunities };
