# Output Schema — research_results.json

Schema completo de todos os campos gerados pelo Marketing Research Agent.

```json
{
  "task_name": "string — nome da task (snake_case)",
  "date": "string — YYYY-MM-DD",
  "data_source": "tavily | brand_defaults",
  "product": "string — nome do produto/serviço",
  "services": ["Lean Six Sigma", "Automação com IA"],
  "target_audience": "string — descrição da audiência primária",
  "campaign_focus": "string — escopo da campanha (nunca Manutenção TI)",

  "content_topics": [
    "string — tópico 1",
    "string — tópico 2"
  ],

  "marketing_angles": [
    "string — ângulo 1",
    "string — ângulo 2"
  ],

  "keywords": [
    "string — keyword 1"
  ],

  "ad_hooks": [
    "string — hook 1 (identificação de dor)",
    "string — hook 2 (dado chocante)",
    "string — hook 3 (provocação direta)"
  ],

  "video_ideas": [
    "string — conceito de vídeo 1"
  ],

  "competitor_gaps": [
    "string — gap identificado 1"
  ],

  "content_opportunities": [
    {
      "tema": "string",
      "formato": "carrossel | reel | post | video",
      "canal": "Instagram | LinkedIn | YouTube | TikTok",
      "potencial": "viral | autoridade | educativo | conversão",
      "hook": "string — primeira linha sugerida"
    }
  ],

  "audience_pain_points": {
    "primarias": ["string"],
    "secundarias": ["string"],
    "linguagem_real": ["string — termos exatos que o público usa"]
  },

  "trending_topics": [
    {
      "tema": "string",
      "status": "emergente | estabelecida | declinando",
      "canal_prioritario": "string"
    }
  ],

  "trending_windows": {
    "instagram": "string — dias e horários BRT",
    "youtube": "string",
    "threads": "string",
    "linkedin": "string"
  },

  "positioning_recommendations": {
    "diferencial_principal": "string",
    "tom_sugerido": "string",
    "angulo_autoridade": "string"
  },

  "raw_summary": {
    "trends": "string — resumo bruto da busca 1",
    "competitors": "string — resumo bruto da busca 2",
    "audience": "string — resumo bruto da busca 3",
    "hooks": "string — resumo bruto da busca 4",
    "viral": "string — resumo bruto da busca 5"
  }
}
```

---

## research_brief.md — Estrutura

```markdown
# Research Brief: <produto> — <task_name> · <date>

> Data source: tavily | brand_defaults

## Executive Summary
[2–3 frases: insight principal + ângulo recomendado + oportunidade mais urgente]

## Tendências de Mercado
## Análise Competitiva (com gaps identificados)
## Dores de Audiência (com linguagem real)
## Creator Intelligence (formatos que performam)
## Oportunidades de Conteúdo (3–5 temas com hook sugerido)
## Market Gaps
## Top Hooks (ranqueados por potencial)
## Keywords Prioritárias
## Ângulo Recomendado + Razão + Proof point

## Fluxo da Campanha
\`\`\`mermaid
graph LR
  A[Hook: Dor] --> B[Método: Lean/Automação]
  B --> C[Prova: número + prazo]
  C --> D[CTA]
\`\`\`

## Janelas de Publicação
| Plataforma | Horários |
|------------|---------|
| Instagram  | ...     |
| YouTube    | ...     |
| LinkedIn   | ...     |

## Próximas Ações Estratégicas
1. [ação para copywriter-agent]
2. [ação para video-ad-specialist]
3. [ação para distribution-agent]
```
