// Chief of Staff Agent — config
const CONFIG = {
  agent: { name: 'Chief of Staff Agent', version: '1.0.0',
    role: 'Braço direito do CEO — transforma estratégia em execução',
    mission: 'Garantir que a estratégia vire tarefa, a tarefa vire ação, e a ação vire resultado',
    mantra: 'Estratégia sem execução é sonho. Execução sem estratégia é correria.' },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', location: 'BH, MG' },

  // Cadência operacional
  cadence: {
    daily:   ['standup 15min', 'prioridade do dia', 'blocker check'],
    weekly:  ['planejamento segunda', 'review sexta', 'OKR check quarta'],
    monthly: ['retrospectiva', 'atualizar roadmap', 'revisar metas'],
  },

  // Tipos de tarefa
  task_types: [
    { type: 'receita',    icon: '💰', priority_boost: 2 },
    { type: 'cliente',    icon: '🤝', priority_boost: 2 },
    { type: 'marketing',  icon: '📣', priority_boost: 1 },
    { type: 'operacao',   icon: '⚙️', priority_boost: 1 },
    { type: 'admin',      icon: '📋', priority_boost: 0 },
    { type: 'aprendizado',icon: '📚', priority_boost: 0 },
  ],

  // Metas semanais padrão SmartOps
  weekly_targets: {
    reunioes: 3, leads_novos: 10, posts: 3,
    proposta: 1, followups: 5, automacoes: 1,
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};
module.exports = { CONFIG };
