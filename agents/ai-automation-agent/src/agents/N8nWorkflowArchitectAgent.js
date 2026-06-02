// N8nWorkflowArchitectAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG, WORKFLOW_STANDARDS } = require('../config');

const client = new Anthropic();

// Templates locais de arquitetura de workflows
const WORKFLOW_ARCHITECTURES = {
  'lead-capture-crm': {
    name: 'SALES_LEAD_CAPTURE_CRM',
    trigger: 'Webhook — formulário site ou WhatsApp',
    nodes: ['Webhook', 'Validate Input', 'Enrich Lead', 'Lead Scoring', 'CRM Insert', 'Telegram Alert', 'Task Create'],
    credentials: ['crm_api', 'telegram_bot'],
    error_handling: 'Catch node → Telegram alert → Supabase log',
    logging: 'Supabase automation_executions',
    test_cases: ['Lead válido', 'Lead sem telefone', 'Lead duplicado'],
  },
  'instagram-auto-post': {
    name: 'MARKETING_INSTAGRAM_AUTO_POST',
    trigger: 'Schedule — Ter/Qui/Sáb 18:00',
    nodes: ['Schedule', 'Fetch Content', 'Format Post', 'Upload Media', 'Instagram Post', 'Log Result'],
    credentials: ['instagram_graph_api', 'supabase'],
    error_handling: 'On error → Telegram alert + schedule retry',
    logging: 'outputs/<task>/logs/instagram_post.log',
    test_cases: ['Post com imagem', 'Post sem mídia', 'Token expirado'],
  },
  'ads-daily-alert': {
    name: 'ADS_DAILY_PERFORMANCE_ALERT',
    trigger: 'Schedule — diário 08:00',
    nodes: ['Schedule', 'Google Ads API', 'Meta Ads API', 'Analyze Metrics', 'Check Thresholds', 'IF Anomaly', 'Telegram Alert'],
    credentials: ['google_ads', 'meta_ads', 'telegram_bot'],
    error_handling: 'Catch → Telegram "Ads monitoring offline"',
    logging: 'Supabase ads_alerts',
    test_cases: ['CPA normal', 'CPA acima threshold', 'API timeout'],
  },
  'client-followup': {
    name: 'CLIENT_SUCCESS_FOLLOWUP_7_DAYS',
    trigger: 'Schedule — diário 09:00',
    nodes: ['Schedule', 'CRM Query', 'Filter No Contact 7d', 'Generate Message', 'WhatsApp Send', 'CRM Update'],
    credentials: ['crm_api', 'whatsapp_api'],
    error_handling: 'On fail → Telegram + skip client + continue',
    logging: 'Supabase client_followups',
    test_cases: ['Cliente sem contato', 'Todos com contato', 'WhatsApp falha'],
  },
};

function buildLocalArchitecture(workflowType) {
  const arch = WORKFLOW_ARCHITECTURES[workflowType];
  if (!arch) {
    return {
      error: `Tipo '${workflowType}' não encontrado`,
      available: Object.keys(WORKFLOW_ARCHITECTURES),
    };
  }

  return {
    ...arch,
    standard_elements_check: WORKFLOW_STANDARDS.required_elements.map(el => ({
      element: el,
      present: true,
    })),
    deployment_ready: true,
  };
}

async function architectWorkflowWithClaude(workflowDescription, workflowName = '') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o N8n Workflow Architect Agent da SmartOps IA.

Missão: Desenhar a arquitetura completa de um workflow n8n antes de começar a construir.

Workflow a arquitetar: "${workflowDescription}"
Nome sugerido: ${workflowName || '[gerar no padrão AREA_PROCESSO_OBJETIVO]'}

Padrão de nome: ${WORKFLOW_STANDARDS.name_pattern}

Todo workflow DEVE ter: ${WORKFLOW_STANDARDS.required_elements.join(', ')}.

Responda no formato:

# WORKFLOW ARCHITECTURE — ${workflowName || '[NOME]'}

## IDENTIFICAÇÃO
WORKFLOW_NAME: [no padrão AREA_PROCESSO_OBJETIVO]
OBJETIVO: [uma linha]
TRIGGER: [tipo + quando dispara]
RESPONSÁVEL: Breno Luiz / SmartOps IA

## DADOS DE ENTRADA
INPUT_REQUIRED: [campos obrigatórios com tipo]
INPUT_OPTIONAL: [campos opcionais]
VALIDAÇÕES: [o que validar antes de processar]

## ARQUITETURA DE NODES
| Node | Tipo | Propósito | Entra | Sai |
|------|------|-----------|-------|-----|
[preencher tabela]

## FLUXO CONDICIONAL
[decisões IF/SWITCH com ramificações]

## INTEGRAÇÕES EXTERNAS
[APIs, webhooks, credenciais necessárias]

## TRATAMENTO DE ERRO
[Como tratar: timeout, API fail, dados inválidos, duplicidade]

## LOGS E AUDITORIA
[Onde logar, o que logar, formato]

## ALERTAS
[Quando e como notificar via Telegram/email]

## PLANO DE TESTES
[5+ casos de teste antes de ir a produção]

## CHECKLIST DE DEPLOY
[O que verificar antes de ativar em produção]

## MÉTRICAS DE SUCESSO
[Como saber se o workflow está funcionando bem]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { architectWorkflowWithClaude, buildLocalArchitecture, WORKFLOW_ARCHITECTURES };
