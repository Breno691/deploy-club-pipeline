require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const taskDate = new Date().toISOString().split('T')[0];
const outDir   = path.join('outputs', `campaign_${taskDate}`, 'videos');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const videos = [
  { id: 'AdVideo30s', out: `smartops_30s_reels.mp4`, label: 'Reels 30s (hook → problema → solução → benefícios → CTA)' },
  { id: 'AdVideo15s', out: `smartops_15s_feed.mp4`,  label: 'Feed 15s (versão curta — impacto direto)' },
];

console.log('\n╔══════════════════════════════════════════╗');
console.log('║   SmartOps IA — Video Ad Renderer        ║');
console.log(`║   ${taskDate}                          ║`);
console.log('╚══════════════════════════════════════════╝\n');
console.log('  Renderizando com Remotion...');
console.log('  (pode levar 3-5 min por vídeo)\n');

for (const v of videos) {
  const outPath = path.join(process.cwd(), outDir, v.out);
  console.log(`▶  ${v.label}`);
  try {
    const remotionDir = path.join(process.cwd(), 'remotion');
    const bin = path.join(remotionDir, 'node_modules', '.bin', 'remotion');
    const cmd = `"${bin}" render src/index.ts ${v.id} "${outPath}" --log error --codec h264 --crf 18`;
    execSync(cmd, { cwd: remotionDir, stdio: 'inherit', env: process.env, shell: true });
    console.log(`   ✓ ${v.out}\n`);
  } catch (e) {
    console.error(`   ❌ Erro ao renderizar ${v.id}: ${e.message}\n`);
  }
}

console.log('╔══════════════════════════════════════════╗');
console.log('║   Vídeos salvos em:                      ║');
console.log(`║   ${outDir.padEnd(40)} ║`);
console.log('╚══════════════════════════════════════════╝\n');
console.log('Formatos gerados (1080×1920 — vertical):');
console.log('  • smartops_30s_reels.mp4 → Instagram Reels, YouTube Shorts, TikTok');
console.log('  • smartops_15s_feed.mp4  → Instagram Feed, Meta Ads, Stories\n');
