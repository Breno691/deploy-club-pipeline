// LessonsLearnedAgent.js — Organizational Learning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function classifyImpact(lesson) {
  const text = (lesson.description + ' ' + (lesson.evidence || '')).toLowerCase();
  let score = 0;
  if (/receita|cliente|fechamento|venda/i.test(text)) score += 25;
  if (/custo|desperdício|redução|economia/i.test(text)) score += 20;
  if (/erro recorrente|padrão|repetiu/i.test(text)) score += 30;
  if (/agente|automação|processo/i.test(text)) score += 15;
  if (/ads|campanha|anúncio/i.test(text)) score += 15;
  return Math.min(100, score);
}

function createLessonRecord({ area, event, what_happened, why, impact = '', action = '' }) {
  return {
    id:            `lesson-${Date.now()}`,
    area,
    event_type:    'lesson',
    title:         event,
    what_happened,
    root_cause:    why,
    business_impact: impact,
    recommended_action: action,
    status:        'captured',
    impact_score:  classifyImpact({ description: event + ' ' + what_happened }),
    captured_at:   new Date().toISOString(),
    playbook_update_required: false,
    sop_required:  false,
  };
}

async function captureAndAnalyzeLesson({ area, event, context = '' }) {
  const prompt = `Você é o Lessons Learned Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Capture e analise este evento de aprendizado.

Área: ${area}
Evento: ${event}
Contexto adicional: ${context || 'nenhum'}

Responda as 8 perguntas SmartOps:
1. O que aconteceu?
2. Por que aconteceu?
3. Qual impacto?
4. O que fazer agora?
5. Qual prioridade?
6. Qual ROI esperado?
7. Qual risco de não agir?
8. Como medir sucesso?

Retorne JSON:
{
  "lesson_id": "lesson-${Date.now()}",
  "area": "${area}",
  "event": "${event}",
  "what_happened": "descrição clara e objetiva",
  "root_cause": "causa raiz — por que aconteceu",
  "business_impact": "impacto no negócio (receita, processo, cliente, tempo)",
  "lesson": "aprendizado central em 1-2 frases",
  "recommended_action": "ação específica e acionável",
  "priority": "P1 | P2 | P3",
  "roi_if_acted": "ganho estimado ao agir",
  "risk_if_ignored": "consequência de ignorar",
  "success_metric": "como medir se o aprendizado foi aplicado",
  "playbook_to_update": "${area} playbook | nenhum",
  "sop_to_create": "nome do SOP | nenhum",
  "pattern_detected": "padrão identificado | nenhum",
  "agents_to_notify": ["agente 1", "agente 2"],
  "repeat_prevention": "como evitar que aconteça de novo",
  "status": "captured",
  "impact_score": 0,
  "tags": ["tag1", "tag2"]
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LessonsLearnedAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.impact_score = classifyImpact({ description: event + ' ' + data.lesson });
  data.captured_at = new Date().toISOString();
  return data;
}

async function rankAndPrioritizeLessons(lessons = []) {
  if (lessons.length === 0) {
    return { message: 'Nenhuma lição para priorizar ainda. Comece capturando aprendizados.', lessons: [] };
  }

  const rankedLessons = lessons
    .map(l => ({ ...l, impact_score: l.impact_score || classifyImpact({ description: l.event + ' ' + (l.lesson || '') }) }))
    .sort((a, b) => b.impact_score - a.impact_score);

  const topLessons = rankedLessons.slice(0, 5);

  const prompt = `Você é o Lessons Learned Agent da SmartOps IA.

Priorize estas lições e crie um plano de ação.

Top lições por impacto:
${JSON.stringify(topLessons, null, 2)}

Retorne JSON:
{
  "prioritized_lessons": [
    {
      "rank": 1,
      "lesson_id": "...",
      "title": "...",
      "why_priority": "por que priorizar",
      "action_this_week": "ação específica para esta semana",
      "expected_impact": "impacto esperado"
    }
  ],
  "playbooks_to_update": ["playbook 1", "playbook 2"],
  "sops_to_create": ["sop 1"],
  "patterns_emerging": ["padrão emergente"],
  "top_recommendation": "recomendação principal desta semana"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('rankLessons: no JSON');
  const result = JSON.parse(jsonMatch[0]);
  result.all_lessons_count = lessons.length;
  result.ranked_lessons = rankedLessons;
  return result;
}

module.exports = { captureAndAnalyzeLesson, rankAndPrioritizeLessons, createLessonRecord, classifyImpact };
