// Case Study Intelligence Agent — config

const CONFIG = {
  agent: {
    name:    'Case Study Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Prova Social, Resultados e Case Studies',
    mission: 'Transformar cada projeto SmartOps em prova comercial confiável, mensurável e reutilizável',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    location: 'Belo Horizonte, MG',
  },

  // Setores atendidos (para classificação de cases)
  sectors: [
    'clinica', 'industria', 'varejo', 'servicos', 'logistica',
    'educacao', 'construcao', 'alimentacao', 'tecnologia', 'financeiro',
    'consultoria', 'ecommerce', 'saude', 'imobiliario', 'outro',
  ],

  // Tipos de case
  case_types: {
    completo:    'Case completo com cliente identificado',
    anonimo:     'Case anônimo (setor + resultado, sem nome)',
    micro:       'Micro case — resultado rápido e pontual',
    roi:         'Case de ROI — foco financeiro',
    processo:    'Case de processo — foco operacional',
    automacao:   'Case de automação — foco em horas economizadas',
  },

  // Níveis de permissão do cliente
  permission_levels: {
    0: { label: 'Uso Interno',               description: 'Apenas interno, nunca publicar' },
    1: { label: 'Case Anônimo',              description: 'Publicar sem nome ou dados identificáveis' },
    2: { label: 'Setor + Resultado',         description: 'Setor + resultado, sem nome da empresa' },
    3: { label: 'Nome sem Logo',             description: 'Nome do cliente sem logo' },
    4: { label: 'Nome + Logo + Depoimento',  description: 'Identificado completo' },
    5: { label: 'Case Público Completo',     description: 'Publicação irrestrita, site, anúncio, post' },
  },

  // Status do case
  statuses: [
    'identified',       // identificado, ainda não documentado
    'capturing',        // coleta em andamento
    'metrics_pending',  // aguardando métricas
    'roi_calculated',   // ROI calculado
    'permission_pending', // aguardando autorização do cliente
    'internal_only',    // uso interno apenas
    'anonymous_ready',  // pronto para publicar versão anônima
    'public_ready',     // pronto para publicar com identificação
    'published',        // publicado
    'repurposed',       // transformado em múltiplos ativos
    'used_in_sales',    // usado em venda/proposta
    'archived',         // arquivado
  ],

  // Frameworks de narrativa
  narrative_frameworks: {
    'problem-solution-result':  'Problema → Solução → Resultado',
    'before-after-bridge':      'Antes → Depois → Ponte (método SmartOps)',
    'cost-of-inaction':         'Custo de não agir → Transformação → Novo patamar',
    'roi-story':                'Investimento → Economia → Payback → ROI',
    'process-transformation':   'Fluxo antes → Gargalo → Intervenção → Fluxo depois',
  },

  // Ativos que cada case deve gerar
  repurposing_assets: [
    'pdf_case',         // PDF completo de case
    'post_linkedin',    // Post para LinkedIn
    'carousel_instagram', // Carrossel para Instagram
    'reel_script',      // Script de Reel
    'proposal_block',   // Bloco para proposta comercial
    'website_section',  // Seção do site
    'email_proof',      // Email de prova social
    'sales_slide',      // Slide comercial
    'objection_answer', // Resposta a objeção
  ],

  // Dores comuns (para mapear cases a leads)
  common_pains: [
    'retrabalho',      'processo lento',    'sem indicadores',
    'desperdicio',     'erro manual',       'atendimento lento',
    'falta de padrao', 'custo alto',        'producao baixa',
    'sem automacao',   'lead time alto',    'qualidade baixa',
    'satisfacao baixa','margem apertada',   'dependencia de pessoa',
  ],

  // Objeções comuns (para mapear cases a objeções)
  common_objections: [
    'caro demais',             'não vai funcionar aqui',
    'minha empresa é pequena', 'não tenho dados',
    'vai demorar muito',       'minha equipe não vai aceitar',
    'já tentamos antes',       'preciso pensar mais',
    'não tenho tempo',         'qual é o ROI real',
  ],

  // Thresholds de destaque de case
  highlights: {
    roi_min_destacado:           3.0,  // ROI > 3x vira case destaque
    reducao_min_percentual:     30,    // Redução > 30% vira case destaque
    economia_mensal_min:      1000,    // Economia > R$1.000/mês vira case
    horas_min_economizadas:      5,    // > 5h/semana economizadas vira case
    payback_max_meses:           6,    // Payback < 6 meses = case forte
  },

  // Custo-hora padrão para cálculo de ROI (quando não informado)
  default_cost_hour: 40,

  // Semanas de trabalho por mês
  weeks_per_month: 4,

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
