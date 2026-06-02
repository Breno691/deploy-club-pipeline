// ContentAuditAgent.js — Audita conteúdos existentes e recomenda otimizações
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcCTROrganic, classifyPosition } = require('../calculations/seoCalculators');

const client = new Anthropic();

// Critérios de qualidade de conteúdo
const CONTENT_CRITERIA = {
  intencao_alinhada:    { weight: 20, desc: 'Conteúdo responde o que o usuário busca' },
  profundidade:         { weight: 15, desc: 'Cobre o tema com completude' },
  atualizado:           { weight: 15, desc: 'Informações recentes (< 18 meses)' },
  estrutura:            { weight: 10, desc: 'H1/H2/H3 organizados, fácil de escanear' },
  cta_presente:         { weight: 15, desc: 'Próximo passo claro para o leitor' },
  links_internos:       { weight: 10, desc: 'Linka para pilar e conteúdos relacionados' },
  keyword_natural:      { weight: 10, desc: 'Palavra-chave principal usada naturalmente' },
  mobile_legivel:       { weight: 5,  desc: 'Parágrafos curtos, legível no celular' },
};

function auditContentLocally(pages = []) {
  const audited = pages.map(p => {
    const ctr  = calcCTROrganic(p.clicks || 0, p.impressions || 0);
    const pos  = classifyPosition(p.position || 99);
    const age_months = p.published_date
      ? Math.floor((Date.now() - new Date(p.published_date)) / (30 * 24 * 3600 * 1000))
      : null;

    const needs_update = age_months > 18;
    const opportunity  = p.position >= 4 && p.position <= 20 && p.impressions >= 100;
    const low_ctr      = ctr < 2 && p.impressions >= 100;
    const no_cta       = !p.has_cta;

    const priority = opportunity ? 1 : low_ctr ? 2 : needs_update ? 3 : 4;

    return { ...p, ctr, position_class: pos, age_months, needs_update, opportunity, low_ctr, no_cta, audit_priority: priority };
  });

  return {
    total: audited.length,
    opportunities: audited.filter(p => p.opportunity).length,
    needs_update:  audited.filter(p => p.needs_update).length,
    low_ctr:       audited.filter(p => p.low_ctr).length,
    no_cta:        audited.filter(p => p.no_cta).length,
    priority_list: audited.sort((a, b) => a.audit_priority - b.audit_priority).slice(0, 10),
  };
}

async function auditContentWithClaude(pages, siteContext = '') {
  const audit = auditContentLocally(pages);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Content Audit Agent da SmartOps IA.

Missão: Auditar conteúdos publicados e priorizar otimizações por impacto em ranking e conversão.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Contexto: ${siteContext || 'site de consultoria com blog educacional'}

Resumo do audit:
Total de páginas: ${audit.total}
Com oportunidade (posição 4-20): ${audit.opportunities}
Precisam atualização (> 18 meses): ${audit.needs_update}
CTR baixo (< 2%): ${audit.low_ctr}
Sem CTA: ${audit.no_cta}

Top páginas prioritárias:
${audit.priority_list.slice(0, 5).map(p =>
  `- "${p.url || p.title || 'Página'}" | pos. ${p.position} | ${p.impressions} impressões | CTR ${p.ctr}% | ${p.needs_update ? 'DESATUALIZADA' : ''} ${p.opportunity ? 'OPORTUNIDADE' : ''}`
).join('\n')}

Critérios de qualidade (por peso):
${Object.entries(CONTENT_CRITERIA).map(([k, v]) => `${k}: ${v.weight}pts — ${v.desc}`).join('\n')}

Responda:

# CONTENT AUDIT REPORT

## DIAGNÓSTICO GERAL
[Estado do conteúdo publicado e principais gaps]

## PÁGINAS PRIORITÁRIAS PARA OTIMIZAR
Para cada página (top 3):
URL/TÍTULO: [identificação]
PROBLEMA PRINCIPAL: [o que está impedindo ranking/conversão]
AÇÃO: [o que fazer — atualizar, reescrever, adicionar CTA, melhorar links internos]
NOVO TÍTULO SUGERIDO: [title tag otimizado]
NOVA META DESCRIPTION: [até 155 chars]
ESFORÇO: [Baixo/Médio/Alto]

## PADRÕES IDENTIFICADOS
[O que os conteúdos que rankeam bem têm em comum]

## CONTEÚDOS A DESPUBLICAR OU CONSOLIDAR
[Páginas fracas que devem ser removidas ou unidas]

## PLANO DE AÇÃO (próximas 3 semanas)
Semana 1: [páginas a atualizar]
Semana 2: [CTAs a adicionar + links internos]
Semana 3: [novos conteúdos a criar]

## IMPACTO ESPERADO
Se executar o plano: +X cliques/semana em 60 dias`,
    }],
  });

  return response.content[0].text;
}

module.exports = { auditContentWithClaude, auditContentLocally, CONTENT_CRITERIA };
