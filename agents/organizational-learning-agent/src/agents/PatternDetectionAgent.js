// PatternDetectionAgent.js — Organizational Learning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const PATTERN_TYPES = {
  recurring_error:   'Erro que se repete → precisa de SOP ou prevenção',
  recurring_win:     'Acerto que se repete → deve virar padrão ou playbook',
  recurring_bottleneck: 'Gargalo que aparece sempre → processo precisa mudar',
  ideal_client:      'Perfil de cliente que dá mais resultado → atualizar ICP',
  bad_lead:          'Perfil de lead que nunca fecha → filtrar antes',
  winning_channel:   'Canal que consistentemente traz cliente bom',
  losing_channel:    'Canal com custo alto e resultado ruim',
  agent_failure:     'Agente que falha em padrão específico',
  agent_win:         'Agente que consistentemente gera valor',
};

async function detectPatterns(events = [], historyData = {}) {
  const hasData = events.length > 0 || Object.keys(historyData).length > 0;

  const prompt = `Você é o Pattern Detection Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Analise eventos e histórico para detectar padrões.

Eventos recentes:
${JSON.stringify(events.slice(0, 10), null, 2)}

Histórico disponível:
${JSON.stringify(historyData, null, 2)}

Tipos de padrão a detectar:
${JSON.stringify(PATTERN_TYPES, null, 2)}

Regra: um padrão só é confirmado quando ocorre 2+ vezes.

Retorne JSON:
{
  "detection_date": "${new Date().toISOString().split('T')[0]}",
  "data_quality": "${hasData ? 'com dados' : 'sem dados — análise baseada no contexto SmartOps'}",
  "patterns": [
    {
      "pattern_id": "pat-${Date.now()}",
      "type": "tipo do padrão",
      "title": "título descritivo do padrão",
      "description": "descrição do padrão detectado",
      "evidence_count": 0,
      "evidence": ["evidência 1", "evidência 2"],
      "area": "área afetada",
      "impact": "alto | médio | baixo",
      "recommended_action": "ação para aproveitar ou prevenir",
      "playbook_update": "playbook afetado | nenhum",
      "sop_to_create": "SOP a criar | nenhum",
      "urgency": "imediata | semana | mês"
    }
  ],
  "success_patterns": ["padrão de sucesso 1", "padrão de sucesso 2"],
  "failure_patterns": ["padrão de falha 1", "padrão de falha 2"],
  "top_pattern": "padrão mais importante a agir agora",
  "emerging_patterns": ["padrão que pode se confirmar"],
  "patterns_requiring_sop": ["padrão que precisa virar SOP"],
  "patterns_requiring_playbook": ["padrão que precisa atualizar playbook"],
  "insight": "insight principal sobre o sistema SmartOps IA",
  "recommendation": "recomendação estratégica de aprendizado"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PatternDetectionAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

async function analyzeRecurringProblems(problems = []) {
  const byArea = problems.reduce((acc, p) => {
    const area = p.area || 'geral';
    if (!acc[area]) acc[area] = [];
    acc[area].push(p);
    return acc;
  }, {});

  const recurringAreas = Object.entries(byArea)
    .filter(([, items]) => items.length >= CONFIG.triggers.erro_repetido_count)
    .map(([area, items]) => ({ area, count: items.length, problems: items }));

  return {
    total_problems: problems.length,
    recurring_areas: recurringAreas,
    areas_needing_sop: recurringAreas.map(a => a.area),
    highest_frequency_area: recurringAreas.sort((a, b) => b.count - a.count)[0]?.area || 'nenhuma',
    recommendation: recurringAreas.length > 0
      ? `Criar SOPs para: ${recurringAreas.map(a => a.area).join(', ')}`
      : 'Nenhum problema recorrente identificado ainda — continuar capturando dados',
  };
}

module.exports = { detectPatterns, analyzeRecurringProblems, PATTERN_TYPES };
