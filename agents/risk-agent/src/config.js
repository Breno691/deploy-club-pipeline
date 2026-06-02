// Risk Agent — config
const CONFIG = {
  agent: { name: 'Risk Agent', version: '1.0.0',
    role: 'Monitor de Riscos Operacionais e Preventivos',
    mission: 'Detectar riscos antes que virem problemas e agir preventivamente',
    mantra: 'Risco identificado hoje é crise evitada amanhã.' },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', location: 'BH, MG' },

  // Categorias de risco
  risk_categories: {
    FINANCEIRO:   { icon: '💰', examples: ['receita abaixo da meta', 'caixa < 60 dias', 'inadimplência'] },
    CLIENTE:      { icon: '🤝', examples: ['cliente insatisfeito', 'projeto atrasado', 'churn iminente'] },
    OPERACIONAL:  { icon: '⚙️', examples: ['workflow falhando', 'automação parada', 'entrega atrasada'] },
    REPUTACAO:    { icon: '⭐', examples: ['reclamação pública', 'review negativo', 'promessa não cumprida'] },
    ESTRATEGICO:  { icon: '🎯', examples: ['concorrente novo', 'mudança de mercado', 'dependência de ferramenta'] },
    TECNOLOGIA:   { icon: '🔧', examples: ['API fora do ar', 'dados perdidos', 'segurança comprometida'] },
  },

  // Matriz de risco (probabilidade × impacto)
  risk_matrix: {
    CRITICO:  { prob_min: 7, impact_min: 7, label: 'Crítico',  action: 'Agir agora — < 24h', color: 'vermelho' },
    ALTO:     { prob_min: 5, impact_min: 7, label: 'Alto',     action: 'Plano em 48h',       color: 'laranja' },
    MEDIO:    { prob_min: 3, impact_min: 5, label: 'Médio',    action: 'Monitorar semanal',  color: 'amarelo' },
    BAIXO:    { prob_min: 0, impact_min: 0, label: 'Baixo',    action: 'Log e revisar mensal',color: 'verde'  },
  },

  // Alertas automáticos por threshold
  auto_alerts: [
    { name: 'pipeline_vazio',        condition: 'pipeline_valor === 0',          severity: 'CRITICO' },
    { name: 'cliente_sem_contato',   condition: 'dias_sem_contato > 14',         severity: 'ALTO' },
    { name: 'entrega_atrasada',      condition: 'dias_atraso > 7',               severity: 'ALTO' },
    { name: 'workflow_falhando',     condition: 'falhas_24h >= 3',               severity: 'MEDIO' },
    { name: 'receita_abaixo_50pct',  condition: 'receita < meta * 0.5',          severity: 'CRITICO' },
    { name: 'caixa_baixo',           condition: 'runway_dias < 60',              severity: 'CRITICO' },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};
module.exports = { CONFIG };
