// Sales Intelligence Agent — config
const CONFIG = {
  agent: {
    name:    'Sales Intelligence Agent',
    version: '1.0.0',
    role:    'Especialista em Vendas Consultivas B2B',
    mission: 'Qualificar leads, mapear objeções, criar scripts e maximizar taxa de fechamento',
    mantra:  'Vender é descobrir a dor. Solução vem depois.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', location: 'BH, MG', segment: 'consultoria B2B PME' },

  // Critérios de qualificação BANT
  qualification: {
    B: { name: 'Budget',    pt: 'Orçamento',    weight: 25, question: 'Existe verba alocada para resolver esse problema?' },
    A: { name: 'Authority', pt: 'Autoridade',   weight: 25, question: 'Você é o decisor ou há outra pessoa?' },
    N: { name: 'Need',      pt: 'Necessidade',  weight: 30, question: 'Qual é a dor principal e impacto em R$?' },
    T: { name: 'Timeline',  pt: 'Prazo',        weight: 20, question: 'Quando precisa resolver?' },
  },

  // Status de leads no pipeline
  lead_stages: [
    { stage: 'novo',              label: 'Novo Lead',              sla_horas: 2  },
    { stage: 'contato_feito',     label: 'Contato Feito',          sla_horas: 24 },
    { stage: 'qualificado',       label: 'Qualificado (BANT)',      sla_horas: 48 },
    { stage: 'reuniao_agendada',  label: 'Reunião Agendada',       sla_horas: 0  },
    { stage: 'reuniao_realizada', label: 'Reunião Realizada',      sla_horas: 24 },
    { stage: 'proposta_enviada',  label: 'Proposta Enviada',       sla_horas: 72 },
    { stage: 'negociacao',        label: 'Em Negociação',          sla_horas: 72 },
    { stage: 'fechado_ganho',     label: 'Fechado ✅',             sla_horas: 0  },
    { stage: 'fechado_perdido',   label: 'Perdido ❌',             sla_horas: 0  },
  ],

  // Serviços e tickets para qualificação
  services: {
    'quick-win':          { ticket: 5500,  sla_semanas: 3,  ideal_for: 'PME com 1 gargalo urgente' },
    'diagnostico-plano':  { ticket: 11500, sla_semanas: 6,  ideal_for: 'PME querendo mapa completo' },
    'projeto-completo':   { ticket: 32000, sla_semanas: 16, ideal_for: 'Empresa com múltiplos processos' },
    'parceria-mensal':    { ticket: 5500,  sla_semanas: null, ideal_for: 'Empresa querendo evolução contínua' },
  },

  // Objeções mais comuns
  common_objections: [
    { objection: 'É muito caro',                       frequency: 10, response_strategy: 'ROI + comparar custo do desperdício atual' },
    { objection: 'Não temos tempo agora',              frequency: 9,  response_strategy: 'O custo de esperar > custo de agir' },
    { objection: 'Já tentamos antes e não funcionou',  frequency: 8,  response_strategy: 'Entender o que falhou + diferencial SmartOps' },
    { objection: 'Nossa empresa é pequena demais',     frequency: 8,  response_strategy: 'PMEs são o foco — casos de sucesso específicos' },
    { objection: 'Quero pensar mais',                  frequency: 9,  response_strategy: 'Descobrir a objeção real por trás' },
    { objection: 'Meu sócio precisa aprovar',          frequency: 7,  response_strategy: 'Incluir sócio na próxima reunião' },
    { objection: 'Não preciso de consultor',           frequency: 6,  response_strategy: 'Mostrar o que o especialista externo enxerga' },
    { objection: 'Posso fazer internamente',           frequency: 7,  response_strategy: 'Tempo + especialidade + velocidade' },
  ],

  // Perfil ideal de cliente (ICP)
  icp: {
    porte:          '10-200 funcionários',
    setor:          'indústria, serviços, saúde, alimentação',
    localizacao:    'Belo Horizonte e região',
    dor_principal:  'processo manual, retrabalho, crescimento com custo alto',
    decisor:        'dono, diretor ou gerente com autonomia de R$ 5k-50k',
    urgencia:       'tem problema ativo que custa >R$ 2k/mês',
    nao_ideal:      'micro (< 5 funcionários), sem verba, sem urgência',
  },

  // Metas de vendas
  targets: {
    reunioes_semana:    3,
    propostas_mes:      4,
    clientes_mes:       1,
    taxa_reuniao_lead:  0.4,   // 40% dos leads viram reunião
    taxa_proposta_reuniao: 0.6, // 60% das reuniões viram proposta
    taxa_fechamento:    0.25,  // 25% das propostas fecham
    ticket_medio:       11500,
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
