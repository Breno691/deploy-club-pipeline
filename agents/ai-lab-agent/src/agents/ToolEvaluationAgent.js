// ToolEvaluationAgent.js — AI Lab Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const {
  TOOL_EVALUATION_SCHEMA, calculateTotalScore, scoreToRecommendation,
} = require('../tools/toolEvaluation.schema');

const client = new Anthropic();

// ── Evaluate a tool via Claude ─────────────────────────────────────────────────
async function evaluateTool({ name, category, website, description, cost }) {
  const prompt = `Você é o Tool Evaluation Agent da SmartOps IA.

Avalie esta ferramenta com rigor técnico e visão de negócio.

FERRAMENTA:
Nome: ${name}
Categoria: ${category}
Site: ${website || 'n/a'}
Descrição: ${description || 'n/a'}
Custo: ${cost || 'desconhecido'}

Stack atual da SmartOps: Claude API, n8n, Remotion, Playwright, Supabase, BullMQ, Tavily

Retorne JSON:
{
  "tool_id": "${name.toLowerCase().replace(/\s/g, '-')}",
  "name": "${name}",
  "category": "${category}",
  "what_it_does": "...",
  "problem_solved": "...",
  "use_case_smartops": "...",
  "use_case_clients": "...",
  "cost": "${cost || 'desconhecido'}",
  "risks": ["risco 1", "risco 2"],
  "alternatives": ["alternativa 1"],
  "scores": {
    "business_impact": 0-10,
    "technical_fit": 0-10,
    "integration_fit": 0-10,
    "cost_efficiency": 0-10,
    "risk": 0-10,
    "maturity": 0-10,
    "strategic_advantage": 0-10
  },
  "next_action": "...",
  "verdict": "adotar | poc | monitorar | rejeitar",
  "justification": "..."
}

CRITÉRIOS:
- business_impact: quanto impacta receita ou custo?
- technical_fit: encaixa no stack?
- integration_fit: fácil de integrar com n8n/Claude?
- cost_efficiency: custo vs benefício?
- risk: risco de vendor lock-in, segurança, instabilidade?
- maturity: ferramenta madura ou experimental?
- strategic_advantage: dá vantagem competitiva?`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ToolEvaluationAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);

  const total = calculateTotalScore(data.scores || {});
  return {
    ...TOOL_EVALUATION_SCHEMA, ...data,
    total_score:    total,
    recommendation: scoreToRecommendation(total),
    evaluated_at:   new Date().toISOString(),
  };
}

// ── Compare two tools ──────────────────────────────────────────────────────────
async function compareTools(tool1, tool2, useCase) {
  const prompt = `Compare ${tool1} vs ${tool2} para o caso de uso: ${useCase}

SmartOps IA: consultoria Lean + IA para PMEs em BH/MG.

Retorne JSON:
{
  "use_case": "${useCase}",
  "winner": "...",
  "reasoning": "...",
  "tool_a": {"name": "${tool1}", "pros": [], "cons": [], "score": 0},
  "tool_b": {"name": "${tool2}", "pros": [], "cons": [], "score": 0},
  "recommendation": "...",
  "migration_effort": "baixo | médio | alto",
  "cost_comparison": "..."
}`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: 1500,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('compareTools: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Score a tool from raw numbers ─────────────────────────────────────────────
function quickScore(scores) {
  const total = calculateTotalScore(scores);
  return { total, recommendation: scoreToRecommendation(total) };
}

module.exports = { evaluateTool, compareTools, quickScore };
