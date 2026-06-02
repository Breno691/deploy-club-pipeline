// SEO Agent — config
const CONFIG = {
  agent: {
    name:    'SEO Agent',
    version: '1.0.0',
    role:    'Especialista Sênior em SEO Estratégico',
    mission: 'Transformar dados orgânicos em crescimento real de tráfego, posicionamento e conversões',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', site: 'smartopsIA.com.br', location: 'Belo Horizonte, MG' },

  // KPIs baseline orgânicos
  baseline: {
    cliques_semana:   30,
    impressoes_semana: 2000,
    ctr_pct:           1.8,
    posicao_media:     28,
    sessoes_organicas_mes: 400,
    conversoes_organicas_mes: 4,
  },

  // Metas de crescimento orgânico trimestral
  targets: {
    cliques_delta_pct:     30,
    impressoes_delta_pct:  40,
    ctr_meta_pct:          3.5,
    posicao_meta:          12,
    sessoes_meta_mes:      800,
    conversoes_meta_mes:   12,
  },

  // Thresholds de posição para oportunidade
  position_thresholds: {
    TOP_3:     { max: 3,  label: 'Alta visibilidade',   action: 'Manter e defender' },
    TOP_10:    { max: 10, label: 'Primeira página',     action: 'Otimizar CTR' },
    TOP_20:    { max: 20, label: 'Quase na 1ª página',  action: 'Otimizar conteúdo — alto potencial' },
    TOP_50:    { max: 50, label: 'Precisa reforço',     action: 'Criar conteúdo e links internos' },
    ABOVE_50:  { max: 999, label: 'Baixa relevância',  action: 'Revisão completa ou novo conteúdo' },
  },

  // Intenção de busca
  search_intent: {
    INFORMACIONAL:  { desc: 'Quer aprender',      content: ['guia', 'tutorial', 'FAQ', 'checklist'] },
    COMERCIAL:      { desc: 'Comparando soluções', content: ['comparativo', 'review', 'lista melhores'] },
    TRANSACIONAL:   { desc: 'Pronto para comprar', content: ['landing page', 'serviço', 'orçamento'] },
    NAVEGACIONAL:   { desc: 'Procura marca',       content: ['institucional', 'suporte', 'marca'] },
  },

  // Score de SEO (0-100)
  score_weights: {
    tecnico:        20,
    conteudo:       20,
    keywords:       20,
    search_console: 15,
    linkagem:       10,
    autoridade:     10,
    conversao:       5,
  },

  health_labels: {
    EXCELENTE: { min: 90, label: 'Excelente', color: 'verde'   },
    BOM:       { min: 75, label: 'Bom',       color: 'azul'    },
    ATENCAO:   { min: 60, label: 'Atenção',   color: 'amarelo' },
    CRITICO:   { min: 40, label: 'Crítico',   color: 'laranja' },
    EMERGENCIA:{ min: 0,  label: 'Emergência',color: 'vermelho'},
  },

  // Keywords estratégicas SmartOps
  strategic_keywords: [
    { kw: 'consultoria lean bh',                intent: 'TRANSACIONAL', priority: 10 },
    { kw: 'consultoria lean seis sigma belo horizonte', intent: 'TRANSACIONAL', priority: 10 },
    { kw: 'automação de processos pme',         intent: 'COMERCIAL',    priority: 9  },
    { kw: 'implementar lean empresa',           intent: 'INFORMACIONAL',priority: 8  },
    { kw: 'reduzir desperdício produção',       intent: 'INFORMACIONAL',priority: 8  },
    { kw: 'consultoria ia para pequenas empresas', intent: 'COMERCIAL', priority: 9  },
    { kw: 'n8n automação pequena empresa',      intent: 'INFORMACIONAL',priority: 7  },
    { kw: 'como eliminar retrabalho empresa',   intent: 'INFORMACIONAL',priority: 7  },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
