// TechnicalSEOAgent.js — Audita SEO técnico: indexação, velocidade, estrutura
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const TECHNICAL_CHECKLIST = {
  indexacao: [
    { item: 'robots.txt configurado corretamente', critical: true },
    { item: 'Sitemap.xml enviado ao Google Search Console', critical: true },
    { item: 'Sem canonical apontando para URL errada', critical: true },
    { item: 'Sem noindex em páginas importantes', critical: true },
    { item: 'Sem páginas órfãs (sem links internos)', critical: false },
  ],
  velocidade: [
    { item: 'LCP < 2.5s (mobile)', critical: true },
    { item: 'INP < 200ms', critical: true },
    { item: 'CLS < 0.1', critical: false },
    { item: 'Imagens com lazy loading e formato WebP', critical: false },
    { item: 'CSS e JS minificados', critical: false },
    { item: 'Servidor com TTFB < 200ms', critical: false },
  ],
  estrutura: [
    { item: 'H1 único por página', critical: true },
    { item: 'H2/H3 hierarquia correta', critical: false },
    { item: 'URLs amigáveis (sem parâmetros desnecessários)', critical: false },
    { item: 'HTTPS em todas as páginas', critical: true },
    { item: 'Sem redirecionamento em cadeia', critical: false },
  ],
  schema: [
    { item: 'Schema Organization na homepage', critical: false },
    { item: 'Schema LocalBusiness (para negócio local)', critical: false },
    { item: 'Schema FAQ em páginas com perguntas', critical: false },
    { item: 'Schema Breadcrumb', critical: false },
  ],
  mobile: [
    { item: 'Mobile-friendly (Google Mobile Test)', critical: true },
    { item: 'Viewport configurado', critical: true },
    { item: 'Fontes legíveis sem zoom', critical: false },
    { item: 'Botões com tamanho adequado para toque', critical: false },
  ],
};

function auditTechnicalLocally(siteData = {}) {
  const issues = [];
  const passed = [];

  Object.entries(TECHNICAL_CHECKLIST).forEach(([category, items]) => {
    items.forEach(item => {
      const key = item.item.toLowerCase().replace(/[^a-z]/g, '_').slice(0, 30);
      const ok  = siteData[key] !== false; // assume ok se não especificado
      if (!ok) {
        issues.push({ category, item: item.item, critical: item.critical, priority: item.critical ? 'P1' : 'P2' });
      } else {
        passed.push({ category, item: item.item });
      }
    });
  });

  const critical_issues = issues.filter(i => i.critical);
  const score = Math.max(0, 100 - (critical_issues.length * 15) - (issues.filter(i => !i.critical).length * 5));

  return { score, critical_issues, all_issues: issues, passed, total_items: passed.length + issues.length };
}

async function auditTechnicalSEOWithClaude(siteUrl, knownIssues = []) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Technical SEO Agent da SmartOps IA.

Missão: Auditar SEO técnico e priorizar correções por impacto no ranking e indexação.

Site: ${siteUrl || CONFIG.company.site}
Issues conhecidos: ${knownIssues.join(', ') || 'nenhum específico informado'}

Checklist completo:
${Object.entries(TECHNICAL_CHECKLIST).map(([cat, items]) =>
  `${cat.toUpperCase()}:\n${items.map(i => `  ${i.critical ? '🔴' : '🟡'} ${i.item}`).join('\n')}`
).join('\n\n')}

Responda:

# TECHNICAL SEO AUDIT — ${siteUrl || CONFIG.company.site}

## SCORE TÉCNICO
Nota: [X]/100 — Status: [Excelente/Bom/Atenção/Crítico]

## PROBLEMAS CRÍTICOS (P1 — afetam indexação/ranking)
Para cada problema:
ITEM: [o que está errado]
IMPACTO: [como afeta o Google]
COMO CORRIGIR: [passo a passo]
TEMPO ESTIMADO: [horas]

## PROBLEMAS IMPORTANTES (P2)
[Lista com correção]

## MELHORIAS DE PERFORMANCE
Core Web Vitals:
LCP: [diagnóstico + como melhorar]
INP: [diagnóstico + como melhorar]
CLS: [diagnóstico + como melhorar]

## SCHEMA MARKUP RECOMENDADO
[Schemas prioritários para SmartOps IA + código de exemplo]

## ORDEM DE IMPLEMENTAÇÃO
[Do mais crítico ao menos crítico com estimativa de horas]

## IMPACTO ESPERADO
[O que melhora no ranking após as correções P1]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { auditTechnicalSEOWithClaude, auditTechnicalLocally, TECHNICAL_CHECKLIST };
