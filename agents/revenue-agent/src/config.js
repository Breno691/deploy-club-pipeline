// Revenue Agent — config
const CONFIG = {
  agent: {
    name:    'Revenue Agent',
    version: '1.0.0',
    role:    'Diretor de Revenue Intelligence',
    mission: 'Maximizar receita recorrente através de dados: MRR, CAC, LTV, churn e forecast',
    mantra:  'Receita é consequência. LTV/CAC é causa. Foque na causa.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Serviços e ticket médio
  services: {
    diagnostico_express: { nome: 'Diagnóstico Express', preco: 997,   tipo: 'projeto',    margem: 0.80 },
    mapa_gargalos:       { nome: 'Mapa de Gargalos',    preco: 2500,  tipo: 'projeto',    margem: 0.80 },
    smartops_monthly:    { nome: 'SmartOps Monthly',    preco: 3500,  tipo: 'recorrente', margem: 0.80 },
    sprint_automacao:    { nome: 'Sprint Automação',    preco: 6500,  tipo: 'projeto',    margem: 0.82 },
    lean_ai_sprint:      { nome: 'Lean AI Sprint',      preco: 10000, tipo: 'projeto',    margem: 0.80 },
  },

  // Metas de receita
  metas: {
    mrr_atual:     0,
    mrr_30d:       5000,
    mrr_60d:       10000,
    mrr_90d:       15000,
    mrr_6m:        30000,
    mrr_12m:       50000,
    clientes_meta: 5,
    ticket_medio:  5000,
  },

  // Benchmarks SaaS/Consultoria
  benchmarks: {
    ltv_cac_ratio_min:     3.0,
    ltv_cac_ratio_ideal:   5.0,
    payback_max_meses:     12,
    churn_max_mensal_pct:  5.0,
    nrr_min_pct:           100,
    margem_bruta_min_pct:  60,
    cac_max_consultoria:   2000,
  },

  // Canais de aquisição (para atribuição)
  channels: [
    { canal: 'Instagram Orgânico', custo_mensal: 0,    leads_esperados: 5, conversao_pct: 15 },
    { canal: 'LinkedIn Orgânico',  custo_mensal: 0,    leads_esperados: 3, conversao_pct: 20 },
    { canal: 'Google Ads',         custo_mensal: 500,  leads_esperados: 8, conversao_pct: 10 },
    { canal: 'Meta Ads',           custo_mensal: 300,  leads_esperados: 6, conversao_pct: 8  },
    { canal: 'Indicação',          custo_mensal: 0,    leads_esperados: 4, conversao_pct: 40 },
    { canal: 'SEO',                custo_mensal: 0,    leads_esperados: 3, conversao_pct: 12 },
    { canal: 'Parceiros',          custo_mensal: 0,    leads_esperados: 2, conversao_pct: 30 },
  ],

  // Custos fixos mensais para CAC e runway
  custos_fixos_mes: 600,

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
