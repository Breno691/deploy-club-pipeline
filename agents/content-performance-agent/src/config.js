// Content Performance Agent — config
const CONFIG = {
  agent: {
    name: 'Content Performance Agent',
    version: '1.0.0',
    role: 'Analista de Performance de Conteúdo e Estrategista de Otimização',
    mission: 'Analisar dados de conteúdo e extrair insights acionáveis para crescimento orgânico',
    mantra: 'O que não é medido, não melhora. O que é medido sem ação, não cresce.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  kpis: {
    instagram: {
      alcance:       { meta: 1000, bom: 3000, excelente: 8000, unidade: 'contas alcançadas' },
      impressoes:    { meta: 2000, bom: 6000, excelente: 15000, unidade: 'impressões' },
      engajamento:   { meta: 3.0, bom: 5.0, excelente: 8.0, unidade: '%' },
      salvamentos:   { meta: 0.5, bom: 2.0, excelente: 5.0, unidade: '%' },
      compartilhamentos: { meta: 0.3, bom: 1.0, excelente: 3.0, unidade: '%' },
      seguidores_dia: { meta: 5, bom: 20, excelente: 50, unidade: 'novos/dia' },
      ctr_bio:       { meta: 0.5, bom: 1.5, excelente: 3.0, unidade: '%' },
    },
    youtube: {
      views:         { meta: 200, bom: 1000, excelente: 5000, unidade: 'visualizações' },
      watch_time_pct: { meta: 30, bom: 50, excelente: 65, unidade: '%' },
      ctr_thumb:     { meta: 3.0, bom: 6.0, excelente: 10.0, unidade: '%' },
      likes_ratio:   { meta: 3.0, bom: 5.0, excelente: 8.0, unidade: '%' },
      inscritos_vid:  { meta: 5, bom: 20, excelente: 80, unidade: 'novos/vídeo' },
    },
    linkedin: {
      impressoes:    { meta: 500, bom: 2000, excelente: 8000, unidade: 'impressões' },
      engajamento:   { meta: 2.0, bom: 4.0, excelente: 8.0, unidade: '%' },
      cliques:       { meta: 10, bom: 50, excelente: 150, unidade: 'cliques' },
    },
  },

  content_score_weights: {
    alcance:        25,
    engajamento:    30,
    salvamentos:    20,
    ctr_cta:        15,
    crescimento:    10,
  },

  formats_performance: {
    carrossel: { avg_save_rate: 3.5, avg_reach_multiplier: 1.4, best_for: 'educação e autoridade' },
    reels:     { avg_save_rate: 1.2, avg_reach_multiplier: 3.0, best_for: 'alcance e novos seguidores' },
    foto_feed: { avg_save_rate: 2.0, avg_reach_multiplier: 0.9, best_for: 'prova social e lifestyle' },
    stories:   { avg_save_rate: 0.2, avg_reach_multiplier: 0.5, best_for: 'engajamento da base' },
  },

  optimization_actions: {
    baixo_alcance:       ['Testar novo hook visual', 'Publicar em horário diferente', 'Usar hashtags mais específicas'],
    baixo_engajamento:   ['Fazer pergunta no caption', 'CTA de salvar explícito', 'Conteúdo mais polêmico/útil'],
    baixo_salvamento:    ['Adicionar checklist no carrossel', 'Inserir dado que o seguidor vai querer guardar'],
    baixo_ctr_link:      ['CTA mais direto no stories', 'Mudar copy do link na bio', 'Adicionar stories com swipe up'],
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
