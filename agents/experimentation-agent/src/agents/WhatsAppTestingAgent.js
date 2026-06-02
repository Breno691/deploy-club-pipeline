// WhatsAppTestingAgent.js — Testa mensagens, scripts e flows de WhatsApp
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Elementos de mensagem WhatsApp a testar
const WA_TEST_ELEMENTS = [
  { element: 'abertura',        impact: 10, desc: 'Primeira mensagem — define se vai responder' },
  { element: 'pergunta_inicial',impact: 9,  desc: 'Pergunta vs statement como abertura' },
  { element: 'quantidade_texto',impact: 7,  desc: 'Mensagem curta vs longa' },
  { element: 'emoji_uso',       impact: 6,  desc: 'Com emojis vs sem emojis' },
  { element: 'cta_final',       impact: 8,  desc: 'Como pede o próximo passo' },
  { element: 'horario_envio',   impact: 8,  desc: 'Manhã vs tarde vs noite' },
  { element: 'personalizacao',  impact: 9,  desc: 'Nome/empresa vs genérico' },
  { element: 'prova_social',    impact: 7,  desc: 'Com case/número vs sem' },
];

function analyzeWAMetricsLocally(metrics = {}) {
  const { sent = 0, delivered = 0, read = 0, replied = 0, converted = 0 } = metrics;
  const delivery_rate = sent > 0 ? (delivered / sent) * 100 : 0;
  const read_rate     = delivered > 0 ? (read / delivered) * 100 : 0;
  const reply_rate    = read > 0 ? (replied / read) * 100 : 0;
  const conv_rate     = replied > 0 ? (converted / replied) * 100 : 0;

  const issues = [];
  if (delivery_rate < 90) issues.push({ metric: 'delivery_rate', value: `${delivery_rate.toFixed(0)}%`, action: 'Verificar número bloqueado ou número inválido' });
  if (read_rate < 70)     issues.push({ metric: 'read_rate',     value: `${read_rate.toFixed(0)}%`,     action: 'Número salvo? Mensagem chegou como spam?' });
  if (reply_rate < 30)    issues.push({ metric: 'reply_rate',    value: `${reply_rate.toFixed(0)}%`,    action: 'Abertura da mensagem não engaja — testar nova abertura' });
  if (conv_rate < 20)     issues.push({ metric: 'conv_rate',     value: `${conv_rate.toFixed(0)}%`,     action: 'Responde mas não agenda — revisar script de qualificação' });

  return {
    funnel: { sent, delivered, read, replied, converted },
    rates:  { delivery_rate, read_rate, reply_rate, conv_rate },
    issues,
    priority_test: issues.length ? WA_TEST_ELEMENTS.find(e => e.element === (issues[0].metric.includes('reply') ? 'abertura' : 'cta_final')) : null,
  };
}

async function analyzeWATestingWithClaude(waData) {
  const local = analyzeWAMetricsLocally(waData.metrics || {});

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o WhatsApp Testing Agent da SmartOps IA.

Missão: Otimizar scripts e mensagens de WhatsApp para aumentar taxa de resposta, qualificação e agendamentos.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Dados: ${JSON.stringify(waData, null, 2)}

Funil WhatsApp:
Enviados: ${local.funnel.sent} → Lidos: ${local.funnel.read} (${local.rates.read_rate.toFixed(0)}%) → Respondidos: ${local.funnel.replied} (${local.rates.reply_rate.toFixed(0)}%) → Convertidos: ${local.funnel.converted} (${local.rates.conv_rate.toFixed(0)}%)

Issues detectados: ${local.issues.map(i => `${i.metric}: ${i.value}`).join(', ') || 'nenhum'}

Baseline taxa resposta: ${CONFIG.baseline_kpis.taxa_resposta_wa_pct}%

Responda:

# WHATSAPP TESTING REPORT

## DIAGNÓSTICO DO FUNIL
[Onde está o maior gargalo e por quê]

## TESTES A/B RECOMENDADOS
Para cada teste:
ELEMENTO: [abertura / pergunta / CTA / horário / personalização]
HIPÓTESE: [afirmação testável]
VERSÃO A (atual): [mensagem exata]
VERSÃO B (variante): [mensagem exata — seja específico]
MÉTRICA: [taxa de resposta / taxa de agendamento]
AMOSTRA: [quantos envios por variante]
CRITÉRIO: [o que define vencedor]

## SCRIPT OTIMIZADO PARA PRIMEIRA MENSAGEM
[Escreva 3 versões diferentes para testar]

## REGRAS DE OURO PARA WA SMARTOPS
[5 princípios baseados nos dados]

## PRÓXIMA AÇÃO
[O que testar nos próximos 50 envios]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { analyzeWATestingWithClaude, analyzeWAMetricsLocally, WA_TEST_ELEMENTS };
