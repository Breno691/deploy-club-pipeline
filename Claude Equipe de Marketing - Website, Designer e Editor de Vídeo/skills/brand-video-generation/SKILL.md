---
name: brand-video-generation
description: >
  Gera video content brand-compliant para Deploy Club usando Remotion — reels 9:16
  para Instagram e TikTok, carrosséis animados 4:5, YouTube intros 16:9, e motion
  graphics. Ativa quando o usuário pedir: "cria um reel", "gera vídeo de campanha",
  "faz intro para YouTube", "cria carrossel animado", "gera motion graphic",
  "reel para Instagram", "vídeo de 30 segundos", "animação de marca". Sempre valida
  brand knowledge e motion tokens antes de qualquer render. Usa apenas tokens DLS
  via src/tokens/dls.ts — nunca valores hardcoded. Do NOT use for static images or
  copy — use brand-creatives-design instead.
metadata:
  author: Deploy Club
  version: 1.0.0
  category: brand-video
  tags: [deploy-club, remotion, video, reels, motion, instagram, youtube]
---

# Brand Video Generation

Gera vídeo programático brand-compliant para Deploy Club via Remotion. Cada frame segue a mesma disciplina de tokens dos criativos estáticos.

## CRITICAL: Validar Antes de Qualquer Render

Antes de gerar qualquer composição, leia:
1. `brand knowledge/DEPLOY CLUB DLS.md` → seção "Primitivos de Motion / Vídeo"
2. `brand knowledge/DEPLOY CLUB - Brand Identity.md` → seção "Visual Identity"
3. `references/motion-tokens.md` (se disponível)

Nunca use valores hardcoded. Todo frame deve referenciar tokens via `src/tokens/dls.ts`.

---

## Step 1: Identificar Formato de Vídeo

| Formato | Dimensões | FPS | Uso |
|---------|-----------|-----|-----|
| **Instagram Reel / TikTok** | 1080×1920 (9:16) | 30fps | Conteúdo short-form viral |
| **Instagram Feed / Carrossel animado** | 1080×1350 (4:5) | 30fps | Posts de feed com motion |
| **YouTube Intro** | 1280×720 (16:9) | 24fps | Abertura de vídeo editorial |
| **YouTube Short** | 1080×1920 (9:16) | 30fps | Short-form para YouTube |
| **Motion Graphic** | Customizado | 30fps | Animações standalone |

Token de referência: `social-ratio-story` (9:16), `social-ratio-feed` (4:5), `social-ratio-thumb` (16:9)

---

## Step 2: Aplicar Motion Tokens

### Frame Rate
```typescript
// src/tokens/dls.ts
export const motionFpsStandard = 30;    // reels, stories, carrosséis
export const motionFpsCinematic = 24;   // YouTube intros, editorial premium
```

### Durações de Transição (@30fps)
```typescript
export const motionDurationFade = 20;   // 0.67s — fade in/out entre elementos
export const motionDurationSlide = 15;  // 0.50s — entrada por deslize
export const motionDurationHold = 90;   // 3.0s  — permanência mínima de texto
export const motionDurationScene = 150; // 5.0s  — duração padrão de cena
```

### Easing Curves
```typescript
export const motionEasingEnter = 'cubic-bezier(0.25, 0.1, 0.25, 1.0)';    // entrada suave
export const motionEasingExit = 'cubic-bezier(0.55, 0.0, 1.0, 0.45)';     // saída
export const motionEasingEmphasis = 'cubic-bezier(0.0, 0.0, 0.2, 1.0)';   // destaque / CTA
```

### Safe Zones
```typescript
export const motionSafeZone = 48;        // px — margem interna (igual social-margin)
export const motionSafeZoneBottom = 120; // px — zona inferior ampliada (UI de plataforma)
```

---

## Step 3: Tokens de Cor e Tipografia para Vídeo

### Cores (via dls.ts)
```typescript
export const colors = {
  studioWhite: '#FAF8F4',     // background padrão claro
  cream: '#F5F0E8',           // cards, superfícies secundárias
  parchment: '#E8DFD3',       // bordas sutis
  stoneTaupe: '#8D7B68',      // metadata, labels
  coffee: '#5C3D2E',          // slides de accent, CTA bg
  coffeeDark: '#3D2B1F',      // alto contraste
  espresso: '#2C1810',        // texto primário, bg escuro
  terracotta: '#AC5B30',      // accent primário, labels
  terracottaClay: '#C47A52',  // accent secundário, destaques
  blush: '#D4A589',           // hover suave
  claudeOrange: '#DA7756',    // CTA — máx 1x por composição, fade in nunca flash
};
```

### Tipografia para vídeo
```typescript
export const fonts = {
  display: 'Playfair Display', // headlines — a assinatura visual
  body: 'DM Sans',             // texto de apoio, copy
  ui: 'JetBrains Mono',        // labels ALL CAPS, valores técnicos
};
```

---

## Step 4: Estrutura de Composição Remotion

### Template base de composição
```tsx
// src/compositions/BrandVideo.tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { colors, fonts, motionDurationFade, motionEasingEnter } from '../tokens/dls';

export const BrandVideo: React.FC<VideoProps> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.espresso }}>
      <GrainOverlay opacity={0.06} frame={frame} />
      {scenes.map((scene, i) => (
        <Scene key={i} scene={scene} frame={frame} fps={fps} />
      ))}
    </AbsoluteFill>
  );
};
```

### Grain Overlay (obrigatório em todos os backgrounds sólidos)
```tsx
const GrainOverlay: React.FC<{ opacity: number; frame: number }> = ({ opacity, frame }) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `url("data:image/svg+xml,...")`,
      // seed varia por frame para grain animado sutil
    }}
  />
);
```

---

## Step 5: Padrões de Cena por Tipo de Vídeo

### 5A — Instagram Reel (9:16, 30fps, ~15s)

Estrutura narrativa padrão:
```
Cena 1 — Hook (0–3s / frames 0–90)
  bg: color-espresso
  headline: Playfair Display 700, color-cream
  tipo: pergunta provocativa ou número forte

Cena 2 — Problema (3–7s / frames 90–210)
  bg: color-coffee
  corpo: DM Sans 500, color-cream
  tipo: dor do público, alternativa ruim

Cena 3 — Produto / Solução (7–12s / frames 210–360)
  bg: color-cream
  headline: Playfair Display 600, color-espresso
  detalhe: JetBrains Mono, color-terracotta
  tipo: o que é, número específico, prova

Cena 4 — CTA (12–15s / frames 360–450)
  bg: color-coffee
  headline grande: Playfair Display 700, color-cream
  cta element: color-claude-orange (ÚNICA vez por composição)
```

### 5B — YouTube Intro (16:9, 24fps, ~5s)

```
Frames 0–20: Fade in logo (color-espresso bg, logo em color-cream)
Frames 20–80: Reveal headline (type-display-xl, slide easing)
Frames 80–120: Tagline aparece (type-body-lg, DM Sans)
Frames 120–150: Hold + fade out suave
```

### 5C — Carrossel Animado (4:5, 30fps)

```
Cada slide: motionDurationScene (150 frames / 5s)
Transição entre slides: motionDurationSlide (15 frames)
Elementos internos: fade in com motionDurationFade (20 frames)
Texto: hold mínimo de motionDurationHold (90 frames) para legibilidade
```

---

## Step 6: Gerar Arquivo de Composição

Para cada vídeo solicitado, gere:

1. **`src/compositions/[NomeComposicao].tsx`** — componente React/Remotion completo
2. **`src/tokens/dls.ts`** — tokens exportados (se não existir)
3. **`remotion.config.ts`** — configuração com formato correto

### Exemplo de config
```typescript
// remotion.config.ts
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Para reel 9:16:
// npx remotion render BrandReel --width=1080 --height=1920 --fps=30
```

---

## Step 7: Validar Antes de Entrar em Render

Checklist de validação:
- [ ] Brand knowledge carregado (DLS motion tokens, Brand Identity)
- [ ] Todos os valores de cor via `colors.tokenName` de `dls.ts` (nunca hex literal)
- [ ] Grain overlay presente em todos os backgrounds sólidos (5–8% opacity)
- [ ] `claude-orange` aparece no máximo uma vez por composição — fade in, nunca flash
- [ ] Texto na tela no mínimo 90 frames (3s) — `motionDurationHold`
- [ ] Sem efeitos bounce, elastic ou spring nas transições
- [ ] Sem blur animado, glow ou partículas
- [ ] Safe zone respeitada (48px geral, 120px inferior para reels)
- [ ] FPS correto: 30fps para social, 24fps para YouTube editorial
- [ ] Background escuro usa `color-espresso`, nunca `#000000`
- [ ] Background claro usa `color-studio-white` ou `color-cream`, nunca `#FFFFFF`
- [ ] Validar contra "What We Are Not" do Brand Identity

---

## Step 8: Comando de Render

Após gerar a composição, fornecer o comando exato:

```bash
# Reel Instagram / TikTok
npx remotion render [CompositionId] out/reel.mp4 \
  --width=1080 --height=1920 --fps=30

# YouTube Intro
npx remotion render [CompositionId] out/youtube_intro.mp4 \
  --width=1280 --height=720 --fps=24

# Carrossel Feed Instagram
npx remotion render [CompositionId] out/carousel.mp4 \
  --width=1080 --height=1350 --fps=30
```

---

## Exemplos

### Exemplo 1: "Cria um reel de 15s para promover o Kit Definitivo"

**Ação:** Gerar composição 9:16, 30fps, 450 frames
**Estrutura:**
- Cena 1 (hook): "Você ainda constrói do zero?" — Playfair Display 700, bg espresso
- Cena 2 (problema): "3h30 montando workflow. 8 minutos com Claude Code." — bg coffee
- Cena 3 (produto): "88 templates. Por R$47." — bg cream, destaque terracotta
- Cena 4 (CTA): "Copia e cola." — bg coffee, CTA em claude-orange (única vez)

### Exemplo 2: "Gera um YouTube intro de 5 segundos"

**Ação:** Composição 16:9, 24fps, 120 frames
**Estrutura:** Logo fade in → headline slide → tagline → fade out

### Exemplo 3: "Cria carrossel animado com 4 slides sobre Claude Code"

**Ação:** 4 cenas × 150 frames + transições de 15 frames = 645 frames total
**Alternância:** cream → espresso → cream → coffee (CTA)

---

## Troubleshooting

### Render falha com erro de fonte
**Causa:** Fontes não carregadas no ambiente Remotion
**Solução:** Adicionar ao `Root.tsx`:
```tsx
import { loadFont } from '@remotion/google-fonts/PlayfairDisplay';
loadFont();
```

### Texto ilegível no reel
**Causa:** Texto muito pequeno para o viewport 9:16 ou muito próximo da borda inferior
**Solução:** Verificar safe zone (48px) e safe zone inferior (120px). Aumentar font-size para no mínimo 48px em displays de reel.

### Grain overlay não aparece
**Causa:** SVG inline pode não renderizar no Chromium do Remotion
**Solução:** Use canvas-based noise ou PNG de grain importado como static asset.

### Claude Orange piscando em vez de fade in
**Causa:** Transição brusca (opacity 0→1 em 1 frame)
**Solução:** Use `interpolate(frame, [start, start + motionDurationFade], [0, 1])` com `motionEasingEnter`.

---

## Quality Checklist Final

- [ ] Formato e dimensões corretos para a plataforma
- [ ] Todos os tokens via dls.ts (zero hex literal)
- [ ] Grain overlay em todos os backgrounds sólidos
- [ ] Texto on-screen por mínimo 90 frames
- [ ] Claude Orange máx 1x, com fade in
- [ ] Safe zones respeitadas
- [ ] Transições suaves (editorial, nunca bouncy)
- [ ] Validado contra Brand Identity checklist
