// Organizational Learning Intelligence Agent — config

const CONFIG = {
  agent: {
    name:    'Organizational Learning Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Aprendizado Organizacional e Melhoria Contínua Interna',
    mission: 'Transformar toda experiência da SmartOps IA em conhecimento reutilizável e vantagem competitiva',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    location: 'Belo Horizonte, MG',
  },

  // Áreas de aprendizado
  areas: [
    'marketing', 'ads', 'website', 'vendas', 'entrega',
    'client_success', 'automacao', 'agentes', 'financeiro',
    'parceria', 'autoridade', 'estrategia', 'operacional',
  ],

  // Tipos de evento de aprendizado
  event_types: {
    win:              'Acerto que deve virar padrão',
    lesson:           'Aprendizado neutro de uma experiência',
    failure:          'Erro que deve gerar prevenção',
    decision:         'Decisão importante que deve ser documentada',
    pattern_success:  'Padrão de sucesso repetido',
    pattern_failure:  'Padrão de erro repetido',
    sop_update:       'Processo que virou SOP',
    playbook_update:  'Playbook atualizado',
    agent_improvement:'Melhoria em agente',
  },

  // Playbooks da empresa
  playbooks: [
    'marketing', 'ads', 'website-cro', 'sales', 'proposal',
    'client-success', 'automation', 'delivery', 'agent-operations',
    'financial', 'partnership', 'authority', 'content-production',
  ],

  // SOPs obrigatórios
  required_sops: [
    'publicar-conteudo', 'criar-anuncio', 'analisar-campanha',
    'followup-lead', 'criar-proposta', 'onboarding-cliente',
    'diagnostico-inicial', 'revisao-mensal', 'atualizar-playbook',
    'criar-case-study', 'revisar-agente',
  ],

  // Agentes que podem ser revisados
  smartops_agents: [
    'copywriter-agent', 'design-agent', 'distribution-agent',
    'marketing-research-agent', 'ads-agent', 'video-ad-agent',
    'sales-intelligence-agent', 'proposal-agent', 'pricing-agent',
    'financial-intelligence-agent', 'client-success-agent', 'risk-agent',
    'lean-agent', 'six-sigma-agent', 'automation-agent',
    'partnership-agent', 'authority-building-agent', 'personal-brand-agent',
    'ceo-advisor-agent', 'chief-of-staff-agent',
  ],

  // Impacto por tipo de aprendizado
  impact_weights: {
    evita_erro_critico:      30,
    melhora_receita:         25,
    reduz_custo:             20,
    melhora_processo:        15,
    melhora_agente:          10,
    conhecimento_geral:       5,
  },

  // Thresholds de gatilho
  triggers: {
    erro_repetido_count:      2,   // erros repetidos → criar SOP
    wins_para_padronizar:     2,   // wins repetidos → virar padrão
    impacto_min_playbook:    15,   // impacto mínimo para atualizar playbook
    learning_score_meta:     80,   // meta de learning score
  },

  // Learning score thresholds
  score_levels: {
    LEARNING_ORG:     { min: 80, label: 'Organização de Melhoria Contínua' },
    STRUCTURED:       { min: 60, label: 'Aprendizado Estruturado' },
    INFORMAL:         { min: 40, label: 'Aprendizado Informal' },
    NOT_LEARNING:     { min: 0,  label: 'Empresa Não Aprende' },
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
