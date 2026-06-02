// Market Opportunity Intelligence Agent — config

const CONFIG = {
  agent: {
    name:    'Market Opportunity Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Expansão Estratégica e Inteligência de Mercado',
  },

  company: {
    name:     'SmartOps IA',
    services: ['Lean Six Sigma', 'Automação', 'IA Empresarial', 'Process Mining'],
    location: 'BH/MG',
    ticketMin: 8000,   // R$
    ticketMax: 20000,  // R$
    cacTarget: 500,    // R$
  },

  // Opportunity scoring weights (sum = 100)
  scoringWeights: {
    painStrength:         20,
    fitWithSmartOps:      15,
    paymentCapacity:      15,
    lowCompetition:       10,
    geoProximity:         10,
    decisionMakerAccess:  10,
    roiPotential:         10,
    casePotential:          5,
    referralPotential:      5,
  },

  // Classification thresholds
  classification: {
    attack:  { min: 85, label: 'Atacar imediatamente', priority: 'P0' },
    test:    { min: 70, label: 'Testar campanha',      priority: 'P1' },
    monitor: { min: 50, label: 'Monitorar',            priority: 'P2' },
    skip:    { min: 0,  label: 'Não priorizar',        priority: 'P3' },
  },

  // Geographic focus
  geography: {
    primary:   ['Belo Horizonte', 'Contagem', 'Betim', 'Nova Lima'],
    secondary: ['Ribeirão das Neves', 'Santa Luzia', 'Ibirité', 'Sete Lagoas', 'Sabará'],
    maxDistance: 60, // km from BH center
  },

  // Priority sectors
  prioritySectors: [
    'industrias_pequenas', 'transportadoras', 'clinicas', 'distribuidoras',
    'supermercados', 'construcao', 'logistica', 'servicos_b2b',
    'escritorios_contabeis', 'auto_repair',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

// Offer-pain mapping
const OFFER_PAIN_MAP = {
  'retrabalho':            'diagnostico-lean',
  'processo_manual':       'automacao-n8n',
  'custo_operacional':     'mapeamento-gargalos',
  'atraso_entrega':        'padronizacao-processo',
  'falta_indicadores':     'dashboard-lean',
  'agendamento_manual':    'automacao-atendimento',
  'gestao_estoque':        'process-mapping',
};

module.exports = { CONFIG, OFFER_PAIN_MAP };
