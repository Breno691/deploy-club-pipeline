// CampaignOpportunityAgent.js — Market Opportunity Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Generate campaign brief from an opportunity ────────────────────────────────
async function generateCampaignBrief({ sector, location, pain, offer, channel }) {
  const prompt = `Você é o Campaign Opportunity Agent da SmartOps IA.

Crie um brief de campanha para a oportunidade:

Setor: ${sector}
Localização: ${location || 'BH/MG'}
Dor principal: ${pain}
Oferta: ${offer}
Canal: ${channel || 'Instagram + Google Ads'}

Retorne JSON:
{
  "campaign_name": "...",
  "sector": "${sector}",
  "channel": "${channel || 'Instagram Reels + Google Ads'}",
  "objective": "lead_generation",
  "audience_description": "...",
  "headline_options": ["headline 1", "headline 2", "headline 3"],
  "selected_headline": "...",
  "subheadline": "...",
  "cta": "...",
  "landing_page_angle": "...",
  "google_ads_keywords": ["keyword 1", "keyword 2"],
  "instagram_content_idea": "...",
  "whatsapp_outreach_message": "...",
  "local_outreach_angle": "...",
  "expected_cpl": "R$X",
  "expected_ctr": "X%",
  "budget_recommendation": "R$X/dia",
  "testing_hypothesis": "...",
  "success_metric": "..."
}

REGRAS:
- Headlines diretas e específicas para o setor
- Google Ads: focar em palavras de intenção alta (consultoria + setor + BH)
- Instagram: foco em dor + número + solução
- WhatsApp: personalizado + dor + diagnóstico grátis`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('CampaignOpportunityAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate local outreach campaign ──────────────────────────────────────────
async function generateLocalOutreach({ sector, city, count = 5 }) {
  const prompt = `Você é o Campaign Opportunity Agent da SmartOps IA.

Crie ${count} abordagens de prospecção presencial/WhatsApp para empresas do setor "${sector}" em ${city}.

{
  "approaches": [
    {
      "type": "visita presencial | WhatsApp | LinkedIn | email",
      "opening": "...",
      "pain_hook": "...",
      "offer": "diagnóstico gratuito de 30 min",
      "urgency": "...",
      "follow_up": "...",
      "expected_response_rate": "X%"
    }
  ],
  "best_approach": "...",
  "script_whatsapp": "...",
  "script_presencial": "..."
}`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('generateLocalOutreach: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateCampaignBrief, generateLocalOutreach };
