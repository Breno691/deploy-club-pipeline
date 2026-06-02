// render_ad.js — SmartOps IA | Renderiza todos os formatos via Playwright
// square(1080×1080) + portrait(1080×1350) + story(1080×1920) + carousel slides
require('dotenv').config();
const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

const args     = process.argv.slice(2);
const taskName = args[args.indexOf('--task') + 1] || process.env.TASK_NAME || 'smartops_demo';
const taskDate = args[args.indexOf('--date') + 1] || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const adsDir    = path.join(outputDir, 'ads');
const logPath   = path.join(outputDir, 'logs', 'ad_creative_designer.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(logPath, line + '\n'); } catch {}
}

// ─── Render one HTML file to PNG ──────────────────────────────────────────────
async function renderHTML(browser, htmlPath, outPng, width, height) {
  if (!fs.existsSync(htmlPath)) { log(`  ⚠ skip (not found): ${htmlPath}`); return false; }

  const page = await browser.newPage();
  await page.setViewportSize({ width, height });

  // Use file:// — Playwright allows external requests from file pages
  await page.goto(`file://${path.resolve(htmlPath)}`);

  // Wait for Google Fonts: networkidle + extra wait for font rendering
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
  await page.waitForTimeout(2500); // ensure Bebas Neue renders correctly

  // Force exact dimensions
  await page.addStyleTag({
    content: `html,body{margin:0!important;padding:0!important;width:${width}px!important;height:${height}px!important;display:block!important;overflow:hidden!important;}`
  });
  await page.waitForTimeout(200);

  await page.screenshot({
    path: outPng,
    clip: { x: 0, y: 0, width, height },
    type: 'png',
  });

  await page.close();

  const sizeKB = (fs.statSync(outPng).size / 1024).toFixed(0);
  log(`  ✓ ${path.basename(outPng)} — ${width}×${height} — ${sizeKB} KB`);
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log('render_ad started');
  console.log(`\nAd Renderer — SmartOps IA`);
  console.log(`Task: ${taskName} | Date: ${taskDate}\n`);

  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }

  const browser = await chromium.launch(launchOptions);

  // ── 1. Square 1080×1080 (primary — pipeline validation uses this) ──────────
  const squareOk = await renderHTML(
    browser,
    path.join(adsDir, 'ad.html'),
    path.join(adsDir, 'instagram_ad.png'),
    1080, 1080
  );
  if (!squareOk) {
    await browser.close();
    log('FAILED: ad.html not found');
    console.error('ad.html not found — run build_ad_html.js first');
    process.exit(1);
  }

  // ── 2. Portrait 1080×1350 (Instagram recommended 2025) ───────────────────
  await renderHTML(
    browser,
    path.join(adsDir, 'portrait.html'),
    path.join(adsDir, 'instagram_portrait.png'),
    1080, 1350
  );

  // ── 3. Story 1080×1920 ────────────────────────────────────────────────────
  await renderHTML(
    browser,
    path.join(adsDir, 'story.html'),
    path.join(adsDir, 'instagram_story.png'),
    1080, 1920
  );

  // ── 4. Carousel slides ────────────────────────────────────────────────────
  const carouselDir = path.join(adsDir, 'carousel');
  if (fs.existsSync(carouselDir)) {
    for (let i = 1; i <= 5; i++) {
      const slideHtml = path.join(carouselDir, `slide_${i}.html`);
      const slidePng  = path.join(carouselDir, `slide_${i}.png`);
      await renderHTML(browser, slideHtml, slidePng, 1080, 1080);
    }
  }

  await browser.close();

  // ── Summary ───────────────────────────────────────────────────────────────
  const outputs = [
    { file: 'instagram_ad.png',       label: 'Square (1080×1080)' },
    { file: 'instagram_portrait.png', label: 'Portrait (1080×1350)' },
    { file: 'instagram_story.png',    label: 'Story (1080×1920)' },
  ];

  console.log('\n── Generated ────────────────────────');
  outputs.forEach(({ file, label }) => {
    const p = path.join(adsDir, file);
    if (fs.existsSync(p)) {
      const kb = (fs.statSync(p).size / 1024).toFixed(0);
      console.log(`  ✓ ${label} — ${kb} KB`);
    }
  });

  const carouselPngs = fs.existsSync(carouselDir)
    ? fs.readdirSync(carouselDir).filter(f => f.endsWith('.png'))
    : [];
  if (carouselPngs.length) {
    console.log(`  ✓ Carousel — ${carouselPngs.length} slides`);
  }

  log('render_ad complete ✓');
}

main().catch(err => {
  log(`FAILED: ${err.message}`);
  console.error('Render error:', err.message);
  process.exit(1);
});
