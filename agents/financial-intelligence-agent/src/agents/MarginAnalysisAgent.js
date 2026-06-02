// MarginAnalysisAgent.js — Financial Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG, TAX_RATES } = require('../config');
const { calcServiceMargin, calcNetMargin, calcMinimumPrice } = require('../calculations/financialCalculators');

const client = new Anthropic();

function analyzeServiceMarginsLocally(services = null) {
  const catalog = services || CONFIG.services;
  const results = Object.entries(catalog).map(([key, svc]) => {
    const margin = calcServiceMargin(svc.ticket_medio, svc.custo_entrega);
    const minPrice = calcMinimumPrice(svc.custo_entrega, CONFIG.targets.margem_bruta_min);
    return {
      id:              key,
      nome:            svc.name,
      tipo:            svc.tipo,
      ticket_bruto:    svc.ticket_medio,
      custo_entrega:   svc.custo_entrega,
      receita_liquida: margin.receita_liquida,
      lucro_bruto:     margin.lucro_bruto,
      margem_bruta_pct: margin.margem_bruta,
      preco_minimo:    Math.round(minPrice),
      margem_status:   margin.margem_bruta >= CONFIG.targets.margem_bruta_min ? 'ok' : 'baixa',
    };
  });
  return results.sort((a, b) => b.margem_bruta_pct - a.margem_bruta_pct);
}

async function analyzeMarginDeep(financialData = {}) {
  const {
    receita_mensal = 0, custo_entrega = 0, despesas_operacionais = 0,
    clientes = [], servicos = [], canais = [],
  } = financialData;

  const serviceMargins = analyzeServiceMarginsLocally();
  const netRevenue = receita_mensal * (1 - TAX_RATES.total_estimated);
  const grossProfit = netRevenue - custo_entrega;
  const netProfit = grossProfit - despesas_operacionais;
  const grossMarginPct = netRevenue ? (grossProfit / netRevenue) * 100 : 0;
  const netMarginPct = netRevenue ? (netProfit / netRevenue) * 100 : 0;

  const prompt = `Você é o Margin Analysis Agent da SmartOps IA — CFO Virtual.

SmartOps IA: consultoria Lean Six Sigma + Automação e IA para PMEs em BH/MG.

Analise as margens e identifique oportunidades de melhoria.

Dados financeiros:
- Receita bruta mensal: R$ ${receita_mensal}
- Receita líquida (após impostos): R$ ${Math.round(netRevenue)}
- Custo de entrega: R$ ${custo_entrega}
- Despesas operacionais: R$ ${despesas_operacionais}
- Lucro bruto: R$ ${Math.round(grossProfit)}
- Margem bruta: ${grossMarginPct.toFixed(1)}%
- Lucro líquido: R$ ${Math.round(netProfit)}
- Margem líquida: ${netMarginPct.toFixed(1)}%
- Custos fixos conhecidos: R$ ${CONFIG.fixed_costs.total_mensal}/mês

Margens por serviço (catálogo SmartOps):
${JSON.stringify(serviceMargins, null, 2)}

Clientes analisados:
${JSON.stringify(clientes.slice(0, 5), null, 2)}

Metas de margem:
- Bruta mínima: ${CONFIG.targets.margem_bruta_min}%
- Líquida mínima: ${CONFIG.targets.margem_liquida_min}%

Retorne JSON:
{
  "period": "${new Date().toISOString().split('T')[0]}",
  "gross_margin_pct": ${grossMarginPct.toFixed(1)},
  "net_margin_pct": ${netMarginPct.toFixed(1)},
  "margin_status": "saudável | atenção | crítico | pré-receita",
  "best_service": "serviço mais lucrativo",
  "worst_service": "serviço com menor margem",
  "margin_insights": ["insight 1", "insight 2", "insight 3"],
  "margin_risks": ["risco 1", "risco 2"],
  "improvement_actions": [
    { "action": "ação", "impact": "alto | médio", "effort": "baixo | médio | alto", "expected_gain_pct": 0 }
  ],
  "unprofitable_items": ["cliente ou serviço não lucrativo"],
  "pricing_recommendation": "recomendação de precificação",
  "target_gap": "quanto falta para atingir margem líquida mínima de ${CONFIG.targets.margem_liquida_min}%",
  "recommendation": "recomendação principal"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('MarginAnalysisAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.service_margins = serviceMargins;
  data.calculated_at = new Date().toISOString();
  return data;
}

module.exports = { analyzeMarginDeep, analyzeServiceMarginsLocally };
