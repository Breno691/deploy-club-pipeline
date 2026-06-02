// StrategyReportAgent.js — Strategic Planning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const fs   = require('fs');
const path = require('path');

const client = new Anthropic();

// ── Memória local ─────────────────────────────────────────────────────────────

const MEMORY_PATH = path.join(__dirname, '../../outputs/strategy_memory.json');

function loadMemory() {
  if (fs.existsSync(MEMORY_PATH)) {
    try { return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf-8')); } catch { return getDefaultMemory(); }
  }
  return getDefaultMemory();
}

function getDefaultMemory() {
  return {
    leads_total:     0,
    meetings_total:  0,
    clients_total:   0,
    revenue_total:   0,
    weeks_running:   0,
    okrs_created:    0,
    plans_created:   0,
    last_review:     null,
    strategic_decisions: [],
    updated_at:      new Date().toISOString(),
  };
}

function saveMemory(data) {
  fs.mkdirSync(path.dirname(MEMORY_PATH), { recursive: true });
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function updateMemory(updates) {
  const mem = loadMemory();
  const updated = { ...mem, ...updates, updated_at: new Date().toISOString() };
  saveMemory(updated);
  return updated;
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateStrategicPlan({ horizon, currentStatus = '', context = '' }) {
  const h      = parseInt(horizon);
  const hCfg   = CONFIG.horizons[h] || CONFIG.horizons[90];
  const targets = CONFIG.targets[h] || CONFIG.targets[90];
  const mem    = loadMemory();
  const topInitiatives = CONFIG.initial_initiatives
    .map(i => ({ ...i, ice: i.impact * i.confidence * i.ease }))
    .sort((a, b) => b.ice - a.ice)
    .slice(0, 5)
    .map(i => `- ${i.name} (ICE: ${i.ice})`).join('\n');

  const prompt = `Você é o Strategic Planning Intelligence Agent da SmartOps IA.
Cargo: Diretor de Estratégia, Planejamento e OKRs.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Crie um plano estratégico de ${h} dias altamente prático e focado em resultado.

HORIZONTE: ${hCfg.label}
FOCO: ${hCfg.focus}
SITUAÇÃO ATUAL: ${currentStatus || 'Empresa em fase inicial — sem clientes — construindo base'}
HISTÓRICO: ${mem.leads_total} leads | ${mem.meetings_total} reuniões | ${mem.clients_total} clientes | R$ ${mem.revenue_total} receita
CONTEXTO: ${context || 'Prioridade: gerar clientes locais em BH'}

METAS DO PERÍODO:
- Leads: ${targets.leads}
- Reuniões: ${targets.meetings}
- Clientes: ${targets.clients}
- Receita: R$ ${targets.revenue.toLocaleString('pt-BR')}

TOP INICIATIVAS (ICE):
${topInitiatives}

NÃO PRIORIZAR AGORA:
${CONFIG.not_now.join('\n- ')}

Gere o plano estratégico completo:

STRATEGIC_PLAN:
HORIZON: ${h} dias
MAIN_OBJECTIVE: [objetivo central do período — 1 frase clara]
SUCCESS_DEFINITION: [como saberemos que foi bem-sucedido]
NORTH_STAR_METRIC: [a 1 métrica que mais importa]

TOP_PRIORITIES:
1. [prioridade 1 — ação + por quê]
2. [prioridade 2 — ação + por quê]
3. [prioridade 3 — ação + por quê]

OKRS:
[OKR 1 resumido: Objective + KRs]
[OKR 2 resumido: Objective + KRs]

KEY_INITIATIVES:
[lista de 5-7 iniciativas ordenadas por ICE]

METRICS_TO_TRACK:
[métricas semanais obrigatórias]

RISKS:
[2-3 riscos principais com mitigação]

TRADE_OFFS:
[o que escolhemos e o que abrimos mão]

WHAT_TO_STOP:
[o que parar para manter foco]

WHAT_TO_ACCELERATE:
[o que deve ir mais rápido]

AGENTS_TO_TRIGGER:
[quais agentes acionar para executar esse plano]

WEEK_1_SPRINT:
[o que fazer nos próximos 7 dias — específico]

NEXT_REVIEW: [quando revisar]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  updateMemory({ plans_created: mem.plans_created + 1 });

  return { horizon: h, targets, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

async function generateCEOBrief({ context = '' }) {
  const mem = loadMemory();

  const prompt = `Você é o Strategic Planning Intelligence Agent da SmartOps IA.
Gere o CEO Planning Brief — resumo executivo diário para o Breno.

HISTÓRICO ACUMULADO:
- Leads gerados: ${mem.leads_total}
- Reuniões realizadas: ${mem.meetings_total}
- Clientes fechados: ${mem.clients_total}
- Receita gerada: R$ ${mem.revenue_total}
- Semanas de operação: ${mem.weeks_running}

CONTEXTO: ${context || 'nenhum'}

Gere o brief executivo:

CEO_PLANNING_BRIEF — SmartOps IA
Data: ${new Date().toLocaleDateString('pt-BR')}

CURRENT_FOCUS: [em 1 frase — onde a energia deve estar hoje]

TOP_3_PRIORITIES:
1. [prioridade mais urgente]
2. [segunda prioridade]
3. [terceira prioridade]

PROGRESS: [o que avançou — 2-3 pontos]
RISKS: [1-2 riscos ativos agora]
DECISIONS_NEEDED: [decisões pendentes — seja direto]
WHAT_TO_STOP: [o que parar agora]
WHAT_TO_ACCELERATE: [o que ir mais rápido]
NEXT_7_DAYS: [ações concretas da próxima semana]

NUMBERS_THAT_MATTER:
📊 Leads: ${mem.leads_total} | Meta 90d: 40
📅 Reuniões: ${mem.meetings_total} | Meta 90d: 15
💼 Clientes: ${mem.clients_total} | Meta 90d: 3
💰 Receita: R$ ${mem.revenue_total} | Meta 90d: R$ 15.000

BOTTOM_LINE: [1 frase — o que o Breno precisa saber agora]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { memory: mem, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

async function generateReport({ context = '' }) {
  const mem     = loadMemory();
  const targets = CONFIG.targets[90];
  const leadsP  = targets.leads    > 0 ? Math.round(mem.leads_total    / targets.leads    * 100) : 0;
  const meetP   = targets.meetings > 0 ? Math.round(mem.meetings_total / targets.meetings * 100) : 0;
  const revP    = targets.revenue  > 0 ? Math.round(mem.revenue_total  / targets.revenue  * 100) : 0;
  const clientP = targets.clients  > 0 ? Math.round(mem.clients_total  / targets.clients  * 100) : 0;

  const prompt = `Você é o Strategy Report Agent da SmartOps IA.
Gere o relatório estratégico completo no formato SmartOps.

DADOS CONSOLIDADOS:
Leads: ${mem.leads_total}/${targets.leads} (${leadsP}%)
Reuniões: ${mem.meetings_total}/${targets.meetings} (${meetP}%)
Clientes: ${mem.clients_total}/${targets.clients} (${clientP}%)
Receita: R$ ${mem.revenue_total}/R$ ${targets.revenue} (${revP}%)
Semanas: ${mem.weeks_running}
OKRs criados: ${mem.okrs_created}
Planos gerados: ${mem.plans_created}
CONTEXTO: ${context || 'relatório periódico padrão'}

Gere no formato SmartOps obrigatório:

TÍTULO: Relatório Estratégico SmartOps IA
CONTEXTO: [estado atual da estratégia]
DADOS ANALISADOS: [métricas principais]
PROBLEMA IDENTIFICADO: [maior gap estratégico agora]
EVIDÊNCIA: [dado concreto que suporta]
IMPACTO: [consequência do gap]
RECOMENDAÇÃO: [recomendação estratégica]
AÇÃO SUGERIDA: [ação imediata]
PRIORIDADE: [Alta / Média / Baixa]
ESFORÇO: [Baixo / Médio / Alto]
ROI ESPERADO: [ROI da ação recomendada]
RISCO DE NÃO AGIR: [consequência de não tomar ação]
PRAZO: [quando executar]
MÉTRICA DE SUCESSO: [como medir]
PRÓXIMO PASSO: [próxima ação]

---

DASHBOARD ESTRATÉGICO:
📊 LEADS:    ${mem.leads_total}/${targets.leads} — ${leadsP}%
📅 REUNIÕES: ${mem.meetings_total}/${targets.meetings} — ${meetP}%
💼 CLIENTES: ${mem.clients_total}/${targets.clients} — ${clientP}%
💰 RECEITA:  R$ ${mem.revenue_total}/${targets.revenue} — ${revP}%

FOCUS_THIS_WEEK: [o que fazer agora]
WHAT_TO_STOP: [o que parar]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { memory: mem, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { generateStrategicPlan, generateCEOBrief, generateReport, loadMemory, updateMemory };
