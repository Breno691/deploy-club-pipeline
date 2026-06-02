import Anthropic from '@anthropic-ai/sdk';
import { CONFIG, OFFERS, PAINS } from '../config.js';
import { SCRIPT_SCHEMA, SCENE_SCHEMA, validateScript } from '../scripts/script.schema.js';

const client = new Anthropic();

const FRAMEWORKS = {
  PAS:  'Problem → Agitate → Solution. Ideal para dor forte: retrabalho, desperdício.',
  AIDA: 'Attention → Interest → Desire → Action. Ideal para anúncios gerais e educativos.',
  BAB:  'Before → After → Bridge. Ideal para cases e antes/depois.',
  PADS: 'Problem → Agitate → Discredit → Solution. Ideal para quebrar crenças antigas.',
  VSL:  'Hook → Dor → Custo → Causa → Método → ROI → Oferta → CTA. Ideal para VSL.',
};

export async function generateScript({
  topic,
  hook,
  offer       = OFFERS[0],
  platform    = 'instagram_reel',
  objective   = 'lead_generation',
  audience    = CONFIG.company.audience,
  duration    = 60,
  framework   = 'PAS',
  funnel_stage = 'tofu',
} = {}) {
  const frameworkDesc = FRAMEWORKS[framework] || FRAMEWORKS.PAS;
  const pains = PAINS.slice(0, 5).join('; ');

  const prompt = `Você é o Script Agent da SmartOps IA — especialista em anúncios de direct response.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Breno Luiz: Black Belt Lean Six Sigma.

PARÂMETROS DO ANÚNCIO:
- Tema: ${topic}
- Plataforma: ${platform}
- Objetivo: ${objective}
- Público: ${audience}
- Duração: ${duration}s
- Framework: ${framework} (${frameworkDesc})
- Funil: ${funnel_stage}
- Hook: "${hook}"
- Oferta: ${offer.name} — ${offer.promise}
- CTA: ${offer.cta}

DORES DO PÚBLICO:
${pains}

Crie um script completo em JSON seguindo exatamente este schema:

{
  "ad_id": "auto-${Date.now()}",
  "title": "...",
  "platform": "${platform}",
  "objective": "${objective}",
  "audience": "...",
  "funnel_stage": "${funnel_stage}",
  "offer": "${offer.name}",
  "hook": "${hook}",
  "framework": "${framework}",
  "duration": ${duration},
  "scenes": [
    {
      "scene_number": 1,
      "duration": 3,
      "objective": "stop_scroll",
      "spoken_text": "...",
      "on_screen_text": "...",
      "visual_direction": "...",
      "emotional_trigger": "...",
      "retention_purpose": "..."
    }
  ],
  "cta": "${offer.cta}",
  "visual_style": "premium-dark-consulting",
  "performance_hypothesis": "...",
  "success_metric": "CPA ≤ R$${CONFIG.targets.cpa}",
  "testing_plan": "..."
}

REGRAS:
- Hook nos primeiros 3s (scene 1)
- Dor/problema nos próximos 6-8s
- Insight ou dado nos próximos 8-12s
- Solução clara nos próximos 10-15s
- CTA direto nos últimos 5-7s
- Nunca invente resultados reais de clientes
- Nunca prometa resultado garantido
- Use linguagem direta, sem jargão acadêmico
- Total de cenas deve somar ${duration}s
`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('ScriptAgent: Claude did not return valid JSON');

  const script = JSON.parse(jsonMatch[0]);
  validateScript(script);
  return script;
}

// Generate 3 script variations for A/B testing
export async function generateScriptVariations(baseScript, hooks = []) {
  const variations = [];
  for (let i = 0; i < Math.min(3, hooks.length); i++) {
    const v = await generateScript({
      topic:       baseScript.title,
      hook:        hooks[i].text,
      platform:    baseScript.platform,
      objective:   baseScript.objective,
      duration:    baseScript.duration,
      framework:   baseScript.framework,
      funnel_stage: baseScript.funnel_stage,
    });
    variations.push({ ...v, variation: i + 1, hook_score: hooks[i].finalScore });
  }
  return variations;
}
