#!/usr/bin/env node
/**
 * Content Agent — SmartOps IA
 * Cria conteúdo para Instagram: reels, carrosséis, stories e cards sobre Lean, automação e processos.
 *
 * Usage:
 *   node content_agent.js --mode reel --tema "retrabalho"
 *   node content_agent.js --mode carousel --tema "8 desperdícios" --slides 8
 *   node content_agent.js --mode story --objetivo conversao
 *   node content_agent.js --mode card --pilar educacao
 *   node content_agent.js --mode calendar --semanas 2
 *   node content_agent.js --mode hooks --tema "automação"
 *   node content_agent.js --mode report
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');

const client = new Anthropic();

function getArg(n, fb = null) {
  const i = process.argv.indexOf(`--${n}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fb;
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `content_${date}`);
  ['scripts', 'carousels', 'stories'].forEach(d => {
    if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true });
  });
  return dir;
}

function saveOutput(dir, filename, content) {
  const file = path.join(dir, filename);
  fs.writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  console.log(`✅ Salvo: ${file}`);
  return file;
}

function readKnowledge() {
  const base = path.join(__dirname, '../../knowledge');
  const read = (f) => {
    try { return fs.readFileSync(path.join(base, f), 'utf8'); } catch { return ''; }
  };
  return {
    strategy  : read('content_strategy.md'),
    brand     : read('brand_identity.md'),
    platform  : read('platform_guidelines.md'),
    product   : read('product_campaign.md'),
  };
}

// ─── CALCULADORAS LOCAIS ─────────────────────────────────────────────────────

function scorePillar(pilar) {
  const map = { educacao: 85, dor: 90, resultado: 80, opiniao: 75, conversao: 70 };
  return map[pilar?.toLowerCase()] || 75;
}

function selectPillar(dia) {
  const pillars = ['educacao', 'dor', 'resultado', 'opiniao', 'conversao'];
  return pillars[dia % pillars.length];
}

function buildCalendar(semanas = 2) {
  const days = ['Ter', 'Qui', 'Sáb'];
  const cal  = [];
  for (let w = 1; w <= semanas; w++) {
    days.forEach((d, i) => {
      const pilar = selectPillar((w - 1) * 3 + i);
      cal.push({ semana: w, dia: d, pilar, formato: pilar === 'conversao' ? 'carousel' : 'reel' });
    });
  }
  return cal;
}

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

function buildReelPrompt(tema, knowledge) {
  return `Você é um especialista em conteúdo para Instagram de consultoria Lean + Automação com IA para PMEs em BH/MG.

CONHECIMENTO DA MARCA:
${knowledge.brand}
${knowledge.strategy}

TAREFA: Crie um roteiro completo de Reel de 30–60s sobre o tema: "${tema}"

FORMATO OBRIGATÓRIO:
\`\`\`
TÍTULO: [título de trabalho]
DURAÇÃO: [30s / 45s / 60s]
PILAR: [Educação / Dor / Resultado / Opinião / Conversão]
HOOK VISUAL: [o que aparece nos primeiros 3 segundos]

[0–3s] HOOK
"[frase que para o scroll]"
VISUAL: [o que aparece]

[3–15s] DESENVOLVIMENTO
"[expandir o hook]"
VISUAL: [o que aparece]

[15–50s] CONTEÚDO DE VALOR
"[ensinar, mostrar ou demonstrar]"
VISUAL: [texto, diagrama, dado]

[50–60s] CTA
"[ação específica: salvar, seguir, DM]"
VISUAL: [tela de CTA]

HASHTAGS: [10–15 hashtags relevantes]
LEGENDA: [2–3 linhas: hook + resumo + CTA]
\`\`\`

Regras: nunca usar "Manutenção TI", sempre incluir pelo menos 1 número ou métrica, CTA específico.`;
}

function buildCarouselPrompt(tema, slides, knowledge) {
  return `Você é especialista em carrosséis de Instagram para consultoria Lean + Automação com IA.

MARCA: ${knowledge.brand}

TAREFA: Crie um carrossel de ${slides} slides sobre: "${tema}"

FORMATO OBRIGATÓRIO:
\`\`\`
TÍTULO: [título]
SLIDES: ${slides}
PILAR: [pilar]
OBJETIVO: [salvar / compartilhar / DM]

SLIDE 1 — CAPA
Texto: "[título forte que para o scroll]"
Design: [dark bg | accent roxo Lean ou verde Automação]

SLIDE 2: [ponto 1 — 1 frase + 1 frase de suporte]
SLIDE 3: [ponto 2]
...
SLIDE ${slides - 1}: [conclusão com número ou resultado]

SLIDE ${slides} — CTA
"[Salva esse carrossel / Me manda DM com '[keyword]' / Diagnóstico gratuito: link na bio]"

LEGENDA: [3–4 frases: hook + valor + CTA]
HASHTAGS: [10–15]
\`\`\``;
}

function buildStoryPrompt(objetivo, knowledge) {
  return `Crie um roteiro de Story para Instagram (SmartOps IA) com objetivo: ${objetivo}.

MARCA: ${knowledge.brand}

FORMATO:
\`\`\`
DURAÇÃO: [15s | 30s]
OBJETIVO: ${objetivo}

FRAME 1: [visual] | FALA: "[máx 2 frases]"
FRAME 2: [visual] | FALA: "[continuação]"
[repetir]
FRAME FINAL: CTA: "[ação específica]"
\`\`\``;
}

function buildOpportunityCalendarPrompt(calendar, knowledge) {
  return `Você é um estrategista de conteúdo. Com base neste calendário editorial para ${calendar.length} posts, sugira temas específicos para cada slot.

CALENDÁRIO: ${JSON.stringify(calendar, null, 2)}

ESTRATÉGIA: ${knowledge.strategy}

Para cada slot, retorne:
- semana/dia/pilar/formato
- tema específico
- gancho sugerido
- métrica de sucesso

Foque em Lean Six Sigma e Automação com IA para PMEs em BH/MG. Nunca inclua Manutenção TI.`;
}

// ─── MODO: report ─────────────────────────────────────────────────────────────

function generateReport() {
  const state = loadState();
  console.log('\n📊 CONTENT AGENT — RELATÓRIO\n');
  console.log(`Posts criados: ${state.total_created || 0}`);
  console.log(`Reels: ${state.reels || 0}`);
  console.log(`Carrosséis: ${state.carousels || 0}`);
  console.log(`Stories: ${state.stories || 0}`);
  console.log(`Último conteúdo: ${state.last_created || 'N/A'}`);
  return state;
}

function loadState() {
  const f = path.join(__dirname, 'current_state.json');
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}

function saveState(updates) {
  const f     = path.join(__dirname, 'current_state.json');
  const state = loadState();
  const next  = { ...state, ...updates, last_updated: new Date().toISOString() };
  fs.writeFileSync(f, JSON.stringify(next, null, 2));
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const mode     = getArg('mode', 'reel');
  const tema     = getArg('tema', 'retrabalho nas empresas');
  const slides   = parseInt(getArg('slides', '8'));
  const objetivo = getArg('objetivo', 'conversao');
  const semanas  = parseInt(getArg('semanas', '2'));
  const pilar    = getArg('pilar', 'educacao');

  const dir       = setupOutput();
  const knowledge = readKnowledge();
  const ts        = Date.now();

  if (mode === 'report') { generateReport(); return; }

  if (mode === 'calendar') {
    const cal    = buildCalendar(semanas);
    const prompt = buildOpportunityCalendarPrompt(cal, knowledge);
    console.log(`📅 Gerando calendário ${semanas} semanas...`);
    const msg = await client.messages.create({
      model: CONFIG.model, max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const result = { calendar: cal, suggestions: msg.content[0].text };
    saveOutput(dir, 'content_calendar.json', result);
    saveState({ last_created: new Date().toISOString(), last_mode: 'calendar' });
    console.log('\n' + msg.content[0].text);
    return;
  }

  let prompt;
  if (mode === 'reel')     prompt = buildReelPrompt(tema, knowledge);
  else if (mode === 'carousel') prompt = buildCarouselPrompt(tema, slides, knowledge);
  else if (mode === 'story')    prompt = buildStoryPrompt(objetivo, knowledge);
  else if (mode === 'card')     prompt = buildReelPrompt(tema + ' (formato card/imagem)', knowledge);
  else if (mode === 'hooks')    prompt = `Crie 10 ganchos (hooks) poderosos para conteúdo sobre "${tema}" para Instagram de consultoria Lean + Automação com IA. Cada hook deve parar o scroll em 3 segundos. Formato: numerado, 1 linha por hook, com ângulo diferente.`;
  else { console.error(`Modo desconhecido: ${mode}`); process.exit(1); }

  console.log(`✍️  Criando ${mode} sobre "${tema}"...`);

  const msg = await client.messages.create({
    model: CONFIG.model, max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text     = msg.content[0].text;
  const subdir   = mode === 'carousel' ? 'carousels' : mode === 'story' ? 'stories' : 'scripts';
  const filename = `${mode}_${tema.replace(/\s+/g, '_').toLowerCase()}_${ts}.md`;
  saveOutput(path.join(dir, subdir), filename, text);

  const state = loadState();
  saveState({
    total_created: (state.total_created || 0) + 1,
    [mode === 'carousel' ? 'carousels' : mode === 'story' ? 'stories' : 'reels']:
      ((state[mode === 'carousel' ? 'carousels' : mode === 'story' ? 'stories' : 'reels'] || 0) + 1),
    last_created: new Date().toISOString(),
    last_mode: mode,
    last_tema: tema,
  });

  console.log('\n' + text);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
