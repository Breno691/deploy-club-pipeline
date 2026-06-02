// CompetitorReportAgent.js — Competitor Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const fs   = require('fs');
const path = require('path');

const client = new Anthropic();

// ── Memória local ─────────────────────────────────────────────────────────────

const MEMORY_PATH = path.join(__dirname, '../../outputs/competitor_memory.json');

function loadMemory() {
  if (fs.existsSync(MEMORY_PATH)) {
    try { return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf-8')); } catch { return getDefault(); }
  }
  return getDefault();
}

function getDefault() {
  return {
    competitors_mapped:    0,
    gaps_identified:       0,
    opportunities_created: 0,
    analyses_run:          0,
    last_report:           null,
    top_opportunities:     [],
    updated_at:            new Date().toISOString(),
  };
}

function saveMemory(data) {
  fs.mkdirSync(path.dirname(MEMORY_PATH), { recursive: true });
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function updateMemory(updates) {
  const mem     = loadMemory();
  const updated = { ...mem, ...updates, updated_at: new Date().toISOString() };
  saveMemory(updated);
  return updated;
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateWeeklyReport({ context = '' }) {
  const mem       = loadMemory();
  const landscape = CONFIG.known_competitors;
  const keywords  = CONFIG.seo_keywords.filter(k => k.priority === 'alta').slice(0, 5);

  const prompt = `Você é o Competitor Report Agent da SmartOps IA.
Gere o relatório semanal de inteligência competitiva.

SmartOps IA: ${CONFIG.company.positioning}
CONTEXTO: ${context || 'relatório semanal padrão'}

CONCORRENTES MAPEADOS:
${landscape.map(c => `- [${c.type}] ${c.name} | Canais: ${c.channel} | Ameaça: ${c.threat}`).join('\n')}

TOP KEYWORDS PARA MONITORAR:
${keywords.map(k => `- "${k.kw}" | ${k.difficulty} dificuldade | ${k.intent}`).join('\n')}

HISTÓRICO:
- Concorrentes mapeados: ${mem.competitors_mapped}
- Gaps identificados: ${mem.gaps_identified}
- Oportunidades criadas: ${mem.opportunities_created}
- Análises rodadas: ${mem.analyses_run}

Gere o relatório no formato SmartOps:

TÍTULO: Relatório Semanal de Inteligência Competitiva — SmartOps IA
CONTEXTO: [cenário competitivo atual]
DADOS ANALISADOS: [fontes e concorrentes analisados]
PROBLEMA IDENTIFICADO: [maior ameaça competitiva identificada]
EVIDÊNCIA: [dado ou sinal que suporta]
IMPACTO: [risco para a SmartOps se não agir]
RECOMENDAÇÃO: [ação estratégica recomendada]
AÇÃO SUGERIDA: [ação concreta imediata]
PRIORIDADE: [Alta / Média / Baixa]
ESFORÇO: [Baixo / Médio / Alto]
ROI ESPERADO: [retorno de agir sobre essa oportunidade]
RISCO DE NÃO AGIR: [perda competitiva]
PRAZO: [quando executar]
MÉTRICA DE SUCESSO: [como medir]
PRÓXIMO PASSO: [o que fazer agora]

---

COMPETITIVE_DASHBOARD:
🎯 Concorrentes monitorados: ${landscape.length}
📊 Keywords prioritárias: ${keywords.length}
⚠️ Ameaças ativas: [estimar baseado no mapa]
💡 Oportunidades identificadas: ${mem.opportunities_created}

TOP_THREATS: [2-3 ameaças mais urgentes]
TOP_OPPORTUNITIES: [2-3 oportunidades mais valiosas]
WHAT_TO_DO_THIS_WEEK: [3 ações concretas]
AGENTS_TO_TRIGGER: [agentes a acionar baseado nas descobertas]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  updateMemory({ analyses_run: mem.analyses_run + 1, last_report: new Date().toISOString() });

  return { memory: mem, landscape, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

async function generateCEOCompetitorBrief({ context = '' }) {
  const landscape = CONFIG.known_competitors;
  const highThreats = landscape.filter(c => c.threat === 'alta');

  const prompt = `Você é o Competitor Report Agent da SmartOps IA.
Gere o CEO Competitor Brief — resumo executivo de inteligência competitiva para o Breno.

SmartOps IA: ${CONFIG.company.positioning}
CONTEXTO: ${context || 'nenhum'}
CONCORRENTES DE ALTA AMEAÇA: ${highThreats.map(c => c.name).join(', ')}

Gere o brief:

CEO_COMPETITOR_BRIEF — SmartOps IA
Data: ${new Date().toLocaleDateString('pt-BR')}

MAIN_THREAT: [ameaça competitiva mais urgente]
MAIN_OPPORTUNITY: [oportunidade mais valiosa agora]
MOVEMENT_RECOMMENDED: [o que a SmartOps deve fazer esta semana]
AGENTS_TO_TRIGGER: [agentes a acionar]

COMPETITIVE_POSITION:
✅ VANTAGENS: [onde a SmartOps é mais forte]
⚠️ GAPS: [onde estamos vulneráveis]
🎯 NEXT_MOVE: [próximo movimento estratégico]

BOTTOM_LINE: [1 frase — o que o Breno precisa saber sobre o cenário competitivo agora]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { highThreats, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { generateWeeklyReport, generateCEOCompetitorBrief, loadMemory, updateMemory };
