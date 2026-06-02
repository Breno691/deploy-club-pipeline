// Competitor Intelligence Agent — config

const CONFIG = {
  agent: {
    name:    'Competitor Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Inteligência Competitiva',
    mission: 'Monitorar concorrentes e descobrir oportunidades para a SmartOps vencer em posicionamento, conteúdo, anúncios, SEO, ofertas e autoridade',
  },

  company: {
    name:        'SmartOps IA',
    owner:       'Breno Luiz',
    location:    'Belo Horizonte, MG',
    positioning: 'Consultoria de melhoria contínua e automação com IA para PMEs de BH e região',
    instagram:   '@smartopsIA',
    services:    ['Lean Six Sigma', 'Melhoria Contínua', 'Automação n8n', 'IA para PMEs', 'Redução de custos', 'Diagnóstico operacional'],
  },

  // Tipos de concorrentes
  competitor_types: {
    direct:   'Consultoria Lean/Six Sigma/Processos/Automação',
    indirect: 'Agências de automação, ERPs, consultorias de gestão, software houses',
    local:    'Atua em BH e região metropolitana',
    attention:'Criadores sobre IA, produtividade, empreendedorismo',
  },

  // Concorrentes conhecidos/suspeitos para mapear
  known_competitors: [
    { name: 'Consultores Lean locais BH',         type: 'direct',   channel: 'google,instagram', threat: 'alta'  },
    { name: 'Agências de automação BH',            type: 'indirect', channel: 'instagram,ads',    threat: 'média' },
    { name: 'Consultorias Six Sigma nacionais',    type: 'direct',   channel: 'seo,google',       threat: 'média' },
    { name: 'Freelancers n8n/automação',           type: 'indirect', channel: 'instagram,linkedin',threat: 'alta'  },
    { name: 'Criadores sobre IA (Instagram)',      type: 'attention',channel: 'instagram',         threat: 'média' },
    { name: 'Consultores de gestão BH',            type: 'indirect', channel: 'google',            threat: 'baixa' },
    { name: 'Software BPM (Sankhya, Totvs)',       type: 'indirect', channel: 'ads,seo',           threat: 'baixa' },
  ],

  // Termos de busca para monitoramento Google
  google_queries: [
    'consultoria lean belo horizonte',
    'consultoria six sigma BH',
    'consultoria melhoria contínua BH',
    'automação de processos BH',
    'consultoria processos Belo Horizonte',
    'lean six sigma para pequenas empresas',
    'automação n8n empresas',
    'IA para PMEs BH',
    'consultoria redução de custos BH',
    'consultoria operacional BH',
    'melhoria de processos empresa BH',
    'eliminar retrabalho empresa',
  ],

  // Keywords SEO para monitorar
  seo_keywords: [
    { kw: 'consultoria lean belo horizonte',         intent: 'commercial', difficulty: 'baixa',  priority: 'alta'  },
    { kw: 'consultoria six sigma BH',                intent: 'commercial', difficulty: 'baixa',  priority: 'alta'  },
    { kw: 'automação de processos belo horizonte',   intent: 'commercial', difficulty: 'baixa',  priority: 'alta'  },
    { kw: 'melhoria contínua para pequenas empresas',intent: 'informational',difficulty: 'média', priority: 'alta'  },
    { kw: 'como reduzir retrabalho na empresa',      intent: 'informational',difficulty: 'baixa', priority: 'alta'  },
    { kw: 'lean manufacturing PME',                  intent: 'informational',difficulty: 'média', priority: 'média' },
    { kw: 'automação n8n para empresas',             intent: 'informational',difficulty: 'baixa', priority: 'alta'  },
    { kw: 'IA para pequenas empresas Brasil',        intent: 'informational',difficulty: 'baixa', priority: 'alta'  },
    { kw: 'diagnóstico operacional gratuito',        intent: 'commercial', difficulty: 'baixa',  priority: 'alta'  },
    { kw: 'consultoria processos belo horizonte',    intent: 'commercial', difficulty: 'baixa',  priority: 'alta'  },
  ],

  // Diferenciação SmartOps vs concorrentes
  differentiation: {
    vs_traditional_lean: [
      'Usa IA para diagnóstico — concorrentes usam só planilha',
      'Automatiza processos após mapeá-los — concorrentes param no mapeamento',
      'Cria dashboards automáticos — concorrentes entregam relatório PDF',
      'Acompanhamento por agentes inteligentes — concorrentes cobram hora adicional',
    ],
    vs_automation_agencies: [
      'Entende o processo antes de automatizar',
      'Não automatiza bagunça — primeiro organiza o fluxo',
      'Lean Six Sigma garante que a automação faça a coisa certa',
      'Foco em PMEs — agências focam em grandes empresas',
    ],
    vs_generic_consultants: [
      'Mais técnico — foco em Lean Six Sigma certificado',
      'Mais mensurável — ROI calculado por projeto',
      'Mais operacional — entrega mudança real, não relatório',
      'Usa tecnologia — IA + n8n + dashboards',
    ],
    positioning_message: 'SmartOps une o rigor do Lean Six Sigma com a velocidade da automação e IA — para PMEs que querem resultado, não só diagnóstico.',
  },

  // Opportunity scoring
  opportunity_scoring: {
    pain_market:     20, // dor clara no mercado
    clear_gap:       20, // gap não coberto pelos concorrentes
    smartops_fit:    20, // fit com as competências da SmartOps
    low_competition: 15, // baixa ou nenhuma concorrência
    revenue_potential: 15, // potencial de gerar receita
    ease_execution:  10, // facilidade de execução
  },

  opportunity_levels: {
    85: { label: 'ATACAR IMEDIATAMENTE', color: '🔴' },
    70: { label: 'CRIAR TESTE',          color: '🟠' },
    50: { label: 'MONITORAR',            color: '🟡' },
    0:  { label: 'IGNORAR',              color: '⚫' },
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
