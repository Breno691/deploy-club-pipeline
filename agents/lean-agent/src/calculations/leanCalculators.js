// leanCalculators.js — Cálculos Lean puros
const { CONFIG } = require('../config');

function calcWasteScore(waste = {}) {
  const w = CONFIG.waste_priority;
  const {
    custo_mes_brl      = 0,
    frequencia         = 0,  // ocorrências/mês
    impacto_cliente    = 5,  // 0-10
    facilidade_fix     = 5,  // 0-10 (10 = muito fácil)
    rapido_resultado   = 5,  // 0-10 (10 = resultado em < 1 semana)
  } = waste;

  // Normalizar custo (até R$10k/mês = 10 pontos)
  const custo_score = Math.min(10, custo_mes_brl / 1000);
  // Normalizar frequência (até 100x/mês = 10 pontos)
  const freq_score = Math.min(10, frequencia / 10);

  const raw =
    (custo_score       / 10) * w.custo_mes_brl.weight    +
    (freq_score        / 10) * w.frequencia.weight        +
    (impacto_cliente   / 10) * w.impacto_cliente.weight   +
    (facilidade_fix    / 10) * w.facilidade_fix.weight    +
    (rapido_resultado  / 10) * w.rapido_resultado.weight;

  const classification =
    raw >= 70 ? 'ELIMINAR_AGORA'
    : raw >= 50 ? 'PLANEJAR_KAIZEN'
    : raw >= 30 ? 'MONITORAR'
    : 'BAIXA_PRIORIDADE';

  return {
    score: Math.round(raw),
    classification,
    custo_anual_brl: Math.round(custo_mes_brl * 12),
    priority_label: classification.replace(/_/g, ' '),
  };
}

function calcOEE(availability_pct, performance_pct, quality_pct) {
  const oee = (availability_pct / 100) * (performance_pct / 100) * (quality_pct / 100) * 100;
  const world_class = 85;
  const gap = world_class - oee;
  return {
    oee:          Math.round(oee * 10) / 10,
    availability:  availability_pct,
    performance:   performance_pct,
    quality:       quality_pct,
    world_class,
    gap_to_world_class: Math.max(0, Math.round(gap * 10) / 10),
    classification: oee >= 85 ? 'World Class' : oee >= 65 ? 'Típico' : oee >= 45 ? 'Baixo' : 'Crítico',
    biggest_loss: availability_pct <= Math.min(performance_pct, quality_pct) ? 'disponibilidade'
      : performance_pct <= Math.min(availability_pct, quality_pct) ? 'performance'
      : 'qualidade',
  };
}

function calcLeadTime(steps = []) {
  const value_added    = steps.filter(s => s.adds_value).reduce((sum, s) => sum + s.duration_min, 0);
  const non_value      = steps.filter(s => !s.adds_value).reduce((sum, s) => sum + s.duration_min, 0);
  const total          = value_added + non_value;
  const efficiency_pct = total > 0 ? Math.round((value_added / total) * 100) : 0;

  const bottleneck = [...steps].sort((a, b) => b.duration_min - a.duration_min)[0];

  return {
    total_min:         total,
    value_added_min:   value_added,
    non_value_min:     non_value,
    efficiency_pct,
    waste_pct:         100 - efficiency_pct,
    bottleneck:        bottleneck?.name || 'não identificado',
    steps_analyzed:    steps.length,
    waste_steps:       steps.filter(s => !s.adds_value).length,
    improvement_potential: `Eliminar ${steps.filter(s => !s.adds_value).length} etapas sem valor reduz lead time em ${non_value} min (${100 - efficiency_pct}%)`,
  };
}

function calcKaizenROI(kaizen = {}) {
  const {
    horas_economizadas_mes = 0,
    custo_hora_brl         = 60,
    reducao_defeitos_pct   = 0,
    custo_defeito_brl      = 0,
    implementacao_horas    = 8,
    implementacao_rate     = 150,
  } = kaizen;

  const labor_savings  = horas_economizadas_mes * custo_hora_brl;
  const defect_savings = (reducao_defeitos_pct / 100) * custo_defeito_brl;
  const monthly_savings = labor_savings + defect_savings;
  const impl_cost      = implementacao_horas * implementacao_rate;
  const payback_months = monthly_savings > 0 ? Math.ceil(impl_cost / monthly_savings) : null;
  const roi_12m        = impl_cost > 0 && monthly_savings > 0
    ? Math.round(((monthly_savings * 12 - impl_cost) / impl_cost) * 100)
    : 0;

  return {
    monthly_savings:    Math.round(monthly_savings),
    annual_savings:     Math.round(monthly_savings * 12),
    implementation_cost: Math.round(impl_cost),
    payback_months,
    roi_12m_pct:        roi_12m,
    verdict:            payback_months && payback_months <= 3 ? 'IMPLEMENTAR AGORA' : payback_months && payback_months <= 6 ? 'AVALIAR' : 'RECONSIDERAR',
  };
}

function identifyWasteSignals(processDescription = '') {
  const text = processDescription.toLowerCase();
  const found = [];

  const signals = [
    { waste: 'D', keywords: ['retrabalho', 'corrigir', 'defeito', 'erro', 'refazer', 'reclamação'] },
    { waste: 'O', keywords: ['produzir demais', 'excesso', 'sobra', 'estoque alto'] },
    { waste: 'W', keywords: ['esperar', 'aguardar', 'fila', 'parado', 'demora', 'atraso'] },
    { waste: 'N', keywords: ['não usa', 'funcionário ocioso', 'potencial ignorado', 'ninguém sabe'] },
    { waste: 'T', keywords: ['transportar', 'mover', 'carregar', 'transferir', 'enviar para outro'] },
    { waste: 'I', keywords: ['estoque', 'material parado', 'acumulado', 'em fila'] },
    { waste: 'M', keywords: ['andar', 'buscar', 'procurar', 'ir até', 'movimento'] },
    { waste: 'E', keywords: ['relatório que ninguém lê', 'aprovação desnecessária', 'formulário demais', 'burocracia'] },
  ];

  signals.forEach(s => {
    if (s.keywords.some(k => text.includes(k))) {
      found.push({ ...CONFIG.eight_wastes[s.waste], code: s.waste });
    }
  });

  return { found, count: found.length, primary: found[0] || null };
}

module.exports = { calcWasteScore, calcOEE, calcLeadTime, calcKaizenROI, identifyWasteSignals };
