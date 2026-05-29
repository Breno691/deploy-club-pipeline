// run_auto.js — Pipeline completa sem intervenção humana
// Uso: node pipeline/run_auto.js [--task nome] [--date YYYY-MM-DD] [--skip-post]
require('dotenv').config();
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const args     = process.argv.slice(2);
const skipPost = args.includes('--skip-post');

// Task name automático: data de hoje
const taskDate = new Date().toISOString().split('T')[0];
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

  // 1. Research
  log('── STEP 1: Research ──');
  run('scripts/research.js');

  // 2. Copy
  log('── STEP 2: Copywriter ──');
  run('scripts/generate_copy.js');

  // 3. Ad Creative
  log('── STEP 3: Ad Creative ──');
  run('scripts/generate_ad.js');
  run('scripts/build_ad_html.js');
  run('scripts/render_ad.js');

  // 4. Upload Supabase
  log('── STEP 4: Upload Mídia ──');
  run('scripts/upload_media.js');

  // 5. Ler outputs gerados
  const mediaUrls = JSON.parse(
    fs.readFileSync(path.join(taskDir, 'media_urls.json'), 'utf8')
  );
  const caption = fs.readFileSync(
    path.join(taskDir, 'copy', 'instagram_caption.txt'), 'utf8'
  ).trim();

  log(`Image URL: ${mediaUrls.instagram_ad}`);
  log(`Caption: ${caption.slice(0, 80)}...`);

  // 6. Postar no Instagram (se não tiver --skip-post)
  if (skipPost) {
    log('⏭ Skip post ativo — pulando publicação');
  } else if (!process.env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN.includes('xxx')) {
    log('⚠ INSTAGRAM_ACCESS_TOKEN não configurado — pulando publicação');
    log('  Configure no .env para publicação automática');
  } else {
    log('── STEP 5: Publicando no Instagram ──');
    await postToInstagram(mediaUrls.instagram_ad, caption);
  }

  // 7. Resultado final
  const result = {
    task: taskName,
    date: taskDate,
    image_url: mediaUrls.instagram_ad,
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

  // Imprime JSON para o n8n capturar
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

  // Step 1: Criar container de mídia
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

  // Aguarda processamento
  await new Promise(r => setTimeout(r, 3000));

  // Step 2: Publicar
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
