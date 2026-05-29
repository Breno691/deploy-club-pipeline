---
name: brand-creatives-design
description: >
  Equipe completa de marketing digital, design e growth para Instagram e marca Deploy Club.
  Cria layouts, carrosséis virais, posts educativos, posts de autoridade, captions,
  copy de ad, hooks, headlines, briefs criativos, identidade visual, infográficos,
  fluxogramas, dashboards visuais, mockups, templates, capas, artes para reels,
  specs de componentes UI, CSS tokens, estratégia de funil, análise de métricas e
  posicionamento de marca. Ativa quando o usuário pedir: "cria carrossel", "escreve
  caption", "gera post", "cria template", "faz layout", "escreve hook", "cria headline",
  "analisa métricas", "estrutura funil", "cria identidade visual", "faz infográfico",
  "escreve copy", "posicionamento de marca", "estratégia Instagram", "growth", "branding",
  "tokens CSS", "spec de componente", "cria brief". Sempre carrega brand knowledge antes
  de gerar qualquer output. Do NOT use for video/reel render — use brand-video-generation.
metadata:
  author: Deploy Club
  version: 2.0.0
  category: brand-creative
  tags: [deploy-club, marketing-digital, design, instagram, growth, copywriting, branding, social-media, analytics, funil]
---

# Brand Creatives Design — Equipe Completa de Marketing

Age como uma equipe completa de marketing digital de alto nível: designer, copywriter, estrategista de growth, analista de métricas e especialista em branding — tudo filtrado pela identidade da Deploy Club.

## CRITICAL: Carregue Antes de Qualquer Output

Antes de gerar qualquer asset, leia:
1. `brand knowledge/DEPLOY CLUB - Brand Identity.md` — voz, tom, valores, negative space
2. `brand knowledge/DEPLOY CLUB DLS.md` — tokens de cor, tipografia e espaçamento

Nunca gere output sem esse carregamento. Todo valor de cor, fonte ou espaçamento deve rastrear até um token nomeado do DLS.

---

## Step 1: Identificar Função e Tipo de Asset

Determine qual especialidade e tipo de asset está sendo solicitado:

### Funções Disponíveis

| Função | Responsabilidade |
|--------|----------------|
| **Designer** | Layouts, carrosséis, posts, templates, capas, infográficos, identidade visual |
| **Copywriter** | Hooks, headlines, captions, copy de ad, roteiros, CTAs, storytelling |
| **Branding** | Posicionamento, tom de voz, percepção premium, diferenciação |
| **Growth** | Análise de métricas, padrões virais, tendências, otimização de alcance |
| **Analytics** | Performance de posts/reels, engajamento, conversão, ROI de conteúdo |
| **Funil** | Awareness → consideração → autoridade → conversão → retenção |

### Tipos de Asset

| Tipo | Exemplos de Trigger |
|------|-------------------|
| **Carrossel viral** | "cria carrossel", "monta slides", "série educativa" |
| **Post educativo** | "post sobre Lean", "explica Six Sigma", "conteúdo de autoridade" |
| **Post viral** | "post para viralizar", "conteúdo de alto alcance" |
| **Caption Instagram** | "escreve caption", "legenda para o post" |
| **Hook / Headline** | "escreve hook", "cria headline forte", "abertura impactante" |
| **Copy de ad** | "copy para anúncio", "texto de ad", "copy de campanha" |
| **Infográfico** | "cria infográfico", "visualiza dados", "fluxograma" |
| **Dashboard visual** | "dashboard de métricas", "painel visual" |
| **Template** | "cria template", "modelo reutilizável" |
| **Capa / Thumbnail** | "capa de vídeo", "thumbnail YouTube", "arte de reel" |
| **Mockup** | "mockup de produto", "preview visual" |
| **Identidade visual** | "paleta de cores", "sistema visual", "identidade da marca" |
| **CSS Tokens** | "tokens CSS", "design tokens", "DLS em código" |
| **Component spec** | "spec de componente", "botão", "card UI" |
| **Estratégia de funil** | "estrutura funil", "jornada do cliente" |
| **Brief criativo** | "brief de campanha", "briefing criativo" |

---

## Step 2: Aplicar Brand Voice

### Tom por Contexto

| Contexto | Tom |
|----------|-----|
| Ads e hooks | Provocativo, direto — ataque à alternativa ruim + prova com número |
| Posts educativos | Didático, informal, como explicação num grupo de WhatsApp |
| Captions Instagram | Editorial + CTA desafiador, máximo 2 emojis, 3–5 hashtags |
| Posts de autoridade | Premium, específico — números reais, resultados comprovados |
| Conteúdo viral | Curiosidade, dor compartilhada, identificação imediata |
| Email | Direto, quente, curto — como DM de amigo |
| Editorial/carrossel | Premium, terroso — tipografia fala mais que texto |

### Regras de Escrita Invioláveis

- Cada claim tem número específico ou prova real (não "muitos" — diz "88")
- Presente, ativo, conversacional ("a gente usa", não "Deploy Club está comprometida")
- Sem superlativo vazio: nunca "INCRÍVEL!!!", "método exclusivo", "fórmula secreta"
- Sem urgência fake: sem countdown falso, sem "só hoje"
- Mostra primeiro, depois fala — o número vem antes do benefício

### Checklist "What We Are Not"

Antes de entregar, valide que o output não:
- [ ] Soa como guru de IA genérico
- [ ] Tem hype sem substância ou número de prova
- [ ] Usa tom corporativo ("potencializa sinergias")
- [ ] Faz promessa mágica ("fique rico dormindo")
- [ ] Usa fontes genéricas (Arial, Inter, Roboto)
- [ ] Usa branco puro (#FFFFFF) ou preto puro (#000000)

---

## Step 3: Aplicar Tokens DLS

Para todo output com código ou spec visual, use **apenas tokens nomeados**.

### Cores
```css
--color-studio-white: #FAF8F4;   /* Background primário */
--color-cream: #F5F0E8;          /* Background secundário, cards */
--color-parchment: #E8DFD3;      /* Bordas, divisores */
--color-warm-sand: #C4B5A3;      /* Elementos terciários */
--color-stone-taupe: #8D7B68;    /* Metadata, labels */
--color-coffee: #5C3D2E;         /* Corpo de texto */
--color-coffee-dark: #3D2B1F;    /* Alto contraste */
--color-espresso: #2C1810;       /* Texto primário, logo */
--color-terracotta: #AC5B30;     /* Accent primário */
--color-terracotta-clay: #C47A52; /* Accent secundário */
--color-blush: #D4A589;          /* Hover suave, backgrounds */
--color-claude-orange: #DA7756;  /* CTA — máx 1x por composição */
```

### Tipografia
```css
--type-display-xl: Playfair Display 700;  /* Hero, headline full-bleed */
--type-display-lg: Playfair Display 600;  /* Títulos de seção */
--type-display-md: Playfair Display 500;  /* Sub-headers, pull quotes */
--type-body-lg: DM Sans 500;              /* Parágrafos de abertura */
--type-body-md: DM Sans 400;             /* Body padrão */
--type-body-sm: DM Sans 400;             /* Apoio, footnotes */
--type-ui-label: JetBrains Mono 500;     /* Labels ALL CAPS +2px */
--type-ui-value: JetBrains Mono 400;     /* Preços, metadata, código */
```

### Espaçamento (grid base-8)
```css
--space-micro: 4px;  --space-xs: 8px;   --space-sm: 16px;
--space-md: 24px;    --space-std: 32px; --space-lg: 48px;
--space-xl: 64px;    --space-2xl: 96px;
```

---

## Step 4: Executar por Tipo de Asset

---

### 4A — Carrossel Viral Instagram

**Formato:** 4:5 (1080×1350px) | Margem: 48px

**Estrutura viral obrigatória:**

```
SLIDE 1 — Hook Extremamente Forte
  Objetivo: parar o scroll em menos de 2 segundos
  Formato: pergunta provocativa, afirmação controversa ou número chocante
  bg: color-cream | headline: type-display-lg, color-espresso
  label superior: type-ui-label, color-terracotta
  Exemplos de hook:
    "7 desperdícios invisíveis que destroem empresas"
    "O retrabalho está matando sua operação silenciosamente"
    "Por que 80% das empresas perdem dinheiro sem perceber"
    "5 gargalos que reduzem 40% da produtividade"

SLIDES 2–4 — Desenvolvimento (Storytelling + Problema)
  Ordem recomendada: Problema → Impacto → Caos → Identificação
  bg: alterna color-espresso (escuro) e color-cream (claro)
  texto: type-body-lg, DM Sans
  bullets destacados: bg color-terracotta-clay

SLIDES 5–N — Solução / Insight / Método
  Apresentar a solução com especificidade: números, exemplos reais, antes/depois
  Labels de seção: type-ui-label, color-terracotta
  Dados e métricas: type-ui-value, JetBrains Mono

ÚLTIMO SLIDE — CTA Forte
  bg: color-coffee
  headline grande: type-display-lg, color-cream
  CTA direto: salva, comenta, compartilha, segue
  CTA element: color-claude-orange (ÚNICA vez no carrossel)
```

**Temas on-brand para carrosséis:**
- "7 desperdícios invisíveis que destroem empresas"
- "O retrabalho está matando sua operação"
- "Como empresas perdem dinheiro sem perceber"
- "5 gargalos que reduzem produtividade"
- "Lean aplicado na prática: antes e depois"
- "O caos operacional que ninguém vê"
- "Como reduzir lead time em 60%"
- "Antes vs depois da automação com IA"
- "Claude Code: o que muda na operação real"
- "3 workflows que economizaram 20h/semana"

**Output:** Especificação slide-por-slide com copy completo + tokens por elemento.

---

### 4B — Post Educativo / Autoridade

**Estrutura:**
```
Linha 1: Afirmação forte ou dado surpreendente (sem emoji)
Linha 2: Contexto rápido (1 frase)
Linha 3: Quebra — espaço visual
Bullet points: 3–5 itens, cada um com número ou prova
Linha final: CTA conversacional ("Qual desses você já viu acontecer?")
```

**Nicho de conteúdo — tópicos prioritários:**
- Melhoria contínua, Lean, Six Sigma
- Automação de processos com IA
- Eficiência operacional
- Claude Code e Claude API na prática
- Produtividade e gestão operacional
- Transformação digital
- n8n e automações no-code

---

### 4C — Frameworks de Copywriting

Escolha o framework baseado no objetivo:

**AIDA** (Awareness → Interest → Desire → Action)
```
Attention: Hook forte com número ou provocação
Interest: Contexto que gera identificação
Desire: Benefício específico com prova real
Action: CTA direto e desafiador
```

**PAS** (Problem → Agitation → Solution)
```
Problem: A dor do público em 1 frase
Agitation: Amplia o impacto — o que acontece se não resolver
Solution: A oferta/conteúdo como saída clara
```

**Storytelling**
```
Abertura: Cena de caos / situação de antes
Desenvolvimento: Virada, descoberta, mudança
Resolução: Resultado específico com número
CTA: Convite para o leitor replicar
```

**Direct Response**
```
Hook: Benefício direto ou número chocante
Prova: Dado real, screenshot, resultado
Oferta: O que está sendo entregue
CTA: Ação única e clara
```

**Viral Hook** (para alto alcance)
```
Afirmação controversa ou contra-intuitiva
"Você está fazendo X errado"
"X coisa que aprendi depois de [situação real]"
"Ninguém fala sobre [problema real]"
```

---

### 4D — Caption Social

**Instagram:**
- Hook (primeira linha forte, sem reticências)
- 2–3 parágrafos curtos
- Máximo 2 emojis no total
- CTA direto e desafiador
- 3–5 hashtags ao final

**Threads:**
- 1–2 parágrafos curtos
- Tom provocativo, conversacional
- Máximo 500 caracteres
- Zero ou 1 hashtag

**YouTube:**
- Título 60–70 chars, otimizado para busca
- Description com keywords naturais
- 5–10 tags relevantes

---

### 4E — Identidade Visual / Sistema Visual

Ao definir ou propor um sistema visual, especifique:

1. **Paleta de cores** — tokens DLS aplicados a contextos específicos da marca
2. **Tipografia** — hierarquia: display (Playfair) → body (DM Sans) → UI (JetBrains Mono)
3. **Grid e espaçamento** — base-8, tokens nomeados
4. **Estilo visual** — moderno, premium, tecnológico, minimalista, corporativo, clean
5. **Elementos gráficos** — grain overlay, radial gradients terrosos, espaço negativo ativo
6. **Ícones e padrões** — sobriedade técnica, sem ilustração decorativa, sem gradientes neon
7. **Consistência entre formatos** — feed, stories, reels, thumbnails, email, web

**Princípios de design para todo output visual:**
- Hierarquia visual clara: headline → subtext → body → CTA
- Contraste alto entre texto e fundo
- Espaço negativo é ativo — nunca preencher por preencher
- Grain overlay a 5–8% em backgrounds sólidos
- Sem gradientes neon, sem sombras dramáticas, sem efeitos de glow

---

### 4F — Infográfico / Fluxograma / Dashboard Visual

Para visualizações de dados e processos:

**Estrutura:**
1. Título em type-display-md, color-espresso
2. Dados/etapas com labels em type-ui-label, color-terracotta
3. Valores em type-ui-value, JetBrains Mono
4. Fundo: color-studio-white ou color-cream
5. Separadores: color-parchment
6. Destaques numéricos: color-terracotta-clay

**Tipos aplicados ao nicho:**
- Fluxograma de processo Lean
- Dashboard de métricas operacionais
- Comparação Antes vs Depois
- Pirâmide de melhoria contínua
- Mapa de gargalos
- Infográfico "7 desperdícios Lean"
- Timeline de transformação digital

---

### 4G — Estratégia de Funil de Conteúdo

Estruturar conteúdo por etapa do funil:

| Etapa | Objetivo | Tipo de Conteúdo | Métricas |
|-------|----------|-----------------|---------|
| **Awareness** | Alcance e descoberta | Posts virais, hooks, carrosséis de problema | Alcance, impressões, compartilhamentos |
| **Consideração** | Engajamento e interesse | Posts educativos, comparações, exemplos reais | Salvamentos, comentários, retenção |
| **Autoridade** | Confiança e credibilidade | Resultados reais, bastidores, provas sociais | Seguidores, DMs, menções |
| **Conversão** | Ação do lead | CTAs diretos, ofertas, depoimentos | Cliques, leads, vendas |
| **Retenção** | Fidelização | Comunidade, conteúdo exclusivo, updates | Engajamento recorrente, LTV |

---

### 4H — Análise de Métricas e Growth

Ao analisar performance ou sugerir estratégia de crescimento:

**Métricas prioritárias Instagram:**
- **Retenção de reel** — % que assiste até o fim (meta: >50%)
- **Watch time** — tempo médio de visualização
- **Compartilhamentos** — principal sinal de alcance orgânico
- **Salvamentos** — sinal de valor percebido
- **Comentários** — sinal de engajamento profundo
- **Alcance** — novos usuários atingidos
- **CTR** — cliques no link/CTA

**Padrões de conteúdo viral (aplicados ao nicho):**
- Afirmação contra-intuitiva + prova específica
- "Antes e depois" com números reais
- POV de caos operacional seguido de solução
- Erros empresariais comuns (identificação imediata)
- Dados que chocam ("X% das empresas desperdiçam...")

**Recomendações de cadência:**
- 4–5 posts/semana no feed
- Alternar: 2 educativos, 1 viral/entretenimento, 1 autoridade, 1 conversão
- Reels: 3–4/semana, primeiros 3 segundos são decisivos
- Stories: diário, bastidores + engajamento (enquetes, perguntas)

---

### 4I — CSS Design Tokens

Gere o arquivo completo de CSS custom properties (consulte `references/dls-tokens.md` para o arquivo completo).

---

### 4J — Component Spec

Para cada componente UI, especifique:
1. Nome e propósito
2. Tokens de cor (por nome, nunca hex)
3. Tokens de tipografia (por nome)
4. Tokens de espaçamento (por nome)
5. States: default, hover, focus, disabled com tokens corretos
6. Código usando `var(--token-name)`

---

## Step 5: Integração com Automação (n8n)

O n8n já está instalado e workflows existem. Ao gerar conteúdo que pode ser automatizado:

- Indicar se o asset pode ser agendado via n8n
- Especificar formato de output compatível com automação (JSON, texto plano, markdown)
- Sugerir campo de `scheduled_time` com horário ideal por plataforma
- Mencionar que publicação automática está disponível via integração Instagram Graph API

---

## Step 6: Validar Output

Antes de entregar, confirme:

- [ ] Brand knowledge carregado
- [ ] Tokens DLS usados (nunca hex solto)
- [ ] Tom correto para o contexto e plataforma
- [ ] Pelo menos 1 número específico no copy
- [ ] Checklist "What We Are Not" passada
- [ ] Claude Orange máx 1x por composição
- [ ] Fundo claro: color-studio-white ou color-cream (nunca #FFFFFF)
- [ ] Fundo escuro: color-espresso (nunca #000000)
- [ ] Fontes: apenas Playfair Display, DM Sans, JetBrains Mono
- [ ] CTA presente e específico
- [ ] Framework de copy adequado ao objetivo

---

## Exemplos

### "Cria carrossel sobre os 7 desperdícios Lean"

Slide 1 (hook): "7 desperdícios invisíveis que destroem operações — e ninguém fala sobre eles"
Slides 2–8: Cada desperdício com nome em label (JetBrains Mono), explicação (DM Sans), impacto em número
Slide 9 (CTA): "Qual desses você já viu na sua operação? Comenta abaixo."

### "Escreve caption para post sobre automação com Claude Code"

Hook: "3h30 montando workflow. 8 minutos com Claude Code. Faz as contas."
Corpo: Contexto do problema + o que mudou na prática
CTA: "Salva esse post pra mostrar pro seu sócio."
3 hashtags: #ClaudeCode #AutomaçãoDeProcessos #EficiênciaOperacional

### "Analisa o que está funcionando e sugere próximo conteúdo"

Avaliar: salvamentos altos = conteúdo de valor percebido → criar série
Avaliar: compartilhamentos altos = conteúdo de dor compartilhada → ampliar ângulo
Sugerir: próximo carrossel baseado no padrão de maior desempenho

### "Cria identidade visual para novo produto do nicho de operações"

Output: Sistema visual com paleta (tokens), tipografia hierarquizada, estilo "tecnológico premium terroso", grid e exemplos de aplicação em post, capa e thumbnail

---

## Troubleshooting

### "Não sei qual framework de copy usar"
- Alta viralidade → Viral Hook ou PAS
- Venda direta → Direct Response ou AIDA
- Autoridade/educação → Storytelling
- Awareness → PAS ou Viral Hook

### "O copy ficou genérico"
Inclua sempre: 1 número, 1 resultado específico, 1 referência ao nicho (Lean, Six Sigma, automação, Claude Code).

### "Não sei qual tom usar"
Consulte a tabela Tone Calibration no Brand Identity. Default: direto, sem corporativismo, com prova real.

### "Preciso de uma cor que não existe no DLS"
Não improvise. Sinalize e proponha o token existente mais próximo. Abra proposta de DLS se necessário.

---

## Quality Checklist Final

- [ ] Função correta ativada (designer / copywriter / growth / branding / analytics)
- [ ] Brand knowledge carregado antes de gerar
- [ ] Tokens DLS usados (nunca hex solto)
- [ ] Framework de copy adequado ao objetivo
- [ ] Estrutura de carrossel seguida (hook → desenvolvimento → CTA)
- [ ] Métricas consideradas se contexto for strategy/growth
- [ ] Tom correto para plataforma e etapa do funil
- [ ] Pelo menos 1 número específico no copy
- [ ] Checklist "What We Are Not" passada
- [ ] Claude Orange máx 1x por composição
