// InstagramProfileAgent.js — Personal Brand Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { BRENO } = require('../config');

const client = new Anthropic();

const HIGHLIGHT_COVERS = [
  { name: 'Sobre',      icon: '👤', content: 'Quem é Breno e o que faz' },
  { name: 'Diagnóstico',icon: '🔍', content: 'Como funciona o diagnóstico gratuito' },
  { name: 'Cases',      icon: '📊', content: 'Resultados de clientes' },
  { name: 'Lean',       icon: '⚙️', content: 'Conteúdo sobre Lean e desperdícios' },
  { name: 'IA',         icon: '🤖', content: 'Automação e IA aplicada' },
  { name: 'Processos',  icon: '🗂️', content: 'Mapeamento e melhoria de processos' },
  { name: 'Parceiros',  icon: '🤝', content: 'Parcerias e colaborações' },
  { name: 'Palestras',  icon: '🎙️', content: 'Eventos e apresentações' },
];

async function generateInstagramProfile() {
  const prompt = `Você é o Instagram Profile Agent da SmartOps IA.

Otimize o perfil Instagram de ${BRENO.name} para gerar autoridade e leads B2B.

Perfil:
- ${BRENO.title}
- Fundador da ${BRENO.company}
- ${BRENO.location}
- Especialidades: ${BRENO.specialty.join(', ')}
- Público: Donos de PMEs em BH/MG

Objetivo: transformar o Instagram em vitrine de autoridade e canal de geração de leads.

Retorne JSON:
{
  "username_suggestion": "@smartops.ia",
  "name_field": "Breno Luiz | Lean + IA PME",
  "bio": {
    "line1": "primeira linha — quem é e o que faz",
    "line2": "segunda linha — público e resultado",
    "line3": "terceira linha — localização",
    "line4": "quarta linha — CTA com emoji ↓",
    "full_bio": "bio completa formatada para o campo do Instagram",
    "character_count": 0
  },
  "link_in_bio_strategy": "o que colocar no link (Linktree ou página de diagnóstico)",
  "profile_photo_tip": "orientação sobre foto de perfil",
  "highlights": [
    { "name": "nome do destaque", "content": "o que publicar", "first_story": "sugestão da primeira story" }
  ],
  "pinned_posts": [
    { "position": 1, "content": "tema do post fixado", "why": "por que fixar este" }
  ],
  "content_strategy": {
    "frequency": "X posts/semana",
    "formats": ["Reel | Carrossel | Post estático | Story"],
    "best_times": "horários de maior engajamento",
    "hashtag_strategy": "estratégia de hashtags"
  },
  "reels_strategy": "como usar Reels para gerar autoridade e alcance",
  "stories_strategy": "como usar Stories para nutrir leads",
  "cta_placements": ["onde colocar CTA para diagnóstico"],
  "visual_identity": {
    "color_palette": "paleta de cores para o feed",
    "font_style": "estilo de fonte",
    "grid_layout": "sugestão de layout do feed"
  },
  "optimization_score": 0,
  "missing_elements": ["o que está faltando para perfil forte"],
  "quick_wins": ["3 ações rápidas para melhorar o perfil agora"]
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('InstagramProfileAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.highlight_covers = HIGHLIGHT_COVERS;
  data.generated_at = new Date().toISOString();
  return data;
}

async function generateInstagramContentPlan(weekTheme = '') {
  const prompt = `Você é o Instagram Profile Agent da SmartOps IA.

Crie um plano de conteúdo Instagram para a semana.

Speaker/Creator: ${BRENO.name} — ${BRENO.title} — ${BRENO.company}
Posicionamento: "${BRENO.positioning}"
Tema da semana: ${weekTheme || 'livre — escolha o melhor para crescimento de autoridade'}

Pilares de conteúdo disponíveis:
- autoridade_tecnica: Lean, Six Sigma, IA, automação
- autoridade_pratica: bastidores, diagnósticos, antes/depois
- autoridade_local: BH, PMEs locais, presencial
- educacao_mercado: desperdício, custo invisível, retrabalho
- prova_social: cases, resultados, depoimentos
- humanizacao: trajetória, crenças, visão

Retorne JSON:
{
  "week_theme": "tema da semana",
  "posts": [
    {
      "day": "Segunda",
      "format": "Reel | Carrossel | Post | Story",
      "pillar": "pilar",
      "topic": "tema específico",
      "hook": "primeira frase ou cena",
      "cta": "call to action",
      "caption_preview": "prévia da legenda",
      "hashtags": ["#hashtag1", "#hashtag2"]
    }
  ],
  "reels_of_the_week": "tema do Reel principal",
  "story_sequence": "sequência de stories para nutrir",
  "lead_capture_moment": "qual post ou ação vai gerar lead direto",
  "authority_goal": "como esta semana constrói autoridade"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('InstagramProfileAgent plan: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateInstagramProfile, generateInstagramContentPlan, HIGHLIGHT_COVERS };
