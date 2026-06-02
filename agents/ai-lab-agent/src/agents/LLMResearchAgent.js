// LLMResearchAgent.js — AI Lab Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const fs        = require('fs');
const path      = require('path');
const { CONFIG, SMARTOPS_AGENTS } = require('../config');

const client = new Anthropic();

function loadModelRegistry() {
  const p = path.join(__dirname, '../memory/modelRegistry.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// ── Benchmark a model on a specific task ───────────────────────────────────────
async function benchmarkModel(modelId, task, prompt) {
  const start = Date.now();
  let result;

  try {
    const response = await client.messages.create({
      model:      modelId,
      max_tokens: 800,
      messages:   [{ role: 'user', content: prompt }],
    });
    result = response.content[0].text;
  } catch (e) {
    return { model: modelId, task, error: e.message, score: 0 };
  }

  const latency = Date.now() - start;
  return { model: modelId, task, result, latency_ms: latency, char_count: result.length };
}

// ── Compare models on a benchmark task ────────────────────────────────────────
async function compareModelsForTask(task) {
  const registry = loadModelRegistry();
  const modelsToTest = registry.models
    .filter(m => m.status !== 'deprecated')
    .map(m => m.id);

  const TASK_PROMPTS = {
    'copy-instagram': 'Crie um hook de Instagram para vender diagnóstico gratuito de consultoria Lean. Máximo 3 linhas.',
    'proposal-commercial': 'Crie uma abertura de proposta comercial para PME de BH com problema de retrabalho. Máximo 5 frases.',
    'lean-diagnosis': 'Liste os 3 desperdícios mais comuns em uma transportadora de BH e sugira ação para cada.',
    'json-remotion': '{"videoId":"lean-001","title":"Teste","scenes":[{"id":"s1","type":"hook","duration":4,"headline":"Retrabalho custa caro"}]}',
  };

  const taskPrompt = TASK_PROMPTS[task] || task;
  const results    = [];

  for (const modelId of modelsToTest) {
    const result = await benchmarkModel(modelId, task, taskPrompt);
    results.push(result);
  }

  return {
    task,
    tested_at: new Date().toISOString(),
    results,
    fastest: results.reduce((a, b) => (a.latency_ms < b.latency_ms ? a : b)),
  };
}

// ── Recommend best model per agent ────────────────────────────────────────────
async function recommendModelsForAgents() {
  const registry = loadModelRegistry();

  const prompt = `Você é o LLM Research Agent da SmartOps IA.

Analise os modelos disponíveis e recomende o melhor para cada agente da empresa.

Agentes: ${SMARTOPS_AGENTS.join(', ')}

Modelos disponíveis:
${registry.models.map(m => `- ${m.id} (${m.provider}): ${m.strengths.join(', ')}`).join('\n')}

Retorne JSON:
{
  "recommendations": [
    {
      "agent": "copywriter-agent",
      "primary_model": "...",
      "fallback_model": "...",
      "reason": "...",
      "estimated_cost_per_run": "R$X"
    }
  ],
  "cost_optimization": "...",
  "quality_vs_cost_recommendation": "..."
}`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LLMResearchAgent: no JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate LLM report ────────────────────────────────────────────────────────
async function generateLLMReport() {
  const registry = loadModelRegistry();
  return {
    generated_at:  new Date().toISOString(),
    total_models:  registry.models.length,
    primary_model: registry.models.find(m => m.status === 'primary'),
    models_summary: registry.models.map(m => ({
      id: m.id, status: m.status, strengths: m.strengths.slice(0, 3),
      recommended_agents: m.recommended_agents,
    })),
    recommendations: 'Ver função recommendModelsForAgents() para recomendações por agente.',
  };
}

module.exports = { benchmarkModel, compareModelsForTask, recommendModelsForAgents, generateLLMReport };
