// AuthorityContentAgent.js — Authority Building Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function repurposeContent(sourceData) {
  const { source_type, title, summary, audience, key_insights = [] } = sourceData;

  const prompt = `Você é o Authority Content Agent da SmartOps IA.

Speaker: Breno Luiz — Lean Six Sigma + IA para PMEs — BH/MG
Empresa: SmartOps IA

Transforme este conteúdo em múltiplos formatos para maximizar autoridade.

Fonte: ${source_type} (palestra | podcast | live | artigo | case)
Título: ${title}
Resumo: ${summary}
Público: ${audience}
Insights principais: ${key_insights.join(' | ')}

Gere o plano de repurposing completo:

Retorne JSON:
{
  "source": {
    "type": "${source_type}",
    "title": "${title}"
  },
  "repurposed_content": {
    "reels_instagram": [
      { "id": 1, "topic": "tema do Reel", "hook": "primeira frase", "duration": "30-60s", "cta": "CTA" }
    ],
    "linkedin_posts": [
      { "id": 1, "type": "opinion | case | lesson", "headline": "título", "angle": "ângulo" }
    ],
    "carousel_instagram": {
      "title": "título do carrossel",
      "slides": ["slide 1", "slide 2", "slide 3", "slide 4", "slide 5"],
      "cta_slide": "CTA no último slide"
    },
    "youtube_short": {
      "title": "título do Short",
      "hook": "primeiros 3 segundos",
      "main_point": "ponto central"
    },
    "email_nurture": {
      "subject": "assunto do email",
      "hook_line": "primeira linha",
      "main_message": "mensagem principal",
      "cta": "chamada para ação"
    },
    "quote_card": "frase de autoridade para imagem",
    "thread_linkedin": ["post 1", "post 2", "post 3", "post 4", "post 5"]
  },
  "publication_schedule": "sugestão de programação para publicar tudo",
  "total_pieces": 0,
  "authority_amplification": "como esta repurposagem amplifica autoridade"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AuthorityContentAgent: no JSON from Claude');
  const data = JSON.parse(jsonMatch[0]);
  data.generated_at = new Date().toISOString();
  return data;
}

async function generateLiveCollaborationPlan(partnerData) {
  const { partner_name, partner_type, audience, topic = '' } = partnerData;

  const prompt = `Você é o Authority Content Agent da SmartOps IA.

Crie um plano de live/colaboração com este parceiro.

SmartOps / Breno: Lean Six Sigma + IA para PMEs — BH
Parceiro: ${partner_name}
Tipo do parceiro: ${partner_type}
Público conjunto: ${audience}
Tema sugerido: ${topic || 'escolha o melhor tema para ambos'}

Retorne JSON:
{
  "live_title": "título da live",
  "tagline": "subtítulo chamativo",
  "topic": "tema central",
  "audience_benefit": "o que o público vai ganhar",
  "duration": "45min | 60min | 90min",
  "format": "bate-papo | painel | workshop | Q&A",
  "agenda": [
    { "time": "0-5min", "segment": "abertura e apresentação" },
    { "time": "5-20min", "segment": "primeiro bloco" },
    { "time": "20-35min", "segment": "segundo bloco" },
    { "time": "35-50min", "segment": "Q&A" },
    { "time": "50-60min", "segment": "encerramento e CTA" }
  ],
  "breno_talking_points": ["ponto 1", "ponto 2", "ponto 3"],
  "partner_talking_points": ["ponto 1", "ponto 2"],
  "lead_generation": "como capturar leads na live",
  "promotion_plan": {
    "pre_live": "como divulgar antes",
    "during": "como engajar durante",
    "post_live": "como reaproveitar depois"
  },
  "cta_end": "CTA ao final da live",
  "repurpose_plan": ["conteúdo 1 gerado", "conteúdo 2 gerado"],
  "expected_reach": "alcance estimado",
  "authority_value": "como esta live constrói autoridade"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AuthorityContentAgent live: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { repurposeContent, generateLiveCollaborationPlan };
