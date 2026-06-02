// SEOReportAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcSEOScore, identifyQuickWins, detectSEOAlerts } = require('../calculations/seoCalculators');

const client = new Anthropic();

function buildSEOSnapshot(searchConsoleData = {}, technicalData = {}) {
  const {
    clicks = 0, impressions = 0, ctr = 0, avg_position = 0,
    queries = [], previous = {}, sessions_organic = 0, conversions_organic = 0,
  } = searchConsoleData;

  const score = calcSEOScore({
    tech_issues:        technicalData.errors || 0,
    content_quality:    technicalData.content_score || 5,
    keywords_optimized: queries.filter(q => q.optimized).length,
    total_keywords:     queries.length || 1,
    ctr_pct:            ctr,
    internal_links:     technicalData.internal_links || 0,
    backlinks:          technicalData.backlinks || 0,
    conversions_org:    conversions_organic,
  });

  const quick_wins = identifyQuickWins(queries);
  const alerts     = detectSEOAlerts({ clicks, impressions, ctr, position: avg_position }, previous);
  const baseline   = CONFIG.baseline;

  return {
    date: new Date().toISOString().split('T')[0],
    score,
    kpis: { clicks, impressions, ctr, avg_position, sessions_organic, conversions_organic },
    kpis_vs_baseline: {
      clicks_delta_pct:       baseline.cliques_semana > 0 ? Math.round(((clicks - baseline.cliques_semana) / baseline.cliques_semana) * 100) : 0,
      impressions_delta_pct:  baseline.impressoes_semana > 0 ? Math.round(((impressions - baseline.impressoes_semana) / baseline.impressoes_semana) * 100) : 0,
    },
    quick_wins: quick_wins.quick_wins.slice(0, 5),
    alerts,
    targets: CONFIG.targets,
  };
}

async function generateSEOReportWithClaude(snapshot, mode = 'weekly') {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o SEO Agent da SmartOps IA.

Missão: Analisar dados orgânicos e gerar relatório estratégico com plano de ação claro.

Tipo: ${mode}
Data: ${snapshot.date}
Empresa: SmartOps IA — consultoria Lean + Automação, BH

DADOS SEO:
Score: ${snapshot.score.score}/100 (${snapshot.score.label})
Cliques: ${snapshot.kpis.clicks} (${snapshot.kpis_vs_baseline.clicks_delta_pct > 0 ? '+' : ''}${snapshot.kpis_vs_baseline.clicks_delta_pct}% vs baseline)
Impressões: ${snapshot.kpis.impressions}
CTR: ${snapshot.kpis.ctr}%
Posição média: ${snapshot.kpis.avg_position}
Sessões orgânicas: ${snapshot.kpis.sessions_organic}
Conversões orgânicas: ${snapshot.kpis.conversions_organic}

Quick wins disponíveis: ${snapshot.quick_wins.length}
${snapshot.quick_wins.map(q => `  - "${q.query}" pos. ${q.position} | ${q.impressions} impressões | CTR ${q.ctr}%`).join('\n')}

Alertas críticos: ${snapshot.alerts.critico.join(', ') || 'nenhum'}
Alertas de atenção: ${snapshot.alerts.atencao.join(', ') || 'nenhum'}
Oportunidades: ${snapshot.alerts.oportunidade.join(', ') || 'nenhuma'}

Keywords estratégicas (definidas para SmartOps):
${CONFIG.strategic_keywords.slice(0, 5).map(k => `- "${k.kw}" [${k.intent}]`).join('\n')}

---

Relatório no padrão SmartOps:

TÍTULO: SEO Report — ${snapshot.date}
DADOS ANALISADOS: Search Console + performance orgânica

PROBLEMA IDENTIFICADO: [principal gap de SEO]
EVIDÊNCIA: [dados concretos]
IMPACTO: [custo de não agir]
RECOMENDAÇÃO: [top 3 ações de SEO]
AÇÃO SUGERIDA: [o que fazer esta semana]
PRIORIDADE: Alta
ROI ESPERADO: [+X cliques/mês com implementação]
PRÓXIMO PASSO: [ação concreta em 24h]

---

## QUICK WINS DA SEMANA
[Top 3 otimizações com maior impacto imediato]

## CLUSTER PRINCIPAL A FORTALECER
[O cluster mais estratégico para a SmartOps + plano de conteúdo]

## PROBLEMAS TÉCNICOS A CORRIGIR
[P1 urgente / P2 importante / P3 quando possível]

## CALENDÁRIO DE CONTEÚDO (próximas 2 semanas)
[Título, keyword, intenção, URL, CTA]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { buildSEOSnapshot, generateSEOReportWithClaude };
