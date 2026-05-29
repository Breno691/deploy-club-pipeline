# DLS Tokens — Deploy Club Design Language System

Referência completa de tokens para uso em CSS, code e specs de componentes.
Derivados de `brand knowledge/DEPLOY CLUB DLS.md` v1.0.

---

## CSS Custom Properties — Arquivo Completo

```css
/* Deploy Club Design Language System — CSS Custom Properties
   Gerado de DEPLOY CLUB DLS.md v1.0
   Uso: @import ou copiar para :root do projeto */

:root {
  /* ========================================
     COLORS — Neutrals
     ======================================== */
  --color-studio-white: #FAF8F4;   /* Background primário — NUNCA usar #FFF */
  --color-cream: #F5F0E8;          /* Background secundário, cards, hover */
  --color-parchment: #E8DFD3;      /* Bordas, divisores, separadores */
  --color-warm-sand: #C4B5A3;      /* Elementos terciários, disabled */
  --color-stone-taupe: #8D7B68;    /* Metadata, labels, texto secundário */
  --color-coffee: #5C3D2E;         /* Texto de corpo, headings secundários */
  --color-coffee-dark: #3D2B1F;    /* Texto escuro rico, alto contraste */
  --color-espresso: #2C1810;       /* Texto primário, logo, sidebar dark */

  /* ========================================
     COLORS — Accent Terracotta
     ======================================== */
  --color-terracotta-deep: #8B3A2F;   /* Error states, alertas críticos */
  --color-terracotta: #AC5B30;        /* Accent primário — labels, destaques */
  --color-terracotta-clay: #C47A52;   /* Accent secundário — números, barras */
  --color-blush: #D4A589;             /* Apenas backgrounds hover — nunca texto */

  /* ========================================
     COLORS — Claude Brand
     ======================================== */
  --color-claude-orange: #DA7756;  /* CTA — máx 1x por composição */
  --color-claude-warm: #E8956E;    /* Gradient pair, hover em elements orange */

  /* ========================================
     COLORS — UI States
     ======================================== */
  --color-ui-success: #4A6741;
  --color-ui-warning: #B8860B;
  --color-ui-error: #8B3A2F;       /* = terracotta-deep */
  --color-ui-info: #5C3D2E;        /* = coffee */
  --color-ui-interactive: #2C1810; /* = espresso */
  --color-ui-interactive-hover: #3D2B1F; /* = coffee-dark */
  --color-ui-disabled: #C4B5A3;    /* = warm-sand */
  --color-ui-border: #E8DFD3;      /* = parchment */
  --color-ui-focus: #DA7756;       /* = claude-orange — apenas focus rings */

  /* ========================================
     TYPOGRAPHY — Families
     ======================================== */
  --font-display: 'Playfair Display', serif;
  --font-body: 'DM Sans', sans-serif;
  --font-ui: 'JetBrains Mono', monospace;

  /* ========================================
     TYPOGRAPHY — Display Tokens
     ======================================== */
  --type-display-xl-family: 'Playfair Display', serif;
  --type-display-xl-weight: 700;
  --type-display-xl-size: 72px;
  --type-display-xl-leading: 1.0;

  --type-display-lg-family: 'Playfair Display', serif;
  --type-display-lg-weight: 600;
  --type-display-lg-size: 52px;
  --type-display-lg-leading: 1.05;

  --type-display-md-family: 'Playfair Display', serif;
  --type-display-md-weight: 500;
  --type-display-md-size: 36px;
  --type-display-md-leading: 1.1;

  /* ========================================
     TYPOGRAPHY — Body Tokens
     ======================================== */
  --type-body-lg-family: 'DM Sans', sans-serif;
  --type-body-lg-weight: 500;
  --type-body-lg-size: 18px;
  --type-body-lg-leading: 1.55;

  --type-body-md-family: 'DM Sans', sans-serif;
  --type-body-md-weight: 400;
  --type-body-md-size: 16px;
  --type-body-md-leading: 1.6;

  --type-body-sm-family: 'DM Sans', sans-serif;
  --type-body-sm-weight: 400;
  --type-body-sm-size: 13px;
  --type-body-sm-leading: 1.5;

  /* ========================================
     TYPOGRAPHY — UI Tokens
     ======================================== */
  --type-ui-label-family: 'JetBrains Mono', monospace;
  --type-ui-label-weight: 500;
  --type-ui-label-size: 11px;
  --type-ui-label-case: uppercase;
  --type-ui-label-tracking: 2px;

  --type-ui-value-family: 'JetBrains Mono', monospace;
  --type-ui-value-weight: 400;
  --type-ui-value-size: 14px;

  --type-ui-micro-family: 'JetBrains Mono', monospace;
  --type-ui-micro-weight: 500;
  --type-ui-micro-size: 10px;
  --type-ui-micro-case: uppercase;
  --type-ui-micro-tracking: 1.5px;

  /* ========================================
     SPACING — Base-8 Grid
     ======================================== */
  --space-none: 0px;
  --space-micro: 4px;    /* Padding de ícone, inline */
  --space-xs: 8px;       /* UI densa, gaps de tag */
  --space-sm: 16px;      /* Padding interno padrão */
  --space-md: 24px;      /* Gap padrão entre componentes */
  --space-std: 32px;     /* Separação dentro de uma view */
  --space-lg: 48px;      /* Seções, respiro editorial, social margin */
  --space-xl: 64px;      /* Whitespace de página, hero */
  --space-2xl: 96px;     /* Apenas layouts de campanha full-bleed */

  /* ========================================
     SOCIAL — Primitivos de Redes Sociais
     ======================================== */
  --social-bg-light: #F5F0E8;      /* = color-cream */
  --social-bg-dark: #2C1810;       /* = color-espresso */
  --social-bg-mid: #5C3D2E;        /* = color-coffee — CTA slides */
  --social-margin: 48px;           /* = space-lg — zona segura externa */
}
```

---

## Guia de Uso Rápido

### Background de página
```css
body { background-color: var(--color-studio-white); }
```

### Texto primário
```css
p { color: var(--color-espresso); font-family: var(--font-body); }
```

### Headline de campanha
```css
h1 {
  font-family: var(--font-display);
  font-weight: var(--type-display-xl-weight);
  font-size: var(--type-display-xl-size);
  color: var(--color-espresso);
}
```

### Label UI
```css
.label {
  font-family: var(--font-ui);
  font-size: var(--type-ui-label-size);
  font-weight: var(--type-ui-label-weight);
  text-transform: var(--type-ui-label-case);
  letter-spacing: var(--type-ui-label-tracking);
  color: var(--color-terracotta);
}
```

### CTA Button
```css
.cta-button {
  background-color: var(--color-claude-orange); /* máx 1x por página */
  color: var(--color-studio-white);
  font-family: var(--font-body);
  font-weight: 500;
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
}
.cta-button:hover {
  background-color: var(--color-terracotta);
}
```

### Card
```css
.card {
  background-color: var(--color-cream);
  border: 1px solid var(--color-parchment);
  padding: var(--space-sm);
  border-radius: 8px;
}
```

---

## Regras de Uso Rígidas

| Regra | Correto | Errado |
|-------|---------|--------|
| Background claro | `var(--color-studio-white)` | `#ffffff` |
| Background escuro | `var(--color-espresso)` | `#000000` |
| Claude Orange | 1x por composição, nunca background fill | múltiplas vezes |
| Blush | Apenas backgrounds e tints | como cor de texto |
| Fontes | Playfair / DM Sans / JetBrains Mono | Arial, Inter, Roboto |
| Valores inline | Nunca — sempre `var(--token)` | `color: #AC5B30` |
