// Video Ad Specialist Agent — config
const CONFIG = {
  agent: {
    name: 'Video Ad Specialist Agent',
    version: '1.0.0',
    role: 'Especialista em Criativos de Vídeo, VSL, UGC e Roteiros de Alta Conversão',
    mission: 'Criar roteiros, storyboards e briefings de vídeo que param o scroll e geram conversão',
    mantra: 'Os primeiros 3 segundos definem se o vídeo vai converter. Tudo começa no hook.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  video_formats: {
    reel_15s:   { plataforma: 'Instagram/TikTok', objetivo: 'Alcance e viralização', hook_seconds: 2, cta: 'últimos 3s' },
    reel_30s:   { plataforma: 'Instagram/TikTok', objetivo: 'Engajamento e educação rápida', hook_seconds: 3, cta: 'últimos 5s' },
    reel_60s:   { plataforma: 'Instagram/TikTok', objetivo: 'Prova de conceito e autoridade', hook_seconds: 3, cta: 'últimos 8s' },
    shorts:     { plataforma: 'YouTube Shorts', objetivo: 'Alcance e inscritos', hook_seconds: 3, cta: 'últimos 5s' },
    vsl_3min:   { plataforma: 'Landing page/YouTube', objetivo: 'Conversão fria', hook_seconds: 15, cta: 'minuto 2:30' },
    vsl_10min:  { plataforma: 'YouTube/Email', objetivo: 'Conversão aquecida', hook_seconds: 30, cta: 'minuto 8' },
    ugc_30s:    { plataforma: 'Instagram/Meta Ads', objetivo: 'Prova social e confiança', hook_seconds: 3, cta: 'últimos 5s' },
    testimonial: { plataforma: 'Todos', objetivo: 'Objeção e prova', hook_seconds: 5, cta: 'natural no final' },
  },

  hook_formulas: {
    pergunta:    'Você ainda [problema comum]?',
    afirmação:   'Seu [processo/área] está te custando R$X por mês.',
    numero:      '3 erros que toda PME comete em [área].',
    contradição: 'Eu fiz [coisa inesperada] e isso [resultado surpreendente].',
    antes_depois: 'De [situação ruim] para [situação boa] em [tempo].',
    segredo:     'A maioria dos [perfil] não sabe que...',
  },

  vsl_structure: {
    hook:       { duracao_pct: 10, objetivo: 'Parar o scroll e criar curiosidade' },
    problema:   { duracao_pct: 20, objetivo: 'Identificar e amplificar a dor' },
    agitacao:   { duracao_pct: 15, objetivo: 'Mostrar o custo de não resolver' },
    solucao:    { duracao_pct: 20, objetivo: 'Apresentar o método/produto' },
    prova:      { duracao_pct: 15, objetivo: 'Case, depoimento, resultado real' },
    oferta:     { duracao_pct: 10, objetivo: 'O que está sendo oferecido e por quanto' },
    cta:        { duracao_pct: 10, objetivo: 'Ação clara e única' },
  },

  ugc_brief_template: {
    perfil_creator:  'Empresário ou profissional liberal, BH, 30-50 anos',
    tom:             'Casual, verdadeiro, não parecer anúncio',
    ambiente:        'Escritório ou empresa real (não estúdio)',
    roteiro:         'Problema encontrado → resultado com SmartOps → recomendação sincera',
    proibido:        ['Teleprompter visível', 'Cenário perfeito demais', 'Linguagem de vendedor'],
  },

  metrics: {
    hook_rate:    { meta_pct: 30, desc: 'Assistiram mais de 3 segundos' },
    completion:   { meta_pct: 50, desc: 'Assistiram até o final' },
    ctr:          { meta_pct: 1.5, desc: 'Clicaram no CTA' },
    shares:       { meta_pct: 2, desc: 'Compartilharam' },
    saves:        { meta_pct: 3, desc: 'Salvaram' },
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
