// ROIAnalysisAgent.js — AI Lab Intelligence Agent

// ── Calculate ROI for an innovation ───────────────────────────────────────────
function calculateROI({
  costInitial  = 0,   // USD one-time
  costMonthly  = 0,   // USD/month
  hoursPerWeek = 0,   // hours saved per week
  hourlyRate   = 50,  // BRL per hour (team cost)
  revenueMonthly = 0, // BRL potential revenue generated
  timeToImplementWeeks = 2,
}) {
  const monthlySaving    = hoursPerWeek * 4 * hourlyRate;  // BRL
  const costMonthlyBRL   = costMonthly * 5.8;              // USD→BRL approx
  const totalMonthBenefit= monthlySaving + revenueMonthly;
  const netMonthBenefit  = totalMonthBenefit - costMonthlyBRL;
  const costInitialBRL   = costInitial * 5.8;
  const paybackMonths    = costInitialBRL > 0 ? +(costInitialBRL / Math.max(netMonthBenefit, 1)).toFixed(1) : 0;
  const annualROI        = Math.round(((netMonthBenefit * 12 - costInitialBRL) / Math.max(costInitialBRL + costMonthlyBRL * 12, 1)) * 100);

  return {
    cost_initial_usd:      costInitial,
    cost_initial_brl:      Math.round(costInitialBRL),
    cost_monthly_usd:      costMonthly,
    cost_monthly_brl:      Math.round(costMonthlyBRL),
    hours_saved_per_week:  hoursPerWeek,
    monthly_time_saving_brl: Math.round(monthlySaving),
    revenue_monthly_brl:   revenueMonthly,
    total_monthly_benefit: Math.round(totalMonthBenefit),
    net_monthly_benefit:   Math.round(netMonthBenefit),
    payback_months:        paybackMonths,
    annual_roi_percent:    annualROI,
    time_to_implement_weeks: timeToImplementWeeks,
    recommendation:
      paybackMonths <= 2  ? 'Implementar imediatamente — payback muito rápido' :
      paybackMonths <= 6  ? 'Implementar — payback aceitável' :
      paybackMonths <= 12 ? 'Considerar — payback razoável' :
                            'Reavaliar — payback longo demais',
    priority: paybackMonths <= 3 ? 'P0' : paybackMonths <= 6 ? 'P1' : 'P2',
  };
}

// ── Score innovation by business value ────────────────────────────────────────
function innovationScore({ roi, hoursWeek, revenueMonthly, riskLevel, implementationEase }) {
  let score = 50;
  const roiNum = typeof roi === 'number' ? roi : parseFloat(roi) || 0;

  if (roiNum > 500)  score += 25;
  else if (roiNum > 100) score += 15;
  else if (roiNum > 0)   score += 5;

  if (hoursWeek >= 10) score += 15;
  else if (hoursWeek >= 3) score += 8;

  if (revenueMonthly >= 5000) score += 15;
  else if (revenueMonthly >= 1000) score += 8;

  if (riskLevel === 'baixo')  score += 10;
  if (riskLevel === 'médio')  score += 5;
  if (riskLevel === 'alto')   score -= 10;

  if (implementationEase === 'baixo') score += 10;
  if (implementationEase === 'alto')  score -= 5;

  return Math.max(0, Math.min(100, score));
}

// ── Simple cost-benefit text summary ──────────────────────────────────────────
function costBenefitSummary(analysis) {
  const { net_monthly_benefit, payback_months, annual_roi_percent, recommendation } = analysis;
  return [
    `Benefício líquido mensal: R$${net_monthly_benefit}`,
    `Payback: ${payback_months} meses`,
    `ROI anual: ${annual_roi_percent}%`,
    `Recomendação: ${recommendation}`,
  ].join(' | ');
}

module.exports = { calculateROI, innovationScore, costBenefitSummary };
