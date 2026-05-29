require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const taskArg = args.indexOf('--task');
const dateArg = args.indexOf('--date');

const taskName = taskArg !== -1 ? args[taskArg + 1] : process.env.TASK_NAME || 'smartops_demo';
const taskDate = dateArg !== -1 ? args[dateArg + 1] : new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const adsDir = path.join(outputDir, 'ads');

function appendLog(message) {
  const logFile = path.join(outputDir, 'logs', 'ad_creative_designer.log');
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

async function renderAd() {
  console.log(`\nAd Creative Designer — Playwright Renderer`);
  console.log(`Task: ${taskName} | Date: ${taskDate}\n`);

  appendLog('Ad render started');

  const htmlPath = path.resolve(path.join(adsDir, 'ad.html'));

  if (!fs.existsSync(htmlPath)) {
    const errMsg = `ad.html not found at: ${htmlPath}\nEnsure the Ad Creative Designer skill generated the HTML file first.`;
    console.error(errMsg);
    appendLog(`FAILED: ${errMsg}`);
    process.exit(1);
  }

  const outputPath = path.join(adsDir, 'instagram_ad.png');

  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1080, height: 1080 });

  appendLog(`Loading: ${htmlPath}`);
  await page.goto(`file://${htmlPath}`);

  // Force body to fill viewport exactly — prevents flex-centering offset issues
  await page.addStyleTag({
    content: `
      html, body {
        margin: 0 !important; padding: 0 !important;
        width: 1080px !important; height: 1080px !important;
        display: block !important; overflow: hidden !important;
      }
      .ad-container {
        position: absolute !important;
        top: 0 !important; left: 0 !important;
      }
    `
  });

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Screenshot the .ad-container element directly
  const adEl = await page.$('.ad-container');
  if (adEl) {
    await adEl.screenshot({ path: outputPath, type: 'png' });
  } else {
    await page.screenshot({
      path: outputPath,
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
      type: 'png',
    });
  }

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`Screenshot saved: ${outputPath}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
  appendLog(`instagram_ad.png saved (${(stats.size / 1024).toFixed(1)} KB) ✓`);
  appendLog('Ad render complete ✓');
}

renderAd().catch(async (err) => {
  console.error('Render error:', err.message);
  appendLog(`FAILED: ${err.message}`);
  process.exit(1);
});
