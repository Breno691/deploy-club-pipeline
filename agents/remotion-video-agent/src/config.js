// Remotion Video Agent — config
const CONFIG = {
  agent: {
    name:    'Remotion Video Agent',
    version: '1.0.0',
    role:    'Diretor Criativo de Motion Design e Especialista em Vídeos de Performance',
    mission: 'Transformar temas de Lean, Automação e IA em vídeos curtos, profissionais e persuasivos',
    mantra:  'Os primeiros 4 segundos decidem tudo. Hook forte ou o vídeo não existe.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  // Brand tokens (espelho de remotion/src/brand/brandTokens.ts)
  brand: {
    background:    '#0A0A0F',
    surface:       '#0B0F17',
    primary:       '#7C3AED',  // roxo Lean
    primaryLight:  '#a78bfa',
    accent:        '#10B981',  // verde Automação
    accentLight:   '#6ee7b7',
    text:          '#FFFFFF',
    textMuted:     '#A1A1AA',
    warning:       '#F59E0B',
    danger:        '#EF4444',
    headlineFont:  '"Bebas Neue", Impact, sans-serif',
    bodyFont:      '"Inter", "Segoe UI", system-ui, sans-serif',
    instagram:     '@smartops.ia',
    website:       'smartops-ia.com.br',
    ctaDefault:    'Diagnóstico Gratuito · 30min · BH/MG',
  },

  // Templates disponíveis
  templates: {
    LeanWaste:     { file: 'LeanWasteTemplate.tsx',     status: 'ativo',    duracao: 35, objetivo: 'Mostrar desperdícios ocultos em PMEs' },
    Automation:    { file: 'AutomationTemplate.tsx',    status: 'ativo',    duracao: 30, objetivo: 'Eliminar trabalho manual e erro humano' },
    CaseStudy:     { file: 'CaseStudyTemplate.tsx',     status: 'criar',    duracao: 40, objetivo: 'Antes/depois com ROI documentado' },
    Authority:     { file: 'AuthorityTemplate.tsx',     status: 'criar',    duracao: 35, objetivo: 'Construir autoridade do Breno como referência' },
    VideoAd:       { file: 'VideoAdTemplate.tsx',       status: 'criar',    duracao: 30, objetivo: 'Criativo para Meta Ads e Google Ads' },
    LocalBusiness: { file: 'LocalBusinessTemplate.tsx', status: 'criar',    duracao: 35, objetivo: 'Empresas de BH — conexão local' },
    SixSigma:      { file: 'SixSigmaTemplate.tsx',      status: 'criar',    duracao: 40, objetivo: 'DMAIC, qualidade e redução de defeitos' },
  },

  // Formatos de vídeo
  formats: {
    instagram_reel: { ratio: '9:16', fps: 30, maxDur: 90,  plataforma: 'Instagram Reels' },
    youtube_short:  { ratio: '9:16', fps: 30, maxDur: 60,  plataforma: 'YouTube Shorts' },
    tiktok:         { ratio: '9:16', fps: 30, maxDur: 60,  plataforma: 'TikTok' },
    meta_ad:        { ratio: '1:1',  fps: 30, maxDur: 30,  plataforma: 'Meta Ads' },
    linkedin_video: { ratio: '16:9', fps: 30, maxDur: 120, plataforma: 'LinkedIn' },
    story:          { ratio: '9:16', fps: 30, maxDur: 15,  plataforma: 'Instagram Stories' },
    vsl:            { ratio: '16:9', fps: 30, maxDur: 600, plataforma: 'Landing Page' },
  },

  // Tipos de cena disponíveis no schema
  scene_types: ['hook', 'problem', 'pain', 'data', 'insight', 'solution', 'process', 'before_after', 'case_result', 'testimonial', 'cta', 'outro'],

  // Animações disponíveis
  animations: ['kinetic-impact', 'slide-up', 'slide-left', 'fade-in', 'counter', 'process-flow', 'cta-pulse', 'scale-in', 'stagger'],

  // Estrutura ideal de duração por tipo
  structure_35s: {
    hook:     { duracao: 4,  objetivo: 'Parar o scroll — dor ou dado inesperado' },
    problem:  { duracao: 6,  objetivo: 'Amplificar a dor com especificidade' },
    data:     { duracao: 8,  objetivo: 'Prova com número — credibilidade' },
    solution: { duracao: 10, objetivo: 'Método SmartOps — transformação' },
    cta:      { duracao: 7,  objetivo: 'Ação única e clara' },
  },
  structure_30s: {
    hook:     { duracao: 3,  objetivo: 'Hook visual imediato' },
    problem:  { duracao: 5,  objetivo: 'Problema específico' },
    solution: { duracao: 8,  objetivo: 'Solução com benefício' },
    proof:    { duracao: 7,  objetivo: 'Número ou resultado' },
    cta:      { duracao: 7,  objetivo: 'CTA direto' },
  },

  // Temas pré-configurados por template
  themes: {
    LeanWaste: [
      { tema: 'retrabalho',           hook: 'Sua empresa está perdendo dinheiro com retrabalho.',      dado: '30% do tempo perdido em retrabalho' },
      { tema: 'espera',               hook: 'Seu processo está parado esperando aprovação.',             dado: '40% do lead time é tempo de espera' },
      { tema: 'superprodução',        hook: 'Sua equipe está produzindo o que ninguém pediu.',           dado: 'R$15k/mês em superprodução' },
      { tema: 'talento não usado',    hook: 'Seu especialista está fazendo planilha manual.',            dado: '60h/mês desperdiçadas por especialistas' },
      { tema: 'defeitos',             hook: 'Cada erro no processo custa mais do que você imagina.',     dado: 'Defeito médio: R$800 por ocorrência' },
      { tema: 'estoque',              hook: 'Você tem pedidos parados que ninguém está olhando.',        dado: '25% das tarefas ficam paradas > 3 dias' },
      { tema: 'transporte',           hook: 'Sua informação passa por 5 pessoas antes de chegar ao certo.', dado: '3 sistemas diferentes para 1 tarefa' },
      { tema: 'processamento extra',  hook: 'Você está preenchendo a mesma informação em 3 sistemas.',  dado: '2h/dia em processamento extra evitável' },
    ],
    Automation: [
      { tema: 'lead-capture',    hook: 'Você ainda está cadastrando lead manualmente?',              dado: '10h/mês em tarefas que o n8n faz em 0s' },
      { tema: 'follow-up',       hook: 'Você esquece de fazer follow-up com seus leads?',             dado: '80% das vendas precisam de 5+ follow-ups' },
      { tema: 'relatorio',       hook: 'Quanto tempo você gasta fazendo relatório toda semana?',      dado: '6h/mês em relatórios — 72h/ano' },
      { tema: 'onboarding',      hook: 'Onboarding de cliente levando dias? Pode levar minutos.',     dado: 'Onboarding automático em < 5 min' },
      { tema: 'cobranca',        hook: 'Você esquece de cobrar ou cobra tarde demais.',               dado: 'Automação reduz inadimplência em 40%' },
    ],
    CaseStudy: [
      { tema: 'industria-retrabalho', setor: 'Indústria',   antes: '35% de retrabalho',    depois: '8% em 90 dias',     roi: '412%' },
      { tema: 'servicos-processo',    setor: 'Serviços',     antes: '5h de onboarding',     depois: '30min automatizado', roi: '280%' },
      { tema: 'saude-espera',         setor: 'Saúde',        antes: '45min de espera',      depois: '12min padronizado',  roi: '350%' },
    ],
    Authority: [
      { tema: 'black-belt',        headline: 'Black Belt Lean Six Sigma em BH', credencial: '15 anos formando equipes de excelência' },
      { tema: 'metodo-opex',       headline: 'O Método que transforma PMEs em BH', credencial: 'OPEX: Organização → Processos → Execução → Expansão' },
      { tema: 'resultado-cliente', headline: 'O que acontece quando PME encontra o método certo', credencial: 'Casos reais · BH/MG' },
    ],
  },

  // CTAs por objetivo
  ctas: {
    lead_generation: { type: 'diagnostic', text: 'Agende um diagnóstico gratuito', subtext: '30 min · presencial BH/MG · Black Belt' },
    awareness:       { type: 'follow',     text: 'Siga para mais conteúdo Lean',   subtext: '@smartops.ia' },
    conversion:      { type: 'whatsapp',   text: 'Fale com um especialista',        subtext: 'Resposta em até 2h' },
    authority:       { type: 'website',    text: 'Conheça o método OPEX',           subtext: 'smartops-ia.com.br' },
  },

  // KPIs de performance alvo
  kpis: {
    hook_rate_min:    25,  // % que assiste > 3s
    retention_min:    60,  // % que assiste até o final
    ctr_min:           3,  // % que clica no CTA
    watch_time_reel:  15,  // segundos mínimos (Instagram)
    save_rate_min:     2,  // % que salva
  },

  // Caminho do projeto Remotion
  remotion: {
    root:         '../../../../remotion',
    src:          '../../../../remotion/src',
    templates:    '../../../../remotion/src/templates',
    compositions: '../../../../remotion/src/compositions',
    data:         '../../../../remotion/src/data',
    renderCmd:    'npx remotion render',
    previewCmd:   'npx remotion preview',
  },

  // Palavras-chave para destacar nos vídeos
  keywords: ['retrabalho', 'desperdício', 'custo', 'gargalo', 'lucro', 'processo', 'automação', 'IA', 'Lean', 'Six Sigma', 'resultado', 'diagnóstico', 'dinheiro', 'eficiência', 'produtividade'],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 8096 },
};

module.exports = { CONFIG };
