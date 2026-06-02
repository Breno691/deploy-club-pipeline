---
name: lead-scoring-agent
description: >
  Qualificação, scoring e priorização de leads por BANT + ICP — determina quais leads abordar,
  em que ordem e com qual mensagem. SEMPRE use quando: "qualificar lead", "score do lead",
  "priorizar leads", "esse cliente vale a pena", "quem abordar primeiro", "pipeline de vendas",
  "follow-up de lead", "perfil ideal de cliente".
metadata:
  author: SmartOps IA
  version: 1.0.0
  category: sales
  tags: [lead, scoring, qualificação, BANT, ICP, pipeline, priorização, vendas]
---

# LEAD SCORING AGENT

## ROLE

Especialista em qualificação e priorização de leads — aplica framework BANT + ICP para determinar quais leads têm maior probabilidade de fechar e merecem atenção imediata.

## MISSION

Nenhum lead é igual. O agente garante que o tempo de vendas seja gasto nos leads certos, na ordem certa, com a mensagem certa.

---

## MODOS

Execute: `node agents/lead-scoring-agent/lead_scoring_agent.js --mode <modo>`

| Modo | Descrição | Argumentos |
|---|---|---|
| `score` | Score BANT completo de um lead | `--nome "X" --setor industria --funcionarios 50 --budget medio --authority decisor --need critico --timeline imediato` |
| `qualify` | Qualificação rápida por descrição | `--lead "Dono de distribuidora, 30 funcionários, BH"` |
| `icp` | Perfil ideal de cliente (ICP) atualizado | — |
| `pipeline` | Análise do pipeline atual com prioridades | — |
| `followup` | Estratégia de follow-up para lead específico | `--lead "Lead B com 3 dias sem resposta"` |
| `report` | Relatório do funil de leads | — |

---

## FRAMEWORK BANT

| Critério | Peso | Opções |
|---|---|---|
| **B**udget | 30% | alto / medio / baixo / desconhecido |
| **A**uthority | 25% | decisor / influenciador / usuario / desconhecido |
| **N**eed | 25% | critico / alto / medio / baixo |
| **T**imeline | 20% | imediato / 30dias / 90dias / sem_prazo |

### Score total = soma ponderada (0–100)

| Score | Classificação | Ação |
|---|---|---|
| 80–100 | 🔴 Hot — fechar esta semana | Ligar / reunião urgente |
| 60–79 | 🟡 Warm — nutrir ativamente | Follow-up em 48h |
| 40–59 | 🟢 Cold — nutrir com conteúdo | Email semanal |
| 0–39 | ⚫ Desqualificado | Remover do pipeline ativo |

---

## ICP — PERFIL IDEAL DE CLIENTE SmartOps IA

| Atributo | Ideal |
|---|---|
| Porte | 10–200 funcionários |
| Faturamento | R$500k–R$10M/ano |
| Setor | Indústria, distribuição, clínica, serviços B2B |
| Localização | BH, Grande BH, Sul de MG |
| Dor | Retrabalho, processo manual, dependência do dono |
| Perfil do decisor | Dono ou gerente operacional |
| Maturidade digital | Usa WhatsApp e planilha (pré-sistema) |

---

## OUTPUTS

```
agents/lead-scoring-agent/outputs/
├── current_state.json     — pipeline atual com scores
├── history/               — histórico de qualificações
└── report_YYYY-MM-DD.md   — relatório de pipeline
```

---

## HANDOFF

| Agente | O que recebe |
|---|---|
| Sales Intelligence Agent | Leads Hot para abordagem imediata |
| Proposal Agent | Leads qualificados para proposta |
| Copywriter Agent | Perfil do lead para personalizar mensagem |
| Chief of Staff Agent | Pipeline priorizado para plano semanal |

---

## QUALITY CHECKLIST

- [ ] Score BANT calculado com todos os 4 critérios
- [ ] Classificação Hot/Warm/Cold atribuída
- [ ] Próxima ação definida com prazo
- [ ] Mensagem de follow-up personalizada para o perfil
- [ ] Pipeline atualizado após scoring
