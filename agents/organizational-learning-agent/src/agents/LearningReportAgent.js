// LearningReportAgent.js — Organizational Learning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calculateLearningScore } = require('./AgentImprovementAgent');

const client = new Anthropic();

async function generateWeeklyLearningReport(weekData = {}) {
  const {
    learnings = [], retros = [], decisions = [],
    playbook_updates = [], sops_created = [],
    failures = [], wins = [], agent_reviews = [],
  } = weekData;

  const scoreMetrics = {
    learnings_captured:        learnings.length,
    changes_implemented:       retros.reduce((s, r) => s + (r.changes?.length || 0), 0),
    playbooks_updated:         playbook_updates.length,
    recurring_errors_reduced:  0,
    improvements_with_impact:  wins.length,
    agents_improved:           agent_reviews.filter(a => a.performance_score >= 70).length,
    decisions_reviewed:        decisions.length,
    sops_created:              sops_created.length,
    knowledge_reused:          0,
  };
  const score = calculateLearningScore(scoreMetrics);

  const prompt = `Você é o Learning Report Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Gere o relatório semanal de aprendizado organizacional.

Dados da semana:
- Aprendizados capturados: ${learnings.length}
- Retrospectivas feitas: ${retros.length}
- Decisões registradas: ${decisions.length}
- Playbooks atualizados: ${playbook_updates.length}
- SOPs criados: ${sops_created.length}
- Falhas analisadas: ${failures.length}
- Wins identificados: ${wins.length}
- Agentes revisados: ${agent_reviews.length}
- Learning Score: ${score.score}/100 (${score.level})

Top aprendizados da semana:
${JSON.stringify(learnings.slice(0, 3), null, 2)}

Top wins:
${JSON.stringify(wins.slice(0, 3), null, 2)}

Top falhas analisadas:
${JSON.stringify(failures.slice(0, 2), null, 2)}

Retorne JSON:
{
  "report_title": "Relatório Semanal de Aprendizado — SmartOps IA",
  "report_date": "${new Date().toISOString().split('T')[0]}",
  "learning_score": ${score.score},
  "learning_level": "${score.level}",
  "executive_summary": "resumo executivo em 3 linhas",
  "top_learnings": ["aprendizado 1", "aprendizado 2", "aprendizado 3"],
  "top_wins": ["win 1", "win 2"],
  "top_failures_addressed": ["falha tratada 1"],
  "recurring_errors": ["erro recorrente identificado"],
  "playbooks_touched": ${playbook_updates.length},
  "knowledge_highlights": ["destaque de conhecimento 1"],
  "agent_performance_summary": "resumo de performance dos agentes",
  "decisions_impact": "impacto das decisões da semana",
  "next_week_learning_focus": "foco de aprendizado para próxima semana",
  "improvement_actions": [
    { "action": "ação de melhoria", "priority": "P1", "owner": "agente ou pessoa", "deadline": "X dias" }
  ],
  "ceo_brief": "brief para CEO em 2 linhas",
  "format": "SMARTOPS_LEARNING_REPORT_v1"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LearningReportAgent: no JSON from Claude');
  const report = JSON.parse(jsonMatch[0]);
  report.score_detail = score;
  return report;
}

async function generateMonthlyOrgReport(monthData = {}) {
  const {
    total_learnings = 0, total_changes = 0, total_playbook_updates = 0,
    total_sops = 0, total_decisions = 0, recurring_errors_fixed = 0,
    retro_3_3_3 = null, highlights = [], score_data = {},
  } = monthData;

  const score = calculateLearningScore(score_data);

  const prompt = `Você é o Learning Report Agent da SmartOps IA.

Gere o relatório mensal de aprendizado organizacional.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Métricas do mês:
- Total aprendizados: ${total_learnings}
- Mudanças implementadas: ${total_changes}
- Playbooks atualizados: ${total_playbook_updates}
- SOPs criados: ${total_sops}
- Decisões registradas: ${total_decisions}
- Erros recorrentes resolvidos: ${recurring_errors_fixed}
- Learning Score: ${score.score}/100

Retrospectiva 3-3-3 do mês:
${JSON.stringify(retro_3_3_3, null, 2)}

Destaques do mês:
${JSON.stringify(highlights, null, 2)}

Retorne JSON:
{
  "report_title": "Relatório Mensal de Aprendizado — SmartOps IA",
  "month": "${new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}",
  "learning_score": ${score.score},
  "learning_level": "${score.level}",
  "executive_summary": "resumo executivo do mês em 3 linhas",
  "monthly_3_3_3": {
    "wins": ["win 1", "win 2", "win 3"],
    "learnings": ["learning 1", "learning 2", "learning 3"],
    "changes": ["mudança 1", "mudança 2", "mudança 3"]
  },
  "knowledge_assets_created": {
    "playbooks_updated": ${total_playbook_updates},
    "sops_created": ${total_sops},
    "decisions_logged": ${total_decisions}
  },
  "error_prevention": "quais erros recorrentes foram eliminados",
  "success_replication": "quais wins foram transformados em padrão",
  "agent_improvements_summary": "evolução dos agentes no mês",
  "learning_velocity": "empresa está aprendendo mais rápido ou mais devagar?",
  "next_month_experiments": ["experimento 1 para testar", "experimento 2"],
  "recommendation_to_ceo": "recomendação principal de melhoria organizacional",
  "format": "SMARTOPS_MONTHLY_LEARNING_v1"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LearningReportAgent monthly: no JSON');
  const report = JSON.parse(jsonMatch[0]);
  report.score_detail = score;
  return report;
}

module.exports = { generateWeeklyLearningReport, generateMonthlyOrgReport };
