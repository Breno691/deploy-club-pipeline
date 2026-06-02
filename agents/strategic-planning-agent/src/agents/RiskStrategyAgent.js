// RiskStrategyAgent.js — Strategic Planning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

const SEVERITY_SCORE  = { alta: 3, média: 2, baixa: 1 };
const PROB_SCORE      = { alta: 3, média: 2, baixa: 1 };

function scoreRisk(severity, probability) {
  const s = SEVERITY_SCORE[severity] || 2;
  const p = PROB_SCORE[probability]  || 2;
  const score = s * p;
  if (score >= 7) return { score, level: 'CRÍTICO',  action: 'Mitigar imediatamente', color: '🔴' };
  if (score >= 4) return { score, level: 'ALTO',     action: 'Plano de mitigação em 7 dias', color: '🟠' };
  if (score >= 2) return { score, level: 'MÉDIO',    action: 'Monitorar semanalmente', color: '🟡' };
  return              { score, level: 'BAIXO',    action: 'Registrar e observar', color: '🟢' };
}

function buildRiskRegister(context) {
  return CONFIG.common_risks.map(r => ({
    ...r,
    ...scoreRisk(r.severity, r.probability),
    mitigation: 'a definir',
    context,
  })).sort((a, b) => b.score - a.score);
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function identifyAndMitigateRisks({ context = '' }) {
  const register = buildRiskRegister(context);
  const criticals = register.filter(r => r.level === 'CRÍTICO');
  const highs     = register.filter(r => r.level === 'ALTO');

  const registerText = register.map(r =>
    `${r.color} [${r.level}] ${r.risk}\n  Severidade: ${r.severity} | Probabilidade: ${r.probability} | Score: ${r.score}`
  ).join('\n\n');

  const prompt = `Você é o Risk Strategy Agent da SmartOps IA.
Cargo: Diretor de Estratégia, Planejamento e OKRs.
SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG — fase inicial.

Analise os riscos estratégicos e gere planos de mitigação práticos.

CONTEXTO: ${context || 'empresa em fase inicial — sem clientes, construindo base'}
STAGE: ${CONFIG.company.stage}

REGISTRO DE RISCOS:
${registerText}

RISCOS CRÍTICOS: ${criticals.length}
RISCOS ALTOS: ${highs.length}

Para cada risco CRÍTICO e ALTO, gere:

RISK_REGISTER:

${criticals.concat(highs).map(r => `
RISK: ${r.risk}
LEVEL: ${r.color} ${r.level}
WHY_IT_MATTERS: [por que esse risco ameaça a empresa]
EARLY_WARNING: [sinal de que o risco está se concretizando]
MITIGATION: [3 ações concretas para mitigar]
CONTINGENCY: [o que fazer se o risco se concretizar]
OWNER: Breno Luiz
REVIEW_DATE: [quando revisar]`).join('\n')}

---

OVERALL_RISK_LEVEL: [avaliação geral]
TOP_RISK_TO_ACT_NOW: [risco mais urgente e por quê]
WHAT_REDUCES_MOST_RISK: [a ação que mais reduz risco total]
CEO_ALERT: [mensagem direta sobre o cenário de risco — 2-3 frases]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { register, criticals: criticals.length, highs: highs.length, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { identifyAndMitigateRisks, scoreRisk, buildRiskRegister };
