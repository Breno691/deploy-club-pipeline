#!/usr/bin/env node
/**
 * Video Ad Intelligence Agent — SmartOps IA
 * Diretor de Performance Criativa
 *
 * Usage:
 *   node video_ad_agent.js --topic "retrabalho" --platform instagram_reel --duration 60
 *   node video_ad_agent.js --vsl --type short --topic "gargalos operacionais"
 *   node video_ad_agent.js --hooks --topic "automação"
 *   node video_ad_agent.js --analyze --creative-id <id>
 */

import { generateHooks, getTopHooks, selectBestHook } from './src/agents/HookAgent.js';
import { generateScript, generateScriptVariations }    from './src/agents/ScriptAgent.js';
import { generateVSL }                                 from './src/agents/VSLAgent.js';
import { generateReport }                              from './src/agents/AdAnalyticsAgent.js';
import { buildRemotionPayload }                        from './src/creatives/remotionPayload.js';
import { CONFIG, OFFERS }                              from './src/config.js';
import { writeFileSync, mkdirSync, existsSync }        from 'fs';
import { join }                                        from 'path';

const args = process.argv.slice(2);

function getArg(name, fallback = null) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

function hasFlag(name) { return args.includes(`--${name}`); }

function saveOutput(filename, data) {
  const dir = join(process.cwd(), 'outputs');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const path = join(dir, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\nSalvo em: ${path}`);
  return path;
}

async function main() {
  const topic    = getArg('topic', 'retrabalho operacional');
  const platform = getArg('platform', 'instagram_reel');
  const duration = parseInt(getArg('duration', '60'), 10);
  const framework= getArg('framework', 'PAS');
  const offer    = OFFERS[parseInt(getArg('offer-index', '0'), 10)];

  console.log('=== VIDEO AD INTELLIGENCE AGENT ===');
  console.log(`Tema: ${topic}`);
  console.log(`Plataforma: ${platform}`);

  // ── MODE: Generate hooks only ──────────────────────────────────────────────
  if (hasFlag('hooks')) {
    console.log('\n→ Gerando hooks...');
    const hooks = await generateHooks(topic, 'lead_generation', 20);
    console.log(`\n✓ ${hooks.length} hooks gerados. Top 5:\n`);
    hooks.slice(0, 5).forEach((h, i) => {
      console.log(`${i + 1}. [${h.score}] "${h.text}" (${h.category})`);
    });
    saveOutput(`hooks-${topic.replace(/\s/g, '-')}-${Date.now()}.json`, hooks);
    return;
  }

  // ── MODE: Generate VSL ─────────────────────────────────────────────────────
  if (hasFlag('vsl')) {
    const type = getArg('type', 'short');
    console.log(`\n→ Gerando VSL ${type}...`);
    const vsl = await generateVSL({ topic, offer, type, landingPage: hasFlag('landing') });
    console.log('\n✓ VSL gerada:');
    console.log(`  Duração: ${vsl.duration}s | Seções: ${vsl.sections?.length}`);
    saveOutput(`vsl-${type}-${Date.now()}.json`, vsl);
    return;
  }

  // ── MODE: Generate script (default) ───────────────────────────────────────
  console.log('\n→ Gerando hooks...');
  const hooks = await generateHooks(topic, 'lead_generation', 10);
  const hook  = selectBestHook(hooks, platform);
  console.log(`✓ Hook selecionado [score ${hook.finalScore}]: "${hook.text}"`);

  console.log('\n→ Gerando script...');
  const script = await generateScript({
    topic, hook: hook.text, offer, platform, duration, framework,
    funnel_stage: getArg('funnel', 'tofu'),
  });
  console.log(`✓ Script gerado: ${script.scenes?.length} cenas, ${duration}s`);

  // Build Remotion payload
  const payload = buildRemotionPayload({ ...script, topic });
  console.log(`\n→ Payload Remotion pronto. Template: ${payload.template}`);

  // Creative brief
  const brief = {
    ad_name:        script.title,
    objective:      script.objective,
    platform,
    hook:           hook.text,
    hook_score:     hook.finalScore,
    framework,
    offer:          offer.name,
    cta:            script.cta,
    script,
    remotion_payload: payload,
    performance_hypothesis: script.performance_hypothesis,
    success_metric:         script.success_metric,
    testing_plan:           script.testing_plan,
    generated_at:           new Date().toISOString(),
  };

  const ts = Date.now();
  saveOutput(`script-${ts}.json`,   script);
  saveOutput(`brief-${ts}.json`,    brief);
  saveOutput(`remotion-${ts}.json`, payload);

  console.log('\n=== BRIEF EXECUTIVO ===');
  console.log(`Título:     ${script.title}`);
  console.log(`Hook:       "${hook.text}" [score ${hook.finalScore}]`);
  console.log(`Framework:  ${framework}`);
  console.log(`Oferta:     ${offer.name}`);
  console.log(`CTA:        ${script.cta}`);
  console.log(`Hipótese:   ${script.performance_hypothesis}`);
  console.log(`Métrica:    ${script.success_metric}`);
}

main().catch(err => {
  console.error('Video Ad Agent error:', err.message);
  process.exit(1);
});
