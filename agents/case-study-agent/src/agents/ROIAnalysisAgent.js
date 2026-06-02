// ROIAnalysisAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function calculateROI({ investment, monthlySavings, annualRevenuGain = 0, hoursWeek = 0, costHour = CONFIG.default_cost_hour }) {
  const hoursMonth    = hoursWeek * CONFIG.weeks_per_month;
  const savingsFromHours = hoursMonth * costHour;
  const totalMonthly  = monthlySavings + savingsFromHours + (annualRevenuGain / 12);
  const totalAnnual   = totalMonthly * 12;
  const netGain       = totalAnnual - investment;
  const roi           = investment > 0 ? netGain / investment : 0;
  const paybackMonths = totalMonthly > 0 ? investment / totalMonthly : null;

  let confidence = 'ALTA';
  let assumptions = [];
  if (hoursWeek > 0 && !monthlySavings) {
    assumptions.push(`Custo-hora estimado: R$ ${costHour}`);
    confidence = 'MÉDIA';
  }
  if (annualRevenuGain > 0) {
    assumptions.push('Ganho de receita baseado em estimativa');
    confidence = 'MÉDIA';
  }
  if (!investment) {
    assumptions.push('Investimento não informado — ROI calculado sem investimento');
    confidence = 'BAIXA';
  }

  let roiLevel = '';
  if (roi >= CONFIG.highlights.roi_min_destacado) roiLevel = 'EXCELENTE — Case destaque para vendas';
  else if (roi >= 1.5)  roiLevel = 'FORTE — Bom para proposta';
  else if (roi >= 0.5)  roiLevel = 'POSITIVO — Válido, apresentar contexto';
  else roiLevel = 'BAIXO — Avaliar se há benefícios qualitativos';

  return {
    investment:         investment || 0,
    hours_week:         hoursWeek,
    cost_hour:          costHour,
    savings_from_hours: parseFloat(savingsFromHours.toFixed(2)),
    direct_savings_monthly: parseFloat(monthlySavings.toFixed(2)),
    revenue_gain_annual: annualRevenuGain,
    total_monthly:      parseFloat(totalMonthly.toFixed(2)),
    total_annual:       parseFloat(totalAnnual.toFixed(2)),
    net_gain:           parseFloat(netGain.toFixed(2)),
    roi:                parseFloat(roi.toFixed(2)),
    roi_pct:            parseFloat((roi * 100).toFixed(1)),
    payback_months:     paybackMonths ? parseFloat(paybackMonths.toFixed(1)) : null,
    confidence,
    assumptions,
    roi_level:          roiLevel,
  };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function analyzeROI({ caseName, investment, monthlySavings = 0, annualRevenuGain = 0, hoursWeek = 0, costHour, context = '' }) {
  const ch   = costHour || CONFIG.default_cost_hour;
  const calc = calculateROI({ investment, monthlySavings, annualRevenuGain, hoursWeek, costHour: ch });

  const prompt = `Você é o ROI Analysis Agent da SmartOps IA.
Sua missão é calcular e narrar o retorno real de projetos SmartOps de forma clara e comercialmente persuasiva.

CASE: ${caseName || 'Case SmartOps'}
DADOS:
- Investimento: R$ ${investment}
- Economia direta mensal: R$ ${monthlySavings}
- Horas economizadas/semana: ${hoursWeek}h
- Custo-hora: R$ ${ch}
- Ganho de receita anual: R$ ${annualRevenuGain}
- Contexto: ${context || 'nenhum'}

CÁLCULOS:
- Economia de tempo/mês: R$ ${calc.savings_from_hours}
- Total mensal: R$ ${calc.total_monthly}
- Total anual: R$ ${calc.total_annual}
- Ganho líquido: R$ ${calc.net_gain}
- ROI: ${calc.roi_pct}% (${calc.roi_level})
- Payback: ${calc.payback_months ? calc.payback_months + ' meses' : 'N/A'}
- Confiança: ${calc.confidence}
- Premissas: ${calc.assumptions.join('; ') || 'nenhuma'}

Responda EXATAMENTE neste formato:

CASE: [nome]
INVESTMENT: R$ ${investment}
MONTHLY_SAVINGS: R$ ${calc.total_monthly.toFixed(0)}
ANNUAL_SAVINGS: R$ ${calc.total_annual.toFixed(0)}
NET_GAIN: R$ ${calc.net_gain.toFixed(0)}
ROI: ${calc.roi_pct}% (${calc.roi}x)
PAYBACK: ${calc.payback_months ? calc.payback_months + ' meses' : 'N/A'}
CONFIDENCE_LEVEL: ${calc.confidence}
ASSUMPTIONS: [lista de premissas]
VALIDATION_NEEDED: [o que precisa ser validado com dados reais]

NARRATIVA FINANCEIRA:
[Texto de 3-4 parágrafos narrando o ROI de forma clara e persuasiva para uso em proposta ou site]

HEADLINE ROI: [título de impacto para usar em conteúdo]
QUOTE FINANCEIRA: [frase sobre o ROI para usar em proposta]
OBJEÇÃO QUEBRADA: [qual objeção esse ROI quebra]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { calc, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { analyzeROI, calculateROI };
