# SmartOps IA — Multi-Agent Consulting Operating System

**SmartOps IA** é uma consultoria de Melhoria Contínua, Lean, Six Sigma e Automação com IA para pequenas e médias empresas em BH, MG.

Este repositório implementa o **sistema operacional da consultoria** — uma plataforma multiagente que integra marketing, vendas, operações, automação e estratégia.

---

## Princípio de Especificação de Agentes

Todo agente usa esta estrutura operacional completa:

```
ROLE · MISSION · RESPONSIBILITIES · INPUTS · DATA SOURCES · TOOLS
WORKFLOWS · DECISION FRAMEWORK · OUTPUTS · KPIs · AUTOMATIONS
REPORTS · ALERTS · ACTIONS · RESTRICTIONS · SUCCESS CRITERIA
```

---

## Arquitetura — 7 Camadas

```
1. Data Collection Layer    — coleta de todas as fontes (GA4, Ads, CRM, site, n8n)
2. Memory & Knowledge Layer — base de conhecimento, histórico, vetores
3. Agent Orchestration Layer — BullMQ + n8n coordenando todos os agentes
4. Specialist Agents Layer  — 21 agentes em 4 squads
5. Automation Layer         — n8n executa workflows aprovados
6. Analytics & Dashboard Layer — métricas consolidadas por squad
7. Executive Decision Layer — plano de ação executivo diário
```

---

## Os 4 Squads — 21 Agentes

### SQUAD 1 — MARKETING (7 agentes)

| Agente | Skill File | Foco |
|---|---|---|
| Copywriter Agent | `skills/copywriter-agent/` | copy, hooks, storytelling, CTAs |
| Distribution Agent | `skills/distribution-agent/` | publicação multicanal, calendário |
| Marketing Research Agent | `skills/marketing-research-agent/` | pesquisa, tendências, concorrentes |
| SEO Agent | `skills/seo-agent/` | orgânico, keywords, clusters |
| Video Ad Specialist | `skills/video-ad-specialist/` | criativos de vídeo, VSL, reels |
| Design Agent | `skills/design-agent/` | layouts, carrosséis, identidade visual |
| Remotion Video Agent | `skills/remotion-best-practices/` | animações React, motion design |

### SQUAD 2 — GROWTH (5 agentes)

| Agente | Skill File | Foco |
|---|---|---|
| CRO Agent | `skills/cro-agent/` | conversão de site, funis, formulários |
| Customer Journey Agent | `skills/customer-journey-agent/` | jornada completa do visitante |
| Revenue Agent | `skills/revenue-agent/` | receita, ROI, CAC, LTV, atribuição |
| Ads Agent | `skills/ads-agent/` | Google Ads + Meta Ads |
| Website Analytics Agent | `skills/website-analytics-agent/` | eventos, sessões, páginas, conversões |

### SQUAD 3 — OPERATIONS (5 agentes)

| Agente | Skill File | Foco |
|---|---|---|
| Lean Agent | `skills/lean-agent/` | 8 desperdícios, VSM, eliminação de waste |
| Six Sigma Agent | `skills/six-sigma-agent/` | DMAIC, defeitos, variabilidade |
| Kaizen Agent | `skills/kaizen-agent/` | melhoria contínua diária, quick wins |
| Process Mining Agent | `skills/process-mining-agent/` | descoberta de processos por dados |
| Automation Agent | `skills/automation-agent/` | n8n, APIs, webhooks, RPA |

### SQUAD 4 — EXECUTIVE (4 agentes)

| Agente | Skill File | Foco |
|---|---|---|
| Executive Dashboard Agent | `skills/executive-dashboard-agent/` | dashboards diário/semanal/mensal |
| Competitor Intelligence Agent | `skills/competitor-intelligence-agent/` | monitoramento de concorrentes |
| Strategic Planning Agent | `skills/strategic-planning-agent/` | planos 30/90/180 dias, OKRs |
| CEO Advisor Agent | `skills/ceo-advisor-agent/` | decisão central, priorização executiva |

---

## Orchestrator (Content Pipeline)

O Orchestrator coordena o pipeline de conteúdo diário (3x por semana: Ter/Qui/Sáb).

Skill File: `skills/orchestrator/SKILL.md`

```
Marketing Research Agent
        │
        ├──► Ad Creative Designer  ─┐
        ├──► Video Ad Specialist   ─┼──► Distribution Agent
        └──► Copywriter Agent      ─┘
```

### Comandos do Pipeline

```bash
npm run pipeline:run                     # rodar com demo payload padrão
npm run pipeline:run:payload '<json>'    # rodar com JSON payload inline
node pipeline/worker.js                  # iniciar o BullMQ worker
```

### Infraestrutura

- **Pipeline server:** `pipeline/server.js` — Express porta 3099
- **URL pública:** `https://n8n-pipeline-server.sumjyb.easypanel.host`
- **n8n trigger:** POST `/run-pipeline` com `{ taskName, taskDate, skipPost }`
- **GitHub:** `https://github.com/Breno691/deploy-club-pipeline`

### Skip Flags

| Flag | Efeito |
|---|---|
| `skip_research: true` | Pula Research Agent |
| `skip_image: true` | Pula Ad Creative Designer |
| `skip_video: true` | Pula Video Ad Specialist |

---

## Pipeline de Automação (`pipeline/run_auto.js`)

```
1. research.js       → research_results.json (Tavily AI)
2. generate_copy.js  → copy/ (Threads, Instagram, YouTube)
3. generate_ad.js    → layout.json + ad.html (Claude API)
4. build_ad_html.js  → ad.html (dark theme SmartOps IA, Bebas Neue)
5. render_ad.js      → instagram_ad.png (Playwright 1080×1080)
6. upload_media.js   → media_urls.json (Supabase)
→ auto_result.json retornado para n8n
```

Validação entre etapas via `assertFile()` e `assertJSON()` em cada step.

---

## Aprovação Telegram (n8n)

Após o HTTP Request, o n8n envia preview para Telegram com botões ✅ Aprovar / ❌ Rejeitar via `$execution.resumeUrl`. Aprovado → publica no Instagram.

- **Chat ID:** 1349738505
- **Bot Token:** configurado no n8n

---

## Design do Ad (SmartOps IA)

| Token | Valor |
|---|---|
| Background | `#0A0A0F` |
| Card | `#0B0F17` |
| Border | `#1F2937` |
| Accent Lean | `#7C3AED` (roxo) |
| Accent Automação | `#10B981` (verde) |
| Fonte headline | Bebas Neue |
| Fonte corpo | Inter |

Headline padrão: **"SEU PROCESSO QUEBRADO CUSTA CARO."**
Pilares: Diagnóstico → Mapeamento → Solução

---

## Knowledge Files

Todos os agentes referenciam arquivos em `knowledge/`:

| Arquivo | Conteúdo | Usado por |
|---|---|---|
| `brand_identity.md` | tom, voz, emojis, CTAs aprovados | todos |
| `product_campaign.md` | serviços, selling points, ângulos | Marketing Squad |
| `platform_guidelines.md` | regras Instagram, Threads, YouTube | Marketing Squad |
| `visual_references.md` | tokens de design, paleta, tipografia | Design, Ad Creative |
| `content_strategy.md` | estratégia de conteúdo, formatos | Copywriter, Distribution |

---

## Estrutura de Output do Pipeline

```
outputs/<task_name>_<date>/
├── research_results.json
├── research_brief.md
├── interactive_report.html
├── media_urls.json
├── auto_result.json
├── ads/
│   ├── layout.json
│   ├── ad.html
│   ├── styles.css
│   └── instagram_ad.png
├── copy/
│   ├── instagram_caption.txt
│   ├── threads_post.txt
│   └── youtube_metadata.json
├── video/
│   └── ad.mp4
├── logs/
│   ├── research_agent.log
│   ├── ad_creative_designer.log
│   ├── copywriter_agent.log
│   ├── distribution_agent.log
│   └── auto_pipeline.log
└── Publish <task_name> <date>.md
```

---

## Tech Stack

| Ferramenta | Propósito |
|---|---|
| BullMQ + Upstash Redis | Job queuing e orchestration |
| Tavily AI SDK | Pesquisa de mercado |
| Playwright (chromium) | Rendering HTML→PNG |
| Remotion | Rendering de video ads |
| Supabase | Hosting de mídia |
| Instagram Graph API | Publicação Instagram |
| YouTube Data API | Publicação YouTube |
| n8n | Automação e triggers |
| EasyPanel | Deploy do pipeline server |

---

## Fluxo Executivo Diário

```
1. Coletar dados (GA4, Ads, CRM, site)
2. Agentes analisam seus domínios
3. Cada agente gera insights e recomendações
4. CEO Advisor consolida e prioriza
5. Dashboard atualiza
6. Plano de ação executivo é gerado
7. n8n executa automações aprovadas
```

---

## Formato Padrão de Plano de Ação

Todo relatório executivo deve incluir:

```
TÍTULO:
PROBLEMA:
EVIDÊNCIA:
IMPACTO:
AÇÃO RECOMENDADA:
PRIORIDADE: [Alta / Média / Baixa]
ESFORÇO: [Baixo / Médio / Alto]
ROI ESPERADO:
PRAZO:
RESPONSÁVEL:
MÉTRICA DE SUCESSO:
```
