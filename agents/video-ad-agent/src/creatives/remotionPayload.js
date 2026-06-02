// Build a VideoProject JSON payload to send to the Remotion Video Agent

import { CONFIG } from '../config.js';

const TEMPLATE_MAP = {
  'meta-reel-ad':       'VideoAdTemplate',
  'local-business-ad':  'LocalBusinessTemplate',
  'diagnostic-offer-ad':'DiagnosticTemplate',
  'automation-ad':      'AutomationTemplate',
  'vsl-short':          'VSLTemplate',
};

export function buildRemotionPayload(script) {
  const duration = script.duration ?? 60;
  const template = TEMPLATE_MAP[script.template_id] ?? 'VideoAdTemplate';

  return {
    source_agent:  'video_ad_agent',
    creative_type: script.platform ?? 'instagram_reel',
    objective:     script.objective,
    platform:      script.platform ?? 'instagram_reel',

    // VideoProject schema (remotion/src/data/video.schema.ts)
    videoId:     script.ad_id,
    title:       script.title,
    format:      script.platform ?? 'instagram_reel',
    aspectRatio: '9:16',
    duration,
    fps:         30,
    objective:   script.objective,
    audience:    script.audience ?? CONFIG.company.audience,
    theme:       script.topic ?? '',
    template,

    cta: {
      type:    'diagnostic',
      text:    script.cta ?? CONFIG.company.ctaText,
      subtext: `${CONFIG.company.location} · Presencial · Black Belt`,
    },

    brand: {
      primaryColor:    '#7C3AED',
      accentColor:     '#10B981',
      backgroundColor: '#0A0A0F',
    },

    scenes: (script.scenes ?? []).map((scene, i) => ({
      id:          `scene_${i + 1}`,
      type:        mapSceneType(scene.objective),
      duration:    scene.duration,
      headline:    scene.on_screen_text ?? '',
      body:        scene.spoken_text ?? '',
      animation:   'slide-up',
      visual:      'dark-gradient',
    })),
  };
}

function mapSceneType(objective = '') {
  if (objective.includes('stop_scroll') || objective.includes('hook'))  return 'hook';
  if (objective.includes('problem') || objective.includes('pain'))      return 'problem';
  if (objective.includes('quantify') || objective.includes('data'))     return 'data';
  if (objective.includes('insight') || objective.includes('cause'))     return 'insight';
  if (objective.includes('solution') || objective.includes('method'))   return 'solution';
  if (objective.includes('proof') || objective.includes('result'))      return 'case_result';
  if (objective.includes('convert') || objective.includes('cta'))       return 'cta';
  return 'solution';
}

// Send payload to Remotion Agent via pipeline server
export async function sendToRemotionAgent(payload) {
  const url = 'https://n8n-pipeline-server.sumjyb.easypanel.host/run-pipeline';
  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      taskName:    payload.videoId,
      taskDate:    new Date().toISOString().split('T')[0],
      videoAdData: payload,
      skipPost:    true,
    }),
  });
  if (!response.ok) throw new Error(`Remotion pipeline error: ${response.status}`);
  return response.json();
}
