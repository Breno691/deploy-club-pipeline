---
name: remotion-best-practices
description: >
  Motion designer senior para vídeos cinematográficos de alta retenção com Remotion.
  Renderiza reels virais, vídeos educacionais, vídeos corporativos premium, kinetic
  typography e animações para Instagram, TikTok e YouTube Shorts. SEMPRE use quando:
  "render video", "renderizar video", "criar reel", "gerar mp4", "motion design",
  "animação", "reel viral", "vídeo cinematográfico", "kinetic typography", "vídeo
  corporativo", "storytelling visual", "before/after animado", "remotion-best-practices
  job", ou imediatamente após video-ad-specialist gerar ad_scenes.json. Do NOT use
  for writing scripts (use video-ad-specialist). Do NOT use for static images
  (use ad-creative-designer). Output: outputs/task_name_date/video/ad.mp4.
metadata:
  author: Deploy Club / SmartOps IA
  version: 2.0.0
  category: motion-design
  tags: [remotion, motion-design, reels, kinetic-typography, instagram, tiktok, youtube]
---

# Remotion Best Practices — Motion Designer Senior

Renderiza video ads cinematográficos e reels de alta retenção a partir de scene JSON. Disparado automaticamente após `video-ad-specialist`.

## Pipeline Position
- Roda **APÓS**: `video-ad-specialist` (automático)
- Depende de: `video/ad_scenes.json`
- Produz: `video/ad.mp4`

## CRITICAL: Princípios Invioláveis
1. Hook visual nos primeiros 3s — se não interrompe scroll, reescrever
2. Nenhum frame estático por >1,5s sem mudança visual
3. Todos os valores de cor via tokens `S.*` — nunca hex arbitrário
4. `visual` field no JSON é hint humano — ignorar no Remotion

---

## Step 1: Parse Scene JSON
```
outputs/<task_name>_<date>/video/ad_scenes.json
```
Extrair: `props.style`, `props.duration`, `props.platform`, `props.service`, `props.scenes`.

## Step 2: Parâmetros de Composição

| Platform | Width | Height | FPS |
|----------|-------|--------|-----|
| `instagram_reels` / `tiktok` / `youtube_shorts` | 1080 | 1920 | 30 |
| `youtube_horizontal` | 1920 | 1080 | 24 |
| `instagram_square` | 1080 | 1080 | 30 |

Default: `instagram_reels`.

## Step 3: Brand Tokens
```ts
const S = {
  bg: '#06060e', bg2: '#0d0d1c', bg3: '#13132a',
  fg: '#e8e8f0', muted: '#8b8baa',
  accent: '#7c3aed', accentL: '#a78bfa', accentC: '#c4b5fd',
  accentBorder: 'rgba(167,139,250,0.18)', accentGlow: 'rgba(124,58,237,0.18)',
  green: '#10b981', greenL: '#6ee7b7',
  whatsapp: '#25d366', star: '#fbbf24', error: '#f87171',
  border: 'rgba(255,255,255,0.07)',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};
const isLean = props.service === 'lean_six_sigma';
const accent = isLean ? S.accent : S.green;
const accentL = isLean ? S.accentL : S.greenL;
```

## Step 4: Animation Utilities
Funções base — implementações completas em `references/animation-library.md`:
```tsx
fadeIn(start, end)       // interpolate opacity 0→1
slideUp(start, end, dist) // translateY com easing
springScale(offset)      // spring com damping/stiffness
lineGrow(start, end, max) // width crescendo
counter(from, to, s, e)  // número animado
charReveal(text, start)  // kinetic text letra a letra
```

## Step 5: Scene Handlers

9 tipos válidos — código completo em `references/scene-components.md`:

| Tipo | Visual | Campos |
|------|--------|--------|
| `hook` | Glow radial + headline slide-up + linha crescendo | `text` |
| `problem` | Relógio girando + seta descendo + erro vermelho | `text` |
| `product` | DMAIC stagger (Lean) ou bot pulsando (Automação) | `text` |
| `benefit` | Bullets com checkmark em stagger | `text` (separar por `\n`) |
| `testimonial` | Citação com aspas decorativas + linha animada | `text`, `quote` |
| `offer` | Price badge com spring scale | `text`, `price`, `subtext` |
| `cta` | Seta ascendente + watermark | `text`, `subtext` |
| `comparison` | Split-screen Lado A vs B com fade sequencial | `sideA`, `sideB` |
| `before_after` | Clip-path reveal esquerda→direita | `before`, `after` |

**Transição padrão entre cenas:** cross-fade de 8 frames.

## Step 6: Render Command
```bash
npx remotion render remotion/src/index.ts AdVideo \
  "outputs/<task_name>_<date>/video/ad.mp4" \
  --props '{"style":"...","duration":15,"platform":"instagram_reels","service":"lean_six_sigma","scenes":[...]}'
```

Por formato:
```bash
# Reel 9:16
--width=1080 --height=1920 --fps=30
# YouTube 16:9
--width=1920 --height=1080 --fps=24
```

---

## Troubleshooting
- **"Cannot find module remotion":** `cd remotion && npm install`
- **durationInFrames positivo:** default 15s (450 frames) se duration ausente
- **TypeScript: scene type inválido:** válidos: hook, problem, product, benefit, testimonial, offer, cta, comparison, before_after
- **Grain não aparece:** SVG feTurbulence opcional — design funciona sem ele
- **Spring com escala negativa:** usar `Math.max(0, springScale(...))`

## Quality Checklist
- [ ] Parâmetros de composição corretos para a plataforma
- [ ] Tokens `S.*` usados (sem hex arbitrário)
- [ ] Service accent: roxo para Lean, esmeralda para Automação
- [ ] Hook interrompe scroll nos primeiros 3s
- [ ] Sem frame estático >1,5s
- [ ] Todos os 9 tipos de cena têm handlers
- [ ] `GrainOverlay` em backgrounds sólidos
- [ ] Render command com path correto `remotion/src/index.ts`
- [ ] Output em `outputs/<task_name>_<date>/video/ad.mp4`
- [ ] Sem conteúdo de Manutenção TI
