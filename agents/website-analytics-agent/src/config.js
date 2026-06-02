// Website Analytics Agent — config
const CONFIG = {
  agent: {
    name:    'Website Analytics Agent',
    version: '1.0.0',
    role:    'Especialista em Analytics de Site e Comportamento do Usuário',
    mission: 'Transformar dados de site em decisões de negócio que aumentam leads e receita',
    mantra:  'Cada visita conta uma história. Ouça os dados.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Benchmarks de performance do site
  benchmarks: {
    taxa_rejeicao:     { excelente: 40, bom: 55, regular: 70, ruim: 85, unit: '%' },
    conversao_lead:    { excelente: 5,  bom: 3,  regular: 1,  ruim: 0.5, unit: '%' },
    tempo_sessao_s:    { excelente: 180, bom: 120, regular: 60, ruim: 30, unit: 's' },
    paginas_sessao:    { excelente: 4,  bom: 3,  regular: 2,  ruim: 1,  unit: '' },
    velocidade_s:      { excelente: 1,  bom: 2,  regular: 3,  ruim: 5,  unit: 's' },
    sessoes_mes:       { meta: 500, alerta: 200 },
  },

  // Páginas-chave do site SmartOps
  key_pages: [
    { url: '/',                       nome: 'Home',                   tipo: 'awareness',   meta_bounce: 65, meta_sessao: 90 },
    { url: '/diagnostico-gratuito',   nome: 'Diagnóstico Grátis',    tipo: 'lead_gen',    meta_bounce: 40, meta_conv: 10   },
    { url: '/servicos',               nome: 'Serviços',               tipo: 'consideration', meta_bounce: 55, meta_sessao: 120 },
    { url: '/sobre',                  nome: 'Sobre Breno',           tipo: 'trust',       meta_bounce: 50 },
    { url: '/contato',                nome: 'Contato',               tipo: 'decision',    meta_conv: 20   },
    { url: '/blog',                   nome: 'Blog',                  tipo: 'seo',         meta_sessao: 150 },
  ],

  // Eventos GA4 críticos para rastrear
  critical_events: [
    { evento: 'form_submit',          descricao: 'Formulário de lead enviado',         valor_negocio: 'ALTO' },
    { evento: 'whatsapp_click',       descricao: 'Clique no botão WhatsApp',           valor_negocio: 'ALTO' },
    { evento: 'scroll_75',            descricao: 'Scroll até 75% da página',           valor_negocio: 'MEDIO' },
    { evento: 'video_play',           descricao: 'Reprodução de vídeo testimonial',    valor_negocio: 'MEDIO' },
    { evento: 'cta_click',            descricao: 'Clique em CTA principal',            valor_negocio: 'ALTO' },
    { evento: 'diagnostic_start',     descricao: 'Iniciou formulário de diagnóstico',  valor_negocio: 'ALTO' },
    { evento: 'case_study_view',      descricao: 'Acessou case study',                 valor_negocio: 'MEDIO' },
    { evento: 'blog_read_complete',   descricao: 'Leu post completo do blog',          valor_negocio: 'BAIXO' },
  ],

  // Fontes de tráfego (para análise)
  traffic_sources: [
    { source: 'google / organic',   tipo: 'SEO',         qualidade: 'ALTA'  },
    { source: 'instagram / social', tipo: 'Social',      qualidade: 'MEDIA' },
    { source: 'google / cpc',       tipo: 'Paid Search', qualidade: 'ALTA'  },
    { source: 'facebook / cpc',     tipo: 'Paid Social', qualidade: 'MEDIA' },
    { source: 'direct',             tipo: 'Direto',      qualidade: 'ALTA'  },
    { source: 'referral',           tipo: 'Referral',    qualidade: 'ALTA'  },
    { source: 'linkedin / social',  tipo: 'LinkedIn',    qualidade: 'ALTA'  },
  ],

  // Dados de site simulados (base para análise sem GA4 API)
  dados_exemplo: {
    sessoes_mes: 180,
    novos_usuarios_pct: 75,
    taxa_rejeicao: 72,
    paginas_por_sessao: 1.8,
    duracao_media_s: 85,
    leads_gerados: 4,
    taxa_conversao: 2.2,
    top_paginas: ['/', '/servicos', '/diagnostico-gratuito', '/sobre', '/blog'],
    top_fontes: ['organic', 'social', 'direct', 'referral'],
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
