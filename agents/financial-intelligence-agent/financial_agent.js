#!/usr/bin/env node
/**
 * Financial Intelligence Agent — SmartOps IA
 * CFO Virtual da SmartOps IA
 *
 * Usage:
 *   node financial_agent.js --mode dashboard
 *   node financial_agent.js --mode margin
 *   node financial_agent.js --mode margin --receita 15000 --custo-entrega 3000 --despesas 600
 *   node financial_agent.js --mode forecast --pipeline 50000 --taxa 0.25 --recorrencia 5500
 *   node financial_agent.js --mode roi
 *   node financial_agent.js --mode risk --receita 0 --caixa 5000
 *   node financial_agent.js --mode report
 *   node financial_agent.js --mode pnl --receita 15000 --custo-entrega 3000
 *   node financial_agent.js --mode cac --spend 500 --clientes 1
 *   node financial_agent.js --mode ltv --ticket 12000 --meses 2.5
 *   node financial_agent.js --mode pricing --service quick-win
 *   node financial_agent.js --mode scenario --action "fechar 2 clientes no mês"
 *   node financial_agent.js --mode ceo-brief
 *   node financial_agent.js --mode services
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { analyzeMarginDeep, analyzeServiceMarginsLocally } = require('./src/agents/MarginAnalysisAgent');
const { generateForecastWithInsights, buildLocalForecast }  = require('./src/agents/ForecastAgent');
const { analyzeROIByChannel, calcChannelROILocally }        = require('./src/agents/ROIChannelAgent');
const { analyzeFinancialRisks, detectRisksLocally }         = require('./src/agents/FinancialRiskAgent');
const {
  buildFinancialSnapshot, generateWeeklyFinancialReport,
  generateCEOBrief, generatePricingRecommendation, generateScenario,
} = require('./src/agents/FinancialReportAgent');
const calcs = require('./src/calculations/financialCalculators');
const { CONFIG, TAX_RATES } = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function saveOutput(filename, content) {
  const dir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

function fmt(value, currency = true) {
  if (currency) return `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
  return String(value);
}

async function main() {
  const mode = getArg('mode', 'dashboard');
  const ts   = Date.now();

  console.log('\n=== FINANCIAL INTELLIGENCE AGENT ===');
  console.log(`CFO Virtual da SmartOps IA`);
  console.log(`Modo: ${mode}\n`);

  // Dados comuns passados via args
  const receita_bruta       = parseFloat(getArg('receita',    '0'));
  const custo_entrega       = parseFloat(getArg('custo-entrega', '0'));
  const despesas            = parseFloat(getArg('despesas',   String(CONFIG.fixed_costs.total_mensal)));
  const caixa               = parseFloat(getArg('caixa',      '0'));
  const pipeline            = parseFloat(getArg('pipeline',   '0'));
  const taxa_fechamento     = parseFloat(getArg('taxa',        '0.25'));
  const recorrencia         = parseFloat(getArg('recorrencia', '0'));
  const clientes_ativos     = parseInt(getArg('clientes',     '0'), 10);
  const ticket_medio        = parseFloat(getArg('ticket',     String(CONFIG.services['diagnostico-plano'].ticket_medio)));

  const commonData = {
    receita_bruta, custo_entrega, despesas_operacionais: despesas,
    caixa_disponivel: caixa, pipeline_valor: pipeline,
    taxa_fechamento, clientes_ativos, ticket_medio,
    recorrencia_mensal: recorrencia,
  };

  // ── DASHBOARD — visão financeira consolidada ──────────────────────────────
  if (mode === 'dashboard') {
    console.log('  → Gerando dashboard financeiro...\n');
    const snapshot = buildFinancialSnapshot(commonData);
    const risks    = detectRisksLocally({
      margem_liquida: snapshot.margens.liquida,
      runway_meses:   typeof snapshot.caixa.runway_meses === 'number' ? snapshot.caixa.runway_meses : Infinity,
      ltv_cac: snapshot.unit_economics.ltv_cac,
      cac: snapshot.unit_economics.cac,
      ticket_medio: snapshot.unit_economics.ticket_medio,
    });
    saveOutput(`dashboard-${ts}.json`, { snapshot, risks });

    console.log(`  ┌─────────────────────────────────────────────┐`);
    console.log(`  │  SAÚDE: ${snapshot.health_label.padEnd(36)}│`);
    console.log(`  ├─────────────────────────────────────────────┤`);
    console.log(`  │  Receita bruta:    ${fmt(snapshot.receita.bruta).padEnd(25)}│`);
    console.log(`  │  Receita líquida:  ${fmt(snapshot.receita.liquida).padEnd(25)}│`);
    console.log(`  │  Lucro bruto:      ${fmt(snapshot.lucro.bruto).padEnd(25)}│`);
    console.log(`  │  Lucro líquido:    ${fmt(snapshot.lucro.liquido).padEnd(25)}│`);
    console.log(`  │  Margem bruta:     ${(snapshot.margens.bruta + '%').padEnd(25)}│`);
    console.log(`  │  Margem líquida:   ${(snapshot.margens.liquida + '%').padEnd(25)}│`);
    console.log(`  ├─────────────────────────────────────────────┤`);
    console.log(`  │  CAC:              ${fmt(snapshot.unit_economics.cac).padEnd(25)}│`);
    console.log(`  │  LTV:              ${fmt(snapshot.unit_economics.ltv).padEnd(25)}│`);
    console.log(`  │  LTV/CAC:          ${(snapshot.unit_economics.ltv_cac + 'x').padEnd(25)}│`);
    console.log(`  ├─────────────────────────────────────────────┤`);
    console.log(`  │  Forecast 30d:     ${fmt(snapshot.forecast.d30_realista).padEnd(25)}│`);
    console.log(`  │  Forecast 90d:     ${fmt(snapshot.forecast.d90_realista).padEnd(25)}│`);
    console.log(`  │  Meta mensal:      ${fmt(snapshot.receita.meta).padEnd(25)}│`);
    console.log(`  │  Gap para meta:    ${fmt(snapshot.receita.gap_meta).padEnd(25)}│`);
    console.log(`  └─────────────────────────────────────────────┘`);

    if (risks.length > 0) {
      console.log(`\n  ⚠️  Alertas (${risks.length}):`);
      risks.slice(0, 3).forEach(r => console.log(`  [${r.severity}] ${r.message}`));
    }
  }

  // ── MARGIN — análise de margens ───────────────────────────────────────────
  else if (mode === 'margin') {
    if (receita_bruta > 0) {
      console.log('  → Análise de margem profunda com Claude...');
      const result = await analyzeMarginDeep({ receita_mensal: receita_bruta, custo_entrega, despesas_operacionais: despesas });
      saveOutput(`margin-analysis-${ts}.json`, result);

      console.log(`\n  Margem bruta:   ${result.gross_margin_pct}%`);
      console.log(`  Margem líquida: ${result.net_margin_pct}%`);
      console.log(`  Status: ${result.margin_status}`);
      console.log(`  Melhor serviço: ${result.best_service}`);
      console.log(`  Recomendação: ${result.recommendation}`);
    } else {
      console.log('  → Margens por serviço (catálogo SmartOps):');
      const margins = analyzeServiceMarginsLocally();
      saveOutput(`service-margins-${ts}.json`, margins);

      margins.forEach(s => {
        const status = s.margem_status === 'ok' ? '✓' : '⚠';
        console.log(`\n  ${status} ${s.nome}`);
        console.log(`    Ticket: ${fmt(s.ticket_bruto)} | Custo: ${fmt(s.custo_entrega)} | Margem: ${s.margem_bruta_pct}%`);
        console.log(`    Lucro bruto: ${fmt(s.lucro_bruto)} | Preço mínimo: ${fmt(s.preco_minimo)}`);
      });
    }
  }

  // ── FORECAST — previsão 30/60/90 dias ────────────────────────────────────
  else if (mode === 'forecast') {
    console.log('  → Gerando forecast 30/60/90 dias...');
    const result = await generateForecastWithInsights({
      recorrencia_mensal: recorrencia, pipeline_valor: pipeline,
      taxa_fechamento, ticket_medio, clientes_ativos,
    });
    saveOutput(`forecast-${ts}.json`, result);

    const f = result.local_forecast;
    console.log(`\n  ┌──────────────────────────────────────────────────┐`);
    console.log(`  │  FORECAST SMARTOPS IA                            │`);
    console.log(`  ├───────────┬──────────────┬──────────────┬────────┤`);
    console.log(`  │  Período  │  Pessimista  │   Realista   │ Otimista│`);
    console.log(`  ├───────────┼──────────────┼──────────────┼────────┤`);
    console.log(`  │  30 dias  │ ${fmt(f.d30.pessimista).padEnd(12)} │ ${fmt(f.d30.realista).padEnd(12)} │ ${fmt(f.d30.otimista).padEnd(6)}│`);
    console.log(`  │  60 dias  │ ${fmt(f.d60.pessimista).padEnd(12)} │ ${fmt(f.d60.realista).padEnd(12)} │ ${fmt(f.d60.otimista).padEnd(6)}│`);
    console.log(`  │  90 dias  │ ${fmt(f.d90.pessimista).padEnd(12)} │ ${fmt(f.d90.realista).padEnd(12)} │ ${fmt(f.d90.otimista).padEnd(6)}│`);
    console.log(`  └───────────┴──────────────┴──────────────┴────────┘`);

    if (result.actions_to_beat_forecast) {
      console.log('\n  Ações para bater meta:');
      result.actions_to_beat_forecast.slice(0, 3).forEach((a, i) => {
        console.log(`  ${i+1}. [${a.impact}] ${a.action}`);
      });
    }
    console.log(`\n  Recomendação: ${result.recommendation}`);
  }

  // ── ROI — ROI por canal ───────────────────────────────────────────────────
  else if (mode === 'roi') {
    console.log('  → Analisando ROI por canal...');
    const defaultChannels = [
      { name: 'Instagram Orgânico', spend: 0, revenue: receita_bruta * 0.4, clients: Math.round(clientes_ativos * 0.4), leads: 5 },
      { name: 'Indicação',          spend: 0, revenue: receita_bruta * 0.4, clients: Math.round(clientes_ativos * 0.4), leads: 3 },
      { name: 'LinkedIn Orgânico',  spend: 0, revenue: receita_bruta * 0.2, clients: Math.round(clientes_ativos * 0.2), leads: 2 },
      { name: 'Google Ads',         spend: 0, revenue: 0, clients: 0, leads: 0 },
    ];

    const result = await analyzeROIByChannel(defaultChannels);
    saveOutput(`roi-channels-${ts}.json`, result);

    console.log('\n  ROI por Canal:');
    (result.channel_details || []).forEach(c => {
      const decision = c.decision.padEnd(10);
      console.log(`  ${decision} ${c.channel.padEnd(22)} | CAC: ${fmt(c.cac)} | ROI: ${c.roi_pct}%`);
    });
    console.log(`\n  Melhor canal: ${result.best_roi_channel}`);
    console.log(`  Para escalar: ${result.most_scalable_channel}`);
    if (result.budget_recommendation?.total_recommended > 0) {
      console.log(`  Budget recomendado: ${fmt(result.budget_recommendation.total_recommended)}`);
    }
  }

  // ── RISK — análise de riscos financeiros ──────────────────────────────────
  else if (mode === 'risk') {
    const margem_liquida = receita_bruta > 0
      ? calcs.calcNetMargin(calcs.calcNetProfit(calcs.calcNetRevenue(receita_bruta), custo_entrega, despesas), calcs.calcNetRevenue(receita_bruta))
      : 0;
    const runway_meses = caixa > 0 ? calcs.calcRunway(caixa, despesas + custo_entrega) : Infinity;

    console.log('  → Analisando riscos financeiros...');
    const result = await analyzeFinancialRisks({
      margem_liquida, runway_meses, receita_mensal: receita_bruta,
      cac: parseFloat(getArg('cac', '0')),
      ticket_medio, custo_ferramentas: CONFIG.fixed_costs.total_mensal,
    });
    saveOutput(`risk-analysis-${ts}.json`, result);

    console.log(`\n  Saúde: ${result.health_status}`);
    console.log(`  Nível de risco: ${result.overall_risk_level}`);
    if (result.risks?.length > 0) {
      console.log('\n  Riscos identificados:');
      result.risks.slice(0, 5).forEach(r => {
        console.log(`  [${r.severity}] ${r.what_happened}`);
        console.log(`    → ${r.recommended_action}`);
      });
    }
    console.log(`\n  Alerta CEO: ${result.ceo_alert}`);
    console.log(`  Capacidade de investimento segura: ${result.safe_investment_capacity}`);
  }

  // ── REPORT — relatório semanal ────────────────────────────────────────────
  else if (mode === 'report') {
    console.log('  → Gerando relatório financeiro semanal...');
    const result = await generateWeeklyFinancialReport(commonData);
    saveOutput(`weekly-report-${ts}.json`, result);

    console.log(`\n  ${result.report_title}`);
    console.log(`  Saúde: ${result.health_label}`);
    console.log(`  ${result.executive_summary}`);
    console.log('\n  Destaques:');
    (result.highlights || []).forEach((h, i) => console.log(`  ${i+1}. ${h}`));
    if (result.red_flags?.length > 0) {
      console.log('\n  Red Flags:');
      result.red_flags.forEach((f, i) => console.log(`  ⚠ ${f}`));
    }
    console.log('\n  Prioridades semana seguinte:');
    (result.next_week_priorities || []).forEach((p, i) => console.log(`  ${i+1}. ${p}`));
    console.log(`\n  Recomendação: ${result.recommendation}`);
  }

  // ── PNL — P&L rápido ──────────────────────────────────────────────────────
  else if (mode === 'pnl') {
    const receita_liq = calcs.calcNetRevenue(receita_bruta);
    const lucro_bruto = calcs.calcGrossProfit(receita_liq, custo_entrega);
    const lucro_liq   = calcs.calcNetProfit(receita_liq, custo_entrega, despesas);
    const m_bruta     = calcs.calcGrossMargin(lucro_bruto, receita_liq);
    const m_liq       = calcs.calcNetMargin(lucro_liq, receita_liq);

    const pnl = {
      date: new Date().toISOString().split('T')[0],
      receita_bruta, impostos: Math.round(receita_bruta * TAX_RATES.total_estimated),
      receita_liquida: Math.round(receita_liq),
      custo_entrega, lucro_bruto: Math.round(lucro_bruto), margem_bruta: Number(m_bruta.toFixed(1)),
      despesas_operacionais: despesas, lucro_liquido: Math.round(lucro_liq), margem_liquida: Number(m_liq.toFixed(1)),
      meta_bruta_ok: m_bruta >= CONFIG.targets.margem_bruta_min,
      meta_liq_ok:   m_liq >= CONFIG.targets.margem_liquida_min,
    };
    saveOutput(`pnl-${ts}.json`, pnl);

    console.log(`\n  P&L SmartOps IA — ${pnl.date}`);
    console.log(`  ─────────────────────────────────`);
    console.log(`  Receita bruta:          ${fmt(receita_bruta)}`);
    console.log(`  (-) Impostos (~8%):    -${fmt(pnl.impostos)}`);
    console.log(`  Receita líquida:        ${fmt(pnl.receita_liquida)}`);
    console.log(`  (-) Custo de entrega:  -${fmt(custo_entrega)}`);
    console.log(`  Lucro bruto:            ${fmt(pnl.lucro_bruto)} (${m_bruta.toFixed(1)}% ${pnl.meta_bruta_ok ? '✓' : '⚠'})`);
    console.log(`  (-) Desp. operacionais:-${fmt(despesas)}`);
    console.log(`  Lucro líquido:          ${fmt(pnl.lucro_liquido)} (${m_liq.toFixed(1)}% ${pnl.meta_liq_ok ? '✓' : '⚠'})`);
    console.log(`  ─────────────────────────────────`);
    console.log(`  Meta margem bruta:  ${CONFIG.targets.margem_bruta_min}%  ${pnl.meta_bruta_ok ? '✓ OK' : '✗ ABAIXO'}`);
    console.log(`  Meta margem líquida: ${CONFIG.targets.margem_liquida_min}% ${pnl.meta_liq_ok ? '✓ OK' : '✗ ABAIXO'}`);
  }

  // ── CAC — calcular CAC ───────────────────────────────────────────────────
  else if (mode === 'cac') {
    const spend   = parseFloat(getArg('spend',   '0'));
    const clients = parseInt(getArg('clientes',  '1'), 10);
    const cac = calcs.calcCAC(spend, clients);
    const maxCAC = calcs.calcMaxCAC(ticket_medio);
    const ok = cac <= maxCAC;

    const result = {
      spend, clients, cac: Math.round(cac), max_cac: Math.round(maxCAC),
      ticket_medio, cac_ok: ok,
      status: ok ? 'Dentro do limite' : 'CAC acima do máximo',
      ltv: Math.round(calcs.calcLTVSimple(ticket_medio, 2.5)),
      payback_meses: Number(calcs.calcPayback(cac, ticket_medio * (CONFIG.targets.margem_bruta_min / 100)).toFixed(1)),
    };
    result.ltv_cac = calcs.calcLTVCAC(result.ltv, cac);
    result.ltv_cac_assessment = calcs.assessLTVCAC(result.ltv_cac);
    saveOutput(`cac-${ts}.json`, result);

    console.log(`\n  CAC calculado:   ${fmt(result.cac)}`);
    console.log(`  CAC máximo:      ${fmt(result.max_cac)} (${CONFIG.targets.cac_max_pct_ticket}% do ticket)`);
    console.log(`  Status:          ${result.status} ${ok ? '✓' : '⚠'}`);
    console.log(`  LTV estimado:    ${fmt(result.ltv)}`);
    console.log(`  LTV/CAC:         ${result.ltv_cac}x — ${result.ltv_cac_assessment.status}`);
    console.log(`  Payback:         ${result.payback_meses} meses`);
  }

  // ── LTV — calcular LTV ────────────────────────────────────────────────────
  else if (mode === 'ltv') {
    const meses   = parseFloat(getArg('meses', '2.5'));
    const ltv = calcs.calcLTVSimple(ticket_medio, meses);
    const cac_estimate = parseFloat(getArg('cac', '500'));
    const ltv_cac = calcs.calcLTVCAC(ltv, cac_estimate);
    const assessment = calcs.assessLTVCAC(ltv_cac);
    const result = {
      ticket_medio, meses_retencao: meses, ltv: Math.round(ltv),
      cac_estimate, ltv_cac, ltv_cac_status: assessment.status,
      action: assessment.action, meta_ltv_cac: CONFIG.targets.ltv_cac_min,
    };
    saveOutput(`ltv-${ts}.json`, result);

    console.log(`\n  LTV calculado:   ${fmt(result.ltv)}`);
    console.log(`  Ticket médio:    ${fmt(ticket_medio)}`);
    console.log(`  Retenção média:  ${meses} meses`);
    console.log(`  CAC estimado:    ${fmt(cac_estimate)}`);
    console.log(`  LTV/CAC:         ${ltv_cac}x — ${assessment.status}`);
    console.log(`  Ação:            ${assessment.action}`);
  }

  // ── PRICING — recomendação de preço ───────────────────────────────────────
  else if (mode === 'pricing') {
    const service = getArg('service', 'quick-win');
    const context = getArg('context', '');
    console.log(`  → Analisando precificação: ${service}...`);
    const result = await generatePricingRecommendation(service, context);
    saveOutput(`pricing-${service}-${ts}.json`, result);

    console.log(`\n  Serviço: ${result.service}`);
    console.log(`  Preço atual:     ${fmt(result.current_price)}`);
    console.log(`  Preço mínimo:    ${fmt(result.minimum_price)}`);
    console.log(`  Preço recomendado:${fmt(result.recommended_price)}`);
    console.log(`  Desconto máximo: ${result.maximum_discount_pct}%`);
    console.log(`  Justificativa:   ${result.price_justification}`);
    console.log(`  Recomendação:    ${result.recommendation}`);
  }

  // ── SCENARIO — simular decisão ────────────────────────────────────────────
  else if (mode === 'scenario') {
    const action = getArg('action', 'investir R$ 1000 em Google Ads');
    console.log(`  → Simulando cenário: "${action}"...`);
    const result = await generateScenario(action, commonData);
    saveOutput(`scenario-${ts}.json`, result);

    console.log(`\n  Ação: ${result.action}`);
    console.log(`\n  Cenário Pessimista: ${result.scenarios?.pessimista?.outcome}`);
    console.log(`  Cenário Realista:   ${result.scenarios?.realista?.outcome}`);
    console.log(`  Cenário Otimista:   ${result.scenarios?.otimista?.outcome}`);
    console.log(`\n  Impacto 12 meses: ${result.financial_impact_12m}`);
    console.log(`  Recomendação:     ${result.recommendation}`);
    console.log(`  Break-even:       ${result.break_even_time}`);
  }

  // ── CEO-BRIEF — brief executivo ───────────────────────────────────────────
  else if (mode === 'ceo-brief') {
    console.log('  → Gerando brief executivo para CEO...');
    const result = await generateCEOBrief(commonData);
    saveOutput(`ceo-brief-${ts}.json`, result);

    const b = result.ceo_brief;
    console.log(`\n  ┌──────────────────────────────────────────┐`);
    console.log(`  │  STATUS: ${b?.status?.toUpperCase().padEnd(33)}│`);
    console.log(`  │  ${(b?.headline || '').slice(0, 42).padEnd(42)}│`);
    console.log(`  ├──────────────────────────────────────────┤`);
    console.log(`  │  Métricas: ${(b?.key_metrics || '').slice(0, 30).padEnd(30)}│`);
    console.log(`  │  Risco:    ${(b?.main_risk || '').slice(0, 30).padEnd(30)}│`);
    console.log(`  │  Opport.:  ${(b?.main_opportunity || '').slice(0, 30).padEnd(30)}│`);
    console.log(`  ├──────────────────────────────────────────┤`);
    console.log(`  │  Forecast 30d: ${fmt(b?.forecast_30d || 0).padEnd(27)}│`);
    console.log(`  │  Decisão:      ${(b?.decision_needed || '').slice(0, 27).padEnd(27)}│`);
    console.log(`  └──────────────────────────────────────────┘`);
  }

  // ── SERVICES — listar serviços e margens ──────────────────────────────────
  else if (mode === 'services') {
    const margins = analyzeServiceMarginsLocally();
    saveOutput(`services-${ts}.json`, margins);

    console.log('\n  Catálogo SmartOps IA — Margens por Serviço:\n');
    margins.forEach(s => {
      const ok = s.margem_status === 'ok';
      console.log(`  ${ok ? '✓' : '⚠'} ${s.nome}`);
      console.log(`    Ticket: ${fmt(s.ticket_bruto)} | Custo: ${fmt(s.custo_entrega)} | Margem: ${s.margem_bruta_pct}% | Mín: ${fmt(s.preco_minimo)}`);
    });

    const fixedCosts = CONFIG.fixed_costs.total_mensal;
    const breakEven = calcs.calcBreakEvenClients(fixedCosts, CONFIG.services['quick-win'].ticket_medio, CONFIG.targets.margem_bruta_min);
    console.log(`\n  Custos fixos mensais: ${fmt(fixedCosts)}`);
    console.log(`  Break-even (Quick Win): ${breakEven} cliente(s) para cobrir custos fixos`);
  }

  else {
    console.log('Modos disponíveis:');
    console.log('  dashboard | margin | forecast | roi | risk');
    console.log('  report | pnl | cac | ltv | pricing | scenario | ceo-brief | services');
  }
}

main().catch(err => {
  console.error('\n✗ Financial Agent error:', err.message);
  process.exit(1);
});
