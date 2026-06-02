// AIUseCaseAgent.js — Decide quando IA realmente agrega vs automação simples
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Casos onde IA AGREGA valor real
const AI_GOOD_CASES = [
  { case: 'classificar_leads',       reason: 'Texto variável, precisa de julgamento contextual',    roi: 'alto' },
  { case: 'resumir_reunioes',        reason: 'Conteúdo não estruturado, linguagem natural',          roi: 'alto' },
  { case: 'extrair_dados_pdf',       reason: 'Documentos não estruturados, formatos variados',       roi: 'alto' },
  { case: 'gerar_propostas',         reason: 'Texto personalizado por cliente, contexto variável',   roi: 'alto' },
  { case: 'responder_faq',           reason: 'Perguntas variadas, respostas contextuais',            roi: 'medio' },
  { case: 'analisar_reclamacoes',    reason: 'Intenção implícita, sentimento, classificação',        roi: 'alto' },
  { case: 'gerar_relatorios',        reason: 'Síntese de dados em linguagem executiva',              roi: 'medio' },
  { case: 'detectar_intencao_wa',    reason: 'Linguagem informal, contexto conversacional',          roi: 'alto' },
  { case: 'criar_copy_ads',          reason: 'Variação de mensagem, teste A/B, personalização',      roi: 'medio' },
  { case: 'score_texto_livre',       reason: 'Input aberto sem schema fixo',                        roi: 'alto' },
];

// Casos onde IA NÃO deve ser usada (use automação determinística)
const AI_BAD_CASES = [
  { case: 'calculo_financeiro',      reason: 'Precisa de 100% determinismo — usar calculadora pura',   risk: 'alto' },
  { case: 'decisao_financeira_final',reason: 'Responsabilidade humana obrigatória',                    risk: 'critico' },
  { case: 'envio_email_template',    reason: 'Template fixo — usar n8n com Set node',                 risk: 'baixo' },
  { case: 'mover_dados_entre_apis',  reason: 'HTTP Request + Set node é mais rápido e barato',        risk: 'baixo' },
  { case: 'agendar_reuniao',         reason: 'Regra clara — Calendly ou Google Calendar diretamente', risk: 'baixo' },
  { case: 'enviar_nf',               reason: 'Documento fixo — automatizar por trigger de evento',    risk: 'medio' },
  { case: 'sincronizar_crm',         reason: 'Mapeamento fixo de campos — HTTP Request',              risk: 'baixo' },
];

function classifyTaskLocally(taskDescription = '') {
  const text = taskDescription.toLowerCase();

  const ai_signals = [
    { keywords: ['classificar', 'categorizar', 'entender', 'interpretar'], score: 8 },
    { keywords: ['resumir', 'sintetizar', 'analisar texto'], score: 9 },
    { keywords: ['responder', 'perguntas variadas', 'faq'], score: 7 },
    { keywords: ['gerar', 'criar', 'redigir', 'personalizar'], score: 8 },
    { keywords: ['extrair', 'pdf', 'documento', 'nao estruturado'], score: 9 },
    { keywords: ['intenção', 'sentimento', 'emoção'], score: 9 },
  ];

  const rule_signals = [
    { keywords: ['calcular', 'somar', 'multiplicar', 'dividir'], score: 9 },
    { keywords: ['mover', 'copiar', 'transferir', 'sincronizar'], score: 8 },
    { keywords: ['enviar email', 'notificar', 'agendar'], score: 7 },
    { keywords: ['template fixo', 'mesmo formato', 'sempre igual'], score: 9 },
    { keywords: ['webhook', 'trigger', 'api para api'], score: 8 },
  ];

  const ai_score = ai_signals.filter(s => s.keywords.some(k => text.includes(k))).reduce((sum, s) => sum + s.score, 0);
  const rule_score = rule_signals.filter(s => s.keywords.some(k => text.includes(k))).reduce((sum, s) => sum + s.score, 0);

  const use_ai = ai_score > rule_score;
  const confidence = Math.abs(ai_score - rule_score) > 10 ? 'alta' : 'media';

  return {
    recommendation: use_ai ? 'USAR_IA' : 'AUTOMACAO_REGRA',
    ai_score,
    rule_score,
    confidence,
    reason: use_ai
      ? 'Tarefa envolve linguagem natural, variação ou julgamento contextual'
      : 'Tarefa tem regras claras e output previsível — automação determinística é melhor',
    cost_note: use_ai
      ? 'Custo por execução: ~R$ 0,02-0,10 (Claude API) — justificado para tarefas complexas'
      : 'Custo por execução: ~R$ 0,00 (n8n puro) — preferível para tarefas simples',
    alternatives: use_ai ? AI_GOOD_CASES.slice(0, 3) : AI_BAD_CASES.slice(0, 3),
  };
}

async function evaluateAIUseCaseWithClaude(taskDescription, context = '') {
  const localEval = classifyTaskLocally(taskDescription);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o AI Use Case Agent da SmartOps IA.

Missão: Decidir com precisão quando IA (LLM) realmente agrega vs quando automação simples (n8n regras, HTTP, Set node) é suficiente e mais barata.

Tarefa avaliada: "${taskDescription}"
Contexto: ${context || 'automação SmartOps IA'}

Avaliação local prévia:
- Recomendação: ${localEval.recommendation}
- Score IA: ${localEval.ai_score} | Score Regra: ${localEval.rule_score}
- Confiança: ${localEval.confidence}

REGRA PRINCIPAL: Não usar IA onde regra simples resolve. IA custa mais e pode alucinar.

Responda:

# AI USE CASE EVALUATION

## DECISÃO
[USAR IA / USAR AUTOMAÇÃO SIMPLES / HÍBRIDO]
[1 linha de justificativa]

## POR QUE ESSA DECISÃO
[Evidências concretas da tarefa que justificam]

## COMO IMPLEMENTAR
Se IA: [modelo recomendado + prompt estratégia + onde no fluxo]
Se Automação: [nodes n8n específicos + lógica]
Se Híbrido: [o que vai para IA e o que vai para regra]

## CUSTO ESTIMADO
[Por execução e mensal com volume estimado]

## RISCOS
[O que pode dar errado + como mitigar]

## DECISÃO FINAL
[Implementar com: ferramenta + abordagem + próximo passo]`,
    }],
  });

  return { analysis: response.content[0].text, local: localEval };
}

module.exports = { evaluateAIUseCaseWithClaude, classifyTaskLocally, AI_GOOD_CASES, AI_BAD_CASES };
