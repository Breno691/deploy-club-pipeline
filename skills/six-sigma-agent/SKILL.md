---
name: six-sigma-agent
description: >
  Conducts structured Six Sigma DMAIC analysis to identify root causes, measure
  process performance, and recommend data-driven improvements for SmartOps IA
  clients. ALWAYS use when user says "DMAIC", "root cause analysis", "causa raiz",
  "analise seis sigma", "análise de causa raiz", "5 porques", "diagrama de
  ishikawa", "pareto", "medir KPIs", "calcular sigma", "variabilidade do processo",
  "por que o problema persiste", or when Lean-agent escalates to deeper root
  cause investigation. Follows strict DMAIC structure: Define, Measure, Analyze,
  Improve, Control. Outputs structured A3 or project charter.
---

# Six Sigma Agent

Applies DMAIC methodology for root cause analysis and data-driven process improvement for SmartOps IA clients.

## When to Use This Skill

- User has an identified problem and needs root cause investigation
- lean-agent identified waste and escalated for deeper analysis
- User specifically mentions "DMAIC", "causa raiz", "5 porquês", "Ishikawa"
- User has recurring problems that quick wins didn't solve
- Content agent needs Six Sigma content for educational posts

## Context Files

Read before starting:
1. `knowledge/brand_identity.md`
2. `knowledge/product_campaign.md`

---

## DMAIC Framework

### Phase 1: DEFINE

**Goal:** Clearly define the problem, scope, and impact.

Questions to answer:
- Qual é o problema exato? (sintoma vs problema real)
- Quem é afetado? (cliente, equipe, empresa)
- Qual é o impacto financeiro estimado? (R$/mês, horas/semana)
- Qual é a meta de melhoria? (reduzir X em Y%)
- Qual é o escopo? (começa onde, termina onde)

**Output: Problem Statement**
```
O processo de [X] está causando [Y] com frequência de [Z],
gerando impacto estimado de [R$/horas] por [período].
A meta é reduzir [métrica] em [X]% em [prazo].
```

**Output: Project Charter simplificado**
```
Problema: ...
Escopo: começa em [etapa A], termina em [etapa B]
Fora do escopo: ...
Meta: ...
Prazo estimado: ...
Responsável: ...
```

---

### Phase 2: MEASURE

**Goal:** Quantify the problem with real data.

KPIs to collect (adapt to context):

| Métrica | O que mede | Como coletar |
|---|---|---|
| Lead time | Tempo total do processo | Registro manual ou sistema |
| Cycle time | Tempo de processamento ativo | Cronometragem |
| Defect rate | % de erros/retrabalho | Contagem de ocorrências |
| SLA compliance | % dentro do prazo | Sistema ou planilha |
| Throughput | Quantidade por período | Volume de transações |
| First Pass Yield | % correto na primeira vez | Registro de retrabalho |

**Baseline calculation:**
```
Defect rate atual: [X]% de [Y] transações analisadas
Lead time médio: [X] horas/dias
Impacto mensal estimado: R$ [X] ou [Y] horas perdidas
```

If no data available: guide user to collect 10–30 data points over 1 week minimum before proceeding to Analyze.

---

### Phase 3: ANALYZE

**Goal:** Identify the root cause, not the symptom.

#### Tool 1: 5 Porquês
```
Problema: [sintoma observado]
Por quê 1: [primeira causa]
Por quê 2: [causa da causa 1]
Por quê 3: [causa da causa 2]
Por quê 4: [causa da causa 3]
Por quê 5 (causa raiz): [causa fundamental]
Solução alvo: [endereça a causa raiz do Por quê 5]
```

#### Tool 2: Diagrama de Ishikawa (Espinha de Peixe)

Categorias (6M para manufatura, adaptado para serviços):
```
MÉTODO:     Processo sem padrão? Etapas desnecessárias?
MÃO DE OBRA: Treinamento insuficiente? Alta rotatividade?
MÁQUINA:    Sistema lento? Ferramenta inadequada?
MATERIAL:   Dados incompletos? Informação errada na entrada?
AMBIENTE:   Interrupções? Comunicação deficiente?
MEDIÇÃO:    KPIs inexistentes? Indicadores errados?
```

#### Tool 3: Análise de Pareto (80/20)

Identify the top 20% of causes that generate 80% of the problem:
```
1. Liste todas as causas identificadas
2. Quantifique a frequência de cada uma
3. Ordene da maior para menor
4. Identifique o ponto de 80% do impacto acumulado
5. Foque as soluções nas causas até esse ponto
```

---

### Phase 4: IMPROVE

**Goal:** Design and implement targeted solutions for the root cause.

Solution evaluation matrix:
```
| Solução | Custo | Tempo impl. | Impacto | Risco | Score |
|---|---|---|---|---|---|
| [A] | Baixo | 1 sem | Alto | Baixo | 9 |
| [B] | Médio | 2 sem | Médio | Baixo | 6 |
| [C] | Alto | 2 meses | Alto | Alto | 5 |
```

**Pilot plan:**
```
Teste em escala reduzida: [scope — ex: 1 equipe, 1 semana]
Métricas para validar: [before/after comparison]
Critério de sucesso: [specific target]
Responsável: [owner]
```

**If automation is the solution:**
- Identify n8n workflow to build
- Map API/webhook connections needed
- Define trigger and output of automation
- Estimate build time: [X days] for SmartOps IA implementation

---

### Phase 5: CONTROL

**Goal:** Ensure the improvement is sustained and doesn't regress.

Control mechanisms:
```
SOP (Procedimento Padrão):
  - Documente o processo novo em 1 página
  - Inclua: quem faz, como faz, quando faz, qual ferramenta usa

Dashboard de controle:
  - KPI principal: [metric] → alerta se sair de [range]
  - Frequência de revisão: [semanal/mensal]
  - Responsável pelo monitoramento: [role]

Kaizen contínuo:
  - Revisão trimestral do processo
  - Canal para o time reportar problemas novos
  - Ciclo PDCA permanente
```

---

## Output: A3 Report

Generate a structured A3 (1-page problem-solving document):

```markdown
# A3 — [Problem Name]
Data: [date] · SmartOps IA · Breno Luiz

## DEFINE
Problema: [statement]
Escopo: [boundaries]
Impacto: [R$/h]

## MEASURE
Baseline: [key metrics]
Coleta: [method + period]

## ANALYZE
Causa raiz (5 Porquês): [finding]
Pareto: Top 3 causas = [X]% do problema

## IMPROVE
Solução selecionada: [chosen solution]
Justificativa: [why this one]
Ferramenta: [n8n / SOP / treinamento / automação]

## CONTROL
KPI de controle: [metric]
Responsável: [owner]
Revisão: [frequency]

## RESULTADO ESPERADO
Meta: [specific target]
Prazo: [timeline]
ROI estimado: [R$ savings or hours recovered]
```

## Content Mode

If used for Instagram content generation:
- Extract the most relatable pain point from ANALYZE phase
- Convert 5 Porquês into a carousel format (1 "por quê" per slide)
- Use "Descubra a causa raiz do problema que você tenta resolver há meses" as hook
- Pass formatted content to `content-agent`

## Quality Checklist

- [ ] Problem statement is specific (not vague like "atendimento ruim")
- [ ] At least 2 analytical tools applied (5 Porquês + Pareto or Ishikawa)
- [ ] Root cause addresses systemic issue, not individual blame
- [ ] Improvement recommendations include automation/n8n where applicable
- [ ] Control plan has specific KPI and owner
- [ ] Numbers present in every key section (no vague claims)
