// Script Schema — Video Ad Intelligence Agent

export const SCRIPT_SCHEMA = {
  ad_id:        '',
  title:        '',
  platform:     '',          // instagram_reel | meta_ad | youtube_short | vsl
  objective:    '',          // lead_generation | awareness | retargeting | conversion
  audience:     '',
  funnel_stage: '',          // tofu | mofu | bofu
  offer:        '',
  hook:         '',
  framework:    '',          // PAS | AIDA | BAB | VSL | PADS
  duration:     60,          // seconds
  status:       'draft',     // draft | approved | testing | winner | loser | scaled
  scenes:       [],
  cta:          '',
  visual_style: '',
  performance_hypothesis: '',
  success_metric:         '',
  testing_plan:           '',
  expected_cpa:           null,
  created_at:   new Date().toISOString(),
};

export const SCENE_SCHEMA = {
  scene_number:      1,
  duration:          3,          // seconds
  objective:         '',         // stop_scroll | build_tension | deliver_insight | convert
  spoken_text:       '',
  on_screen_text:    '',
  visual_direction:  '',         // what the viewer sees
  animation_direction: '',
  camera_direction:  '',
  emotional_trigger: '',         // fear | curiosity | authority | hope | urgency
  retention_purpose: '',
  b_roll_suggestion: '',
  transition:        'cut',
};

export const CREATIVE_BRIEF_SCHEMA = {
  ad_name:           '',
  objective:         '',
  platform:          '',
  audience:          '',
  funnel_stage:      '',
  main_pain:         '',
  offer:             '',
  hook_options:      [],
  selected_hook:     '',
  framework:         '',
  script:            null,
  scenes:            [],
  visual_direction:  '',
  thumbnail_ideas:   [],
  cta:               '',
  landing_page:      '',
  testing_plan:      '',
  success_metric:    '',
  expected_cpa:      null,
  risk:              '',
  next_step:         '',
};

export const STORYBOARD_SCHEMA = {
  ad_id:        '',
  total_scenes: 0,
  total_duration: 0,
  visual_style: '',
  scenes: [],
};

export const STORYBOARD_SCENE = {
  scene_number:       1,
  duration:           3,
  objective:          '',
  spoken_text:        '',
  on_screen_text:     '',
  visual_direction:   '',
  animation_direction: '',
  camera_direction:   '',
  b_roll_suggestion:  '',
  transition:         'cut',
  retention_purpose:  '',
};

// Validate a script object
export function validateScript(script) {
  const required = ['ad_id', 'title', 'platform', 'objective', 'hook', 'scenes', 'cta'];
  const missing  = required.filter(f => !script[f]);
  if (missing.length > 0) throw new Error(`Script missing: ${missing.join(', ')}`);
  if (!script.scenes || script.scenes.length === 0) throw new Error('Script has no scenes');
  const totalDuration = script.scenes.reduce((s, sc) => s + sc.duration, 0);
  if (Math.abs(totalDuration - script.duration) > 3) {
    console.warn(`Scene durations (${totalDuration}s) differ from script.duration (${script.duration}s)`);
  }
  return true;
}
