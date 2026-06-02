// Ads Agent — config
const CONFIG = {
  agent: {
    name:    'Ads Agent Pro',
    version: '1.0.0',
    role:    'Especialista Sênior em Google Ads e Meta Ads',
    mission: 'Transformar dados de campanha em decisões claras, priorizadas e lucrativas',
    mantra:  'CTR baixo é sintoma, não diagnóstico.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', location: 'Belo Horizonte, MG' },

  // Benchmarks por plataforma
  benchmarks: {
    google_search: {
      ctr_atencao: 3, ctr_bom: 6, ctr_excelente: 10,
      cpc_max_brl: 15, cpa_max_brl: 400,
      roas_min: 2, roas_bom: 4, roas_excelente: 8,
      taxa_conv_min_pct: 2, taxa_conv_boa_pct: 5,
    },
    meta_ads: {
      ctr_atencao: 1, ctr_bom: 2.5, ctr_excelente: 5,
      cpm_max_brl: 30, cpa_max_brl: 300,
      roas_min: 2, roas_bom: 3.5, roas_excelente: 7,
      freq_atencao: 3, freq_max: 4.5,
    },
    google_display: {
      ctr_atencao: 0.3, ctr_bom: 0.8,
      cpm_max_brl: 20, cpa_max_brl: 500,
    },
  },

  // Thresholds de alerta automático
  alerts: {
    critico: {
      cpa_alta_pct:           25,   // % acima do normal
      roas_queda_pct:         30,   // % de queda
      conversoes_queda_pct:   30,   // % de queda
      frequencia_meta_max:     4,
      gasto_sem_conversao_brl: 200, // R$ sem conversão
    },
    atencao: {
      ctr_queda_pct:   15,
      cpc_alta_pct:    20,
      cpm_alta_pct:    20,
      frequencia_meta: 3,
    },
  },

  // Score de saúde das campanhas (0-100)
  health_weights: {
    ctr:         20,
    cpc_cpm:     15,
    cpa:         20,
    roas:        20,
    conversoes:  15,
    frequencia:  10,
  },

  health_labels: {
    EXCELENTE: { min: 90, label: 'Excelente', color: 'verde'    },
    BOM:       { min: 75, label: 'Bom',       color: 'azul'     },
    ATENCAO:   { min: 60, label: 'Atenção',   color: 'amarelo'  },
    CRITICO:   { min: 40, label: 'Crítico',   color: 'laranja'  },
    EMERGENCIA:{ min: 0,  label: 'Emergência',color: 'vermelho' },
  },

  // Maturidade da conta (1-5)
  maturity_levels: {
    1: 'Básico — pouca estrutura, rastreamento inicial',
    2: 'Operacional — campanhas organizadas, análise básica',
    3: 'Otimizado — testes frequentes, métricas acompanhadas',
    4: 'Escalável — previsibilidade, criativos testados, margem para crescer',
    5: 'Elite — BI + CRM + LTV + automações + testes contínuos',
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
