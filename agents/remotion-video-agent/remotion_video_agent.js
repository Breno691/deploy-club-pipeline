#!/usr/bin/env node
/**
 * Remotion Video Agent — SmartOps IA
 * Geração de vídeos motion design com React + Remotion
 * Diretor criativo de vídeos de performance para Lean, Automação e IA
 *
 * Usage:
 *   node remotion_video_agent.js --mode lean-waste --tema retrabalho
 *   node remotion_video_agent.js --mode automation --tema follow-up
 *   node remotion_video_agent.js --mode case-study --setor industria
 *   node remotion_video_agent.js --mode authority --tema black-belt
 *   node remotion_video_agent.js --mode ad --formato meta_ad
 *   node remotion_video_agent.js --mode six-sigma --tema dmaic
 *   node remotion_video_agent.js --mode local-business --bairro savassi
 *   node remotion_video_agent.js --mode generate --tema "automação reduz custo" --template Automation --formato instagram_reel
 *   node remotion_video_agent.js --mode template --nome CaseStudy
 *   node remotion_video_agent.js --mode render --json outputs/video_2026-06-01/video.json
 *   node remotion_video_agent.js --mode pipeline --tema "retrabalho" --template LeanWaste
 *   node remotion_video_agent.js --mode audit
 *   node remotion_video_agent.js --mode report
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

// ─── PURE FUNCTIONS ──────────────────────────────────────────────────────────

function generateVideoId(tema, template) {
  const slug = tema.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const date = new Date().toISOString().split('T')[0];
  return `${template.toLowerCase()}-${slug}-${date}`;
}

function calcVideoDuration(scenes) {
  return scenes.reduce((acc, s) => acc + (s.duration || 0), 0);
}

function scoreVideoProject(project) {
  let score = 0;
  // Hook forte
  const hookScene = project.scenes?.find(s => s.type === 'hook');
  if (hookScene?.headline?.length >= 20) score += 20;
  if (hookScene?.animation === 'kinetic-impact') score += 10;
  // Dados/métricas
  const dataScene = project.scenes?.find(s => s.type === 'data');
  if (dataScene?.metrics?.length >= 2) score += 15;
  // CTA claro
  const ctaScene = project.scenes?.find(s => s.type === 'cta');
  if (ctaScene) score += 15;
  if (project.cta?.type !== 'follow') score += 10;
  // Duração adequada
  const dur = calcVideoDuration(project.scenes || []);
  if (dur >= 25 && dur <= 45) score += 20;
  // Objetivo comercial
  if (['lead_generation', 'conversion'].includes(project.objective)) score += 10;
  return { score, label: score >= 80 ? '🟢 Excelente' : score >= 60 ? '🟡 Bom' : '🔴 Revisar' };
}

function buildRenderCmd(jsonPath, compositionId, outputPath) {
  const remotionRoot = path.resolve(__dirname, '..', '..', 'remotion');
  return [
    `cd "${remotionRoot}"`,
    `npx remotion render src/index.ts ${compositionId}`,
    `--props="${path.resolve(jsonPath)}"`,
    `--output="${path.resolve(outputPath)}"`,
    '--codec=h264',
  ].join(' ');
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `video_${date}`);
  ['jsons', 'scripts', 'briefs', 'templates'].forEach(d => {
    if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true });
  });
  return { dir, date };
}

function save(dir, fn, c) {
  const p = path.join(dir, fn);
  fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}

async function ask(prompt) {
  const r = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return r.content[0].text;
}

// ─── BASE PROMPT ─────────────────────────────────────────────────────────────

const BASE = `Você é o Remotion Video Agent da SmartOps IA — diretor criativo de motion design e vídeos de performance.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Missão: Transformar temas de Lean, Automação e IA em vídeos curtos que geram leads, autoridade e conversões.

BRAND TOKENS:
Background: ${CONFIG.brand.background} | Primary (roxo): ${CONFIG.brand.primary} | Accent (verde): ${CONFIG.brand.accent}
Fontes: ${CONFIG.brand.headlineFont} (headlines) + ${CONFIG.brand.bodyFont} (corpo)

TEMPLATES ATIVOS: ${Object.entries(CONFIG.templates).filter(([,v]) => v.status === 'ativo').map(([k,v]) => `${k} (${v.duracao}s)`).join(', ')}
TEMPLATES A CRIAR: ${Object.entries(CONFIG.templates).filter(([,v]) => v.status === 'criar').map(([k]) => k).join(', ')}

ESTRUTURA IDEAL 35s:
${Object.entries(CONFIG.structure_35s).map(([tipo, info]) => `- ${tipo}: ${info.duracao}s — ${info.objetivo}`).join('\n')}

REGRAS CRÍTICAS:
1. NUNCA começar com "Olá, sou o Breno..." ou introdução genérica
2. NUNCA usar CTA fraco ("saiba mais", "acesse")
3. SEMPRE um número concreto na cena de dados
4. SEMPRE uma única ação no CTA
5. Mudar elemento visual a cada 2-3 segundos (retenção)
6. Palavras-chave em destaque: ${CONFIG.keywords.slice(0, 8).join(', ')}

FORMATO DE SAÍDA JSON (VideoProject):
- videoId, title, format, aspectRatio, duration, fps, objective, audience, theme, template, cta, brand, scenes[]
- Cada scene: id, type, duration, headline, subheadline?, body?, bullets[]?, metrics[]?, animation, visual?
- CTA obrigatório: type (diagnostic/whatsapp/website/follow/save), text, url?, subtext?`;

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  REMOTION VIDEO AGENT — SmartOps IA             ║');
  console.log('║  "Os primeiros 4s decidem tudo."                ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      // ─── LEAN WASTE ─────────────────────────────────────────────────────
      case 'lean-waste': {
        const temaKey  = getArg('tema', 'retrabalho');
        const formato  = getArg('formato', 'instagram_reel');
        const temaInfo = CONFIG.themes.LeanWaste.find(t => t.tema.includes(temaKey)) || CONFIG.themes.LeanWaste[0];
        const videoId  = generateVideoId(temaInfo.tema, 'LeanWaste');
        const fmtInfo  = CONFIG.formats[formato] || CONFIG.formats.instagram_reel;

        console.log(`\n📹 Gerando vídeo Lean Waste:`);
        console.log(`  Tema: ${temaInfo.tema}`);
        console.log(`  Hook: "${temaInfo.hook}"`);
        console.log(`  Dado: ${temaInfo.dado}`);

        const result = await ask(`${BASE}

TEMPLATE: LeanWaste | FORMATO: ${formato} (${fmtInfo.ratio}, ${fmtInfo.fps}fps)
TEMA: ${temaInfo.tema}
HOOK SUGERIDO: "${temaInfo.hook}"
DADO CENTRAL: "${temaInfo.dado}"
VIDEO ID: ${videoId}

Gere o VideoProject JSON COMPLETO e o Brief criativo:

## BRIEF CRIATIVO

### Conceito
[A big idea em 1 frase — o que vai fazer o espectador parar]

### Hook (0-${CONFIG.structure_35s.hook.duracao}s)
[Exatamente como começa — visual + texto + por que para o scroll]

### Arco Narrativo
[Como as cenas se encadeiam emocionalmente]

### Destaque Visual
[O elemento visual mais impactante deste vídeo]

### Performance Hypothesis
- Hook score: [1-10] | Motivo: [por quê]
- Retenção estimada: [X%] | Motivo: [por quê]
- CTR esperado: [X%] | Motivo: [por quê]
- Salvar rate: [X%] | Motivo: [por quê]

## CAPTION PARA INSTAGRAM
[Hook forte + desenvolvimento + CTA + hashtags lean/automação/bh]

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "[título impactante]",
  "format": "${formato}",
  "aspectRatio": "${fmtInfo.ratio}",
  "duration": 35,
  "fps": ${fmtInfo.fps},
  "objective": "lead_generation",
  "audience": "Donos de PMEs em BH/MG",
  "theme": "${temaInfo.tema}",
  "template": "LeanWaste",
  "cta": {
    "type": "diagnostic",
    "text": "Agende um diagnóstico gratuito",
    "url": "https://smartops-ia.com.br/diagnostico",
    "subtext": "30 min · presencial BH/MG · Black Belt"
  },
  "brand": {
    "style": "premium-tech-consulting",
    "primaryColor": "${CONFIG.brand.primary}",
    "accentColor": "${CONFIG.brand.accent}",
    "backgroundColor": "${CONFIG.brand.background}"
  },
  "scenes": [
    { "id": "scene_1", "type": "hook",     "duration": 4,  "headline": "[hook]", "subheadline": "[sub]", "animation": "kinetic-impact", "visual": "dark-gradient" },
    { "id": "scene_2", "type": "problem",  "duration": 6,  "headline": "[problema]", "body": "[corpo]", "bullets": ["[bullet 1]","[bullet 2]","[bullet 3]"], "animation": "slide-up" },
    { "id": "scene_3", "type": "data",     "duration": 8,  "headline": "[dado central]", "metrics": [{"label":"[label]","value":"[valor]","unit":"[unidade]"}], "animation": "counter" },
    { "id": "scene_4", "type": "solution", "duration": 10, "headline": "[solução Lean + IA]", "body": "[corpo]", "bullets": ["[bullet 1]","[bullet 2]","[bullet 3]"], "animation": "process-flow" },
    { "id": "scene_5", "type": "cta",      "duration": 7,  "headline": "[pergunta que gera ação]", "subheadline": "Diagnóstico gratuito de 30 min.", "animation": "cta-pulse", "visual": "glow-accent" }
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_lean_${temaInfo.tema.replace(/\s/g,'_')}_${date}.md`, result);

        // Extrair e salvar JSON separado
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try {
            const videoJson = JSON.parse(jsonMatch[1]);
            const score = scoreVideoProject(videoJson);
            console.log(`\n📊 Score do vídeo: ${score.score}/100 ${score.label}`);
            save(path.join(dir, 'jsons'), `${videoId}.json`, videoJson);
          } catch (e) { console.log('  ⚠️  JSON extraído mas inválido — salvo como texto'); save(path.join(dir, 'jsons'), `${videoId}_raw.txt`, jsonMatch[1]); }
        }
        break;
      }

      // ─── AUTOMATION ─────────────────────────────────────────────────────
      case 'automation': {
        const temaKey  = getArg('tema', 'lead-capture');
        const formato  = getArg('formato', 'instagram_reel');
        const temaInfo = CONFIG.themes.Automation.find(t => t.tema.includes(temaKey)) || CONFIG.themes.Automation[0];
        const videoId  = generateVideoId(temaInfo.tema, 'Automation');

        console.log(`\n📹 Gerando vídeo Automation: ${temaInfo.tema}`);
        console.log(`  Hook: "${temaInfo.hook}"`);

        const result = await ask(`${BASE}

TEMPLATE: Automation | FORMATO: ${formato}
TEMA: ${temaInfo.tema}
HOOK: "${temaInfo.hook}"
DADO: "${temaInfo.dado}"
VIDEO ID: ${videoId}

ESTRUTURA 30s:
${Object.entries(CONFIG.structure_30s).map(([tipo, info]) => `- ${tipo}: ${info.duracao}s — ${info.objetivo}`).join('\n')}

Gere o VideoProject JSON COMPLETO + Brief:

## BRIEF CRIATIVO
[Conceito | Hook visual | Arco narrativo | Performance hypothesis]

## CAPTION
[Hook + como funciona + CTA + hashtags]

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "[título]",
  "format": "${formato}",
  "aspectRatio": "9:16",
  "duration": 30,
  "fps": 30,
  "objective": "lead_generation",
  "audience": "Donos de PMEs em BH/MG",
  "theme": "${temaInfo.tema}",
  "template": "Automation",
  "cta": {
    "type": "diagnostic",
    "text": "Quero automatizar meu processo",
    "url": "https://smartops-ia.com.br/diagnostico",
    "subtext": "Primeira automação em até 30 dias"
  },
  "brand": { "style": "premium-tech-consulting", "primaryColor": "${CONFIG.brand.primary}", "accentColor": "${CONFIG.brand.accent}", "backgroundColor": "${CONFIG.brand.background}" },
  "scenes": [
    [gerar 5 cenas de 30s total com tipos: hook, problem, solution, proof/data, cta]
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_automation_${temaInfo.tema.replace(/\s/g,'_')}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try { save(path.join(dir, 'jsons'), `${videoId}.json`, JSON.parse(jsonMatch[1])); } catch {}
        }
        break;
      }

      // ─── CASE STUDY ─────────────────────────────────────────────────────
      case 'case-study': {
        const setor   = getArg('setor', 'industria');
        const caseRef = CONFIG.themes.CaseStudy.find(c => c.setor.toLowerCase().includes(setor)) || CONFIG.themes.CaseStudy[0];
        const videoId = generateVideoId(`case-${caseRef.setor.toLowerCase()}`, 'CaseStudy');

        const result = await ask(`${BASE}

TEMPLATE: CaseStudy (a criar) | FORMATO: instagram_reel
SETOR: ${caseRef.setor} | ANTES: ${caseRef.antes} | DEPOIS: ${caseRef.depois} | ROI: ${caseRef.roi}
VIDEO ID: ${videoId}

Gere o VideoProject JSON + Brief para vídeo de CASO DE SUCESSO:

## BRIEF CRIATIVO

### Estrutura Antes/Depois (40s)
- 0-4s:  HOOK — resultado impactante revelado de cara
- 4-10s: ANTES — a situação dolorosa (específica e visual)
- 10-20s: TRANSFORMAÇÃO — o que mudou e como
- 20-32s: DEPOIS — números reais, melhoria documentada
- 32-40s: CTA — diagnóstico para quem tem o mesmo problema

### Performance Hypothesis
[Hook rate / Retenção / CTR / Save rate estimados]

### Por que este formato converte
[Psicologia do antes/depois — credibilidade + esperança]

## CAPTION
[Começa com resultado → conta a história → CTA]

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "[título: De [antes] para [depois] em [tempo]]",
  "format": "instagram_reel",
  "aspectRatio": "9:16",
  "duration": 40,
  "fps": 30,
  "objective": "authority",
  "audience": "Donos de ${caseRef.setor} em BH/MG",
  "theme": "case-study-${setor}",
  "template": "CaseStudy",
  "cta": {
    "type": "diagnostic",
    "text": "Quero o mesmo resultado na minha empresa",
    "url": "https://smartops-ia.com.br/diagnostico",
    "subtext": "Diagnóstico gratuito · 30 min · BH/MG"
  },
  "brand": { "primaryColor": "${CONFIG.brand.primary}", "accentColor": "${CONFIG.brand.accent}", "backgroundColor": "${CONFIG.brand.background}" },
  "scenes": [
    { "id": "scene_1", "type": "hook",        "duration": 4,  "headline": "[resultado revelado de cara]", "animation": "kinetic-impact" },
    { "id": "scene_2", "type": "problem",     "duration": 6,  "headline": "O problema deles:", "bullets": ["[dor 1]","[dor 2]","[dor 3]"], "animation": "slide-up" },
    { "id": "scene_3", "type": "before_after","duration": 10, "before": "${caseRef.antes}", "after": "${caseRef.depois}", "result": "ROI ${caseRef.roi}", "animation": "slide-left" },
    { "id": "scene_4", "type": "case_result", "duration": 12, "headline": "Resultado documentado:", "metrics": [{"label":"Antes","value":"${caseRef.antes}"},{"label":"Depois","value":"${caseRef.depois}"},{"label":"ROI","value":"${caseRef.roi}"}], "animation": "counter" },
    { "id": "scene_5", "type": "cta",         "duration": 8,  "headline": "Seu processo pode ter o mesmo resultado.", "subheadline": "Diagnóstico gratuito em 30 min.", "animation": "cta-pulse" }
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_case_${setor}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try { save(path.join(dir, 'jsons'), `${videoId}.json`, JSON.parse(jsonMatch[1])); } catch {}
        }
        break;
      }

      // ─── AUTHORITY ──────────────────────────────────────────────────────
      case 'authority': {
        const temaKey  = getArg('tema', 'black-belt');
        const temaInfo = CONFIG.themes.Authority.find(t => t.tema.includes(temaKey)) || CONFIG.themes.Authority[0];
        const videoId  = generateVideoId(temaInfo.tema, 'Authority');

        const result = await ask(`${BASE}

TEMPLATE: Authority | FORMATO: instagram_reel (35s)
TEMA: ${temaInfo.tema}
HEADLINE: "${temaInfo.headline}"
CREDENCIAL: "${temaInfo.credencial}"
VIDEO ID: ${videoId}

Gere o VideoProject JSON + Brief para vídeo de AUTORIDADE (Breno como referência):

## BRIEF CRIATIVO

### Objetivo
Posicionar Breno como referência em Lean + Automação em BH — sem ser arrogante

### Estrutura (35s)
- 0-3s: HOOK — resultado ou credencial que surpreende
- 3-10s: PROBLEMA do mercado (sem resolver ainda)
- 10-20s: MÉTODO/EXPERIÊNCIA (o que diferencia Breno)
- 20-30s: PROVA (número de projetos, cases, certificação)
- 30-35s: CTA — conteúdo ou diagnóstico

### Tom
[Como soar confiante sem parecer vendedor ou arrogante]

## CAPTION
[Narrativa de autoridade + insight + CTA suave]

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "${temaInfo.headline}",
  "format": "instagram_reel",
  "aspectRatio": "9:16",
  "duration": 35,
  "fps": 30,
  "objective": "authority",
  "audience": "Donos de PMEs em BH/MG",
  "theme": "${temaInfo.tema}",
  "template": "Authority",
  "cta": ${JSON.stringify(CONFIG.ctas.authority)},
  "brand": { "primaryColor": "${CONFIG.brand.primary}", "accentColor": "${CONFIG.brand.accent}", "backgroundColor": "${CONFIG.brand.background}" },
  "scenes": [
    [5 cenas de 35s total — hook → problema → método → prova → cta]
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_authority_${temaInfo.tema.replace(/\s/g,'_')}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try { save(path.join(dir, 'jsons'), `${videoId}.json`, JSON.parse(jsonMatch[1])); } catch {}
        }
        break;
      }

      // ─── AD ─────────────────────────────────────────────────────────────
      case 'ad': {
        const formato  = getArg('formato', 'meta_ad');
        const angulo   = getArg('angulo', 'dor');
        const servico  = getArg('servico', 'diagnostico');
        const fmtInfo  = CONFIG.formats[formato] || CONFIG.formats.meta_ad;
        const videoId  = generateVideoId(`ad-${angulo}`, 'VideoAd');

        const result = await ask(`${BASE}

TEMPLATE: VideoAd | FORMATO: ${formato} (${fmtInfo.ratio}, max ${fmtInfo.maxDur}s)
ÂNGULO: ${angulo} | SERVIÇO: ${servico}
VIDEO ID: ${videoId}

Gere o VideoProject JSON + Brief para ANÚNCIO DE VÍDEO:

## BRIEF DO ANÚNCIO

### Objetivo de Campanha
[Tráfego frio / Retargeting / Conversão — escolher o mais adequado]

### Ângulo Principal: ${angulo}
[Como o ângulo se manifesta nos primeiros 3s]

### Targeting Sugerido
[Interesses, comportamentos, dados demográficos para Meta/Google]

### Variações Criativas
[3 variações do hook para teste A/B]

### Métricas de Sucesso (paid)
CPL alvo: R$80 | CPA alvo: R$500 | ROAS mínimo: 4x | CTR mínimo: 1.5%

### Performance Hypothesis
[Hook rate / CTR / CPA estimados]

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "[título do anúncio]",
  "format": "${formato}",
  "aspectRatio": "${fmtInfo.ratio}",
  "duration": ${fmtInfo.maxDur <= 30 ? 30 : 35},
  "fps": 30,
  "objective": "conversion",
  "audience": "Donos de PMEs 30-55 anos, BH/MG, empresa 10-100 funcionários",
  "theme": "ad-${angulo}",
  "template": "VideoAd",
  "cta": ${JSON.stringify(CONFIG.ctas.conversion)},
  "brand": { "primaryColor": "${CONFIG.brand.primary}", "accentColor": "${CONFIG.brand.accent}", "backgroundColor": "${CONFIG.brand.background}" },
  "scenes": [
    [cenas compactas focadas em conversão — máx ${fmtInfo.maxDur}s total]
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_ad_${formato}_${angulo}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try { save(path.join(dir, 'jsons'), `${videoId}.json`, JSON.parse(jsonMatch[1])); } catch {}
        }
        break;
      }

      // ─── SIX SIGMA ──────────────────────────────────────────────────────
      case 'six-sigma': {
        const tema    = getArg('tema', 'dmaic');
        const videoId = generateVideoId(`six-sigma-${tema}`, 'SixSigma');

        const result = await ask(`${BASE}

TEMPLATE: SixSigma (a criar) | FORMATO: instagram_reel (40s)
TEMA: ${tema.toUpperCase()}
VIDEO ID: ${videoId}

Gere o VideoProject JSON + Brief para vídeo de SIX SIGMA:

## BRIEF CRIATIVO

### Tema: ${tema.toUpperCase()}
[O que é, por que importa para PME, em linguagem simples]

### Tradução para o Dono de PME
[Six Sigma sem jargão — como ele sente o problema no dia a dia]

### Estrutura (40s)
- 0-4s:  HOOK — o sintoma que todo dono reconhece
- 4-10s: PROBLEMA — a causa invisível (variabilidade, defeitos)
- 10-20s: DADO — o custo quantificado em R$ ou %
- 20-32s: MÉTODO — como o Six Sigma + Lean resolve
- 32-40s: CTA — diagnóstico gratuito

### Performance Hypothesis
[Estimativa de performance — público mais técnico, menor escala mas maior conversão]

## CAPTION
[Educativo + credencial + CTA]

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "[título que traduz ${tema} para PME]",
  "format": "instagram_reel",
  "aspectRatio": "9:16",
  "duration": 40,
  "fps": 30,
  "objective": "authority",
  "audience": "Gestores e donos de PME BH/MG — com interesse em qualidade",
  "theme": "six-sigma-${tema}",
  "template": "SixSigma",
  "cta": ${JSON.stringify(CONFIG.ctas.lead_generation)},
  "brand": { "primaryColor": "${CONFIG.brand.primary}", "accentColor": "${CONFIG.brand.accent}", "backgroundColor": "${CONFIG.brand.background}" },
  "scenes": [
    [5-6 cenas cobrindo hook → problema → dado → método → cta]
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_sixsigma_${tema}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try { save(path.join(dir, 'jsons'), `${videoId}.json`, JSON.parse(jsonMatch[1])); } catch {}
        }
        break;
      }

      // ─── LOCAL BUSINESS ─────────────────────────────────────────────────
      case 'local-business': {
        const bairro  = getArg('bairro', 'BH');
        const setor   = getArg('setor', 'servicos');
        const videoId = generateVideoId(`local-${bairro}`, 'LocalBusiness');

        const result = await ask(`${BASE}

TEMPLATE: LocalBusiness | FORMATO: instagram_reel (35s)
BAIRRO/REGIÃO: ${bairro} | SETOR: ${setor}
VIDEO ID: ${videoId}

Gere vídeo com CONEXÃO LOCAL — SmartOps para empresas de BH:

## BRIEF CRIATIVO

### Gatilho de Conexão Local
[Como mencionar BH/MG de forma que o espectador sinta que é "para mim"]

### Especificidade do Setor: ${setor}
[Problema específico deste setor em BH — com dado local se possível]

### Tom
[Próximo, regional, não corporativo — "aqui em BH eu vejo muito isso"]

## CAPTION
[Com hashtags locais: #empresasbh #belohorizonte #pmebh]

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "[título referenciando BH ou MG]",
  "format": "instagram_reel",
  "aspectRatio": "9:16",
  "duration": 35,
  "fps": 30,
  "objective": "lead_generation",
  "audience": "Donos de ${setor} em ${bairro}/BH/MG",
  "theme": "local-business-${bairro}",
  "template": "LocalBusiness",
  "cta": ${JSON.stringify(CONFIG.ctas.lead_generation)},
  "brand": { "primaryColor": "${CONFIG.brand.primary}", "accentColor": "${CONFIG.brand.accent}", "backgroundColor": "${CONFIG.brand.background}" },
  "scenes": [
    [5 cenas de 35s com contexto local de BH]
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_local_${bairro}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try { save(path.join(dir, 'jsons'), `${videoId}.json`, JSON.parse(jsonMatch[1])); } catch {}
        }
        break;
      }

      // ─── GENERATE (livre) ────────────────────────────────────────────────
      case 'generate': {
        const tema     = getArg('tema', 'automação reduz custo operacional');
        const template = getArg('template', 'LeanWaste');
        const formato  = getArg('formato', 'instagram_reel');
        const objetivo = getArg('objetivo', 'lead_generation');
        const fmtInfo  = CONFIG.formats[formato] || CONFIG.formats.instagram_reel;
        const videoId  = generateVideoId(tema, template);
        const duracao  = CONFIG.templates[template]?.duracao || 35;

        const result = await ask(`${BASE}

TEMA LIVRE: ${tema}
TEMPLATE: ${template} | FORMATO: ${formato} (${fmtInfo.ratio})
OBJETIVO: ${objetivo} | DURAÇÃO: ${duracao}s
VIDEO ID: ${videoId}

Gere o VideoProject JSON COMPLETO + Brief completo:

## BRIEF CRIATIVO
[Conceito | Hook | Arco narrativo | Performance hypothesis completa]

## CAPTION
[Para ${formato}]

## COMANDOS DE RENDER
\`\`\`bash
# Preview (rápido)
cd remotion && npx remotion preview src/index.ts

# Render final
${buildRenderCmd('OUTPUT_JSON', template + '35s', 'OUTPUT_PATH/video.mp4')}
\`\`\`

## VIDEO JSON
\`\`\`json
{
  "videoId": "${videoId}",
  "title": "[título baseado em: ${tema}]",
  "format": "${formato}",
  "aspectRatio": "${fmtInfo.ratio}",
  "duration": ${duracao},
  "fps": ${fmtInfo.fps},
  "objective": "${objetivo}",
  "audience": "Donos de PMEs em BH/MG",
  "theme": "${tema}",
  "template": "${template}",
  "cta": ${JSON.stringify(CONFIG.ctas[objetivo] || CONFIG.ctas.lead_generation)},
  "brand": {
    "style": "premium-tech-consulting",
    "primaryColor": "${CONFIG.brand.primary}",
    "accentColor": "${CONFIG.brand.accent}",
    "backgroundColor": "${CONFIG.brand.background}"
  },
  "scenes": [
    [gerar N cenas cobrindo ${duracao}s total com tipos: hook, problem/pain, data, solution, cta]
  ]
}
\`\`\``);

        console.log(result);
        save(path.join(dir, 'briefs'), `brief_${template.toLowerCase()}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try {
            const vj = JSON.parse(jsonMatch[1]);
            const score = scoreVideoProject(vj);
            console.log(`\n📊 Score: ${score.score}/100 ${score.label}`);
            save(path.join(dir, 'jsons'), `${videoId}.json`, vj);
          } catch {}
        }
        break;
      }

      // ─── TEMPLATE ────────────────────────────────────────────────────────
      case 'template': {
        const nome    = getArg('nome', 'CaseStudy');
        const tplInfo = CONFIG.templates[nome] || CONFIG.templates.CaseStudy;

        const result = await ask(`${BASE}

TEMPLATE A CRIAR: ${nome}
ARQUIVO: remotion/src/templates/${tplInfo.file || nome + 'Template.tsx'}
OBJETIVO: ${tplInfo.objetivo}
DURAÇÃO BASE: ${tplInfo.duracao}s

Crie o CÓDIGO TYPESCRIPT COMPLETO do template Remotion:

\`\`\`typescript
// ${nome}Template.tsx — SmartOps IA
// ${tplInfo.objetivo}

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion';
import { colors, typography, spacing, layout, brand } from '../brand/brandTokens';
import { VideoProject, VideoScene } from '../data/video.schema';
import { AdVideoComposition } from '../compositions/AdVideoComposition';

// Builder function — gera VideoProject padrão para este template
export function build${nome}Project(overrides?: Partial<VideoProject>): VideoProject {
  return {
    videoId:     '${nome.toLowerCase()}-001',
    title:       '[título padrão]',
    format:      'instagram_reel',
    aspectRatio: '9:16',
    duration:    ${tplInfo.duracao},
    fps:         30,
    objective:   '${nome === 'Authority' ? 'authority' : nome === 'VideoAd' ? 'conversion' : 'lead_generation'}',
    audience:    'Donos de PMEs em BH/MG',
    theme:       '${nome.toLowerCase()}',
    template:    '${nome}',
    cta: {
      type:    'diagnostic',
      text:    'Agende um diagnóstico gratuito',
      url:     'https://smartops-ia.com.br/diagnostico',
      subtext: '30 min · presencial BH/MG · Black Belt',
    },
    brand: {
      style:           'premium-tech-consulting',
      primaryColor:    colors.primary,
      accentColor:     colors.accent,
      backgroundColor: colors.background,
    },
    scenes: [
      // [cenas padrão para ${nome}]
    ],
    ...overrides,
  };
}

// Componente React principal
export const ${nome}Template: React.FC<{ project: VideoProject }> = ({ project }) => {
  return <AdVideoComposition project={project} />;
};
\`\`\`

## Como Registrar em Root.tsx

\`\`\`typescript
// Adicionar em remotion/src/Root.tsx:
import { ${nome}Template, build${nome}Project } from './templates/${nome}Template';

// Dentro do <Composition>:
<Composition
  id="${nome}${tplInfo.duracao}s"
  component={${nome}Template}
  durationInFrames={${tplInfo.duracao} * 30}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{ project: build${nome}Project() }}
/>
\`\`\`

## Exemplos de Uso

\`\`\`typescript
// Gerar com defaults:
const project = build${nome}Project();

// Gerar com overrides:
const custom = build${nome}Project({
  title: 'Meu vídeo personalizado',
  objective: 'conversion',
  cta: { type: 'whatsapp', text: 'Falar com especialista' },
});
\`\`\``);

        console.log(result);
        save(path.join(dir, 'templates'), `${nome}Template_spec_${date}.md`, result);

        // Extrair e salvar o código TSX
        const tsxMatch = result.match(/```typescript\n([\s\S]+?)\n```/);
        if (tsxMatch) {
          const tplPath = path.resolve(__dirname, '..', '..', 'remotion', 'src', 'templates', `${nome}Template.tsx`);
          fs.writeFileSync(tplPath, tsxMatch[1], 'utf-8');
          console.log(`\n  ✓ Template salvo em: ${tplPath}`);
        }
        break;
      }

      // ─── RENDER ──────────────────────────────────────────────────────────
      case 'render': {
        const jsonPath = getArg('json', '');
        if (!jsonPath || !fs.existsSync(jsonPath)) {
          console.log('❌ Informe --json com caminho para o VideoProject JSON');
          console.log('\nExemplo:');
          console.log('  node remotion_video_agent.js --mode render --json outputs/video_2026-06-01/jsons/leanwaste-retrabalho.json');
          break;
        }
        const project    = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const composition = (project.template || 'LeanWaste') + (project.duration || 35) + 's';
        const outputFile = path.join(dir, `${project.videoId || 'video'}.mp4`);
        const previewCmd = `cd "${path.resolve(__dirname, '..', '..', 'remotion')}" && npx remotion preview src/index.ts`;
        const renderCmd  = buildRenderCmd(path.resolve(jsonPath), composition, outputFile);

        console.log(`\n📹 Projeto: ${project.title}`);
        console.log(`   Template: ${project.template} | Duração: ${project.duration}s`);
        const score = scoreVideoProject(project);
        console.log(`   Score: ${score.score}/100 ${score.label}`);

        const script = `#!/bin/bash
# Render Script — ${project.title}
# Gerado em: ${date}

echo "📹 Renderizando: ${project.title}"
echo "   Composition: ${composition}"
echo "   Output: ${outputFile}"

# Preview (abrir no browser para validar)
# ${previewCmd}

# Render final
${renderCmd}

echo "✅ Render concluído: ${outputFile}"
`;
        save(path.join(dir, 'scripts'), `render_${project.videoId || 'video'}.sh`, script);
        console.log(`\n🚀 Script de render gerado.`);
        console.log(`\nPara renderizar, execute:`);
        console.log(`  bash "${path.join(dir, 'scripts', `render_${project.videoId || 'video'}.sh`)}"`);
        console.log(`\nOu manualmente:`);
        console.log(`  ${renderCmd}`);
        break;
      }

      // ─── PIPELINE ────────────────────────────────────────────────────────
      case 'pipeline': {
        const tema     = getArg('tema', 'retrabalho');
        const template = getArg('template', 'LeanWaste');
        const formato  = getArg('formato', 'instagram_reel');
        const videoId  = generateVideoId(tema, template);

        const result = await ask(`${BASE}

PIPELINE COMPLETO: ${tema} | ${template} | ${formato}
VIDEO ID: ${videoId}

Gere o PIPELINE DE PRODUÇÃO COMPLETO:

# Pipeline de Vídeo: ${tema}

## 1. JSON do VideoProject
\`\`\`json
{ [VideoProject completo e validado] }
\`\`\`

## 2. Caption para ${formato}
[Caption pronto para publicar]

## 3. Hashtags
[30 hashtags organizadas por categoria]

## 4. Thumbnail Text
[Texto exato para a capa — max 4 palavras, impactante]

## 5. Roteiro de Aprovação (Telegram)
[Mensagem para enviar via bot solicitando aprovação]

## 6. Checklist de Publicação
- [ ] JSON validado
- [ ] Preview renderizado e aprovado
- [ ] Caption revisado
- [ ] Hashtags adicionadas
- [ ] Horário definido: [melhor horário para ${formato}]
- [ ] Publicado + engajamento monitorado por 1h

## 7. Performance Hypothesis
| KPI | Meta | Como medir |
|-----|------|-----------|
| Hook rate | ≥${CONFIG.kpis.hook_rate_min}% | Insights Instagram |
| Retenção | ≥${CONFIG.kpis.retention_min}% | Insights |
| CTR | ≥${CONFIG.kpis.ctr_min}% | Insights |
| Saves | ≥${CONFIG.kpis.save_rate_min}% | Insights |`);

        console.log(result);
        save(path.join(dir, 'briefs'), `pipeline_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        const jsonMatch = result.match(/```json\n([\s\S]+?)\n```/);
        if (jsonMatch) {
          try { save(path.join(dir, 'jsons'), `${videoId}.json`, JSON.parse(jsonMatch[1])); } catch {}
        }
        break;
      }

      // ─── AUDIT ───────────────────────────────────────────────────────────
      case 'audit': {
        const result = await ask(`${BASE}

Faça a AUDITORIA DO SISTEMA DE VÍDEO da SmartOps IA:

# Remotion Video Agent — Auditoria

## Templates Ativos
${Object.entries(CONFIG.templates).filter(([,v]) => v.status === 'ativo').map(([k, v]) => `### ${k} (${v.duracao}s)\nArquivo: ${v.file}\nObjetivo: ${v.objetivo}\n[Diagnóstico: pontos fortes e o que melhorar]`).join('\n\n')}

## Templates Pendentes de Criação
${Object.entries(CONFIG.templates).filter(([,v]) => v.status === 'criar').map(([k, v]) => `### ${k} — PENDENTE\nArquivo: ${v.file}\nObjetivo: ${v.objetivo}\nPrioridade: [Alta/Média/Baixa] | Motivo: [ROI esperado]`).join('\n\n')}

## Prioridade de Criação dos Templates
[Ranking por ROI/impacto + justificativa]

## Temas a Produzir Esta Semana
[3 vídeos com maior potencial de performance agora]

## KPIs de Referência
${Object.entries(CONFIG.kpis).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Recomendação Técnica
[Uma melhoria no pipeline de geração/render para implementar]`);

        console.log(result);
        save(path.join(dir, 'briefs'), `audit_${date}.md`, result);
        break;
      }

      // ─── REPORT ──────────────────────────────────────────────────────────
      case 'report': {
        const temas = CONFIG.themes.LeanWaste.slice(0, 3).map(t => t.tema).join(', ');
        const result = await ask(`${BASE}

TEMAS DISPONÍVEIS (LeanWaste): ${temas}
TEMPLATES ATIVOS: ${Object.entries(CONFIG.templates).filter(([,v]) => v.status === 'ativo').map(([k]) => k).join(', ')}
TEMPLATES A CRIAR: ${Object.entries(CONFIG.templates).filter(([,v]) => v.status === 'criar').map(([k]) => k).join(', ')}

# Remotion Video Report — Semanal

## Vídeos Para Produzir Esta Semana (3)
| Prioridade | Template | Tema | Formato | Objetivo | Impacto Esperado |
|-----------|---------|------|---------|---------|-----------------|

## Vídeo da Semana (detalhado)
[O mais importante — conceito completo + por que agora]

## Template Prioritário a Criar
[Qual criar primeiro e por quê — com ROI estimado]

## Insight de Performance
[Uma técnica de motion design que aumentaria a retenção dos vídeos]

## Hook da Semana
[O melhor hook para usar nos próximos 7 dias — com 3 variações]

## Calendário de Publicação
| Data | Vídeo | Plataforma | Horário | CTA |
|------|-------|-----------|---------|-----|`);

        console.log(result);
        save(path.join(dir, 'briefs'), `video_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: lean-waste | automation | case-study | authority | ad | six-sigma | local-business | generate | template | render | pipeline | audit | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
