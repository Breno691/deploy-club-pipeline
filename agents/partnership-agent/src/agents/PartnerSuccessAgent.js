// PartnerSuccessAgent.js — Partnership Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function analyzePartnerHealth(partnerData) {
  const {
    name, type, stage, last_contact_days = 0,
    referrals_total = 0, revenue_generated = 0,
    commission_paid = 0, activation_date = null,
  } = partnerData;

  const daysSinceActivation = activation_date
    ? Math.floor((Date.now() - new Date(activation_date).getTime()) / 86400000)
    : 0;

  const prompt = `Você é o Partner Success Agent da SmartOps IA.

Avalie a saúde deste parceiro e defina próximos passos.

Parceiro: ${name}
Tipo: ${type}
Stage atual: ${stage}
Dias desde último contato: ${last_contact_days}
Total de indicações: ${referrals_total}
Receita gerada: R$ ${revenue_generated}
Comissão paga: R$ ${commission_paid}
Dias desde ativação: ${daysSinceActivation}

Retorne JSON:
{
  "partner_name": "${name}",
  "health_score": 0,
  "health_label": "excelente | bom | atenção | crítico",
  "status": "active | at_risk | inactive | champion",
  "last_contact_assessment": "avaliação do tempo sem contato",
  "referral_rate": "X indicações/mês",
  "roi_assessment": "avaliação do ROI desta parceria",
  "risks": ["risco 1", "risco 2"],
  "enablement_needed": ["o que o parceiro precisa para indicar mais"],
  "recommended_actions": [
    { "action": "ação", "urgency": "imediata | semana | mês", "expected_result": "resultado" }
  ],
  "co_marketing_opportunity": "oportunidade de co-marketing identificada",
  "upgrade_candidate": true,
  "upgrade_reason": "por que considerar upgrade de comissão",
  "message_to_send": "mensagem de manutenção de relacionamento",
  "next_milestone": "próximo marco esperado desta parceria"
}

Regras:
- Se sem contato > 30 dias e sem indicações → status at_risk
- Se sem indicação em 60+ dias após ativação → critical
- Se 3+ clientes fechados → champion
- Sempre sugerir ação de engajamento

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PartnerSuccessAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.assessed_at = new Date().toISOString();
  return data;
}

async function generateEnablementKit(partnerType) {
  const prompt = `Você é o Partner Success Agent da SmartOps IA.

Crie um Partner Enablement Kit para o tipo de parceiro: ${partnerType}

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

O kit deve ajudar o parceiro a entender como identificar e indicar clientes para a SmartOps.

Retorne JSON:
{
  "kit_title": "Partner Enablement Kit — ${partnerType}",
  "partner_type": "${partnerType}",
  "who_is_smartops": "explicação em 3 linhas para o parceiro apresentar",
  "what_smartops_solves": ["problema 1", "problema 2", "problema 3"],
  "ideal_client_profile": "perfil de cliente ideal para indicar",
  "referral_signals": [
    { "signal": "sinal a observar", "example": "exemplo prático", "action": "o que fazer quando ouvir isso" }
  ],
  "how_to_refer": ["passo 1", "passo 2", "passo 3"],
  "commission_explanation": "como funciona a comissão em linguagem simples",
  "ready_message": "mensagem pronta para o parceiro usar com clientes",
  "faq": [
    { "question": "pergunta", "answer": "resposta" }
  ],
  "smartops_contact": "Breno Luiz — brenoluiz691@gmail.com",
  "case_example": "exemplo de caso de sucesso para o parceiro usar"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PartnerSuccessAgent kit: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { analyzePartnerHealth, generateEnablementKit };
