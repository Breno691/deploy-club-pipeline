import Anthropic from '@anthropic-ai/sdk';
import { CONFIG } from '../config.js';
import hookLibrary from '../hooks/hookLibrary.json' assert { type: 'json' };
import hookCategories from '../hooks/hookCategories.json' assert { type: 'json' };

const client = new Anthropic();

// Score a single hook based on criteria
export function scoreHook(hook, context = {}) {
  let score = hook.score ?? 70;
  const text = hook.text.toLowerCase();

  // Boost for numbers
  if (/\d/.test(text))            score += 5;
  // Boost for BH/MG local reference
  if (/bh|belo horizonte|minas/i.test(text)) score += 4;
  // Boost for specific pain words
  if (/retrabalho|gargalo|desperdício|custo/i.test(text)) score += 3;
  // Boost for question
  if (text.includes('?'))         score += 2;
  // Cap at 100
  return Math.min(100, score);
}

// Get top N hooks from library filtered by category
export function getTopHooks(n = 5, category = null) {
  let hooks = hookLibrary.hooks;
  if (category) hooks = hooks.filter(h => h.category === category);
  return hooks
    .map(h => ({ ...h, finalScore: scoreHook(h) }))
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, n);
}

// Generate new hooks via Claude AI for a given topic
export async function generateHooks(topic, objective = 'lead_generation', count = 10) {
  const categories = hookCategories.categories.map(c => c.id).join(', ');
  const topExamples = getTopHooks(5).map(h => `"${h.text}" (score ${h.score})`).join('\n');

  const prompt = `Você é o Hook Agent da SmartOps IA — especialista em criar os primeiros 3 segundos de anúncios que param o scroll.

SmartOps IA é consultoria de Lean Six Sigma + Automação com IA para PMEs em BH/MG.
Dono: Breno Luiz, Black Belt Lean Six Sigma.
Objetivo do anúncio: ${objective}
Tema: ${topic}

Exemplos dos melhores hooks da biblioteca:
${topExamples}

Gere exatamente ${count} hooks para o tema "${topic}".

Distribua pelas categorias: ${categories}

Para cada hook, responda em JSON:
{
  "hooks": [
    {
      "text": "...",
      "category": "...",
      "score": 0-100,
      "why_it_works": "...",
      "best_platform": "instagram_reel | meta_ad | youtube_short",
      "visual_first_frame": "descrição do que o espectador vê no frame 0"
    }
  ]
}

Regras:
- Nunca use introduções longas
- Nunca comece com "Olá" ou "Ei, tudo bem"
- Use números concretos quando possível
- Conecte com BH/MG quando fizer sentido
- Seja direto e gere tensão imediata
`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('HookAgent: Claude did not return valid JSON');

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.hooks.map(h => ({ ...h, finalScore: scoreHook(h) }))
                     .sort((a, b) => b.finalScore - a.finalScore);
}

// Select the best hook for a given context
export function selectBestHook(hooks, platform = 'instagram_reel') {
  const filtered = hooks.filter(h => !h.best_platform || h.best_platform === platform);
  return (filtered.length > 0 ? filtered : hooks).sort((a, b) => (b.finalScore ?? b.score) - (a.finalScore ?? a.score))[0];
}
