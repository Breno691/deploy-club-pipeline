// PartnerQualificationAgent.js — Partnership Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const scoringRules = require('../scoring/scoringRules.json');

const client = new Anthropic();

function getClassification(score) {
  if (score >= 85) return scoringRules.classification.prioridade_maxima;
  if (score >= 70) return scoringRules.classification.bom_parceiro;
  if (score >= 50) return scoringRules.classification.monitorar;
  return scoringRules.classification.baixa_prioridade;
}

function calcBaseScore(partnerType) {
  const base = scoringRules.type_base_scores[partnerType];
  if (!base) return null;
  return Object.values(base).reduce((sum, v) => sum + v, 0);
}

async function qualifyPartner(partnerData) {
  const { name, type, company, city = 'Belo Horizonte', description = '' } = partnerData;
  const baseScore = calcBaseScore(type);

  const prompt = `Você é o Partner Qualification Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + Automação e IA para PMEs em BH/MG.

Avalie este potencial parceiro e retorne JSON:

Nome: ${name}
Tipo: ${type}
Empresa: ${company || 'desconhecida'}
Cidade: ${city}
Descrição adicional: ${description || 'nenhuma'}
Score base do tipo: ${baseScore || 'não calculado'}

Pesos de avaliação (total 100):
- acesso_a_pmes: 20
- confianca_empresarios: 20
- complementaridade: 15
- potencial_indicacao: 15
- fit_local: 10
- facilidade_ativacao: 10
- potencial_co_marketing: 5
- baixo_risco: 5

{
  "partner_name": "${name}",
  "partner_type": "${type}",
  "city": "${city}",
  "audience": "público que este parceiro atende",
  "why_good_fit": "por que se encaixa com SmartOps",
  "potential_referrals": "estimativa mensal",
  "scores": {
    "acesso_a_pmes": 0,
    "confianca_empresarios": 0,
    "complementaridade": 0,
    "potencial_indicacao": 0,
    "fit_local": 0,
    "facilidade_ativacao": 0,
    "potencial_co_marketing": 0,
    "baixo_risco": 0
  },
  "total_score": 0,
  "recommended_offer": "proposta de parceria ideal para este perfil",
  "commission_model": "A | B | C | D | E | F",
  "best_outreach_channel": "WhatsApp | LinkedIn | Email | Presencial",
  "outreach_angle": "ângulo específico para abordar este parceiro",
  "risks": ["risco 1", "risco 2"],
  "expected_revenue_6m": "estimativa de receita em 6 meses via este parceiro",
  "next_action": "ação imediata recomendada",
  "qualification_notes": "observações sobre este parceiro"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PartnerQualificationAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);

  const totalScore = data.total_score || Object.values(data.scores || {}).reduce((s, v) => s + v, 0);
  data.total_score = totalScore;
  data.classification = getClassification(totalScore);
  data.qualified_at = new Date().toISOString();
  data.stage = totalScore >= 50 ? 'qualified' : 'rejected';

  return data;
}

module.exports = { qualifyPartner, getClassification, calcBaseScore };
