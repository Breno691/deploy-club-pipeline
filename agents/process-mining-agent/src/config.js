// Process Mining Agent — config
const CONFIG = {
  agent: {
    name: 'Process Mining Agent',
    version: '1.0.0',
    role: 'Especialista em Descoberta e Análise de Processos por Dados',
    mission: 'Revelar como os processos realmente acontecem (não como foram documentados) e identificar desvios',
    mantra: 'O processo real raramente é igual ao processo desenhado. Os dados revelam a verdade.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  event_log_fields: {
    obrigatorios: ['case_id', 'activity', 'timestamp'],
    opcionais:    ['resource', 'role', 'cost', 'duration', 'status', 'channel'],
  },

  discovery_algorithms: {
    alpha:    { desc: 'Simples, rápido, bom para fluxos lineares', limitacao: 'Não lida bem com loops e paralelismo' },
    heuristic: { desc: 'Robusto a ruído, mais prático', limitacao: 'Pode perder variantes raras' },
    inductive: { desc: 'Melhor para complexidade', limitacao: 'Mais lento, requer mais dados' },
  },

  conformance_types: {
    fitness:     { desc: 'O log se encaixa no modelo? (% casos conformes)', meta_min_pct: 80 },
    precision:   { desc: 'O modelo permite comportamentos que não estão no log?', meta_min_pct: 75 },
    generalization: { desc: 'O modelo funciona para novos casos?', meta_min_pct: 70 },
    simplicity:  { desc: 'O modelo é simples o suficiente para ser útil?', meta_min_pct: 65 },
  },

  bottleneck_indicators: [
    { nome: 'Waiting time alto', threshold_h: 4, impacto: 'Lead time inflado' },
    { nome: 'Resource utilization > 85%', threshold_pct: 85, impacto: 'Gargalo humano' },
    { nome: 'Rework rate > 10%', threshold_pct: 10, impacto: 'Defeito ou handover ruim' },
    { nome: 'Cycle time desviando > 2σ', threshold_sigma: 2, impacto: 'Processo instável' },
    { nome: 'Variante dominante < 60%', threshold_pct: 60, impacto: 'Processo sem padrão' },
  ],

  process_types: {
    vendas:       { etapas: ['Lead', 'Qualificação', 'Reunião', 'Proposta', 'Negociação', 'Fechamento'], sla_dias: 30 },
    onboarding:   { etapas: ['Contrato', 'Kickoff', 'Diagnóstico', 'Plano', 'Execução', 'Entrega'], sla_dias: 15 },
    entrega:      { etapas: ['Briefing', 'Análise', 'Execução', 'Revisão', 'Aprovação', 'Entrega'], sla_dias: 7 },
    financeiro:   { etapas: ['Fatura', 'Envio', 'Cobrança', 'Pagamento', 'Conciliação'], sla_dias: 5 },
    atendimento:  { etapas: ['Entrada', 'Triagem', 'Atendimento', 'Solução', 'Fechamento', 'Feedback'], sla_h: 24 },
  },

  kpis: ['Lead Time', 'Cycle Time', 'Waiting Time', 'Touch Time', 'Rework Rate', 'Conformance Rate', 'Variant Count', 'Throughput', 'Case Volume'],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
