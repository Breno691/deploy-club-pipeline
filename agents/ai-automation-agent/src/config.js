// AI Automation Discovery Agent — config
const CONFIG = {
  agent: {
    name:    'AI Automation Discovery Agent',
    version: '1.0.0',
    role:    'Diretor de Automação Inteligente e Workflows IA',
    mission: 'Identificar, priorizar e implementar automações que reduzam trabalho manual, eliminem retrabalho e gerem ROI',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    location: 'Belo Horizonte, MG',
  },

  // Thresholds de automation score
  score_thresholds: {
    AUTOMATIZAR_AGORA: { min: 85, max: 100, label: 'Automatizar Agora',  color: 'verde'   },
    POC:               { min: 70, max: 84,  label: 'Criar PoC',          color: 'azul'    },
    MELHORAR_ANTES:    { min: 50, max: 69,  label: 'Melhorar Processo',  color: 'amarelo' },
    NAO_AUTOMATIZAR:   { min: 0,  max: 49,  label: 'Não Automatizar',    color: 'vermelho'},
  },

  // Pesos do automation score (total = 100)
  score_weights: {
    frequencia:           15,
    tempo_economizado:    20,
    erro_reduzido:        15,
    clareza_processo:     10,
    facilidade_tecnica:   10,
    impacto_financeiro:   15,
    reutilizacao:         10,
    baixo_risco:           5,
  },

  // Status lifecycle de automações
  automation_status: [
    'discovered', 'mapped', 'scored', 'poc_planned', 'building',
    'testing', 'ready_for_review', 'approved', 'active',
    'monitoring', 'failed', 'needs_fix', 'paused', 'archived', 'productized',
  ],

  // Custos estimados de hora de trabalho
  cost_per_hour: {
    breno:       150,  // R$/hora — consultor sênior
    assistente:   60,  // R$/hora — assistente
    admin:        40,  // R$/hora — administrativo
    dev:         120,  // R$/hora — desenvolvedor
  },

  // Gatilhos automáticos para análise
  auto_triggers: {
    tarefa_repetida_min:     3,   // vezes antes de analisar
    horas_mes_threshold:     5,   // h/mês antes de criar business case
    workflow_falha_max:      2,   // falhas antes de notificar
    horas_economizadas_min: 10,   // h/mês antes de documentar case
  },

  // Automações internas prioritárias SmartOps
  internal_automations: [
    { name: 'Follow-up de leads WhatsApp',        score: 88, hours_saved: 20, roi: 3200 },
    { name: 'Relatório cliente semanal',           score: 85, hours_saved: 8,  roi: 1200 },
    { name: 'Lead capture → CRM',                 score: 92, hours_saved: 12, roi: 1800 },
    { name: 'Google Ads daily alert',             score: 82, hours_saved: 5,  roi: 750  },
    { name: 'Proposal generation',               score: 79, hours_saved: 6,  roi: 900  },
    { name: 'Case study capture',                score: 76, hours_saved: 4,  roi: 600  },
    { name: 'Client follow-up 7/14/30 dias',     score: 87, hours_saved: 10, roi: 1500 },
    { name: 'Website conversion alert',          score: 80, hours_saved: 3,  roi: 450  },
  ],

  // Integrações disponíveis
  integrations: [
    'n8n', 'whatsapp', 'crm', 'google_sheets', 'google_drive',
    'gmail', 'google_calendar', 'instagram', 'meta_ads', 'google_ads',
    'ga4', 'supabase', 'notion', 'telegram', 'openai', 'anthropic',
    'site_forms', 'stripe', 'calendly',
  ],

  // Tipos de automação
  automation_types: ['interna_smartops', 'para_cliente', 'com_ia', 'sem_ia', 'bot_whatsapp'],

  // Categorias de processo
  process_areas: [
    'marketing', 'vendas', 'operacoes', 'financeiro',
    'atendimento', 'rh', 'juridico', 'compras', 'logistica',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

// Templates de workflow n8n padrão
const WORKFLOW_STANDARDS = {
  required_elements: [
    'nome_claro', 'trigger_definido', 'validacao_entrada',
    'etapas_modulares', 'tratamento_erro', 'logs',
    'alertas', 'testes', 'documentacao', 'versionamento', 'metrica_sucesso',
  ],
  name_pattern: '[AREA]_[PROCESSO]_[OBJETIVO]',
  examples: [
    'MARKETING_INSTAGRAM_AUTO_POST',
    'SALES_LEAD_QUALIFICATION_WHATSAPP',
    'ADS_DAILY_PERFORMANCE_ALERT',
    'CLIENT_SUCCESS_FOLLOWUP_7_DAYS',
    'FINANCE_INVOICE_REMINDER',
  ],
};

module.exports = { CONFIG, WORKFLOW_STANDARDS };
