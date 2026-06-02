// Experimentation Agent — config
const CONFIG = {
  agent: {
    name:    'Experimentation Agent',
    version: '1.0.0',
    role:    'Motor de Otimização Contínua',
    mission: 'Aumentar conversão, reduzir CAC e melhorar toda a jornada digital através de experimentação baseada em dados',
    mantra:  'Dados vencem opiniões.',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    location: 'Belo Horizonte, MG',
    site:     'smartopsIA.com.br',
  },

  // Metas de crescimento trimestrais
  growth_targets: {
    conversao_delta_pct:   10,  // +10% conversão/trimestre
    ctr_delta_pct:         15,  // +15% CTR
    cac_delta_pct:        -20,  // -20% CAC
    reunioes_delta_pct:    25,  // +25% reuniões agendadas
    leads_delta_pct:       30,  // +30% leads qualificados
  },

  // KPIs baseline estimados (atualizar com dados reais)
  baseline_kpis: {
    conversao_site_pct:    1.8,
    ctr_google_ads_pct:    4.2,
    ctr_meta_ads_pct:      1.9,
    cac_atual:             850,   // R$
    custo_por_reuniao:     280,   // R$
    taxa_resposta_wa_pct:  35,
    taxa_fechamento_pct:   25,
    bounce_rate_pct:       68,
    tempo_medio_pagina_s:  90,
  },

  // Gatilhos automáticos para criar hipótese
  alert_triggers: {
    conversao_queda_pct:   15,  // % de queda
    ctr_queda_pct:         20,
    cpa_alta_pct:          25,
    bounce_alta_pct:       20,
  },

  // Significância estatística mínima
  stats: {
    significancia_minima:  0.95,  // 95%
    poder_minimo:          0.80,  // 80%
    confianca_intervalo:   0.95,
    amostra_minima:        100,   // por variante
  },

  // Priorização ICE (Impact × Confidence × Ease)
  ice: {
    impact_max:     10,
    confidence_max: 10,
    ease_max:       10,
    thresholds: {
      EXECUTAR_AGORA: 90,
      ALTA:           70,
      MEDIA:          50,
      BACKLOG:         0,
    },
  },

  // Áreas de teste
  test_areas: [
    'site', 'google_ads', 'meta_ads', 'instagram', 'whatsapp',
    'propostas', 'landing_pages', 'email', 'criativos', 'videos', 'precificacao',
  ],

  // Tipos de teste
  test_types: ['ab_test', 'multivariate', 'split_url', 'personalization'],

  // Status de experimento
  experiment_status: [
    'hypothesis', 'designing', 'building', 'running',
    'analyzing', 'winner_declared', 'implemented', 'paused', 'failed',
  ],

  // Ferramentas de análise disponíveis
  tools: {
    analytics:   'Google Analytics 4',
    heatmap:     'Microsoft Clarity',
    ads_google:  'Google Ads',
    ads_meta:    'Meta Ads Manager',
    search:      'Google Search Console',
    crm:         'CRM interno',
    automation:  'n8n',
    database:    'Supabase',
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
