// PartnerResearchAgent.js — Partnership Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function researchPartnerType(partnerType, city = 'Belo Horizonte') {
  const prompt = `Você é o Partner Research Agent da SmartOps IA.

SmartOps IA: consultoria de Melhoria Contínua, Lean Six Sigma, Automação e IA para PMEs em BH/MG.
Dono: Breno Luiz, Black Belt Lean Six Sigma.

Sua missão: identificar os melhores potenciais parceiros do tipo "${partnerType}" em ${city} e região metropolitana.

Para cada parceiro, avalie:
- tipo e especialidade
- público que atende
- reputação local
- acesso a decisores de PMEs
- complementaridade com SmartOps
- potencial de indicação
- facilidade de abordagem

Retorne JSON com esta estrutura exata:
{
  "research_date": "${new Date().toISOString().split('T')[0]}",
  "partner_type": "${partnerType}",
  "city": "${city}",
  "why_strategic": "por que este tipo de parceiro é valioso para SmartOps",
  "ideal_icp": "perfil ideal do parceiro dentro deste segmento",
  "referral_triggers": ["sinal 1", "sinal 2", "sinal 3"],
  "recommended_offer": "proposta de parceria mais adequada para este tipo",
  "best_outreach_channel": "WhatsApp | LinkedIn | Email | Presencial",
  "prospects": [
    {
      "name": "nome ou tipo de empresa",
      "profile": "descrição do perfil",
      "audience": "público que atende",
      "why_fit": "por que se encaixa com SmartOps",
      "estimated_referrals_monthly": 0,
      "approach_difficulty": "baixa | média | alta",
      "initial_score": 0
    }
  ],
  "market_insight": "insight sobre este tipo de parceiro em BH",
  "top_recommendation": "melhor ação para começar com este tipo"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PartnerResearchAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

async function buildTopPartnerList(types = [], limit = 10) {
  const typesList = types.length > 0 ? types : CONFIG.priorityTypes;

  const prompt = `Você é o Partner Research Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Crie uma lista priorizada dos TOP ${limit} tipos de parceiros para abordar AGORA, considerando:
- tipos disponíveis: ${typesList.join(', ')}
- máximo ROI de parceria
- facilidade de ativação
- acesso a PMEs locais
- complementaridade com serviços SmartOps

Retorne JSON:
{
  "generated_at": "${new Date().toISOString().split('T')[0]}",
  "top_partners": [
    {
      "rank": 1,
      "type": "tipo de parceiro",
      "why_now": "por que abordar agora",
      "audience": "público que acessa",
      "recommended_offer": "proposta",
      "commission_model": "modelo A|B|C|D|E|F",
      "first_message_channel": "WhatsApp | LinkedIn",
      "score": 0,
      "priority": "alta | muito alta",
      "next_action": "ação imediata"
    }
  ],
  "weekly_focus": "tipo de parceiro para focar esta semana",
  "quick_win": "parceiro mais fácil de ativar rápido"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PartnerResearchAgent buildTopList: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { researchPartnerType, buildTopPartnerList };
