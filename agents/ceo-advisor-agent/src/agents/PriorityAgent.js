// PriorityAgent.js — Prioriza ações por ROI e urgência (Quadrante + ICE)
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { prioritizeActions } = require('../calculations/ceoCalculators');

const client = new Anthropic();

// Backlog padrão SmartOps (atualizar conforme contexto)
const DEFAULT_BACKLOG = [
  { name: 'Prospecção ativa — 10 mensagens WhatsApp', urgency: 9, impact: 10, effort: 2, area: 'vendas' },
  { name: 'Publicar post Instagram + LinkedIn',        urgency: 7, impact: 7,  effort: 2, area: 'marketing' },
  { name: 'Fazer follow-up de propostas abertas',      urgency: 9, impact: 9,  effort: 1, area: 'vendas' },
  { name: 'Aplicar schema banco no Supabase',          urgency: 5, impact: 9,  effort: 4, area: 'infra' },
  { name: 'Atualizar landing page /diagnostico',       urgency: 6, impact: 9,  effort: 3, area: 'marketing' },
  { name: 'Confirmar reuniões da semana',              urgency: 8, impact: 8,  effort: 1, area: 'vendas' },
  { name: 'Revisar proposta pendente',                 urgency: 7, impact: 9,  effort: 2, area: 'vendas' },
  { name: 'Gravar reels para a semana',                urgency: 5, impact: 7,  effort: 5, area: 'marketing' },
  { name: 'Ativar bot WhatsApp lead qualification',    urgency: 6, impact: 10, effort: 4, area: 'automacao' },
  { name: 'Configurar Google Ads local BH',            urgency: 5, impact: 9,  effort: 3, area: 'marketing' },
  { name: 'Corrigir token Instagram expirado',         urgency: 4, impact: 6,  effort: 1, area: 'infra' },
  { name: 'Criar case study do último projeto',        urgency: 4, impact: 8,  effort: 3, area: 'marketing' },
];

function buildPriorityMatrix(actions = null) {
  const backlog  = actions || DEFAULT_BACKLOG;
  const ranked   = prioritizeActions(backlog);
  const q1       = ranked.filter(a => a.quadrant === 'Q1').slice(0, 5);
  const q2       = ranked.filter(a => a.quadrant === 'Q2').slice(0, 5);
  const q3       = ranked.filter(a => a.quadrant === 'Q3').slice(0, 3);
  const today    = q1.slice(0, 3);

  return { ranked, q1, q2, q3, today, total: backlog.length };
}

async function generatePriorityPlanWithClaude(context = '', customActions = null) {
  const matrix = buildPriorityMatrix(customActions);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o CEO Advisor Agent da SmartOps IA — especialista em priorização por ROI.

CEO: Breno Luiz — fundador SmartOps IA, Black Belt Lean Six Sigma, BH
Contexto: ${context || 'SmartOps IA em fase de aquisição dos primeiros clientes'}

BACKLOG PRIORIZADO (top 10 por urgência × impacto / esforço):
${matrix.ranked.slice(0, 10).map((a, i) =>
  `${i + 1}. [${a.quadrant}] ${a.name} (score: ${a.priority_score.toFixed(1)}) — área: ${a.area}`
).join('\n')}

Q1 FAZER AGORA: ${matrix.q1.map(a => a.name).join(', ')}
Q2 AGENDAR: ${matrix.q2.map(a => a.name).join(', ')}
Q3 DELEGAR: ${matrix.q3.map(a => a.name).join(', ')}

Metas: ${CONFIG.goals.clientes_meta} clientes, R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}/mês

Responda:

# PRIORITY PLAN — SMARTOPS IA

## REGRA DO DIA
[A 1 coisa que, se feita hoje, mais avança a meta de R$ ${CONFIG.goals.receita_meta_mes.toLocaleString('pt-BR')}/mês]

## Q1 — FAZER AGORA (Urgente + Alto Impacto)
Para cada ação:
AÇÃO: [nome]
POR QUE AGORA: [consequência de não fazer hoje]
COMO FAZER: [passo a passo em 5 linhas]
TEMPO: [estimativa em minutos]
RESULTADO ESPERADO: [o que deve acontecer]

## Q2 — AGENDAR (Alto Impacto, Não Urgente)
[Lista com quando agendar cada um]

## O QUE NÃO FAZER HOJE
[Ações Q3/Q4 que roubam atenção mas não movem a meta]

## BLOCO DE TRABALHO IDEAL
[Agenda do dia em blocos de 90 minutos]

## AVISO
[Se há algo no backlog que está sendo postergado há muito tempo e precisa de decisão — ir ou largar]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { generatePriorityPlanWithClaude, buildPriorityMatrix, DEFAULT_BACKLOG };
