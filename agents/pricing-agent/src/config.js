// Pricing Agent — config
const CONFIG = {
  agent: {
    name:    'Pricing Agent',
    version: '1.0.0',
    role:    'Especialista em Estratégia de Precificação e Valor Percebido',
    mission: 'Maximizar receita e margem através de precificação estratégica baseada em valor',
    mantra:  'O preço é a mensagem. Preço certo = cliente certo + margem certa.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Serviços atuais com estrutura de custos
  services: {
    diagnostico_express: {
      name:         'Diagnóstico Express',
      preco_atual:  997,
      custo_direto: 200,
      horas:        8,
      entregaveis:  ['Relatório de gargalos', 'Top 5 melhorias', 'Plano de ação 30 dias'],
      valor_gerado_min: 10000,
      publico:      'PME com dor clara e orçamento limitado',
    },
    mapa_gargalos: {
      name:         'Mapa de Gargalos',
      preco_atual:  2500,
      custo_direto: 500,
      horas:        20,
      entregaveis:  ['VSM completo', 'Diagnóstico DMAIC', 'Plano 90 dias', '2 sessões de acompanhamento'],
      valor_gerado_min: 25000,
      publico:      'PME querendo implementar Lean',
    },
    smartops_monthly: {
      name:         'SmartOps Monthly',
      preco_atual:  3500,
      custo_direto: 700,
      horas:        40,
      entregaveis:  ['4 reuniões mensais', 'Análise contínua', 'Relatórios semanais', 'Acesso ao sistema IA'],
      valor_gerado_min: 50000,
      publico:      'PME querendo parceiro de melhoria contínua',
      tipo:         'recorrente',
    },
    sprint_automacao: {
      name:         'Sprint Automação n8n',
      preco_atual:  6500,
      custo_direto: 1200,
      horas:        60,
      entregaveis:  ['3 automações completas', 'Documentação', '30 dias suporte', 'Treinamento equipe'],
      valor_gerado_min: 50000,
      publico:      'PME com processos repetitivos críticos',
    },
    lean_ai_sprint: {
      name:         'Lean AI Sprint',
      preco_atual:  10000,
      custo_direto: 2000,
      horas:        80,
      entregaveis:  ['VSM + automações + IA', 'Sistema completo', '90 dias suporte', 'Time treinado'],
      valor_gerado_min: 150000,
      publico:      'PME querendo transformação completa',
    },
  },

  // Ancoragem de preço — estratégia
  anchoring: {
    decoy_effect:    { desc: 'Coloque um pacote "herói" no meio para tornar o premium mais atraente' },
    charm_pricing:   { desc: 'R$ 997 converte mais que R$ 1.000 — o 7/9 faz diferença' },
    bundle_discount: { desc: 'Pacote anual com 20% desconto aumenta LTV e reduz churn' },
    add_on:          { desc: 'Itens adicionais de alto valor percebido a baixo custo marginal' },
  },

  // Concorrentes (preços estimados de mercado BH)
  competitors: {
    consultores_lean_tradicionais: { preco_min: 1500, preco_max: 8000, diferencial: 'Experiência, mas sem IA' },
    agencias_automacao:            { preco_min: 3000, preco_max: 15000, diferencial: 'Automação, mas sem Lean' },
    freelancers_n8n:               { preco_min: 500,  preco_max: 3000, diferencial: 'Barato, sem estratégia' },
    consultorias_gestao:           { preco_min: 5000, preco_max: 50000, diferencial: 'Generalistas, alto custo' },
  },

  // Modelos de precificação disponíveis
  pricing_models: {
    cost_plus:    { desc: 'Custo + margem desejada', formula: 'preco = custo / (1 - margem_pct)', uso: 'Piso de preço' },
    value_based:  { desc: 'Percentual do valor gerado ao cliente', formula: 'preco = valor_gerado × capture_rate', uso: 'Teto de preço' },
    competitive:  { desc: 'Posicionamento em relação à concorrência', formula: 'preco = competidor × (1 ± diferencial)', uso: 'Referência de mercado' },
    hourly:       { desc: 'Hora trabalhada × taxa', formula: 'preco = horas × taxa_hora', uso: 'Projetos indefinidos' },
    retainer:     { desc: 'Mensalidade fixa por capacidade disponível', formula: 'preco_mes = capacidade × taxa', uso: 'Clientes recorrentes' },
  },

  // Taxa hora recomendada SmartOps
  taxa_hora: { min: 150, ideal: 250, premium: 400 },

  // Capture rate (% do valor gerado que você cobra)
  capture_rate: { conservador: 0.05, ideal: 0.10, agressivo: 0.15 },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
