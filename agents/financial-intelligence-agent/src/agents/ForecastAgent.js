// ForecastAgent.js — Financial Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG, TAX_RATES } = require('../config');

const client = new Anthropic();

function buildLocalForecast(data = {}) {
  const {
    recorrencia_mensal = 0,
    pipeline_valor = 0,
    taxa_fechamento = 0.25,
    ticket_medio = CONFIG.services['diagnostico-plano'].ticket_medio,
    propostas_abertas = 0,
    custo_mensal = CONFIG.fixed_costs.total_mensal,
  } = data;

  const pipeline_expected = pipeline_valor * taxa_fechamento;
  const propostas_expected = propostas_abertas * ticket_medio * taxa_fechamento;

  const base = recorrencia_mensal + pipeline_expected + propostas_expected;
  const growth_rate = 0.15; // 15% crescimento mensal estimado

  return {
    d30: {
      pessimista: Math.round(base * 0.6),
      realista:   Math.round(base),
      otimista:   Math.round(base * 1.4),
      custo:      custo_mensal,
      lucro_realista: Math.round(base * (1 - TAX_RATES.total_estimated) - custo_mensal),
    },
    d60: {
      pessimista: Math.round(base * 0.6 * (1 + growth_rate * 0.5)),
      realista:   Math.round(base * (1 + growth_rate)),
      otimista:   Math.round(base * 1.4 * (1 + growth_rate * 1.5)),
      custo:      custo_mensal,
      lucro_realista: Math.round(base * (1 + growth_rate) * (1 - TAX_RATES.total_estimated) - custo_mensal),
    },
    d90: {
      pessimista: Math.round(base * 0.6 * Math.pow(1 + growth_rate * 0.5, 2)),
      realista:   Math.round(base * Math.pow(1 + growth_rate, 2)),
      otimista:   Math.round(base * 1.4 * Math.pow(1 + growth_rate * 1.5, 2)),
      custo:      custo_mensal,
      lucro_realista: Math.round(base * Math.pow(1 + growth_rate, 2) * (1 - TAX_RATES.total_estimated) - custo_mensal),
    },
    meta_mensal:  CONFIG.targets.receita_meta_mensal,
    gap_to_meta:  Math.max(0, CONFIG.targets.receita_meta_mensal - base),
    assumptions: {
      recorrencia:     recorrencia_mensal,
      pipeline_fechamento: pipeline_expected,
      propostas_fechamento: propostas_expected,
      taxa_fechamento,
      growth_rate_estimado: `${(growth_rate * 100).toFixed(0)}%/mês`,
    },
  };
}

async function generateForecastWithInsights(data = {}) {
  const localForecast = buildLocalForecast(data);
  const {
    recorrencia_mensal = 0, pipeline_valor = 0,
    propostas_abertas = 0, reunioes_agendadas = 0,
    clientes_ativos = 0, receita_historica = [],
  } = data;

  const prompt = `Você é o Forecast Agent da SmartOps IA — CFO Virtual.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Fase atual: pré-receita em construção de base de clientes.

Contexto atual:
- Receita recorrente mensal: R$ ${recorrencia_mensal}
- Pipeline total: R$ ${pipeline_valor}
- Propostas abertas: ${propostas_abertas}
- Reuniões agendadas: ${reunioes_agendadas}
- Clientes ativos: ${clientes_ativos}
- Custos fixos mensais: R$ ${CONFIG.fixed_costs.total_mensal}
- Meta de receita mensal: R$ ${CONFIG.targets.receita_meta_mensal}

Forecast calculado localmente:
${JSON.stringify(localForecast, null, 2)}

Histórico (se houver):
${JSON.stringify(receita_historica, null, 2)}

Retorne JSON com análise e recomendações de forecast:
{
  "forecast_date": "${new Date().toISOString().split('T')[0]}",
  "current_phase": "pré-receita | início | crescimento | escala",
  "forecast": {
    "d30": { "pessimista": 0, "realista": 0, "otimista": 0, "custo": ${CONFIG.fixed_costs.total_mensal}, "confidence": "%" },
    "d60": { "pessimista": 0, "realista": 0, "otimista": 0, "custo": ${CONFIG.fixed_costs.total_mensal}, "confidence": "%" },
    "d90": { "pessimista": 0, "realista": 0, "otimista": 0, "custo": ${CONFIG.fixed_costs.total_mensal}, "confidence": "%" }
  },
  "meta_30d_gap": "quanto falta para bater meta mensal de R$ ${CONFIG.targets.receita_meta_mensal}",
  "break_even_clients": "quantos clientes para cobrir custos fixos",
  "key_assumptions": ["premissa 1", "premissa 2", "premissa 3"],
  "forecast_risks": ["risco 1", "risco 2"],
  "actions_to_beat_forecast": [
    { "action": "ação", "impact": "alto | médio", "deadline": "dias", "expected_revenue": 0 }
  ],
  "pipeline_quality": "fraco | médio | bom | excelente",
  "recommendation": "recomendação principal para atingir meta",
  "next_milestone": "próximo marco financeiro"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ForecastAgent: no JSON from Claude');
  const data_result = JSON.parse(jsonMatch[0]);
  data_result.local_forecast = localForecast;
  return data_result;
}

module.exports = { generateForecastWithInsights, buildLocalForecast };
