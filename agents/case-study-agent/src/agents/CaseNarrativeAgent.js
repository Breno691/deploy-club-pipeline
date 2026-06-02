// CaseNarrativeAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Seletor de framework ─────────────────────────────────────────────────────

function selectBestFramework({ caseType, hasROI, hasBeforeAfter, hasCostData }) {
  if (hasROI && hasCostData)  return 'roi-story';
  if (hasBeforeAfter)         return 'before-after-bridge';
  if (caseType === 'automacao') return 'process-transformation';
  return 'problem-solution-result';
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateNarrative({ caseName, client: clientName, sector, problem, solution, result, roi, payback, framework, anonymous = true, context = '' }) {
  const fw = framework || selectBestFramework({
    caseType:       caseName,
    hasROI:         !!roi,
    hasBeforeAfter: true,
    hasCostData:    !!payback,
  });

  const fwLabel = CONFIG.narrative_frameworks[fw] || 'Problema → Solução → Resultado';
  const subjectLabel = anonymous ? `Uma empresa do setor de ${sector} em BH` : clientName;

  const prompt = `Você é o Case Narrative Agent da SmartOps IA.
Sua missão é transformar resultados técnicos em histórias claras, emocionais e persuasivas.

Framework selecionado: ${fwLabel}

DADOS DO CASE:
- Empresa: ${subjectLabel}
- Problema: ${problem}
- Solução: ${solution}
- Resultado: ${result}
- ROI: ${roi ? roi + 'x' : 'a calcular'}
- Payback: ${payback ? payback + ' meses' : 'a calcular'}
- Contexto: ${context || 'nenhum'}

Gere a narrativa completa no formato:

TITLE: [título persuasivo — máximo 12 palavras]

HOOK: [primeira frase que prende atenção — 1 linha]

CONTEXT: [contexto da empresa — 2-3 linhas — neutro, sem nome se anônimo]

PROBLEM: [o problema com detalhes — 3-4 linhas — incluir dor, impacto, urgência]

WHAT_WAS_AT_STAKE: [o que aconteceria se não resolvessem — 2-3 linhas]

SOLUTION: [a solução SmartOps — 3-4 linhas — método, execução, diferencial]

RESULT: [o resultado — 3-4 linhas — números, comparação, impacto real]

WHY_IT_WORKED: [por que funcionou — raciocínio do método — 2-3 linhas]

LESSON: [aprendizado principal — 1-2 linhas — aplicável a outros casos]

CTA: [chamada para ação — 1 linha — para usar em proposta, post ou site]

---

VERSAO_HEADLINE_CURTA: [título curto — 6-8 palavras — para post e slide]
VERSAO_POST_INSTAGRAM: [legenda de 3-4 parágrafos — tom conversacional — para Instagram]
VERSAO_LINKEDIN: [texto profissional — 4-5 parágrafos — para LinkedIn]
VERSAO_PROPOSTA: [bloco de 2-3 parágrafos — formal — para documento de proposta]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    caseName,
    client: clientName,
    sector,
    framework: fw,
    anonymous,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { generateNarrative, selectBestFramework };
