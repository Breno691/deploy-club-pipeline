// RoadmapAgent.js — Strategic Planning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function getRoadmapMilestones(horizon) {
  const h = parseInt(horizon);
  const templates = {
    30: [
      { week: 1, milestone: 'Tracking do site configurado (GA4 + Meta Pixel)' },
      { week: 1, milestone: 'CRM básico configurado' },
      { week: 2, milestone: 'Google Ads no ar com conversões' },
      { week: 2, milestone: 'Conteúdo Instagram rodando (3x/semana)' },
      { week: 3, milestone: 'Página /diagnostico-gratuito publicada' },
      { week: 3, milestone: 'Lista de 50 prospects locais montada' },
      { week: 4, milestone: 'Primeiros leads entrando' },
      { week: 4, milestone: 'Proposta padrão criada' },
    ],
    90: [
      { month: 1, milestone: 'Base comercial montada (tracking, ads, CRM, conteúdo)' },
      { month: 1, milestone: '10 leads gerados, 4 reuniões agendadas' },
      { month: 2, milestone: '25 leads acumulados, 10 reuniões realizadas' },
      { month: 2, milestone: 'Primeiro cliente fechado' },
      { month: 2, milestone: 'Primeiro case documentado' },
      { month: 3, milestone: '40 leads, 15 reuniões, 3 clientes' },
      { month: 3, milestone: 'Canal de aquisição principal definido' },
      { month: 3, milestone: '2 cases publicados' },
    ],
    180: [
      { phase: '0-90 dias',  milestone: 'Tração: primeiros clientes e cases' },
      { phase: '90-120 dias', milestone: 'Produto de entrada definido e precificado' },
      { phase: '90-120 dias', milestone: 'Primeira recorrência gerada' },
      { phase: '120-150 dias', milestone: '2 parcerias estratégicas ativas' },
      { phase: '120-150 dias', milestone: '5 casos documentados' },
      { phase: '150-180 dias', milestone: 'Autoridade local estabelecida' },
      { phase: '150-180 dias', milestone: '10+ clientes, pipeline previsível' },
    ],
  };
  return templates[h] || templates[90];
}

function calculateRoadmapProgress(milestones) {
  if (!milestones || !milestones.length) return 0;
  const done = milestones.filter(m => m.status === 'done').length;
  return Math.round((done / milestones.length) * 100);
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateRoadmap({ horizon, currentStatus = '', context = '' }) {
  const h          = parseInt(horizon);
  const horizonCfg = CONFIG.horizons[h] || CONFIG.horizons[90];
  const milestones = getRoadmapMilestones(h);
  const targets    = CONFIG.targets[h] || CONFIG.targets[90];
  const initiatives = CONFIG.initial_initiatives
    .map(i => `- ${i.name} (${i.pillar}) — ICE: ${i.impact * i.confidence * i.ease}`)
    .join('\n');

  const prompt = `Você é o Roadmap Agent da SmartOps IA.
Cargo: Diretor de Estratégia, Planejamento e OKRs.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Stage: ${CONFIG.company.stage} — foco em geração de clientes.

Crie um roadmap de ${h} dias altamente prático e executável.

FOCO DO HORIZONTE: ${horizonCfg.focus}
SITUAÇÃO ATUAL: ${currentStatus || 'Empresa em fase inicial — sem clientes ainda'}
CONTEXTO: ${context || 'Prioridade máxima: gerar clientes, receita e autoridade local'}

METAS DO HORIZONTE:
- Leads: ${targets.leads}
- Reuniões: ${targets.meetings}
- Propostas: ${targets.proposals}
- Clientes: ${targets.clients}
- Receita: R$ ${targets.revenue.toLocaleString('pt-BR')}

INICIATIVAS PRIORIZADAS (ICE Score):
${initiatives}

MILESTONES SUGERIDOS:
${milestones.map(m => `- ${JSON.stringify(m)}`).join('\n')}

Gere o roadmap completo:

ROADMAP_HORIZON: ${h} dias
MAIN_OBJECTIVE: [objetivo principal do período]
SUCCESS_DEFINITION: [como saberemos que o período foi bem-sucedido]

FASES:
${h <= 30 ? `SEMANA 1: [foco + entregáveis]
SEMANA 2: [foco + entregáveis]
SEMANA 3: [foco + entregáveis]
SEMANA 4: [foco + entregáveis]` : h <= 90 ? `MÊS 1: [foco + entregáveis]
MÊS 2: [foco + entregáveis]
MÊS 3: [foco + entregáveis]` : `FASE 1 (0-60 dias): [foco + entregáveis]
FASE 2 (61-120 dias): [foco + entregáveis]
FASE 3 (121-180 dias): [foco + entregáveis]`}

KEY_MILESTONES: [5-7 marcos críticos com datas relativas]
DEPENDENCIES: [o que precisa acontecer antes do quê]
WHAT_NOT_TO_DO: [o que evitar neste período para não perder foco]
RESOURCE_NEEDS: [o que precisa — tempo, dinheiro, ferramentas, pessoas]
RISKS: [3 riscos principais que podem travar o roadmap]
LEADING_METRICS: [métricas semanais para saber se o roadmap avança]
REVIEW_CHECKPOINTS: [quando revisar e o que avaliar]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    horizon: h,
    targets,
    milestones,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { generateRoadmap, getRoadmapMilestones, calculateRoadmapProgress };
