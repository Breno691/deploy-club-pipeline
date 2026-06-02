// PriorityAgent.js — Strategic Planning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function calculateICE(impact, confidence, ease) {
  return Math.round(impact * confidence * ease);
}

function calculateRICE(reach, impact, confidence, effort) {
  if (!effort || effort === 0) return 0;
  return Math.round((reach * impact * confidence) / effort);
}

function classifyICEScore(score) {
  if (score >= 400) return { level: 'EXECUTAR AGORA',  priority: 1, color: '🔴' };
  if (score >= 200) return { level: 'PRÓXIMO SPRINT',  priority: 2, color: '🟠' };
  if (score >= 100) return { level: 'PROGRAMAR',       priority: 3, color: '🟡' };
  return            { level: 'BACKLOG',                priority: 4, color: '⚫' };
}

function scoreInitiativesLocal(initiatives) {
  return initiatives.map(i => {
    const ice   = calculateICE(i.impact || 5, i.confidence || 5, i.ease || 5);
    const cls   = classifyICEScore(ice);
    return { ...i, ice_score: ice, classification: cls };
  }).sort((a, b) => b.ice_score - a.ice_score);
}

function buildPriorityBacklog() {
  return scoreInitiativesLocal(CONFIG.initial_initiatives);
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function prioritizeInitiative({ initiative, impact, confidence, ease, context = '' }) {
  const ice = calculateICE(impact, confidence, ease);
  const cls = classifyICEScore(ice);
  const backlog = buildPriorityBacklog();
  const rank    = backlog.findIndex(i => i.name.toLowerCase().includes(initiative.toLowerCase())) + 1;

  const prompt = `Você é o Priority Agent da SmartOps IA.
Cargo: Diretor de Estratégia, Planejamento e OKRs.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG — fase inicial.

Analise a iniciativa e dê sua recomendação estratégica.

INICIATIVA: ${initiative}
IMPACTO (1-10): ${impact}
CONFIANÇA (1-10): ${confidence}
FACILIDADE (1-10): ${ease}
ICE SCORE: ${ice} — ${cls.level}
CONTEXTO: ${context || 'empresa em fase inicial, sem clientes, foco em geração de receita'}

BACKLOG ATUAL (top 5 por ICE):
${backlog.slice(0, 5).map((i, idx) => `${idx+1}. ${i.name} — ICE: ${i.ice_score} (${i.classification.level})`).join('\n')}

Responda:

INITIATIVE: ${initiative}
IMPACT: ${impact}/10 — [o que justifica esse impacto]
CONFIDENCE: ${confidence}/10 — [o que justifica essa confiança]
EASE: ${ease}/10 — [o que justifica essa facilidade]
ICE_SCORE: ${ice}
ROI_POTENTIAL: [ROI estimado para a SmartOps]
STRATEGIC_FIT: [alinhamento com fase atual da empresa]
DECISION: ${cls.color} ${cls.level}
REASON: [por que executar/adiar/cortar em 2-3 frases]
WHAT_MUST_HAPPEN_FIRST: [dependências ou pré-requisitos]
NEXT_ACTION: [ação concreta imediata se for executar]
TRADE_OFF: [o que abrimos mão ao priorizar isso]
WHAT_TO_PAUSE: [o que parar para dar espaço a essa iniciativa]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    initiative,
    ice_score:  ice,
    classification: cls,
    rank_in_backlog: rank || 'não encontrado',
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

async function rankFullBacklog({ context = '' }) {
  const scored = buildPriorityBacklog();
  const top3   = scored.slice(0, 3);
  const cut    = scored.slice(7);

  const scoredText = scored.map((i, idx) =>
    `${idx+1}. [${i.classification.color}] ${i.name} | Pilar: ${i.pillar} | ICE: ${i.ice_score} | ${i.classification.level}`
  ).join('\n');

  const prompt = `Você é o Priority Agent da SmartOps IA.
Rankeie e analise o backlog estratégico completo.

CONTEXTO: ${context || 'empresa em fase inicial — prioridade: clientes e receita'}
STAGE: ${CONFIG.company.stage}

BACKLOG RANKEADO POR ICE:
${scoredText}

TOP 3 PRIORIDADES:
${top3.map((i, idx) => `${idx+1}. ${i.name} — ICE ${i.ice_score}`).join('\n')}

CANDIDATOS A CORTAR:
${cut.map(i => `- ${i.name} — ICE ${i.ice_score}`).join('\n')}

Gere análise:

BACKLOG_STATUS: [avaliação geral do backlog]
TOP_3_NOW: [os 3 mais urgentes e por quê]
WHAT_TO_CUT: [iniciativas a cortar ou mover para backlog]
STRATEGIC_FOCUS: [onde focar 80% do tempo]
ANTI_PATTERNS: [armadilhas a evitar]
WEEKLY_SPRINT: [o que executar nessa semana]
DEPENDENCIES: [o que desbloquearia mais iniciativas]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { scored, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { prioritizeInitiative, rankFullBacklog, calculateICE, calculateRICE, buildPriorityBacklog, scoreInitiativesLocal };
