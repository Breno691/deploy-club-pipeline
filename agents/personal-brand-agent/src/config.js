// Personal Brand Intelligence Agent — config

const BRENO = {
  name:        'Breno Luiz',
  title:       'Black Belt Lean Six Sigma',
  company:     'SmartOps IA',
  location:    'Belo Horizonte, MG',
  specialty:   ['Lean Six Sigma', 'Six Sigma', 'Melhoria Contínua', 'Automação', 'IA para PMEs'],
  instagram:   '@smartops.ia',
  linkedin:    'brenoluiz',
  website:     'smartops-ia.com.br',

  // Core positioning
  positioning: 'Ajudo PMEs a reduzir desperdícios e automatizar processos com Lean Six Sigma + IA.',
  tagline:     'Lean + IA para PMEs de BH',

  // Headlines by platform
  headlines: {
    linkedin:  'Black Belt Lean Six Sigma | Fundador da SmartOps IA | Ajudo PMEs de BH a reduzir desperdícios e automatizar processos com Lean + IA',
    instagram: 'Lean Six Sigma + IA para PMEs | Redução de custos | Automação | BH e região | Diagnóstico ↓',
    short:     'Black Belt Lean Six Sigma | SmartOps IA | BH/MG',
    speaker:   'Breno Luiz, Black Belt Lean Six Sigma e fundador da SmartOps IA',
  },

  // Proof points
  credentials: ['Black Belt Lean Six Sigma', 'Fundador SmartOps IA', 'Consultor presencial BH/MG'],

  // Key phrases
  signaturePhrases: [
    'O problema nem sempre é vender mais. Às vezes é perder menos.',
    'Retrabalho é dinheiro vazando.',
    'Processo ruim custa caro.',
    'Automação sem processo vira bagunça automatizada.',
    'IA só gera valor quando resolve um problema real.',
    'Toda tarefa repetitiva é uma oportunidade de automação.',
    'O dono não deveria viver apagando incêndio.',
  ],
};

const BRAND_SCORE_WEIGHTS = {
  positioningClarity: 20,
  contentConsistency: 15,
  perceivedAuthority: 20,
  socialProof:        15,
  inboundGenerated:   15,
  engagementQuality:  10,
  localReputation:     5,
};

const CONTENT_PILLARS = [
  'autoridade_tecnica',    // Lean, Six Sigma, DMAIC, metodologia
  'autoridade_pratica',    // exemplos, bastidores, diagnósticos
  'autoridade_local',      // BH, PMEs locais, presencial
  'educacao_mercado',      // educar sobre desperdício, IA, automação
  'prova_social',          // cases, resultados, depoimentos
  'humanizacao',           // trajetória, rotina, crenças
];

const CONFIG = { BRENO, BRAND_SCORE_WEIGHTS, CONTENT_PILLARS };
module.exports = CONFIG;
