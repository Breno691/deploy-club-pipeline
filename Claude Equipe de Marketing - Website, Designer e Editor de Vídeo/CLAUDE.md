# CLAUDE.md — Creative Brand Intelligence System

> **Este arquivo é a source of truth para qualquer agente operando neste projeto.**
> Leia-o completamente antes de iniciar qualquer tarefa. Ele define o que este sistema é,
> o que ele produz, como opera e quais dependências estão disponíveis.

---

## What This System Is

Este é um **portable creative brand intelligence system**. O sistema
em si é o produto — não qualquer marca individual que ele atende.

Quando deployed para uma marca, este sistema:

1. Ingere o brand's knowledge (identity, design language, voice, assets)
2. Gera brand-coherent creative outputs — copy, design specs,
   component documentation, campaign materials — usando esse knowledge como filtro
3. Cria e executa Claude Skills que automatizam repeatable brand workflows

A brand knowledge folder contém os **arquivos da marca Deploy Club**. Eles
demonstram o formato e a profundidade esperados de real brand inputs. Ao
fazer onboarding de uma nova marca, substitua ou estenda esses arquivos com os
materiais reais da marca. Todos os generated outputs devem passar pelo filtro da
loaded brand's lens — nunca use default para outra marca.

---

## Core Resources

### 1. `Ultimate Claude Skills & Plugins Prompt.md`

**Location:** `./Ultimate Claude Skills & Plugins Prompt.md`

Este é o master playbook para construir toda Skill e Plugin neste
sistema. Antes de escrever qualquer skill, leia este documento. Ele define:

- Skill folder structure (`SKILL.md`, `scripts/`, `references/`, `assets/`)
- YAML frontmatter rules (name, description, metadata)
- The three-level progressive disclosure model
- The 5 workflow patterns (Sequential, Multi-MCP, Iterative Refinement,
  Context-Aware, Domain-Specific)
- Testing methodology (trigger tests, functional tests, performance
  comparisons)
- Distribution and validation checklists

**Rule:** Toda skill produzida por este sistema deve estar em conformidade com este
documento. Use-o como the specification — não como sugestão.

---

### 2. `brand knowledge/`

**Location:** `./brand knowledge/`

Esta pasta contém os brand inputs que governam todo generated creative
output.

#### What it contains (structure):

| File | Purpose |
|------|---------|
| `Deploy Club - Brand Identity.md` | Brand overview, mission, values, audience, voice, tone, visual philosophy |
| `Deploy Club DLS.md` | Design Language System primitives — color tokens, type tokens, spacing tokens. Includes the published Claude artifact URL in the file header. |
| `Deploy Club Logo.[ext]` | Primary logo asset |

#### DLS Visual Artifact (Required)

Todo brand DLS deve ter um correspondente **Claude published artifact** —
a rendered, visual version do DLS que team members podem ver e compartilhar
sem precisar acessar o raw markdown.

**How this works:**

- O artifact é publicado via o Claude website ou app (claude.ai)
  usando o `Deploy Club DLS.md` como source content
- Uma vez publicado, a artifact URL é adicionada como um único **Visual
  Artifact** link no topo do DLS markdown file
- Este link serve como a canonical visual reference — inclua-o em
  qualquer creative briefing, handoff ou DLS proposal

**Local import option:**

Se o usuário quiser manter uma cópia local, ofereça salvar o artifact's
rendered output como `Deploy Club DLS - Artifact.html` dentro de `brand knowledge/`.
Isso permite offline access e team distribution sem precisar do
claude.ai.

#### How to use it:

- Estes arquivos são a **source of truth for brand behavior** em todo output
- Ao gerar copy, cada frase deve refletir a brand's stated
  voice e tone calibration
- Ao gerar design specs ou component code, todo valor deve trace
  até um named DLS token — nunca um raw hex ou arbitrary pixel value
- Quando a brand folder contiver example files, trate-os como
  o reference template format only — não envie output com branding errado para
  um cliente diferente

#### Portability rule:

Ao deploying este sistema para uma nova marca:

1. Substitua todos os arquivos em `brand knowledge/` pelos materiais da nova marca
2. Mantenha a mesma file naming convention: `[Brand] - Brand Identity.md`, `[Brand] DLS.md`
3. Publique um novo DLS artifact e atualize a URL no DLS file
4. Não altere nenhum arquivo fora de `brand knowledge/` — o sistema é brand-agnostic

---

## Skills in This System

Skills são construídas usando o `Ultimate Claude Skills & Plugins Prompt.md`
playbook. As seguintes skills fazem parte deste sistema:

### Brand Creatives Design System *(First skill — to be generated)*

**Purpose:** Gera brand-compliant creative assets e documentation —
incluindo campaign copy, UI component specs, design tokens em code-ready
format, e creative briefs — fully derived dos loaded brand knowledge files.

**To generate this skill:** Referencie `Ultimate Claude Skills & Plugins
Prompt.md` e use os brand knowledge files como domain input. The skill
must:

- Load brand identity e DLS files at activation
- Apply voice/tone rules to all generated copy
- Output design tokens como CSS custom properties usando a DLS naming
  convention
- Validate all outputs contra as explicit "What We Are Not" ou
  negative-space rules da marca
- Follow o Iterative Refinement pattern (Part 5, Pattern 3) para campaign
  asset generation

### Brand Video Generation *(Remotion-powered)*

**Purpose:** Gera brand-compliant video content — reels, animated
carousels, YouTube intros — usando Remotion (React-based video framework)
com integração completa aos tokens DLS. Cada frame segue a mesma disciplina
de tokens dos outputs criativos estáticos.

**To generate video content:** Referencie a `brand-video-generation/`
skill. The skill must:

- Validate brand knowledge files antes de qualquer render
- Load motion tokens de `references/motion-tokens.md`
- Use apenas DLS color, typography e spacing tokens via `src/tokens/dls.ts`
- Apply grain overlay e safe zones per DLS motion primitives
- Validate all outputs contra "What We Are Not" rules
- Follow o Iterative Refinement pattern para composition development

---

## Dependencies

As seguintes dependências estão disponíveis neste sistema. Cada uma tem
uma defined activation condition — não invoque uma dependência a menos que sua
condition seja atendida.

### 1. Playwright Browser

**Condition:** Ative apenas quando o usuário **explicitly requests** uma tarefa
que requeira live web data. Exemplos:
- "Research what [competitor] is doing with their campaign"
- "Find current design trends in [category]"
- "Crawl [URL] for article content"

**Use cases:**
- Competitor website analysis
- Editorial and article crawling for reference or trend research
- Design trend scouting (pull visual references, note layout patterns,
  capture typographic direction)

**Rule:** Nunca invoque Playwright speculatively ou para tarefas que possam ser
completed from local files. Confirme a URL ou domain com o usuário antes de
crawling.

---

### 2. NanobananaMCP

**Condition:** Ative quando tarefas requerem MCP-connected workflows, data
retrieval from integrated services, ou quando uma skill referencia uma MCP tool
call.

**Use cases:**
- Passing structured data between skills and external services
- Feeding brand outputs into connected platforms
- Coordinating multi-service workflows defined in skill patterns

---

### 3. Claude Code Frontend Design Plugin

**Condition:** Ative ao generating, rendering, ou validating frontend
code — incluindo component implementations, design token CSS files, ou
interactive UI previews derived from brand DLS specs.

**Use cases:**
- Translating DLS primitives into production-ready CSS custom property
  files
- Building and previewing brand UI components
- Validating that implemented code references named tokens and not
  hardcoded values

---

### 4. Remotion (Video Generation Framework)

**Condition:** Ative quando o usuário **explicitly requests** geração de
vídeo, animação ou motion content programático. Exemplos:
- "Create a brand video reel"
- "Generate an animated carousel"
- "Make a YouTube intro"
- "Render a motion graphic for Instagram"

**Use cases:**
- Brand-compliant video reels (9:16) para Instagram/TikTok
- Animated carousels (4:5) com transições entre slides
- YouTube intros e banners (16:9)
- Qualquer motion content programático usando React components

**Rule:** Nunca invoque Remotion para conteúdo estático — use o skill
brand-creatives-design para imagens, carrosséis HTML e component specs.
Remotion é apenas para output de vídeo (.mp4, .webm). Todas as
composições devem usar tokens DLS do arquivo `src/tokens/dls.ts` — nunca
valores hardcoded.

---

## Agent Operating Rules

Estas regras se aplicam a todo agente e tarefa neste sistema:

1. **Brand first.** Todo output — copy, code, design spec — deve ser
   filtrado pelo loaded brand knowledge. Se nenhuma marca está carregada, peça ao
   usuário para fornecer os brand knowledge files antes de prosseguir.

2. **Tokens, not values.** Ao produzir qualquer frontend code, CSS ou
   design spec, sempre referencie named design tokens do DLS. Nunca use
   raw hex values, arbitrary pixel values ou inline font names. Se um token
   não existe para o use case, sinalize e sugira uma DLS proposal.

3. **Voice is law.** Todo generated copy deve aderir às voice and tone rules
   documentadas no Brand Identity. Leia a tone calibration para o contexto
   específico (ads, editorial, suporte, email) antes de escrever.

4. **Validate against the "nots".** Antes de entregar qualquer output, cruze
   com a seção "What Deploy Club Is Not" do Brand Identity. Se o output
   viola qualquer negative-space rule, reescreva.

5. **Progressive disclosure.** Não carregue tudo de uma vez. Carregue brand
   knowledge quando relevante, carregue skills quando ativadas, carregue references/
   apenas quando necessário. Otimize para token usage.

6. **Portability over customization.** Nunca hardcode brand-specific content
   fora de `brand knowledge/`. O sistema deve funcionar para qualquer marca simplesmente
   trocando o conteúdo daquela pasta.

7. **Artifact as visual source.** Ao discutir cores, tipografia ou
   espaçamento com o usuário ou equipe, sempre referencie o DLS published artifact
   como a canonical visual source. O markdown é para máquinas; o artifact é para
   humanos.

8. **Don't invent, reference.** Se o Brand Identity ou DLS não cobre um
   cenário específico, não improvise — pergunte ao usuário ou sugira uma
   atualização no brand document. Consistência vale mais que velocidade.

9. **Quality over quantity.** Tome seu tempo para produzir outputs
   excelentes. Um carrossel perfeito vale mais que cinco medianos. Um
   component spec preciso vale mais que dez genéricos.

10. **Test before delivering.** Para skills, execute os três níveis de teste
    (trigger, functional, performance) conforme definido no playbook. Para creative
    outputs, valide contra o brand governance checklist antes de apresentar
    ao usuário.
