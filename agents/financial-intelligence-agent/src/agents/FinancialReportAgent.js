// FinancialReportAgent.js — Financial Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG, TAX_RATES } = require('../config');
const calcs = require('../calculations/financialCalculators');
const { detectRisksLocally } = require('./FinancialRiskAgent');
const { buildLocalForecast } = require('./ForecastAgent');
const { analyzeServiceMarginsLocally } = require('./MarginAnalysisAgent');

const client = new Anthropic();

function buildFinancialSnapshot(data = {}) {
  const {
    receita_bruta = 0, custo_entrega = 0, despesas_operacionais = CONFIG.fixed_costs.total_mensal,
    caixa_disponivel = 0, pipeline_valor = 0, taxa_fechamento = 0.25,
    clientes_ativos = 0, ticket_medio = CONFIG.services['diagnostico-plano'].ticket_medio,
    cac = 0, investimento_ads = 0,
  } = data;

  const receita_liquida = calcs.calcNetRevenue(receita_bruta);
  const lucro_bruto = calcs.calcGrossProfit(receita_liquida, custo_entrega);
  const lucro_liquido = calcs.calcNetProfit(receita_liquida, custo_entrega, despesas_operacionais);
  const margem_bruta = calcs.calcGrossMargin(lucro_bruto, receita_liquida);
  const margem_liquida = calcs.calcNetMargin(lucro_liquido, receita_liquida);

  const ltv = calcs.calcLTVSimple(ticket_medio, 2.5);
  const ltv_cac = calcs.calcLTVCAC(ltv, cac);
  const ltv_cac_assessment = calcs.assessLTVCAC(ltv_cac);

  const burn = despesas_operacionais + custo_entrega;
  const runway_meses = calcs.calcRunway(caixa_disponivel, burn || despesas_operacionais);
  const runway_assessment = calcs.assessRunway(runway_meses);

  const break_even_clients = calcs.calcBreakEvenClients(
    despesas_operacionais, ticket_medio, CONFIG.targets.margem_bruta_min
  );

  const health = calcs.assessFinancialHealth({
    receita_liquida, margem_liquida, ltv_cac, cac, ticket_medio, runway_meses,
  });

  const forecast = buildLocalForecast({
    recorrencia_mensal: receita_bruta * 0.3,
    pipeline_valor, taxa_fechamento, ticket_medio,
    custo_mensal: despesas_operacionais,
  });

  return {
    date: new Date().toISOString().split('T')[0],
    health_status: health,
    health_label:  CONFIG.health_thresholds[health]?.label || health,
    receita: {
      bruta:   receita_bruta,
      liquida: Math.round(receita_liquida),
      meta:    CONFIG.targets.receita_meta_mensal,
      gap_meta: Math.max(0, CONFIG.targets.receita_meta_mensal - receita_bruta),
    },
    custos: {
      entrega:     custo_entrega,
      operacional: despesas_operacionais,
      total:       custo_entrega + despesas_operacionais,
      ferramentas: CONFIG.fixed_costs.total_mensal,
    },
    lucro: {
      bruto:   Math.round(lucro_bruto),
      liquido: Math.round(lucro_liquido),
    },
    margens: {
      bruta:   Number(margem_bruta.toFixed(1)),
      liquida: Number(margem_liquida.toFixed(1)),
      bruta_ok:   margem_bruta >= CONFIG.targets.margem_bruta_min,
      liquida_ok: margem_liquida >= CONFIG.targets.margem_liquida_min,
    },
    unit_economics: {
      cac, ltv: Math.round(ltv), ltv_cac, ltv_cac_status: ltv_cac_assessment.status, ticket_medio,
    },
    caixa: {
      disponivel: caixa_disponivel,
      runway_meses: runway_meses === Infinity ? 'seguro' : Number(runway_meses.toFixed(1)),
      runway_status: runway_assessment.status,
    },
    pipeline: {
      valor_total: pipeline_valor,
      esperado:    Math.round(pipeline_valor * taxa_fechamento),
      taxa_fechamento,
    },
    forecast: {
      d30_realista: forecast.d30.realista,
      d60_realista: forecast.d60.realista,
      d90_realista: forecast.d90.realista,
    },
    break_even_clients,
    clientes_ativos,
    alerts_count:  detectRisksLocally({ margem_liquida, runway_meses, ltv_cac, cac, ticket_medio }).length,
  };
}

async function generateWeeklyFinancialReport(data = {}) {
  const snapshot = buildFinancialSnapshot(data);
  const serviceMargins = analyzeServiceMarginsLocally();
  const risks = detectRisksLocally(snapshot);

  const prompt = `Você é o Financial Report Agent da SmartOps IA — CFO Virtual.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Gere o relatório financeiro semanal completo.

Snapshot financeiro:
${JSON.stringify(snapshot, null, 2)}

Margens por serviço:
${JSON.stringify(serviceMargins.slice(0, 4), null, 2)}

Riscos detectados:
${JSON.stringify(risks, null, 2)}

Retorne JSON:
{
  "report_title": "Relatório Financeiro Semanal — SmartOps IA",
  "report_date": "${snapshot.date}",
  "health_status": "${snapshot.health_status}",
  "health_label":  "${snapshot.health_label}",
  "executive_summary": "resumo executivo em 3 linhas — direto ao ponto",
  "kpis": {
    "receita_bruta":    ${snapshot.receita.bruta},
    "receita_liquida":  ${snapshot.receita.liquida},
    "lucro_bruto":      ${snapshot.lucro.bruto},
    "lucro_liquido":    ${snapshot.lucro.liquido},
    "margem_bruta_pct": ${snapshot.margens.bruta},
    "margem_liquida_pct": ${snapshot.margens.liquida},
    "cac":              ${snapshot.unit_economics.cac},
    "ltv":              ${snapshot.unit_economics.ltv},
    "ltv_cac":          ${snapshot.unit_economics.ltv_cac},
    "clientes_ativos":  ${snapshot.clientes_ativos}
  },
  "forecast_summary": "previsão em 3 cenários para próximo mês",
  "highlights":  ["destaque 1", "destaque 2"],
  "red_flags":   ["alerta 1", "alerta 2"],
  "cost_review": "análise de custos: o que pode ser cortado",
  "best_service_this_week": "serviço mais rentável",
  "pricing_alert": "há algum serviço com preço abaixo do mínimo?",
  "next_week_priorities": ["prioridade financeira 1", "prioridade financeira 2", "prioridade financeira 3"],
  "ceo_decision_needed": ["decisão que CEO precisa tomar"],
  "break_even_note": "quantos clientes faltam para break-even",
  "recommendation": "recomendação financeira principal",
  "format": "SMARTOPS_FINANCIAL_REPORT_v1"
}

Use o formato padrão SmartOps:
TÍTULO, CONTEXTO, DADOS, PROBLEMA, EVIDÊNCIA, IMPACTO, RECOMENDAÇÃO, AÇÃO, PRIORIDADE, ROI, RISCO, PRÓXIMO PASSO.

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('FinancialReportAgent: no JSON from Claude');
  const result = JSON.parse(jsonMatch[0]);
  result.snapshot = snapshot;
  result.risks = risks;
  result.service_margins = serviceMargins;
  return result;
}

async function generateCEOBrief(data = {}) {
  const snapshot = buildFinancialSnapshot(data);
  const risks = detectRisksLocally(snapshot);
  const criticalRisks = risks.filter(r => r.severity === 'CRÍTICO' || r.severity === 'ALTO');

  const prompt = `Você é o Financial Report Agent da SmartOps IA — CFO Virtual.

Crie um brief financeiro executivo de 5 linhas para o CEO Advisor.

Saúde: ${snapshot.health_label}
Receita: R$ ${snapshot.receita.bruta} (meta: R$ ${snapshot.receita.meta})
Margem líquida: ${snapshot.margens.liquida}%
LTV/CAC: ${snapshot.unit_economics.ltv_cac}x
Riscos críticos: ${criticalRisks.length}

Forecast 30d: R$ ${snapshot.forecast.d30_realista}
Forecast 90d: R$ ${snapshot.forecast.d90_realista}

Retorne JSON:
{
  "ceo_brief": {
    "status": "uma palavra: saudável | atenção | risco | crítico",
    "headline": "headline financeiro em uma linha",
    "key_metrics": "receita, margem, CAC, LTV em uma linha",
    "main_risk": "principal risco em uma linha",
    "main_opportunity": "principal oportunidade em uma linha",
    "decision_needed": "decisão que CEO deve tomar agora",
    "forecast_30d": ${snapshot.forecast.d30_realista},
    "confidence": "confiança no forecast em %"
  }
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('FinancialReportAgent CEO brief: no JSON');
  const result = JSON.parse(jsonMatch[0]);
  result.snapshot = snapshot;
  return result;
}

async function generatePricingRecommendation(serviceKey, context = '') {
  const svc = CONFIG.services[serviceKey];
  if (!svc) throw new Error(`Service not found: ${serviceKey}`);

  const margin = require('../calculations/financialCalculators').calcServiceMargin(svc.ticket_medio, svc.custo_entrega);
  const minPrice = require('../calculations/financialCalculators').calcMinimumPrice(svc.custo_entrega, CONFIG.targets.margem_bruta_min);
  const discountImpact10 = require('../calculations/financialCalculators').calcDiscountImpact(svc.ticket_medio, 10, svc.custo_entrega);

  const prompt = `Você é o Financial Report Agent da SmartOps IA — CFO Virtual.

Analise a precificação deste serviço.

Serviço: ${svc.name}
Ticket atual: R$ ${svc.ticket_medio}
Custo de entrega: R$ ${svc.custo_entrega}
Margem bruta atual: ${margin.margem_bruta}%
Preço mínimo calculado (margem ${CONFIG.targets.margem_bruta_min}%): R$ ${Math.round(minPrice)}
Impacto de desconto 10%: margem cai de ${margin.margem_bruta}% para ${discountImpact10.discounted_margin}%

Contexto de mercado: ${context || 'consultoria B2B para PMEs em BH — fase inicial de captação de clientes'}

Metas: margem bruta ≥ ${CONFIG.targets.margem_bruta_min}%, margem líquida ≥ ${CONFIG.targets.margem_liquida_min}%

Retorne JSON:
{
  "service": "${svc.name}",
  "current_price": ${svc.ticket_medio},
  "minimum_price": ${Math.round(minPrice)},
  "recommended_price": 0,
  "maximum_discount_pct": 0,
  "target_margin_price": 0,
  "price_justification": "como justificar este preço para o cliente",
  "discount_policy": "política de desconto recomendada",
  "value_based_angle": "argumento de valor percebido para justificar preço",
  "packaging_suggestion": "como empacotar para aumentar ticket sem aumentar preço unitário",
  "competitor_context": "contexto competitivo de preço",
  "risk_of_underpricing": "risco de cobrar menos que o mínimo",
  "recommendation": "recomendação final de precificação"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('FinancialReportAgent pricing: no JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateScenario(action, currentData = {}) {
  const snapshot = buildFinancialSnapshot(currentData);

  const prompt = `Você é o Financial Report Agent da SmartOps IA — CFO Virtual.

Simule o impacto financeiro desta ação/decisão.

Estado atual:
${JSON.stringify(snapshot, null, 2)}

Ação a simular: "${action}"

Retorne JSON:
{
  "action": "${action}",
  "simulation_date": "${snapshot.date}",
  "current_state": {
    "receita": ${snapshot.receita.bruta},
    "margem_liquida": ${snapshot.margens.liquida},
    "ltv_cac": ${snapshot.unit_economics.ltv_cac}
  },
  "scenarios": {
    "pessimista": {
      "receita_delta": 0,
      "margem_delta": 0,
      "novo_cac": 0,
      "outcome": "resultado"
    },
    "realista": {
      "receita_delta": 0,
      "margem_delta": 0,
      "novo_cac": 0,
      "outcome": "resultado"
    },
    "otimista": {
      "receita_delta": 0,
      "margem_delta": 0,
      "novo_cac": 0,
      "outcome": "resultado"
    }
  },
  "financial_impact_12m": "impacto em 12 meses",
  "risks": ["risco 1", "risco 2"],
  "opportunities": ["oportunidade 1", "oportunidade 2"],
  "recommendation": "recomendação final — fazer ou não fazer",
  "conditions_to_proceed": ["condição 1 para aprovar esta ação"],
  "break_even_time": "tempo para recuperar investimento"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('FinancialReportAgent scenario: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = {
  buildFinancialSnapshot,
  generateWeeklyFinancialReport,
  generateCEOBrief,
  generatePricingRecommendation,
  generateScenario,
};
