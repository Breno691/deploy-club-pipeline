// WhatsAppBotAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Fluxos locais de bot WhatsApp
const BOT_FLOWS = {
  'lead-qualification': {
    name: 'Bot Qualificação de Lead',
    objective: 'Qualificar leads antes da reunião com Breno',
    steps: [
      { id: 1, msg: 'Olá! Sou o assistente da SmartOps IA 👋 Vi que você tem interesse em melhorar processos ou implementar automação. Posso te fazer algumas perguntas rápidas?', options: ['Sim, pode perguntar', 'Prefiro falar com alguém'] },
      { id: 2, msg: 'Ótimo! Qual é o seu principal desafio hoje? (pode resumir em 1-2 linhas)', type: 'open' },
      { id: 3, msg: 'Qual o porte da sua empresa?', options: ['1-5 pessoas', '6-20 pessoas', '21-100 pessoas', '+100 pessoas'] },
      { id: 4, msg: 'Em qual cidade/região você está?', type: 'open' },
      { id: 5, msg: 'Com que urgência você precisa resolver isso?', options: ['Urgente (esta semana)', 'Em breve (30 dias)', 'Estou pesquisando'] },
      { id: 6, msg: 'Obrigado! Com base no que você me disse, vou verificar os próximos horários disponíveis para uma conversa com o Breno. Posso te enviar as opções?', options: ['Sim, manda as opções', 'Prefiro eu te ligar depois'] },
    ],
    scoring: {
      hot:  { min_score: 7, action: 'Agendar diagnóstico imediatamente', telegram: '🔥 Lead QUENTE! Qualificou bem — agendar agora' },
      warm: { min_score: 4, action: 'Enviar material + follow-up 48h',   telegram: '⭐ Lead morno — enviar conteúdo e fazer follow-up' },
      cold: { min_score: 0, action: 'Nutrir com conteúdo',               telegram: '❄️ Lead frio — entrar em sequência de nutrição' },
    },
    human_handoff_triggers: ['quero falar com humano', 'preciso falar com alguém', 'me liga', 'ligar agora'],
    fallback: 'Entendo! Deixa eu chamar o Breno para continuar essa conversa. Um momento.',
  },
  'diagnostic-booking': {
    name: 'Bot Agendamento de Diagnóstico',
    objective: 'Agendar diagnóstico gratuito de 30 min',
    steps: [
      { id: 1, msg: 'Olá! Para agendar seu diagnóstico gratuito, preciso de algumas informações rápidas.', type: 'intro' },
      { id: 2, msg: 'Qual é o seu nome?', type: 'open', field: 'nome' },
      { id: 3, msg: 'E o nome da sua empresa?', type: 'open', field: 'empresa' },
      { id: 4, msg: 'Qual seu setor/segmento?', type: 'open', field: 'setor' },
      { id: 5, msg: 'Qual seu principal gargalo operacional hoje?', type: 'open', field: 'gargalo' },
      { id: 6, msg: 'Perfeito! Vou verificar os horários disponíveis e te envio as opções em instantes.', type: 'closing' },
    ],
    crm_fields: ['nome', 'empresa', 'setor', 'gargalo', 'telefone', 'origem'],
  },
};

function buildLocalBotFlow(botType) {
  return BOT_FLOWS[botType] || {
    error: `Bot '${botType}' não encontrado`,
    available: Object.keys(BOT_FLOWS),
  };
}

async function designBotWithClaude(botObjective, targetAudience = 'PME') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o WhatsApp Bot Agent da SmartOps IA.

Missão: Criar fluxos de atendimento via WhatsApp que qualifiquem leads, agendem diagnósticos e encantem sem parecer robótico.

Objetivo do bot: "${botObjective}"
Público-alvo: ${targetAudience}

REGRAS DO BOT:
❌ NUNCA prometer resultado garantido
❌ NUNCA dar diagnóstico definitivo sem dados
❌ NUNCA continuar se usuário pedir humano
❌ NUNCA enviar spam ou insistir demais
✅ SEMPRE pedir consentimento quando necessário
✅ SEMPRE registrar no CRM
✅ SEMPRE ter fallback humano
✅ SEMPRE ser curto e claro

Responda no formato:

# WHATSAPP BOT DESIGN

## IDENTIFICAÇÃO
BOT_NAME: [nome]
OBJETIVO: [em 1 linha]
PÚBLICO: [quem vai interagir]
GATILHO: [o que ativa o bot]

## FLUXO DE MENSAGENS
Para cada etapa:
ETAPA X:
→ Bot: "[mensagem exata]"
→ Opções: [botões/opções se houver]
→ Input livre: [sim/não]
→ Campo CRM: [campo que é capturado]
→ Se não responder: [o que fazer em 24h]

## REGRAS DE QUALIFICAÇÃO
Score quente (7+): [critérios + ação]
Score morno (4-6): [critérios + ação]
Score frio (0-3): [critérios + ação]

## TRANSFERÊNCIA PARA HUMANO
Gatilhos: [frases que ativam handoff]
Mensagem de transição: [o que o bot diz]
Alerta Telegram: [mensagem enviada para Breno]

## CAMPOS CAPTURADOS PARA CRM
[lista de campos + onde registrar]

## MENSAGENS PADRÃO
Fallback: [quando bot não entende]
Erro: [quando algo falha]
Fim de conversa: [mensagem de encerramento]

## MÉTRICAS A MONITORAR
[taxa de conclusão, leads qualificados, handoffs, tempo médio]

## INTEGRAÇÃO n8n
[Como conectar ao n8n e CRM]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { designBotWithClaude, buildLocalBotFlow, BOT_FLOWS };
