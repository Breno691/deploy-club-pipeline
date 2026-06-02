// ReferralTrackingAgent.js — Partnership Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calculateCommission } = require('./CommissionModelAgent');

const client = new Anthropic();

function createReferral(data) {
  const { partner_name, partner_type, company_name, contact_name = '', phone = '', source = 'partner' } = data;
  return {
    id: `REF-${Date.now()}`,
    partner_name,
    partner_type,
    company_name,
    contact_name,
    phone,
    source,
    status: 'received',
    stages: ['received'],
    potential_value: data.potential_value || 0,
    closed_value: null,
    commission_value: null,
    commission_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: [],
  };
}

function updateReferralStatus(referral, newStatus, notes = '') {
  referral.status = newStatus;
  referral.stages.push(newStatus);
  referral.updated_at = new Date().toISOString();
  if (notes) referral.notes.push({ date: new Date().toISOString(), text: notes });

  if (newStatus === 'closed' && referral.closed_value) {
    const commission = calculateCommission(referral.closed_value, referral.partner_type);
    referral.commission_value = commission?.commission_value || 0;
    referral.commission_percentage = commission?.percentage || 0;
    referral.commission_status = 'pending_payment';
  }

  return referral;
}

async function analyzeReferralPipeline(referrals = []) {
  if (referrals.length === 0) {
    return {
      total: 0,
      by_status: {},
      total_potential: 0,
      total_closed: 0,
      total_commission: 0,
      conversion_rate: 0,
      insight: 'Nenhuma indicação registrada ainda. Ative os parceiros para começar a receber leads.',
      next_action: 'Abordar primeiros parceiros',
    };
  }

  const prompt = `Você é o Referral Tracking Agent da SmartOps IA.

Analise o pipeline de indicações de parceiros e gere insights.

Indicações:
${JSON.stringify(referrals, null, 2)}

Retorne JSON:
{
  "total_referrals": 0,
  "by_status": { "received": 0, "qualified": 0, "meeting": 0, "proposal": 0, "closed": 0, "lost": 0 },
  "best_partner": "parceiro que mais gerou leads",
  "best_partner_type": "tipo de parceiro mais eficiente",
  "total_potential_value": 0,
  "total_closed_value": 0,
  "total_commission_pending": 0,
  "conversion_rate": "X%",
  "average_time_to_close": "X dias",
  "insights": ["insight 1", "insight 2"],
  "risks": ["risco 1"],
  "next_actions": ["ação 1", "ação 2"],
  "weekly_summary": "resumo executivo de uma frase"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ReferralTrackingAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { createReferral, updateReferralStatus, analyzeReferralPipeline };
