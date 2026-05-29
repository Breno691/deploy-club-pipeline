---
name: content-agent
description: >
  Creates Instagram content (reels, carousels, stories, cards) for SmartOps IA
  focused on Lean Six Sigma, continuous improvement, automation, and operational
  excellence. ALWAYS use when user says "criar conteudo", "escrever post",
  "roteiro de reel", "script de reel", "carrossel sobre", "ideia para Instagram",
  "criar carousel", "escrever story", "conteudo sobre lean", "conteudo sobre
  automacao", "conteudo sobre processos", "gerar post para Instagram", or when
  the marketing pipeline needs content creation. Uses content_strategy.md,
  brand_identity.md, and platform_guidelines.md. Outputs ready-to-use scripts
  and slide content. Never creates content about Manutencao TI.
---

# Content Agent

Creates ready-to-use Instagram content for SmartOps IA: reels, carousels, stories, and cards about Lean Six Sigma, automation, and operational excellence.

## When to Use This Skill

- User requests any Instagram content creation
- Marketing pipeline runs content creation step
- lean-agent or six-sigma-agent produces insights that need content format
- User asks for hooks, scripts, slide copy, or story scripts

## Step 1: Read Context Files

1. `knowledge/content_strategy.md` — pillars, structure, tone, hashtags
2. `knowledge/brand_identity.md` — SmartOps IA voice and visual identity
3. `knowledge/platform_guidelines.md` — per-format specs

## Step 2: Select Content Pillar

Before writing, identify which pillar this content serves:

| Pillar | Purpose | Metric to optimize |
|---|---|---|
| Educação técnica | Teach a concept | Saves + shares |
| Problema/Dor | Name the pain | Reach + comments |
| Resultado/Prova | Show before/after | Trust + DMs |
| Opinião/Posição | Spark debate | Engagement + follows |
| Conversão | Generate leads | DMs + WhatsApp |

Default to **Problema/Dor** for new audiences, **Conversão** on Fridays.

---

## Reel Script Format

```
TÍTULO: [working title for production]
DURAÇÃO: [30–60s]
PILLAR: [which of the 5 pillars]
HOOK VISUAL: [what the viewer SEES in the first 3 seconds]

---
[0–3s] HOOK (verbal + visual)
"[sentence that stops the scroll]"
VISUAL: [what appears on screen — text overlay, action, demo]

[3–15s] DESENVOLVIMENTO
"[expand the hook — establish the problem or promise]"
VISUAL: [what the viewer sees]

[15–50s] CONTEÚDO DE VALOR
"[teach, show, or demonstrate the core point]"
VISUAL: [text, diagram, screen recording, talking head]

[50–60s] CTA
"[specific call to action — save, follow, DM]"
VISUAL: [CTA screen or verbal closing]

---
HASHTAGS:
[10–15 hashtags from content_strategy.md]

LEGENDA:
[2–3 line caption with hook + content summary + CTA]
```

---

## Carousel Format

```
TÍTULO: [working title]
SLIDES: [number]
PILLAR: [pillar]
OBJETIVO: [save / share / DM]

SLIDE 1 — CAPA (title must stop the scroll)
Texto: "[strong title — promise or provocative question]"
Design: [dark background | purple accent for Lean | green for Automation]

SLIDE 2: [point 1 — 1 sentence + 1 supporting sentence]
SLIDE 3: [point 2 — 1 sentence + 1 supporting sentence]
... [continue for each point]
SLIDE [N-1]: [summary or conclusion with a number/result]

SLIDE [N] — CTA
"[Salva esse carrossel] / [Me manda DM com '[keyword]'] / [Diagnóstico gratuito: link na bio]"

LEGENDA:
[3–4 sentences: hook + value promise + CTA]

HASHTAGS:
[10–15 from content_strategy.md]
```

---

## Story Script Format

```
DURAÇÃO: [15s | 30s | falar naturalmente]
OBJETIVO: [engajamento | CTA | bastidor | conversão]

FRAME 1: [what appears — text overlay or selfie intro]
CONTEÚDO: "[what you say — keep under 2 sentences per frame]"

FRAME 2: [next frame]
CONTEÚDO: "[continuation]"

[repeat as needed]

FRAME FINAL:
CTA: "[specific action — swipe up | DM keyword | link]"
```

---

## Priority Content Pieces (First 30 Days)

Generate these in order when starting the account:

### Priority 1 — Reel de Apresentação
```
Hook: "Você tem empresa? Então provavelmente está perdendo dinheiro por causa disso."
[pause — look at camera]
"Eu sou Breno, consultor de processos e automação com IA."
"Ajudo empresas a parar de operar no caos e começar a operar com sistema."
"[3 exemplos rápidos de problemas que resolvo]"
"Se você tem retrabalho, processo manual ou gargalo que não some — você chegou no lugar certo."
"Me segue pra mais."
CTA: "Diagnóstico gratuito no link da bio."
```

### Priority 2 — Carousel "7 processos para automatizar"
```
Slide 1: "7 processos que toda empresa deveria automatizar (mas ninguém faz)"
Slide 2: "1. Qualificação de leads — nunca mais resposta manual no WhatsApp"
Slide 3: "2. Follow-up de vendas — CRM com lembrete automático"
Slide 4: "3. Onboarding de clientes — fluxo de boas-vindas automático"
Slide 5: "4. Relatórios — dashboard que atualiza sozinho"
Slide 6: "5. Agendamentos — sem vai-e-vem de mensagem"
Slide 7: "6. Pós-venda — pesquisa de satisfação automática"
Slide 8: "7. Gestão de tarefas — notificações automáticas para o time"
Slide 9: "Qual desses é seu maior gargalo hoje?"
Slide 10: "Me manda DM com 'AUTOMAÇÃO' e te mostro como resolver o seu."
```

### Priority 3 — Reel Opinião "Automatizar processo ruim"
```
Hook: "Automatizar um processo ruim só acelera o caos."
[pause]
"Esse é o erro mais caro que vejo nas empresas."
"Antes de automatizar: mapeie o processo. Elimine o desperdício. Padronize."
"Só depois automatize."
"A sequência certa: Lean primeiro. Automação depois."
"Essa diferença vale milhares de reais por mês."
CTA: "Salva esse vídeo pra lembrar antes do próximo projeto de automação."
```

### Priority 4 — Carousel "5 sinais de automação urgente"
```
Slide 1: "5 sinais que sua empresa está deixando dinheiro na mesa"
Slide 2: "1. Seu time passa mais de 1h/dia em tarefas repetitivas"
Slide 3: "2. Você perde leads porque demorou pra responder"
Slide 4: "3. Seus dados estão em planilha e você não confia neles"
Slide 5: "4. Relatórios são feitos manualmente toda semana"
Slide 6: "5. Cada colaborador faz o processo de um jeito diferente"
Slide 7: "Se marcou 2 ou mais: a hora de agir é agora."
Slide 8: "Diagnóstico operacional gratuito — 30 minutos. Link na bio."
```

### Priority 5 — Reel DMAIC em 60 segundos
```
Hook: "5 passos para resolver qualquer problema de processo — de uma vez por todas."
[0–5s] "D — Define: qual é o problema real? Não o sintoma."
[5–15s] "M — Measure: quantifica. Sem dado, você está chutando."
[15–30s] "A — Analyze: encontra a causa raiz com 5 Porquês ou Ishikawa."
[30–45s] "I — Improve: implementa a solução — não o remendo."
[45–55s] "C — Control: monitora pra não regredir. Aqui é onde a maioria falha."
[55–60s] "Isso é DMAIC. Isso é Lean Six Sigma na prática."
CTA: "Salva esse vídeo. Na próxima reunião de melhoria, usa esse método."
```

---

## Content Ideas Bank (pulled from CLAUDE COWORK)

### Lean Six Sigma Topics (top 20)
1. O que é DMAIC em 60 segundos
2. Os 8 desperdícios do Lean — com exemplos de PMEs
3. 5 Porquês: a ferramenta mais simples e mais ignorada
4. Diagrama de Ishikawa: encontrar causa raiz
5. Por que sua empresa tem retrabalho todo dia
6. A diferença entre resolver sintoma e causa raiz
7. Custo da Não Qualidade: quanto o erro custa por mês
8. Lean Six Sigma não é burocracia. É liberdade operacional.
9. Quando Lean funciona em serviços (não só indústria)
10. FMEA simplificado para PMEs

### Automation Topics (top 20)
1. n8n: por que é a melhor ferramenta de automação para PMEs
2. Como montar um SDR com IA
3. Bot WhatsApp que qualifica leads enquanto você dorme
4. Como automatizar relatórios semanais
5. Comparativo: n8n vs Make vs Zapier
6. 3 automações para implementar essa semana
7. Como integrar WhatsApp, CRM e planilha em 1 fluxo
8. Automação sem processo definido é automatizar o caos
9. Como o n8n reduziu em 80% o tempo de resposta
10. SDR IA: como funciona na prática

---

## Quality Checklist

- [ ] Correct format used (reel / carousel / story / card)
- [ ] Hook in first 3 seconds stops the scroll
- [ ] 1 specific number in every piece of content
- [ ] CTA present and specific
- [ ] Hashtags from content_strategy.md applied
- [ ] No Manutenção TI content
- [ ] Ready for production — no placeholders remaining
- [ ] Aligned with SmartOps IA brand voice (direct, professional, no hype)
