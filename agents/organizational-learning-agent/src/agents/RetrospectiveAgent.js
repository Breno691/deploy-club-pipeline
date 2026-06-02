// RetrospectiveAgent.js — Organizational Learning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const RETRO_TYPES = {
  weekly:   'Retrospectiva semanal — captura aprendizados dos últimos 7 dias',
  monthly:  'Retrospectiva mensal — revisão completa do mês com 3-3-3',
  campaign: 'Retrospectiva de campanha — o que funcionou e o que não funcionou',
  project:  'Retrospectiva de projeto — entrega, prazo, resultado, cliente',
  client:   'Retrospectiva de cliente — onboarding, entrega, resultado, satisfação',
  agent:    'Retrospectiva de agente — performance, falhas, melhorias',
  sales:    'Retrospectiva de vendas — ganhos, perdas, objeções, padrões',
};

async function generateRetrospective({ type = 'monthly', period = '', context = '', data = {} }) {
  const typeDesc = RETRO_TYPES[type] || type;
  const currentPeriod = period || new Date().toISOString().split('T')[0];

  const prompt = `Você é o Retrospective Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Fundada por Breno Luiz — Black Belt Lean Six Sigma.

Conduz uma retrospectiva rigorosa que gera aprendizado e melhoria real.

Tipo: ${typeDesc}
Período: ${currentPeriod}
Contexto adicional: ${context || 'retrospectiva geral da SmartOps IA'}
Dados disponíveis: ${JSON.stringify(data, null, 2)}

Use o formato 3-3-3 EXPANDIDO:

3 WINS:
Para cada win:
- resultado concreto
- evidência (número ou prova)
- por que funcionou
- como repetir ou escalar

3 LEARNINGS:
Para cada aprendizado:
- o que aconteceu
- por que aconteceu (causa raiz)
- impacto no negócio
- mudança recomendada

3 CHANGES:
Para cada mudança:
- ação específica
- responsável (agente ou pessoa)
- prazo em dias
- métrica de sucesso
- playbook/SOP afetado

Retorne JSON:
{
  "retro_id": "retro-${Date.now()}",
  "retro_type": "${type}",
  "period": "${currentPeriod}",
  "generated_at": "${new Date().toISOString()}",
  "wins": [
    {
      "number": 1,
      "title": "título do win",
      "result": "resultado mensurável",
      "evidence": "prova ou dado",
      "why_it_worked": "causa do sucesso",
      "how_to_repeat": "como replicar",
      "scale_opportunity": "onde mais aplicar"
    }
  ],
  "learnings": [
    {
      "number": 1,
      "title": "título do aprendizado",
      "what_happened": "o que aconteceu",
      "root_cause": "por que aconteceu",
      "business_impact": "impacto no negócio",
      "recommended_change": "mudança recomendada",
      "area_affected": "área afetada"
    }
  ],
  "changes": [
    {
      "number": 1,
      "action": "ação específica e concreta",
      "owner": "agente ou responsável",
      "deadline_days": 7,
      "success_metric": "como medir se funcionou",
      "playbook_affected": "playbook que precisa atualizar",
      "sop_to_create": "SOP a criar se necessário",
      "priority": "P1 | P2 | P3"
    }
  ],
  "decisions_to_review": ["decisão para revisar 1"],
  "playbook_updates_recommended": [
    { "playbook": "nome", "section": "seção", "update": "o que mudar" }
  ],
  "patterns_identified": ["padrão de sucesso ou falha identificado"],
  "agent_improvements": ["agente que precisa de melhoria"],
  "next_retro_focus": "foco da próxima retrospectiva",
  "learning_score_delta": "impacto estimado no learning score",
  "executive_summary": "resumo para CEO Advisor em 3 linhas"
}

REGRAS:
- Cada win, learning e change deve ser específico e acionável
- Nunca inventar dados — use estimativas quando sem dados
- Prioridade P1 = ação em 7 dias, P2 = 30 dias, P3 = 90 dias

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('RetrospectiveAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

async function generateWeeklyRetro(weekData = {}) {
  return generateRetrospective({
    type: 'weekly',
    period: `Semana de ${new Date().toISOString().split('T')[0]}`,
    context: 'Retrospectiva semanal SmartOps IA — capturar aprendizados dos últimos 7 dias',
    data: weekData,
  });
}

async function generateMonthlyRetro(monthData = {}) {
  const month = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  return generateRetrospective({
    type: 'monthly',
    period: month,
    context: `Retrospectiva mensal completa — ${month}`,
    data: monthData,
  });
}

async function generateCampaignRetro(campaignData = {}) {
  return generateRetrospective({
    type: 'campaign',
    period: campaignData.period || new Date().toISOString().split('T')[0],
    context: `Retrospectiva de campanha: ${campaignData.name || 'campanha'}`,
    data: campaignData,
  });
}

module.exports = { generateRetrospective, generateWeeklyRetro, generateMonthlyRetro, generateCampaignRetro, RETRO_TYPES };
