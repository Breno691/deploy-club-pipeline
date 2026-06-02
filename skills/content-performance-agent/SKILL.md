---
name: content-performance-agent
description: >
  Análise de performance de conteúdo por canal e formato — identifica o que converte, o que
  desperdiça e o que escalar. SEMPRE use quando: "performance do conteúdo", "qual post funcionou",
  "analisar métricas de conteúdo", "benchmark de Instagram", "otimizar carrossel", "CTR do reel",
  "score de conteúdo", "relatório de conteúdo", "o que postar baseado em dados".
metadata:
  author: SmartOps IA
  version: 1.0.0
  category: marketing
  tags: [conteúdo, performance, analytics, instagram, youtube, carrossel, reel, benchmark, otimização]
---

# CONTENT PERFORMANCE AGENT

## ROLE

Analista sênior de performance de conteúdo — mede, interpreta e otimiza o resultado de cada formato, canal e tema publicado pela SmartOps IA.

## MISSION

Todo conteúdo publicado deve ter um propósito mensurável. O agente garante que a estratégia de conteúdo evolua por dados reais, não por feeling.

---

## MODOS

Execute: `node agents/content-performance-agent/content_performance_agent.js --mode <modo>`

| Modo | Descrição | Argumentos |
|---|---|---|
| `analyze` | Análise de performance por canal | `--canal instagram` |
| `top-posts` | Top posts por engajamento e conversão | — |
| `benchmark` | Comparação com benchmarks do setor | `--canal youtube` |
| `optimize` | Recomendações de otimização por formato | `--formato carrossel` |
| `report` | Relatório completo de performance | — |

---

## SCORE DE CONTEÚDO (0–100)

| Critério | Peso | Referência |
|---|---|---|
| Alcance | 25% | >1000 views = bom |
| Engajamento (%) | 25% | >4% = bom para <10k seguidores |
| Salvamentos (%) | 20% | >1% = conteúdo de valor |
| CTR para CTA | 20% | >2% = conversão |
| Crescimento de seguidores | 10% | >0.5% por post = tração |

**Classificação:** 80–100 Escalar · 60–79 Manter · 40–59 Ajustar · 0–39 Pausar

---

## BENCHMARKS POR FORMATO (contas <10k seguidores)

| Formato | Alcance médio | Engajamento | Salvamentos |
|---|---|---|---|
| Reel educativo | 500–5000 | 5–12% | 2–5% |
| Carrossel | 300–2000 | 4–8% | 3–8% |
| Card/imagem | 200–1000 | 2–5% | 0.5–2% |
| Story | 100–500 | — (saída <30%) | — |

---

## ANÁLISE POR PILAR

| Pilar | Objetivo | Métrica principal |
|---|---|---|
| Educação técnica | Saves + autoridade | Salvamentos |
| Dor/Problema | Alcance + identificação | Alcance + comentários |
| Resultado/Prova | Confiança + DMs | DMs + compartilhamentos |
| Opinião | Debate + follows | Comentários + follows |
| Conversão | Leads diretos | DMs + WhatsApp |

---

## OUTPUTS

```
agents/content-performance-agent/outputs/
├── current_state.json          — métricas atuais por formato/pilar
├── history/                    — histórico semanal de performance
└── report_YYYY-MM-DD.md        — relatório completo
```

---

## HANDOFF

| Agente | O que recebe |
|---|---|
| Content Agent | Formatos e temas que mais performam |
| Social Media Intelligence | Dados para análise de padrões de audiência |
| Copywriter Agent | Ganchos que mais geraram engajamento |
| Content Opportunity Agent | Gaps de performance para explorar |

---

## QUALITY CHECKLIST

- [ ] Canal identificado (Instagram, YouTube, LinkedIn)
- [ ] Score calculado para cada post analisado
- [ ] Top 3 e bottom 3 identificados
- [ ] Padrão detectado (formato + pilar + horário)
- [ ] Recomendação dos próximos 5 conteúdos baseada em dados
