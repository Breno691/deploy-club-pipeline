// ErrorHandlingAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Padrões de erro e suas soluções
const ERROR_PATTERNS = {
  'timeout': {
    causes: ['API lenta', 'rede instável', 'timeout muito curto'],
    solutions: ['Aumentar timeout para 30s', 'Implementar retry com backoff', 'Usar queue assíncrona'],
    retry: { max: 3, delay_ms: 2000, backoff: 'exponential' },
  },
  'auth': {
    causes: ['Token expirado', 'Credencial inválida', 'Permissão negada'],
    solutions: ['Renovar token', 'Verificar credenciais no n8n', 'Checar permissões da conta de serviço'],
    retry: { max: 1, delay_ms: 0, backoff: 'none' },
  },
  'validation': {
    causes: ['Campo obrigatório vazio', 'Formato inválido', 'Dados fora do esperado'],
    solutions: ['Adicionar validação antes do node problemático', 'Usar Set node para normalizar dados', 'Tratar null/undefined'],
    retry: { max: 0, delay_ms: 0, backoff: 'none' },
  },
  'rate_limit': {
    causes: ['Muitas requisições em pouco tempo', 'Limite de API excedido'],
    solutions: ['Implementar throttle', 'Usar queue com delay', 'Reduzir frequência do trigger'],
    retry: { max: 5, delay_ms: 5000, backoff: 'exponential' },
  },
  'duplicate': {
    causes: ['Mesmo dado processado duas vezes', 'Webhook disparado múltiplas vezes'],
    solutions: ['Adicionar deduplicação por ID', 'Verificar no banco antes de processar', 'Usar idempotency key'],
    retry: { max: 0, delay_ms: 0, backoff: 'none' },
  },
};

function buildErrorHandlingSpec(workflowName) {
  return {
    workflow:      workflowName,
    required_elements: [
      '✅ Error Trigger node conectado a todas as branches',
      '✅ Telegram alert com: workflow_name, error_type, timestamp, input_data_summary',
      '✅ Log no Supabase: automation_failures table',
      '✅ Status claro: FAILED / PARTIAL / RETRY',
      '✅ Retry automático para: timeout e rate_limit',
      '✅ Sem retry para: auth, validation, duplicate',
      '✅ Responsável notificado via Telegram em erros críticos',
    ],
    error_patterns: ERROR_PATTERNS,
    telegram_format: `⚠️ WORKFLOW ERROR — ${workflowName}\n🕐 {timestamp}\n❌ Erro: {error_type}\n📋 Detalhe: {error_message}\n🔄 Retry: {retry_count}/{max_retries}`,
    created_at: new Date().toISOString(),
  };
}

async function analyzeErrorWithClaude(errorData) {
  const { workflow, error_type, error_message, context } = errorData;
  const pattern = ERROR_PATTERNS[error_type] || ERROR_PATTERNS['timeout'];

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Você é o Error Handling Agent da SmartOps IA.

Um workflow n8n falhou. Analise e sugira a correção mais rápida.

Workflow: ${workflow}
Tipo de erro: ${error_type}
Mensagem: ${error_message}
Contexto: ${context || 'não informado'}

Causas prováveis: ${pattern.causes.join(', ')}
Soluções conhecidas: ${pattern.solutions.join(', ')}

Responda:

# ERROR ANALYSIS

CAUSA_RAIZ: [mais provável em 1 linha]
IMPACTO: [o que parou de funcionar]
URGÊNCIA: [Crítico/Alto/Médio/Baixo]
SOLUÇÃO_IMEDIATA: [o que fazer agora, em 5 minutos]
SOLUÇÃO_DEFINITIVA: [correção permanente]
PREVENCAO: [como evitar na próxima vez]
TEMPO_ESTIMADO: [para resolver]
STATUS_RECOMENDADO: [workflow deve ficar: ativo/pausado até corrigir]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { buildErrorHandlingSpec, analyzeErrorWithClaude, ERROR_PATTERNS };
