// Strategic Planning Intelligence Agent — config

const CONFIG = {
  agent: {
    name:    'Strategic Planning Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Estratégia, Planejamento e OKRs',
    mission: 'Transformar visão em execução clara, mensurável e priorizada',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    location: 'Belo Horizonte, MG',
    stage:    'early', // early | growth | scale
    focus:    'PMEs locais BH/MG — Lean Six Sigma + Automação + IA',
  },

  // Pilares estratégicos
  pillars: {
    aquisicao:     'Aquisição de Clientes (leads, reuniões, fechamento)',
    autoridade:    'Autoridade e Marca (conteúdo, palestras, LinkedIn)',
    site:          'Site e Conversão (tráfego, CTA, diagnóstico)',
    ads:           'Ads e Performance (Google, Meta, ROAS)',
    vendas:        'Vendas e Propostas (CRM, proposta, ticket)',
    entrega:       'Entrega e Resultados (ROI, cases, satisfação)',
    financeiro:    'Finanças (receita, margem, CAC, LTV)',
    produtizacao:  'Produtização (produtos, recorrência, escala)',
  },

  // Horizontes de planejamento
  horizons: {
    30:  { label: '30 dias',   focus: 'base comercial — tracking, ads, CRM, conteúdo, prospecção' },
    90:  { label: '90 dias',   focus: 'tração — leads, reuniões, clientes, cases, autoridade' },
    180: { label: '180 dias',  focus: 'escala inicial — produtos, recorrência, parcerias, playbooks' },
    365: { label: '12 meses',  focus: 'empresa previsível — receita recorrente, autoridade regional' },
  },

  // OKRs recomendados para fase inicial
  initial_okrs: [
    {
      id: 'okr-aquisicao',
      objective: 'Conseguir os primeiros clientes locais de Lean + IA',
      horizon: 90,
      key_results: [
        { kr: 'Gerar 40 leads qualificados', target: 40, unit: 'leads', current: 0 },
        { kr: 'Agendar 15 reuniões comerciais', target: 15, unit: 'reuniões', current: 0 },
        { kr: 'Enviar 8 propostas', target: 8, unit: 'propostas', current: 0 },
        { kr: 'Fechar 3 clientes', target: 3, unit: 'clientes', current: 0 },
      ],
      status: 'draft',
      confidence: 6,
    },
    {
      id: 'okr-autoridade',
      objective: 'Posicionar Breno como referência local em Lean + IA para PMEs',
      horizon: 90,
      key_results: [
        { kr: 'Publicar 60 conteúdos em 90 dias', target: 60, unit: 'posts', current: 0 },
        { kr: 'Realizar 2 lives ou palestras', target: 2, unit: 'eventos', current: 0 },
        { kr: 'Criar 3 artigos LinkedIn', target: 3, unit: 'artigos', current: 0 },
      ],
      status: 'draft',
      confidence: 7,
    },
    {
      id: 'okr-site',
      objective: 'Transformar site em máquina de leads',
      horizon: 90,
      key_results: [
        { kr: 'Configurar tracking completo (GA4 + Meta Pixel)', target: 1, unit: 'setup', current: 0 },
        { kr: 'Atingir 3% de conversão no CTA principal', target: 3, unit: '%', current: 0 },
        { kr: 'Criar página /diagnostico-gratuito', target: 1, unit: 'página', current: 0 },
      ],
      status: 'draft',
      confidence: 8,
    },
    {
      id: 'okr-financeiro',
      objective: 'Criar controle financeiro básico e primeira receita',
      horizon: 90,
      key_results: [
        { kr: 'Gerar R$ 15.000 em receita', target: 15000, unit: 'R$', current: 0 },
        { kr: 'Manter margem bruta acima de 60%', target: 60, unit: '%', current: 0 },
        { kr: 'Medir CAC por canal', target: 1, unit: 'setup', current: 0 },
      ],
      status: 'draft',
      confidence: 5,
    },
  ],

  // Iniciativas estratégicas — backlog inicial priorizado
  initial_initiatives: [
    { name: 'Tracking do site (GA4 + Meta Pixel)',        pillar: 'site',       impact: 9, confidence: 9, ease: 7 },
    { name: 'Google Ads local para diagnóstico gratuito', pillar: 'ads',        impact: 9, confidence: 7, ease: 6 },
    { name: 'CRM de leads (básico)',                      pillar: 'vendas',     impact: 8, confidence: 8, ease: 7 },
    { name: 'Página /diagnostico-gratuito',               pillar: 'site',       impact: 9, confidence: 8, ease: 6 },
    { name: 'Conteúdo Instagram 3x/semana',               pillar: 'autoridade', impact: 7, confidence: 8, ease: 7 },
    { name: 'Prospecção local (LinkedIn + indicação)',     pillar: 'aquisicao',  impact: 8, confidence: 7, ease: 6 },
    { name: 'Dashboard executivo diário',                  pillar: 'financeiro', impact: 7, confidence: 8, ease: 8 },
    { name: 'Lead Scoring Agent ativo',                   pillar: 'aquisicao',  impact: 7, confidence: 8, ease: 8 },
    { name: 'Proposal Agent ativo',                       pillar: 'vendas',     impact: 8, confidence: 9, ease: 9 },
    { name: 'Case Study Agent ativo',                     pillar: 'autoridade', impact: 7, confidence: 9, ease: 9 },
  ],

  // O que NÃO priorizar na fase inicial
  not_now: [
    'Produtos complexos sem validação',
    'Muitos agentes novos sem ROI claro',
    'Automações sofisticadas sem leads',
    'Expansão nacional antes de validar local',
    'Comunidade antes de audiência',
    'Curso digital antes de demanda comprovada',
  ],

  // Metas padrão por horizonte
  targets: {
    30:  { leads: 10, meetings: 4, proposals: 2, clients: 1, revenue: 5000  },
    90:  { leads: 40, meetings: 15, proposals: 8, clients: 3, revenue: 15000 },
    180: { leads: 120, meetings: 45, proposals: 24, clients: 10, revenue: 50000 },
  },

  // Thresholds de alerta
  alerts: {
    okr_progress_warning:     40,  // OKR abaixo de 40% na metade do ciclo → alerta
    okr_progress_critical:    20,  // OKR abaixo de 20% na metade → emergência
    drift_initiatives_max:    5,   // mais de 5 iniciativas ativas → dispersão
    weeks_without_client:     6,   // 6 semanas sem fechar cliente → rever estratégia
    ads_roas_min:             2.0, // ROAS mínimo antes de pausar campanha
  },

  // Riscos estratégicos comuns na fase inicial
  common_risks: [
    { risk: 'Dispersão de foco em muitos agentes', severity: 'alta', probability: 'alta' },
    { risk: 'Sem conversão do site — sem leads orgânicos', severity: 'alta', probability: 'média' },
    { risk: 'Ads com ROAS negativo por falta de tracking', severity: 'alta', probability: 'média' },
    { risk: 'Proposta sem case ou prova social', severity: 'média', probability: 'alta' },
    { risk: 'Caixa limitado sem previsão de receita', severity: 'alta', probability: 'média' },
    { risk: 'Solo founder sem parceiro de vendas', severity: 'média', probability: 'alta' },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
