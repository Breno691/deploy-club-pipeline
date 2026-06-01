// ConsolidatorAgent — consolida respostas de múltiplos agentes em plano integrado
const Anthropic = require('@anthropic-ai/sdk');
const fs   = require('fs');
const path = require('path');
const { CONFIG } = require('../config');

// Carrega o prompt completo do AI Operations Manager
function loadSystemPrompt() {
  const promptPath = path.join(__dirname, '../../PROMPT.md');
  if (fs.existsSync(promptPath)) return fs.readFileSync(promptPath, 'utf-8');
  return 'Você é o AI Operations Manager da SmartOps IA.';
}

const client = new Anthropic();

/**
 * Consolida respostas de múltiplos agentes em um plano de ação único e priorizado.
 */
async function consolidateResponses(userRequest, agentResponses, routingResult) {
  const responsesText = Object.entries(agentResponses)
    .map(([key, response]) => {
      const agentConfig = CONFIG.agents[key];
      return `## ${agentConfig?.name || key}\n${response}`;
    })
    .join('\n\n---\n\n');

  const prompt = `Você é o AI Operations Manager da SmartOps IA.

Recebeu respostas de ${Object.keys(agentResponses).length} agente(s) para o seguinte pedido:

PEDIDO ORIGINAL:
${userRequest}

RESPOSTAS DOS AGENTES:
${responsesText}

Sua missão é consolidar tudo em um plano integrado, eliminando redundâncias e priorizando por ROI.

Formato obrigatório de saída:

# PLANO INTEGRADO — AI Operations Manager

## RESUMO EXECUTIVO
[2-3 frases com o diagnóstico central e a decisão mais importante]

## DIAGNÓSTICO CONSOLIDADO
[O que os agentes identificaram de mais importante]

## RECOMENDAÇÃO PRINCIPAL
[A ação de maior impacto]

## PLANO DE AÇÃO PRIORIZADO

### P1 — URGENTE (fazer hoje)
| Ação | Agente | Prazo | ROI |
|------|--------|-------|-----|

### P2 — ALTA (fazer esta semana)
| Ação | Agente | Prazo | ROI |
|------|--------|-------|-----|

### P3 — MÉDIA (fazer este mês)
| Ação | Agente | Prazo | ROI |
|------|--------|-------|-----|

## ENTREGÁVEIS
- [O que cada agente vai produzir]

## INDICADORES DE SUCESSO
- [Como medir se deu certo]

## RISCOS
- [O que pode dar errado e como prevenir]

## PRÓXIMOS 3 PASSOS (exatos)
1. [Ação concreta com responsável]
2. [Ação concreta com responsável]
3. [Ação concreta com responsável]

---
Agentes consultados: ${routingResult.agents.map(k => CONFIG.agents[k]?.name || k).join(', ')}`;

  const systemPrompt = loadSystemPrompt();
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

/**
 * Para pedidos simples (1 agente), formata a resposta diretamente sem consolidação.
 */
async function formatSingleAgentResponse(userRequest, agentKey, agentResponse) {
  const agentConfig = CONFIG.agents[agentKey];

  const prompt = `Você é o AI Operations Manager da SmartOps IA.

O agente "${agentConfig?.name}" respondeu ao pedido abaixo. Formate a resposta de forma clara e executável.

PEDIDO: ${userRequest}

RESPOSTA DO AGENTE:
${agentResponse}

Mantenha todo o conteúdo relevante. Adicione:
1. Um resumo executivo de 2 linhas no topo
2. "Próximo passo imediato:" ao final (1 ação específica)

Não invente informações novas — apenas formate e destaque o que já está na resposta.`;

  const systemPrompt = loadSystemPrompt();
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

module.exports = { consolidateResponses, formatSingleAgentResponse };
