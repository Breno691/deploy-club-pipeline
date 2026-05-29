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
  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const platformGuidelines = readFileSafe('knowledge/platform_guidelines.md');
  const researchResults = readFileSafe(path.join(outputDir, 'research_results.json'));

  const client = new Anthropic();

  // ── Step 1: Generate layout JSON ──────────────────────────────────────────
  appendLog('Requesting layout JSON from Claude API...');

  const layoutPrompt = `You are an ad creative designer for SmartOps IA, a Brazilian Lean Six Sigma and AI Automation consultancy for small businesses.

BRAND IDENTITY:
${brandIdentity.slice(0, 2000)}

PRODUCT CAMPAIGN (Lean Six Sigma + Automacao com IA ONLY — never Manutencao TI):
${productCampaign.slice(0, 1500)}

RESEARCH INSIGHTS:
${researchResults.slice(0, 1000)}

Generate a layout JSON for a 1080x1080 Instagram square ad.
Choose ONE template: "lean_focus" (for Lean Six Sigma), "automation_focus" (for Automacao com IA), or "proof_card" (for testimonials)
The ad MUST use SmartOps IA brand colors from smartops-ia.com.br:
- Background: #06060e (primary) or #0d0d1c (secondary) — DARK theme
- Text: #e8e8f0 (primary), #8b8baa (muted)
- Lean accent: #7c3aed (purple), #a78bfa (light purple)
- Automation accent: #10b981 (emerald), #6ee7b7 (light emerald)
- CTA: #25d366 (WhatsApp green) for primary CTA
- Font: system-ui, -apple-system, sans-serif (NO Google Fonts)

Return ONLY valid JSON in this exact format, no markdown:
{
  "format": "instagram_square",
  "width": 1080,
  "height": 1080,
  "template": "lean_focus",
  "service": "lean_six_sigma",
  "background": "#06060e",
  "accentColor": "#7c3aed",
  "elements": [
    {"type": "label", "text": "Lean Six Sigma", "x": 80, "y": 80, "fontSize": 11, "color": "#a78bfa", "style": "pill"},
    {"type": "headline", "text": "...", "x": 80, "y": 160, "fontSize": 56, "color": "#e8e8f0", "fontWeight": "800", "maxWidth": 480},
    {"type": "subtext", "text": "...", "x": 80, "y": 320, "fontSize": 20, "color": "#8b8baa", "maxWidth": 460},
    {"type": "metric", "text": "−30% custo operacional", "x": 80, "y": 460, "fontSize": 14, "color": "#a78bfa"},
    {"type": "cta", "text": "Diagnóstico Grátis", "x": 80, "y": 940, "fontSize": 18, "color": "#fff", "backgroundColor": "#25d366", "paddingX": 32, "paddingY": 14, "borderRadius": 10},
    {"type": "image", "src": "assets/smartops_logo.png", "x": 560, "y": 80, "width": 420, "height": 420}
  ]
}`;

  const layoutResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      { role: 'user', content: layoutPrompt },
      { role: 'assistant', content: '{' },
    ],
  });

  let layoutJSON;
  try {
    let rawText = ('{' + layoutResponse.content[0].text).trim();
    // Strip trailing markdown if present
    rawText = rawText.replace(/\s*```\s*$/, '').trim();
    layoutJSON = JSON.parse(rawText);
  } catch {
    throw new Error('Claude returned invalid JSON for layout. Raw: ' + ('{' + layoutResponse.content[0].text).slice(0, 300));
  }

  fs.writeFileSync(path.join(adsDir, 'layout.json'), JSON.stringify(layoutJSON, null, 2));
  appendLog('layout.json saved');
  console.log('  layout.json generated ✓');

  // ── Step 2: Generate ad.html from layout JSON ──────────────────────────────
  appendLog('Requesting ad.html from Claude API...');

  const htmlPrompt = `You are an HTML/CSS developer generating a pixel-perfect ad for Deploy Club.

LAYOUT SPEC:
${JSON.stringify(layoutJSON, null, 2)}

Generate a complete, self-contained HTML file that renders this ad at exactly 1080x1080px.

Requirements:
- Load fonts via Google Fonts: Playfair Display, DM Sans, JetBrains Mono
- Use position: absolute for all elements
- .ad-container must be exactly width:1080px height:1080px overflow:hidden
- Apply a subtle grain overlay (SVG feTurbulence at 5% opacity)
- The split template: left half (560px) has copy, right half has product visual
- Product image: if src exists, use <img> with the path; otherwise render a dark card with terminal mock SVG
- CTA element must look like a button (background color, padding, border-radius)
- Include all styles inline in a <style> block in <head>
- Return ONLY the complete HTML, no markdown fences, no explanation

Start with <!DOCTYPE html>`;

  const htmlResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: htmlPrompt }],
  });

  let htmlContent = htmlResponse.content[0].text.trim();
  // Strip markdown fences if Claude included them
  htmlContent = htmlContent.replace(/^```html\n?/, '').replace(/\n?```$/, '');

  if (!htmlContent.startsWith('<!DOCTYPE') && !htmlContent.startsWith('<html')) {
    throw new Error('Claude returned invalid HTML. Got: ' + htmlContent.slice(0, 100));
  }

  fs.writeFileSync(path.join(adsDir, 'ad.html'), htmlContent);

  // Generate styles.css as a standalone file too
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
