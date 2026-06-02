// LandingPageTestingAgent.js — Analisa e testa landing pages para aumentar conversão
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Pontuação por seção da landing page
const LP_SECTIONS = {
  headline:      { weight: 20, checklist: ['Clareza em 5s', 'Benefício específico', 'Problema do cliente', 'Sem jargão'] },
  subheadline:   { weight: 10, checklist: ['Complementa headline', 'Adiciona contexto', 'Não repete'] },
  hero_cta:      { weight: 15, checklist: ['Visível sem scroll', 'Verbo de ação', 'Sem "enviar"', 'Benefício no botão'] },
  social_proof:  { weight: 15, checklist: ['Nome real + empresa', 'Resultado específico', 'Foto ou logo', 'Diversidade de setores'] },
  value_prop:    { weight: 15, checklist: ['3 benefícios claros', 'Resultado, não feature', 'Números concretos'] },
  form:          { weight: 10, checklist: ['≤ 3 campos', 'Label claro', 'Botão persuasivo', 'Privacidade visível'] },
  objection_handle: { weight: 10, checklist: ['FAQ presente', 'Garantia ou risco zero', 'Responde "por que agora?"'] },
  mobile:        { weight: 5,  checklist: ['CTA visível mobile', 'Texto legível', 'Formulário funciona'] },
};

function auditLandingPageLocally(pageData = {}) {
  const scores = {};
  let total = 0;

  Object.entries(LP_SECTIONS).forEach(([section, config]) => {
    const present = pageData[section] || false;
    const score = present ? config.weight : 0;
    scores[section] = { score, max: config.weight, present };
    total += score;
  });

  const issues = Object.entries(scores)
    .filter(([, v]) => !v.present)
    .map(([k]) => ({ section: k, weight: LP_SECTIONS[k].weight, checklist: LP_SECTIONS[k].checklist }))
    .sort((a, b) => b.weight - a.weight);

  return {
    total_score: total,
    max_score: 100,
    grade: total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F',
    scores,
    top_issues: issues.slice(0, 3),
    quick_wins: issues.filter(i => i.weight >= 10).slice(0, 2),
  };
}

async function analyzeLandingPageWithClaude(pageDescription, metrics = {}) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Landing Page Testing Agent da SmartOps IA.

Missão: Auditar landing pages e criar plano de testes A/B para aumentar taxa de conversão.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Página: "${pageDescription}"
Métricas atuais: ${JSON.stringify(metrics, null, 2)}
Baseline conversão: ${CONFIG.baseline_kpis.conversao_site_pct}%
Meta: +${CONFIG.growth_targets.conversao_delta_pct}%/trimestre

Seções avaliadas (por peso):
${Object.entries(LP_SECTIONS).map(([k, v]) => `${k}: ${v.weight} pts — checklist: ${v.checklist.slice(0, 2).join(', ')}`).join('\n')}

Responda:

# LANDING PAGE AUDIT REPORT

## SCORE DA PÁGINA
Nota: [X]/100 — Grau: [A/B/C/D/F]
[1 linha sobre o problema principal]

## ANÁLISE POR SEÇÃO
Para cada seção crítica:
SEÇÃO: [nome]
STATUS: [✅ Adequada / ⚠️ Precisa melhorar / ❌ Ausente/Fraca]
PROBLEMA: [o que falta ou está errado]
IMPACTO: [como isso afeta conversão]
CORREÇÃO: [o que mudar — seja específico]

## TESTES A/B (TOP 3 por impacto)
Para cada teste:
ELEMENTO: [o que testar]
HIPÓTESE: [afirmação testável]
CONTROLE: [versão atual]
VARIANTE: [versão proposta — texto/estrutura exato]
MÉTRICA: [taxa de conversão / cliques no CTA / tempo na página]
UPLIFT ESPERADO: [%]
ESFORÇO: [horas de desenvolvimento]

## REWRITE SUGERIDO
Headline atual → [avaliar]
Nova headline: [escrever opção A e B]
CTA atual → [avaliar]
Novo CTA: [escrever]

## QUICK WINS (< 2h, sem dev)
[Mudanças textuais imediatas que não precisam de dev]

## SEQUÊNCIA DE IMPLEMENTAÇÃO
Semana 1: [o que implementar primeiro]
Semana 2: [segundo lote]
Semana 3: [terceiro lote]

## ESTIMATIVA DE IMPACTO
Se implementar os 3 principais testes: de ${metrics.conversao_pct || CONFIG.baseline_kpis.conversao_site_pct}% → [estimativa]%`,
    }],
  });

  return response.content[0].text;
}

module.exports = { analyzeLandingPageWithClaude, auditLandingPageLocally, LP_SECTIONS };
