// Lead Scoring Agent — config
const CONFIG = {
  agent: {
    name: 'Lead Scoring Agent',
    version: '1.0.0',
    role: 'Especialista em Qualificação e Priorização de Leads por BANT + ICP',
    mission: 'Garantir que Breno gaste tempo apenas com leads com real potencial de fechamento',
    mantra: 'Tempo é o recurso mais escasso. Priorize quem vai comprar, não quem vai duvidar.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  icp: {
    segmentos:   ['Indústria', 'Serviços', 'Saúde', 'Construção', 'Distribuição', 'Varejo'],
    funcionarios: { min: 5, max: 200 },
    faturamento_min_brl: 500000,
    localizacao: ['Belo Horizonte', 'RMBH', 'Minas Gerais'],
    dores: ['retrabalho alto', 'processo no improviso', 'dependência de pessoas-chave', 'sem indicadores', 'crescimento travado', 'custo operacional alto'],
    perfil_decisor: ['Sócio', 'Dono', 'Diretor', 'Gerente Geral', 'Gerente de Operações'],
  },

  bant: {
    budget: {
      peso: 30,
      criterios: {
        alto:   { score: 30, desc: 'Tem orçamento definido e aprovado > R$5.000' },
        medio:  { score: 20, desc: 'Tem orçamento mas incerto ou < R$5.000' },
        baixo:  { score: 10, desc: 'Sem orçamento definido mas interesse claro' },
        nenhum: { score: 0,  desc: 'Sem orçamento ou recusou falar sobre' },
      },
    },
    authority: {
      peso: 25,
      criterios: {
        decisor:    { score: 25, desc: 'É o dono ou decisor final' },
        influencer: { score: 15, desc: 'Influencia mas não decide sozinho' },
        usuario:    { score: 5,  desc: 'Usuário final sem poder de compra' },
        desconhecido: { score: 0, desc: 'Papel não identificado' },
      },
    },
    need: {
      peso: 30,
      criterios: {
        critico:   { score: 30, desc: 'Dor urgente com impacto financeiro claro e mensurável' },
        alto:      { score: 22, desc: 'Dor clara mas sem urgência imediata' },
        medio:     { score: 12, desc: 'Interesse mas sem dor específica identificada' },
        exploração: { score: 5, desc: 'Apenas curiosidade ou benchmarking' },
      },
    },
    timeline: {
      peso: 15,
      criterios: {
        imediato:   { score: 15, desc: 'Quer iniciar em até 30 dias' },
        curto:      { score: 10, desc: 'Quer iniciar em 30-90 dias' },
        medio:      { score: 5,  desc: '90-180 dias' },
        indefinido: { score: 0,  desc: 'Sem prazo ou > 6 meses' },
      },
    },
  },

  thresholds: {
    A: { min: 80, label: 'Lead A — Quente', acao: 'Ligar em < 1h. Proposta em < 24h.' },
    B: { min: 60, label: 'Lead B — Morno', acao: 'Follow-up em 24h. Nutrir com case + proposta em 7 dias.' },
    C: { min: 40, label: 'Lead C — Frio', acao: 'Sequência de nurture. Reavaliar em 30 dias.' },
    D: { min: 0,  label: 'Lead D — Desqualificado', acao: 'Arquivar. Retornar em 90 dias se perfil mudar.' },
  },

  nurture_sequences: {
    B: ['Enviar case de sucesso do setor', 'Mandar diagnóstico de 1 desperdício por WhatsApp', 'Convidar para live ou conteúdo', 'Proposta simplificada'],
    C: ['Adicionar em lista de conteúdo', 'Mandar artigo relevante mensalmente', 'Reavaliar BANT em 30 dias'],
  },

  disqualifiers: [
    'Microempresa < R$500k faturamento', 'Fora de MG', 'Sem dor operacional identificável',
    'Decisor inacessível', 'Concorrente', 'Sem orçamento em < 90 dias',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
