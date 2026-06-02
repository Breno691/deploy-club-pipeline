require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

const args = process.argv.slice(2);
const taskArg = args.indexOf('--task');
const dateArg = args.indexOf('--date');
const typeArg = args.indexOf('--type'); // 'feed' | 'story' | 'reel'

const taskName = taskArg !== -1 ? args[taskArg + 1] : 'campaign';
const taskDate = dateArg !== -1 ? args[dateArg + 1] : new Date().toISOString().split('T')[0];
const postType = typeArg !== -1 ? args[typeArg + 1] : 'feed';

const outputDir = path.join('outputs', `${taskName}_${taskDate}`);

async function apiPost(url, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (data.error) throw new Error(`API Error: ${data.error.message}`);
  return data;
}

async function apiGet(url, params) {
  const qs = new URLSearchParams({ ...params, access_token: ACCESS_TOKEN }).toString();
  const res = await fetch(`${url}?${qs}`);
  const data = await res.json();
  if (data.error) throw new Error(`API Error: ${data.error.message}`);
  return data;
}

async function postFeed() {
  const captionPath = path.join(outputDir, 'copy', 'instagram_caption.txt');
  const mediaUrlsPath = path.join(outputDir, 'media_urls.json');

  if (!fs.existsSync(captionPath)) {
    throw new Error(`Caption não encontrada: ${captionPath}`);
  }
  if (!fs.existsSync(mediaUrlsPath)) {
    throw new Error(`media_urls.json não encontrado. Rode primeiro: node scripts/upload_media.js --task ${taskName} --date ${taskDate}`);
  }

  const caption = fs.readFileSync(captionPath, 'utf8').trim();
  const mediaUrls = JSON.parse(fs.readFileSync(mediaUrlsPath, 'utf8'));

  if (!mediaUrls.instagram_ad) {
    throw new Error('URL da imagem não encontrada em media_urls.json. Rode upload_media.js primeiro.');
  }

  console.log('\nPostando no Instagram Feed...');
  console.log(`Imagem: ${mediaUrls.instagram_ad}`);

  // Step 1: Criar container de mídia
  const container = await apiPost(
    `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media`,
    {
      image_url: mediaUrls.instagram_ad,
      caption,
      access_token: ACCESS_TOKEN,
    }
  );
  console.log(`Container criado: ${container.id}`);

  // Step 2: Aguardar processamento
  await waitForContainer(container.id);

  // Step 3: Publicar
  const published = await apiPost(
    `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media_publish`,
    { creation_id: container.id, access_token: ACCESS_TOKEN }
  );

  console.log(`\nPost publicado com sucesso!`);
  console.log(`Post ID: ${published.id}`);
  console.log(`Link: https://www.instagram.com/p/${published.id}/`);
  return published.id;
}

async function postStory(imageUrl) {
  console.log('\nPostando Instagram Story...');

  // Step 1: Criar container de story
  const container = await apiPost(
    `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media`,
    {
      image_url: imageUrl,
      media_type: 'IMAGE',
      is_carousel_item: false,
      // Stories usam o mesmo endpoint mas com parâmetro específico na conta
      access_token: ACCESS_TOKEN,
    }
  );
  console.log(`Container story criado: ${container.id}`);

  await waitForContainer(container.id);

  const published = await apiPost(
    `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media_publish`,
    { creation_id: container.id, access_token: ACCESS_TOKEN }
  );

  console.log(`Story publicado! ID: ${published.id}`);
  return published.id;
}

async function postReel() {
  const mediaUrlsPath = path.join(outputDir, 'media_urls.json');
  if (!fs.existsSync(mediaUrlsPath)) {
    throw new Error('media_urls.json não encontrado.');
  }

  const mediaUrls = JSON.parse(fs.readFileSync(mediaUrlsPath, 'utf8'));
  if (!mediaUrls.ad_video) {
    throw new Error('URL do vídeo não encontrada em media_urls.json.');
  }

  const captionPath = path.join(outputDir, 'copy', 'instagram_caption.txt');
  const caption = fs.existsSync(captionPath)
    ? fs.readFileSync(captionPath, 'utf8').trim()
    : 'SmartOps IA — Lean Six Sigma + IA para PMEs em BH. #LeanSixSigma #SmartOpsIA';

  console.log('\nPostando Reel no Instagram...');

  // Step 1: Criar container de Reel
  const container = await apiPost(
    `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media`,
    {
      media_type: 'REELS',
      video_url: mediaUrls.ad_video,
      caption,
      share_to_feed: 'true',
      access_token: ACCESS_TOKEN,
    }
  );
  console.log(`Container Reel criado: ${container.id}`);

  // Reels precisam de mais tempo para processar
  await waitForContainer(container.id, 30000);

  const published = await apiPost(
    `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media_publish`,
    { creation_id: container.id, access_token: ACCESS_TOKEN }
  );

  console.log(`Reel publicado! ID: ${published.id}`);
  return published.id;
}

async function waitForContainer(containerId, maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const status = await apiGet(
      `https://graph.facebook.com/v21.0/${containerId}`,
      { fields: 'status_code' }
    );
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') throw new Error('Falha no processamento da mídia pela API do Instagram.');
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Timeout aguardando processamento da mídia.');
}

async function main() {
  if (!ACCOUNT_ID || ACCOUNT_ID.includes('xxx')) {
    console.error('\nERRO: INSTAGRAM_ACCOUNT_ID não configurado no .env');
    console.error('Configure com seu ID real de conta do Instagram Business.\n');
    process.exit(1);
  }
  if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('xxx')) {
    console.error('\nERRO: INSTAGRAM_ACCESS_TOKEN não configurado no .env');
    console.error('Gere o token em: https://developers.facebook.com → Graph API Explorer\n');
    process.exit(1);
  }

  console.log(`\nSmartOps IA — Instagram Publisher`);
  console.log(`Task: ${taskName} | Date: ${taskDate} | Tipo: ${postType}\n`);

  try {
    if (postType === 'feed') {
      await postFeed();
    } else if (postType === 'reel') {
      await postReel();
    } else if (postType === 'story') {
      // Para story, precisa da URL pública da imagem do story
      const mediaUrls = JSON.parse(fs.readFileSync(path.join(outputDir, 'media_urls.json'), 'utf8'));
      const storyImageUrl = mediaUrls.story_image || mediaUrls.instagram_ad;
      if (!storyImageUrl) throw new Error('URL da imagem de story não encontrada.');
      await postStory(storyImageUrl);
    } else {
      console.error(`Tipo inválido: ${postType}. Use: feed | story | reel`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`\nErro: ${err.message}`);
    process.exit(1);
  }
}

main();
