// Partnership Intelligence Agent — config
const CONFIG = {
  agent: {
    name:    'Partnership Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Parcerias Estratégicas e Canais B2B',
    mission: 'Criar rede de parceiros que gere leads qualificados e receita para a SmartOps IA',
  },

  company: {
    name:      'SmartOps IA',
    owner:     'Breno Luiz',
    services:  ['Lean Six Sigma', 'Melhoria Contínua', 'Automação com IA', 'Kaizen', 'Process Mining', 'Consultoria Operacional'],
    location:  'Belo Horizonte, MG',
    target:    'PMEs em BH e região metropolitana',
    contact:   'brenoluiz691@gmail.com',
  },

  scoring: {
    PRIORIDADE_MAXIMA: { threshold: 85, label: 'Prioridade Máxima',  action: 'Abordar esta semana' },
    BOM_PARCEIRO:      { threshold: 70, label: 'Bom Parceiro',       action: 'Abordar este mês' },
    MONITORAR:         { threshold: 50, label: 'Monitorar',          action: 'Avaliar em 60 dias' },
    BAIXA_PRIORIDADE:  { threshold: 0,  label: 'Baixa Prioridade',   action: 'Não priorizar agora' },
  },

  weights: {
    acesso_a_pmes:          20,
    confianca_empresarios:  20,
    complementaridade:      15,
    potencial_indicacao:    15,
    fit_local:              10,
    facilidade_ativacao:    10,
    potencial_co_marketing:  5,
    baixo_risco:             5,
  },

  commission: {
    default:    10,
    active:     15,
    strategic:  20,
    currency:   'BRL',
    rule:       'Comissão paga somente após cliente efetuar pagamento',
  },

  pipeline: {
    stages: [
      'identified','researched','qualified','contacted',
      'meeting_scheduled','meeting_done','proposal_sent','agreement_signed',
      'onboarded','activated','first_referral_received',
      'revenue_generated','active_partner','inactive','rejected',
    ],
  },

  priorityTypes: [
    'accountants','business-lawyers','marketing-agencies','software-houses',
    'erp-consultants','financial-consultants','hr-consultants',
    'commercial-associations','sebrae-entities','coworkings',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
