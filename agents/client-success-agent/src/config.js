// Client Success Agent — config
const CONFIG = {
  agent: { name: 'Client Success Agent', version: '1.0.0',
    role: 'Guardião do Sucesso do Cliente',
    mission: 'Garantir que cada cliente alcance o resultado prometido e queira renovar',
    mantra: 'Cliente feliz é o melhor vendedor.' },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', location: 'BH, MG' },

  // Health score thresholds (0-100)
  health_thresholds: {
    SAUDAVEL:  { min: 80, label: 'Saudável',       color: 'verde',    action: 'Pedir indicação + upsell' },
    ATENCAO:   { min: 60, label: 'Atenção',         color: 'amarelo',  action: 'Check-in proativo esta semana' },
    EM_RISCO:  { min: 40, label: 'Em Risco',        color: 'laranja',  action: 'Ligação urgente + plano de resgate' },
    CRITICO:   { min: 0,  label: 'Crítico/Churn',  color: 'vermelho', action: 'Reunião executiva em 24h' },
  },

  // Dimensões do health score
  health_dimensions: {
    roi_atingido:       { weight: 30, desc: 'Cliente está vendo resultado financeiro' },
    engajamento:        { weight: 20, desc: 'Responde mensagens, participa das sessões' },
    progresso_projeto:  { weight: 25, desc: '% do projeto entregue vs planejado' },
    satisfacao:         { weight: 15, desc: 'NPS e feedback qualitativo' },
    pagamentos:         { weight: 10, desc: 'Pagamentos em dia' },
  },

  // SLA de atendimento por status
  sla: {
    critico:   { response_h: 2,  check_in_days: 1 },
    em_risco:  { response_h: 4,  check_in_days: 3 },
    atencao:   { response_h: 24, check_in_days: 7 },
    saudavel:  { response_h: 48, check_in_days: 30 },
  },

  // Marcos de entrega por tipo de projeto
  delivery_milestones: {
    'quick-win':         ['kickoff', 'diagnóstico D5', 'plano_acao_D10', 'implementação_D15', 'resultado_D21'],
    'diagnostico-plano': ['kickoff', 'coleta_dados_D7', 'vsm_D14', 'plano_aprovado_D21', 'quick_wins_D35', 'entrega_D42'],
    'projeto-completo':  ['kickoff', 'diagnóstico_D14', 'implementação_D42', 'treinamento_D70', 'automações_D98', 'entrega_D112'],
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};
module.exports = { CONFIG };
