// OKRAgent.js — Strategic Planning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function calculateOKRProgress(keyResults) {
  if (!keyResults || !keyResults.length) return 0;
  const total = keyResults.reduce((sum, kr) => {
    const pct = kr.target > 0 ? Math.min(100, (kr.current / kr.target) * 100) : 0;
    return sum + pct;
  }, 0);
  return Math.round(total / keyResults.length);
}

function scoreOKRHealth(progress, daysElapsed, totalDays) {
  const timeProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 50;
  const ratio        = timeProgress > 0 ? progress / timeProgress : 1;

  let status = '';
  let color  = '';
  if (ratio >= 0.8) { status = 'ON_TRACK';       color = '🟢'; }
  else if (ratio >= 0.5) { status = 'AT_RISK';    color = '🟡'; }
  else { status = 'OFF_TRACK'; color = '🔴'; }

  return { status, color, ratio: parseFloat(ratio.toFixed(2)), timeProgress: Math.round(timeProgress) };
}

function buildOKRRecord({ objective, keyResults, horizon, confidence = 6 }) {
  const startDate = new Date();
  const endDate   = new Date();
  endDate.setDate(endDate.getDate() + parseInt(horizon));

  const krs = keyResults.map((kr, i) => ({
    id:       `kr-${i + 1}`,
    kr:       kr.kr || kr,
    target:   kr.target   || 0,
    current:  kr.current  || 0,
    unit:     kr.unit     || 'unidades',
    progress: kr.target > 0 ? Math.round((kr.current || 0) / kr.target * 100) : 0,
    status:   'active',
  }));

  const progress = calculateOKRProgress(krs);

  return {
    id:          `okr-${Date.now()}`,
    objective,
    key_results: krs,
    horizon:     parseInt(horizon),
    start_date:  startDate.toISOString().split('T')[0],
    end_date:    endDate.toISOString().split('T')[0],
    confidence,
    progress,
    status:      'active',
    created_at:  new Date().toISOString(),
  };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function createOKR({ objective, horizon, context = '' }) {
  const initial = CONFIG.initial_okrs.find(o =>
    o.objective.toLowerCase().includes(objective.toLowerCase().split(' ')[0])
  );
  const krsText = initial
    ? initial.key_results.map(kr => `- ${kr.kr} (meta: ${kr.target} ${kr.unit})`).join('\n')
    : '(definir key results relevantes para o objetivo)';

  const prompt = `Você é o OKR Agent da SmartOps IA.
Cargo: Diretor de Estratégia, Planejamento e OKRs.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Stage: ${CONFIG.company.stage} — foco em clientes locais.

Crie um OKR completo e executável para:

OBJETIVO SOLICITADO: ${objective}
HORIZONTE: ${horizon} dias
CONTEXTO: ${context || 'empresa em fase inicial — sem clientes ainda — foco em gerar tração'}

KRs de referência (adaptar conforme o objetivo):
${krsText}

Responda EXATAMENTE neste formato:

OBJECTIVE: [objetivo claro e inspirador — 1 frase]
WHY_IT_MATTERS: [por que esse objetivo é crítico agora — 2-3 frases]

KEY_RESULTS:
1. KR: [resultado mensurável] | Meta: [número] [unidade] | Prazo: [data ou semana]
2. KR: [resultado mensurável] | Meta: [número] [unidade] | Prazo: [data ou semana]
3. KR: [resultado mensurável] | Meta: [número] [unidade] | Prazo: [data ou semana]
4. KR: [resultado mensurável] | Meta: [número] [unidade] | Prazo: [data ou semana]

INITIATIVES: [lista das 3-5 iniciativas principais que viabilizam os KRs]
OWNER: Breno Luiz — SmartOps IA
START_DATE: [hoje]
END_DATE: [${horizon} dias]
CONFIDENCE: [1-10 — sua confiança que é atingível]
REVIEW_FREQUENCY: [semanal/quinzenal]

RISKS: [2-3 riscos que podem impedir atingir esse OKR]
WHAT_MUST_BE_TRUE: [premissas necessárias para atingir]
LEADING_INDICATORS: [métricas semanais que mostram se estamos no caminho]
WHAT_TO_STOP: [o que deve parar para que esse OKR avance]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const record = buildOKRRecord({
    objective,
    keyResults: initial ? initial.key_results : [],
    horizon,
    confidence: initial ? initial.confidence : 6,
  });

  return { record, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

async function reviewOKRs({ okrs, daysElapsed, totalDays, context = '' }) {
  const oList = (okrs || CONFIG.initial_okrs).map(o => {
    const prog   = calculateOKRProgress(o.key_results);
    const health = scoreOKRHealth(prog, daysElapsed || 15, totalDays || o.horizon || 90);
    return `${health.color} ${o.objective}\n  Progresso: ${prog}% | Status: ${health.status} | Confiança: ${o.confidence}/10`;
  }).join('\n\n');

  const prompt = `Você é o OKR Agent da SmartOps IA.
Revise os OKRs atuais e gere recomendações de correção.

PERÍODO DECORRIDO: ${daysElapsed || 15} dias de ${totalDays || 90}
CONTEXTO: ${context || 'revisão semanal padrão'}

OKRs ATUAIS:
${oList}

Responda:

OKR_REVIEW_PERIOD: [período]
OVERALL_STATUS: [saúde geral dos OKRs]

POR OKR:
[para cada OKR] STATUS | PROGRESSO | O QUE ESTÁ TRAVANDO | RECOMENDAÇÃO

BOTTLENECKS: [gargalos principais]
DECISIONS_NEEDED: [decisões que o CEO precisa tomar]
WHAT_TO_ACCELERATE: [o que acelerar]
WHAT_TO_STOP: [o que parar]
NEXT_WEEK_TOP3: [3 ações para a próxima semana]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { createOKR, reviewOKRs, calculateOKRProgress, scoreOKRHealth, buildOKRRecord };
