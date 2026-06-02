// Growth Intelligence Agent — config
const CONFIG = {
  agent: {
    name: 'Growth Intelligence Agent',
    version: '1.0.0',
    role: 'Growth Strategist e Analista de Aquisição, Ativação, Retenção e Receita',
    mission: 'Identificar os maiores alavancadores de crescimento sustentável e gerar experimentos testáveis',
    mantra: 'Crescimento sem dado é achismo. Dado sem ação é desperdício.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  aarrr: {
    acquisition:  { kpis: ['CPL', 'CPC', 'CTR', 'Leads/mês', 'Canal top'], meta: '40 leads/mês' },
    activation:   { kpis: ['Taxa reunião/lead', 'Tempo até reunião', 'Show rate'], meta: '15 reuniões/mês' },
    retention:    { kpis: ['Churn mensal', 'LTV', 'Contrato renovado', 'NPS'], meta: 'Churn < 5%/mês' },
    referral:     { kpis: ['Indicações/mês', 'Parceiros ativos', 'Taxa de conversão indicação'], meta: '3 indicações/mês' },
    revenue:      { kpis: ['MRR', 'ARR', 'Ticket médio', 'Receita por canal'], meta: 'R$50k MRR' },
  },

  north_star: {
    metrica: 'Empresas transformadas por mês',
    proxy:   'Projetos concluídos com ROI documentado',
    meta:    3,
    atual:   0,
  },

  channels: {
    google_ads_local:  { cpl_est_brl: 80,  conv_rate: 0.15, escala: 'Alta', status: 'Testar' },
    meta_ads:          { cpl_est_brl: 120, conv_rate: 0.10, escala: 'Alta', status: 'Testar' },
    instagram_organic: { cpl_est_brl: 20,  conv_rate: 0.08, escala: 'Média', status: 'Ativo' },
    linkedin_organic:  { cpl_est_brl: 30,  conv_rate: 0.12, escala: 'Média', status: 'Ativo' },
    parceiros:         { cpl_est_brl: 50,  conv_rate: 0.30, escala: 'Média', status: 'Construindo' },
    indicacoes:        { cpl_est_brl: 10,  conv_rate: 0.50, escala: 'Baixa', status: 'Ativo' },
    prospeccao_local:  { cpl_est_brl: 60,  conv_rate: 0.20, escala: 'Baixa', status: 'Ativo' },
    seo_local:         { cpl_est_brl: 15,  conv_rate: 0.12, escala: 'Alta (longo prazo)', status: 'Construindo' },
  },

  experiments: {
    ice_min_score: 30,
    test_duration_days: 14,
    min_sample: 50,
    significance: 0.95,
  },

  growth_levers: [
    { alavanca: 'Landing page /diagnostico-gratuito', impacto: 9, esforco: 3, status: 'Pendente' },
    { alavanca: 'Google Ads local "consultoria lean BH"', impacto: 8, esforco: 4, status: 'Pendente' },
    { alavanca: 'Programa de indicação (R$500 por cliente)', impacto: 7, esforco: 2, status: 'Pendente' },
    { alavanca: 'Parceria com contadores BH', impacto: 8, esforco: 5, status: 'Em andamento' },
    { alavanca: 'SEO "consultoria lean belo horizonte"', impacto: 7, esforco: 6, status: 'Em andamento' },
    { alavanca: 'Diagnóstico gratuito como lead magnet', impacto: 9, esforco: 3, status: 'Pendente' },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
