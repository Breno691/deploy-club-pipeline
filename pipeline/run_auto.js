// run_auto.js — Pipeline completa sem intervenção humana
// Uso: node pipeline/run_auto.js [--task nome] [--date YYYY-MM-DD] [--skip-post]
require('dotenv').config();
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const args     = process.argv.slice(2);
const skipPost = args.includes('--skip-post');

const taskDate = (() => {
  const idx = args.indexOf('--date');
  return idx !== -1 ? args[idx + 1] : new Date().toISOString().split('T')[0];
})();
const taskIdx  = args.indexOf('--task');
const taskName = taskIdx !== -1 ? args[taskIdx + 1] : `campanha_${taskDate.replace(/-/g, '')}`;
const taskDir  = path.join('outputs', `${taskName}_${taskDate}`);

// ─── Logger ─────────────────────────────────────────────────────────────────
function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  const logDir = path.join(taskDir, 'logs');
  if (fs.existsSync(logDir)) {
    fs.appendFileSync(path.join(logDir, 'auto_pipeline.log'), `[${ts}] ${msg}\n`);
  }
}

function run(script, extraArgs = []) {
  log(`▶ ${script}`);
  execSync(
    `node ${script} --task ${taskName} --date ${taskDate} ${extraArgs.join(' ')}`,
    { stdio: 'inherit', cwd: path.resolve('.') }
  );
  log(`✓ ${script}`);
}

// ─── Output validation helpers ───────────────────────────────────────────────
function assertFile(filePath, label, minSizeKB = 0) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`${label} not found: ${abs}`);
  }
  if (minSizeKB > 0) {
    const sizeKB = fs.statSync(abs).size / 1024;
    if (sizeKB < minSizeKB) {
      throw new Error(`${label} too small (${sizeKB.toFixed(1)} KB < ${minSizeKB} KB expected): ${abs}`);
    }
  }
  return true;
}

function assertJSON(filePath, label, requiredKeys = []) {
  assertFile(filePath, label);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    throw new Error(`${label} is not valid JSON: ${filePath}`);
  }
  for (const key of requiredKeys) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      throw new Error(`${label} missing required field "${key}"`);
    }
  }
  return data;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────
async function main() {
  log(`════════════════════════════════════`);
  log(`🚀 AUTO PIPELINE — ${taskName} · ${taskDate}`);
  log(`════════════════════════════════════`);

  // Cria estrutura de pastas
  ['', 'ads', 'video', 'copy', 'logs'].forEach(sub => {
    const d = path.join(taskDir, sub);
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // ── STEP 1: Research ──────────────────────────────────────────────────────
  log('── STEP 1: Research ──');
  run('scripts/research.js');
  assertJSON(
    path.join(taskDir, 'research_results.json'),
    'research_results.json',
    ['marketing_angles', 'ad_hooks']
  );
  log('✓ Research validated');

  // ── STEP 2: Copy ──────────────────────────────────────────────────────────
  log('── STEP 2: Copywriter ──');
  run('scripts/generate_copy.js');
  assertFile(path.join(taskDir, 'copy', 'instagram_caption.txt'), 'instagram_caption.txt', 0.05);
  assertFile(path.join(taskDir, 'copy', 'threads_post.txt'), 'threads_post.txt', 0.01);
  assertJSON(path.join(taskDir, 'copy', 'youtube_metadata.json'), 'youtube_metadata.json', ['title']);
  log('✓ Copy validated');

  // ── STEP 3: Ad Creative ───────────────────────────────────────────────────
  log('── STEP 3: Ad Creative ──');
  run('scripts/generate_ad.js');
  assertJSON(path.join(taskDir, 'ads', 'layout.json'), 'layout.json', ['background']);

  // Background (ComfyUI if configured, CSS fallback otherwise)
  try {
    execSync(`node scripts/generate_background.js --task ${taskName} --date ${taskDate}`,
      { stdio: 'inherit', cwd: path.resolve('.') });
  } catch (e) { log(`⚠ Background gen skipped: ${e.message}`); }

  // Square 1080×1080 (for carousels and Ads)
  run('scripts/build_ad_html.js');
  assertFile(path.join(taskDir, 'ads', 'ad.html'), 'ad.html', 2);

  // Portrait 1080×1350 (primary Instagram feed format 2025)
  try {
    execSync(`node scripts/build_portrait_html.js --task ${taskName} --date ${taskDate}`,
      { stdio: 'inherit', cwd: path.resolve('.') });
    log('✓ portrait.html gerado (1080×1350)');
  } catch (e) { log(`⚠ Portrait HTML skipped: ${e.message}`); }

  // Story 1080×1920
  try {
    execSync(`node scripts/build_story_html.js --task ${taskName} --date ${taskDate}`,
      { stdio: 'inherit', cwd: path.resolve('.') });
    log('✓ story.html gerado (1080×1920)');
  } catch (e) { log(`⚠ Story HTML skipped: ${e.message}`); }

  // Carousel — 5 slides
  try {
    execSync(`node scripts/build_carousel_html.js --task ${taskName} --date ${taskDate}`,
      { stdio: 'inherit', cwd: path.resolve('.') });
    log('✓ Carousel gerado (5 slides)');
  } catch (e) { log(`⚠ Carousel skipped: ${e.message}`); }

  run('scripts/render_ad.js');
  assertFile(path.join(taskDir, 'ads', 'instagram_ad.png'), 'instagram_ad.png', 50);
  log('✓ Ad Creative validated');

  // ── STEP 3.5: Video Remotion ─────────────────────────────────────────────
  log('── STEP 3.5: Vídeo Remotion ──');
  const skipVideo = args.includes('--skip-video') || process.env.SKIP_VIDEO === 'true';
  if (skipVideo) {
    log('⏭ --skip-video ativo — pulando geração de vídeo');
  } else {
    try {
      const noNarr = process.env.ELEVENLABS_API_KEY ? '' : '--no-narration';
      execSync(
        `node scripts/generate_video.js --task ${taskName} --date ${taskDate} ${noNarr}`,
        { stdio: 'inherit', cwd: path.resolve('.') }
      );
      log('✓ Vídeo Remotion gerado');
    } catch (e) {
      log(`⚠ Vídeo Remotion falhou (não crítico): ${e.message}`);
      log('  Pipeline continua sem o vídeo...');
    }
  }

  // ── STEP 4: Upload ────────────────────────────────────────────────────────
  log('── STEP 4: Upload Mídia ──');
  run('scripts/upload_media.js');

  const mediaUrls = assertJSON(
    path.join(taskDir, 'media_urls.json'),
    'media_urls.json'
  );

  if (!mediaUrls.instagram_ad) {
    log('⚠ instagram_ad URL missing from media_urls.json — upload may have failed');
  }

  // ── STEP 5: Read outputs ──────────────────────────────────────────────────
  const caption = fs.readFileSync(
    path.join(taskDir, 'copy', 'instagram_caption.txt'), 'utf8'
  ).trim();

  const imageUrl = mediaUrls.instagram_ad || '';
  log(`Image URL: ${imageUrl || '(not uploaded)'}`);
  log(`Caption: ${caption.slice(0, 80)}...`);

  // ── STEP 6: Post to Instagram ─────────────────────────────────────────────
  if (skipPost) {
    log('⏭ Skip post ativo — pulando publicação');
  } else if (!process.env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN.includes('xxx')) {
    log('⚠ INSTAGRAM_ACCESS_TOKEN não configurado — pulando publicação');
  } else if (!imageUrl) {
    log('⚠ Sem URL de imagem — pulando publicação');
  } else {
    log('── STEP 5: Publicando no Instagram ──');
    await postToInstagram(imageUrl, caption);
  }

  // ── Result JSON ───────────────────────────────────────────────────────────
  // Lê video_url se gerado
  let videoUrl = null;
  try {
    const mu = JSON.parse(fs.readFileSync(path.join(taskDir, 'media_urls.json'), 'utf8'));
    videoUrl = mu.video_mp4 || null;
  } catch {}

  const result = {
    task: taskName,
    date: taskDate,
    image_url: imageUrl,
    video_url: videoUrl,
    caption_preview: caption.slice(0, 120),
    status: 'complete',
    timestamp: new Date().toISOString(),
  };

  const resultPath = path.join(taskDir, 'auto_result.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  log(`════════════════════════════════════`);
  log(`✅ PIPELINE COMPLETA — ${taskName}`);
  log(`Resultado: ${resultPath}`);
  log(`════════════════════════════════════`);

  console.log('\n__RESULT__');
  console.log(JSON.stringify(result));

  return result;
}

// ─── Instagram Graph API ─────────────────────────────────────────────────────
async function postToInstagram(imageUrl, caption) {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const token     = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accountId || !token) {
    log('✗ Credenciais Instagram ausentes no .env');
    return;
  }

  log('  Criando container de mídia...');
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${accountId}/media`,
    {
      method: 'POST',
      body: new URLSearchParams({ image_url: imageUrl, caption, access_token: token }),
    }
  );
  const { id: containerId, error: err1 } = await containerRes.json();
  if (err1) { log(`✗ Erro container: ${err1.message}`); return; }
  log(`  Container criado: ${containerId}`);

  await new Promise(r => setTimeout(r, 3000));

  log('  Publicando...');
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({ creation_id: containerId, access_token: token }),
    }
  );
  const { id: postId, error: err2 } = await publishRes.json();
  if (err2) { log(`✗ Erro publish: ${err2.message}`); return; }
  log(`✓ Publicado no Instagram! Post ID: ${postId}`);
}

main().catch(e => {
  console.error('AUTO PIPELINE ERRO:', e.message);
  process.exit(1);
});
