# ***Deploy Club Design Language System — Guia de Primitivos***

*DLS Primitives · v1.0 · Referência Interna*

---

**Artefato Visual:** https://claude.ai/public/artifacts/b5f61b43-60b0-46dc-97b3-55841ae6c1c8
## ***Visão Geral***

*Primitivos são os design tokens fundamentais que mantêm a marca Deploy Club consistente em todas as superfícies — conteúdo digital, redes sociais, páginas de vendas, materiais da comunidade e interfaces de curso. Eles codificam cor, tipografia e ritmo de espaçamento numa única fonte de verdade.*

*Primitivos são **variáveis globais** definidas no codebase e no design system. Alterar o valor de um token propaga a mudança em toda superfície de produto. Sobrescrever primitivos localmente não é recomendado — cria fragmentação e não herdará futuras atualizações da marca.*

***Nota:** Ao iniciar um novo projeto, copie o artboard de primitivos do Deploy Club para ter todos os tokens prontos. Nunca introduza valores ad-hoc; se um token não existe para o seu caso de uso, abra uma proposta no DLS.*

---

## ***Tipografia***

*O sistema tipográfico do Deploy Club usa três typefaces distintas, cada uma com um papel fixo. Não substitua nem cruze a aplicação delas.*

| *Token* | *Typeface* | *Weight* | *Papel* |
| ----- | ----- | ----- | ----- |
| *`type-display-xl`* | *Playfair Display* | *Bold (700)* | *Hero de campanha, headlines full-bleed, capas de carrossel* |
| *`type-display-lg`* | *Playfair Display* | *SemiBold (600)* | *Títulos de seção, aberturas editoriais, headers de slide* |
| *`type-display-md`* | *Playfair Display* | *Medium (500)* | *Sub-headers, pull quotes, títulos de card* |
| *`type-body-lg`* | *DM Sans* | *Medium (500)* | *Parágrafos de abertura, feature copy, text overlays em VSL* |
| *`type-body-md`* | *DM Sans* | *Regular (400)* | *Body padrão, descrições de produto, conteúdo de curso* |
| *`type-body-sm`* | *DM Sans* | *Regular (400)* | *Texto de apoio, footnotes, legendas* |
| *`type-ui-label`* | *JetBrains Mono* | *Medium (500)* | *Labels de seção, tags, itens de nav — ALL CAPS, tracked +2px* |
| *`type-ui-value`* | *JetBrains Mono* | *Regular (400)* | *Preços, metadata, code snippets, valores de dados* |
| *`type-ui-micro`* | *JetBrains Mono* | *Medium (500)* | *Jurídico, texto miúdo, timestamps, números de versão — ALL CAPS* |

***Regras:***

* *Playfair Display carrega o peso da marca — é a assinatura visual em toda headline*
* *DM Sans nunca é usada em headlines — sempre Playfair Display para impacto, DM Sans para legibilidade*
* *Labels em JetBrains Mono são sempre ALL CAPS com letter-spacing +2–3px; valores de código ficam em lowercase*
* *Hierarquia em headlines é criada por tamanho e contraste de cor, não por variação de weight*
* *Nunca introduza uma quarta typeface — abra uma proposta no DLS se houver uma lacuna*
* *Nunca use fontes genéricas (Arial, Inter, Roboto, system fonts) — matam a marca instantaneamente*

---

## ***Cor***

*Cores são organizadas em pares **Default → Subtle** (uso primário → tint / uso de background). Sempre referencie um token nomeado; nunca use um valor hex solto na implementação.*

### ***Neutrals — Par Primário de Trabalho***

| *Token* | *Nome* | *Hex* | *Uso* |
| ----- | ----- | ----- | ----- |
| *`color-studio-white`* | *Studio White* | *`#FAF8F4`* | *Background primário — todas as superfícies digitais* |
| *`color-cream`* | *Cream* | *`#F5F0E8`* | *Background secundário, superfícies de card, hover states* |
| *`color-parchment`* | *Parchment* | *`#E8DFD3`* | *Bordas, divisores, separadores, linhas de tabela* |
| *`color-warm-sand`* | *Warm Sand* | *`#C4B5A3`* | *Elementos terciários, bordas sutis, disabled states* |
| *`color-stone-taupe`* | *Stone Taupe* | *`#8D7B68`* | *Metadata, labels, texto secundário, timestamps* |
| *`color-coffee`* | *Coffee* | *`#5C3D2E`* | *Texto de corpo, headings secundários* |
| *`color-coffee-dark`* | *Coffee Dark* | *`#3D2B1F`* | *Texto escuro rico, contextos de alto contraste* |
| *`color-espresso`* | *Espresso* | *`#2C1810`* | *Texto primário, logo em fundos claros, sidebar dark* |

### ***Accent — Terracotta***

| *Token* | *Nome* | *Hex* | *Uso* |
| ----- | ----- | ----- | ----- |
| *`color-terracotta-deep`* | *Terracotta Deep* | *`#8B3A2F`* | *Error states, alertas críticos — também funciona como accent escuro* |
| *`color-terracotta`* | *Terracotta* | *`#AC5B30`* | *Accent primário — labels de seção, texto destacado, active states* |
| *`color-terracotta-clay`* | *Terracotta Clay* | *`#C47A52`* | *Accent secundário — elementos numerados, barras de progresso, icon fills* |
| *`color-blush`* | *Blush* | *`#D4A589`* | *Apenas tint — nunca texto, nunca interativo. Backgrounds de hover, cards suaves* |

### ***Accent — Claude Brand***

| *Token* | *Nome* | *Hex* | *Uso* |
| ----- | ----- | ----- | ----- |
| *`color-claude-orange`* | *Claude Orange* | *`#DA7756`* | *Brand accent — CTAs, notas importantes, com parcimônia. No máximo uma vez por composição* |
| *`color-claude-warm`* | *Claude Warm* | *`#E8956E`* | *Tint do Claude — pares de gradient com Orange, hover em elementos Orange* |

### ***Functional — UI States***

| *Token* | *Nome* | *Hex* | *Uso* |
| ----- | ----- | ----- | ----- |
| *`color-ui-success`* | *Success* | *`#4A6741`* | *Confirmação, estados completos, feedback positivo* |
| *`color-ui-warning`* | *Warning* | *`#B8860B`* | *Alertas de cautela, limites se aproximando* |
| *`color-ui-error`* | *Error* | *`#8B3A2F`* | *Erros, ações destrutivas — compartilha Terracotta Deep* |
| *`color-ui-info`* | *Info* | *`#5C3D2E`* | *Estados informativos — compartilha Coffee* |
| *`color-ui-interactive`* | *Espresso* | *`#2C1810`* | *Cor padrão de interação / link* |
| *`color-ui-interactive-hover`* | *Coffee Dark* | *`#3D2B1F`* | *Hover e active states* |
| *`color-ui-disabled`* | *Warm Sand* | *`#C4B5A3`* | *Texto e elementos desabilitados* |
| *`color-ui-border`* | *Parchment* | *`#E8DFD3`* | *Bordas de input, divisores* |
| *`color-ui-focus`* | *Claude Orange* | *`#DA7756`* | *Focus rings — apenas acessibilidade* |

***Regras de Cor:***

* *`color-studio-white` é o background canônico claro — nunca use branco puro (`#FFFFFF`)*
* *`color-espresso` é o background canônico escuro — nunca use preto puro (`#000000`)*
* *`color-claude-orange` aparece no máximo uma vez por composição e nunca como background fill*
* *Variantes subtle (Blush, Claude Warm) são apenas backgrounds e tints — nunca aplique como cor de texto*
* *Todos os interactive states devem usar o token `-hover` designado, não um opacity ou darken manual*
* *Cores de UI state reutilizam tokens da paleta (Error = Terracotta Deep, Info = Coffee) para manter a paleta fechada*
* *Nunca adicione cores novas sem aprovação do DLS — a paleta é intencionalmente fechada e terrosa*

---

## ***Espaçamento***

*O espaçamento segue um **grid base-8**. Todos os valores são múltiplos de 8, com uma exceção micro de 4px para contextos de ícones e elementos inline. Sempre use um token nomeado — nunca use valores arbitrários em pixels.*

| *Token* | *Valor* | *Uso* |
| ----- | ----- | ----- |
| *`space-none`* | *0px* | *Zero explícito — use ao sobrescrever espaçamento herdado* |
| *`space-micro`* | *4px* | *Padding de ícone, gaps de elemento inline, separações mínimas* |
| *`space-xs`* | *8px* | *UI densa — gaps de tag, itens de lista compacta, ícone-para-label* |
| *`space-sm`* | *16px* | *Padding interno padrão de componentes* |
| *`space-md`* | *24px* | *Gap padrão entre componentes* |
| *`space-std`* | *32px* | *Separação de seção dentro de uma view, padding de coluna* |
| *`space-lg`* | *48px* | *Seções maiores de layout, respiro editorial* |
| *`space-xl`* | *64px* | *Whitespace de nível de página, seções hero* |
| *`space-2xl`* | *96px* | *Espaçamento editorial fullscreen — apenas layouts de campanha* |

***Regras de Espaçamento:***

* *Padding interno padrão para componentes de UI é `space-sm` (16px)*
* *Gap padrão entre componentes é `space-md` (24px)*
* *`space-lg` e acima são tokens de layout — não use dentro de um componente*
* *Ritmo vertical entre elementos de texto: `space-xs` (8px) entre linhas, `space-sm` (16px) entre blocos*
* *`space-2xl` é reservado para layouts editoriais full-bleed — nunca em UI*
* *Carrosséis de Instagram usam `space-lg` (48px) como margem externa para respiro consistente*

---

## ***Usando Primitivos no Código***

*Referencie tokens via CSS custom properties. Nunca hardcode valores.*

```css
/* Cor */
background-color: var(--color-studio-white);
color: var(--color-espresso);
border-color: var(--color-ui-border);
accent-color: var(--color-claude-orange);

/* Tipografia */
font-family: var(--type-display-xl-family);   /* Playfair Display */
font-size: var(--type-display-xl-size);
line-height: var(--type-display-xl-leading);

font-family: var(--type-body-md-family);       /* DM Sans */
font-size: var(--type-body-md-size);
line-height: var(--type-body-md-leading);

font-family: var(--type-ui-label-family);      /* JetBrains Mono */
font-size: var(--type-ui-label-size);
text-transform: var(--type-ui-label-case);     /* uppercase */
letter-spacing: var(--type-ui-label-tracking); /* 2px */

/* Espaçamento */
padding: var(--space-sm);
gap: var(--space-md);
margin-top: var(--space-lg);
```

*Qualquer componente que contorne um primitivo cria risco de fragmentação. Futuras atualizações da marca — um ajuste no warmth do Studio White, uma mudança no grid de espaçamento, uma nova cor de produto Claude — não vão propagar para valores hardcoded.*

---

## ***Primitivos de Redes Sociais***

*Tokens adicionais específicos para Instagram, YouTube e criativos de anúncio.*

| *Token* | *Valor* | *Uso* |
| ----- | ----- | ----- |
| *`social-ratio-feed`* | *4:5 (1080×1350)* | *Posts de feed do Instagram, carrosséis* |
| *`social-ratio-story`* | *9:16 (1080×1920)* | *Stories, Reels, TikTok* |
| *`social-ratio-thumb`* | *16:9 (1280×720)* | *Thumbnails do YouTube* |
| *`social-bg-light`* | *`color-cream`* | *Background padrão de carrossel — variante clara* |
| *`social-bg-dark`* | *`color-espresso`* | *Background padrão de carrossel — variante escura* |
| *`social-bg-mid`* | *`color-coffee`* | *Slides de accent — calendário, CTA, seções "Olha só:"* |
| *`social-headline`* | *`type-display-lg`* | *Capa de carrossel e slides-chave — Playfair Display 600* |
| *`social-body`* | *`type-body-lg`* | *Texto de corpo em social — DM Sans 500* |
| *`social-label`* | *`type-ui-label`* | *Tags, datas, micro-copy — JetBrains Mono ALL CAPS* |
| *`social-margin`* | *`space-lg` (48px)* | *Zona segura externa para todos os formatos sociais* |

***Regras de Social:***

* *Slides de capa usam background `color-cream` com headline `color-espresso` em Playfair Display*
* *Slides de conteúdo alternam entre backgrounds `color-espresso` (escuro) e `color-cream` (claro)*
* *Slides escuros usam `color-cream` ou `color-warm-sand` para texto — nunca branco puro*
* *Bullets e destaques em slides escuros usam blocos de background `color-terracotta-clay`*
* *Slides de CTA usam background `color-coffee` com texto grande em Playfair Display na cor `color-cream`*
* *Nunca use gradients, drop shadows ou efeitos de glow em conteúdo social*
* *Grain overlay a 5–8% de opacidade é aplicado em todos os backgrounds sólidos*

---

## ***Primitivos de Motion / Vídeo***

*Tokens de movimento que governam toda produção de vídeo programático via Remotion. Mesma filosofia dos primitivos estáticos: referencie um token nomeado, nunca um valor arbitrário.*

### ***Frame Rate***

| *Token* | *Valor* | *Uso* |
| ----- | ----- | ----- |
| *`motion-fps-standard`* | *30fps* | *Frame rate padrão — reels, stories, carrosséis animados* |
| *`motion-fps-cinematic`* | *24fps* | *Conteúdo editorial premium, YouTube intros* |

### ***Duração de Transições***

| *Token* | *Valor (@30fps)* | *Uso* |
| ----- | ----- | ----- |
| *`motion-duration-fade`* | *20 frames (0.67s)* | *Fade in/out padrão entre elementos* |
| *`motion-duration-slide`* | *15 frames (0.5s)* | *Entrada de elementos por deslize* |
| *`motion-duration-hold`* | *90 frames (3.0s)* | *Tempo mínimo de permanência de texto para legibilidade* |
| *`motion-duration-scene`* | *150 frames (5.0s)* | *Duração padrão de uma cena/slide individual* |

### ***Easing Curves***

| *Token* | *Valor* | *Uso* |
| ----- | ----- | ----- |
| *`motion-easing-enter`* | *cubic-bezier(0.25, 0.1, 0.25, 1.0)* | *Entrada de elementos — suave, editorial* |
| *`motion-easing-exit`* | *cubic-bezier(0.55, 0.0, 1.0, 0.45)* | *Saída de elementos* |
| *`motion-easing-emphasis`* | *cubic-bezier(0.0, 0.0, 0.2, 1.0)* | *Momentos de destaque, CTA* |

### ***Safe Zones de Vídeo***

| *Token* | *Valor* | *Uso* |
| ----- | ----- | ----- |
| *`motion-safe-zone`* | *`space-lg` (48px)* | *Margem segura interna — idêntica a `social-margin`* |
| *`motion-safe-zone-bottom`* | *120px* | *Zona inferior ampliada para reels (UI de plataforma cobre)* |

***Regras de Motion:***

* *Transições são sempre suaves e editoriais — nunca bouncy, elastic ou spring*
* *Grain overlay animado (variação sutil de seed por frame) a 5–8% de opacidade em backgrounds sólidos*
* *Texto deve permanecer na tela pelo menos `motion-duration-hold` para legibilidade*
* *Sem efeitos de glow, blur animado, ou partículas — a tipografia é o protagonista*
* *Claude Orange animado (fade in, não flash) e no máximo uma vez por composição*
* *Backgrounds escuros usam `color-espresso`, nunca preto puro — mesma regra dos estáticos*
* *Radial gradient terroso sutil pode ser animado em backgrounds escuros para profundidade*

---

## ***Governança***

*Primitivos são mantidos por Vinícius Guimarães e pelo design system do Deploy Club. Para propor um novo token ou alterar um valor existente:*

1. *Documente o caso de uso e por que nenhum token existente cobre a necessidade*
2. *Mostre todas as superfícies e componentes afetados (social, web, curso, comunidade)*
3. *Inclua comparações visuais antes/depois*
4. *Obtenha aprovação do Vinícius antes da implementação*

*Mudanças em primitivos afetam toda superfície de produto simultaneamente. Trate com o mesmo rigor de uma mudança de infraestrutura core.*

*A paleta é intencionalmente fechada. "Acho que ficaria legal um azulzinho aqui" não é uma proposta de DLS — é uma tentação. Resista.*

---

*Deploy Club Design Language System · DLS Primitives · Uso interno — referência para toda produção de conteúdo e produto.*
