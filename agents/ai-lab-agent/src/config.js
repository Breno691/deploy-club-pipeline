// AI Lab Intelligence Agent — config

const CONFIG = {
  agent: {
    name:    'AI Lab Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Inovação e Pesquisa Aplicada em IA',
  },

  company: {
    name:     'SmartOps IA',
    services: ['Lean Six Sigma', 'Automação com IA', 'Process Mining', 'Consultoria Operacional'],
    location: 'BH/MG',
  },

  // Radar statuses
  radar: {
    ADOPT:  { label: 'Adopt',  threshold: 85, action: 'Implementar imediatamente' },
    TRIAL:  { label: 'Trial',  threshold: 70, action: 'Criar PoC de 7–14 dias' },
    ASSESS: { label: 'Assess', threshold: 50, action: 'Monitorar por 30 dias' },
    HOLD:   { label: 'Hold',   threshold: 0,  action: 'Não usar agora' },
  },

  // Tool scoring weights (sum = 100)
  toolScoreWeights: {
    businessImpact:      20,
    technicalFit:        15,
    integrationFit:      15,
    costEfficiency:      15,
    risk:                15,
    maturity:            10,
    strategicAdvantage:  10,
  },

  // LLM benchmark tasks
  benchmarkTasks: [
    'copy-instagram',
    'proposal-commercial',
    'vsl-script',
    'lean-diagnosis',
    'n8n-code',
    'meeting-analysis',
    'market-research',
    'json-remotion',
  ],

  // PoC constraints
  poc: {
    maxDays:  14,
    maxCost:  200,   // USD
    minSaving: 3,    // hours/week to justify implementation
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

// Tool categories
const TOOL_CATEGORIES = [
  'llm', 'agent-framework', 'automation', 'rag', 'video',
  'design', 'analytics', 'sales', 'marketing', 'voice', 'search',
];

// Agents that can be improved
const SMARTOPS_AGENTS = [
  'copywriter-agent', 'design-agent', 'video-ad-agent', 'remotion-agent',
  'automation-agent', 'sales-intelligence-agent', 'proposal-agent',
  'website-analytics-agent', 'ceo-advisor-agent', 'financial-agent',
];

module.exports = { CONFIG, TOOL_CATEGORIES, SMARTOPS_AGENTS };
