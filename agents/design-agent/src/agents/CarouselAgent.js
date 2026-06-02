// CarouselAgent.js — Design Intelligence Agent (SmartOps IA)
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic  = require('@anthropic-ai/sdk');
const fs         = require('fs');
const path       = require('path');
const { COLORS, BRAND, TYPOGRAPHY, getAccent } = require('../brand/brandTokens');

const client = new Anthropic();

// ── Generate carousel slides JSON via Claude ──────────────────────────────────
async function generateCarouselJSON({ topic, objective = 'education', slides = 7, audience, service_mode = 'lean' }) {
  const accent = getAccent(service_mode);

  const prompt = `Você é o Carousel Agent da SmartOps IA — especialista em carrosséis educativos e persuasivos.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

PARÂMETROS:
- Tema: ${topic}
- Objetivo: ${objective}
- Slides: ${slides}
- Público: ${audience || BRAND.tagline}
- Cor de destaque: ${accent.color}

Crie um carrossel completo em JSON:

{
  "carousel_id": "carousel-${Date.now()}",
  "topic": "${topic}",
  "objective": "${objective}",
  "total_slides": ${slides},
  "slides": [
    {
      "slide_number": 1,
      "type": "hook",
      "headline": "...",
      "body": "",
      "bullets": [],
      "visual_type": "impact_headline",
      "cta": null
    }
  ],
  "caption": "...",
  "hashtags": ["#lean", "#sixsigma", "#automacao", "#PME", "#BH"],
  "performance_hypothesis": "..."
}

ESTRUTURA OBRIGATÓRIA:
Slide 1: hook — frase forte que para o scroll
Slide 2: problema — a dor que o tema resolve
Slide 3: causa ou erro comum
Slide 4: dado ou impacto com número
Slide 5: exemplo prático
Slide 6: solução SmartOps
Slide ${slides}: CTA — diagnóstico gratuito

TIPOS DE SLIDE:
- hook: headline de impacto, visual_type: impact_headline
- problem: dor, visual_type: problem_card
- cause: causa raiz, visual_type: explanation
- data: número/métrica, visual_type: data_card
- example: caso prático, visual_type: before_after ou list
- solution: como resolver, visual_type: solution_card
- checklist: lista de passos, visual_type: checklist
- cta: convite ao diagnóstico, visual_type: cta_block

REGRAS:
- Máximo 6 palavras no headline de cada slide
- Máximo 2 linhas de body
- Caption com gancho + valor + CTA suave
- 10-15 hashtags relevantes`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 3000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text      = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('CarouselAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

// ── Generate HTML for a single carousel slide ─────────────────────────────────
function generateSlideHTML(slide, brand, accent) {
  const bgColor = slide.type === 'hook' ? `${brand.background}` :
                  slide.type === 'cta'  ? `${accent.color}11` :
                  brand.surface;

  const headlineColor = slide.type === 'cta' ? accent.color : '#FFFFFF';
  const bulletsHTML   = (slide.bullets || []).map(b =>
    `<div class="bullet"><span class="dot">▸</span><span>${b}</span></div>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1080px; overflow:hidden; background:${bgColor}; }
  .slide {
    width:1080px; height:1080px; position:relative; overflow:hidden;
    background:${bgColor};
    display:flex; flex-direction:column; justify-content:center;
    padding:80px 72px;
    font-family:'Inter', sans-serif;
  }
  .accent-stripe {
    position:absolute; left:0; top:0; width:14px; height:100%;
    background:linear-gradient(180deg, ${accent.color}, ${accent.color}88);
  }
  .brand-row {
    position:absolute; top:52px; left:72px;
    display:flex; align-items:center; gap:8px;
  }
  .brand-dot {
    width:9px; height:9px; border-radius:50%;
    background:${accent.color}; box-shadow:0 0 8px ${accent.glow};
  }
  .brand-name { font-size:14px; font-weight:700; color:#FFFFFF; }
  .brand-sep  { font-size:12px; color:#6B7280; }
  .slide-number {
    position:absolute; top:52px; right:72px;
    font-family:'Bebas Neue', sans-serif; font-size:48px;
    color:${slide.type === 'hook' ? accent.color : '#27272A'};
  }
  .headline {
    font-family:'Bebas Neue', sans-serif;
    font-size:${slide.type === 'hook' ? 104 : 80}px;
    color:${headlineColor};
    line-height:0.95; letter-spacing:2px;
    text-transform:uppercase; max-width:900px;
  }
  .body {
    font-size:24px; color:#A1A1AA; line-height:1.4;
    margin-top:32px; max-width:860px;
  }
  .bullet { display:flex; align-items:flex-start; gap:16px; margin-top:16px; }
  .dot { color:${accent.color}; font-size:20px; flex-shrink:0; margin-top:2px; }
  .bullet span:last-child { font-size:28px; color:#E4E4E7; line-height:1.3; }
  .divider {
    width:80px; height:4px; background:${accent.color};
    border-radius:2px; margin:24px 0;
  }
  .cta-button {
    display:inline-block; margin-top:40px;
    background:${accent.color}; color:#FFFFFF;
    font-family:'Inter',sans-serif; font-size:22px; font-weight:700;
    padding:22px 56px; border-radius:14px;
    box-shadow:0 0 48px ${accent.glow};
  }
  .footer {
    position:absolute; bottom:52px; left:72px; right:72px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .footer-brand { font-size:13px; color:#6B7280; letter-spacing:2px; text-transform:uppercase; }
</style>
</head>
<body>
<div class="slide">
  <div class="accent-stripe"></div>
  <div class="brand-row">
    <div class="brand-dot"></div>
    <span class="brand-name">SmartOps IA</span>
    <span class="brand-sep">/ Lean + IA</span>
  </div>
  <div class="slide-number">0${slide.slide_number}</div>
  <div class="headline">${slide.headline || ''}</div>
  ${slide.body ? `<div class="divider"></div><div class="body">${slide.body}</div>` : ''}
  ${bulletsHTML ? `<div class="divider"></div><div class="bullets">${bulletsHTML}</div>` : ''}
  ${slide.type === 'cta' ? `<div class="cta-button">${brand.ctaMain}</div>` : ''}
  <div class="footer">
    <span class="footer-brand">${brand.website}</span>
  </div>
</div>
</body>
</html>`;
}

// ── Main: generate full carousel (JSON + HTML slides) ─────────────────────────
async function generateCarousel({ topic, objective, slides, audience, service_mode, outputDir }) {
  console.log(`\n  → Generating carousel JSON for "${topic}"...`);
  const carousel = await generateCarouselJSON({ topic, objective, slides, audience, service_mode });
  console.log(`  ✓ ${carousel.total_slides} slides generated`);

  const accent = getAccent(service_mode);
  const dir    = outputDir || path.join(process.cwd(), 'outputs', 'carousel');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, 'carousel.json'), JSON.stringify(carousel, null, 2));

  const slideDir = path.join(dir, 'slides');
  if (!fs.existsSync(slideDir)) fs.mkdirSync(slideDir, { recursive: true });

  for (const slide of carousel.slides) {
    const html = generateSlideHTML(slide, { background: COLORS.background, surface: COLORS.surface, website: BRAND.website, ctaMain: BRAND.ctaMain }, accent);
    fs.writeFileSync(path.join(slideDir, `slide-${slide.slide_number}.html`), html);
  }

  if (carousel.caption) {
    fs.writeFileSync(path.join(dir, 'caption.txt'), carousel.caption + '\n\n' + (carousel.hashtags || []).join(' '));
  }

  console.log(`  ✓ ${carousel.slides.length} slide HTML files saved in ${slideDir}`);
  return { carousel, outputDir: dir };
}

module.exports = { generateCarousel, generateCarouselJSON, generateSlideHTML };
