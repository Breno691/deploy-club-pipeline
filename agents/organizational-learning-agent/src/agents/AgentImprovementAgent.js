// AgentImprovementAgent.js — Organizational Learning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function calculateLearningScore(metrics = {}) {
  const {
    learnings_captured = 0, changes_implemented = 0, playbooks_updated = 0,
    recurring_errors_reduced = 0, improvements_with_impact = 0,
    agents_improved = 0, decisions_reviewed = 0, sops_created = 0,
    knowledge_reused = 0,
  } = metrics;

  const maxValues = {
    learnings_captured:       20,
    changes_implemented:      10,
    playbooks_updated:         5,
    recurring_errors_reduced:  5,
    improvements_with_impact:  8,
    agents_improved:           5,
    decisions_reviewed:        5,
    sops_created:              5,
    knowledge_reused:         10,
  };

  const weights = {
    learnings_captured:       20,
    changes_implemented:      20,
    playbooks_updated:        15,
    recurring_errors_reduced: 15,
    improvements_with_impact: 10,
    agents_improved:           8,
    decisions_reviewed:        5,
    sops_created:              5,
    knowledge_reused:          2,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const value = metrics[key] || 0;
    const max = maxValues[key] || 1;
    score += Math.min((value / max) * weight, weight);
  }

  const finalScore = Math.round(score);
  const level = Object.entries(CONFIG.score_levels)
    .sort((a, b) => b[1].min - a[1].min)
    .find(([, v]) => finalScore >= v.min);

  return {
    score: finalScore,
    level: level ? level[1].label : 'Empresa Não Aprende',
    target: CONFIG.triggers.learning_score_meta,
    gap:    Math.max(0, CONFIG.triggers.learning_score_meta - finalScore),
    metrics_breakdown: Object.entries(weights).map(([key, weight]) => ({
      metric: key,
      value:  metrics[key] || 0,
      max:    maxValues[key],
      contribution: Math.min(((metrics[key] || 0) / maxValues[key]) * weight, weight).toFixed(1),
    })),
  };
}

async function reviewAgentPerformance({ agentName, observations = [], period = '' }) {
  const prompt = `Você é o Agent Improvement Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Revise a performance deste agente e sugira melhorias.

Agente: ${agentName}
Período: ${period || 'última semana'}
Observações de uso:
${JSON.stringify(observations, null, 2)}

Para este agente, avalie:
- entregou valor mensurável?
- seguiu o formato SmartOps (8 perguntas + 10 elementos)?
- gerou ações concretas?
- causou retrabalho ou confusão?
- precisa de dados que não tem?
- precisa de ferramenta nova?
- prompt precisa de ajuste?
- memória está desatualizada?

Retorne JSON:
{
  "agent": "${agentName}",
  "review_period": "${period || 'última semana'}",
  "performance_score": 0,
  "performance_label": "excelente | bom | regular | fraco | não usado",
  "what_worked": ["o que funcionou bem"],
  "what_failed": ["o que falhou ou causou problema"],
  "data_gaps": ["dados que faltam para o agente funcionar melhor"],
  "tool_gaps": ["ferramentas que faltam"],
  "prompt_updates": [
    { "issue": "problema no prompt", "suggested_fix": "ajuste sugerido", "priority": "P1 | P2" }
  ],
  "memory_updates": ["memória desatualizada que precisa de atualização"],
  "workflow_updates": ["conexão ou workflow que precisa melhorar"],
  "autonomy_recommendation": "aumentar | manter | reduzir",
  "autonomy_reason": "por que",
  "next_capability": "próxima capacidade que o agente deveria ter",
  "integration_opportunity": "com qual outro agente deveria integrar melhor",
  "priority": "P1 | P2 | P3",
  "next_review": "em X dias",
  "recommendation": "recomendação principal para este agente"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AgentImprovementAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.reviewed_at = new Date().toISOString();
  return data;
}

async function logDecision({ decision, context, why, options = [], expectedResult = '', metric = '' }) {
  const decisionRecord = {
    decision_id:     `dec-${Date.now()}`,
    date:            new Date().toISOString().split('T')[0],
    decision,
    context,
    why,
    options_considered: options,
    expected_result: expectedResult,
    success_metric:  metric,
    owner:           'Breno Luiz',
    status:          'active',
    review_date:     null,
    actual_result:   null,
    learning:        null,
    created_at:      new Date().toISOString(),
  };

  const prompt = `Você é o Agent Improvement Agent da SmartOps IA.

Registre e analise esta decisão estratégica.

Decisão: ${decision}
Contexto: ${context}
Motivo: ${why}
Opções consideradas: ${options.join(', ') || 'não informadas'}
Resultado esperado: ${expectedResult || 'não informado'}

Retorne JSON com análise da decisão:
{
  "decision_quality": "boa | razoável | incerta | arriscada",
  "risks": ["risco 1", "risco 2"],
  "alternatives_assessment": "avaliação das alternativas consideradas",
  "success_indicators": ["indicador de sucesso 1", "indicador de sucesso 2"],
  "review_trigger": "quando revisar esta decisão",
  "review_date_recommendation": "em X dias",
  "related_decisions": ["decisão relacionada"],
  "learning_opportunity": "o que esta decisão pode ensinar",
  "ceo_note": "nota executiva em 1 linha"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return decisionRecord;

  const analysis = JSON.parse(jsonMatch[0]);
  return { ...decisionRecord, analysis };
}

module.exports = { reviewAgentPerformance, logDecision, calculateLearningScore };
