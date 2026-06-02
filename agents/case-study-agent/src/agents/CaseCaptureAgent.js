// CaseCaptureAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function classifyCaseType({ hoursBefore, hoursAfter, investment, roiscore, sector }) {
  if (hoursAfter !== undefined && hoursBefore !== undefined) return 'automacao';
  if (investment && roiscore) return 'roi';
  if (sector === 'industria' || sector === 'logistica') return 'processo';
  return 'anonimo';
}

function scoreCasePotential({ roi, reductionPct, monthlySavings, hoursWeek }) {
  let score = 0;
  if (roi >= CONFIG.highlights.roi_min_destacado) score += 35;
  else if (roi >= 1.5) score += 20;
  if (reductionPct >= CONFIG.highlights.reducao_min_percentual) score += 25;
  else if (reductionPct >= 15) score += 12;
  if (monthlySavings >= CONFIG.highlights.economia_mensal_min) score += 20;
  else if (monthlySavings >= 500) score += 10;
  if (hoursWeek >= CONFIG.highlights.horas_min_economizadas) score += 20;
  else if (hoursWeek >= 2) score += 10;
  if (score >= 70) return { score, level: 'CASE_DESTAQUE', action: 'Criar case completo + todos os ativos + proposta de publicação' };
  if (score >= 40) return { score, level: 'CASE_FORTE', action: 'Criar case interno + anônimo + bloco de proposta' };
  if (score >= 20) return { score, level: 'MICRO_CASE', action: 'Criar micro case + post rápido' };
  return { score, level: 'APRENDIZADO', action: 'Registrar como aprendizado interno' };
}

function buildCaseRecord({ client: clientName, sector, problem, solution, investment, hoursBefore, hoursAfter, costHour }) {
  const ch = costHour || CONFIG.default_cost_hour;
  const hoursWeek = hoursBefore && hoursAfter ? hoursBefore - hoursAfter : 0;
  const monthlySavings = hoursWeek * CONFIG.weeks_per_month * ch;
  const annualSavings = monthlySavings * 12;
  const roi = investment > 0 ? ((monthlySavings * 12 - investment) / investment) : 0;
  const paybackMonths = monthlySavings > 0 ? investment / monthlySavings : null;
  const reductionPct = hoursBefore > 0 ? Math.round(((hoursBefore - hoursAfter) / hoursBefore) * 100) : 0;

  const potential = scoreCasePotential({ roi, reductionPct, monthlySavings, hoursWeek });
  const caseType  = classifyCaseType({ hoursBefore, hoursAfter, investment, roiscore: roi, sector });

  return {
    id:                `case-${Date.now()}`,
    case_name:         `${sector}-${Date.now()}`,
    client:            clientName || 'Confidencial',
    anonymized:        true,
    sector:            sector || 'outro',
    problem,
    solution,
    status:            'capturing',
    case_type:         caseType,
    investment:        investment || 0,
    hours_before_week: hoursBefore || 0,
    hours_after_week:  hoursAfter || 0,
    hours_saved_week:  hoursWeek,
    cost_hour:         ch,
    monthly_savings:   monthlySavings,
    annual_savings:    annualSavings,
    roi:               parseFloat(roi.toFixed(2)),
    payback_months:    paybackMonths ? parseFloat(paybackMonths.toFixed(1)) : null,
    reduction_pct:     reductionPct,
    potential,
    permission_level:  0,
    assets_to_create:  [],
    created_at:        new Date().toISOString(),
  };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function captureCase({ client: clientName, sector, problem, solution, investment, hoursBefore, hoursAfter, costHour, context = '' }) {
  const record = buildCaseRecord({ client: clientName, sector, problem, solution, investment, hoursBefore, hoursAfter, costHour });

  const prompt = `Você é o Case Capture Agent da SmartOps IA.
Cargo: Diretor de Prova Social, Resultados e Case Studies.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Capture este caso e documente todos os dados necessários para transformá-lo em ativo comercial.

DADOS DO PROJETO:
- Cliente: ${clientName || 'Confidencial'}
- Setor: ${sector}
- Problema principal: ${problem}
- Solução aplicada: ${solution}
- Investimento: R$ ${investment || 0}
- Horas/semana antes: ${hoursBefore || 'não informado'}
- Horas/semana depois: ${hoursAfter || 'não informado'}
- Custo-hora: R$ ${costHour || CONFIG.default_cost_hour}
- Contexto adicional: ${context || 'nenhum'}

MÉTRICAS CALCULADAS:
- Horas economizadas/semana: ${record.hours_saved_week}
- Economia mensal: R$ ${record.monthly_savings.toFixed(2)}
- Economia anual: R$ ${record.annual_savings.toFixed(2)}
- ROI: ${(record.roi * 100).toFixed(0)}%
- Payback: ${record.payback_months ? record.payback_months + ' meses' : 'N/A'}
- Redução percentual: ${record.reduction_pct}%
- Potencial do case: ${record.potential.level}

Responda EXATAMENTE neste formato:

CASE_NAME: [nome descritivo do case]
CLIENT: [nome ou "Confidencial"]
ANONYMIZED: [Sim/Não]
SECTOR: [setor]
PROJECT_TYPE: [tipo de projeto]
PROBLEM: [descrição clara do problema]
BEFORE_STATE: [situação antes da intervenção]
ROOT_CAUSE: [causa raiz do problema]
SOLUTION: [solução aplicada]
IMPLEMENTATION: [como foi implementado]
AFTER_STATE: [situação depois da intervenção]
METRICS_BEFORE: [métricas antes]
METRICS_AFTER: [métricas depois]
RESULTS: [resumo dos resultados]
ROI: [ROI calculado]
PAYBACK: [payback em meses]
POTENTIAL: [${record.potential.level}]
PERMISSION_STATUS: [Aguardando autorização do cliente]
ASSETS_TO_CREATE: [lista de ativos a criar]
SALES_USE: [como usar em vendas]
CONTENT_USE: [como usar em conteúdo]
NEXT_ACTION: [próximo passo]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { record, analysis: resp.content[0].text };
}

module.exports = { captureCase, buildCaseRecord, scoreCasePotential };
