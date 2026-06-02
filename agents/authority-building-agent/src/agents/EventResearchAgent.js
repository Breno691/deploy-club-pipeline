// EventResearchAgent.js — Authority Building Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function scoreEvent(event) {
  if (event.score >= 85) return CONFIG.eventScoring.PRIORIDADE_MAXIMA;
  if (event.score >= 70) return CONFIG.eventScoring.VALE_ABORDAR;
  if (event.score >= 50) return CONFIG.eventScoring.MONITORAR;
  return CONFIG.eventScoring.NAO_PRIORIZAR;
}

async function scanEventOpportunities(city = 'Belo Horizonte', focus = 'PMEs e empresários locais') {
  const prompt = `Você é o Event Research Agent da SmartOps IA.

Speaker: Breno Luiz — Black Belt Lean Six Sigma, especialista em Automação e IA para PMEs.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Sua missão: identificar oportunidades de palestras, eventos e apresentações em ${city}.

Contexto: Breno quer se posicionar como referência em Lean Six Sigma + IA para PMEs locais.

Foco público: ${focus}

Tipos de evento a pesquisar:
- eventos empresariais e de empreendedorismo
- eventos de associações comerciais (CDL, ACMinas, Associação Comercial)
- eventos SEBRAE e entidades de apoio empresarial
- eventos FIEMG e entidades industriais
- hubs de inovação e coworkings
- eventos de contabilidade e finanças empresariais
- palestras em universidades com foco empresarial
- meetups de tecnologia e automação
- encontros de PMEs e pequenos empresários

Para cada oportunidade, pontue de 0 a 100 com base em:
- público decisor (25 pontos): donos/gestores de PMEs presentes
- fit com PMEs (20 pontos): audiência é de empresas alvo
- potencial de leads (20 pontos): chance de gerar reuniões
- autoridade gerada (15 pontos): prestígio do evento
- conteúdo/gravação (10 pontos): possibilidade de gerar conteúdo
- local/proximidade (5 pontos): em BH ou online acessível
- custo baixo (5 pontos): sem taxa de speaker

Retorne JSON:
{
  "scan_date": "${new Date().toISOString().split('T')[0]}",
  "city": "${city}",
  "opportunities": [
    {
      "event_name": "nome do evento ou organização",
      "type": "associação | sebrae | hub | meetup | universidade | feira | outro",
      "audience": "público presente",
      "frequency": "mensal | trimestral | anual | sob demanda",
      "contact": "como entrar em contato",
      "why_relevant": "por que é oportunidade para Breno",
      "suggested_topic": "tema de palestra mais adequado",
      "score": 0,
      "expected_leads": "estimativa de leads por evento",
      "next_action": "ação imediata",
      "urgency": "esta semana | este mês | próximo trimestre"
    }
  ],
  "top_opportunity": "melhor oportunidade identificada",
  "quick_win": "oportunidade mais fácil de conseguir rápido",
  "weekly_insight": "insight sobre mercado de eventos para autoridade em BH"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('EventResearchAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);

  data.opportunities = (data.opportunities || []).map(e => ({
    ...e,
    classification: scoreEvent(e),
  }));

  return data;
}

async function generateEventPitch(eventData) {
  const { event_name, audience, suggested_topic } = eventData;

  const prompt = `Você é o Event Research Agent da SmartOps IA.

Crie um pitch de speaker para este evento.

Evento: ${event_name}
Público: ${audience}
Tema sugerido: ${suggested_topic}
Speaker: Breno Luiz — Black Belt Lean Six Sigma | SmartOps IA | BH

${CONFIG.speaker.positioning_long}

Retorne JSON:
{
  "event_name": "${event_name}",
  "pitch_email": {
    "subject": "assunto do email",
    "body": "corpo do email de pitch (máx 250 palavras, tom profissional e direto)"
  },
  "whatsapp_pitch": "mensagem WhatsApp curta (máx 100 palavras)",
  "talk_title": "título da palestra",
  "talk_abstract": "resumo da palestra em 3-5 linhas",
  "learning_outcomes": ["aprendizado 1", "aprendizado 2", "aprendizado 3"],
  "speaker_bio_short": "bio de 3 linhas para o evento",
  "speaker_bio_long": "bio completa para divulgação",
  "post_talk_cta": "CTA após a palestra para gerar leads",
  "estimated_leads": "estimativa de leads por palestra",
  "follow_up_day3": "follow-up se não respondeu em 3 dias"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('EventResearchAgent pitch: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { scanEventOpportunities, generateEventPitch, scoreEvent };
