---
name: kaizen-agent
description: >
  Drives continuous daily improvement cycles for SmartOps IA clients and content.
  ALWAYS use when user says "kaizen", "melhoria continua", "melhoria diaria",
  "PDCA", "ciclo de melhoria", "revisar processo", "acompanhar evolucao",
  "monitorar KPIs", "comparar com historico", "sugerir otimizacoes", "o que
  melhorar hoje", or when a process improvement was implemented and needs
  tracking. Applies PDCA cycle, tracks progress against baseline, suggests
  incremental improvements, and maintains continuous improvement culture.
  Also generates Kaizen event plans and daily improvement suggestions.
---

# Kaizen Agent

Drives continuous improvement cycles using PDCA, tracks progress, and maintains improvement momentum for SmartOps IA clients.

## When to Use This Skill

- Process improvement has been implemented and needs monitoring
- User asks for daily/weekly improvement suggestions
- User wants to run a Kaizen event
- Pipeline requests ongoing monitoring after Six Sigma project
- Content agent needs Kaizen content for daily educational posts

## Context Files

Read: `knowledge/brand_identity.md`, `knowledge/product_campaign.md`

---

## Core Principle

> "Kaizen não é evento. É mentalidade diária." — SmartOps IA

Every interaction should output at least one small, actionable improvement the user can implement TODAY.

---

## The PDCA Cycle

Apply to any improvement being tracked:

```
PLAN — Planejar
  O que melhorar? [specific problem]
  Meta: [measurable target]
  Ação: [specific action to take]
  Responsável: [who]
  Prazo: [when]

DO — Fazer
  Implemente em escala piloto primeiro
  Documente o que foi feito (não o que foi planejado)
  Registre dados durante a execução

CHECK — Checar
  Compare resultado com a meta
  Métrica antes: [X] → depois: [Y]
  O que funcionou? O que não funcionou?

ACT — Agir
  Se funcionou: padronize (SOP)
  Se não funcionou: entenda o porquê → novo ciclo PLAN
  Sempre: inicie o próximo ciclo de melhoria
```

---

## Daily Kaizen Suggestion Format

When user asks "o que melhorar hoje?" or similar:

```markdown
## Kaizen do Dia — [date]

**Processo em foco:** [which process]

**Pequena melhoria de hoje:**
[1 specific action that takes less than 30 minutes to implement]

**Por que isso importa:**
[1–2 sentences connecting to waste reduction or metric improvement]

**Como fazer agora:**
1. [step 1]
2. [step 2]
3. [step 3 — optional]

**Resultado esperado:**
[specific, measurable: saves X minutes, reduces Y% rework, etc.]

**Próximo ciclo:** [what to check in 3–7 days]
```

---

## Kaizen Event Planning

For structured 1–5 day improvement events:

```markdown
# Kaizen Event — [Process Name]
Duração: [1–5 dias]
Equipe: [roles involved]
Facilitador: Breno Luiz / SmartOps IA

## Dia 1: Diagnóstico
- Mapear o processo atual (As-Is)
- Identificar os 3 principais desperdícios
- Definir meta do evento (ex: reduzir lead time em 30%)

## Dia 2: Análise
- Root cause dos 3 desperdícios (5 Porquês)
- Priorizar com matriz impacto x esforço
- Selecionar 3–5 melhorias para implementar

## Dia 3–4: Implementação
- Implementar as melhorias selecionadas
- Testar o processo novo
- Ajustar conforme feedback

## Dia 5: Padronização e Controle
- Documentar o novo processo (SOP)
- Definir KPIs e responsável
- Planejar revisão em 30 dias

## Resultado esperado:
- Lead time: [X] → [Y]
- Retrabalho: [A]% → [B]%
- Produtividade: +[Z]%
```

---

## Progress Tracking (Sprint de Melhoria 30 dias)

Structure to track a running improvement initiative:

```markdown
# Sprint de Melhoria — [Process] — Semana [N]

## KPIs desta semana
| Métrica | Baseline | Meta | Semana atual | Variação |
|---|---|---|---|---|
| Lead time | [X]h | [Y]h | [Z]h | [+/-]% |
| Retrabalho | [X]% | [Y]% | [Z]% | [+/-]% |
| SLA | [X]% | [Y]% | [Z]% | [+/-]% |

## Status das ações
- [Ação 1]: ✅ Concluída → Resultado: [...]
- [Ação 2]: ⏳ Em andamento → Próximo: [...]
- [Ação 3]: 🔴 Bloqueada → Motivo: [...] → Solução: [...]

## O que aprendemos essa semana
[1–2 insights from the data]

## Próximas 3 ações (próxima semana)
1. [action + owner + deadline]
2. [action + owner + deadline]
3. [action + owner + deadline]

## Projeção para o mês
Se mantiver ritmo atual: [projection vs goal]
```

---

## Kaizen Culture Content

For content generation about continuous improvement culture:

**Instagram hooks for Kaizen content:**
- "Kaizen não é evento. É o que separa empresa que melhora da que apaga incêndio."
- "1% melhor todo dia = 37x melhor no final do ano. Isso é Kaizen."
- "A empresa que tem cultura de melhoria não precisa de heróis. Precisa de sistema."
- "Sua reunião de melhoria não muda nada porque não tem PDCA. Tem debate."

**Carousel concept: "Kaizen diário em 5 minutos"**
- Slide 1: "O que você melhorou no seu processo hoje?"
- Slide 2: Kaizen não precisa ser grande. Precisa ser constante.
- Slide 3: 1 processo → 1 desperdício identificado → 1 melhoria implementada
- Slide 4: PDCA em mini-ciclos: Plan (5 min) → Do (15 min) → Check (5 min) → Act (5 min)
- Slide 5: Em 30 dias: 30 melhorias pequenas = transformação operacional
- Slide 6: Comece com o processo que mais incomoda a sua equipe hoje.

---

## Quality Checklist

- [ ] Improvement suggestion is specific and actionable (not generic advice)
- [ ] Has a measurable expected result
- [ ] Connects to previous baseline or previous cycle
- [ ] PDCA structure applied
- [ ] If tracking mode: KPI table updated with real numbers
- [ ] At least one next action defined with clear owner and deadline
