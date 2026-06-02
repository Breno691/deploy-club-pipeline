// Proposal Agent — config
const CONFIG = {
  agent: { name: 'Proposal Agent', version: '1.0.0',
    role: 'Especialista em Propostas Comerciais B2B',
    mission: 'Criar propostas personalizadas com ROI calculado que fecham negócios',
    mantra: 'A proposta certa no momento certo com o ROI certo.' },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  services: {
    'quick-win':          { name: 'Quick Win',            ticket: 5500,  semanas: 3,  entregaveis: ['diagnóstico rápido', 'plano de ação', '1 melhoria implementada'], garantia: 'ROI mínimo 2× em 60 dias' },
    'diagnostico-plano':  { name: 'Diagnóstico + Plano',  ticket: 11500, semanas: 6,  entregaveis: ['VSM completo', 'mapa de desperdícios', 'plano 90 dias', 'quick wins'], garantia: 'ROI mínimo 3× em 90 dias' },
    'projeto-completo':   { name: 'Projeto Completo',     ticket: 32000, semanas: 16, entregaveis: ['diagnóstico', 'implementação Lean', 'automações', 'treinamento equipe', 'dashboard'], garantia: 'ROI mínimo 5× em 12 meses' },
    'parceria-continua':  { name: 'Parceria Contínua',    ticket: 5500,  semanas: null, entregaveis: ['8h/mês de consultoria', 'acesso ao sistema IA', 'relatórios mensais', 'suporte WhatsApp'], garantia: 'Melhoria contínua mensurada' },
  },

  // Estrutura padrão de proposta
  proposal_sections: [
    'sumario_executivo', 'diagnostico_situacao', 'problema_custo',
    'solucao_proposta', 'metodologia', 'entregaveis', 'cronograma',
    'roi_calculado', 'investimento', 'garantia', 'proximos_passos',
  ],

  // Multiplicadores de urgência para deadline
  urgency_discount: { urgente: 0, normal: 0, sem_urgencia: 0 },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};
module.exports = { CONFIG };
