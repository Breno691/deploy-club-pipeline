// generate_background.js — ComfyUI background generator for SmartOps IA
// Falls back to enhanced CSS background string if ComfyUI unavailable
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const args     = process.argv.slice(2);
const taskName = args[args.indexOf('--task') + 1] || 'smartops_demo';
const taskDate = args[args.indexOf('--date') + 1] || new Date().toISOString().split('T')[0];
const adsDir   = path.join('outputs', `${taskName}_${taskDate}`, 'ads');

const layoutPath = path.join(adsDir, 'layout.json');
let layout = {};
try { layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8')); } catch {}

const COMFYUI_URL = process.env.COMFYUI_URL || ''; // e.g. http://127.0.0.1:8188
const width  = parseInt(args[args.indexOf('--width')  + 1] || '1080');
const height = parseInt(args[args.indexOf('--height') + 1] || '1080');

const accent = layout.accentColor || '#7C3AED';
const isEmerald = accent === '#10B981';
const isBlue    = accent === '#0EA5E9';
const isAmber   = accent === '#F59E0B';

// ─── ComfyUI prompt selection based on accent/theme ──────────────────────────
function getPositivePrompt() {
  if (isEmerald)
    return 'dark minimal professional background, abstract geometric patterns, deep dark teal and emerald gradient, subtle neon green glow, hexagon grid, industrial texture, high quality, 4k, no text, no people, dark studio';
  if (isBlue)
    return 'dark minimal professional background, abstract circuit patterns, deep dark navy and electric blue gradient, subtle neon blue glow, flowing lines, digital texture, high quality, 4k, no text, no people';
  if (isAmber)
    return 'dark minimal professional background, abstract geometric shapes, deep dark charcoal and warm amber gradient, subtle golden glow, luxury texture, high quality, 4k, no text, no people';
  return 'dark minimal professional background, abstract hexagon grid patterns, deep dark purple navy gradient, subtle violet neon glow, geometric shapes, premium texture, high quality, 4k, no text, no people, dark studio atmosphere';
}

const NEGATIVE_PROMPT = 'text, words, letters, logo, watermark, bright colors, white background, people, faces, hands, colorful, cluttered, busy, low quality, blurry';

// ─── ComfyUI SDXL workflow ────────────────────────────────────────────────────
function buildComfyWorkflow() {
  return {
    "1": { "inputs": { "ckpt_name": "sd_xl_base_1.0.safetensors" }, "class_type": "CheckpointLoaderSimple" },
    "2": { "inputs": { "text": getPositivePrompt(), "clip": ["1", 1] }, "class_type": "CLIPTextEncode" },
    "3": { "inputs": { "text": NEGATIVE_PROMPT, "clip": ["1", 1] }, "class_type": "CLIPTextEncode" },
    "4": { "inputs": { "width": width, "height": height, "batch_size": 1 }, "class_type": "EmptyLatentImage" },
    "5": {
      "inputs": {
        "seed": Math.floor(Math.random() * 9999999),
        "steps": 25, "cfg": 7.5,
        "sampler_name": "euler_ancestral", "scheduler": "karras",
        "denoise": 1,
        "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]
      },
      "class_type": "KSampler"
    },
    "6": { "inputs": { "samples": ["5", 0], "vae": ["1", 2] }, "class_type": "VAEDecode" },
    "7": { "inputs": { "filename_prefix": "smartops_bg", "images": ["6", 0] }, "class_type": "SaveImage" }
  };
}

// ─── ComfyUI API client ───────────────────────────────────────────────────────
async function generateViaComfyUI() {
  console.log(`  ComfyUI: ${COMFYUI_URL} — ${width}×${height}`);

  // Submit workflow
  const promptRes = await fetch(`${COMFYUI_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildComfyWorkflow() }),
  });

  if (!promptRes.ok) throw new Error(`ComfyUI submit failed: ${promptRes.status}`);
  const { prompt_id } = await promptRes.json();
  console.log(`  Prompt submitted: ${prompt_id}`);

  // Poll until done (max 3 minutes)
  const startTime = Date.now();
  const maxWait   = 3 * 60 * 1000;
  let outputFile  = null;

  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 3000));
    const histRes = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
    if (!histRes.ok) continue;
    const hist = await histRes.json();
    const entry = hist[prompt_id];
    if (!entry?.outputs) continue;

    for (const nodeId of Object.keys(entry.outputs)) {
      const imgs = entry.outputs[nodeId]?.images;
      if (imgs?.length) { outputFile = imgs[0]; break; }
    }
    if (outputFile) break;
    process.stdout.write('.');
  }
  console.log('');

  if (!outputFile) throw new Error('ComfyUI timed out waiting for output');

  // Download image
  const { filename, subfolder, type } = outputFile;
  const imgUrl = `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder||'')}&type=${type||'output'}`;
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) throw new Error(`Failed to download ComfyUI output: ${imgRes.status}`);

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const bgPath = path.join(adsDir, 'background.png');
  fs.writeFileSync(bgPath, buffer);
  console.log(`  ✓ background.png saved (${(buffer.length/1024).toFixed(0)} KB) via ComfyUI`);

  return { source: 'comfyui', file: bgPath };
}

// ─── CSS fallback background ──────────────────────────────────────────────────
// Generates an enhanced SVG background that looks professional without ComfyUI
function generateCSSBackground() {
  const rgb    = isEmerald ? '16,185,129' : isBlue ? '14,165,233' : isAmber ? '245,158,11' : '124,58,237';
  const dark   = isEmerald ? '#064E3B' : isBlue ? '#0369A1' : isAmber ? '#78350F' : '#2E1065';
  const mid    = isEmerald ? '#065F46' : isBlue ? '#075985' : isAmber ? '#92400E' : '#3B0764';

  // Generate a complex SVG with noise, hexagons, and gradients
  const svgBg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply" result="blend"/>
    </filter>
    <radialGradient id="g1" cx="25%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(${rgb},0.12)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="g2" cx="80%" cy="80%" r="50%">
      <stop offset="0%" stop-color="rgba(${rgb},0.07)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <pattern id="hex" x="0" y="0" width="80" height="92" patternUnits="userSpaceOnUse">
      <path d="M40 4L72 22v36L40 76 8 58V22L40 4Z" fill="none" stroke="rgba(${rgb},0.05)" stroke-width="1"/>
    </pattern>
    <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(${rgb},0.04)" stroke-width="0.5"/>
    </pattern>
  </defs>
  <!-- Base dark background -->
  <rect width="${width}" height="${height}" fill="#0A0A0F"/>
  <!-- Subtle gradient overlay -->
  <rect width="${width}" height="${height}" fill="url(#g1)"/>
  <rect width="${width}" height="${height}" fill="url(#g2)"/>
  <!-- Grid pattern -->
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <!-- Hexagon pattern overlay -->
  <rect width="${width}" height="${height}" fill="url(#hex)" opacity="0.6"/>
  <!-- Top accent glow -->
  <ellipse cx="${width*0.3}" cy="${height*0.15}" rx="${width*0.4}" ry="${height*0.25}" fill="rgba(${rgb},0.06)"/>
  <!-- Bottom right secondary glow -->
  <ellipse cx="${width*0.85}" cy="${height*0.85}" rx="${width*0.3}" ry="${height*0.2}" fill="rgba(${rgb},0.04)"/>
  <!-- Subtle noise texture -->
  <rect width="${width}" height="${height}" fill="rgba(10,10,15,0.3)" filter="url(#noise)" opacity="0.15"/>
</svg>`;

  const svgPath = path.join(adsDir, 'background.svg');
  const pngRef  = path.join(adsDir, 'background.css');

  fs.writeFileSync(svgPath, svgBg);

  // Also write a CSS snippet that can be used in HTML templates
  const cssBg = `/* SmartOps IA background — CSS fallback (ComfyUI not available) */
/* Accent: ${accent} */
.ad-background {
  background:
    radial-gradient(ellipse 80% 70% at 25% 20%, rgba(${rgb},0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(${rgb},0.07) 0%, transparent 60%),
    linear-gradient(135deg, rgba(${rgb},0.03) 0%, transparent 50%),
    #0A0A0F;
  background-image:
    radial-gradient(ellipse 80% 70% at 25% 20%, rgba(${rgb},0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(${rgb},0.07) 0%, transparent 60%),
    linear-gradient(rgba(${rgb},0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(${rgb},0.04) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 60px 60px, 60px 60px;
}`;

  fs.writeFileSync(pngRef, cssBg);
  console.log(`  ✓ background.svg saved (CSS fallback — no ComfyUI configured)`);
  console.log(`  💡 To use ComfyUI: set COMFYUI_URL=http://127.0.0.1:8188 in .env`);

  return { source: 'css', file: svgPath };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nBackground Generator — SmartOps IA`);
  console.log(`Accent: ${accent} | ${width}×${height}\n`);

  if (!fs.existsSync(adsDir)) fs.mkdirSync(adsDir, { recursive: true });

  if (COMFYUI_URL) {
    try {
      const result = await generateViaComfyUI();
      console.log(`\n✓ Background generated via ComfyUI: ${result.file}`);
    } catch (err) {
      console.warn(`  ⚠ ComfyUI failed: ${err.message}`);
      console.warn(`  → Falling back to CSS background`);
      generateCSSBackground();
    }
  } else {
    generateCSSBackground();
  }
}

main().catch(err => {
  console.error('generate_background error:', err.message);
  process.exit(1);
});
