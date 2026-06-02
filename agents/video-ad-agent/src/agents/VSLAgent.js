import Anthropic from '@anthropic-ai/sdk';
import { CONFIG, OFFERS } from '../config.js';

const client = new Anthropic();

// VSL structure templates
export const VSL_SHORT = {
  name:     'VSL Curta (2–3 min)',
  duration: 150,
  sections: [
    { name: 'Hook',            duration: 10, objective: 'stop_scroll' },
    { name: 'Problema',        duration: 20, objective: 'build_tension' },
    { name: 'Custo Invisível', duration: 20, objective: 'quantify_pain' },
    { name: 'Causa Raiz',      duration: 20, objective: 'reveal_insight' },
    { name: 'Método SmartOps', duration: 25, objective: 'present_solution' },
    { name: 'ROI Esperado',    duration: 20, objective: 'justify_investment' },
    { name: 'Oferta',          duration: 15, objective: 'present_offer' },
    { name: 'CTA',             duration: 20, objective: 'convert' },
  ],
};

export const VSL_LONG = {
  name:     'VSL Longa (5–12 min)',
  duration: 480,
  sections: [
    { name: 'Headline de Abertura',   duration: 15, objective: 'attention' },
    { name: 'Identificação da Dor',   duration: 45, objective: 'qualify_viewer' },
    { name: 'História ou Contexto',   duration: 60, objective: 'build_rapport' },
    { name: 'Diagnóstico do Problema',duration: 60, objective: 'reveal_root_cause' },
    { name: 'Custo da Ineficiência',  duration: 45, objective: 'quantify_problem' },
    { name: 'Método SmartOps',        duration: 60, objective: 'present_solution' },
    { name: 'Prova e ROI',            duration: 60, objective: 'build_credibility' },
    { name: 'Oferta',                 duration: 45, objective: 'present_offer' },
    { name: 'Quebra de Objeções',     duration: 60, objective: 'handle_objections' },
    { name: 'CTA',                    duration: 30, objective: 'convert' },
  ],
};

export async function generateVSL({
  topic,
  audience       = CONFIG.company.audience,
  offer          = OFFERS[0],
  type           = 'short',   // 'short' | 'long'
  landingPage    = false,
} = {}) {
  const template = type === 'long' ? VSL_LONG : VSL_SHORT;

  const prompt = `Você é o VSL Agent da SmartOps IA — especialista em Video Sales Letters.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.
Breno Luiz: Black Belt Lean Six Sigma.

PARÂMETROS:
- Tema: ${topic}
- Tipo de VSL: ${template.name}
- Duração total: ${template.duration}s
- Público: ${audience}
- Oferta: ${offer.name} — ${offer.promise}
- CTA principal: ${offer.cta}
- Uso: ${landingPage ? 'Landing Page' : 'Anúncio pago'}

ESTRUTURA OBRIGATÓRIA:
${template.sections.map((s, i) => `${i + 1}. ${s.name} (${s.duration}s) — Objetivo: ${s.objective}`).join('\n')}

Gere a VSL completa em JSON:
{
  "vsl_id": "vsl-auto-${Date.now()}",
  "type": "${type}",
  "duration": ${template.duration},
  "topic": "${topic}",
  "audience": "${audience}",
  "offer": "${offer.name}",
  "sections": [
    {
      "section_name": "...",
      "duration": 0,
      "objective": "...",
      "spoken_script": "...",
      "on_screen_text": "...",
      "visual_direction": "...",
      "emotional_goal": "...",
      "key_message": "..."
    }
  ],
  "objections_handled": ["...", "..."],
  "cta": "${offer.cta}",
  "expected_conversion_impact": "...",
  "performance_hypothesis": "..."
}

REGRAS CRÍTICAS:
- Nunca invente resultados reais de clientes
- Nunca prometa resultado garantido
- A dor deve ser específica e reconhecível pelo empresário BH
- O ROI deve ser lógico e calculável (não mágico)
- O CTA deve ser de baixo risco (diagnóstico gratuito)
- Cada seção deve fluir naturalmente para a próxima
`;

  const response = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('VSLAgent: Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}
