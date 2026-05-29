---
name: social-media-intelligence
description: >
  Monitors and analyzes SmartOps IA Instagram performance to identify what
  content works, detect audience patterns, recommend next content, and suggest
  account growth strategies. ALWAYS use when user says "analisar Instagram",
  "performance do perfil", "o que esta funcionando", "quais posts performam",
  "crescimento do Instagram", "engagement do perfil", "analise de redes sociais",
  "monitorar Instagram", "insights do Instagram", "o que postar", "tendencias
  de conteudo", "crescimento organico", or when user shares metrics and wants
  interpretation. Outputs performance diagnosis, content recommendations, and
  growth action plan.
---

# Social Media Intelligence

Analyzes SmartOps IA Instagram performance to detect patterns, identify winning content, and generate strategic recommendations.

## When to Use This Skill

- User shares Instagram metrics and wants interpretation
- User asks what content to create next based on what's working
- Weekly/monthly performance review
- User asks why growth has slowed or engagement dropped
- Pipeline requests social media performance report

## Context Files

Read:
1. `knowledge/content_strategy.md` — content pillars, format strategy
2. `knowledge/platform_guidelines.md` — SmartOps IA Instagram guidelines

---

## Step 1: Performance Data Collection

Ask the user for (or guide them to collect):

```
MÉTRICAS BÁSICAS (últimos 30 dias):
- Seguidores: [total] → [crescimento no período]
- Alcance total: [total impressions]
- Engajamento médio por post: [likes + comments + saves + shares]
- Taxa de engajamento: [eng / followers × 100]%

PERFORMANCE POR POST:
[paste top 3 and bottom 3 posts with format + metrics]
Format: Reel / Carrossel / Card
Métrica principal: alcance / engajamento / salvamentos / shares

STORIES:
- Visualizações médias: [X]
- Taxa de saída: [X]%
- Respostas recebidas: [X]
```

If no data provided, guide the user to:
1. Open Instagram app → Professional Dashboard
2. Screenshot the 30-day overview
3. List the 3 posts with most and least reach
4. Note the format of each (reel / carousel / card)

---

## Step 2: Diagnose Performance Patterns

Analyze the data against SmartOps IA content strategy:

### Engagement Rate Benchmarks (small business accounts)

| Seguidores | Engajamento Saudável | Preocupante |
|---|---|---|
| 0–1k | 8–15% | Abaixo de 5% |
| 1k–10k | 4–8% | Abaixo de 3% |
| 10k–100k | 2–5% | Abaixo de 1.5% |

### Content Performance Analysis

Classify each post:
- **Hit:** above-average reach + engagement
- **Sólido:** average performance
- **Underperformed:** below average on both metrics

Pattern detection:
```
Formato que mais performa: [Reel / Carrossel / Card]
Pilar de conteúdo que mais engaja: [Educação / Dor / Prova / Opinião / Conversão]
Melhor dia/horário de postagem: [based on data or default from content_strategy.md]
Conteúdo que gera mais salvamentos: [type]
Conteúdo que gera mais comentários: [type]
Conteúdo que gera mais DMs: [type]
```

---

## Step 3: Audience Behavior Analysis

Questions to answer from the data:

1. **Quem está chegando novo?** (reel de maior alcance = top of funnel)
2. **Quem está engajando?** (carrosséis com mais salvamentos = mid funnel)
3. **Quem está convertendo?** (posts que geraram DMs = bottom funnel)

Funnel health check:
```
Topo (novos alcançados): [X pessoas/semana] → objetivo: crescer
Meio (engajados): [X salvamentos e comentários/semana] → objetivo: educar
Fundo (leads): [X DMs/semana] → objetivo: converter
```

---

## Step 4: Content Recommendations

Based on patterns, generate next 2 weeks of content:

```markdown
## Recomendações de Conteúdo — [period]

### O que está funcionando (manter e ampliar):
1. [Format + topic that hit] → criar mais desse tipo
2. [Format + topic that hit] → testar variação

### O que não está funcionando (ajustar ou pausar):
1. [Underperforming type] → test different hook next time
2. [Underperforming type] → change format or topic

### Próximos 5 posts recomendados:
1. [Format]: [topic] — [reason based on data]
2. [Format]: [topic] — [reason]
3. [Format]: [topic] — [reason]
4. [Format]: [topic] — [reason]
5. [Format]: [topic] — [reason]

### Teste A/B sugerido:
Testar: [hook variant A] vs [hook variant B] no mesmo tema
Métrica de sucesso: [reach or engagement within 24h]
```

---

## Step 5: Growth Action Plan

Short-term (this week):
- Post at optimal time: [day/time from content_strategy.md or data]
- Engage on [X] competitor profiles for 15 min before posting
- Respond to all comments within 2 hours of posting

Medium-term (this month):
- Test [new format or topic] based on performance gaps
- Reach out to [number] profiles in the same niche for collab
- Create 1 "shareable" piece (list, provocation, stat) to drive reach

---

## Step 6: Performance Report Output

```markdown
# Instagram Intelligence Report — SmartOps IA
Período: [date range]
Gerado por: social-media-intelligence skill

## Resumo Executivo
[2–3 sentences: top finding + main opportunity]

## KPIs do Período
| Métrica | Atual | Mês anterior | Variação |
|---|---|---|---|
| Seguidores | [X] | [Y] | [+/-]% |
| Alcance médio | [X] | [Y] | [+/-]% |
| Engajamento médio | [X]% | [Y]% | [+/-]pp |
| Salvamentos | [X] | [Y] | [+/-]% |
| DMs recebidas | [X] | [Y] | [+/-]% |

## Top 3 Conteúdos
1. [Post title/type] — [metrics] — [why it worked]
2. [Post title/type] — [metrics] — [why it worked]
3. [Post title/type] — [metrics] — [why it worked]

## Padrão Identificado
[1–2 sentences about what drives performance for this account]

## Recomendações Próximas 2 Semanas
[list from Step 4]

## Meta Próximo Mês
Seguidores: [X] → [Y]
Engajamento: [X]% → [Y]%
DMs/semana: [X] → [Y]
```

---

## Automation Integration

This agent can be connected to n8n workflows to:
- Pull Instagram Insights API data automatically weekly
- Generate performance report and save to outputs/social/
- Alert when engagement drops below threshold
- Suggest content based on best-performing patterns automatically

---

## Quality Checklist

- [ ] Performance data collected (or user guided to collect it)
- [ ] Benchmarks applied to classify performance
- [ ] Pattern identified (format + pillar that works)
- [ ] Content recommendations specific and actionable
- [ ] Next 5 posts defined with clear rationale
- [ ] Growth actions concrete and calendar-ready
- [ ] Report uses SmartOps IA tone (direct, data-driven, no vague advice)
