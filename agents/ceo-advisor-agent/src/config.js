// CEO Advisor Agent — config
const CONFIG = {
  agent: {
    name:    'CEO Advisor Agent',
    version: '1.0.0',
    role:    'Conselheiro Estratégico e Decisor Central da SmartOps IA',
    mission: 'Consolidar insights de todos os agentes, priorizar por ROI e gerar o plano de ação do dia',
    mantra:  'Foco no que move a agulha. Tudo o mais é ruído.',
  },

  company: {
    name:     'SmartOps IA',
    owner:    'Breno Luiz',
    role:     'Black Belt Lean Six Sigma + Fundador',
    location: 'Belo Horizonte, MG',
    stage:    'pré-receita → primeiros clientes',
  },

  // Metas atuais SmartOps
  goals: {
    receita_meta_mes:     15000,   // R$/mês meta
    clientes_meta:        3,
    reunioes_meta_semana: 3,
    leads_meta_semana:    10,
    taxa_fechamento_meta: 0.25,
    runway_min_dias:      60,
  },

  // KPIs monitorados diariamente
  daily_kpis: [
    'leads_novos', 'reunioes_agendadas', 'propostas_enviadas',
    'clientes_ativos', 'receita_mes', 'cac', 'pipeline_valor',
    'posts_publicados', 'seguidores', 'sessoes_site', 'conversao_site',
    'automacoes_rodando', 'falhas_workflows', 'horas_liberadas_automacao',
  ],

  // Quadrante de priorização (Urgente × Impacto)
  priority_matrix: {
    Q1: { urgent: true,  impact: true,  label: 'FAZER AGORA',     color: 'vermelho' },
    Q2: { urgent: false, impact: true,  label: 'AGENDAR',         color: 'azul'     },
    Q3: { urgent: true,  impact: false, label: 'DELEGAR',         color: 'amarelo'  },
    Q4: { urgent: false, impact: false, label: 'ELIMINAR',        color: 'cinza'    },
  },

  // Agentes do sistema que o CEO Advisor consolida
  agent_squads: {
    marketing:   ['copywriter', 'design', 'distribution', 'seo', 'ads', 'marketing_research', 'video_ad'],
    growth:      ['cro', 'revenue', 'experimentation', 'website_analytics'],
    operations:  ['lean', 'six_sigma', 'kaizen', 'process_mining', 'ai_automation'],
    sales:       ['sales_intelligence', 'proposal', 'offer_optimization', 'pricing'],
    executive:   ['executive_dashboard', 'competitor_intel', 'strategic_planning', 'chief_of_staff'],
    knowledge:   ['knowledge_management', 'case_study', 'productization'],
    client:      ['client_success', 'risk'],
    finance:     ['financial_intelligence'],
    brand:       ['personal_brand', 'authority_building', 'partnership'],
  },

  // Alertas que requerem decisão CEO
  ceo_alerts: [
    { type: 'pipeline_vazio',     threshold: 0,       urgency: 'CRITICO', action: 'Prospecção ativa hoje' },
    { type: 'sem_reuniao_semana', threshold: 0,       urgency: 'ALTO',    action: 'Enviar 10 mensagens prospecção agora' },
    { type: 'cpa_alto',           threshold: 1000,    urgency: 'ALTO',    action: 'Pausar ads e revisar landing page' },
    { type: 'workflow_falha',     threshold: 3,       urgency: 'MEDIO',   action: 'Corrigir automação antes de produção' },
    { type: 'receita_abaixo_meta',threshold: 0.5,     urgency: 'CRITICO', action: 'Revisão urgente de pipeline e oferta' },
    { type: 'cliente_em_risco',   threshold: 1,       urgency: 'ALTO',    action: 'Ligar para cliente hoje' },
  ],

  // Decisões recorrentes que o CEO precisa tomar
  recurring_decisions: [
    'Aprovar conteúdo da semana (segunda-feira)',
    'Revisar pipeline e priorizar leads quentes (segunda + quinta)',
    'Aprovar proposta comercial antes de enviar',
    'Revisar relatório financeiro semanal (sexta)',
    'Validar automações novas antes de ativar em produção',
    'Definir meta da semana seguinte (sexta)',
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
