// CommissionModelAgent.js — Partnership Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const commissionModels = require('../offers/commissionModels.json');

const client = new Anthropic();

function calculateCommission(contractValue, partnerType, model = null) {
  const modelId = model || commissionModels.assignment[partnerType] || 'A';
  const modelData = commissionModels.models[modelId];
  if (!modelData) return null;

  const commissionValue = (contractValue * modelData.percentage) / 100;
  return {
    contract_value: contractValue,
    partner_type: partnerType,
    model_id: modelId,
    model_label: modelData.label,
    percentage: modelData.percentage,
    commission_value: commissionValue,
    type: modelData.type,
    description: modelData.description,
    rules: commissionModels.rules,
    calculated_at: new Date().toISOString(),
  };
}

async function defineCommissionModel(partnerData) {
  const { name, type, volume_estimate = 'baixo', relationship_strength = 'nova', contract_avg = 3000 } = partnerData;

  const prompt = `Você é o Commission Model Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Defina o modelo de comissão ideal para este parceiro.

Modelos disponíveis:
A: 10% do primeiro contrato (padrão)
B: 15% do primeiro contrato (parceiro ativo)
C: 20% do primeiro contrato (parceiro estratégico)
D: 10% recorrente por 3 meses em contratos mensais
E: Fee fixo por indicação + 10% por fechamento
F: Co-marketing sem comissão financeira

Parceiro: ${name}
Tipo: ${type}
Volume estimado de indicações: ${volume_estimate}
Nível de relacionamento: ${relationship_strength}
Ticket médio estimado: R$ ${contract_avg}

Retorne JSON:
{
  "partner_type": "${type}",
  "recommended_model": "A | B | C | D | E | F",
  "model_label": "nome do modelo",
  "percentage": 0,
  "justification": "por que este modelo para este parceiro",
  "payment_rule": "quando e como pagar",
  "upgrade_condition": "quando considerar upgrade para modelo melhor",
  "estimated_commission_first_client": 0,
  "estimated_annual_commission": 0,
  "risks": ["risco 1"],
  "contract_notes": "observações para o acordo de parceria",
  "negotiation_tips": "como apresentar a comissão sem parecer barato ou caro"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('CommissionModelAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

async function generateCommissionReport(referrals = []) {
  const total = referrals.reduce((sum, r) => sum + (r.commission_value || 0), 0);
  const paid = referrals.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.commission_value || 0), 0);
  const pending = total - paid;

  return {
    report_date: new Date().toISOString().split('T')[0],
    total_referrals: referrals.length,
    total_commission: total,
    paid_commission: paid,
    pending_commission: pending,
    by_partner: referrals.reduce((acc, r) => {
      if (!acc[r.partner_name]) acc[r.partner_name] = { referrals: 0, commission: 0 };
      acc[r.partner_name].referrals++;
      acc[r.partner_name].commission += r.commission_value || 0;
      return acc;
    }, {}),
    summary: `Total de comissões: R$ ${total.toFixed(2)} | Pagas: R$ ${paid.toFixed(2)} | Pendentes: R$ ${pending.toFixed(2)}`,
  };
}

module.exports = { calculateCommission, defineCommissionModel, generateCommissionReport };
