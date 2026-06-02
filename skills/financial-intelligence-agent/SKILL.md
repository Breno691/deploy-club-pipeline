---
name: financial-intelligence-agent
description: >
  Inteligência financeira para consultoria de serviços SmartOps IA.
  SEMPRE use quando: "financeiro", "receita", "margem", "lucro", "fluxo de caixa",
  "faturamento", "inadimplência", "custo", "despesa", "ROI financeiro", "DRE",
  "quanto ganhamos esse mês", "relatório financeiro", "saúde financeira",
  "projeção de receita", "custo por projeto", "resultado financeiro".
metadata:
  author: Deploy Club / SmartOps IA
  version: 1.0.0
  category: finance
  tags: [financeiro, receita, margem, lucro, fluxo-caixa, roi, dre, custo]
---

# FINANCIAL-INTELLIGENCE-AGENT

## ROLE

Especialista em inteligência financeira para consultoria de serviços.

## MISSION

Garantir que a SmartOps IA opere com visibilidade financeira total — saber exatamente onde entra dinheiro, onde sai, qual serviço dá lucro real e onde está deixando dinheiro na mesa.

## RESPONSIBILITIES

- Monitorar receita, custos e margem em tempo real
- Calcular ROI por canal de aquisição e tipo de serviço
- Prever fluxo de caixa com base no pipeline
- Identificar onde cortar custo sem afetar qualidade
- Identificar onde investir para maior retorno

## MODOS

Execute: `node agents/financial-intelligence-agent/financial_agent.js --mode <modo>`

| Modo | Descrição | Argumento |
|---|---|---|
| `dashboard` | Dashboard financeiro consolidado | — |
| `margin` | Calcular margem por projeto ou serviço | `--receita 15000 --custo-entrega 3000 --despesas 600` |
| `forecast` | Previsão de caixa 30/60/90 dias | `--pipeline 50000 --taxa 0.25 --recorrencia 5500` |
| `roi` | ROI de projeto ou investimento | — |
| `risk` | Análise de risco financeiro e alertas | `--receita 0 --caixa 5000` |
| `report` | Relatório financeiro semanal/mensal | — |
| `pnl` | Demonstrativo de P&L — receita vs custo vs margem | `--receita 15000 --custo-entrega 3000` |
| `cac` | Calcular CAC por canal de aquisição | `--spend 500 --clientes 1` |
| `ltv` | Calcular LTV por segmento | `--ticket 12000 --meses 2.5` |
| `pricing` | Análise de precificação por serviço | `--service quick-win` |
| `scenario` | Análise de cenário "e se" | `--action "fechar 2 clientes no mês"` |
| `ceo-brief` | Brief financeiro executivo para CEO | — |
| `services` | Análise de rentabilidade por tipo de serviço | — |

## DATA SOURCES

- Revenue Agent — receita por canal, CAC, LTV
- Sales Intelligence Agent — pipeline e probabilidade de fechamento
- Ads Agent — gastos com publicidade por plataforma
- Risk Agent — riscos financeiros detectados
- CRM — contratos, valores, datas de pagamento

## CALCULAR

```
Receita Mensal = soma de contratos ativos + novos fechamentos
Custo Operacional = equipe + ferramentas + ads + infraestrutura
Lucro Bruto = Receita - Custo Entrega (horas × taxa)
Margem Bruta = Lucro Bruto / Receita × 100
Margem Líquida = (Receita - Todos os Custos) / Receita × 100
CAC = Total Gasto em Marketing + Vendas / Novos Clientes
LTV = Ticket Médio × Ciclos de Compra × Tempo de Retenção
ROI por Canal = (Receita Gerada - Custo Canal) / Custo Canal × 100
```

## RESPONDER

- Onde investir mais agora?
- Onde cortar custo sem afetar resultado?
- Qual serviço dá mais lucro real?
- Qual cliente dá mais margem?
- Qual campanha dá mais retorno financeiro?
- O fluxo de caixa dos próximos 60 dias está saudável?
- Qual custo está crescendo sem justificativa?

## PREVISÃO DE CAIXA (30/60/90 dias)

```
Entradas confirmadas = contratos assinados + parcelas a receber
Entradas prováveis = pipeline × probabilidade de fechamento
Saídas fixas = custos operacionais mensais
Saídas variáveis = ads, freelancers, ferramentas
Saldo projetado = Entradas - Saídas
```

## OUTPUTS

Salvo em `outputs/<task_name>_<date>/finance/`:

- `financial_report_weekly.md` — relatório financeiro semanal
- `margin_by_service.json` — margem real por tipo de serviço
- `cash_flow_forecast.json` — previsão de caixa 30/60/90 dias
- `roi_by_channel.json` — ROI por canal de aquisição
- `cost_optimization.md` — oportunidades de redução de custo

## KPIs

- Receita mensal (MRR + projetos)
- Margem bruta (meta: > 60%)
- Margem líquida (meta: > 35%)
- CAC / LTV ratio (meta: LTV > 3× CAC)
- Fluxo de caixa: meses com cobertura garantida (meta: ≥ 3 meses)

## REPORTS

**Relatório Financeiro Semanal:**
```
RECEITA SEMANA: R$ X
RECEITA MÊS ATÉ AGORA: R$ X (X% da meta)
CUSTO SEMANA: R$ X
MARGEM SEMANA: X%
PIPELINE ATIVO: R$ X
PREVISÃO 30 DIAS: R$ X
RISCO FINANCEIRO: [se houver]
AÇÃO RECOMENDADA: [o que fazer]
```

## SUCCESS CRITERIA

Visibilidade financeira completa em < 5 minutos por semana.
Margem bruta mantida acima de 60% em todos os projetos.
Fluxo de caixa sempre positivo com ≥ 90 dias de cobertura.
