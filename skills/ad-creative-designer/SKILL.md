---
name: ad-creative-designer
description: >
  Generates static image ad creatives for SmartOps IA campaigns (Lean Six Sigma
  and Automacao com IA only — never Manutencao TI). ALWAYS use when user says
  "create an image ad", "design a static ad", "make an Instagram ad", "generate
  ad creative", "criar criativo", "fazer ad de imagem", "gerar ad estatico",
  "criar anuncio para Instagram", or when ad_creative_designer job runs in the
  pipeline. Two-script process: (1) calls scripts/generate_ad.js which uses
  the Claude API with research outputs and knowledge files to generate layout.json
  and ad.html; (2) calls scripts/render_ad.js to capture a 1080x1080 PNG via
  Playwright. Uses SmartOps IA dark theme: bg #06060e, accent purple #7c3aed
  for Lean or green #10b981 for Automacao. Outputs to outputs/task_name_date/ads/.
---

# Ad Creative Designer

Generates static image ad creatives for SmartOps IA using the Claude API to design and the Playwright to render.

## When to Use This Skill

- Orchestrator pipeline runs `ad_creative_designer` job
- User says "create image ad", "design ad", "criar criativo", "gerar ad para Instagram"
- User specifies Lean Six Sigma or Automação com IA ad format

## Step 1: Read Context Files

```
knowledge/brand_identity.md      — SmartOps IA colors, fonts, layout patterns
knowledge/product_campaign.md    — services (Lean + Automação only), selling points
knowledge/platform_guidelines.md — size specs and design rules per platform
outputs/<task_name>_<date>/research_results.json — if available: hooks, angles, keywords
```

## Step 2: Determine Service Color Scheme

Before generating, identify which service this ad promotes:

| Service | Primary | Light | Background |
|---|---|---|---|
| Lean Six Sigma | `#7c3aed` | `#a78bfa` / `#c4b5fd` | `rgba(124,58,237,0.12)` |
| Automação com IA | `#10b981` | `#6ee7b7` | `rgba(16,185,129,0.10)` |
| Combined / Brand | `#7c3aed` | `#a78bfa` | `#0d0d1c` |

Default: use the service most relevant to the campaign research angle.

## Step 3: Select Layout Template

Choose from these three templates:

### `lean_focus` (Lean Six Sigma ads)
Left side: headline + DMAIC step or 8 waste label + metric + CTA
Right side: process flow visualization or before/after data
Background: `#06060e` with subtle purple glow

### `automation_focus` (Automação com IA ads)
Left side: problem statement (WhatsApp chaos / manual process)
Right side: bot/automation visual with `#10b981` glow
Background: `#0d0d1c` with emerald accent

### `proof_card` (Testimonial / case result ads)
Centered layout — quote in large italic, result metric prominent, attribution below
Background: `#06060e`, testimonial card in `#0d0d1c` with border `rgba(255,255,255,.07)`

Default to `lean_focus` for Lean campaigns, `automation_focus` for Automação.

## Step 4: Run generate_ad.js

This script calls the Claude API with full brand context to generate layout.json + ad.html:

```bash
node scripts/generate_ad.js --task <task_name> --date <task_date>
```

The script sends to Claude API:
- `knowledge/brand_identity.md` (colors, layout rules, tone)
- `knowledge/product_campaign.md` (services, metrics, copy examples)
- `research_results.json` (hooks, angles, keywords)

Claude generates:
1. `ads/layout.json` — design specification
2. `ads/ad.html` — self-contained HTML at 1080×1080px
3. `ads/styles.css` — standalone stylesheet

**If generate_ad.js fails:**
- Check `ANTHROPIC_API_KEY` in `.env`
- Check log at `outputs/<task_name>_<date>/logs/ad_creative_designer.log`
- Fallback: generate HTML manually following the ad template below

### Layout JSON format

```json
{
  "format": "instagram_square",
  "width": 1080,
  "height": 1080,
  "template": "lean_focus",
  "service": "lean_six_sigma",
  "background": "#06060e",
  "accent": "#7c3aed",
  "elements": [
    {
      "type": "label",
      "text": "Lean Six Sigma",
      "color": "#a78bfa",
      "style": "pill"
    },
    {
      "type": "headline",
      "text": "Seu processo para em quem?",
      "fontSize": 56,
      "color": "#e8e8f0",
      "fontWeight": "800"
    },
    {
      "type": "subtext",
      "text": "Sem padronização, a qualidade depende de quem está de plantão.",
      "fontSize": 22,
      "color": "#8b8baa"
    },
    {
      "type": "metric",
      "text": "−30% custo operacional",
      "color": "#a78bfa",
      "style": "highlighted"
    },
    {
      "type": "cta",
      "text": "Diagnóstico Grátis",
      "backgroundColor": "#25d366",
      "color": "#fff",
      "borderRadius": 12
    }
  ]
}
```

### HTML Template Reference

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1080px; overflow: hidden; }
.ad {
  width: 1080px; height: 1080px;
  background: #06060e;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  position: relative; overflow: hidden;
}
.glow {
  position: absolute; top: -100px; left: 50%;
  transform: translateX(-50%);
  width: 800px; height: 600px;
  background: radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 65%);
  pointer-events: none;
}
.label {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.14em; color: #a78bfa;
  border: 1px solid rgba(167,139,250,0.3);
  background: rgba(124,58,237,0.12);
  padding: 5px 14px; border-radius: 9999px;
}
.headline {
  font-size: 56px; font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.1;
  color: #e8e8f0;
}
.subtext { font-size: 20px; color: #8b8baa; line-height: 1.65; }
.metric {
  font-size: 13px; font-weight: 700;
  color: #a78bfa; letter-spacing: 0.06em;
  text-transform: uppercase;
}
.cta {
  display: inline-flex; align-items: center; gap: 8px;
  background: #25d366; color: #fff;
  font-size: 18px; font-weight: 700;
  padding: 16px 36px; border-radius: 12px;
}
.border-card {
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; background: #0d0d1c;
}
</style>
</head>
<body>
<div class="ad">
  <div class="glow"></div>
  <!-- content here -->
</div>
</body>
</html>
```

## Step 5: Run render_ad.js (Playwright Screenshot)

After `generate_ad.js` completes:

```bash
node scripts/render_ad.js --task <task_name> --date <task_date>
```

This:
1. Launches Chromium headless
2. Sets viewport to 1080×1080
3. Loads `ads/ad.html` via `file://` protocol
4. Waits for `networkidle` + 1500ms (font/image load time)
5. Screenshots at 1080×1080
6. Saves as `ads/instagram_ad.png`

## Platform Size Reference

| Platform | Width | Height | File |
|---|---|---|---|
| Instagram Square | 1080 | 1080 | instagram_ad.png |
| Instagram Feed 4:5 | 1080 | 1350 | instagram_feed.png |
| Instagram Story | 1080 | 1920 | instagram_story.png |
| YouTube Thumbnail | 1280 | 720 | youtube_thumb.png |

Default for pipeline: Instagram Square (1080×1080).

## Troubleshooting

### generate_ad.js fails: ANTHROPIC_API_KEY not set
**Solution:** Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env` and restart

### Fonts not rendering in screenshot
**Cause:** System fonts load instantly; external CDN fonts may not load via `file://`
**Solution:** Use system font stack from brand (already default). Avoid Google Fonts `@import` in ad.html.

### Image not showing in screenshot
**Cause:** Relative path fails under `file://` protocol
**Solution:** `generate_ad.js` uses `path.resolve()` for absolute asset paths — check the script output

### Ad shows wrong service colors
**Cause:** generate_ad.js got wrong service context
**Solution:** Check that `research_results.json` has correct `services` field — or pass `--service lean_six_sigma` or `--service automacao_ia` flag

## Quality Checklist

- [ ] Service identified: lean_six_sigma OR automacao_ia (never manutencao_ti)
- [ ] generate_ad.js ran successfully (layout.json + ad.html exist)
- [ ] ad.html uses SmartOps IA color tokens (dark bg, purple/green accent)
- [ ] styles.css generated alongside ad.html
- [ ] render_ad.js ran successfully (instagram_ad.png exists at 1080×1080)
- [ ] PNG is at correct resolution
- [ ] No Manutenção TI content in ad copy or visuals
