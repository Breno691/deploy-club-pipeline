// Kaizen Agent — config
const CONFIG = {
  agent: {
    name:    'Kaizen Agent',
    version: '1.0.0',
    role:    'Especialista em Kaizen e Melhoria Contínua Diária',
    mission: 'Promover melhorias incrementais consistentes que geram resultados compoundados',
    mantra:  'Pequenas melhorias todos os dias. Kaizen é uma filosofia, não um evento.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Tipos de eventos Kaizen
  event_types: {
    rapid_improvement: { duration_days: 3, team_size: [4,8], focus: 'Uma área específica com resultado rápido' },
    point_kaizen:      { duration_days: 1, team_size: [1,3], focus: 'Problema pontual, solução imediata' },
    system_kaizen:     { duration_days: 5, team_size: [6,12], focus: 'Processo ponta-a-ponta, impacto sistêmico' },
    daily_kaizen:      { duration_days: 0.25, team_size: [1,2], focus: 'Melhoria de 15min na rotina diária' },
  },

  // Áreas de melhoria na SmartOps
  improvement_areas: {
    marketing:   { name: 'Marketing', kpis: ['lead_time_post', 'taxa_engajamento', 'custo_por_lead'] },
    vendas:      { name: 'Vendas', kpis: ['taxa_fechamento', 'lead_time_proposta', 'ciclo_venda_dias'] },
    operacoes:   { name: 'Operações', kpis: ['lead_time_entrega', 'retrabalho_pct', 'sla_cumprimento'] },
    tecnologia:  { name: 'Tecnologia', kpis: ['uptime_pct', 'tempo_resposta_ms', 'falhas_workflow'] },
    financeiro:  { name: 'Financeiro', kpis: ['margem_liquida', 'dias_recebimento', 'custo_fixo'] },
    atendimento: { name: 'Atendimento', kpis: ['nps', 'tempo_primeira_resposta_h', 'satisfacao'] },
  },

  // Ciclo PDCA
  pdca: {
    P: { name: 'Plan',  atividades: ['Definir problema', 'Analisar dados', 'Identificar causa-raiz', 'Planejar solução', 'Definir meta'] },
    D: { name: 'Do',    atividades: ['Treinar equipe', 'Executar piloto', 'Implementar em pequena escala', 'Coletar dados'] },
    C: { name: 'Check', atividades: ['Medir resultados', 'Comparar com meta', 'Analisar variações', 'Documentar aprendizados'] },
    A: { name: 'Act',   atividades: ['Padronizar se funcionou', 'Escalar para todo processo', 'Atualizar SOP', 'Iniciar próximo PDCA'] },
  },

  // Categorias de melhoria Kaizen com exemplos
  improvement_categories: [
    { category: 'Tempo',       desc: 'Reduzir lead time, cycle time, tempo de espera',  exemplo: 'Reduzir tempo de criação de proposta de 4h para 1h' },
    { category: 'Qualidade',   desc: 'Reduzir defeitos, retrabalho, erros',              exemplo: 'Criar checklist para evitar erros em relatórios' },
    { category: 'Custo',       desc: 'Reduzir desperdício, custo de retrabalho',        exemplo: 'Automatizar tarefa manual que consome 3h/semana' },
    { category: 'Segurança',   desc: 'Prevenir riscos, falhas, incidentes',             exemplo: 'Backup automático de dados críticos' },
    { category: 'Moral',       desc: 'Melhorar produtividade, satisfação, engajamento', exemplo: 'Dashboard de progresso visível para toda equipe' },
    { category: 'Entrega',     desc: 'Melhorar pontualidade, confiabilidade',           exemplo: 'Template padrão de entrega de projeto' },
  ],

  // Benchmarks de kaizen
  benchmarks: {
    eventos_por_trimestre_min: 2,
    melhoria_min_pct: 10,
    roi_minimo: 3.0,
    tempo_sustentacao_meses: 6,
  },

  // Ferramentas Kaizen disponíveis
  ferramentas: ['PDCA', '5S', 'Diagrama Ishikawa', '5 Porquês', 'A3', 'Kanban', 'Gemba Walk', 'Brainstorming', 'Mapeamento de Processo', 'Poka-Yoke'],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
