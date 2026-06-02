// Financial Intelligence Agent — config
const CONFIG = {
  agent: {
    name:    'Financial Intelligence Agent',
    version: '1.0.0',
    role:    'CFO Virtual da SmartOps IA',
    mission: 'Garantir crescimento com lucro, margem, previsibilidade e saúde financeira',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    currency: 'BRL',
    location: 'Belo Horizonte, MG',
  },

  // Metas financeiras para fase inicial
  targets: {
    margem_bruta_min:     60,   // %
    margem_liquida_min:   25,   // %
    ltv_cac_min:           3,   // ratio
    ltv_cac_excelente:     5,   // ratio
    payback_max_dias:     30,
    cac_max_pct_ticket:   20,   // % do ticket inicial
    receita_concentrada_max: 40, // % de um único cliente
    custo_ferramentas_max: 10,  // % da receita
    receita_meta_mensal:  15000, // R$
    clientes_meta:         3,
  },

  // Custos fixos mensais atuais (R$)
  fixed_costs: {
    anthropic_api:     150,
    n8n_easypanel:      80,
    supabase:           50,
    tavily_ai:          50,
    dominio_hosting:    80,
    outros_ferramentas: 190,
    total_mensal:       600,
  },

  // Catálogo de serviços com margens conhecidas
  services: {
    'quick-win': {
      name:          'Quick Win (2–4 semanas)',
      ticket_medio:  5500,
      custo_entrega: 1200,
      margem_bruta:  78,
      tipo:          'projeto',
      duracao_semanas: 3,
    },
    'diagnostico-plano': {
      name:          'Diagnóstico + Plano',
      ticket_medio:  11500,
      custo_entrega: 2800,
      margem_bruta:  76,
      tipo:          'projeto',
      duracao_semanas: 6,
    },
    'projeto-completo': {
      name:          'Projeto Completo',
      ticket_medio:  32000,
      custo_entrega: 9000,
      margem_bruta:  72,
      tipo:          'projeto',
      duracao_semanas: 16,
    },
    'parceria-continua': {
      name:          'Parceria Contínua (mensal)',
      ticket_medio:  5500,
      custo_entrega: 1100,
      margem_bruta:  80,
      tipo:          'recorrente',
      duracao_semanas: null,
    },
  },

  // Canais de aquisição
  channels: [
    'instagram_organico', 'linkedin_organico', 'indicacao', 'parceria',
    'google_ads', 'meta_ads', 'evento_palestra', 'seo', 'whatsapp_ativo',
    'prospecção_local', 'direto',
  ],

  // Categorias de custo
  cost_categories: [
    'ads', 'ferramentas_ia', 'infraestrutura', 'freelancers', 'comissao_parceiro',
    'transporte_visitas', 'eventos', 'impostos', 'taxas_bancarias',
    'tempo_operacional', 'custo_entrega', 'marketing_conteudo', 'outros',
  ],

  // Thresholds de saúde financeira
  health_thresholds: {
    HEALTHY:         { label: 'Saudável',          color: 'verde' },
    ATTENTION:       { label: 'Atenção',            color: 'amarelo' },
    MARGIN_RISK:     { label: 'Risco de Margem',    color: 'laranja' },
    CASH_RISK:       { label: 'Risco de Caixa',     color: 'vermelho' },
    CAC_RISK:        { label: 'CAC Alto',            color: 'laranja' },
    FORECAST_RISK:   { label: 'Forecast Fraco',     color: 'amarelo' },
    UNPROFITABLE:    { label: 'Não Lucrativo',       color: 'vermelho' },
    SCALING_READY:   { label: 'Pronto para Escalar', color: 'azul' },
    PRE_REVENUE:     { label: 'Pré-Receita',         color: 'cinza' },
  },

  // Thresholds de alerta automático
  alert_thresholds: {
    margem_liquida_min:   20,   // % abaixo → alerta
    cac_max_pct_ticket:   20,   // % acima → alerta
    ltv_cac_min:           3,   // abaixo → alerta
    runway_min_dias:       60,  // dias abaixo → alerta crítico
    receita_forecast_gap: 0.8,  // < 80% do previsto → alerta
    custo_tool_max_pct:   10,   // % receita em ferramentas
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

// Taxas de impostos estimadas para consultoria (Simples Nacional)
const TAX_RATES = {
  simples_nacional_estimated: 0.06,  // ~6% para serviços consultoria fase inicial
  iss:                         0.02,  // ISS BH
  total_estimated:             0.08,
};

module.exports = { CONFIG, TAX_RATES };
