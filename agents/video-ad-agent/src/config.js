// Video Ad Intelligence Agent — config

export const CONFIG = {
  agent: {
    name:    'Video Ad Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Performance Criativa',
  },

  // SmartOps IA context
  company: {
    name:      'SmartOps IA',
    services:  ['Lean Six Sigma', 'Six Sigma', 'Kaizen', 'Automação', 'IA Empresarial'],
    location:  'BH/MG',
    audience:  'Donos e gestores de PMEs em BH e região',
    website:   'smartops-ia.com.br',
    instagram: '@smartops.ia',
    ctaMain:   'Diagnóstico Gratuito de 30 min',
  },

  // Performance targets
  targets: {
    cpa:        60,   // R$ máximo por lead
    ctr:        2.5,  // % mínimo
    roas:       4.0,
    retention:  60,   // % mínimo de retenção
    hookRate:   30,   // % thumb-stop rate meta
  },

  // Alert thresholds
  alerts: {
    ctrLow:         1.0,
    cpaHigh:        120,
    retentionLow:   25,
    frequencyHigh:  2.5,
  },

  // Claude API
  claude: {
    model:     'claude-sonnet-4-6',
    maxTokens: 4096,
  },

  // Platforms
  platforms: ['instagram_reel', 'meta_ad', 'youtube_short', 'tiktok', 'google_video'],

  // Duration options (seconds)
  durations: { short: 30, medium: 60, long: 90, vsl: 180 },
};

export const OFFERS = [
  {
    id:      'diagnostico-gratuito',
    name:    'Diagnóstico Gratuito de Desperdícios',
    promise: 'Descobrir onde a empresa perde dinheiro em 30 min',
    cta:     'Agende seu diagnóstico gratuito',
    risk:    'zero',
    urgency: 'alta',
  },
  {
    id:      'mapa-gargalos',
    name:    'Mapa de Gargalos Operacionais',
    promise: 'Visualizar os principais gargalos e custo de cada um',
    cta:     'Quero meu mapa de gargalos',
    risk:    'zero',
    urgency: 'alta',
  },
  {
    id:      'auditoria-lean',
    name:    'Auditoria Lean + IA',
    promise: 'Relatório completo com desperdícios e automações possíveis',
    cta:     'Quero minha auditoria',
    risk:    'baixo',
    urgency: 'média',
  },
];

export const PAINS = [
  'Retrabalho que ninguém mede',
  'Processos feitos no improviso',
  'Aprovações que travam tudo',
  'WhatsApp como sistema operacional',
  'Planilhas que ninguém entende',
  'Equipe que trabalha muito e entrega pouco',
  'Custo operacional que não para de subir',
  'Entregas atrasadas todo mês',
  'Dependência de pessoas-chave para tudo',
  'Erros que se repetem sem solução',
];
