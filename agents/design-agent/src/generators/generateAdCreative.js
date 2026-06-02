// generateAdCreative.js — Design Intelligence Agent
// Refactored from scripts/generate_ad.js — now JSON-driven + modular

require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const fs         = require('fs');
const path       = require('path');
const { COLORS, TYPOGRAPHY, BRAND, getAccent } = require('../brand/brandTokens');
const { validateDesignInput, resolveDimensions } = require('../schemas/design.schema');

const client = new Anthropic();

// ── Build layout JSON via Claude ──────────────────────────────────────────────
async function generateLayoutJSON(designInput) {
  const { headline, subheadline, cta, template = 'pain_hook', service_mode = 'lean' } = designInput;
  const accent = getAccent(service_mode);

  const prompt = `You are a senior ad creative director for SmartOps IA, a Lean Six Sigma + AI consultancy for Brazilian SMBs.

Design input:
${JSON.stringify(designInput, null, 2)}

Brand: ${BRAND.name} | ${BRAND.specialist} | ${BRAND.website}

Return ONLY valid JSON (no markdown):
{
  "format": "${designInput.type || 'instagram_post'}",
  "width": ${resolveDimensions(designInput.type).width},
  "height": ${resolveDimensions(designInput.type).height},
  "template": "${template}",
  "background": "${COLORS.background}",
  "accentColor": "${accent.color}",
  "headline": ${JSON.stringify(headline)},
  "subtext": ${JSON.stringify(subheadline || '')},
  "ctaText": ${JSON.stringify(cta || BRAND.ctaMain)},
  "brand": "${BRAND.name}",
  "domain": "${BRAND.website}"
}`;

  const response = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages:   [
      { role: 'user', content: prompt },
      { role: 'assistant', content: '{' },
    ],
  });

  try {
    return JSON.parse('{' + response.content[0].text.replace(/```\s*$/, '').trim());
  } catch {
    return {
      format: designInput.type || 'instagram_post',
      ...resolveDimensions(designInput.type),
      template, background: COLORS.background,
      accentColor: accent.color,
      headline, subtext: subheadline || '', ctaText: cta || BRAND.ctaMain,
      brand: BRAND.name, domain: BRAND.website,
    };
  }
}

// ── Build full HTML ad from layout JSON ───────────────────────────────────────
async function generateAdHTML(layoutJSON, designInput = {}) {
  const accent     = getAccent(designInput.service_mode);
  const accentColor = layoutJSON.accentColor || accent.color;
  const accentGlow  = accentColor === COLORS.accent ? COLORS.accentGlow : COLORS.primaryGlow;
  const accentSoft  = accentColor === COLORS.accent ? COLORS.accentSoft : COLORS.primarySoft;
  const w = layoutJSON.width  || 1080;
  const h = layoutJSON.height || 1080;

  const prompt = `You are a senior frontend developer creating a ${w}x${h}px premium dark ad for SmartOps IA.

LAYOUT JSON:
${JSON.stringify(layoutJSON, null, 2)}

DESIGN OBJECTIVE: ${designInput.objective || 'lead_generation'}
AUDIENCE: ${designInput.audience || BRAND.tagline}

COLOR TOKENS:
- Background: ${COLORS.background}  Surface: ${COLORS.surface}  Elevated: ${COLORS.surfaceAlt}
- Text: ${COLORS.text}  Secondary: ${COLORS.textSecondary}  Muted: ${COLORS.textMuted}
- Accent: ${accentColor}  Glow: ${accentGlow}  Soft: ${accentSoft}
- Border: ${COLORS.border}  Highlight: ${COLORS.highlight}

TYPOGRAPHY:
- Headline: Bebas Neue, ${TYPOGRAPHY.sizeDisplay}px, uppercase, letter-spacing 2px
- Body/CTA: Inter, weight 400-700
- Load fonts: https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap

LAYOUT REQUIREMENTS (${w}x${h}px, position:absolute):
1. LEFT ACCENT STRIPE: x:0 y:0 w:14px h:100% color:${accentColor} (gradient to darker)
2. BRAND ROW (left:60px top:52px): color dot + "SmartOps IA" white Inter 700 14px + "/ Lean + IA" muted
3. HEADLINE (left:60px top:118px): Bebas Neue ${TYPOGRAPHY.sizeDisplay}px white line-height 0.92
   Text: "${layoutJSON.headline || 'RETRABALHO CUSTA CARO.'}"
4. DIVIDER: 1px ${COLORS.border} at ~470px from top
5. SUBTEXT (left:60px top:490px): Inter 400 20px ${COLORS.textSecondary}
   Text: "${layoutJSON.subtext || ''}"
6. THREE METHOD CARDS (left:60px right:60px top:630px h:160px gap:16px):
   Card 1 (accent top border): "01" Bebas 40px ${accentColor} + "Diagnóstico" bold 14px + sub 12px muted
   Card 2: "02" muted + "Mapeamento" + subtitle
   Card 3: "03" + "Solução" + subtitle
   Cards: bg #0F1319, border 1px ${COLORS.border}, border-radius 14px, padding 22px
7. FOOTER (left:60px right:60px bottom:52px):
   Left: "Primeira etapa" label 11px uppercase muted + "Diagnóstico gratuito — 30 min" Inter 700 21px white
   Right: CTA button — bg:${accentColor} text:white Inter 700 17px padding:20px 44px radius:12px shadow:0 0 40px ${accentGlow}

BACKGROUND:
- Base: ${COLORS.background}
- Grid: repeating-linear-gradient with 1px ${accentSoft} lines every 54px
- Top-left radial glow: ${accentSoft}

RULES:
- All elements position:absolute
- .ad { width:${w}px; height:${h}px; overflow:hidden }
- No external images
- Return ONLY complete HTML starting <!DOCTYPE html>`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 6000,
    messages:   [{ role: 'user', content: prompt }],
  });

  let html = response.content[0].text.trim()
    .replace(/^```html\n?/, '').replace(/\n?```$/, '');

  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    throw new Error('generateAdHTML: invalid HTML from Claude. Got: ' + html.slice(0, 80));
  }
  return html;
}

// ── Main generator ────────────────────────────────────────────────────────────
async function generateAdCreative(designInput, outputDir) {
  validateDesignInput(designInput);
  const adsDir = outputDir || path.join(process.cwd(), 'outputs', 'ads');
  if (!fs.existsSync(adsDir)) fs.mkdirSync(adsDir, { recursive: true });

  console.log(`\n  → Generating layout JSON...`);
  const layoutJSON = await generateLayoutJSON(designInput);
  fs.writeFileSync(path.join(adsDir, 'layout.json'), JSON.stringify(layoutJSON, null, 2));
  console.log(`  ✓ layout.json saved`);

  console.log(`  → Generating ad.html...`);
  const html = await generateAdHTML(layoutJSON, designInput);
  fs.writeFileSync(path.join(adsDir, 'ad.html'), html);

  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (styleMatch) fs.writeFileSync(path.join(adsDir, 'styles.css'), styleMatch[1].trim());
  console.log(`  ✓ ad.html saved`);

  return { layoutJSON, htmlPath: path.join(adsDir, 'ad.html') };
}

module.exports = { generateAdCreative, generateLayoutJSON, generateAdHTML };
