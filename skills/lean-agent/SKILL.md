---
name: lean-agent
description: >
  Analyzes operations using Lean methodology to detect waste, identify bottlenecks,
  and suggest improvements for SmartOps IA clients. ALWAYS use when user says
  "analyze process", "find waste", "identify bottlenecks", "mapear desperdícios",
  "analisar processo com Lean", "identificar gargalos", "fazer análise Lean",
  "aplicar Lean no processo", "os 8 desperdícios", or describes operational
  problems (rework, waiting, chaos, manual work). Applies all 8 Lean wastes
  (TIMWOODS), VSM analysis, and suggests actionable quick wins and improvement
  roadmap. Works with Kaizen-agent and six-sigma-agent in sequence. Never
  includes Manutencao TI scope.
---

# Lean Agent

Applies Lean methodology to detect operational waste and generate structured improvement recommendations for SmartOps IA clients.

## When to Use This Skill

- User describes an operational problem and wants Lean analysis
- User asks to "find waste", "mapear desperdícios", "analisar processo"
- User is in the DMAIC Analyze phase and needs waste identification
- Orchestrator sends a process description for Lean analysis
- Content agent needs Lean insights for educational content

## Step 1: Read Context

Before any analysis, read:
1. `knowledge/brand_identity.md` — SmartOps IA positioning and tone
2. `knowledge/product_campaign.md` — services, metrics, example cases

## Step 2: Identify the Process Scope

Clarify if not already specified:
- **What process?** (atendimento, vendas, onboarding, produção, financeiro)
- **What is the problem symptom?** (lento, caro, retrabalho, reclamação, perda de cliente)
- **Who does it?** (number of people, departments involved)
- **How often?** (daily, weekly, per transaction)

If no information provided, use the most common SmartOps IA client scenario: atendimento ao cliente em PME.

## Step 3: Apply the 8 Wastes (TIMWOODS)

Analyze each waste category for the described process:

| # | Desperdício | Inglês | Exemplos em PMEs |
|---|---|---|---|
| 1 | Transporte | Transport | Informação que passa por 5 pessoas antes de chegar a quem decide |
| 2 | Inventário | Inventory | Pedidos pendentes acumulados, filas de aprovação, e-mails sem resposta |
| 3 | Movimento | Motion | Colaborador que precisa ir a 3 sistemas para completar 1 tarefa |
| 4 | Espera | Waiting | Cliente esperando resposta, processo parado aguardando aprovação |
| 5 | Superprodução | Overproduction | Relatórios que ninguém lê, reuniões sem decisão |
| 6 | Processamento excessivo | Over-processing | 5 aprovações para liberar R$200 |
| 7 | Defeitos | Defects | Retrabalho, erro que volta para o início do processo |
| 8 | Talento não aproveitado | Non-utilized talent | Equipe fazendo tarefas manuais que IA/automação resolveria |

For each identified waste:
- Describe the specific manifestation in this process
- Estimate impact (tempo perdido, custo, frequência)
- Rate severity: Alto / Médio / Baixo

## Step 4: Quick Wins (2–4 weeks)

Identify 3–5 improvements that can be implemented quickly without major investment:

Each quick win should include:
```
Waste: [waste type]
Ação: [specific action]
Como: [implementation in 2–3 sentences]
Ferramenta sugerida: [manual | n8n | WhatsApp API | planilha | SOP]
Resultado esperado: [specific metric: −X% tempo, −Y h/semana]
Prazo: [1 semana | 2 semanas | 1 mês]
```

## Step 5: Process Mapping Guidance (VSM simplified)

If the user has time/capacity to map the full process:

```
ESTADO ATUAL (Current State):
1. Liste cada etapa do processo em sequência
2. Para cada etapa: quem faz / quanto tempo / qual ferramenta
3. Marque onde há espera, aprovação, retrabalho

ESTADO FUTURO (Future State):
1. Elimine etapas sem valor agregado
2. Simplifique aprovações
3. Automatize o que é repetitivo
4. Padronize o que é variável (SOP)
```

## Step 6: Generate Lean Report

Output a structured report:

```markdown
# Análise Lean — [Process Name]
Data: [date] · Consultor: SmartOps IA

## Diagnóstico Resumido
[2–3 sentences: main finding + primary waste + estimated impact]

## Desperdícios Identificados

### 🔴 Alto Impacto
- [waste]: [description] — [estimated time/cost lost]

### 🟡 Médio Impacto
- [waste]: [description] — [estimated impact]

### 🟢 Baixo Impacto / Oportunidade
- [waste]: [description] — [opportunity]

## Quick Wins (Próximas 4 Semanas)

1. [action] → [result] → [tool]
2. [action] → [result] → [tool]
3. [action] → [result] → [tool]

## Roadmap de Melhoria

Mês 1: Quick wins — padronização e eliminação de esperas óbvias
Mês 2: Automação — n8n, WhatsApp API, integrações
Mês 3: Monitoramento — KPIs, dashboard, ciclos PDCA

## Próximo Passo Recomendado
Diagnóstico completo presencial de 30 minutos: [link WhatsApp]
```

## Step 7: Content Generation (if requested)

If the output is for content/marketing (not a client analysis):
- Extract the 1 most impactful waste as a hook
- Frame as "Você sabia que [X% das empresas sofrem com...]?"
- Convert to Instagram carousel or reel script format
- Pass to `content-agent` skill for final formatting

## Quality Checklist

- [ ] Process scope clearly defined
- [ ] All 8 TIMWOODS wastes evaluated (even if not applicable — note why)
- [ ] At least 3 quick wins with specific actions and measurable results
- [ ] Report uses SmartOps IA brand voice (direct, specific numbers, no vague language)
- [ ] Recommendations include n8n/automation where applicable
- [ ] Handoff to six-sigma-agent or kaizen-agent if deeper analysis needed
