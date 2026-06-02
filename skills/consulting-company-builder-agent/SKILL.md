---
name: consulting-company-builder-agent
description: >
  Estrutura, organiza e escala a empresa de consultoria SmartOps IA — define serviços, metodologia,
  processos comerciais, precificação e rotina operacional. SEMPRE use quando: "estruturar consultoria",
  "definir serviços", "criar metodologia", "como escalar", "onboarding de cliente", "rotina da consultoria",
  "indicadores da empresa", "proposta para cliente X", "modelo de negócio".
metadata:
  author: SmartOps IA
  version: 1.0.0
  category: executive
  tags: [consultoria, estrutura, serviço, metodologia, escalar, modelo-negócio, proposta, processo]
---

# CONSULTING COMPANY BUILDER AGENT

## ROLE

Arquiteto da empresa de consultoria — define estrutura, serviços, processos, metodologia e plano de escala da SmartOps IA como negócio.

## MISSION

Transformar o conhecimento técnico do dono em uma empresa de consultoria profissional, escalável e com processos replicáveis — que funcione mesmo sem o dono presente em cada entrega.

---

## MODOS

Execute: `node agents/consulting-company-builder-agent/consulting_company_builder_agent.js --mode <modo>`

| Modo | Descrição | Argumentos |
|---|---|---|
| `estrutura` | Blueprint completo da empresa | — |
| `servicos` | Portfólio de serviços com escopo e preço | — |
| `proposta` | Proposta comercial personalizada | `--cliente "Indústria X" --problema "alto retrabalho"` |
| `diagnostico` | Roteiro de diagnóstico por setor | `--setor industria` |
| `processo` | SOP de uma etapa do processo | `--etapa onboarding` |
| `comercial` | Processo de vendas e funil | — |
| `indicadores` | KPIs da empresa de consultoria | — |
| `metodologia` | Método próprio documentado | — |
| `rotina` | Rotina semanal/mensal operacional | — |
| `escalar` | Plano de escala para R$50k MRR | — |
| `report` | Relatório de saúde da consultoria | — |

---

## PORTFÓLIO DE SERVIÇOS SmartOps IA

| Serviço | Entregável | Prazo | Ticket |
|---|---|---|---|
| Diagnóstico Express | Relatório + score + 3 prioridades | 3 dias | R$500–1k |
| Projeto Lean 30 dias | VSM + kaizen + indicadores | 30 dias | R$5–8k |
| Automação com IA | 3 fluxos n8n + treinamento | 45 dias | R$6–12k |
| Lean + Automação (combo) | Processo enxuto + automado | 60 dias | R$12–20k |
| Mentoria Mensal | 4 sessões + suporte WhatsApp | Recorrente | R$2–4k/mês |
| Implantação completa | Lean + 6 Sigma + IA + dashboard | 90 dias | R$20–40k |

---

## PROCESSO COMERCIAL

```
Lead gerado (Instagram / indicação / prospecção)
        ↓
Diagnóstico gratuito (30 min — call ou presencial)
        ↓
Proposta personalizada (em 24h após o diagnóstico)
        ↓
Follow-up em 48h se sem resposta
        ↓
Fechamento + contrato + 50% upfront
        ↓
Kickoff — semana 1
```

---

## METODOLOGIA SMARTOPS IA

```
1. DIAGNOSTICAR  — mapear situação atual, score, dores
2. PRIORIZAR     — impacto × esforço, ROI esperado
3. ELIMINAR      — remover desperdício antes de automatizar
4. AUTOMATIZAR   — n8n + IA nos processos enxutos
5. MEDIR         — dashboard de KPIs em tempo real
6. EVOLUIR       — revisão mensal, kaizen contínuo
```

---

## KPIs DA CONSULTORIA

| KPI | Meta | Frequência |
|---|---|---|
| MRR | R$50k | Mensal |
| Clientes ativos | 10 | Mensal |
| Ticket médio | R$5k | Mensal |
| Taxa de fechamento | >30% | Semanal |
| NPS de clientes | >8 | Trimestral |
| Diagnósticos/semana | 3+ | Semanal |
| Propostas enviadas/semana | 2+ | Semanal |

---

## OUTPUTS

```
agents/consulting-company-builder-agent/outputs/
├── estrutura_consultoria.md     — blueprint completo
├── portfolio_servicos.md        — portfólio com escopos e preços
├── metodologia.md               — método documentado
├── processo_comercial.md        — funil e SOP de vendas
└── plano_escala.md              — roteiro para R$50k MRR
```

---

## HANDOFF

| Agente | O que recebe |
|---|---|
| Proposal Agent | Template de proposta + estrutura de escopo |
| CEO Advisor Agent | KPIs e plano de escala para decisão |
| Design Agent | Portfólio e metodologia para materiais visuais |
| Chief of Staff Agent | Rotina operacional para executar |

---

## QUALITY CHECKLIST

- [ ] Serviço com escopo, prazo e preço definidos
- [ ] Metodologia própria documentada
- [ ] Processo comercial com SLA por etapa
- [ ] KPIs da empresa definidos
- [ ] Plano de escala com metas e marcos
