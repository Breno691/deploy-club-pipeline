// ROIChannelAgent.js — Financial Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcCAC, calcROI, calcROAS, calcLTVCAC, assessLTVCAC } = require('../calculations/financialCalculators');

const client = new Anthropic();

function calcChannelROILocally(channels = []) {
  return channels.map(ch => {
    const cac = calcCAC(ch.spend || 0, ch.clients || 0);
    const roi = calcROI(ch.revenue || 0, ch.spend || 0);
    const roas = calcROAS(ch.revenue || 0, ch.spend || 0);
    const ltv_estimated = ch.ltv || CONFIG.services['diagnostico-plano'].ticket_medio * 2.5;
    const ltv_cac = calcLTVCAC(ltv_estimated, cac);
    const assessment = assessLTVCAC(ltv_cac);

    return {
      channel:     ch.name,
      spend:       ch.spend || 0,
      revenue:     ch.revenue || 0,
      clients:     ch.clients || 0,
      leads:       ch.leads || 0,
      cac:         Math.round(cac),
      roi_pct:     Number(roi.toFixed(1)),
      roas:        roas,
      ltv_cac:     ltv_cac,
      status:      assessment.status,
      decision:    roi >= 200 ? 'ESCALAR' : roi >= 100 ? 'MANTER' : roi > 0 ? 'OTIMIZAR' : ch.spend === 0 ? 'ORGÂNICO' : 'PAUSAR',
    };
  });
}

async function analyzeROIByChannel(channelData = []) {
  const channelResults = calcChannelROILocally(channelData);
  const activeChannels = channelResults.filter(c => c.spend > 0);
  const organicChannels = channelResults.filter(c => c.spend === 0);

  const prompt = `Você é o ROI Channel Agent da SmartOps IA — CFO Virtual.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Fase: construindo canais de aquisição.

Meta de CAC máximo: R$ ${Math.round(CONFIG.services['diagnostico-plano'].ticket_medio * CONFIG.targets.cac_max_pct_ticket / 100)}
Meta LTV/CAC mínimo: ${CONFIG.targets.ltv_cac_min}x

Análise de canais:
${JSON.stringify(channelResults, null, 2)}

Canais com investimento: ${activeChannels.length}
Canais orgânicos: ${organicChannels.length}

Retorne JSON:
{
  "analysis_date": "${new Date().toISOString().split('T')[0]}",
  "total_spend": 0,
  "total_revenue": 0,
  "total_clients": 0,
  "average_cac": 0,
  "best_roi_channel": "melhor canal por ROI",
  "best_cac_channel": "menor CAC",
  "most_scalable_channel": "canal para escalar agora",
  "channels_to_pause": ["canal para pausar"],
  "channels_to_scale": ["canal para escalar"],
  "channels_to_create": ["novo canal para testar"],
  "organic_leverage": "como maximizar canais orgânicos",
  "paid_vs_organic_insight": "insight sobre equilíbrio pago vs orgânico",
  "budget_recommendation": {
    "total_recommended": 0,
    "allocation": [
      { "channel": "canal", "budget": 0, "reason": "motivo" }
    ]
  },
  "risks": ["risco de canal 1", "risco de canal 2"],
  "insights": ["insight 1", "insight 2"],
  "recommendation": "recomendação principal de canal"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ROIChannelAgent: no JSON from Claude');
  const result = JSON.parse(jsonMatch[0]);
  result.channel_details = channelResults;
  return result;
}

module.exports = { analyzeROIByChannel, calcChannelROILocally };
