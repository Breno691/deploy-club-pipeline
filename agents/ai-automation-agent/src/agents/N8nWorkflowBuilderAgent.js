// N8nWorkflowBuilderAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

// Biblioteca de nodes n8n mais utilizados
const NODE_LIBRARY = {
  trigger: ['n8n-nodes-base.scheduleTrigger', 'n8n-nodes-base.webhook', 'n8n-nodes-base.manualTrigger'],
  logic:   ['n8n-nodes-base.if', 'n8n-nodes-base.switch', 'n8n-nodes-base.merge', 'n8n-nodes-base.set', 'n8n-nodes-base.code'],
  http:    ['n8n-nodes-base.httpRequest'],
  google:  ['n8n-nodes-base.googleSheets', 'n8n-nodes-base.gmail', 'n8n-nodes-base.googleCalendar'],
  ai:      ['@n8n/n8n-nodes-langchain.lmChatAnthropic', '@n8n/n8n-nodes-langchain.agent'],
  msg:     ['n8n-nodes-base.telegram', 'n8n-nodes-base.whatsApp'],
  db:      ['n8n-nodes-base.postgres', 'n8n-nodes-base.supabase'],
  error:   ['n8n-nodes-base.errorTrigger', 'n8n-nodes-base.stopAndError'],
};

function generateWorkflowSkeleton(workflowName, triggerType = 'manual') {
  const id = `wf_${Date.now()}`;
  const trigger = triggerType === 'schedule'
    ? { type: 'n8n-nodes-base.scheduleTrigger', params: { rule: { interval: [{ field: 'hours', minutesInterval: 24 }] } } }
    : { type: 'n8n-nodes-base.manualTrigger', params: {} };

  return {
    id,
    name: workflowName,
    active: false,
    nodes: [
      { id: 'node_1', name: 'Trigger', type: trigger.type, position: [100, 200], parameters: trigger.params },
      { id: 'node_2', name: 'Validate Input', type: 'n8n-nodes-base.if', position: [300, 200], parameters: {} },
      { id: 'node_3', name: 'Main Logic', type: 'n8n-nodes-base.code', position: [500, 200], parameters: {} },
      { id: 'node_4', name: 'Log Result', type: 'n8n-nodes-base.httpRequest', position: [700, 200], parameters: {} },
      { id: 'error_1', name: 'Error Handler', type: 'n8n-nodes-base.errorTrigger', position: [100, 400], parameters: {} },
      { id: 'alert_1', name: 'Alert Telegram', type: 'n8n-nodes-base.telegram', position: [300, 400], parameters: {} },
    ],
    connections: {
      Trigger: { main: [[{ node: 'Validate Input', type: 'main', index: 0 }]] },
      'Validate Input': { main: [[{ node: 'Main Logic', type: 'main', index: 0 }]] },
      'Main Logic': { main: [[{ node: 'Log Result', type: 'main', index: 0 }]] },
      'Error Handler': { main: [[{ node: 'Alert Telegram', type: 'main', index: 0 }]] },
    },
    settings: { executionOrder: 'v1', saveManualExecutions: true, callerPolicy: 'workflowsFromSameOwner' },
    meta: { templateCredsSetupCompleted: false, generatedBy: 'SmartOps AI Automation Agent', createdAt: new Date().toISOString() },
  };
}

async function buildWorkflowWithClaude(workflowSpec, outputDir = null) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o N8n Workflow Builder Agent da SmartOps IA.

Missão: Gerar especificação técnica detalhada de workflow n8n baseada na arquitetura aprovada.

Especificação: ${typeof workflowSpec === 'string' ? workflowSpec : JSON.stringify(workflowSpec, null, 2)}

Nodes disponíveis:
- Triggers: ${NODE_LIBRARY.trigger.join(', ')}
- Lógica: ${NODE_LIBRARY.logic.join(', ')}
- HTTP: ${NODE_LIBRARY.http.join(', ')}
- Google: ${NODE_LIBRARY.google.join(', ')}
- IA: ${NODE_LIBRARY.ai.join(', ')}
- Mensagens: ${NODE_LIBRARY.msg.join(', ')}
- Database: ${NODE_LIBRARY.db.join(', ')}
- Erro: ${NODE_LIBRARY.error.join(', ')}

REGRAS OBRIGATÓRIAS:
✅ SEMPRE incluir Error Handler conectado ao Telegram
✅ SEMPRE incluir validação de entrada
✅ SEMPRE logar execuções no Supabase
✅ SEMPRE ter retry em chamadas externas
✅ NUNCA criar sem tratamento de erro

Responda no formato:

# WORKFLOW SPEC — [NOME]

## NODES (detalhados)
Para cada node: nome, tipo n8n, parâmetros principais, credencial necessária

## CONEXÕES
[grafo de conexões entre nodes]

## CONFIGURAÇÃO DE CADA NODE
[parâmetros específicos críticos]

## CREDENCIAIS NECESSÁRIAS
[lista de credenciais a configurar no n8n antes de ativar]

## CÓDIGO JavaScript (se houver Code node)
\`\`\`javascript
[código do node]
\`\`\`

## CONFIGURAÇÃO DO ERROR HANDLER
[nodes de tratamento de erro + alerta Telegram]

## COMO TESTAR
[passo a passo para testar antes de ativar]

## COMO MONITORAR EM PRODUÇÃO
[métricas a observar]`,
    }],
  });

  const spec = response.content[0].text;

  if (outputDir) {
    const dir = path.join(outputDir, 'n8n-workflows');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fname = `workflow_spec_${Date.now()}.md`;
    fs.writeFileSync(path.join(dir, fname), spec, 'utf-8');
  }

  return spec;
}

module.exports = { buildWorkflowWithClaude, generateWorkflowSkeleton, NODE_LIBRARY };
