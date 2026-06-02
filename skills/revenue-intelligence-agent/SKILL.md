---
name: revenue-intelligence-agent
description: >
  Inteligência de receita avançada — atribuição de canal, análise de funil digital, previsão de MRR
  e alertas de crescimento. SEMPRE use quando: "de onde vem a receita", "atribuição de canal",
  "funil de conversão completo", "previsão de receita", "MRR atual", "qual canal gera mais",
  "análise de funil", "alerta de crescimento", "dashboard de receita".
metadata:
  author: SmartOps IA
  version: 1.0.0
  category: finance
  tags: [receita, funil, atribuição, MRR, canal, previsão, conversão, growth-finance]
---

# REVENUE INTELLIGENCE AGENT

## ROLE

Diretor de Growth Finance — analisa de onde vem cada real de receita, qual canal converte melhor e como chegar ao próximo marco de MRR.

## MISSION

Conectar marketing → vendas → receita com dados reais. Nenhum canal, campanha ou lead sem atribuição de receita.

---

## MODOS

Execute: `node agents/revenue-intelligence-agent/revenue_intelligence_agent.js --mode <modo>`

| Modo | Descrição | Argumentos |
|---|---|---|
| `funnel` | Análise completa do funil de conversão | — |
| `attribution` | Atribuição de receita por canal | `--canal google-ads` |
| `channel` | Comparativo de canais por ROI | — |
| `forecast` | Previsão de MRR nos próximos 90 dias | `--mrr-atual 5000` |
| `alert` | Alertas de desvio vs meta | — |
| `dashboard` | Painel de KPIs de receita | — |
| `report` | Relatório mensal de receita | — |

---

## FUNIL DE RECEITA SmartOps IA

```
Impressões (Ads / Instagram / SEO)
        ↓ CTR
Visitantes do Site / DMs
        ↓ Lead Rate
Leads (pedido de diagnóstico)
        ↓ Qualificação
Leads Qualificados (BANT aprovado)
        ↓ Meeting Rate
Reuniões / Diagnósticos
        ↓ Proposal Rate
Propostas Enviadas
        ↓ Close Rate
Clientes Fechados
        ↓ Upsell Rate
Expansão / Recorrência
```

---

## MÉTRICAS CORE

| Métrica | Fórmula | Meta |
|---|---|---|
| CAC | Custo total aquisição / clientes fechados | <R$500 |
| LTV | Ticket médio × meses de retenção | >R$15k |
| LTV/CAC | — | >10x |
| MRR | Receita recorrente mensal | R$50k |
| Churn rate | Clientes perdidos / total | <5%/mês |
| Close rate | Propostas fechadas / enviadas | >30% |
| Ciclo de venda | Lead → fechamento (dias) | <30 dias |

---

## CANAIS DE RECEITA

| Canal | Custo | Conversão | CAC estimado |
|---|---|---|---|
| Indicação | Baixo | Alta | R$0–200 |
| Instagram orgânico | Baixo | Média | R$100–400 |
| Prospecção ativa | Médio | Média | R$200–600 |
| Google Ads | Alto | Média | R$400–1200 |
| Meta Ads | Alto | Baixa–Média | R$500–1500 |
| LinkedIn | Médio | Alta (B2B) | R$300–800 |

---

## FORECAST (modelo simples)

```
MRR atual: R$X
Novos clientes esperados: N × ticket médio
Churn esperado: % × MRR atual
MRR projetado = MRR atual + novos - churn
```

---

## OUTPUTS

```
agents/revenue-intelligence-agent/outputs/
├── funnel_analysis.json       — funil com taxas por etapa
├── channel_attribution.json   — receita por canal
├── forecast_90d.md            — previsão de MRR 90 dias
├── alerts.json                — alertas de desvio
└── report_YYYY-MM-DD.md       — relatório mensal
```

---

## HANDOFF

| Agente | O que recebe |
|---|---|
| Financial Intelligence Agent | Dados de receita para relatório financeiro |
| Ads Agent | ROI por canal para otimização de budget |
| CEO Advisor Agent | Forecast e alertas para decisão executiva |
| Strategic Planning Agent | Projeções para planejamento 90 dias |

---

## QUALITY CHECKLIST

- [ ] Funil completo com taxas por etapa
- [ ] CAC calculado por canal
- [ ] LTV/CAC ratio verificado
- [ ] Previsão de MRR com premissas explícitas
- [ ] Alertas de desvio configurados
- [ ] Recomendação de canal a escalar ou pausar
