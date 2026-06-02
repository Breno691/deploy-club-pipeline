// FinancialRiskAgent.js — Financial Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG, TAX_RATES } = require('../config');
const { assessRunway, assessLTVCAC, assessFinancialHealth } = require('../calculations/financialCalculators');

const client = new Anthropic();

const RISK_SEVERITIES = { CRITICAL: 'CRÍTICO', HIGH: 'ALTO', MEDIUM: 'MÉDIO', LOW: 'BAIXO' };

function detectRisksLocally(metrics = {}) {
  const {
    margem_liquida = 0, runway_meses = Infinity,
    ltv_cac = 0, cac = 0, ticket_medio = 0,
    receita_total = 0, maior_cliente_pct = 0,
    receita_mensal = 0, custo_ferramentas = 0,
    forecast_vs_real = 1, inadimplencia_pct = 0,
  } = metrics;

  const risks = [];

  if (runway_meses < 2) risks.push({ type: 'CASH_RISK', severity: RISK_SEVERITIES.CRITICAL, message: `Runway crítico: ${runway_meses.toFixed(1)} meses`, action: 'Ação imediata: cortar custos e acelerar vendas' });
  else if (runway_meses < CONFIG.alert_thresholds.runway_min_dias / 30) risks.push({ type: 'CASH_RISK', severity: RISK_SEVERITIES.HIGH, message: `Runway em risco: ${runway_meses.toFixed(1)} meses`, action: 'Monitorar caixa e acelerar cobrança' });

  if (margem_liquida < 10) risks.push({ type: 'MARGIN_RISK', severity: RISK_SEVERITIES.CRITICAL, message: `Margem líquida crítica: ${margem_liquida.toFixed(1)}%`, action: 'Revisar precificação urgente' });
  else if (margem_liquida < CONFIG.alert_thresholds.margem_liquida_min) risks.push({ type: 'MARGIN_RISK', severity: RISK_SEVERITIES.HIGH, message: `Margem líquida baixa: ${margem_liquida.toFixed(1)}%`, action: 'Revisar custos e aumentar preços' });

  if (ltv_cac > 0 && ltv_cac < 2) risks.push({ type: 'LTV_CAC_RISK', severity: RISK_SEVERITIES.HIGH, message: `LTV/CAC crítico: ${ltv_cac.toFixed(2)}x`, action: 'Revisar modelo de aquisição' });
  else if (ltv_cac > 0 && ltv_cac < CONFIG.alert_thresholds.ltv_cac_min) risks.push({ type: 'LTV_CAC_RISK', severity: RISK_SEVERITIES.MEDIUM, message: `LTV/CAC abaixo da meta: ${ltv_cac.toFixed(2)}x`, action: 'Melhorar retenção ou reduzir CAC' });

  if (cac > 0 && ticket_medio > 0 && cac > ticket_medio * (CONFIG.alert_thresholds.cac_max_pct_ticket / 100)) {
    risks.push({ type: 'CAC_RISK', severity: RISK_SEVERITIES.HIGH, message: `CAC alto: R$ ${cac} vs ticket R$ ${ticket_medio}`, action: 'Otimizar aquisição ou rebalancear canais' });
  }

  if (maior_cliente_pct > CONFIG.targets.receita_concentrada_max) risks.push({ type: 'CONCENTRATION_RISK', severity: RISK_SEVERITIES.HIGH, message: `Receita concentrada: ${maior_cliente_pct}% em 1 cliente`, action: 'Diversificar base de clientes' });

  if (receita_mensal > 0 && custo_ferramentas > receita_mensal * (CONFIG.alert_thresholds.custo_tool_max_pct / 100)) {
    risks.push({ type: 'TOOL_COST_RISK', severity: RISK_SEVERITIES.MEDIUM, message: 'Custo de ferramentas alto em relação à receita', action: 'Auditar ferramentas e cancelar o que não gera ROI' });
  }

  if (forecast_vs_real < 0.8 && receita_total > 0) risks.push({ type: 'FORECAST_RISK', severity: RISK_SEVERITIES.MEDIUM, message: `Receita ${((1 - forecast_vs_real) * 100).toFixed(0)}% abaixo do forecast`, action: 'Revisar pipeline e acelerar vendas' });

  if (inadimplencia_pct > 5) risks.push({ type: 'INADIMPLENCY_RISK', severity: RISK_SEVERITIES.HIGH, message: `Inadimplência: ${inadimplencia_pct}%`, action: 'Acionar cobrança e revisar critérios de crédito' });

  return risks.sort((a, b) => {
    const order = { CRÍTICO: 0, ALTO: 1, MÉDIO: 2, BAIXO: 3 };
    return order[a.severity] - order[b.severity];
  });
}

async function analyzeFinancialRisks(metrics = {}) {
  const localRisks = detectRisksLocally(metrics);
  const health = assessFinancialHealth(metrics);

  const prompt = `Você é o Financial Risk Agent da SmartOps IA — CFO Virtual.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Analise os riscos financeiros e gere plano de ação.

Métricas atuais:
${JSON.stringify(metrics, null, 2)}

Riscos detectados automaticamente:
${JSON.stringify(localRisks, null, 2)}

Saúde financeira calculada: ${health}
Custos fixos mensais: R$ ${CONFIG.fixed_costs.total_mensal}

Metas que devem ser atingidas:
- Margem bruta mínima: ${CONFIG.targets.margem_bruta_min}%
- Margem líquida mínima: ${CONFIG.targets.margem_liquida_min}%
- LTV/CAC mínimo: ${CONFIG.targets.ltv_cac_min}x
- Receita meta: R$ ${CONFIG.targets.receita_meta_mensal}/mês

Retorne JSON:
{
  "risk_assessment_date": "${new Date().toISOString().split('T')[0]}",
  "health_status": "${health}",
  "overall_risk_level": "CRÍTICO | ALTO | MÉDIO | BAIXO",
  "risks": [
    {
      "type": "tipo de risco",
      "severity": "CRÍTICO | ALTO | MÉDIO | BAIXO",
      "what_happened": "o que está acontecendo",
      "impact": "impacto financeiro estimado",
      "root_cause": "causa raiz",
      "recommended_action": "ação recomendada",
      "deadline": "prazo para agir",
      "agents_to_trigger": ["agente 1", "agente 2"]
    }
  ],
  "immediate_actions": ["ação imediata 1", "ação imediata 2"],
  "ceo_alert": "mensagem de alerta para CEO Advisor",
  "forecast_impact": "como estes riscos afetam o forecast",
  "risk_trajectory": "melhorando | estável | piorando",
  "safe_investment_capacity": "quanto pode investir com segurança agora"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('FinancialRiskAgent: no JSON from Claude');
  const result = JSON.parse(jsonMatch[0]);
  result.local_risks = localRisks;
  return result;
}

module.exports = { analyzeFinancialRisks, detectRisksLocally };
