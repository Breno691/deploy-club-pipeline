// build_video_props.js
// Converte o output do pipeline (research + copy) em props para cada template Remotion.
// Cada template tem seu próprio adaptador.

const fs = require('fs');
const path = require('path');

/**
 * Lê os dados do pipeline para uma task
 */
function readPipelineData(taskDir) {
  const read = (file, fallback = null) => {
    try { return JSON.parse(fs.readFileSync(path.join(taskDir, file), 'utf8')); }
    catch { return fallback; }
  };
  const readText = (file, fallback = '') => {
    try { return fs.readFileSync(path.join(taskDir, file), 'utf8').trim(); }
    catch { return fallback; }
  };

  return {
    research:  read('research_results.json', {}),
    adScenes:  read('video/ad_scenes.json', {}),
    layout:    read('ads/layout.json', {}),
    caption:   readText('copy/instagram_caption.txt'),
    threads:   readText('copy/threads_post.txt'),
    youtube:   read('copy/youtube_metadata.json', {}),
  };
}

/**
 * Extrai as 3 melhores métricas dos dados de pesquisa
 */
function extractMetrics(research) {
  const defaults = [
    { v: '−32%', l: 'redução de custo operacional em 90 dias' },
    { v: '+45%', l: 'processos automatizados com n8n + IA' },
    { v: '3×',   l: 'capacidade de crescimento sem contratar' },
  ];
  const angles = research.marketing_angles || [];
  const metrics = [];

  // Tenta extrair números dos angles
  for (const angle of angles) {
    const m = angle.match(/([−\-+]?\d+[%×xk]?)\s+(.{10,50})/);
    if (m) metrics.push({ v: m[1], l: m[2].trim() });
    if (metrics.length >= 3) break;
  }

  return metrics.length >= 2 ? metrics.slice(0, 3) : defaults;
}

/**
 * Extrai hook principal da pesquisa
 */
function extractHook(research) {
  const hooks = research.ad_hooks || [];
  return hooks[0] || 'Sua empresa está perdendo dinheiro todo mês sem perceber.';
}

/**
 * Extrai subtítulo de apoio
 */
function extractSub(research) {
  const angles = research.marketing_angles || [];
  return angles[1] || 'Lean Six Sigma + IA resolve isso em 4 semanas.';
}

/**
 * Extrai lista de benefícios/items
 */
function extractItems(research) {
  const defaults = [
    'Diagnóstico presencial — mapeamos todos os desperdícios',
    'Lean Six Sigma elimina retrabalho e custo oculto',
    'Automações n8n + IA entram em produção em 4 semanas',
    'Dashboard de KPIs para decisões por dados',
  ];
  const services = research.services || [];
  const angles   = research.marketing_angles || [];
  if (services.length >= 2 && angles.length >= 2) {
    return [
      angles[0] || defaults[0],
      angles[1] || defaults[1],
      `${services[0]} aplicado presencialmente em BH/MG`,
      defaults[3],
    ].slice(0, 4);
  }
  return defaults;
}

// ── ADAPTADORES POR TEMPLATE ───────────────────────────────────────────────────

const ADAPTERS = {

  // VividFlow30s
  'VividFlow30s': ({ research }) => ({
    scenes: [
      { type: 'hook', duration: 6, colorIdx: 0, eyebrow: 'SmartOps IA · BH/MG', headline: extractHook(research), sub: extractSub(research) },
      { type: 'stat', duration: 9, colorIdx: 1, headline: 'Com SmartOps IA:', stats: extractMetrics(research) },
      { type: 'list', duration: 9, colorIdx: 2, headline: 'O que fazemos:', items: extractItems(research) },
      { type: 'cta',  duration: 6, colorIdx: 3, headline: 'Diagnóstico Gratuito', sub: 'smartops-ia.com.br · 30 min · BH/MG' },
    ],
  }),

  // DriftIndigo29s / DriftTeal29s / DriftRose29s
  'DriftIndigo29s': ({ research }) => buildDriftProps(research, 'indigo'),
  'DriftTeal29s':   ({ research }) => buildDriftProps(research, 'teal'),
  'DriftRose29s':   ({ research }) => buildDriftProps(research, 'rose'),

  // PodcastDark19s / PodcastPurple19s / PodcastRed19s
  'PodcastDark19s':   ({ research }) => buildPodcastProps(research, 'dark'),
  'PodcastPurple19s': ({ research }) => buildPodcastProps(research, 'purple'),
  'PodcastRed19s':    ({ research }) => buildPodcastProps(research, 'red'),

  // PosterBlue35s / PosterGreen35s / PosterRed35s
  'PosterBlue35s':  ({ research }) => buildPosterProps(research, 'blue'),
  'PosterGreen35s': ({ research }) => buildPosterProps(research, 'green'),
  'PosterRed35s':   ({ research }) => buildPosterProps(research, 'red'),

  // NeoBrut
  'NeoBrutYellow30s': ({ research }) => buildBrutProps(research, 'yellow'),
  'NeoBrutPink30s':   ({ research }) => buildBrutProps(research, 'pink'),
  'NeoBrutOrange30s': ({ research }) => buildBrutProps(research, 'orange'),

  // Aurora
  'Aurora30s': ({ research }) => ({
    scenes: [
      { type: 'hero',     duration: 6, eyebrow: 'SmartOps IA · BH/MG', headline: extractHook(research), sub: extractSub(research) },
      { type: 'stats',    duration: 9, headline: 'Resultados que entregamos:', stats: extractMetrics(research) },
      { type: 'features', duration: 9, headline: 'Como fazemos:', items: extractItems(research) },
      { type: 'cta',      duration: 6, ctaText: 'Diagnóstico Gratuito', ctaSub: 'smartops-ia.com.br · BH/MG' },
    ],
  }),

  // BoldTypo
  'BoldTypoBlack': ({ research }) => buildTypoProps(research, 'black'),
  'BoldTypoWhite': ({ research }) => buildTypoProps(research, 'white'),

  // GlassCool / GlassWarm
  'GlassCool30s': ({ research }) => buildGlassProps(research, 'cool'),
  'GlassWarm30s': ({ research }) => buildGlassProps(research, 'warm'),
};

// ── BUILDERS REUTILIZÁVEIS ─────────────────────────────────────────────────────

function buildDriftProps(research, palette) {
  const hook = extractHook(research);
  const words = hook.split(' ');
  const half  = Math.ceil(words.length / 2);
  return {
    palette,
    scenes: [
      { type: 'open',     duration: 6, tag: 'SmartOps IA · BH/MG', lines: [words.slice(0, half).join(' '), words.slice(half).join(' ')], sub: extractSub(research) },
      { type: 'metrics',  duration: 9, label: 'Em 90 dias', metrics: extractMetrics(research).map(m => ({ ...m, delta: 'com SmartOps IA' })) },
      { type: 'features', duration: 8, headline: 'O que fazemos:', items: extractItems(research) },
      { type: 'cta',      duration: 6, ctaLine1: 'Diagnóstico', ctaLine2: 'Gratuito' },
    ],
  };
}

function buildPodcastProps(research, theme) {
  const angles = research.marketing_angles || [];
  const words0 = (angles[0] || 'Sua empresa perde dinheiro todo mês.').split(' ');
  const words1 = (angles[1] || 'Retrabalho. Improviso. Caos.').split(' ');
  const words2 = (angles[2] || 'Lean Six Sigma + IA resolve isso.').split(' ');
  return {
    theme,
    speaker: 'SmartOps IA',
    topic: 'Lean · Six Sigma · Automação · IA',
    ctaText: 'Diagnóstico Gratuito',
    segments: [
      { words: words0, highlightIdx: [0, 1], duration: 4 },
      { words: words1, highlightIdx: [0], duration: 4 },
      { words: words2, highlightIdx: [2, 3, 4], duration: 4 },
      { words: ['−30%', 'custo.', '+45%', 'eficiência.', '4', 'SEMANAS.'], highlightIdx: [0, 2, 5], duration: 4 },
      { words: ['Presencial.', 'BH/MG.', 'Resultado', 'GARANTIDO.'], highlightIdx: [3], duration: 3 },
    ],
  };
}

function buildPosterProps(research, theme) {
  const hook = extractHook(research);
  const words = hook.split(' ');
  const chunks = [];
  for (let i = 0; i < Math.min(words.length, 12); i += 2) {
    chunks.push({ word: words.slice(i, i + 2).join(' '), duration: 40, bgLight: chunks.length % 2 !== 0 });
  }
  chunks.push({ word: 'Chega.', sub: 'Existe uma solução.', duration: 45, bgLight: chunks.length % 2 !== 0 });

  return {
    theme,
    scenes: [
      { type: 'slides', duration: Math.ceil((chunks.reduce((s, c) => s + c.duration, 0)) / 30), slides: chunks },
      { type: 'stats',  duration: 11, headline: 'Com SmartOps IA:', stats: extractMetrics(research) },
      { type: 'cta',    duration: 6, ctaText: 'Diagnóstico Gratuito' },
    ],
  };
}

function buildBrutProps(research, theme) {
  const metrics = extractMetrics(research);
  return {
    theme,
    headline: extractHook(research),
    stats: metrics.slice(0, 3).map(m => ({ v: m.v, l: m.l.split(' ').slice(0, 3).join(' ') })),
    items: extractItems(research).slice(0, 3),
    ctaText: 'DIAGNÓSTICO GRÁTIS',
  };
}

function buildTypoProps(research, theme) {
  const angles = research.marketing_angles || [];
  const words = angles.slice(0, 4).map(a => {
    const w = a.split(' ');
    return w.slice(0, 3).join(' ') + (w.length > 3 ? '...' : '');
  });
  words.unshift('Chega.');
  words.push('SmartOps IA.');
  return {
    theme,
    words,
    sub: 'Lean Six Sigma + IA para PMEs em BH/MG',
    ctaText: 'Diagnóstico Gratuito',
    ctaSub: 'smartops-ia.com.br',
  };
}

function buildGlassProps(research, theme) {
  return {
    theme,
    scenes: [
      { type: 'hero',  duration: 6, eyebrow: 'SmartOps IA · BH/MG', headline: extractHook(research), sub: extractSub(research) },
      { type: 'cards', duration: 10, headline: 'Como transformamos:', cards: [
        { icon: '🔍', title: 'Diagnóstico presencial', body: 'Mapeamos todos os desperdícios na sua empresa' },
        { icon: '⚡', title: 'Automação em 4 semanas', body: 'n8n + IA eliminando trabalho manual' },
        { icon: '📊', title: 'Dashboard de KPIs', body: 'Decisões baseadas em dados, não em feeling' },
      ]},
      { type: 'list', duration: 8, headline: 'Resultados:', items: extractItems(research) },
      { type: 'cta',  duration: 6, ctaText: 'Diagnóstico Gratuito', ctaSub: 'smartops-ia.com.br · 30 min' },
    ],
  };
}

/**
 * Constrói as props para um template a partir dos dados do pipeline.
 * @param {string} templateId - ID da composição Remotion
 * @param {string} taskDir - Pasta de output da task
 * @returns {object} props para o template
 */
function buildVideoProps(templateId, taskDir) {
  const data    = readPipelineData(taskDir);
  const adapter = ADAPTERS[templateId];

  if (adapter) {
    return adapter(data);
  }

  // Fallback genérico — VividFlow
  return ADAPTERS['VividFlow30s'](data);
}

module.exports = { buildVideoProps, readPipelineData };
