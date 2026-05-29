require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const taskArg = args.indexOf('--task');
const dateArg = args.indexOf('--date');
const taskName = taskArg !== -1 ? args[taskArg + 1] : process.env.TASK_NAME || 'smartops_demo';
const taskDate = dateArg !== -1 ? args[dateArg + 1] : new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const adsDir = path.join(outputDir, 'ads');

function appendLog(msg) {
  fs.appendFileSync(
    path.join(outputDir, 'logs', 'ad_creative_designer.log'),
    `[${new Date().toISOString()}] ${msg}\n`
  );
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

async function generateAd() {
  console.log(`\nAd Creative Designer — Generating layout + HTML`);
  console.log(`Task: ${taskName} | Date: ${taskDate}\n`);
  appendLog('generate_ad started');

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set in .env');
  }

  if (!fs.existsSync(adsDir)) fs.mkdirSync(adsDir, { recursive: true });

  // Load context
  const brandIdentity    = readFileSafe('knowledge/brand_identity.md');
  const productCampaign  = readFileSafe('knowledge/product_campaign.md');
  const visualReferences = readFileSafe('knowledge/visual_references.md');
  const researchResults  = readFileSafe(path.join(outputDir, 'research_results.json'));

  const client = new Anthropic();

  // ── Step 1: Generate layout JSON ─────────────────────────────────────────
  appendLog('Requesting layout JSON from Claude API...');

  const layoutPrompt = `You are a senior ad creative director specializing in high-conversion Instagram ads for Brazilian small businesses.

BRAND: SmartOps IA — Lean Six Sigma and AI Automation consultancy for small and medium businesses in Brazil.
Consultant: Breno Luiz, Black Belt Lean Six Sigma
Website: smartops-ia.com.br
Offer: Free 30-minute diagnostic

VISUAL DESIGN SYSTEM (follow strictly):
${visualReferences.slice(0, 2500)}

BRAND IDENTITY:
${brandIdentity.slice(0, 1000)}

SERVICES & CAMPAIGN:
${productCampaign.slice(0, 1500)}

RESEARCH INSIGHTS:
${researchResults.slice(0, 1000)}

Generate a layout JSON for a 1080x1080 Instagram square ad that is VISUALLY IMPACTFUL and high-conversion.

Design rules:
- Dark premium theme: background #0A0A0F or #06060E
- Accent colors: #7C3AED (purple — Lean Six Sigma) or #10B981 (emerald — Automation) — choose ONE
- ONE dominant headline: max 6 words, Bebas Neue style, large and bold
- ONE strong business pain point — speak to business owners losing money to broken processes
- Process/diagnostic visual — NOT a developer terminal. Show a process flow or problem analysis card
- CTA: "Quero meu diagnóstico" or "Diagnóstico gratuito"
- Professional, consultancy feel — NOT a tech startup or SaaS product

Choose ONE template:
- "pain_hook": headline about business pain + diagnostic card showing what gets fixed
- "proof_method": methodology steps (Diagnóstico → Mapeamento → Solução) + strong CTA
- "roi_focus": big metric/saving + explanation + CTA

Return ONLY valid JSON, no markdown:
{
  "format": "instagram_square",
  "width": 1080,
  "height": 1080,
  "template": "pain_hook",
  "background": "#0A0A0F",
  "accentColor": "#7C3AED",
  "headline": "Seu processo está te custando dinheiro.",
  "subtext": "Identificamos e eliminamos o desperdício com Lean + automação com IA.",
  "ctaText": "Diagnóstico gratuito — 30 min",
  "brand": "SmartOps IA",
  "domain": "smartops-ia.com.br"
}`;

  const layoutResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: layoutPrompt },
      { role: 'assistant', content: '{' },
    ],
  });

  let layoutJSON;
  try {
    let rawText = ('{' + layoutResponse.content[0].text).trim();
    rawText = rawText.replace(/\s*```\s*$/, '').trim();
    layoutJSON = JSON.parse(rawText);
  } catch {
    // Fallback layout if Claude returns invalid JSON
    layoutJSON = {
      format: 'instagram_square',
      width: 1080, height: 1080,
      template: 'pain_hook',
      background: '#0A0A0F',
      accentColor: '#7C3AED',
      headline: 'Seu processo está te custando dinheiro.',
      subtext: 'Identificamos e eliminamos o desperdício com Lean + automação com IA.',
      ctaText: 'Diagnóstico gratuito — 30 min',
      brand: 'SmartOps IA',
      domain: 'smartops-ia.com.br',
    };
    appendLog('Layout JSON fallback used (Claude returned invalid JSON)');
  }

  fs.writeFileSync(path.join(adsDir, 'layout.json'), JSON.stringify(layoutJSON, null, 2));
  appendLog('layout.json saved');
  console.log('  layout.json generated ✓');

  // ── Step 2: Generate ad.html from layout JSON ─────────────────────────────
  appendLog('Requesting ad.html from Claude API...');

  const accentColor = layoutJSON.accentColor || '#7C3AED';
  const accentGlow  = accentColor === '#10B981' ? 'rgba(16,185,129,0.35)' : 'rgba(124,58,237,0.35)';
  const accentSoft  = accentColor === '#10B981' ? 'rgba(16,185,129,0.06)' : 'rgba(124,58,237,0.06)';
  const accentBorder= accentColor === '#10B981' ? 'rgba(16,185,129,0.2)' : 'rgba(124,58,237,0.2)';

  const htmlPrompt = `You are a senior frontend developer creating a high-conversion 1080x1080px Instagram ad for SmartOps IA, a Brazilian Lean Six Sigma + AI Automation consultancy.

LAYOUT DIRECTION:
${JSON.stringify(layoutJSON, null, 2)}

Create a premium dark consultancy ad. This is NOT a tech startup or SaaS — it is a professional consultancy for small business owners who have broken processes and are losing money.

COLOR PALETTE:
- bg: #0A0A0F | card bg: #0B0F17 | elevated: #111827
- text primary: #FFFFFF | text secondary: #A1A1AA | muted: #6B7280
- accent: ${accentColor} | accent glow: ${accentGlow} | accent soft: ${accentSoft}
- border: #1F2937 | price/highlight: #FACC15

TYPOGRAPHY (Google Fonts):
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap');
- Headline: Bebas Neue, uppercase, 110-128px
- Subtext: Inter 400, 19-21px, #A1A1AA
- Labels/mono: Inter 600, 11-12px, uppercase, letter-spacing 1.5px
- CTA: Inter 700, 17px

REQUIRED LAYOUT (position: absolute, .ad: 1080x1080px, margins 60px):
1. LEFT STRIPE (x:0, y:0, w:14px, h:1080px): solid ${accentColor} → darker variant gradient
2. BRAND ROW (left:60px, top:52px): dot (${accentColor}, 9px, glow) + "SmartOps IA" (white, Inter 700, 14px) + "/ Consultoria" (muted, 12px)
3. HEADLINE (left:60px, top:118px): Bebas Neue 118px, white, line-height 0.92, letter-spacing 2px — use: "${layoutJSON.headline || 'SEU PROCESSO ESTÁ TE CUSTANDO DINHEIRO.'}"
4. DIVIDER LINE (left:60px, right:60px, top:~470px): 1px #1F2937
5. SUBTEXT (left:60px, top:~490px): Inter 400, 20px, #A1A1AA — use: "${layoutJSON.subtext || 'Mapeamos, diagnosticamos e eliminamos desperdício com Lean Six Sigma + automação com IA.'}"
6. 3-COLUMN CARD ROW (left:60px, right:60px, top:~630px, height:160px):
   - Card 1 (accent top border ${accentColor}): number "01" (Bebas Neue 40px, ${accentColor}) + label "Diagnóstico" (Inter 700, 14px, white) + sub "Entendemos o problema real" (12px, muted)
   - Card 2 (normal border): "02" (muted) + "Mapeamento" + "Gargalos e desperdícios"
   - Card 3 (normal border): "03" + "Solução" + "Lean + IA no seu processo"
   - Cards: bg #0F1319, border 1px #1F2937, border-radius 14px, padding 22px
7. FOOTER ROW (left:60px, right:60px, bottom:52px):
   - Left: label "Primeira etapa" (11px, muted, uppercase) + text "Diagnóstico gratuito — 30 min" (Inter 700, 21px, white, with "${accentColor}" on "gratuito")
   - Right: CTA button bg ${accentColor}, text #FFFFFF, Inter 700, 17px, padding 20px 44px, border-radius 12px, box-shadow 0 0 40px ${accentGlow}

BACKGROUND:
- Base #0A0A0F
- Subtle grid: linear-gradient 1px ${accentSoft} lines at 54px spacing
- Radial glow top-left: ${accentSoft} ellipse

RULES:
- position:absolute for all elements
- .ad width:1080px height:1080px overflow:hidden
- NO external images
- Return ONLY complete HTML starting <!DOCTYPE html>, no markdown, no explanation`;

  const htmlResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{ role: 'user', content: htmlPrompt }],
  });

  let htmlContent = htmlResponse.content[0].text.trim();
  htmlContent = htmlContent.replace(/^```html\n?/, '').replace(/\n?```$/, '');

  if (!htmlContent.startsWith('<!DOCTYPE') && !htmlContent.startsWith('<html')) {
    throw new Error('Claude returned invalid HTML. Got: ' + htmlContent.slice(0, 100));
  }

  fs.writeFileSync(path.join(adsDir, 'ad.html'), htmlContent);

  const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    fs.writeFileSync(path.join(adsDir, 'styles.css'), styleMatch[1].trim());
    appendLog('styles.css saved');
  }

  appendLog('ad.html saved');
  console.log('  ad.html generated ✓');
  console.log(`\nAd generation complete. Files in: ${adsDir}\n`);
  appendLog('generate_ad complete ✓');
}

generateAd().catch(err => {
  console.error('generate_ad error:', err.message);
  appendLog(`FAILED: ${err.message}`);
  process.exit(1);
});
