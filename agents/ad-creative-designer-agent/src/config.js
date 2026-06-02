// Ad Creative Designer Agent — config
const CONFIG = {
  agent: {
    name: 'Ad Creative Designer Agent',
    version: '1.0.0',
    role: 'Diretor de Arte e Especialista em Criativos de Performance',
    mission: 'Criar briefings visuais, conceitos e direção de arte para anúncios de alta conversão',
    mantra: 'O criativo é a variável mais importante do anúncio. É ele quem para o scroll.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  brand: {
    bg:        '#0A0A0F',
    card:      '#0B0F17',
    border:    '#1F2937',
    accent1:   '#7C3AED', // roxo lean
    accent2:   '#10B981', // verde automação
    text:      '#F9FAFB',
    headline:  'Bebas Neue',
    body:      'Inter',
  },

  creative_types: {
    carrossel:    { slides: '5-8', hook: 'Slide 1 = hook forte', cta: 'Último slide = CTA', resolution: '1080x1080' },
    stories:      { ratio: '9:16', duration_s: 15, text_max_words: 10, resolution: '1080x1920' },
    feed_foto:    { ratio: '4:5 ou 1:1', text_overlay: 'máx 20% da área', resolution: '1080x1350' },
    reel_thumb:   { ratio: '9:16', hook_visual: 'primeiros 3s', resolution: '1080x1920' },
    banner_ads:   { sizes: ['300x250', '728x90', '160x600', '320x50'], text_max_words: 7 },
    ugc_brief:    { duracao_s: 30-60, estilo: 'Natural, não roteirizado, câmera frontal', cta: 'Sempre no final' },
  },

  ad_angles: {
    dor:          { gatilho: 'Identifica o problema específico', exemplo: 'Seu processo está te custando R$X por mês' },
    transformacao: { gatilho: 'Antes e depois mensurável', exemplo: 'De 40h de retrabalho para 5h com automação' },
    prova:        { gatilho: 'Resultado real de cliente', exemplo: 'Case: Indústria em BH reduziu 35% de retrabalho' },
    autoridade:   { gatilho: 'Credencial + resultado', exemplo: 'Black Belt Lean Six Sigma + 20 projetos em BH' },
    urgencia:     { gatilho: 'Escassez real ou prazo', exemplo: '2 vagas abertas para diagnóstico em junho' },
    curiosidade:  { gatilho: 'Informação inesperada', exemplo: 'O erro que 90% das PMEs cometem no processo' },
    numero:       { gatilho: 'Dado específico e inesperado', exemplo: '8 desperdícios que custam R$20k/mês' },
  },

  performance_benchmarks: {
    instagram: { ctr_min: 0.8, ctr_bom: 2.0, hook_rate_min: 25, save_rate_bom: 3 },
    meta_ads:  { ctr_min: 0.5, ctr_bom: 1.5, cpm_max_brl: 25, cpa_max_brl: 200 },
    google:    { ctr_min: 2.0, ctr_bom: 5.0, quality_score_min: 7 },
  },

  creative_checklist: [
    'Hook nos primeiros 3 segundos ou no headline',
    'Problema claramente identificado',
    'Solução específica (não genérica)',
    'Prova visual ou social',
    'CTA único e claro',
    'Contraste adequado (texto legível)',
    'Logo/marca visível mas não dominante',
    'Cores da marca aplicadas',
    'Sem texto excessivo (regra 20%)',
    'Tamanho otimizado para plataforma',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
