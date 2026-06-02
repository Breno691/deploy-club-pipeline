// Lean Consulting Agent — config
const CONFIG = {
  agent: {
    name:    'Lean Consulting Agent',
    version: '1.0.0',
    role:    'Consultor Lean Sênior, Especialista em Melhoria Contínua e Automação de Processos',
    mission: 'Diagnosticar problemas, mapear processos, eliminar desperdícios e transformar operações',
    mantra:  'Não responder genérico. Sempre identificar o desperdício, a causa raiz e a ação concreta.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // 8 Desperdícios DOWNTIME
  eight_wastes: {
    D: { nome: 'Defeitos',           icon: '🔴', desc: 'Erros, retrabalho, falhas, correções', exemplo: 'Relatório com erro enviado ao cliente' },
    O: { nome: 'Superprodução',      icon: '🟠', desc: 'Produzir mais ou antes do necessário', exemplo: 'Gerar relatórios que ninguém lê' },
    W: { nome: 'Espera',             icon: '⏳', desc: 'Tempo parado aguardando resposta, aprovação ou informação', exemplo: 'Processo travado esperando aprovação' },
    N: { nome: 'Talento não usado',  icon: '🧠', desc: 'Pessoas fazendo tarefas abaixo do seu potencial', exemplo: 'Especialista fazendo planilha manual' },
    T: { nome: 'Transporte',         icon: '🚛', desc: 'Movimentação desnecessária de informação', exemplo: 'Enviar arquivo pelo email, WhatsApp e Drive' },
    I: { nome: 'Estoque',            icon: '📦', desc: 'Acúmulo de tarefas, documentos ou informações paradas', exemplo: 'Fila de 50 solicitações pendentes' },
    M: { nome: 'Movimento',          icon: '🚶', desc: 'Movimentação desnecessária de pessoas', exemplo: 'Funcionário procurando info em 3 sistemas' },
    E: { nome: 'Processamento extra',icon: '⚙️', desc: 'Fazer mais etapas do que o necessário', exemplo: 'Preencher a mesma info em 3 sistemas' },
  },

  // Ferramentas Lean por categoria
  lean_tools: {
    mapeamento:  ['SIPOC', 'VSM (Value Stream Mapping)', 'Fluxograma', 'BPMN', 'Diagrama de espaguete'],
    analise:     ['5 Porquês', 'Diagrama Ishikawa', 'Pareto', 'FMEA', 'Matriz impacto × probabilidade'],
    melhoria:    ['PDCA', 'Kaizen', 'A3', '5W2H', 'Poka-Yoke', 'SMED', 'Heijunka'],
    padronizacao: ['POP', 'Checklist', 'RACI', 'Kanban', 'Gestão visual', 'Andon', 'Jidoka'],
    medicao:     ['OEE', 'Lead Time', 'Cycle Time', 'Takt Time', 'DPMO', 'Cp/Cpk'],
    organizacao: ['5S (Seiri/Seiton/Seiso/Seiketsu/Shitsuke)', 'Gestão visual', 'Quadro Kanban'],
  },

  // Setores atendidos com benchmarks
  sectors: {
    industria:  { oee_min: 65, retrabalho_max_pct: 3, lead_time_max_dias: 10, principal_desperdicio: 'Defeitos e Espera' },
    servicos:   { utilizacao_min_pct: 70, retrabalho_max_pct: 5, sla_max_dias: 3, principal_desperdicio: 'Espera e Superprocessamento' },
    saude:      { tempo_espera_max_min: 20, retrabalho_max_pct: 1, ocupacao_min_pct: 75, principal_desperdicio: 'Espera e Transporte' },
    comercio:   { giro_estoque_min: 4, ruptura_max_pct: 2, atendimento_max_min: 5, principal_desperdicio: 'Estoque e Movimento' },
    tecnologia: { uptime_min_pct: 99, deploy_max_dias: 7, bugs_max_pct: 2, principal_desperdicio: 'Defeitos e Talento não usado' },
  },

  // Fases de diagnóstico Lean
  diagnostic_phases: [
    { fase: 1, nome: 'Entendimento',  acao: 'Entrevistar responsáveis, mapear fluxo geral, identificar dores',           tempo: '1-2 dias' },
    { fase: 2, nome: 'Mapeamento',    acao: 'SIPOC + VSM atual (as-is), cronometrar tempos, contar estoques',            tempo: '2-3 dias' },
    { fase: 3, nome: 'Análise',       acao: '8 desperdícios, causa-raiz (5 Porquês), Pareto de problemas',               tempo: '1-2 dias' },
    { fase: 4, nome: 'Priorização',   acao: 'Matriz impacto × esforço, Quick Wins vs. projetos médios e longos',        tempo: '0.5 dia' },
    { fase: 5, nome: 'Plano de Ação', acao: '5W2H para top 5 melhorias, responsáveis, prazos, indicadores',             tempo: '0.5 dia' },
  ],

  // Critérios de priorização de desperdício
  waste_priority_weights: {
    custo_mes_brl:    { weight: 30, desc: 'Custo mensal estimado do desperdício' },
    frequencia:       { weight: 20, desc: 'Quantas vezes ocorre por mês' },
    impacto_cliente:  { weight: 25, desc: 'Afeta diretamente o cliente' },
    facilidade_fix:   { weight: 15, desc: 'Facilidade de eliminar (inverso da dificuldade)' },
    rapido_resultado: { weight: 10, desc: 'Resultado visível em < 30 dias' },
  },

  // Nível de maturidade operacional
  maturity_levels: {
    1: { label: 'Caótico',          desc: 'Tudo no improviso. Dependente de pessoas-chave. Alto retrabalho.' },
    2: { label: 'Reativo',          desc: 'Processos existem mas não estão documentados. Resolvem problemas no apagar de incêndio.' },
    3: { label: 'Definido',         desc: 'Processos mapeados e padronizados. Times treinados. Indicadores básicos.' },
    4: { label: 'Gerenciado',       desc: 'Métricas ativas. Desvios identificados rapidamente. Melhoria sistemática.' },
    5: { label: 'Otimizado',        desc: 'Cultura de melhoria contínua. Automação inteligente. Benchmark do setor.' },
  },

  // Automações mais comuns por setor
  common_automations: [
    { processo: 'Cadastro de leads/clientes',  ferramenta: 'n8n + Google Sheets/CRM', roi_h_mes: 10, complexidade: 'Baixa' },
    { processo: 'Follow-up automático',         ferramenta: 'n8n + WhatsApp API',      roi_h_mes: 8,  complexidade: 'Baixa' },
    { processo: 'Relatório semanal',            ferramenta: 'n8n + Google Sheets',     roi_h_mes: 6,  complexidade: 'Baixa' },
    { processo: 'Aprovação de documentos',      ferramenta: 'n8n + Email',             roi_h_mes: 12, complexidade: 'Media' },
    { processo: 'Onboarding de cliente',        ferramenta: 'n8n + Notion/Drive',      roi_h_mes: 15, complexidade: 'Media' },
    { processo: 'Emissão de nota fiscal',       ferramenta: 'n8n + API fiscal',        roi_h_mes: 8,  complexidade: 'Media' },
    { processo: 'Cobrança e régua de pagamento',ferramenta: 'n8n + WhatsApp/Email',    roi_h_mes: 10, complexidade: 'Media' },
    { processo: 'Pesquisa de satisfação (NPS)', ferramenta: 'n8n + Typeform/Email',    roi_h_mes: 4,  complexidade: 'Baixa' },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
