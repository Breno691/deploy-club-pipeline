// ceoCalculators.js — Pure functions para métricas executivas
const { CONFIG } = require('../config');

function calcPipelineHealth(pipeline = {}) {
  const { valor_total = 0, leads = 0, reunioes = 0, propostas = 0, taxa_fechamento = CONFIG.goals.taxa_fechamento_meta } = pipeline;
  const receita_esperada = propostas * taxa_fechamento * (valor_total / (propostas || 1));
  const gap_meta = CONFIG.goals.receita_meta_mes - receita_esperada;
  const semanas_para_meta = receita_esperada > 0
    ? Math.ceil(CONFIG.goals.receita_meta_mes / (receita_esperada / 4))
    : null;

  return {
    valor_total,
    leads, reunioes, propostas,
    receita_esperada:     Math.round(receita_esperada),
    gap_meta:             Math.max(0, Math.round(gap_meta)),
    meta_atingivel:       gap_meta <= 0,
    semanas_para_meta,
    status: receita_esperada >= CONFIG.goals.receita_meta_mes ? 'ON_TRACK'
      : receita_esperada >= CONFIG.goals.receita_meta_mes * 0.7 ? 'AT_RISK'
      : 'OFF_TRACK',
    urgency: leads === 0 ? 'CRITICO' : reunioes === 0 ? 'ALTO' : propostas === 0 ? 'MEDIO' : 'OK',
  };
}

function prioritizeActions(actions = []) {
  // Ordena por: urgência × impacto × esforço invertido
  return actions
    .map(a => ({
      ...a,
      priority_score: (a.urgency || 5) * (a.impact || 5) / (a.effort || 3),
      quadrant: a.urgency >= 7 && a.impact >= 7 ? 'Q1'
        : a.urgency < 7 && a.impact >= 7 ? 'Q2'
        : a.urgency >= 7 && a.impact < 7 ? 'Q3'
        : 'Q4',
    }))
    .sort((a, b) => b.priority_score - a.priority_score);
}

function detectCEOAlerts(data = {}) {
  const alerts = [];
  const c = CONFIG.ceo_alerts;

  if (!data.pipeline_valor || data.pipeline_valor === 0)
    alerts.push({ ...c.find(a => a.type === 'pipeline_vazio'), data: 'Pipeline zerado' });
  if (!data.reunioes_semana || data.reunioes_semana === 0)
    alerts.push({ ...c.find(a => a.type === 'sem_reuniao_semana'), data: '0 reuniões esta semana' });
  if (data.receita_mes < CONFIG.goals.receita_meta_mes * 0.5)
    alerts.push({ ...c.find(a => a.type === 'receita_abaixo_meta'), data: `Receita R$ ${data.receita_mes || 0} vs meta R$ ${CONFIG.goals.receita_meta_mes}` });
  if (data.workflow_falhas >= 3)
    alerts.push({ ...c.find(a => a.type === 'workflow_falha'), data: `${data.workflow_falhas} falhas detectadas` });

  return {
    total:    alerts.length,
    criticos: alerts.filter(a => a.urgency === 'CRITICO'),
    altos:    alerts.filter(a => a.urgency === 'ALTO'),
    alerts,
    color:    alerts.some(a => a.urgency === 'CRITICO') ? 'VERMELHO'
      : alerts.some(a => a.urgency === 'ALTO') ? 'AMARELO'
      : 'VERDE',
  };
}

function calcBusinessHealth(data = {}) {
  const scores = {
    pipeline:   data.pipeline_valor > 0 ? 25 : 0,
    receita:    data.receita_mes >= CONFIG.goals.receita_meta_mes ? 25 : Math.round((data.receita_mes || 0) / CONFIG.goals.receita_meta_mes * 25),
    clientes:   (data.clientes_ativos || 0) >= CONFIG.goals.clientes_meta ? 25 : Math.round((data.clientes_ativos || 0) / CONFIG.goals.clientes_meta * 25),
    automacao:  data.horas_liberadas >= 20 ? 25 : Math.round((data.horas_liberadas || 0) / 20 * 25),
  };
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  return {
    total,
    scores,
    label: total >= 90 ? 'Saudável e escalando'
      : total >= 70 ? 'Funcionando — acelerar'
      : total >= 50 ? 'Atenção — ajustes necessários'
      : 'Crítico — ação urgente',
    color: total >= 70 ? 'verde' : total >= 50 ? 'amarelo' : 'vermelho',
  };
}

module.exports = { calcPipelineHealth, prioritizeActions, detectCEOAlerts, calcBusinessHealth };
