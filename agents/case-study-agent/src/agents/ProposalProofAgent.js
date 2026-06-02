// ProposalProofAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Mapeamento de cases a situações de venda ─────────────────────────────────

function matchCaseToProposal({ targetSector, targetPain, cases }) {
  if (!cases || !cases.length) return null;
  return cases
    .filter(c => c.sector === targetSector || c.pain === targetPain)
    .sort((a, b) => (b.roi || 0) - (a.roi || 0))
    .slice(0, 3);
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateProposalBlock({ caseName, client: clientName, sector, problem, solution, result, roi, payback, targetSector, targetPain, permissionLevel = 1 }) {
  const isAnonymous  = permissionLevel < 3;
  const caseLabel    = isAnonymous ? `[Case: ${sector} — anônimo]` : clientName;

  const prompt = `Você é o Proposal Proof Agent da SmartOps IA.
Sua missão é criar blocos de prova social para propostas comerciais que aumentem a taxa de fechamento.

CASE DE REFERÊNCIA:
- ${caseLabel}
- Setor: ${sector}
- Problema: ${problem}
- Solução: ${solution}
- Resultado: ${result}
- ROI: ${roi ? roi + 'x' : 'positivo'}
- Payback: ${payback ? payback + ' meses' : 'curto prazo'}
- Nível de permissão: ${permissionLevel} — ${CONFIG.permission_levels[permissionLevel].label}

PROSPECT ALVO:
- Setor: ${targetSector || sector}
- Dor principal: ${targetPain || problem}

Gere um bloco de prova social para proposta:

=== BLOCO PROVA SOCIAL — PROPOSTA COMERCIAL ===

TÍTULO_DO_BLOCO: [Ex: "Resultado Real: [setor]"]

CONTEXTO_DO_CASE: [1-2 frases sobre o cliente/setor — sem identificar se anônimo]

O_PROBLEMA: [1-2 frases sobre o problema que tinha]

A_SOLUÇÃO: [1-2 frases sobre o que a SmartOps fez]

O_RESULTADO: [dados concretos — destacar ROI, economia, redução percentual]

DESTAQUE_VISUAL: [número ou % que deve aparecer em destaque — ex: 40% de redução]

RELEVÂNCIA_PARA_O_PROSPECT: [2-3 frases conectando o case com a dor do prospect]

CITAÇÃO_DO_CASE: [se disponível — entre aspas — ou indicar "Depoimento disponível"]

CTA_DA_PROPOSTA: [frase de fechamento — ex: "Podemos replicar esses resultados em sua empresa."]

---

ARGUMENTO_DE_VENDA: [como usar esse case oralmente em reunião — 3-4 frases]
OBJEÇÃO_QUEBRADA: [qual objeção do prospect esse case elimina]
PERGUNTA_DE_TRANSIÇÃO: [pergunta para fazer após apresentar o case em reunião]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    caseName,
    sector,
    targetSector,
    targetPain,
    permissionLevel,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { generateProposalBlock, matchCaseToProposal };
