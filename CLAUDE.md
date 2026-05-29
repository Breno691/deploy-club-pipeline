# SmartOps IA — AI Consulting Operating System

**SmartOps IA** é uma consultoria de Melhoria Contínua, Lean, Six Sigma, Automação e IA para pequenas e médias empresas em BH, MG.

Este repositório é o **sistema operacional inteligente da consultoria** — uma plataforma multiagente capaz de analisar dados, gerar conteúdo, otimizar conversões, fechar clientes, melhorar processos e tomar decisões orientadas por ROI.

---

## Princípio Central

Todo agente responde 8 perguntas e entrega 10 elementos:

**8 Perguntas:**
1. O que aconteceu?
2. Por que aconteceu?
3. Qual impacto?
4. O que fazer agora?
5. Qual prioridade?
6. Qual ROI esperado?
7. Qual risco de não agir?
8. Como medir sucesso?

**10 Elementos obrigatórios no output:**
diagnóstico · insight · evidência · recomendação · ação · prioridade · métrica · responsável · prazo · impacto esperado

---

## Formato Padrão de Saída (todos os agentes)

```
TÍTULO:
CONTEXTO:
DADOS ANALISADOS:
PROBLEMA IDENTIFICADO:
EVIDÊNCIA:
IMPACTO:
RECOMENDAÇÃO:
AÇÃO SUGERIDA:
PRIORIDADE: [Alta / Média / Baixa]
ESFORÇO: [Baixo / Médio / Alto]
ROI ESPERADO:
RISCO DE NÃO AGIR:
PRAZO:
MÉTRICA DE SUCESSO:
PRÓXIMO PASSO:
```

---

## Arquitetura — 8 Camadas

```
1. Data Collection Layer     — GA4, Ads, CRM, site, n8n, formulários, contratos
2. Memory & Knowledge Layer  — PostgreSQL, pgvector, Supabase, Redis, Qdrant
3. Agent Orchestration Layer — BullMQ + n8n + LangGraph/CrewAI
4. Specialist Agents Layer   — 35 agentes em 10 squads
5. Automation Layer          — n8n executa workflows aprovados
6. Analytics & Dashboard Layer — 9 dashboards por área
7. Executive Decision Layer  — CEO Advisor + Chief of Staff + plano de ação
8. Governance & Security Layer — auditoria, permissões, controle de acesso
```

---

## Os 10 Squads — 35 Agentes

### SQUAD 1 — MARKETING

| Agente | Skill File | Foco |
|---|---|---|
| Copywriter Agent | `skills/copywriter-agent/` | copy, hooks, scripts, CTAs, reels |
| Design Agent | `skills/design-agent/` | layouts, carrosséis, identidade visual |
| Distribution Agent | `skills/distribution-agent/` | publicação multicanal, calendário |
| Marketing Research Agent | `skills/marketing-research-agent/` | pesquisa, tendências, concorrentes |
| SEO Agent | `skills/seo-agent/` | orgânico, clusters, autoridade |
| Video Ad Agent | `skills/video-ad-specialist/` | criativos de vídeo, VSL, UGC |
| Remotion Video Agent | `skills/remotion-best-practices/` | animações React, motion design |

### SQUAD 2 — GROWTH

| Agente | Skill File | Foco |
|---|---|---|
| CRO Agent | `skills/cro-agent/` | conversão, landing pages, funis |
| Customer Journey Agent | `skills/customer-journey-agent/` | jornada completa do visitante |
| Revenue Agent | `skills/revenue-agent/` | receita, ROI, CAC, LTV, atribuição |
| Ads Agent | `skills/ads-agent/` | Google Ads + Meta Ads |
| Website Analytics Agent | `skills/website-analytics-agent/` | eventos, sessões, páginas |

### SQUAD 3 — OPERATIONS

| Agente | Skill File | Foco |
|---|---|---|
| Lean Agent | `skills/lean-agent/` | 8 desperdícios, VSM |
| Six Sigma Agent | `skills/six-sigma-agent/` | DMAIC, defeitos, variabilidade |
| Kaizen Agent | `skills/kaizen-agent/` | melhoria contínua diária |
| Process Mining Agent | `skills/process-mining-agent/` | processos descobertos por dados |
| Automation Agent | `skills/automation-agent/` | n8n, APIs, RPA, webhooks |

### SQUAD 4 — SALES

| Agente | Skill File | Foco |
|---|---|---|
| Sales Intelligence Agent | `skills/sales-intelligence-agent/` | leads, objeções, fechamento, CRM |
| Proposal Agent | `skills/proposal-agent/` | propostas comerciais personalizadas |
| Offer Optimization Agent | `skills/offer-optimization-agent/` | otimização de ofertas e pacotes |
| Pricing Agent | `skills/pricing-agent/` | precificação, margem, valor percebido |

### SQUAD 5 — EXECUTIVE

| Agente | Skill File | Foco |
|---|---|---|
| Executive Dashboard Agent | `skills/executive-dashboard-agent/` | dashboards diário/semanal/mensal |
| Competitor Intelligence Agent | `skills/competitor-intelligence-agent/` | monitoramento de concorrentes |
| Strategic Planning Agent | `skills/strategic-planning-agent/` | planos 30/90/180 dias, OKRs |
| CEO Advisor Agent | `skills/ceo-advisor-agent/` | decisão central, priorização |
| Chief of Staff Agent | `skills/chief-of-staff-agent/` | estratégia → execução, tarefas |

### SQUAD 6 — KNOWLEDGE

| Agente | Skill File | Foco |
|---|---|---|
| Knowledge Management Agent | `skills/knowledge-management-agent/` | SOPs, playbooks, aprendizados |
| Case Study Agent | `skills/case-study-agent/` | estudos de caso, antes/depois, ROI |
| Productization Agent | `skills/productization-agent/` | transformar consultoria em produtos |

### SQUAD 7 — CLIENT SUCCESS

| Agente | Skill File | Foco |
|---|---|---|
| Client Success Agent | `skills/client-success-agent/` | retenção, satisfação, expansão |
| Risk Agent | `skills/risk-agent/` | alertas, riscos, ação preventiva |

### SQUAD 8 — FINANCE

| Agente | Skill File | Foco |
|---|---|---|
| Financial Intelligence Agent | `skills/financial-intelligence-agent/` | receita, margem, ROI, fluxo de caixa |

### SQUAD 9 — PERSONAL BRAND

| Agente | Skill File | Foco |
|---|---|---|
| Personal Brand Agent | `skills/personal-brand-agent/` | narrativa, posicionamento, autoridade |
| Authority Building Agent | `skills/authority-building-agent/` | palestras, artigos, lives, podcasts |
| Partnership Agent | `skills/partnership-agent/` | parcerias estratégicas B2B |

### SQUAD 10 — AI LAB

| Agente | Skill File | Foco |
|---|---|---|
| AI Lab Agent | `skills/ai-lab-agent/` | novas tecnologias, LLMs, ferramentas |

---

## Orchestrator — Content Pipeline

Coordena o pipeline de conteúdo 3x/semana (Ter/Qui/Sáb):

```
Marketing Research → Copywriter + Design + Video → Distribution
```

Skill File: `skills/orchestrator/SKILL.md`

**Infraestrutura:**
- Pipeline server: `pipeline/server.js` — Express porta 3099
- URL pública: `https://n8n-pipeline-server.sumjyb.easypanel.host`
- n8n trigger: POST `/run-pipeline` com `{ taskName, taskDate, skipPost }`
- GitHub: `https://github.com/Breno691/deploy-club-pipeline`

**Comandos:**
```bash
npm run pipeline:run
node pipeline/worker.js
```

**Pipeline de Scripts (`pipeline/run_auto.js`):**
```
1. research.js       → research_results.json (Tavily AI)
2. generate_copy.js  → copy/ (Instagram, Threads, YouTube)
3. generate_ad.js    → layout.json + ad.html (Claude API)
4. build_ad_html.js  → ad.html (dark theme, Bebas Neue)
5. render_ad.js      → instagram_ad.png (Playwright 1080×1080)
6. upload_media.js   → media_urls.json (Supabase)
→ auto_result.json retornado para n8n
```

**Aprovação Telegram:** Chat ID `1349738505` — botões ✅ Aprovar / ❌ Rejeitar via `$execution.resumeUrl`

---

## Fluxo Orquestrado

```
Evento ou solicitação
        ↓
Orchestrator Agent
        ↓
Seleciona squad e agente
        ↓
Agente analisa dados
        ↓
Agente gera recomendação
        ↓
CEO Advisor valida prioridade
        ↓
Chief of Staff cria plano de execução
        ↓
n8n executa automação aprovada
        ↓
Dashboard atualiza resultado
```

---

## Fluxo Diário

```
1. Coletar dados de todas as fontes
2. Atualizar banco (PostgreSQL / Supabase)
3. Rodar análises dos agentes por squad
4. Gerar insights e recomendações
5. CEO Advisor consolida e prioriza
6. Chief of Staff cria plano do dia
7. n8n executa automações aprovadas
8. Dashboard atualiza
9. Alertas enviados via Telegram/WhatsApp
```

## Fluxo Semanal

```
1. Relatório de marketing
2. Relatório de vendas
3. Relatório de site e conversão
4. Relatório de ads
5. Relatório financeiro
6. Relatório de clientes e riscos
7. Plano de ação da semana
8. OKRs: progresso vs meta
9. Priorização por ROI
```

---

## 9 Dashboards

| Dashboard | Principais KPIs |
|---|---|
| Marketing | alcance, engajamento, seguidores, CTR |
| Website | visitantes, cliques, conversões, abandono |
| Ads | CPC, CTR, CPA, ROAS, Quality Score |
| Revenue | receita, CAC, LTV, pipeline, taxa de fechamento |
| Sales | leads, reuniões, propostas, clientes, objeções |
| Operations | lead time, cycle time, retrabalho, automações |
| Client Success | clientes ativos, riscos, entregas, satisfação |
| Finance | receita, lucro, margem, fluxo de caixa, ROI |
| Executive | consolidado de todos os squads, alertas, ações |

---

## Design do Ad SmartOps IA

| Token | Valor |
|---|---|
| Background | `#0A0A0F` |
| Card | `#0B0F17` |
| Border | `#1F2937` |
| Accent Lean | `#7C3AED` (roxo) |
| Accent Automação | `#10B981` (verde) |
| Headline font | Bebas Neue |
| Body font | Inter |

---

## Knowledge Files

| Arquivo | Conteúdo |
|---|---|
| `knowledge/brand_identity.md` | tom, voz, CTAs, o que NÃO usar |
| `knowledge/product_campaign.md` | serviços, selling points, ângulos |
| `knowledge/platform_guidelines.md` | regras Instagram, Threads, YouTube |
| `knowledge/visual_references.md` | paleta, tipografia, tokens de design |
| `knowledge/content_strategy.md` | estratégia, formatos, frequência |

---

## Estrutura de Output

```
outputs/<task_name>_<date>/
├── research_results.json / research_brief.md / interactive_report.html
├── media_urls.json / auto_result.json
├── ads/ layout.json + ad.html + styles.css + instagram_ad.png
├── copy/ instagram_caption.txt + threads_post.txt + youtube_metadata.json
├── video/ ad.mp4
├── logs/ *.log
└── Publish <task_name> <date>.md
```

---

## Tech Stack

| Ferramenta | Propósito |
|---|---|
| BullMQ + Upstash Redis | Job queuing e orchestration |
| Tavily AI SDK | Pesquisa de mercado em tempo real |
| Playwright (chromium) | Rendering HTML→PNG de ads |
| Remotion | Rendering de video ads |
| Supabase | Storage de mídia e banco de dados |
| Instagram Graph API | Publicação Instagram |
| YouTube Data API | Publicação YouTube |
| n8n | Automação, triggers e workflows |
| EasyPanel | Deploy do pipeline server |
| PostgreSQL + pgvector | Memória vetorial e banco principal |

---

## Banco de Dados (Esquema Principal)

```
users · agents · tasks · agent_logs · agent_reports · agent_recommendations
content_ideas · content_calendar · posts · reels · ads · campaigns
website_events · website_pages · conversions · leads · meetings
proposals · clients · revenue · expenses · competitors
seo_keywords · market_trends · automation_workflows
memory_documents · case_studies · offers · pricing_models
kpis · alerts · risks · executive_actions
client_success_notes · sales_objections · partnerships
```
