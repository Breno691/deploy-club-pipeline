// DiagnosticAgent — diagnóstico universal para qualquer área do negócio
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

/**
 * Executa diagnóstico completo de uma situação ou área do negócio.
 * Segue as 8 perguntas universais do sistema SmartOps.
 */
async function runDiagnostic(area, data, context = {}) {
  const prompt = `Você é o AI Operations Manager da SmartOps IA, atuando como consultor sênior.

Execute um diagnóstico completo da área abaixo.

ÁREA: ${area}
DADOS FORNECIDOS: ${JSON.stringify(data, null, 2)}
CONTEXTO: ${JSON.stringify(context, null, 2)}

Responda as 8 perguntas universais e entregue os 10 elementos obrigatórios:

# DIAGNÓSTICO — ${area.toUpperCase()}

## 1. O QUE ACONTECEU?
[Descreva a situação atual com precisão]

## 2. POR QUE ACONTECEU?
[Causa raiz — use os 5 Porquês se necessário]

## 3. QUAL O IMPACTO?
[Impacto em: receita / clientes / operação / reputação / tempo]

## 4. O QUE FAZER AGORA?
[Ação imediata mais importante]

## 5. QUAL A PRIORIDADE?
[P1/P2/P3/P4 — com justificativa]

## 6. QUAL O ROI ESPERADO?
[Retorno estimado se a ação for executada]

## 7. QUAL O RISCO DE NÃO AGIR?
[O que acontece se nada for feito em 30 dias]

## 8. COMO MEDIR O SUCESSO?
[Métrica específica e prazo]

---

## DIAGNÓSTICO COMPLETO

**Evidência:**
[Dado, sinal ou fato que suporta o diagnóstico]

**Recomendação:**
[Melhor caminho identificado]

**Plano de Ação:**
| Ação | Responsável | Prazo | Esforço |
|------|-------------|-------|---------|

**Score de Maturidade: X/100**
[Critérios: Clareza 15pts | Estrutura 15pts | Dados 15pts | Execução 15pts | Indicadores 15pts | Risco 10pts | Automação 10pts | Qualidade 5pts]

**Agentes que devem ser acionados:**
[Lista de agentes do sistema mais adequados para resolver]

**Próximo Passo Imediato:**
[1 ação específica para executar nas próximas 24h]`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

/**
 * Diagnóstico rápido — versão executiva em 5 minutos.
 */
async function quickDiagnostic(situation) {
  const prompt = `Você é o AI Operations Manager da SmartOps IA.

Faça um diagnóstico rápido e executivo da situação abaixo.

SITUAÇÃO: ${situation}

Formato obrigatório (máximo 400 palavras):

**PROBLEMA:** [1 frase]
**CAUSA:** [1-2 frases]
**IMPACTO:** [1-2 frases]
**AÇÃO IMEDIATA:** [1 ação específica]
**PRIORIDADE:** [P1/P2/P3/P4]
**ROI ESPERADO:** [estimativa]
**MÉTRICA:** [como medir]
**AGENTE IDEAL:** [nome do agente do sistema para aprofundar]`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

module.exports = { runDiagnostic, quickDiagnostic };
