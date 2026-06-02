// Distribution Agent — config
const CONFIG = {
  agent: {
    name: 'Distribution Agent',
    version: '1.0.0',
    role: 'Estrategista de Distribuição Multicanal e Calendário Editorial',
    mission: 'Garantir que o conteúdo certo chegue à pessoa certa no canal certo na hora certa',
    mantra: 'Criar é 20% do trabalho. Distribuir é 80%.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  channels: {
    instagram: { freq_week: 4, best_times: ['08:00', '12:00', '19:00'], formats: ['Carrossel', 'Reels', 'Stories', 'Feed foto'], priority: 1 },
    threads:   { freq_week: 5, best_times: ['08:30', '12:30', '20:00'], formats: ['Thread', 'Post único', 'Pergunta'], priority: 2 },
    youtube:   { freq_week: 1, best_times: ['14:00', '17:00'], formats: ['Vídeo longo', 'Shorts', 'Lives'], priority: 3 },
    linkedin:  { freq_week: 2, best_times: ['08:00', '12:00', '17:30'], formats: ['Artigo', 'Post', 'Carrossel'], priority: 4 },
    whatsapp:  { freq_week: 2, best_times: ['09:00', '16:00'], formats: ['Texto', 'Áudio', 'Link'], priority: 5 },
    email:     { freq_week: 1, best_times: ['08:00', '11:00'], formats: ['Newsletter', 'Sequência', 'Broadcast'], priority: 6 },
  },

  content_types: {
    educativo:    { ratio: 0.40, objetivo: 'Autoridade e confiança', exemplos: ['Como fazer', 'Erros comuns', 'Dicas práticas'] },
    inspiracional: { ratio: 0.20, objetivo: 'Conexão emocional', exemplos: ['Case de sucesso', 'Antes e depois', 'Depoimento'] },
    promocional:  { ratio: 0.20, objetivo: 'Conversão', exemplos: ['Oferta', 'CTA direto', 'Diagnóstico gratuito'] },
    bastidores:   { ratio: 0.10, objetivo: 'Humanização e confiança', exemplos: ['Processo de trabalho', 'Dia a dia', 'Erros e aprendizados'] },
    interativo:   { ratio: 0.10, objetivo: 'Engajamento', exemplos: ['Pergunta', 'Enquete', 'Desafio'] },
  },

  weekly_schedule: {
    terca:  { tema: 'Educativo profundo', canal_principal: 'instagram', formato: 'Carrossel' },
    quarta: { tema: 'Bastidores / Processo', canal_principal: 'threads', formato: 'Thread' },
    quinta: { tema: 'Case / Prova social', canal_principal: 'instagram', formato: 'Reels' },
    sexta:  { tema: 'CTA / Promoção', canal_principal: 'instagram', formato: 'Stories' },
    sabado: { tema: 'Reflexão / Inspiração', canal_principal: 'threads', formato: 'Post' },
  },

  repurpose_matrix: {
    'carrossel-instagram': ['Thread Threads', 'Post LinkedIn', 'Slides YouTube'],
    'reel-instagram':      ['Shorts YouTube', 'Stories Instagram', 'Clip LinkedIn'],
    'artigo-linkedin':     ['Carrossel Instagram', 'Thread Threads', 'Email newsletter'],
    'video-youtube':       ['Reels Instagram', 'Shorts YouTube', 'Clips LinkedIn'],
  },

  hashtags: {
    lean:       ['#lean', '#leanmanufacturing', '#melhoriadeprocessos', '#desperdiciozero'],
    automacao:  ['#automacaoempresarial', '#n8n', '#automacao', '#processosautomaticos'],
    bh:         ['#consultoriabh', '#empresasbh', '#belohorizonte', '#pmebh'],
    gestao:     ['#gestaoempresarial', '#consultoria', '#processos', '#eficiencia'],
    ia:         ['#inteligenciaartificial', '#ia', '#aiempresarial', '#chatgpt'],
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
