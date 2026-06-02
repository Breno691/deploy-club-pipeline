// Authority Building Intelligence Agent — config
const CONFIG = {
  agent: {
    name:    'Authority Building Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Autoridade, Relações Públicas e Thought Leadership',
    mission: 'Transformar Breno Luiz em referência reconhecida em Lean Six Sigma + IA para PMEs em BH',
  },

  speaker: {
    name:       'Breno Luiz',
    title:      'Black Belt Lean Six Sigma | Especialista em Automação e IA para PMEs',
    company:    'SmartOps IA',
    location:   'Belo Horizonte, MG',
    email:      'brenoluiz691@gmail.com',
    expertise:  ['Lean Six Sigma', 'Melhoria Contínua', 'Automação com IA', 'Processos para PMEs', 'Redução de Custos'],
    positioning_short: 'Breno Luiz ajuda PMEs de BH a reduzir desperdícios e automatizar processos com Lean Six Sigma + IA.',
    positioning_long:  'Black Belt Lean Six Sigma especializado em IA aplicada a processos de PMEs. Ajuda empresas de BH e região a encontrar gargalos, eliminar desperdícios, organizar processos e automatizar rotinas — gerando redução de custos e aumento de eficiência operacional.',
  },

  pillars: [
    { id: 'lean',        label: 'Lean e Desperdícios',    topics: ['8 desperdícios', 'VSM', 'retrabalho', 'gargalos', 'Kaizen'] },
    { id: 'six_sigma',   label: 'Six Sigma e Qualidade',  topics: ['DMAIC', 'causa raiz', 'Pareto', 'variabilidade', 'defeitos'] },
    { id: 'automation',  label: 'Automação e IA',         topics: ['n8n', 'agentes de IA', 'RPA', 'workflows', 'automação de processos'] },
    { id: 'pme_mgmt',    label: 'Gestão de PMEs',         topics: ['custo oculto', 'margem', 'crescimento desordenado', 'falta de indicadores'] },
    { id: 'results',     label: 'Resultados e Cases',     topics: ['antes/depois', 'ROI', 'economia gerada', 'processos otimizados'] },
    { id: 'local',       label: 'Autoridade Local BH',    topics: ['empresas BH', 'PMEs regionais', 'indústria local', 'comércio local'] },
  ],

  eventScoring: {
    PRIORIDADE_MAXIMA: { threshold: 85, label: 'Prioridade Máxima', action: 'Abordar esta semana' },
    VALE_ABORDAR:      { threshold: 70, label: 'Vale Abordar',      action: 'Contatar este mês' },
    MONITORAR:         { threshold: 50, label: 'Monitorar',         action: 'Monitorar próxima edição' },
    NAO_PRIORIZAR:     { threshold: 0,  label: 'Não Priorizar',     action: 'Arquivar' },
  },

  authorityScore: {
    target_90d:  40,
    target_12m:  80,
    components:  ['palestras', 'artigos', 'convites', 'menções', 'seguidores_qualificados', 'leads_inbound', 'parcerias'],
  },

  keynoteTopics: [
    {
      id: 'topic_1',
      title: 'Como PMEs perdem dinheiro com retrabalho sem perceber',
      audience: 'Donos de PMEs, gestores',
      cta: 'Diagnóstico gratuito',
      duration: '30-45min',
    },
    {
      id: 'topic_2',
      title: 'Lean + IA: como pequenas empresas reduzem custos sem contratar mais',
      audience: 'Empresários e empreendedores',
      cta: 'Mapa de Gargalos',
      duration: '40-60min',
    },
    {
      id: 'topic_3',
      title: 'O custo invisível dos processos manuais',
      audience: 'Donos de PMEs e gestores financeiros',
      cta: 'Avaliação operacional',
      duration: '30min',
    },
    {
      id: 'topic_4',
      title: 'Automação simples para empresas locais',
      audience: 'Empreendedores e gestores operacionais',
      cta: 'AI Audit gratuito',
      duration: '45min',
    },
    {
      id: 'topic_5',
      title: 'Como encontrar gargalos em 30 minutos',
      audience: 'Empresários de qualquer segmento',
      cta: 'Workshop ou diagnóstico',
      duration: '30min',
    },
  ],

  targetEvents: [
    'SEBRAE BH', 'CDL BH', 'ACMinas', 'FIEMG', 'Endeavor BH',
    'Hub Inovação BH', 'StartupBH', 'MeetupPME', 'AceleraBH',
    'Associação Comercial MG', 'CRC-MG', 'OAB-MG eventos',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
