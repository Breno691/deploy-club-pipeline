// generate_video.js — Geração completa de vídeo Remotion
// Uso: node scripts/generate_video.js --task nome --date YYYY-MM-DD [--template ID] [--no-narration]
//
// Fluxo:
//   1. Lê dados do pipeline (research + copy)
//   2. Seleciona o melhor template automaticamente (ou usa --template)
//   3. Gera narração ElevenLabs (se ELEVENLABS_API_KEY disponível)
//   4. Renderiza vídeo MP4 com Remotion
//   5. Retorna caminho do vídeo gerado

require('dotenv').config();
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const { selectTemplate } = require('./select_template');
const { buildVideoProps } = require('./build_video_props');

// ── Args ──────────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const getArg     = (flag, fallback = null) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : fallback; };
const hasFlag    = (flag) => args.includes(flag);

const taskDate   = getArg('--date', new Date().toISOString().split('T')[0]);
const taskIdx    = args.indexOf('--task');
const taskName   = taskIdx !== -1 ? args[taskIdx + 1] : `campanha_${taskDate.replace(/-/g, '')}`;
const taskDir    = path.join('outputs', `${taskName}_${taskDate}`);
const forceId    = getArg('--template');
const noNarr     = hasFlag('--no-narration');
const skipRender = hasFlag('--skip-render');

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    const logDir = path.join(taskDir, 'logs');
    if (fs.existsSync(logDir)) fs.appendFileSync(path.join(logDir, 'video_pipeline.log'), line + '\n');
  } catch {}
}

// ── Narração — ElevenLabs (premium) ou Edge TTS (grátis) ─────────────────────
async function generateNarration(taskDir, research) {
  const hook   = (research.ad_hooks || [])[0] || '';
  const angles = (research.marketing_angles || []).slice(0, 2).join('. ');
  const text   = [
    hook,
    angles,
    'SmartOps IA. Diagnóstico gratuito. Presencial BH barra MG. Acesse smartops-ia ponto com ponto b r.',
  ].filter(Boolean).join(' ');

  const audioDir  = path.join('remotion', 'public', 'audio');
  const audioPath = path.join(audioDir, `narration_${taskName}.mp3`);
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  // ── Opção 1: ElevenLabs (se tiver API key — maior qualidade) ──────────────
  if (process.env.ELEVENLABS_API_KEY) {
    log('🎙️  Gerando narração com ElevenLabs (premium)...');
    try {
      const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.75, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true },
        }),
      });
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(audioPath, Buffer.from(buffer));
      log(`✅ Narração ElevenLabs: ${audioPath} (${(buffer.byteLength/1024).toFixed(1)} KB)`);
      return `audio/narration_${taskName}.mp3`;
    } catch (e) {
      log(`⚠ ElevenLabs falhou: ${e.message} — tentando Edge TTS grátis...`);
    }
  }

  // ── Opção 2: Google TTS (grátis, sem API key) ────────────────────────────
  log('🎙️  Gerando narração com Google TTS (grátis)...');
  try {
    const freeTTS = require('../pipeline/generate_narration_free.js');
    await freeTTS.saveNarration(text, audioPath);
    log(`✅ Narração Google TTS: ${audioPath}`);
    return `audio/narration_${taskName}.mp3`;
  } catch (e) {
    log(`⚠ Google TTS falhou: ${e.message} — vídeo será gerado sem narração`);
    return null;
  }
}

// ── Render Remotion ───────────────────────────────────────────────────────────
function renderVideo(templateId, propsObj, outputPath, audioSrc) {
  const remotionDir  = path.join(process.cwd(), 'remotion');
  const bin          = path.join(remotionDir, 'node_modules', '.bin', 'remotion');
  const propsFile    = path.join(process.cwd(), taskDir, 'video', 'template_props.json');

  // Wrapa as props conforme cada template espera
  const wrappedProps = wrapProps(templateId, propsObj, audioSrc);
  fs.writeFileSync(propsFile, JSON.stringify(wrappedProps, null, 2));

  const absOutput = path.resolve(outputPath);
  const cmd = `"${bin}" render src/index.ts ${templateId} "${absOutput}" --props "${propsFile}" --log error --codec h264 --crf 18 --concurrency 2`;

  log(`🎬 Renderizando ${templateId}...`);
  log(`   Output: ${absOutput}`);

  execSync(cmd, {
    cwd: remotionDir,
    stdio: 'inherit',
    env: { ...process.env },
    shell: true,
    timeout: 10 * 60 * 1000, // 10 min timeout
  });

  log(`✅ Vídeo renderizado: ${outputPath}`);
  return outputPath;
}

// Embrulha as props no formato esperado por cada composição
function wrapProps(templateId, props, audioSrc) {
  // Templates que usam { project: ... }
  const projectBased = [
    'VividFlow30s', 'DriftIndigo29s', 'DriftTeal29s', 'DriftRose29s',
    'Aurora30s', 'GlassCool30s', 'GlassWarm30s', 'NeonCyber30s',
    'HUDData30s', 'KineticData32s',
    'PosterBlue35s', 'PosterGreen35s', 'PosterRed35s',
    'NeoBrutYellow30s', 'NeoBrutPink30s', 'NeoBrutOrange30s',
    'PodcastDark19s', 'PodcastPurple19s', 'PodcastRed19s',
    'GradientHero30s', 'SixSigma40s', 'LocalBusiness35s',
  ];

  // Templates que usam props diretas
  const directProps = [
    'BoldTypoBlack', 'BoldTypoWhite',
    'BentoDark25s', 'BentoLight25s',
  ];

  if (projectBased.includes(templateId)) {
    return { project: props };
  }
  // Para outros, passa direto
  return props;
}

// ── Upload para Supabase ───────────────────────────────────────────────────────
async function uploadVideo(videoPath, taskName, taskDate) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('⚠ Supabase não configurado — vídeo não será uploadado');
    return null;
  }

  log('☁️  Fazendo upload do vídeo para Supabase Storage...');

  try {
    const buffer = fs.readFileSync(videoPath);
    const fileName = `${taskName}_${taskDate}_video.mp4`;
    const uploadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/media/${fileName}`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'video/mp4',
      },
      body: buffer,
    });

    if (!res.ok) throw new Error(`Supabase upload ${res.status}`);

    const videoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${fileName}`;
    log(`✅ Upload concluído: ${videoUrl}`);
    return videoUrl;
  } catch (e) {
    log(`⚠ Upload falhou: ${e.message}`);
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log(`════════════════════════════════════════`);
  log(`🎬 VIDEO PIPELINE — ${taskName} · ${taskDate}`);
  log(`════════════════════════════════════════`);

  // Verifica pasta da task
  if (!fs.existsSync(taskDir)) {
    throw new Error(`Task dir não encontrado: ${taskDir}\nRode primeiro: node pipeline/run_auto.js --task ${taskName} --date ${taskDate} --skip-post`);
  }

  const videoDir = path.join(taskDir, 'video');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  // 1. Lê dados do pipeline
  const research = (() => {
    try { return JSON.parse(fs.readFileSync(path.join(taskDir, 'research_results.json'), 'utf8')); }
    catch { return {}; }
  })();

  // 2. Seleciona template
  const template = forceId
    ? { id: forceId, name: forceId, durationFrames: 30 * 30 }
    : selectTemplate(research, taskDate);

  log(`📐 Template selecionado: ${template.name} (${template.id})`);

  // 3. Constrói props do template
  log('⚙️  Construindo props do template...');
  const props = buildVideoProps(template.id, taskDir);
  const propsDir = path.join(taskDir, 'video');
  fs.writeFileSync(path.join(propsDir, 'selected_template.json'), JSON.stringify({ template, timestamp: new Date().toISOString() }, null, 2));

  // 4. Narração ElevenLabs (opcional)
  let audioSrc = null;
  if (!noNarr) {
    audioSrc = await generateNarration(taskDir, research);
  }

  // 5. Renderiza o vídeo
  const outputPath = path.join(taskDir, 'video', 'ad_video.mp4');

  if (skipRender) {
    log('⏭ --skip-render ativo — pulando renderização');
  } else {
    renderVideo(template.id, props, outputPath, audioSrc);
  }

  // 6. Upload para Supabase
  let videoUrl = null;
  if (!skipRender && fs.existsSync(outputPath)) {
    videoUrl = await uploadVideo(outputPath, taskName, taskDate);
  }

  // 7. Atualiza media_urls.json
  const mediaUrlsPath = path.join(taskDir, 'media_urls.json');
  let mediaUrls = {};
  try { mediaUrls = JSON.parse(fs.readFileSync(mediaUrlsPath, 'utf8')); } catch {}
  mediaUrls.video_mp4     = videoUrl || `file://${path.resolve(outputPath)}`;
  mediaUrls.video_template = template.id;
  fs.writeFileSync(mediaUrlsPath, JSON.stringify(mediaUrls, null, 2));

  const result = {
    task: taskName, date: taskDate,
    template: template.id,
    video_path: outputPath,
    video_url: videoUrl,
    narration: audioSrc ? true : false,
    status: 'complete',
    timestamp: new Date().toISOString(),
  };

  log(`════════════════════════════════════════`);
  log(`✅ VIDEO PIPELINE COMPLETO — ${taskName}`);
  log(`   Template: ${template.name}`);
  log(`   Vídeo: ${outputPath}`);
  if (videoUrl) log(`   URL: ${videoUrl}`);
  log(`════════════════════════════════════════`);

  console.log('\n__VIDEO_RESULT__');
  console.log(JSON.stringify(result));

  return result;
}

main().catch(e => {
  console.error('VIDEO PIPELINE ERRO:', e.message);
  process.exit(1);
});
