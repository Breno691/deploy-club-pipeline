## Visão Geral do Projeto

Este projeto implementa um **Sistema de Automação de Conteúdo para Redes Sociais com IA** construído com Claude Code dentro da Antigravity IDE.

O sistema usa **cinco agentes de IA especializados** coordenados por um **Orchestrator** para pesquisar, gerar, renderizar e distribuir conteúdo de marketing para uma marca demo.

O objetivo é demonstrar como agentes Claude Code podem coordenar **workflows de pesquisa, geração criativa, produção de mídia e distribuição social** usando skills modulares, knowledge files e APIs.

A marca demo usada neste projeto é **Deploy Club.**

---

# Arquitetura do Sistema

O sistema consiste em cinco agentes gerenciados por um orchestrator central:

```
Marketing Research Agent
        │
        ├──► Ad Creative Designer  ─┐
        ├──► Video Ad Specialist   ─┼──► Distribution Agent
        └──► Copywriter Agent      ─┘
```

O **Orchestrator** skill coordena todos os agentes via filas de job **BullMQ** backed por **Upstash Redis**. Agentes rodam em ordem de dependência — research primeiro, depois os três agentes criativos em paralelo, depois distribution por último.

Cada agente usa uma combinação de **custom skills, knowledge files e APIs** para executar suas tarefas.

---

# Orchestrator

O Orchestrator não é um agente — é uma skill de coordenação que gerencia o pipeline completo.

Skill File: `skills/orchestrator/SKILL.md`

Responsabilidades:
- Aceitar um Job Payload (JSON) com `task_name`, `task_date`, `platform_targets` e skip flags opcionais
- Validar o payload e enforçar a ordering de dependências
- Enqueue todos os agent jobs na fila BullMQ `ai-content-pipeline` via `pipeline/orchestrator.js`
- Iniciar o BullMQ worker (`pipeline/worker.js`) para processar jobs enfileirados
- Rastrear status dos jobs via log files em `outputs/<task_name>_<date>/logs/`
- Reportar conclusão do pipeline e surfacear o Publish MD file gerado

### Comandos do Pipeline

```bash
npm run pipeline:run                     # rodar com demo payload padrão
npm run pipeline:run:payload '<json>'    # rodar com JSON payload inline
node pipeline/worker.js                  # iniciar o BullMQ worker (terminal separado)
```

### Skip Flags

| Flag | Efeito |
|---|---|
| `skip_research: true` | Pula o Research Agent; requer que `assets/<task_name>/` exista |
| `skip_image: true` | Pula o Ad Creative Designer |
| `skip_video: true` | Pula o Video Ad Specialist |

---

# Agentes e Responsabilidades

## 1. Marketing Research Agent

Propósito:
Conduzir pesquisa estruturada de inteligência de mercado usando o **Tavily AI SDK** via um script local Node.js.

Skill File: `skills/marketing-research-agent/SKILL.md`

Responsabilidades:
- Rodar 5 buscas Tavily direcionadas (tendências, concorrentes, audiência, hooks, tópicos virais)
- Sintetizar achados em categorias de inteligência de marketing
- Gerar três deliverables: JSON estruturado, brief em Markdown com diagramas Mermaid, e um report HTML interativo com Chart.js

Output Típico (salvo em `outputs/<task_name>_<date>/`):
- `research_results.json` — dados estruturados machine-readable consumidos por agentes downstream
- `research_brief.md` — report Markdown human-readable com gráficos Mermaid
- `interactive_report.html` — dashboard interativo estilizado com a marca usando Chart.js

---

## 2. Ad Creative Designer

Propósito:
Gerar **criativos de anúncio estáticos** como design JSON estruturado, depois renderizar para PNG via **Playwright**.

Skill File: `skills/ad-creative-designer/SKILL.md`

Responsabilidades:
- Selecionar tipo de layout do ad (Product Focus, Split ou Lifestyle) baseado na plataforma e objetivo da campanha
- Gerar copy de marketing (headline ≤4 palavras, subtext, CTA)
- Gerar um design JSON spec
- Gerar `ad.html` + `styles.css` a partir do layout spec
- Renderizar o HTML para PNG screenshot 1080×1080 usando Playwright (`chromium.launch()`)

Output Típico (salvo em `outputs/<task_name>_<date>/ads/`):
- `layout.json` — especificação de design
- `ad.html` + `styles.css` — HTML ad gerado
- `instagram_ad.png` — screenshot renderizado via Playwright a 1080×1080

---

## 3. Video Ad Specialist

Propósito:
Gerar conceitos de video ad short-form e **estruturas de scene Remotion-ready**.

Skill File: `skills/video-ad-specialist/SKILL.md`

Responsabilidades:
- Gerar um conceito de vídeo (hook, arco emocional, estilo visual, intenção de CTA)
- Construir um breakdown scene-by-scene (Hook → Product Showcase → Benefit → CTA)
- Gerar scene JSON para renderização Remotion
- Referenciar a skill oficial `remotion-best-practices` para guidance técnico

Output Típico (salvo em `outputs/<task_name>_<date>/video/`):
- Scene JSON com `video_length`, `platform`, e por scene `visual` + `text_overlay`
- Configuração de rendering para Remotion

---

## 4. Copywriter Agent

Propósito:
Transformar output de pesquisa em **copy de marketing platform-native** para Threads, Instagram e YouTube.

Skill File: `skills/copywriter-agent/SKILL.md`

Responsabilidades:
- Selecionar um ângulo de campanha consistente a partir do output de pesquisa
- Escrever copy platform-specific adaptado em tom, tamanho, CTA e formato de hashtag
- Gerar JSON estruturado e arquivos de texto individuais por plataforma

Output Típico (salvo em `outputs/<task_name>_<date>/copy/`):
- `threads_post.txt` — provocativo, casual, ≤500 characters
- `instagram_caption.txt` — hook + benefício + CTA + 3–5 hashtags
- `youtube_metadata.json` — title (60–70 chars), description e keyword tags

---

## 5. Distribution Agent

Propósito:
Hospedar mídia no **Supabase**, montar metadata publish-ready, gerar recomendações de agendamento e gate-protect a publicação real.

Skill File: `skills/distribution-agent/SKILL.md`

Responsabilidades:
- Fazer upload de todos os media files da campanha para o bucket de storage `campaign-uploads` do Supabase
- Gerar public URLs e salvar em `media_urls.json`
- Montar metadata final por plataforma a partir dos outputs do Copywriter Agent
- Gerar recomendações de agendamento baseadas nas tendências da pesquisa
- Escrever um arquivo advisory `Publish <task_name> <date>.md`
- Executar posting real via API **somente** quando o usuário referenciar explicitamente o Publish MD file pelo nome

Plataformas:
- **Instagram** — Graph API (`/media` + `/media_publish`)
- **YouTube** — YouTube Data API (requer OAuth `YOUTUBE_REFRESH_TOKEN`)
- **Threads** — Sem API pública; texto do post é incluído no Publish MD para posting manual

Output Típico (salvo em `outputs/<task_name>_<date>/`):
- `media_urls.json` — URLs públicas do Supabase para toda mídia uploaded
- `Publish <task_name> <date>.md` — advisory completo com captions, metadata, agendamento e instruções de publicação

---

# Knowledge Files

Todos os agentes devem referenciar os seguintes knowledge files localizados no diretório **knowledge/**.

### brand_identity.md
Define:
- tom e voz da marca
- emojis aprovados e o que evitar
- estilo de CTA e linguagem de CTA aprovada
- estratégia de hashtags

Usado por:
- Todos os cinco agentes

---

### product_campaign.md
Define:
- features e selling points dos produtos
- referências de visual assets (filenames em `assets/`)
- ideias e ângulos de campanha

Usado por:
- Marketing Research Agent
- Ad Creative Designer
- Video Ad Specialist
- Copywriter Agent

---

### platform_guidelines.md
Define best practices e formatting constraints por plataforma para:

- Instagram (feed, Stories, Reels)
- Threads
- YouTube (Shorts, vídeo padrão)

Usado por:
- Ad Creative Designer
- Copywriter Agent
- Distribution Agent

---

# Assets

`assets/` contém media assets demo usados para testing e rendering:
- `claude_interface.png`
- `claude_code_terminal.png`
- `n8n_workflow.png`
- `deploy_club_logo.png`

---

# Estrutura da Pasta de Output do Pipeline

```
outputs/<task_name>_<date>/
├── research_results.json         ← Research Agent
├── research_brief.md             ← Research Agent
├── interactive_report.html       ← Research Agent
├── media_urls.json               ← Distribution Agent
├── ads/
│   ├── layout.json               ← Ad Creative Designer
│   ├── ad.html                   ← Ad Creative Designer
│   ├── styles.css                ← Ad Creative Designer
│   └── instagram_ad.png          ← Ad Creative Designer (Playwright render)
├── video/
│   └── ad.mp4                    ← Video Ad Specialist (Remotion render)
├── copy/
│   ├── instagram_caption.txt     ← Copywriter Agent
│   ├── threads_post.txt          ← Copywriter Agent
│   └── youtube_metadata.json     ← Copywriter Agent
├── logs/
│   ├── research_agent.log
│   ├── ad_creative_designer.log
│   ├── video_ad_specialist.log
│   ├── copywriter_agent.log
│   └── distribution_agent.log
└── Publish <task_name> <date>.md ← Distribution Agent
```

---

# Tech Stack

| Ferramenta | Propósito |
|---|---|
| BullMQ + Upstash Redis | Job queuing e worker orchestration |
| Tavily AI SDK (`@tavily/core`) | Pesquisa de mercado via scripts Node.js |
| Playwright (`chromium`) | Rendering HTML-to-PNG de ads |
| Remotion | Rendering de video ads |
| Supabase (`@supabase/supabase-js`) | Hosting de mídia e geração de public URLs |
| Instagram Graph API | Publicação no Instagram |
| YouTube Data API | Publicação no YouTube (requer OAuth) |
