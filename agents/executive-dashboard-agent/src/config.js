// Executive Dashboard Agent — config
const CONFIG = {
  agent: {
    name:    'Executive Dashboard Agent',
    version: '1.0.0',
    role:    'Diretor de Inteligência Executiva',
    mission: 'Consolidar todos os dados e KPIs da SmartOps em visão executiva acionável',
    mantra:  'O que não é medido não é gerenciado. O que é medido deve ser acionado.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // 9 Dashboards com KPIs chave
  dashboards: {
    marketing: {
      name: 'Marketing',
      kpis: ['seguidores_instagram', 'alcance_semanal', 'taxa_engajamento', 'posts_semana', 'leads_organico'],
      meta:  { seguidores_instagram: 5000, taxa_engajamento: 4.0, posts_semana: 3 },
      alerta: { taxa_engajamento: 2.0, posts_semana: 2 },
    },
    website: {
      name: 'Website',
      kpis: ['sessoes_mes', 'taxa_rejeicao', 'conversao_lead', 'paginas_por_sessao', 'tempo_sessao_min'],
      meta:  { sessoes_mes: 500, taxa_rejeicao: 60, conversao_lead: 3.0 },
      alerta: { sessoes_mes: 200, conversao_lead: 1.0 },
    },
    ads: {
      name: 'Ads',
      kpis: ['gasto_total', 'impressoes', 'cliques', 'ctr', 'cpc', 'cpa', 'roas'],
      meta:  { ctr: 2.0, roas: 3.0, cpa: 150 },
      alerta: { roas: 1.5, ctr: 0.5 },
    },
    revenue: {
      name: 'Revenue',
      kpis: ['mrr', 'arr', 'cac', 'ltv', 'ltv_cac_ratio', 'churn_rate', 'nrr'],
      meta:  { mrr: 15000, ltv_cac_ratio: 3.0, churn_rate: 5 },
      alerta: { mrr: 5000, ltv_cac_ratio: 1.5 },
    },
    sales: {
      name: 'Vendas',
      kpis: ['leads_mes', 'reunioes_mes', 'propostas_mes', 'clientes_novos', 'taxa_fechamento', 'pipeline_total'],
      meta:  { leads_mes: 40, reunioes_mes: 15, clientes_novos: 3, taxa_fechamento: 20 },
      alerta: { leads_mes: 10, reunioes_mes: 3, taxa_fechamento: 10 },
    },
    operations: {
      name: 'Operações',
      kpis: ['projetos_ativos', 'sla_cumprimento_pct', 'retrabalho_pct', 'automacoes_ativas', 'nps_clientes'],
      meta:  { sla_cumprimento_pct: 95, retrabalho_pct: 5, nps_clientes: 70 },
      alerta: { sla_cumprimento_pct: 80, retrabalho_pct: 15 },
    },
    client_success: {
      name: 'Client Success',
      kpis: ['clientes_ativos', 'health_score_medio', 'clientes_risco', 'upsells_mes', 'churn_mes'],
      meta:  { health_score_medio: 80, clientes_risco: 0, churn_mes: 0 },
      alerta: { health_score_medio: 60, clientes_risco: 2 },
    },
    finance: {
      name: 'Financeiro',
      kpis: ['receita_mes', 'margem_liquida_pct', 'caixa_disponivel', 'runway_meses', 'roi_marketing'],
      meta:  { receita_mes: 15000, margem_liquida_pct: 65, runway_meses: 6 },
      alerta: { receita_mes: 5000, margem_liquida_pct: 40, runway_meses: 2 },
    },
    executive: {
      name: 'Executive',
      kpis: ['business_health_score', 'okr_progress_pct', 'acoes_pendentes', 'riscos_criticos', 'mrr_growth_pct'],
      meta:  { business_health_score: 80, okr_progress_pct: 70 },
      alerta: { business_health_score: 40, riscos_criticos: 2 },
    },
  },

  // 10 Squads com agentes
  squads: {
    marketing:      { agents: ['Copywriter','Design','Distribution','Marketing Research','SEO','Video Ad'] },
    growth:         { agents: ['CRO','Customer Journey','Revenue','Ads','Website Analytics'] },
    operations:     { agents: ['Lean','Six Sigma','Kaizen','Process Mining','Automation'] },
    sales:          { agents: ['Sales Intelligence','Proposal','Offer Optimization','Pricing'] },
    executive:      { agents: ['Executive Dashboard','Competitor Intelligence','Strategic Planning','CEO Advisor','Chief of Staff'] },
    knowledge:      { agents: ['Knowledge Management','Case Study','Productization'] },
    client_success: { agents: ['Client Success','Risk'] },
    finance:        { agents: ['Financial Intelligence'] },
    personal_brand: { agents: ['Personal Brand','Authority Building','Partnership'] },
    ai_lab:         { agents: ['AI Lab','AI Automation','Experimentation'] },
  },

  // Business Health Score — pesos por pilar
  health_weights: {
    receita:      { weight: 30, desc: 'Receita e crescimento financeiro' },
    clientes:     { weight: 25, desc: 'Clientes ativos e saúde de relacionamento' },
    marketing:    { weight: 20, desc: 'Pipeline de leads e autoridade' },
    operacoes:    { weight: 15, desc: 'Qualidade, SLA e automações' },
    estrategia:   { weight: 10, desc: 'OKRs e visão de longo prazo' },
  },

  // Metas SmartOps — fase atual
  metas: {
    mrr_meta: 15000,
    clientes_meta: 5,
    leads_mes_meta: 40,
    reunioes_mes_meta: 15,
    taxa_fechamento_meta: 20,
    margem_meta_pct: 65,
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
