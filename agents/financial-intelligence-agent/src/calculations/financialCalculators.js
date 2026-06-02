// financialCalculators.js — Pure financial math functions
const { CONFIG, TAX_RATES } = require('../config');

// ── Receita ────────────────────────────────────────────────────────────────────

function calcNetRevenue(grossRevenue, taxRate = TAX_RATES.total_estimated) {
  return grossRevenue * (1 - taxRate);
}

function calcGrossProfit(netRevenue, directCosts) {
  return netRevenue - directCosts;
}

function calcNetProfit(netRevenue, directCosts, operationalExpenses) {
  return netRevenue - directCosts - operationalExpenses;
}

// ── Margens ────────────────────────────────────────────────────────────────────

function calcGrossMargin(grossProfit, netRevenue) {
  if (!netRevenue) return 0;
  return (grossProfit / netRevenue) * 100;
}

function calcNetMargin(netProfit, netRevenue) {
  if (!netRevenue) return 0;
  return (netProfit / netRevenue) * 100;
}

function calcServiceMargin(ticket, deliveryCost, taxRate = TAX_RATES.total_estimated) {
  const net = ticket * (1 - taxRate);
  const profit = net - deliveryCost;
  return {
    ticket_bruto:   ticket,
    receita_liquida: net,
    custo_entrega:  deliveryCost,
    lucro_bruto:    profit,
    margem_bruta:   Number(calcGrossMargin(profit, net).toFixed(1)),
  };
}

// ── CAC ────────────────────────────────────────────────────────────────────────

function calcCAC(totalAcquisitionCost, clientsAcquired) {
  if (!clientsAcquired) return 0;
  return totalAcquisitionCost / clientsAcquired;
}

function calcCACByChannel(channelSpend, channelClients) {
  return calcCAC(channelSpend, channelClients);
}

function calcMaxCAC(ticketMedio, maxPctOfTicket = CONFIG.targets.cac_max_pct_ticket) {
  return ticketMedio * (maxPctOfTicket / 100);
}

// ── LTV ────────────────────────────────────────────────────────────────────────

function calcLTV(ticketMedio, avgPurchases, avgRetentionMonths) {
  return ticketMedio * avgPurchases * avgRetentionMonths;
}

function calcLTVSimple(ticketMedio, avgRetentionMonths) {
  return ticketMedio * avgRetentionMonths;
}

function calcLTVCAC(ltv, cac) {
  if (!cac) return 0;
  return Number((ltv / cac).toFixed(2));
}

function assessLTVCAC(ratio) {
  if (ratio >= CONFIG.targets.ltv_cac_excelente) return { status: 'excelente', color: 'verde', action: 'Escalar aquisição' };
  if (ratio >= CONFIG.targets.ltv_cac_min)       return { status: 'saudável',  color: 'verde', action: 'Manter e otimizar' };
  if (ratio >= 2)                                 return { status: 'atenção',   color: 'amarelo', action: 'Melhorar retenção ou reduzir CAC' };
  return { status: 'crítico', color: 'vermelho', action: 'Revisar modelo de aquisição urgente' };
}

// ── Payback ────────────────────────────────────────────────────────────────────

function calcPayback(cac, monthlyMarginPerClient) {
  if (!monthlyMarginPerClient) return Infinity;
  return cac / monthlyMarginPerClient; // em meses
}

function calcPaybackDays(cac, monthlyMarginPerClient) {
  return calcPayback(cac, monthlyMarginPerClient) * 30;
}

// ── ROI ────────────────────────────────────────────────────────────────────────

function calcROI(revenue, investment) {
  if (!investment) return 0;
  return ((revenue - investment) / investment) * 100;
}

function calcROAS(revenueFromAds, adSpend) {
  if (!adSpend) return 0;
  return Number((revenueFromAds / adSpend).toFixed(2));
}

// ── Runway ─────────────────────────────────────────────────────────────────────

function calcRunway(cashAvailable, monthlyBurnRate) {
  if (!monthlyBurnRate) return Infinity;
  return cashAvailable / monthlyBurnRate; // em meses
}

function calcRunwayDays(cashAvailable, monthlyBurnRate) {
  return calcRunway(cashAvailable, monthlyBurnRate) * 30;
}

function assessRunway(months) {
  if (months === Infinity || months > 12) return { status: 'seguro',     action: 'Continuar' };
  if (months >= 6)                         return { status: 'atenção',    action: 'Monitorar queima' };
  if (months >= 3)                         return { status: 'risco',      action: 'Cortar custos e acelerar vendas' };
  return { status: 'crítico', action: 'ALERTA: caixa < 3 meses — ação imediata' };
}

// ── Break-even ─────────────────────────────────────────────────────────────────

function calcBreakEven(fixedCosts, contributionMarginPct) {
  if (!contributionMarginPct) return Infinity;
  return fixedCosts / (contributionMarginPct / 100);
}

function calcBreakEvenClients(fixedCosts, ticketMedio, margem_pct) {
  const contribution = ticketMedio * (margem_pct / 100);
  if (!contribution) return Infinity;
  return Math.ceil(fixedCosts / contribution);
}

// ── Ticket Médio ───────────────────────────────────────────────────────────────

function calcTicketMedio(totalRevenue, totalClients) {
  if (!totalClients) return 0;
  return totalRevenue / totalClients;
}

// ── Saúde Financeira ───────────────────────────────────────────────────────────

function assessFinancialHealth(metrics) {
  const { receita_liquida = 0, custo_total = 0, margem_liquida = 0,
          ltv_cac = 0, runway_meses = Infinity, cac = 0, ticket_medio = 0 } = metrics;

  if (receita_liquida === 0) return 'PRE_REVENUE';

  const problems = [];
  if (margem_liquida < CONFIG.alert_thresholds.margem_liquida_min) problems.push('MARGIN_RISK');
  if (runway_meses < CONFIG.alert_thresholds.runway_min_dias / 30)  problems.push('CASH_RISK');
  if (ltv_cac > 0 && ltv_cac < CONFIG.alert_thresholds.ltv_cac_min) problems.push('CAC_RISK');
  if (cac > ticket_medio * (CONFIG.alert_thresholds.cac_max_pct_ticket / 100)) problems.push('CAC_RISK');

  if (problems.includes('CASH_RISK'))                              return 'CASH_RISK';
  if (problems.includes('MARGIN_RISK'))                            return 'MARGIN_RISK';
  if (problems.includes('CAC_RISK'))                               return 'CAC_RISK';
  if (margem_liquida >= CONFIG.targets.margem_liquida_min && ltv_cac >= CONFIG.targets.ltv_cac_excelente) return 'SCALING_READY';
  if (margem_liquida >= CONFIG.targets.margem_liquida_min)         return 'HEALTHY';
  return 'ATTENTION';
}

// ── Preço Mínimo ───────────────────────────────────────────────────────────────

function calcMinimumPrice(deliveryCost, targetMarginPct, taxRate = TAX_RATES.total_estimated) {
  const marginMultiplier = 1 - (targetMarginPct / 100);
  if (!marginMultiplier) return deliveryCost;
  const precoSemImposto = deliveryCost / marginMultiplier;
  return precoSemImposto / (1 - taxRate);
}

function calcDiscountImpact(originalTicket, discountPct, deliveryCost, taxRate = TAX_RATES.total_estimated) {
  const discountedTicket = originalTicket * (1 - discountPct / 100);
  const original = calcServiceMargin(originalTicket, deliveryCost, taxRate);
  const discounted = calcServiceMargin(discountedTicket, deliveryCost, taxRate);
  return {
    original_ticket:    originalTicket,
    discounted_ticket:  discountedTicket,
    discount_pct:       discountPct,
    original_margin:    original.margem_bruta,
    discounted_margin:  discounted.margem_bruta,
    margin_loss_pct:    Number((original.margem_bruta - discounted.margem_bruta).toFixed(1)),
    revenue_loss:       Number((originalTicket - discountedTicket).toFixed(2)),
    profit_loss:        Number((original.lucro_bruto - discounted.lucro_bruto).toFixed(2)),
  };
}

module.exports = {
  calcNetRevenue, calcGrossProfit, calcNetProfit,
  calcGrossMargin, calcNetMargin, calcServiceMargin,
  calcCAC, calcCACByChannel, calcMaxCAC,
  calcLTV, calcLTVSimple, calcLTVCAC, assessLTVCAC,
  calcPayback, calcPaybackDays,
  calcROI, calcROAS,
  calcRunway, calcRunwayDays, assessRunway,
  calcBreakEven, calcBreakEvenClients,
  calcTicketMedio,
  assessFinancialHealth,
  calcMinimumPrice, calcDiscountImpact,
};
