// FailureAnalysisAgent.js — Organizational Learning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function analyzeFailure({ area, event, impact = '', context = '' }) {
  const prompt = `Você é o Failure Analysis Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Analise esta falha com rigor e transforme em prevenção.

Área: ${area}
Falha: ${event}
Impacto informado: ${impact || 'não informado'}
Contexto: ${context || 'nenhum'}

Use a metodologia Lean Six Sigma:
- 5 Porquês para identificar causa raiz
- Ishikawa para categorizar fatores
- Plano de prevenção com responsável e prazo

Retorne JSON:
{
  "failure_id": "fail-${Date.now()}",
  "area": "${area}",
  "failure": "${event}",
  "severity": "crítico | alto | médio | baixo",
  "what_happened": "descrição objetiva da falha",
  "business_impact": "impacto financeiro, operacional ou reputacional",
  "five_whys": [
    { "why": 1, "answer": "por que aconteceu" },
    { "why": 2, "answer": "por que esse por que" },
    { "why": 3, "answer": "causa mais profunda" },
    { "why": 4, "answer": "sistema ou processo falho" },
    { "why": 5, "answer": "causa raiz real" }
  ],
  "root_cause": "causa raiz confirmada",
  "contributing_factors": ["fator 1", "fator 2"],
  "why_not_detected_earlier": "o que deveria ter detectado isso antes",
  "detection_gap": "qual alerta ou checklist estava faltando",
  "prevention_plan": [
    { "action": "ação preventiva", "owner": "responsável", "deadline_days": 7, "type": "SOP | playbook | alerta | processo" }
  ],
  "playbook_update": {
    "playbook": "nome do playbook | nenhum",
    "section": "seção a atualizar",
    "old_rule": "regra atual",
    "new_rule": "nova regra proposta"
  },
  "sop_to_create": "nome do SOP | nenhum",
  "alert_to_add": "alerta ou checklist a criar | nenhum",
  "similar_failures_risk": ["outras áreas com risco semelhante"],
  "estimated_cost_of_failure": "custo estimado desta falha",
  "estimated_cost_of_prevention": "custo de implementar a prevenção",
  "agents_to_notify": ["agente 1", "agente 2"],
  "owner": "responsável principal",
  "review_date": "em X dias",
  "status": "analyzed"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('FailureAnalysisAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.analyzed_at = new Date().toISOString();
  return data;
}

async function analyzeSuccessForReplication({ area, event, context = '' }) {
  const prompt = `Você é o Failure Analysis Agent da SmartOps IA — mas agora analisando sucesso para replicação.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Analise este sucesso e crie um plano de replicação.

Área: ${area}
Sucesso: ${event}
Contexto: ${context || 'nenhum'}

Retorne JSON:
{
  "success_id": "win-${Date.now()}",
  "area": "${area}",
  "success": "${event}",
  "what_worked": "o que especificamente funcionou",
  "why_it_worked": "causa do sucesso",
  "evidence": "prova ou dado do sucesso",
  "conditions": ["condição necessária 1", "condição necessária 2"],
  "replication_plan": [
    { "action": "como replicar", "context": "onde aplicar", "expected_result": "resultado esperado" }
  ],
  "where_else_to_apply": ["área 1", "área 2"],
  "playbook_update": {
    "playbook": "nome do playbook",
    "section": "seção",
    "new_rule": "nova regra baseada neste sucesso"
  },
  "scale_opportunity": "como escalar este sucesso",
  "tests_to_run": ["variação para testar"],
  "agents_to_notify": ["agente 1"],
  "time_to_replicate": "tempo estimado para replicar",
  "status": "identified"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('FailureAnalysisAgent success: no JSON');
  const data = JSON.parse(jsonMatch[0]);
  data.analyzed_at = new Date().toISOString();
  return data;
}

module.exports = { analyzeFailure, analyzeSuccessForReplication };
