// Orchestrator Agent — config
const CONFIG = {
  agent: {
    name: 'Orchestrator Agent',
    version: '1.0.0',
    role: 'Diretor de Orquestração — Coordena todos os agentes e pipelines da SmartOps IA',
    mission: 'Garantir que o sistema de agentes opere de forma coordenada, priorizada e orientada por resultado',
    mantra: 'O orquestrador não executa. Ele garante que o sistema certo execute na hora certa.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  content_pipeline: {
    frequencia: '3x/semana — Terça, Quinta, Sábado',
    etapas: ['Research', 'Copywriter', 'Design', 'Video', 'Distribution'],
    trigger: 'POST /run-pipeline com { taskName, taskDate, skipPost }',
    server: 'https://n8n-pipeline-server.sumjyb.easypanel.host',
    aprovacao: 'Telegram Bot — botões ✅ Aprovar / ❌ Rejeitar',
  },

  squads: {
    marketing:  ['Copywriter', 'Design', 'Distribution', 'Marketing Research', 'SEO', 'Video Ad', 'Remotion Video'],
    growth:     ['CRO', 'Customer Journey', 'Revenue', 'Ads', 'Website Analytics'],
    operations: ['Lean', 'Six Sigma', 'Kaizen', 'Process Mining', 'Automation'],
    sales:      ['Sales Intelligence', 'Proposal', 'Offer Optimization', 'Pricing'],
    executive:  ['Executive Dashboard', 'Competitor Intelligence', 'Strategic Planning', 'CEO Advisor', 'Chief of Staff'],
    knowledge:  ['Knowledge Management', 'Case Study', 'Productization'],
    cs:         ['Client Success', 'Risk'],
    finance:    ['Financial Intelligence', 'Revenue Intelligence'],
    brand:      ['Personal Brand', 'Authority Building', 'Partnership'],
    ai_lab:     ['AI Lab', 'AI Automation', 'Experimentation'],
  },

  daily_routines: [
    { hora: '05:00', agentes: ['Ads', 'Website Analytics'], squad: 'growth' },
    { hora: '05:30', agentes: ['SEO', 'Process Mining'], squad: 'operations+marketing' },
    { hora: '06:00', agentes: ['Lead Scoring', 'CRO', 'Financial', 'Lean', 'Six Sigma'], squad: 'mixed' },
    { hora: '06:30', agentes: ['Competitor Intel', 'Risk'], squad: 'executive+cs' },
    { hora: '07:00', agentes: ['Research Trends', 'Copywriter', 'Personal Brand', 'Sales Intel'], squad: 'marketing+brand+sales' },
    { hora: '07:30', agentes: ['Content Performance', 'Exec Dashboard'], squad: 'marketing+executive' },
    { hora: '08:00', agentes: ['Proposal', 'Offer Optimization', 'Client Success', 'Relationship Coach'], squad: 'sales+cs' },
    { hora: '08:30', agentes: ['Kaizen', 'Chief of Staff', 'Strategic Planning', 'Automation', 'Consulting Builder', 'Lean Consulting'], squad: 'ops+executive' },
    { hora: '09:00', agentes: ['Revenue'], squad: 'growth' },
    { hora: '09:30', agentes: ['CEO Advisor'], squad: 'executive', consolidador: true },
  ],

  priority_matrix: {
    quadrant1: { label: 'Urgente + Importante', acao: 'Executar imediatamente' },
    quadrant2: { label: 'Não Urgente + Importante', acao: 'Planejar e agendar' },
    quadrant3: { label: 'Urgente + Não Importante', acao: 'Delegar ou automatizar' },
    quadrant4: { label: 'Não Urgente + Não Importante', acao: 'Eliminar' },
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
