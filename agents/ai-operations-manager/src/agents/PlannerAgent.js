// PlannerAgent — cria plano de ação 5W2H e planos de projeto completos
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

/**
 * Cria plano de ação 5W2H a partir de um objetivo ou problema.
 */
async function create5W2H(objective, context = {}) {
  const prompt = `Você é o AI Operations Manager da SmartOps IA.

Crie um Plano de Ação 5W2H completo para o objetivo abaixo.

OBJETIVO: ${objective}
CONTEXTO: ${JSON.stringify(context)}

# Plano de Ação 5W2H

## WHAT — O que será feito?
[Descrição clara da ação]

## WHY — Por que será feito?
[Motivação e problema que resolve]

## WHERE — Onde será feito?
[Local, sistema, canal ou processo]

## WHEN — Quando será feito?
[Data início, etapas, prazo final]

## WHO — Quem é responsável?
[Responsável principal + apoio]

## HOW — Como será feito?
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## HOW MUCH — Quanto vai custar/exigir?
[Investimento em tempo, dinheiro ou recursos]

## INDICADOR DE SUCESSO
[Como saber que deu certo]

## RISCOS
[O que pode dar errado]

## PRIORIDADE
[P1/P2/P3/P4 — justifique]`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

/**
 * Cria plano de projeto completo com fases, entregáveis e cronograma.
 */
async function createProjectPlan(projectName, description, constraints = {}) {
  const prompt = `Você é o AI Operations Manager da SmartOps IA.

Crie um Plano de Projeto completo.

PROJETO: ${projectName}
DESCRIÇÃO: ${description}
RESTRIÇÕES: ${JSON.stringify(constraints)}

# Plano de Projeto — ${projectName}

## OBJETIVO
[Resultado esperado ao final]

## ESCOPO
**Inclui:**
- [Item]
**NÃO inclui:**
- [Item]

## FASES
| Fase | Nome | Duração | Entregável |
|------|------|---------|-----------|

## DETALHAMENTO DAS FASES
### Fase 1 — Diagnóstico
[Atividades, responsáveis, prazo]

### Fase 2 — Planejamento
[Atividades, responsáveis, prazo]

### Fase 3 — Execução
[Atividades, responsáveis, prazo]

### Fase 4 — Validação
[Atividades, responsáveis, prazo]

### Fase 5 — Entrega Final
[Atividades, responsáveis, prazo]

## ENTREGÁVEIS FINAIS
- [Entregável 1]
- [Entregável 2]

## INDICADORES DE SUCESSO (KPIs)
| Indicador | Meta | Prazo |
|-----------|------|-------|

## RISCOS E MITIGAÇÕES
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|

## CRITÉRIO DE SUCESSO
[Como saber que o projeto foi bem-sucedido]

## PRÓXIMOS 3 PASSOS IMEDIATOS
1. [Ação — Responsável — Prazo]
2. [Ação — Responsável — Prazo]
3. [Ação — Responsável — Prazo]`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

/**
 * Cria plano de execução semanal consolidando todas as prioridades.
 */
async function createWeeklyExecutionPlan(priorities, currentState = {}) {
  const prompt = `Você é o AI Operations Manager da SmartOps IA.

Crie o Plano de Execução da Semana.

PRIORIDADES RECEBIDAS:
${JSON.stringify(priorities, null, 2)}

ESTADO ATUAL DO NEGÓCIO:
${JSON.stringify(currentState, null, 2)}

# Plano de Execução Semanal — SmartOps IA

## FOCO DA SEMANA
[A principal aposta desta semana — 1 frase]

## SEGUNDA-FEIRA
| Ação | Agente/Ferramenta | Tempo | Resultado Esperado |
|------|------------------|-------|-------------------|

## TERÇA-FEIRA
| Ação | Agente/Ferramenta | Tempo | Resultado Esperado |
|------|------------------|-------|-------------------|

## QUARTA-FEIRA
| Ação | Agente/Ferramenta | Tempo | Resultado Esperado |
|------|------------------|-------|-------------------|

## QUINTA-FEIRA
| Ação | Agente/Ferramenta | Tempo | Resultado Esperado |
|------|------------------|-------|-------------------|

## SEXTA-FEIRA
| Ação | Agente/Ferramenta | Tempo | Resultado Esperado |
|------|------------------|-------|-------------------|

## MÉTRICAS DA SEMANA
| Métrica | Meta | Responsável |
|---------|------|-------------|

## O QUE NÃO FAZER ESTA SEMANA
[Distrações a evitar]

## CRITÉRIO DE SUCESSO
[Como saber se a semana foi boa]`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

module.exports = { create5W2H, createProjectPlan, createWeeklyExecutionPlan };
