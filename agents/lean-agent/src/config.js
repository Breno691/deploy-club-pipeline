// Lean Agent — config
const CONFIG = {
  agent: {
    name:    'Lean Agent',
    version: '1.0.0',
    role:    'Especialista em Lean Manufacturing e Melhoria Contínua',
    mission: 'Identificar, mapear e eliminar os 8 desperdícios para aumentar eficiência e reduzir custos',
    mantra:  'Fazer mais com menos. Sem desperdício.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Os 8 Desperdícios (DOWNTIME)
  eight_wastes: {
    D: { name: 'Defeitos',          pt: 'Defeitos',             icon: '🔴', cost: 'retrabalho, descarte, insatisfação do cliente' },
    O: { name: 'Overproduction',    pt: 'Superprodução',        icon: '🟠', cost: 'estoque excessivo, capital parado, espaço' },
    W: { name: 'Waiting',           pt: 'Espera',               icon: '⏳', cost: 'tempo parado, gargalo, ociosidade' },
    N: { name: 'Non-utilized Talent',pt:'Talento não utilizado', icon: '🧠', cost: 'frustração, rotatividade, perda de conhecimento' },
    T: { name: 'Transportation',    pt: 'Transporte excessivo', icon: '🚛', cost: 'movimentação desnecessária de material/info' },
    I: { name: 'Inventory',         pt: 'Estoque excessivo',    icon: '📦', cost: 'capital parado, obsolescência, espaço' },
    M: { name: 'Motion',            pt: 'Movimento desnecessário',icon:'🚶',cost: 'ergonomia, tempo perdido, fadiga' },
    E: { name: 'Extra Processing',  pt: 'Processamento extra',  icon: '⚙️', cost: 'fazer mais do que o cliente precisa' },
  },

  // Setores atendidos pela SmartOps
  target_sectors: ['industria', 'servicos', 'saude', 'alimentacao', 'construcao', 'logistica', 'varejo'],

  // Critérios de priorização de desperdício
  waste_priority: {
    custo_mes_brl:    { weight: 30, desc: 'Custo mensal estimado do desperdício' },
    frequencia:       { weight: 20, desc: 'Quantas vezes ocorre por mês' },
    impacto_cliente:  { weight: 25, desc: 'Afeta diretamente o cliente' },
    facilidade_fix:   { weight: 15, desc: 'Facilidade de eliminar (inverso da dificuldade)' },
    rapido_resultado: { weight: 10, desc: 'Resultado visível em < 30 dias' },
  },

  // Benchmarks de eficiência por setor
  benchmarks: {
    industria:  { oee_min: 65, retrabalho_max_pct: 3, lead_time_max_dias: 10 },
    servicos:   { utilizacao_min_pct: 70, retrabalho_max_pct: 5, sla_max_dias: 3 },
    saude:      { tempo_espera_max_min: 20, retrabalho_max_pct: 1, ocupacao_min_pct: 75 },
  },

  // Ferramentas Lean disponíveis
  lean_tools: [
    '5S', 'VSM (Value Stream Mapping)', 'Kaizen', 'PDCA',
    '5 Porquês', 'Diagrama Ishikawa', 'Kanban', 'Poka-Yoke',
    'SMED', 'Heijunka', 'Jidoka', 'Andon',
    'OEE', 'Lead Time', 'Cycle Time', 'Takt Time',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
