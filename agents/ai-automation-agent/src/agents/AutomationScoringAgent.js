// AutomationScoringAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcAutomationScore, classifyScore, rankOpportunities } = require('../scoring/automationScore');

const client = new Anthropic();

function scoreLocally(candidates) {
  const ranked = rankOpportunities(candidates);
  return {
    ranked,
    top_3: ranked.slice(0, 3),
    summary: {
      total:             ranked.length,
      automatizar_agora: ranked.filter(c => c.automation_score >= 85).length,
      poc:               ranked.filter(c => c.automation_score >= 70 && c.automation_score < 85).length,
      melhorar_antes:    ranked.filter(c => c.automation_score >= 50 && c.automation_score < 70).length,
      nao_automatizar:   ranked.filter(c => c.automation_score < 50).length,
    },
  };
}

async function scoreAutomationsWithClaude(candidates) {
  const localResult = scoreLocally(candidates);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Automation Scoring Agent da SmartOps IA.

Missão: Avaliar e priorizar automações por score 0-100. Critério principal: ROI real e viabilidade técnica.

## CANDIDATOS RECEBIDOS:
${candidates.map((c, i) => `${i + 1}. ${c.name || c.process_name || 'Sem nome'}
   - Frequência: ${c.frequency || '?'}
   - Tempo por execução: ${c.time_per_execution || '?'}h
   - Volume mensal: ${c.monthly_volume || '?'}x
   - Dor: ${c.pain || '?'}
   - Score calculado localmente: ${c.automation_score || calcAutomationScore({})}/100`).join('\n\n')}

## CLASSIFICAÇÃO LOCAL:
- Automatizar agora (85-100): ${localResult.summary.automatizar_agora}
- Criar PoC (70-84): ${localResult.summary.poc}
- Melhorar antes (50-69): ${localResult.summary.melhorar_antes}
- Não automatizar (<50): ${localResult.summary.nao_automatizar}

---

Analise e responda:

# AUTOMATION SCORING REPORT

## RANKING FINAL (com justificativa)
Para cada candidato:

AUTOMAÇÃO: [nome]
SCORE FINAL: [0-100]
CLASSIFICAÇÃO: [Automatizar Agora / PoC / Melhorar Antes / Não Automatizar]
CRITÉRIOS FORTES: [o que puxou o score para cima]
CRITÉRIOS FRACOS: [o que limitou o score]
DECISÃO: [recomendação em 1 linha]

## PRÓXIMA AÇÃO POR PRIORIDADE
1. [automação #1 — o que fazer imediatamente]
2. [automação #2 — próximo passo]
3. [automação #3 — quando abordar]

## AVISO DE RISCO
[qualquer automação com risco alto que precisa atenção especial]`,
    }],
  });

  return { analysis: response.content[0].text, local_scores: localResult };
}

module.exports = { scoreLocally, scoreAutomationsWithClaude };
