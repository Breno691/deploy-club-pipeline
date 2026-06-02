// PodcastOpportunityAgent.js — Authority Building Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function findPodcastOpportunities(focus = 'empreendedorismo e negócios locais') {
  const prompt = `Você é o Podcast Opportunity Agent da SmartOps IA.

Guest: Breno Luiz — Black Belt Lean Six Sigma | Automação e IA para PMEs | BH/MG
Empresa: SmartOps IA
Posicionamento: ${CONFIG.speaker.positioning_short}

Identifique podcasts ideais para Breno participar como convidado.

Foco: ${focus}

Tipos de podcast relevantes:
- empreendedorismo e negócios locais (BH/MG)
- gestão de PMEs e eficiência operacional
- inovação e tecnologia para negócios
- produtividade e processos
- finanças e margem para empresas
- marketing B2B e vendas
- liderança e gestão de equipes
- consultoria e serviços profissionais

Ângulos de interesse para hosts:
- "Como PMEs perdem dinheiro sem perceber"
- "IA prática para empresas pequenas"
- "O custo real do retrabalho"
- "Lean Six Sigma desmistificado"
- "Automação acessível para pequenos negócios"

Retorne JSON:
{
  "research_date": "${new Date().toISOString().split('T')[0]}",
  "opportunities": [
    {
      "podcast_name": "nome do podcast",
      "host": "nome do anfitrião",
      "platform": "Spotify | YouTube | Apple | Instagram",
      "audience": "público do podcast",
      "episode_count": "estimativa de episódios",
      "frequency": "frequência de publicação",
      "why_relevant": "por que Breno deve aparecer aqui",
      "suggested_topic": "tema sugerido para o episódio",
      "pitch_angle": "ângulo único para o pitch",
      "contact_approach": "como entrar em contato",
      "score": 0,
      "expected_reach": "alcance estimado"
    }
  ],
  "pitch_template": {
    "subject": "assunto do email de pitch",
    "body": "corpo do pitch de guest (máx 200 palavras)",
    "talking_points": ["ponto 1", "ponto 2", "ponto 3", "ponto 4", "ponto 5"]
  },
  "top_opportunity": "melhor podcast para começar",
  "quick_pitch": "pitch de 30 segundos para qualquer podcast"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PodcastOpportunityAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

async function generatePodcastBrief(podcastData) {
  const { podcast_name, host, audience, suggested_topic } = podcastData;

  const prompt = `Você é o Podcast Opportunity Agent da SmartOps IA.

Prepare o brief para participação de Breno Luiz neste podcast.

Podcast: ${podcast_name}
Host: ${host || 'não informado'}
Público: ${audience}
Tema: ${suggested_topic}

Speaker: Breno Luiz — Black Belt Lean Six Sigma | SmartOps IA | BH/MG

Retorne JSON:
{
  "podcast_name": "${podcast_name}",
  "episode_title_suggestions": ["título 1", "título 2", "título 3"],
  "opening_hook": "como Breno deve se apresentar nos primeiros 30 segundos",
  "key_messages": ["mensagem 1", "mensagem 2", "mensagem 3"],
  "stories_to_tell": ["história/case 1", "história/case 2"],
  "questions_to_expect": [
    { "question": "pergunta provável", "answer_direction": "direção da resposta" }
  ],
  "cta_at_end": "como Breno vai converter ouvintes em leads",
  "social_proof": "provas sociais a mencionar",
  "post_episode_plan": "como reaproveitar o episódio em conteúdo",
  "follow_up_with_host": "mensagem de agradecimento e próximos passos"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PodcastOpportunityAgent brief: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { findPodcastOpportunities, generatePodcastBrief };
