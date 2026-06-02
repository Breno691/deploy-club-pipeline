// BeforeAfterAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function calculateImprovement(before, after, unit) {
  const reduction    = before - after;
  const reductionPct = before > 0 ? Math.round((reduction / before) * 100) : 0;
  const gain         = after > before ? Math.round(((after - before) / before) * 100) : 0;

  let level = '';
  if (reductionPct >= 50 || gain >= 50) level = 'TRANSFORMACIONAL';
  else if (reductionPct >= 30 || gain >= 30) level = 'SIGNIFICATIVO';
  else if (reductionPct >= 15 || gain >= 15) level = 'RELEVANTE';
  else level = 'INCREMENTAL';

  return { reduction, reductionPct, gain, level, unit };
}

function classifyMetricType(unit) {
  const u = (unit || '').toLowerCase();
  if (/hora|h\/|min/.test(u))            return 'tempo';
  if (/r\$|custo|valor|reais/.test(u))   return 'financeiro';
  if (/defeito|erro|retrabalho/.test(u)) return 'qualidade';
  if (/lead|cliente|venda/.test(u))      return 'comercial';
  if (/processo|etapa|ciclo/.test(u))    return 'operacional';
  return 'generico';
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateBeforeAfter({ client: clientName, sector, problem, intervention, metricBefore, metricAfter, unit, context = '' }) {
  const improvement  = calculateImprovement(metricBefore, metricAfter, unit);
  const metricType   = classifyMetricType(unit);

  const prompt = `Você é o Before/After Agent da SmartOps IA.
Sua missão é transformar resultados técnicos em comparações antes/depois claras, mensuráveis e persuasivas.

DADOS DO PROJETO:
- Cliente: ${clientName || 'Empresa do setor de ' + sector}
- Setor: ${sector}
- Problema: ${problem}
- Intervenção: ${intervention}
- Métrica antes: ${metricBefore} ${unit}
- Métrica depois: ${metricAfter} ${unit}
- Tipo de métrica: ${metricType}
- Contexto: ${context || 'nenhum'}

CÁLCULOS:
- Redução: ${improvement.reduction} ${unit}
- Redução percentual: ${improvement.reductionPct}%
- Nível do resultado: ${improvement.level}

Gere o framework antes/depois completo no formato:

ANTES:
- Situação: [descrição da situação antes]
- Métrica: [${metricBefore} ${unit}]
- Impacto no negócio: [como isso prejudicava a operação]
- Dor do cliente: [frustração/problema do cliente]
- Custo visível: [custo estimado do problema]
- Custo oculto: [impactos indiretos]

INTERVENÇÃO:
- Diagnóstico: [o que foi identificado]
- Método: [ferramenta/técnica SmartOps aplicada]
- Execução: [como foi feito]
- Tempo de implementação: [estimativa]

DEPOIS:
- Situação: [descrição da situação depois]
- Nova métrica: [${metricAfter} ${unit}]
- Melhoria: [${improvement.reductionPct}% de redução / ${improvement.gain}% de ganho]
- Ganho para o negócio: [impacto real no dia a dia]
- Satisfação: [o que o cliente ganhou em experiência]

APRENDIZADO:
- Por que funcionou: [raciocínio do método]
- Onde aplicar de novo: [setores/casos similares]
- Fator crítico de sucesso: [o que foi essencial]
- Risco de não ter agido: [o que teria acontecido]

HEADLINE DO CASE: [título persuasivo para usar em conteúdo]
QUOTE SUGERIDA: [frase de impacto para post/proposta]
PRÓXIMOS ATIVOS: [lista de ativos a criar com esse before/after]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    improvement,
    metricType,
    client: clientName,
    sector,
    problem,
    intervention,
    before: { value: metricBefore, unit },
    after:  { value: metricAfter,  unit },
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { generateBeforeAfter, calculateImprovement };
