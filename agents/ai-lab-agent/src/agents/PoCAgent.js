// PoCAgent.js — AI Lab Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { POC_SCHEMA, validatePoC, evaluatePoC } = require('../poc/poc.schema');

const client = new Anthropic();

// ── Create a PoC plan from a technology idea ──────────────────────────────────
async function createPoCPlan({ technology, problem, targetAgent, expectedBenefit }) {
  const prompt = `Você é o PoC Agent da SmartOps IA.

SmartOps IA: consultoria Lean + IA para PMEs em BH/MG.

Crie um plano de Prova de Conceito (PoC) objetiva e mensurável.

Tecnologia: ${technology}
Problema a resolver: ${problem}
Agente que se beneficia: ${targetAgent || 'operação geral'}
Benefício esperado: ${expectedBenefit}

Restrições:
- Máximo ${CONFIG.poc.maxDays} dias
- Máximo $${CONFIG.poc.maxCost} USD de custo
- Sem alterar stack de produção

Retorne JSON:
{
  "poc_id": "poc-${Date.now()}",
  "name": "...",
  "problem": "${problem}",
  "hypothesis": "...",
  "technology": "${technology}",
  "owner_agent": "${targetAgent || 'ai-lab-agent'}",
  "timebox": 7,
  "cost_estimate": 0,
  "success_metric": "...",
  "expected_result": "...",
  "risk": "baixo | médio | alto",
  "implementation_steps": ["passo 1", "passo 2", "passo 3"],
  "decision_criteria": "implementar se X, rejeitar se Y",
  "rollback_plan": "como reverter se der errado",
  "next_action_if_success": "...",
  "next_action_if_fail": "..."
}

REGRAS:
- PoC deve ser pequena, barata e rápida
- Métrica de sucesso deve ser mensurável
- Custo deve ser justificado pelo benefício esperado
- Se custo > $${CONFIG.poc.maxCost} ou tempo > ${CONFIG.poc.maxDays} dias, simplifique`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PoCAgent: no JSON from Claude');
  const poc = { ...POC_SCHEMA, ...JSON.parse(jsonMatch[0]), status: 'planned', created_at: new Date().toISOString() };
  validatePoC(poc);
  return poc;
}

// ── Generate PoC result report ─────────────────────────────────────────────────
async function evaluatePoCResult(poc, outcome) {
  const prompt = `Você é o PoC Agent da SmartOps IA.

PoC executada:
Nome: ${poc.name}
Hipótese: ${poc.hypothesis}
Métrica de sucesso: ${poc.success_metric}
Resultado esperado: ${poc.expected_result}

Outcome real: ${JSON.stringify(outcome)}

Avalie e retorne JSON:
{
  "was_successful": true | false,
  "partial": true | false,
  "metric_achieved": "...",
  "expected_vs_actual": "...",
  "lessons": "...",
  "decision": "implement | reject | iterate | monitor",
  "next_step": "...",
  "recommendation_for_agents": "qual agente deve adotar essa tecnologia e como"
}`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: 1500,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('evaluatePoCResult: no JSON');
  return evaluatePoC(poc, JSON.parse(jsonMatch[0]));
}

module.exports = { createPoCPlan, evaluatePoCResult };
