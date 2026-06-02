// OutreachAgent.js — Partnership Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const templates = require('../outreach/outreachTemplates.json');

const client = new Anthropic();

async function generatePartnerOutreach(partnerData) {
  const { name, type, company, audience, why_fit, commission_model = 'A', channel = 'whatsapp' } = partnerData;

  const prompt = `Você é o Outreach Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + Automação e IA para PMEs em BH/MG.
Dono: Breno Luiz, Black Belt Lean Six Sigma.

Crie mensagens de abordagem personalizadas para este potencial parceiro.

Parceiro: ${name}
Tipo: ${type}
Empresa: ${company || 'não informada'}
Público que atende: ${audience || 'PMEs locais'}
Por que se encaixa: ${why_fit || 'complementaridade de serviços'}
Modelo de comissão: ${commission_model}
Canal preferido: ${channel}

Sinais que parceiro deve observar nos clientes:
${templates.referral_signals.join('\n')}

Retorne JSON:
{
  "partner_name": "${name}",
  "outreach_strategy": "estratégia geral de abordagem",
  "messages": {
    "whatsapp_initial": "mensagem inicial WhatsApp (máx 300 palavras, tom direto e pessoal)",
    "linkedin_initial": "mensagem inicial LinkedIn (máx 200 palavras, tom profissional)",
    "email_subject": "assunto do email",
    "email_body": "corpo do email (máx 250 palavras)",
    "follow_up_day3": "follow-up após 3 dias sem resposta",
    "follow_up_day7": "follow-up após 7 dias",
    "meeting_agenda": "roteiro para reunião de 20 minutos"
  },
  "referral_training": "como treinar este parceiro para identificar oportunidades",
  "objection_responses": {
    "sem_tempo": "resposta para 'não tenho tempo'",
    "nao_conheço": "resposta para 'não conheço bem seus serviços'",
    "clientes_nao_precisam": "resposta para 'meus clientes não precisam disso'"
  },
  "best_moment_to_approach": "melhor momento/situação para abordar",
  "value_proposition": "proposta de valor em uma frase"
}

Regras de tom:
- Direto, sem enrolação
- Foco no benefício para o parceiro
- Nunca parecer spam
- Personalizado para o tipo de profissional
- Sempre com CTA claro

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('OutreachAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.generated_at = new Date().toISOString();
  data.partner_type = type;
  return data;
}

async function generatePartnerBrief(partnerData) {
  const { name, type, qualification } = partnerData;

  const prompt = `Você é o Outreach Agent da SmartOps IA.

Crie um Partner Brief de uma página para este parceiro qualificado.

Parceiro: ${name}
Tipo: ${type}
Score: ${qualification?.total_score || 'não calculado'}
Classificação: ${qualification?.classification?.label || 'não definida'}
Público: ${qualification?.audience || 'PMEs'}
Proposta: ${qualification?.recommended_offer || 'parceria de indicação'}

Retorne JSON:
{
  "partner_brief": {
    "title": "Partner Brief — ${name}",
    "executive_summary": "resumo executivo em 3 linhas",
    "why_partner": "por que fazer parceria com este perfil",
    "target_audience_overlap": "sobreposição de público",
    "partnership_model": "modelo de parceria recomendado",
    "value_for_partner": ["benefício 1", "benefício 2", "benefício 3"],
    "value_for_smartops": ["benefício 1", "benefício 2"],
    "commission_offer": "oferta de comissão",
    "activation_plan": ["passo 1", "passo 2", "passo 3"],
    "success_metrics": ["métrica 1", "métrica 2"],
    "risks": ["risco 1"],
    "first_30_days": "plano para os primeiros 30 dias"
  }
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('OutreachAgent brief: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generatePartnerOutreach, generatePartnerBrief };
