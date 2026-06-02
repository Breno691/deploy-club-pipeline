// Marketing Research Agent — Enterprise Config v2.0.0
const CONFIG = {
  agent: {
    name:    'Marketing Research Agent Enterprise',
    version: '2.0.0-enterprise',
    role:    'Área de Market Intelligence — Pesquisa, Validação e Inteligência Estratégica',
    mission: 'Transformar informações de mercado em decisões práticas para marketing, vendas, produto e consultoria',
    mantra:  'Nunca achismo. Sempre evidência.',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    location: 'Belo Horizonte, MG',
    sector:   'consultoria Lean + Automação IA',
  },

  // Concorrentes a monitorar
  competitors: [
    { name: 'Consultoria Lean BH genérica',  type: 'direto',    segment: 'Lean tradicional' },
    { name: 'Agências de automação n8n',      type: 'direto',    segment: 'Automação digital' },
    { name: 'Big 4 para PMEs',               type: 'indireto',  segment: 'Consultoria estratégica' },
    { name: 'Freelancers IA',                type: 'indireto',  segment: 'IA para pequenas empresas' },
  ],

  // Público-alvo SmartOps
  target_audience: {
    primary:    'Dono/gestor de PME industrial ou de serviços em BH, 30-55 anos, com 10-200 funcionários',
    pain:       'Processos manuais, retrabalho, desperdício, difícil de escalar sem contratar mais',
    desire:     'Eficiência, mais resultado com menos esforço, tecnologia acessível',
    objections: ['caro', 'não vejo ROI claro', 'minha empresa é pequena', 'não tenho tempo pra implementar'],
    channels:   ['LinkedIn', 'Google (busca)', 'Indicação', 'Instagram'],
  },

  // Setores que a SmartOps pode atender
  sectors: [
    'Autoescolas', 'Clínicas', 'Pet shops', 'Salões de beleza', 'Barbearias',
    'Restaurantes', 'Lojas de material de construção', 'Escritórios contábeis',
    'Imobiliárias', 'Academias', 'Escolas', 'Consultórios', 'E-commerces',
    'Pequenas indústrias', 'Prestadores de serviço', 'Comércios locais',
  ],

  // Agentes de handoff
  handoff_agents: [
    'SEO Agent', 'Ads Agent', 'Content Agent', 'Sales Agent',
    'Lean Agent', 'Automation Agent', 'Pricing Agent', 'Copywriter Agent',
  ],

  // Classificação de qualidade de fonte (A/B/C/D)
  source_quality: {
    A: 'Alta confiança — dados originais, instituição confiável, metodologia clara, recente e verificável',
    B: 'Boa confiança — blog especializado, análise bem estruturada, dados citados, empresa reconhecida',
    C: 'Média confiança — conteúdo útil sem metodologia clara, opinião de especialista, possível viés comercial',
    D: 'Baixa confiança — post isolado, sem fonte, viral sem evidência, informação antiga ou promocional',
  },

  // Tipos de informação
  information_types: ['Fato', 'Sinal', 'Tendência', 'Hipótese', 'Opinião', 'Ruído'],

  // Níveis de risco
  risk_levels: {
    low:    'Conteúdo, post, small test — pode recomendar execução',
    medium: 'Oferta, campanha, posicionamento — recomendar teste antes de escalar',
    high:   'Novo mercado, investimento alto, mudança de posicionamento — validação robusta',
  },

  // Comportamentos proibidos
  forbidden_behaviors: [
    'Inventar fontes ou estatísticas',
    'Apresentar opinião como fato',
    'Usar uma única fonte como prova definitiva',
    'Ignorar a data da informação',
    'Ignorar região ou contexto',
    'Confundir tendência com modinha',
    'Prometer sucesso de mercado',
    'Criar conclusão forte com evidência fraca',
  ],

  // Score de oportunidade (0-100)
  opportunity_weights: {
    demanda_aparente:        20,
    crescimento_do_tema:     15,
    dor_do_publico:          20,
    potencial_comercial:     20,
    concorrencia_controlavel:10,
    facilidade_execucao:     10,
    aderencia_negocio:        5,
  },

  // Score de confiança da pesquisa (0-100)
  confidence_weights: {
    quantidade_fontes:     15,
    qualidade_fontes:      25,
    recencia:              15,
    consistencia_fontes:   20,
    especificidade_nicho:  10,
    aplicabilidade:        10,
    baixo_vies:             5,
  },

  // Queries padrão para Tavily
  tavily_queries: [
    'consultoria lean six sigma pequenas empresas Brasil 2026',
    'automação n8n PME casos de sucesso 2026',
    'tendências IA para gestão empresarial 2026',
    'mercado consultoria operacional Belo Horizonte',
    'como reduzir desperdício produção tendências',
    'automação processos manuais PME ROI',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
