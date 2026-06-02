// ROIAnalysisAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcAutomationROI, buildBusinessCase, calcPortfolioROI } = require('../roi/calculateAutomationROI');

const client = new Anthropic();

function analyzeROILocally(automations) {
  const withROI = automations.map(a => ({
    ...a,
    roi: calcAutomationROI({
      hours_per_execution:     a.time_per_execution   || 0,
      monthly_volume:          a.monthly_volume        || 0,
      cost_per_hour:           a.cost_per_hour         || CONFIG.cost_per_hour.breno,
      error_rate_pct:          a.error_rate_pct        || 0,
      error_cost_brl:          a.error_cost_brl        || 0,
      implementation_hours:    a.impl_hours            || 8,
      implementation_rate:     a.impl_rate             || CONFIG.cost_per_hour.dev,
      monthly_maintenance_brl: a.maintenance_brl       || 0,
      tool_cost_monthly_brl:   a.tool_cost             || 0,
      revenue_opportunity_brl: a.revenue_opportunity   || 0,
    }),
  })).map(a => ({ ...a, business_case: buildBusinessCase(a.name, a.roi, a) }));

  const portfolio = calcPortfolioROI(withROI);
  return { automations: withROI, portfolio };
}

async function analyzeROIWithClaude(automations) {
  const { automations: withROI, portfolio } = analyzeROILocally(automations);

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o ROI Analysis Agent da SmartOps IA.

Missão: Calcular e comunicar o ROI de automações de forma clara e convincente para tomada de decisão.

## DADOS DE ROI CALCULADOS:
${withROI.map(a => `**${a.name}**
Horas liberadas/mês: ${a.roi.hours_saved_month}h
Economia de labor: R$ ${a.roi.labor_savings_month?.toLocaleString('pt-BR')}/mês
Economia de erros: R$ ${a.roi.error_savings_month?.toLocaleString('pt-BR')}/mês
Custo de implementação: R$ ${a.roi.implementation_cost?.toLocaleString('pt-BR')}
Economia líquida: R$ ${a.roi.net_monthly_savings?.toLocaleString('pt-BR')}/mês
Payback: ${a.roi.payback_months} meses
ROI 12m: ${a.roi.roi_12m_pct}%
Decisão: ${a.roi.recommendation}`).join('\n\n')}

## PORTFOLIO TOTAL:
Custo total de implementação: R$ ${portfolio.total_implementation_cost?.toLocaleString('pt-BR')}
Economia mensal total: R$ ${portfolio.total_monthly_savings?.toLocaleString('pt-BR')}
Horas liberadas/mês: ${portfolio.total_hours_saved_month}h
Payback do portfolio: ${portfolio.portfolio_payback_months} meses
Economia anual total: R$ ${portfolio.total_annual_savings?.toLocaleString('pt-BR')}

---

Gere o ROI Analysis Report no formato:

# ROI ANALYSIS REPORT — AUTOMAÇÕES SMARTOPS IA

## RESUMO EXECUTIVO
[3-4 frases sobre o impacto financeiro total]

## ANÁLISE POR AUTOMAÇÃO
[Para cada automação: contexto do ROI, o que significa na prática, recomendação]

## PRIORIZAÇÃO POR ROI
[Ranking do que implementar primeiro com justificativa financeira]

## BUSINESS CASE PARA APROVAÇÃO
[Justificativa consolidada: investimento X vs retorno Y]

## IMPACTO EM TEMPO LIBERADO
[O que Breno pode fazer com as X horas liberadas por mês]

## PRÓXIMA AÇÃO
[O que aprovar e implementar esta semana]`,
    }],
  });

  return { analysis: response.content[0].text, data: { automations: withROI, portfolio } };
}

module.exports = { analyzeROILocally, analyzeROIWithClaude };
