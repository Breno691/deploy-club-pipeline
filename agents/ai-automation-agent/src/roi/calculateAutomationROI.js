// calculateAutomationROI.js — Pure ROI calculation functions for automation
const { CONFIG } = require('../config');

/**
 * Calcula ROI de uma automação.
 * Retorna todos os valores em BRL.
 */
function calcAutomationROI({
  hours_per_execution   = 0,
  monthly_volume        = 0,
  cost_per_hour         = CONFIG.cost_per_hour.breno,
  error_rate_pct        = 0,
  error_cost_brl        = 0,
  implementation_hours  = 0,
  implementation_rate   = CONFIG.cost_per_hour.dev,
  monthly_maintenance_brl = 0,
  tool_cost_monthly_brl = 0,
  revenue_opportunity_brl = 0,
} = {}) {
  const hours_saved_month = hours_per_execution * monthly_volume;
  const labor_savings     = hours_saved_month * cost_per_hour;
  const error_savings     = (error_rate_pct / 100) * monthly_volume * error_cost_brl;
  const monthly_savings   = labor_savings + error_savings + revenue_opportunity_brl;

  const implementation_cost = implementation_hours * implementation_rate;
  const monthly_cost        = monthly_maintenance_brl + tool_cost_monthly_brl;
  const net_monthly_savings = monthly_savings - monthly_cost;

  const payback_months = net_monthly_savings > 0
    ? Math.ceil(implementation_cost / net_monthly_savings)
    : null;

  const roi_12m = net_monthly_savings > 0 && implementation_cost > 0
    ? Math.round(((net_monthly_savings * 12 - implementation_cost) / implementation_cost) * 100)
    : null;

  const roi_label = payback_months === null ? 'Inviável'
    : payback_months <= 1  ? 'Payback imediato'
    : payback_months <= 3  ? 'Excelente'
    : payback_months <= 6  ? 'Bom'
    : payback_months <= 12 ? 'Aceitável'
    : 'Alto payback';

  return {
    hours_saved_month:      Math.round(hours_saved_month * 10) / 10,
    labor_savings_month:    Math.round(labor_savings),
    error_savings_month:    Math.round(error_savings),
    revenue_opportunity:    Math.round(revenue_opportunity_brl),
    gross_monthly_savings:  Math.round(monthly_savings),
    monthly_cost:           Math.round(monthly_cost),
    net_monthly_savings:    Math.round(net_monthly_savings),
    implementation_cost:    Math.round(implementation_cost),
    payback_months,
    roi_12m_pct:            roi_12m,
    roi_label,
    annual_savings:         Math.round(net_monthly_savings * 12),
    recommendation:         payback_months !== null && payback_months <= 6 ? 'IMPLEMENTAR' : payback_months !== null && payback_months <= 12 ? 'AVALIAR' : 'RECONSIDERAR',
  };
}

/**
 * Gera business case resumido para aprovação.
 */
function buildBusinessCase(automationName, roi, opportunity) {
  return {
    name:            automationName,
    problem:         opportunity?.pain || 'Processo manual repetitivo',
    current_state:   `${opportunity?.hours_per_execution || '?'}h × ${opportunity?.monthly_volume || '?'}x/mês = ${roi.hours_saved_month}h/mês gastas manualmente`,
    proposed:        `Automatizar via ${opportunity?.tools || 'n8n + Claude'}`,
    investment:      `R$ ${roi.implementation_cost.toLocaleString('pt-BR')} implementação + R$ ${roi.monthly_cost.toLocaleString('pt-BR')}/mês manutenção`,
    return_:         `R$ ${roi.net_monthly_savings.toLocaleString('pt-BR')}/mês economizados (${roi.hours_saved_month}h liberadas)`,
    payback:         roi.payback_months ? `${roi.payback_months} meses` : 'Inviável',
    roi_12m:         roi.roi_12m_pct ? `${roi.roi_12m_pct}%` : 'N/A',
    decision:        roi.recommendation,
    annual_impact:   `R$ ${roi.annual_savings.toLocaleString('pt-BR')} em 12 meses`,
    priority:        roi.roi_12m_pct >= 300 ? 'Alta' : roi.roi_12m_pct >= 100 ? 'Média' : 'Baixa',
  };
}

/**
 * Calcula ROI consolidado de uma lista de automações.
 */
function calcPortfolioROI(automations) {
  const total_implementation   = automations.reduce((s, a) => s + (a.roi?.implementation_cost || 0), 0);
  const total_monthly_savings  = automations.reduce((s, a) => s + (a.roi?.net_monthly_savings  || 0), 0);
  const total_hours_saved      = automations.reduce((s, a) => s + (a.roi?.hours_saved_month     || 0), 0);
  const total_annual_savings   = automations.reduce((s, a) => s + (a.roi?.annual_savings        || 0), 0);

  const portfolio_payback = total_monthly_savings > 0
    ? Math.ceil(total_implementation / total_monthly_savings)
    : null;

  return {
    count:                  automations.length,
    total_implementation_cost: Math.round(total_implementation),
    total_monthly_savings:  Math.round(total_monthly_savings),
    total_hours_saved_month: Math.round(total_hours_saved * 10) / 10,
    total_annual_savings:   Math.round(total_annual_savings),
    portfolio_payback_months: portfolio_payback,
    avg_roi_12m_pct: automations.length
      ? Math.round(automations.reduce((s, a) => s + (a.roi?.roi_12m_pct || 0), 0) / automations.length)
      : 0,
  };
}

module.exports = { calcAutomationROI, buildBusinessCase, calcPortfolioROI };
