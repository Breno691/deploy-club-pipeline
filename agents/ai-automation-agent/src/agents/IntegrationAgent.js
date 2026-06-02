// IntegrationAgent.js — Conecta ferramentas e decide arquitetura de integração
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Mapa de integrações disponíveis com capacidades
const INTEGRATION_MAP = {
  crm:              { type: 'database', auth: 'api_key', trigger: true,  action: true,  n8n_node: 'n8n-nodes-base.httpRequest' },
  google_sheets:    { type: 'storage',  auth: 'oauth2',  trigger: false, action: true,  n8n_node: 'n8n-nodes-base.googleSheets' },
  google_drive:     { type: 'storage',  auth: 'oauth2',  trigger: false, action: true,  n8n_node: 'n8n-nodes-base.googleDrive' },
  gmail:            { type: 'email',    auth: 'oauth2',  trigger: true,  action: true,  n8n_node: 'n8n-nodes-base.gmail' },
  google_calendar:  { type: 'calendar', auth: 'oauth2',  trigger: false, action: true,  n8n_node: 'n8n-nodes-base.googleCalendar' },
  whatsapp:         { type: 'messaging',auth: 'api_key', trigger: true,  action: true,  n8n_node: 'n8n-nodes-base.whatsApp' },
  telegram:         { type: 'messaging',auth: 'bot_token',trigger: true, action: true,  n8n_node: 'n8n-nodes-base.telegram' },
  instagram:        { type: 'social',   auth: 'oauth2',  trigger: false, action: true,  n8n_node: 'n8n-nodes-base.instagram' },
  google_ads:       { type: 'ads',      auth: 'oauth2',  trigger: false, action: false, n8n_node: 'n8n-nodes-base.googleAds' },
  meta_ads:         { type: 'ads',      auth: 'oauth2',  trigger: false, action: false, n8n_node: 'n8n-nodes-base.httpRequest' },
  supabase:         { type: 'database', auth: 'api_key', trigger: false, action: true,  n8n_node: 'n8n-nodes-base.supabase' },
  notion:           { type: 'docs',     auth: 'api_key', trigger: false, action: true,  n8n_node: 'n8n-nodes-base.notion' },
  anthropic:        { type: 'ai',       auth: 'api_key', trigger: false, action: true,  n8n_node: '@n8n/n8n-nodes-langchain.lmChatAnthropic' },
  n8n:              { type: 'automation',auth: 'api_key',trigger: true,  action: true,  n8n_node: 'n8n-nodes-base.webhook' },
  site_forms:       { type: 'form',     auth: 'webhook', trigger: true,  action: false, n8n_node: 'n8n-nodes-base.webhook' },
  google_analytics: { type: 'analytics',auth: 'oauth2', trigger: false, action: false, n8n_node: 'n8n-nodes-base.httpRequest' },
};

function buildIntegrationSpec(fromTool, toTool, dataToTransfer = []) {
  const from = INTEGRATION_MAP[fromTool];
  const to   = INTEGRATION_MAP[toTool];

  if (!from || !to) {
    return { error: `Integração desconhecida: ${!from ? fromTool : toTool}`, available: Object.keys(INTEGRATION_MAP) };
  }

  const canTrigger = from.trigger;
  const canReceive = to.action;
  const feasible = canTrigger && canReceive;

  return {
    from:     { tool: fromTool, ...from },
    to:       { tool: toTool,   ...to   },
    feasible,
    pattern:  feasible ? 'trigger→action' : 'polling',
    data_fields: dataToTransfer,
    credentials_needed: [
      ...(from.auth !== 'webhook' ? [`${fromTool}_${from.auth}`] : []),
      ...(to.auth !== 'webhook'   ? [`${toTool}_${to.auth}`]     : []),
    ],
    n8n_nodes: [from.n8n_node, to.n8n_node],
    estimated_setup_hours: from.auth === 'oauth2' || to.auth === 'oauth2' ? 2 : 1,
    complexity: from.type === 'ai' || to.type === 'ai' ? 'media' : 'baixa',
  };
}

function planIntegrationArchitecture(integrations = []) {
  const specs = integrations.map(i => buildIntegrationSpec(i.from, i.to, i.data));
  const total_hours = specs.reduce((s, i) => s + (i.estimated_setup_hours || 1), 0);
  const credentials = [...new Set(specs.flatMap(i => i.credentials_needed || []))];

  return {
    integrations: specs,
    total_setup_hours: total_hours,
    credentials_to_configure: credentials,
    complexity_summary: specs.filter(s => s.complexity === 'media').length > 2 ? 'media' : 'baixa',
    all_feasible: specs.every(s => s.feasible),
    blockers: specs.filter(s => !s.feasible).map(s => `${s.from?.tool} → ${s.to?.tool}: sem trigger direto`),
  };
}

async function designIntegrationWithClaude(description, tools = []) {
  const toolList = tools.length ? tools : Object.keys(INTEGRATION_MAP);
  const relevantTools = toolList.filter(t => INTEGRATION_MAP[t]);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Integration Agent da SmartOps IA.

Missão: Desenhar a arquitetura de integração entre ferramentas para que dados fluam automaticamente sem trabalho manual.

Integração solicitada: "${description}"
Ferramentas relevantes: ${relevantTools.join(', ')}

Ferramentas disponíveis no ecossistema SmartOps:
${Object.entries(INTEGRATION_MAP).map(([k, v]) => `- ${k}: ${v.type} | trigger=${v.trigger} | action=${v.action}`).join('\n')}

Projete:

# INTEGRATION ARCHITECTURE

## RESUMO
[O que conectar com o quê e por quê]

## DIAGRAMA DE FLUXO
[FERRAMENTA_A] --[dado/evento]--> [FERRAMENTA_B] --[dado]--> [FERRAMENTA_C]

## DETALHAMENTO POR INTEGRAÇÃO
Para cada conexão:
DE: [ferramenta origem]
PARA: [ferramenta destino]
TRIGGER: [o que dispara]
DADOS TRANSFERIDOS: [campos específicos]
TRANSFORMAÇÃO: [o que muda no meio — enriquecimento, formatação, etc.]
NODE N8N: [tipo de node a usar]
CREDENCIAL: [o que configurar]
TRATAMENTO DE ERRO: [o que fazer se falhar]

## CREDENCIAIS NECESSÁRIAS
[Lista de APIs a configurar no n8n antes de ativar]

## ORDEM DE IMPLEMENTAÇÃO
[Do mais simples ao mais complexo]

## ESTIMATIVA
Horas de setup: [N]
Manutenção mensal: [N] horas
Custo mensal das ferramentas: R$ [estimativa]

## RISCO E MITIGATION
[O que pode quebrar + como prevenir]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { designIntegrationWithClaude, buildIntegrationSpec, planIntegrationArchitecture, INTEGRATION_MAP };
