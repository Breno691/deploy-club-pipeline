// TrustBuildingAgent.js — Personal Brand Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { BRENO } = require('../config');

const client = new Anthropic();

const TRUST_SIGNALS = {
  credentials: ['Black Belt Lean Six Sigma', 'Fundador SmartOps IA', 'Consultor presencial BH/MG'],
  methodology: ['Lean Six Sigma', 'DMAIC', 'Kaizen', 'Value Stream Mapping', 'Automação com n8n'],
  social_proof: ['cases documentados', 'depoimentos', 'palestras', 'parcerias'],
  transparency: ['diagnóstico gratuito', 'processo claro', 'resultados mensuráveis', 'sem promessa milagrosa'],
};

const COMMON_OBJECTIONS = [
  'Nunca ouvi falar da SmartOps IA',
  'É muito caro para a minha empresa',
  'Não tenho tempo para implantação',
  'Já tentei consultoria antes e não funcionou',
  'Minha empresa é pequena demais',
  'Não sei se IA funciona na prática',
  'Como sei que vai dar resultado?',
  'Qual a diferença para outras consultorias?',
];

async function generateTrustContent(objection, format = 'post') {
  const prompt = `Você é o Trust Building Agent da SmartOps IA.

Crie conteúdo que neutraliza esta objeção e constrói confiança.

${BRENO.name}: ${BRENO.title} | ${BRENO.company}
Posicionamento: "${BRENO.positioning}"

Objeção a neutralizar: "${objection}"
Formato: ${format} (post | vídeo | story | email | proposta)

Tom: honesto, direto, sem prometar milagres, baseado em prova real.

Retorne JSON:
{
  "objection": "${objection}",
  "why_they_feel_this": "raiz psicológica da objeção",
  "trust_strategy": "como abordar esta objeção",
  "content": {
    "hook": "primeira linha que valida a objeção sem defender",
    "full_post": "conteúdo completo para o formato solicitado",
    "cta": "CTA para após ler"
  },
  "proof_to_include": ["prova social ou sinal de confiança mais eficaz aqui"],
  "what_not_to_say": "o que evitar ao tratar esta objeção",
  "follow_up_content": "próximo conteúdo para aprofundar confiança",
  "emotional_impact": "sentimento que este conteúdo deve gerar"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('TrustBuildingAgent: no JSON from Claude');
  return JSON.parse(jsonMatch[0]);
}

async function generateTrustSequence(target = 'novo lead') {
  const prompt = `Você é o Trust Building Agent da SmartOps IA.

Crie uma sequência de conteúdos que constrói confiança progressivamente.

${BRENO.name}: ${BRENO.title} | Fundador ${BRENO.company}
Objetivo: aumentar taxa de conversão de ${target}

Objeções comuns:
${COMMON_OBJECTIONS.slice(0, 5).join('\n')}

Sinais de confiança disponíveis:
${JSON.stringify(TRUST_SIGNALS, null, 2)}

Retorne JSON:
{
  "target": "${target}",
  "sequence_name": "nome da sequência",
  "objective": "resultado esperado ao final da sequência",
  "touchpoints": [
    {
      "step": 1,
      "trigger": "quando este conteúdo é mostrado",
      "format": "post | story | email | DM",
      "topic": "tema do conteúdo",
      "trust_element": "qual sinal de confiança reforça",
      "objection_addressed": "objeção que neutraliza",
      "preview": "preview do conteúdo"
    }
  ],
  "total_steps": 0,
  "estimated_time_to_trust": "X dias",
  "conversion_trigger": "momento e formato do CTA final",
  "trust_score_goal": "de X para Y"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('TrustBuildingAgent sequence: no JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateSocialProofFromResult({ metric, sector, location = 'BH', service, platform = 'instagram' }) {
  const prompt = `Você é o Trust Building Agent da SmartOps IA.

Transforme este resultado em prova social forte e honesta.

${BRENO.name}: ${BRENO.title} | ${BRENO.company}

Resultado: ${metric}
Setor: ${sector}
Localização: ${location}
Serviço: ${service}
Plataforma: ${platform}

Regras:
- Nunca inventar números específicos
- Manter anonimato do cliente se não houver permissão
- Tom honesto, não exagerado
- Conectar ao problema que a maioria das PMEs tem

Retorne JSON:
{
  "proof_post": "post de prova social pronto para publicar",
  "linkedin_version": "versão para LinkedIn",
  "instagram_caption": "legenda para Instagram",
  "story_version": "versão curta para Story",
  "hook": "primeira linha chamativa",
  "credibility_elements": ["o que torna esta prova crível"],
  "cta": "CTA ao final",
  "hashtags": ["#hashtag1", "#hashtag2"]
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('TrustBuildingAgent social proof: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = {
  generateTrustContent, generateTrustSequence,
  generateSocialProofFromResult, TRUST_SIGNALS, COMMON_OBJECTIONS,
};
