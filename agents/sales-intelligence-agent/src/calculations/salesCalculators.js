// salesCalculators.js — Cálculos puros de vendas
const { CONFIG } = require('../config');

function calcBANTScore(lead = {}) {
  const { budget = 0, authority = 0, need = 0, timeline = 0 } = lead;
  const w = CONFIG.qualification;

  const score =
    (budget    / 10) * w.B.weight +
    (authority / 10) * w.A.weight +
    (need      / 10) * w.N.weight +
    (timeline  / 10) * w.T.weight;

  const classification =
    score >= 80 ? 'HOT'   :
    score >= 60 ? 'WARM'  :
    score >= 40 ? 'COLD'  : 'DISCARD';

  const next_action =
    classification === 'HOT'   ? 'Agendar reunião em 24h' :
    classification === 'WARM'  ? 'Qualificar melhor — follow-up em 48h' :
    classification === 'COLD'  ? 'Nutrir com conteúdo — follow-up em 2 semanas' :
    'Remover do pipeline ativo';

  return { score: Math.round(score), classification, next_action, bant: { budget, authority, need, timeline } };
}

function calcPipelineHealth(pipeline = []) {
  const stages = CONFIG.lead_stages;
  const t = CONFIG.targets;

  const by_stage = {};
  stages.forEach(s => {
    by_stage[s.stage] = { count: 0, leads: [], sla: s.sla_horas };
  });
  pipeline.forEach(l => {
    if (by_stage[l.stage]) by_stage[l.stage].count++;
  });

  const reunioes   = by_stage['reuniao_agendada'].count + by_stage['reuniao_realizada'].count;
  const propostas  = by_stage['proposta_enviada'].count + by_stage['negociacao'].count;
  const receita_esperada = propostas * t.taxa_fechamento * t.ticket_medio;

  const pipeline_value = pipeline
    .filter(l => ['reuniao_realizada', 'proposta_enviada', 'negociacao'].includes(l.stage))
    .reduce((s, l) => s + (l.service_ticket || t.ticket_medio), 0);

  const over_sla = pipeline.filter(l => {
    const stage = stages.find(s => s.stage === l.stage);
    if (!stage?.sla_horas || !l.updated_at) return false;
    const hours_since = (Date.now() - new Date(l.updated_at)) / 3600000;
    return hours_since > stage.sla_horas;
  });

  return {
    total_leads:     pipeline.length,
    by_stage,
    reunioes,
    propostas,
    pipeline_value,
    receita_esperada: Math.round(receita_esperada),
    meta_receita:     t.ticket_medio * t.clientes_mes,
    over_sla_count:   over_sla.length,
    health: reunioes >= t.reunioes_semana ? 'SAUDAVEL' : reunioes > 0 ? 'ATENCAO' : 'CRITICO',
  };
}

function calcSalesVelocity(pipeline = {}) {
  const { leads_mes = 0, taxa_reuniao = CONFIG.targets.taxa_reuniao_lead,
    taxa_proposta = CONFIG.targets.taxa_proposta_reuniao,
    taxa_fechamento = CONFIG.targets.taxa_fechamento,
    ticket_medio = CONFIG.targets.ticket_medio,
    ciclo_dias = 30 } = pipeline;

  const reunioes   = leads_mes * taxa_reuniao;
  const propostas  = reunioes  * taxa_proposta;
  const clientes   = propostas * taxa_fechamento;
  const receita_mes = clientes * ticket_medio;
  const receita_dia = ciclo_dias > 0 ? receita_mes / ciclo_dias : 0;

  return {
    leads_mes, reunioes: Math.round(reunioes), propostas: Math.round(propostas),
    clientes: Math.round(clientes * 10) / 10,
    receita_mes: Math.round(receita_mes),
    receita_dia: Math.round(receita_dia),
    meta_clientes: CONFIG.targets.clientes_mes,
    gap_clientes: Math.max(0, CONFIG.targets.clientes_mes - clientes),
    leads_necessarios_meta: Math.ceil(CONFIG.targets.clientes_mes / (taxa_reuniao * taxa_proposta * taxa_fechamento)),
  };
}

module.exports = { calcBANTScore, calcPipelineHealth, calcSalesVelocity };
