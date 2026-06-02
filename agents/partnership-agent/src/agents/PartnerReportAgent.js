// PartnerReportAgent.js — Partnership Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function generateWeeklyPartnerReport(data = {}) {
  const {
    new_partners_identified = 0,
    partners_contacted = 0,
    meetings_scheduled = 0,
    meetings_done = 0,
    referrals_received = 0,
    leads_generated = 0,
    contracts_closed = 0,
    revenue_from_partners = 0,
    commission_paid = 0,
    active_partners = 0,
    top_partners = [],
    pipeline_summary = {},
  } = data;

  const prompt = `Você é o Partner Report Agent da SmartOps IA.

Gere o relatório semanal de parcerias.

Dados da semana:
- Novos parceiros identificados: ${new_partners_identified}
- Parceiros contactados: ${partners_contacted}
- Reuniões marcadas: ${meetings_scheduled}
- Reuniões realizadas: ${meetings_done}
- Indicações recebidas: ${referrals_received}
- Leads gerados: ${leads_generated}
- Contratos fechados via parceiros: ${contracts_closed}
- Receita por parceiros: R$ ${revenue_from_partners}
- Comissão paga: R$ ${commission_paid}
- Total parceiros ativos: ${active_partners}
- Top parceiros: ${JSON.stringify(top_partners)}
- Pipeline: ${JSON.stringify(pipeline_summary)}

Retorne JSON com o relatório completo:
{
  "report_title": "Relatório Semanal de Parcerias — SmartOps IA",
  "report_date": "${new Date().toISOString().split('T')[0]}",
  "executive_summary": "resumo executivo em 3 linhas",
  "kpis": {
    "new_partners": ${new_partners_identified},
    "contacted": ${partners_contacted},
    "meetings": ${meetings_done},
    "referrals": ${referrals_received},
    "closed": ${contracts_closed},
    "revenue": ${revenue_from_partners},
    "commission": ${commission_paid},
    "active_partners": ${active_partners}
  },
  "highlights": ["destaque 1", "destaque 2"],
  "alerts": ["alerta 1", "alerta 2"],
  "top_performing_partners": ["parceiro 1", "parceiro 2"],
  "partners_needing_attention": ["parceiro inativo 1"],
  "pipeline_health": "saudável | atenção | crítico",
  "weekly_insight": "principal insight desta semana",
  "next_week_priorities": ["prioridade 1", "prioridade 2", "prioridade 3"],
  "cac_via_partners": "R$ X (vs anúncios pagos)",
  "roi_of_program": "ROI do programa de parcerias",
  "recommendation": "recomendação principal para semana seguinte",
  "format": "SMARTOPS_PARTNERSHIP_REPORT_v1"
}

Siga o formato de output padrão SmartOps:
TÍTULO, CONTEXTO, DADOS ANALISADOS, PROBLEMA IDENTIFICADO, EVIDÊNCIA, IMPACTO, RECOMENDAÇÃO, AÇÃO SUGERIDA, PRIORIDADE, ROI ESPERADO, RISCO DE NÃO AGIR, PRÓXIMO PASSO

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PartnerReportAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

async function generatePartnerScorecard(partners = []) {
  const scorecardData = partners.map(p => ({
    name: p.name,
    type: p.type,
    score: p.score,
    stage: p.stage,
    referrals: p.referrals_total || 0,
    revenue: p.revenue_generated || 0,
    commission: p.commission_paid || 0,
    status: p.status || 'unknown',
  }));

  const prompt = `Você é o Partner Report Agent da SmartOps IA.

Gere o scorecard de parceiros.

Parceiros:
${JSON.stringify(scorecardData, null, 2)}

Retorne JSON:
{
  "scorecard_date": "${new Date().toISOString().split('T')[0]}",
  "total_partners": ${partners.length},
  "partner_scores": [
    {
      "name": "...",
      "score": 0,
      "tier": "Estratégico | Ativo | Em Desenvolvimento | Inativo",
      "referrals": 0,
      "revenue": 0,
      "commission": 0,
      "recommendation": "escalar | manter | reativar | encerrar"
    }
  ],
  "top_partner": "melhor parceiro",
  "best_roi_partner": "parceiro com melhor ROI",
  "needs_reactivation": ["parceiro 1"],
  "scale_candidates": ["parceiro para escalar"],
  "program_health": "excelente | bom | precisa atenção",
  "summary": "resumo do programa em 2 linhas"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PartnerReportAgent scorecard: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateWeeklyPartnerReport, generatePartnerScorecard };
