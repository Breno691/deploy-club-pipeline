// Six Sigma Agent — config
const CONFIG = {
  agent: {
    name:    'Six Sigma Agent',
    version: '1.0.0',
    role:    'Especialista em Six Sigma e Controle Estatístico de Processos',
    mission: 'Reduzir variabilidade, eliminar defeitos e atingir 3.4 DPMO através do DMAIC',
    mantra:  'Medir, analisar, controlar. Zero defeito é o único padrão.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Tabela Sigma Level → DPMO
  sigma_table: [
    { level: 1.0, dpmo: 691462, yield_pct: 30.9 },
    { level: 1.5, dpmo: 500000, yield_pct: 50.0 },
    { level: 2.0, dpmo: 308538, yield_pct: 69.1 },
    { level: 2.5, dpmo: 158655, yield_pct: 84.1 },
    { level: 3.0, dpmo: 66807,  yield_pct: 93.3 },
    { level: 3.5, dpmo: 22750,  yield_pct: 97.7 },
    { level: 4.0, dpmo: 6210,   yield_pct: 99.4 },
    { level: 4.5, dpmo: 1350,   yield_pct: 99.9 },
    { level: 5.0, dpmo: 233,    yield_pct: 99.98 },
    { level: 5.5, dpmo: 32,     yield_pct: 99.997 },
    { level: 6.0, dpmo: 3.4,    yield_pct: 99.9997 },
  ],

  // Fases DMAIC com atividades e ferramentas
  dmaic_phases: {
    D: {
      name:      'Define',
      objetivo:  'Definir o problema, escopo, metas e equipe',
      atividades: ['Project Charter', 'SIPOC', 'Voz do Cliente (VOC)', 'CTQ Tree', 'Mapa do Processo'],
      ferramentas: ['Project Charter', 'SIPOC', 'CTQ Tree', 'Business Case'],
      entregavel: 'Project Charter aprovado com meta quantificada',
    },
    M: {
      name:      'Measure',
      objetivo:  'Medir o desempenho atual do processo',
      atividades: ['Plano de medição', 'Análise R&R', 'Coleta de dados', 'Baseline DPMO', 'Mapa detalhado do processo'],
      ferramentas: ['MSA/Gage R&R', 'Histograma', 'Carta de Controle', 'Diagrama de Pareto'],
      entregavel: 'Baseline do processo (sigma atual, DPMO, Cp/Cpk)',
    },
    A: {
      name:      'Analyze',
      objetivo:  'Identificar causas-raiz dos defeitos',
      atividades: ['Análise de dados', 'Diagrama Ishikawa', '5 Porquês', 'FMEA', 'Regressão', 'Teste de hipótese'],
      ferramentas: ['Ishikawa', '5 Porquês', 'FMEA', 'Regressão Linear', 'Análise de Correlação'],
      entregavel: 'Causas-raiz validadas por dados',
    },
    I: {
      name:      'Improve',
      objetivo:  'Implementar e validar soluções',
      atividades: ['Brainstorming', 'FMEA de solução', 'Piloto', 'Implementação', 'Validação'],
      ferramentas: ['Design of Experiments (DOE)', 'Poka-Yoke', 'SMED', 'Kanban', 'Piloto controlado'],
      entregavel: 'Soluções implementadas com melhoria medida',
    },
    C: {
      name:      'Control',
      objetivo:  'Sustentar as melhorias no longo prazo',
      atividades: ['Plano de controle', 'SOP atualizado', 'Treinamento', 'Cartas de controle', 'Passagem para operação'],
      ferramentas: ['Control Plan', 'Cartas de Controle (X-bar, R, p, c)', 'SOP', 'Auditorias'],
      entregavel: 'Plano de controle ativo + processo sustentado',
    },
  },

  // Tipos de defeitos mais comuns em consultoria / serviços
  defect_types: [
    'Entrega atrasada',
    'Relatório com erros',
    'Retrabalho em proposta',
    'Dado incorreto no dashboard',
    'Processo executado fora do padrão',
    'Resposta fora do SLA',
    'Automação com falha',
    'Workflow com erro',
  ],

  // Benchmarks de capability por nível de maturidade
  capability_benchmarks: {
    world_class: { cp: 2.0,  cpk: 1.67, sigma: 6.0, label: 'World Class' },
    excellent:   { cp: 1.67, cpk: 1.33, sigma: 5.0, label: 'Excelente' },
    adequate:    { cp: 1.33, cpk: 1.0,  sigma: 4.0, label: 'Adequado' },
    poor:        { cp: 1.0,  cpk: 0.67, sigma: 3.0, label: 'Ruim' },
    incapable:   { cp: 0.67, cpk: 0.0,  sigma: 2.0, label: 'Incapaz' },
  },

  // Projetos Six Sigma típicos para SmartOps
  typical_projects: [
    { name: 'Reduzir retrabalho em propostas', area: 'Vendas', meta_sigma: 4.0, prazo_dias: 60 },
    { name: 'Melhorar SLA de entrega de relatórios', area: 'Operações', meta_sigma: 4.5, prazo_dias: 45 },
    { name: 'Eliminar falhas em automações n8n', area: 'Tecnologia', meta_sigma: 5.0, prazo_dias: 30 },
    { name: 'Reduzir erros em análise de dados', area: 'Analytics', meta_sigma: 4.0, prazo_dias: 60 },
  ],

  // ROI típico de projetos Six Sigma
  roi_benchmarks: {
    belt_project_savings_min: 50000,
    belt_project_savings_max: 500000,
    implementation_cost_avg:  15000,
    payback_months_avg:       6,
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
