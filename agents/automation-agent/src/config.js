// Automation Agent — config
const CONFIG = {
  agent: {
    name: 'Automation Agent',
    version: '1.0.0',
    role: 'Especialista em Automação de Processos, n8n, APIs e RPA',
    mission: 'Descobrir, projetar e documentar automações que eliminam trabalho manual e erro humano',
    mantra: 'Automatize o repetível. Libere o humano para o que importa.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  tools: {
    no_code:  ['n8n', 'Make (Integromat)', 'Zapier', 'Power Automate'],
    apis:     ['REST API', 'Webhook', 'GraphQL', 'WebSocket'],
    rpa:      ['UiPath', 'Power Automate Desktop', 'AutoHotkey'],
    ai:       ['Claude API', 'OpenAI API', 'Whisper', 'Eleven Labs'],
    crm:      ['HubSpot', 'Pipedrive', 'RD Station', 'Google Sheets como CRM'],
    comms:    ['WhatsApp Business API', 'Telegram Bot API', 'Email (SMTP/IMAP)', 'Slack'],
    storage:  ['Google Drive', 'Supabase', 'Notion', 'Airtable'],
  },

  automation_catalog: [
    { nome: 'Lead capture → CRM', complexidade: 'Baixa', roi_h_mes: 8,  desc: 'Formulário → planilha/CRM + notificação WhatsApp' },
    { nome: 'Follow-up automático', complexidade: 'Baixa', roi_h_mes: 10, desc: 'Lead novo → sequência WhatsApp/email 3 dias' },
    { nome: 'Relatório semanal', complexidade: 'Baixa', roi_h_mes: 6,  desc: 'Coleta dados → monta relatório → envia email/Telegram' },
    { nome: 'Onboarding de cliente', complexidade: 'Média', roi_h_mes: 12, desc: 'Contrato assinado → pasta Drive + briefing + bem-vindo' },
    { nome: 'Aprovação de documentos', complexidade: 'Média', roi_h_mes: 8,  desc: 'Documento gerado → envia para aprovação → registro' },
    { nome: 'Cobrança e régua de pagamento', complexidade: 'Média', roi_h_mes: 10, desc: 'Vencimento → WhatsApp → email → registro' },
    { nome: 'NPS automático', complexidade: 'Baixa', roi_h_mes: 4,  desc: 'Entrega → 3 dias → pesquisa NPS → dashboard' },
    { nome: 'Classificação de leads IA', complexidade: 'Alta', roi_h_mes: 20, desc: 'Lead → Claude analisa → score → prioriza → notifica' },
    { nome: 'Extração de dados PDF/email', complexidade: 'Alta', roi_h_mes: 15, desc: 'PDF chega → extrai dados → preenche planilha' },
    { nome: 'Agendamento inteligente', complexidade: 'Média', roi_h_mes: 8,  desc: 'Lead qualificado → Calendly → confirmação → lembrete' },
  ],

  n8n_nodes: {
    triggers:    ['Webhook', 'Schedule Trigger', 'Email Trigger', 'Form Trigger'],
    transform:   ['Set', 'Code', 'Function', 'If', 'Switch', 'Merge'],
    integrations: ['HTTP Request', 'Google Sheets', 'Gmail', 'Telegram', 'WhatsApp Business'],
    ai:          ['Anthropic', 'OpenAI', 'Embeddings', 'Chain'],
    storage:     ['Supabase', 'Airtable', 'Notion', 'Google Drive'],
  },

  scoring_weights: {
    roi_horas:      30,
    frequencia:     20,
    impacto_erro:   25,
    facilidade:     15,
    velocidade_roi: 10,
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
