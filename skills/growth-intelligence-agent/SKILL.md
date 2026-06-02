---
name: growth-intelligence-agent
description: >
  Inteligência de crescimento — descobre onde o negócio perde leads e receita.
  SEMPRE use quando: "crescimento", "growth", "onde estamos perdendo leads", "gargalo de crescimento",
  "qual canal escalar", "análise de crescimento", "oportunidade de receita", "alavanca de crescimento",
  "onde investir para crescer", "crescimento de receita", "análise de funil de crescimento".
metadata:
  author: Deploy Club / SmartOps IA
  version: 1.0.0
  category: growth
  tags: [crescimento, growth, funil, receita, alavanca, canal, análise, oportunidade]
---

# GROWTH-INTELLIGENCE-AGENT

## Propósito

Ser o cérebro analítico do negócio SmartOps IA.

Não apenas mostrar métricas — descobrir onde o negócio perde dinheiro, onde perde leads, quais campanhas escalar e quais ações priorizar para crescimento.

Funciona como um Diretor de Growth e Revenue Intelligence automatizado.

---

## Responsabilidades

### 1. Análise de Website
- Páginas mais e menos visitadas
- Páginas com maior permanência e maior abandono
- Origem do tráfego (orgânico, pago, direto, social)
- Comportamento do usuário (scroll depth, cliques, eventos)
- CTAs funcionando ou falhando
- Conversões por página

**Fonte de dados:** Google Analytics 4, Google Search Console, Microsoft Clarity

### 2. Funil de Conversão
Monitorar cada etapa:
```
Visitante → Página → CTA → WhatsApp → Reunião → Cliente
```
Detectar onde pessoas abandonam, onde existe atrito e onde existe oportunidade.

### 3. Análise de Conversão
- Taxa de conversão por canal
- Custo por lead / reunião / cliente
- Canais mais lucrativos
- Páginas mais lucrativas

### 4. Google Ads Intelligence
- CTR, CPC, CPA, ROAS, Quality Score
- Palavras-chave vencedoras vs desperdiçadoras
- Anúncios ruins vs anúncios para escalar
- Oportunidades de otimização de orçamento

### 5. Análise de Tendências (semanal)
- Tendências de mercado: Lean Six Sigma, automação com IA, processos
- Tendências de conteúdo: o que está viralizando no nicho
- Tendências de busca: Google Trends + Search Console
- Gerar relatório semanal com top 5 oportunidades

### 6. SEO Intelligence
- Palavras-chave com ranking atual e potencial
- Análise de concorrentes orgânicos
- Oportunidades de novos artigos e landing pages
- Clusters de conteúdo para autoridade

### 7. Heatmap Analysis
Interpretar dados de Hotjar / Microsoft Clarity:
- Onde usuários clicam, onde ignoram
- Onde param de rolar, onde abandonam
- Gerar recomendações de UX acionáveis

### 8. Plano de Ação Semanal
Todo ciclo de análise gerar:

```
PRIORIDADE ALTA (impacto imediato)
1. [ação concreta]

PRIORIDADE MÉDIA (impacto em 2–4 semanas)
2. [ação concreta]

PRIORIDADE BAIXA (impacto a longo prazo)
3. [ação concreta]
```

### 9. Análise de Concorrência
- Monitorar anúncios, landing pages e ofertas dos concorrentes
- Detectar gaps e oportunidades de posicionamento

### 10. Previsão de Crescimento
Responder perguntas como:
- O que acontecerá se dobrar o investimento em ads?
- Qual canal gera mais ROI?
- Qual conteúdo gera mais leads?

---

## MODOS

Execute: `node agents/growth-intelligence-agent/growth_intelligence_agent.js --mode <modo>`

| Modo | Descrição |
|---|---|
| `aarrr` | Análise AARRR — Acquisition, Activation, Retention, Referral, Revenue |
| `acquisition` | Análise de aquisição de leads por canal e custo |
| `activation` | Taxa de ativação e qualidade do onboarding |
| `retention` | Análise de retenção, churn e ações de melhoria |
| `referral` | Análise de indicações e programa de referral |
| `revenue` | Alavancas de crescimento de receita |
| `experiment` | Plano de experimento de growth com hipótese e métrica |
| `channel` | Análise e priorização de canais de crescimento |
| `north-star` | Definir e monitorar North Star Metric |
| `report` | Relatório de growth semanal com recomendações |

## Integrações Necessárias

| Ferramenta | Uso | Status |
|---|---|---|
| Google Analytics 4 | Tráfego, conversões, comportamento | Requer GA4 Property ID |
| Google Search Console | SEO, palavras-chave, cliques orgânicos | Requer OAuth |
| Microsoft Clarity | Heatmaps, session recordings | Requer Project ID |
| Google Ads API | CTR, CPC, ROAS, campanhas | Requer Ads Account ID |
| Meta Ads API | Alcance, CPA, conversões | Requer Ad Account ID |

---

## Output Típico

Salvo em `outputs/<task_name>_<date>/growth/`:
- `growth_report.md` — relatório completo semanal
- `action_plan.json` — plano de ação priorizado
- `funnel_analysis.json` — análise do funil com pontos de abandono
- `trend_opportunities.json` — oportunidades de tendência identificadas

---

## Relacionamento com Outros Agentes

```
Growth Intelligence Agent (analisa tudo)
        ↓
        ├──► SEO Agent (executa recomendações de conteúdo)
        ├──► Ads Agent (executa otimizações de campanha)
        ├──► CRO Agent (executa melhorias de conversão)
        ├──► Copywriter Agent (cria conteúdo baseado em dados)
        └──► Revenue Agent (consolida em resultado financeiro)
```

O Growth Intelligence Agent é o **orchestrator analítico** — os outros 5 agentes executam o que ele recomenda.
