// TechRadarAgent.js — AI Lab Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { buildRadarItem, validateRadarItem } = require('../tech-radar/techRadar.schema');
const { calculateTotalScore, scoreToRecommendation } = require('../tools/toolEvaluation.schema');

const client = new Anthropic();

// ── Research and evaluate a technology ────────────────────────────────────────
async function evaluateTechnology(techName, category, context = '') {
  const prompt = `Você é o Tech Radar Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Avalie esta tecnologia e retorne JSON:

Tecnologia: ${techName}
Categoria: ${category}
Contexto adicional: ${context || 'nenhum'}

{
  "name": "${techName}",
  "category": "${category}",
  "description": "...",
  "why_it_matters": "...",
  "use_case_smartops": "como a SmartOps pode usar isso na operação interna",
  "use_case_clients": "como isso pode virar serviço para clientes PME",
  "related_agents": ["agente1", "agente2"],
  "estimated_roi": "alto | médio | baixo",
  "risk": "baixo | médio | alto",
  "cost": "free | freemium | pago | $X/mês",
  "integration_effort": "baixo | médio | alto",
  "maturity": "experimental | growing | mature",
  "scores": {
    "business_impact": 0-10,
    "technical_fit": 0-10,
    "integration_fit": 0-10,
    "cost_efficiency": 0-10,
    "risk": 0-10,
    "maturity": 0-10,
    "strategic_advantage": 0-10
  },
  "next_action": "criar PoC | integrar | monitorar | rejeitar",
  "recommended_radar_status": "adopt | trial | assess | hold",
  "one_line_verdict": "..."
}

REGRAS:
- Seja objetivo e orientado a ROI
- Considere o stack atual: n8n, Claude API, Remotion, Playwright, Supabase
- Priorize tecnologias que melhoram agentes ou criam serviços para PMEs`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('TechRadarAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);

  const { SCORE_WEIGHTS } = require('../tools/toolEvaluation.schema');
  const totalScore = calculateTotalScore(data.scores || {});
  return buildRadarItem(data, totalScore);
}

// ── Scan for new technologies weekly ──────────────────────────────────────────
async function weeklyTechScan(focusAreas = ['llm', 'automation', 'agent-framework']) {
  const prompt = `Você é o Tech Radar Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Foco da semana: ${focusAreas.join(', ')}

Pesquise e retorne as top 5 novidades mais relevantes para a SmartOps IA:

{
  "scan_date": "${new Date().toISOString().split('T')[0]}",
  "focus_areas": ${JSON.stringify(focusAreas)},
  "discoveries": [
    {
      "name": "...",
      "category": "...",
      "why_relevant": "...",
      "use_case_smartops": "...",
      "urgency": "now | next | later",
      "initial_score": 0-100,
      "suggested_action": "..."
    }
  ],
  "weekly_insight": "...",
  "top_recommendation": "...",
  "risk_alert": "qualquer risco tecnológico que a SmartOps deva conhecer"
}

CRITÉRIOS:
- relevância para consultoria Lean + IA
- aplicabilidade em agentes existentes
- potencial de serviço para PMEs
- custo-benefício
- maturidade`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('TechRadarAgent weekly scan: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate radar report ──────────────────────────────────────────────────────
function generateRadarReport(items) {
  const adopt  = items.filter(i => i.status === 'adopt');
  const trial  = items.filter(i => i.status === 'trial');
  const assess = items.filter(i => i.status === 'assess');
  const hold   = items.filter(i => i.status === 'hold');

  return {
    generated_at: new Date().toISOString(),
    summary: { adopt: adopt.length, trial: trial.length, assess: assess.length, hold: hold.length },
    adopt_items:  adopt.map(i => ({ name: i.name, category: i.category, score: i.score, use_case: i.use_case_smartops })),
    trial_items:  trial.map(i => ({ name: i.name, category: i.category, score: i.score, next_action: i.next_action })),
    assess_items: assess.map(i => ({ name: i.name, category: i.category, score: i.score })),
    top_recommendation: adopt[0] || trial[0] || null,
  };
}

module.exports = { evaluateTechnology, weeklyTechScan, generateRadarReport };
