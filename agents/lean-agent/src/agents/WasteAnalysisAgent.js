// WasteAnalysisAgent.js — Identifica e prioriza os 8 desperdícios
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const { calcWasteScore, identifyWasteSignals } = require('../calculations/leanCalculators');

const client = new Anthropic();

function analyzeWastesLocally(processData = {}) {
  const signals = identifyWasteSignals(processData.description || '');
  const wastes = Object.entries(CONFIG.eight_wastes).map(([code, waste]) => {
    const data = processData.wastes?.[code] || {};
    const score = calcWasteScore({
      custo_mes_brl:    data.custo_mes    || 0,
      frequencia:       data.frequencia   || 0,
      impacto_cliente:  data.impacto      || 3,
      facilidade_fix:   data.facilidade   || 5,
      rapido_resultado: data.velocidade   || 5,
    });
    return { code, ...waste, ...score, detected_in_text: signals.found.some(s => s.code === code) };
  });

  const ranked = wastes.sort((a, b) => b.score - a.score);
  const to_eliminate = ranked.filter(w => w.score >= 70);
  const total_custo_anual = ranked.reduce((s, w) => s + (w.custo_anual_brl || 0), 0);

  return { ranked, to_eliminate, total_custo_anual, signals, analyzed_at: new Date().toISOString() };
}

async function analyzeWastesWithClaude(processDescription, sector = 'servicos') {
  const local = analyzeWastesLocally({ description: processDescription });
  const bench = CONFIG.benchmarks[sector] || CONFIG.benchmarks.servicos;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Lean Agent da SmartOps IA — especialista em Lean Manufacturing e 8 Desperdícios.

Consultor: Breno Luiz — Black Belt Lean Six Sigma
Processo descrito: "${processDescription}"
Setor: ${sector}

Os 8 Desperdícios (DOWNTIME):
${Object.entries(CONFIG.eight_wastes).map(([k, v]) => `${k} — ${v.pt}: ${v.cost}`).join('\n')}

Sinais de desperdício detectados no texto: ${local.signals.found.map(s => s.pt).join(', ') || 'nenhum específico'}

Benchmarks do setor ${sector}: ${JSON.stringify(bench)}

Responda:

# WASTE ANALYSIS REPORT — ${sector.toUpperCase()}

## DIAGNÓSTICO RÁPIDO
[2-3 frases sobre o estado atual do processo]

## 8 DESPERDÍCIOS IDENTIFICADOS
Para cada desperdício presente (máximo 5 mais relevantes):
DESPERDÍCIO: [código] — [nome]
MANIFESTAÇÃO: [como aparece nesse processo específico]
CUSTO ESTIMADO: [R$/mês — se possível estimar]
EVIDÊNCIA: [dado ou observação que confirma]
PRIORIDADE: [Eliminar Agora / Kaizen / Monitorar]

## TOP 3 DESPERDÍCIOS A ATACAR PRIMEIRO
[Com justificativa de ROI + facilidade de implementação]

## OPORTUNIDADE DE MELHORIA
[O que a empresa poderia alcançar eliminando os 3 principais desperdícios]

## PRÓXIMO PASSO
[1 ação concreta para começar hoje — sem investimento ou com mínimo]`,
    }],
  });

  return { analysis: response.content[0].text, data: local };
}

module.exports = { analyzeWastesWithClaude, analyzeWastesLocally };
