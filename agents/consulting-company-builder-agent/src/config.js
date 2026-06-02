// Consulting Company Builder Agent — config
const CONFIG = {
  agent: {
    name:    'Consulting Company Builder Agent',
    version: '1.0.0',
    role:    'Sócio Estratégico e Consultor Sênior para estruturar empresas de consultoria',
    mission: 'Transformar uma consultoria em operação organizada, confiável, profissional e escalável',
    mantra:  'Primeiro diagnosticar, depois organizar, depois executar, depois medir, depois escalar.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Metodologia OPEX — método próprio da SmartOps
  methodology: {
    nome: 'Método OPEX',
    descricao: 'Organização, Processos, Execução e Expansão',
    fases: {
      O: { nome: 'Organização', objetivo: 'Entender a empresa e organizar prioridades', entregaveis: ['Diagnóstico', 'Score de maturidade', 'Mapa de problemas', 'Plano inicial'] },
      P: { nome: 'Processos',   objetivo: 'Mapear e padronizar processos',            entregaveis: ['SIPOC', 'Fluxograma', 'POP', 'Checklist', 'RACI'] },
      E: { nome: 'Execução',    objetivo: 'Implantar melhorias',                       entregaveis: ['Plano 5W2H', 'Kaizens', 'Treinamentos', 'Indicadores', 'Gestão visual'] },
      X: { nome: 'Expansão',    objetivo: 'Automatizar, medir e escalar',             entregaveis: ['Automações', 'Dashboards', 'Relatórios', 'Rotina de gestão', 'Melhoria contínua'] },
    },
  },

  // Pacotes de consultoria
  packages: {
    diagnostico_express: {
      nome:      'Diagnóstico Express',
      objetivo:  'Entender a situação atual da empresa',
      duracao:   '7 a 15 dias',
      entregaveis: ['Relatório diagnóstico', 'Mapa de oportunidades', 'Score de maturidade', 'Plano 5W2H inicial'],
      preco_min: 997,
      preco_max: 2500,
    },
    organizacao_processos: {
      nome:      'Organização de Processos',
      objetivo:  'Mapear, documentar e melhorar processos',
      duracao:   '30 a 60 dias',
      entregaveis: ['SIPOC', 'Fluxogramas', 'POPs', 'Checklists', 'RACI', 'Indicadores'],
      preco_min: 3000,
      preco_max: 8000,
    },
    lean_melhoria: {
      nome:      'Lean e Melhoria Contínua',
      objetivo:  'Eliminar desperdícios e criar cultura de melhoria',
      duracao:   '60 a 90 dias',
      entregaveis: ['Diagnóstico Lean', '8 desperdícios mapeados', 'Kaizens', 'PDCA', 'Gestão visual', 'KPIs'],
      preco_min: 5000,
      preco_max: 15000,
    },
    automacao: {
      nome:      'Automação de Processos',
      objetivo:  'Reduzir trabalho manual e erro operacional',
      duracao:   '30 a 90 dias',
      entregaveis: ['Mapa de automações', 'Priorização', 'Fluxos automáticos', 'Implantação no-code', 'Treinamento'],
      preco_min: 4000,
      preco_max: 10000,
    },
    transformacao_premium: {
      nome:      'Transformação Operacional Premium',
      objetivo:  'Transformação completa do negócio',
      duracao:   '90 a 180 dias',
      entregaveis: ['Diagnóstico', 'Processos', 'Lean', 'POPs', 'KPIs', 'Dashboards', 'Automações', 'Treinamentos', 'Relatórios mensais'],
      preco_min: 15000,
      preco_max: 50000,
    },
  },

  // Processo comercial
  sales_process: {
    etapas: ['Captação', 'Qualificação', 'Reunião Diagnóstica', 'Proposta', 'Follow-up', 'Fechamento'],
    perguntas_diagnostico: [
      'Qual processo mais trava hoje?',
      'Onde existe mais retrabalho?',
      'O que mais consome tempo da equipe?',
      'Onde o cliente sente mais impacto?',
      'Quais indicadores vocês acompanham?',
      'O que acontece se nada mudar?',
      'Qual seria um bom resultado em 90 dias?',
    ],
  },

  // Indicadores internos da consultoria
  kpis: {
    comercial:   ['Leads gerados', 'Reuniões marcadas', 'Taxa de fechamento', 'Ticket médio', 'Ciclo de venda', 'Receita recorrente'],
    operacional: ['Projetos ativos', 'Entregas no prazo', 'Horas por projeto', 'Margem por cliente', 'Retrabalho interno', 'NPS'],
    financeiro:  ['Receita mensal', 'Custos', 'Margem', 'Inadimplência', 'Previsão de caixa', 'Receita por serviço'],
  },

  // Documentos essenciais
  essential_docs: {
    comerciais:  ['Apresentação institucional', 'One page', 'Proposta comercial', 'Contrato', 'Briefing inicial', 'Questionário diagnóstico'],
    operacionais: ['Checklist kickoff', 'Ata de reunião', 'Plano de ação 5W2H', 'Cronograma', 'Relatório semanal', 'Dashboard', 'POP', 'RACI'],
    estrategicos: ['Metodologia OPEX', 'Matriz de maturidade', 'Matriz impacto × esforço', 'Plano de crescimento'],
  },

  // Automações internas da consultoria
  internal_automations: [
    'Cadastro de lead no CRM', 'Envio de briefing', 'Criação de pasta do cliente',
    'Lembrete de reunião', 'Follow-up comercial', 'Coleta de documentos',
    'Relatório semanal automático', 'Cobrança', 'Pesquisa de satisfação (NPS)', 'Pedido de depoimento',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
