// select_template.js
// Seleciona o template Remotion ideal baseado no conteúdo da campanha
// e em um sistema de rotação semanal para variedade visual.

const TEMPLATE_CATALOG = [
  // Formato: { id, name, style, bestFor, durationFrames }
  // Visuais únicos e altamente dinâmicos
  { id: 'VividFlow30s',      name: 'Vivid Flow',     style: 'dynamic_colorful', bestFor: ['growth','awareness','brand'],          frames: 30*30 },
  { id: 'PosterBlue35s',     name: 'Impact Poster',  style: 'stamp_impact',     bestFor: ['offer','urgency','cta'],               frames: 35*30 },
  { id: 'DriftIndigo29s',    name: 'Drift Indigo',   style: 'elegant_smooth',   bestFor: ['premium','consulting','enterprise'],   frames: 29*30 },
  { id: 'DriftTeal29s',      name: 'Drift Teal',     style: 'elegant_smooth',   bestFor: ['automation','tech','efficiency'],      frames: 29*30 },
  { id: 'Aurora30s',         name: 'Aurora',         style: 'holographic',      bestFor: ['brand','inspiration','premium'],       frames: 30*30 },
  { id: 'GlassCool30s',      name: 'Glass Cool',     style: 'glassmorphism',    bestFor: ['saas','tech','modern'],                frames: 30*30 },
  { id: 'Synthwave23s',      name: 'Synthwave',      style: 'retro_neon',       bestFor: ['energy','awareness','viral'],          frames: 23*30 },

  // Data driven
  { id: 'KineticData32s',    name: 'Kinetic Data',   style: 'data_storytelling',bestFor: ['roi','results','metrics'],             frames: 32*30 },
  { id: 'HUDData30s',        name: 'HUD Data',       style: 'hud_tech',         bestFor: ['data','analysis','tech'],             frames: 30*30 },
  { id: 'D3DataStory38s',    name: 'D3 Charts',      style: 'data_viz',         bestFor: ['roi','before_after','metrics'],        frames: 38*30 },

  // Tipografia
  { id: 'BoldTypoBlack',     name: 'Bold Typo',      style: 'kinetic_type',     bestFor: ['hook','emotion','viral'],             frames: 33*30 },
  { id: 'PodcastDark19s',    name: 'Podcast Dark',   style: 'podcast_word',     bestFor: ['education','insight','principles'],   frames: 22*30 },
  { id: 'PodcastPurple19s',  name: 'Podcast Purple', style: 'podcast_word',     bestFor: ['education','insight','principles'],   frames: 22*30 },

  // Brutalism / Alto impacto
  { id: 'NeoBrutYellow30s',  name: 'Neo Brut Yellow',style: 'neobrutalism',     bestFor: ['viral','offer','cta'],                frames: 30*30 },
  { id: 'PosterRed35s',      name: 'Impact Red',     style: 'stamp_impact',     bestFor: ['urgency','problem','pain'],           frames: 35*30 },

  // Sofisticado / Premium
  { id: 'BentoDark25s',      name: 'Bento Dark',     style: 'bento_grid',       bestFor: ['product','feature','saas'],           frames: 25*30 },
  { id: 'GradientHero30s',   name: 'Gradient Hero',  style: 'gradient_bold',    bestFor: ['brand','launch','awareness'],         frames: 30*30 },
  { id: 'NeonCyber30s',      name: 'Neon Cyber',     style: 'cyberpunk',        bestFor: ['tech','disruption','innovation'],     frames: 30*30 },
  { id: 'RetroSpace23s',     name: 'Retro Space',    style: 'space_age',        bestFor: ['aspiration','growth','vision'],       frames: 23*30 },

  // 3D / Lottie
  { id: 'ThreeD3D36s',       name: '3D Scene',       style: '3d_tech',          bestFor: ['launch','premium','showcase'],        frames: 36*30 },
  { id: 'LottieIcons35s',    name: 'Lottie Icons',   style: 'animated_icons',   bestFor: ['explainer','features','onboarding'],  frames: 35*30 },
  { id: 'MinimalistLight35s',name: 'Minimalist',     style: 'editorial_clean',  bestFor: ['authority','trust','consulting'],     frames: 35*30 },
];

// ── Mapeamento de temas de campanha → intento de template ─────────────────────
const THEME_MAP = {
  retrabalho:    { intent: ['data_storytelling', 'stamp_impact', 'kinetic_type'],    weight: 'problem' },
  desperdicio:   { intent: ['data_storytelling', 'hud_tech', 'neobrutalism'],        weight: 'problem' },
  automacao:     { intent: ['hud_tech', 'glassmorphism', 'dynamic_colorful'],        weight: 'solution' },
  lean:          { intent: ['data_storytelling', 'bento_grid', 'editorial_clean'],   weight: 'authority' },
  diagnostico:   { intent: ['stamp_impact', 'kinetic_type', 'dynamic_colorful'],     weight: 'cta' },
  roi:           { intent: ['data_storytelling', 'data_viz', 'bento_grid'],          weight: 'results' },
  processo:      { intent: ['editorial_clean', 'elegant_smooth', 'data_storytelling'],weight: 'consulting' },
  crescimento:   { intent: ['dynamic_colorful', 'gradient_bold', 'space_age'],       weight: 'growth' },
  ia:            { intent: ['hud_tech', 'cyberpunk', '3d_tech'],                     weight: 'tech' },
  custo:         { intent: ['data_storytelling', 'neobrutalism', 'kinetic_type'],    weight: 'problem' },
};

// ── Rotação semanal (Ter/Qui/Sáb × 3 semanas = 9 slots únicos) ────────────────
const WEEKLY_ROTATION = [
  // Semana A
  ['VividFlow30s', 'KineticData32s', 'PodcastDark19s'],
  // Semana B
  ['DriftTeal29s', 'NeoBrutYellow30s', 'Aurora30s'],
  // Semana C
  ['BoldTypoBlack', 'D3DataStory38s', 'GlassCool30s'],
  // Semana D
  ['PosterBlue35s', 'HUDData30s', 'MinimalistLight35s'],
  // Semana E
  ['Synthwave23s', 'BentoDark25s', 'DriftIndigo29s'],
];

function getWeekOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - start) / 86400000 + start.getDay() + 1) / 7);
}

function getDaySlot(date = new Date()) {
  const day = date.getDay(); // 0=Dom, 2=Ter, 4=Qui, 6=Sáb
  if (day === 2) return 0;
  if (day === 4) return 1;
  if (day === 6) return 2;
  return 0; // fallback
}

/**
 * Seleciona o template ideal para a campanha.
 * @param {object} research - Conteúdo de research_results.json
 * @param {string} date - Data no formato YYYY-MM-DD
 * @param {boolean} forceRotation - Usa rotação semanal independente do conteúdo
 * @returns {{ id: string, name: string, durationFrames: number }}
 */
function selectTemplate(research = {}, date = null, forceRotation = false) {
  const taskDate = date ? new Date(date) : new Date();

  // 1. Rotação semanal como base
  const week     = getWeekOfYear(taskDate);
  const daySlot  = getDaySlot(taskDate);
  const rotation = WEEKLY_ROTATION[week % WEEKLY_ROTATION.length];
  const rotationId = rotation[daySlot];

  if (forceRotation) {
    const tpl = TEMPLATE_CATALOG.find(t => t.id === rotationId) || TEMPLATE_CATALOG[0];
    return { id: tpl.id, name: tpl.name, durationFrames: tpl.frames };
  }

  // 2. Análise de conteúdo para refinar a escolha
  const taskName   = (research.task_name || '').toLowerCase();
  const angles     = (research.marketing_angles || []).join(' ').toLowerCase();
  const keywords   = (research.keywords || []).join(' ').toLowerCase();
  const allText    = `${taskName} ${angles} ${keywords}`;

  // Detecta tema principal
  let detectedTheme = null;
  let maxMatches = 0;
  for (const [theme, config] of Object.entries(THEME_MAP)) {
    const matches = (allText.match(new RegExp(theme, 'g')) || []).length;
    if (matches > maxMatches) { maxMatches = matches; detectedTheme = theme; }
  }

  // 3. Se detectou tema, escolhe template compatível
  if (detectedTheme && maxMatches >= 1) {
    const intents = THEME_MAP[detectedTheme].intent;
    const candidates = TEMPLATE_CATALOG.filter(t => intents.includes(t.style));
    if (candidates.length > 0) {
      // Prefere rotação se estiver na lista de candidatos
      const inRotation = candidates.find(c => c.id === rotationId);
      const chosen = inRotation || candidates[week % candidates.length];
      return { id: chosen.id, name: chosen.name, durationFrames: chosen.frames };
    }
  }

  // 4. Fallback: rotação semanal
  const tpl = TEMPLATE_CATALOG.find(t => t.id === rotationId) || TEMPLATE_CATALOG[0];
  return { id: tpl.id, name: tpl.name, durationFrames: tpl.frames };
}

module.exports = { selectTemplate, TEMPLATE_CATALOG };
