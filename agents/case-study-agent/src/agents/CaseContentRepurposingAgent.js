// CaseContentRepurposingAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Assets disponíveis por nível de permissão ────────────────────────────────

function getAssetsForPermissionLevel(level) {
  const all = CONFIG.repurposing_assets;
  if (level >= 4) return all;
  if (level >= 2) return all.filter(a => !['sales_slide'].includes(a));
  if (level >= 1) return all.filter(a => !['sales_slide', 'pdf_case'].includes(a));
  return ['objection_answer']; // só interno
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function repurposeCase({ caseName, client: clientName, sector, problem, solution, result, roi, payback, permissionLevel = 1, context = '' }) {
  const availableAssets = getAssetsForPermissionLevel(permissionLevel);
  const isAnonymous     = permissionLevel < 3;
  const subjectLabel    = isAnonymous ? `Uma empresa do setor de ${sector} em BH` : clientName;

  const prompt = `Você é o Case Content Repurposing Agent da SmartOps IA.
Sua missão é transformar um case em múltiplos ativos de conteúdo e venda.

CASE: ${caseName || 'Case SmartOps'}
EMPRESA: ${subjectLabel}
SETOR: ${sector}
PROBLEMA: ${problem}
SOLUÇÃO: ${solution}
RESULTADO: ${result}
ROI: ${roi ? roi + 'x' : 'não calculado'}
PAYBACK: ${payback ? payback + ' meses' : 'não calculado'}
NÍVEL DE PERMISSÃO: ${permissionLevel} — ${CONFIG.permission_levels[permissionLevel].label}
CONTEXTO: ${context || 'nenhum'}

Ativos disponíveis para este nível: ${availableAssets.join(', ')}

Gere TODOS os ativos abaixo:

=== 1. POST LINKEDIN ===
[Texto profissional — 4-5 parágrafos — use dados reais — termine com pergunta ou CTA]

=== 2. CARROSSEL INSTAGRAM (6-8 slides) ===
SLIDE 1 — CAPA: [título chamativo + subtítulo]
SLIDE 2 — PROBLEMA: [descrição do problema]
SLIDE 3 — DADOS ANTES: [métricas before]
SLIDE 4 — INTERVENÇÃO: [o que foi feito]
SLIDE 5 — RESULTADO: [dados after]
SLIDE 6 — ROI: [ROI e payback]
SLIDE 7 — APRENDIZADO: [lição principal]
SLIDE 8 — CTA: [chamada para ação]

=== 3. SCRIPT DE REEL (30-60 segundos) ===
[Roteiro com tempo marcado — voz em primeira pessoa como se fosse o Breno narrando]
0-5s: [hook — problema que o público se identifica]
5-20s: [situação real — antes]
20-40s: [o que foi feito]
40-55s: [resultado]
55-60s: [CTA]

=== 4. BLOCO DE PROPOSTA ===
[Texto formal de 2-3 parágrafos para incluir em proposta comercial]
[Include: contexto do case, solução, resultado com números, relevância para o prospect]

=== 5. SEÇÃO DE SITE ===
HEADLINE: [título para card de case no site]
SUBTITULO: [1 linha descrevendo o projeto]
RESULTADO_DESTAQUE: [número/resultado principal em destaque]
DESCRICAO: [2-3 frases descrevendo o case]
CTA: [botão ou link — "Ler case completo" / "Ver mais resultados"]

=== 6. EMAIL DE PROVA SOCIAL ===
ASSUNTO: [linha de assunto persuasiva]
CORPO: [email de 3-4 parágrafos — tom conversacional — case como prova — CTA ao final]

=== 7. RESPOSTA A OBJEÇÃO ===
OBJECAO: [objeção que este case quebra]
RESPOSTA: [como usar o case para responder essa objeção em reunião de venda]

=== RESUMO ===
ASSETS_CRIADOS: [lista dos ativos gerados]
PRIORIDADE_DE_USO: [qual usar primeiro e por quê]
PROXIMO_PASSO: [ação imediata recomendada]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: 6000,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    caseName,
    sector,
    permissionLevel,
    availableAssets,
    isAnonymous,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { repurposeCase, getAssetsForPermissionLevel };
