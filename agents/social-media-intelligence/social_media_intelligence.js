#!/usr/bin/env node
/**
 * Social Media Intelligence — SmartOps IA
 * Analisa performance do Instagram, detecta padrões e gera recomendações de crescimento.
 *
 * Usage:
 *   node social_media_intelligence.js --mode analyze --periodo 30
 *   node social_media_intelligence.js --mode top-posts --canal instagram
 *   node social_media_intelligence.js --mode benchmark
 *   node social_media_intelligence.js --mode growth --meta 1000
 *   node social_media_intelligence.js --mode next-content --count 5
 *   node social_media_intelligence.js --mode report
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
  const dir  = path.join(__dirname, 'outputs', `social_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function saveOutput(dir, filename, content) {
  const file = path.join(dir, filename);
  fs.writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  console.log(`✅ Salvo: ${file}`);
}

function loadState() {
  const f = path.join(__dirname, 'current_state.json');
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}

function saveState(updates) {
  const f = path.join(__dirname, 'current_state.json');
  const s = loadState();
  fs.writeFileSync(f, JSON.stringify({ ...s, ...updates, last_updated: new Date().toISOString() }, null, 2));
}

// ─── BENCHMARKS (calculadoras locais) ─────────────────────────────────────────

const BENCHMARKS = {
  instagram: {
    seguidores_0_1k:  { engajamento_saudavel: [8, 15], preocupante: 5 },
    seguidores_1_10k: { engajamento_saudavel: [4, 8],  preocupante: 3 },
    seguidores_10_100k: { engajamento_saudavel: [2, 5], preocupante: 1.5 },
  },
  formatos: {
    reel:      { alcance: [500, 5000], engajamento: [5, 12], salvamentos: [2, 5] },
    carrossel: { alcance: [300, 2000], engajamento: [4, 8],  salvamentos: [3, 8] },
    card:      { alcance: [200, 1000], engajamento: [2, 5],  salvamentos: [0.5, 2] },
    story:     { alcance: [100, 500],  engajamento: null,    saida_max: 30 },
  },
};

function classifyEngagement(taxa, seguidores) {
  let bench;
  if (seguidores < 1000)        bench = BENCHMARKS.instagram.seguidores_0_1k;
  else if (seguidores < 10000)  bench = BENCHMARKS.instagram.seguidores_1_10k;
  else                          bench = BENCHMARKS.instagram.seguidores_10_100k;

  if (taxa >= bench.engajamento_saudavel[0]) return '🟢 Saudável';
  if (taxa >= bench.preocupante)              return '🟡 Atenção';
  return '🔴 Preocupante';
}

function calcEngagementRate(likes, comments, saves, shares, followers) {
  return followers > 0 ? (((likes + comments + saves + shares) / followers) * 100).toFixed(2) : '0';
}

function estimateGrowthActions(atual, meta, semanas) {
  const deficit     = meta - atual;
  const porSemana   = Math.ceil(deficit / semanas);
  const postsNecessarios = Math.ceil(porSemana / 10); // ~10 seguidores por post bom
  return { deficit, porSemana, postsNecessarios };
}

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

function buildAnalyzePrompt(periodo, metricas) {
  return `Você é um analista de redes sociais especializado em crescimento orgânico de contas B2B de consultoria (Lean Six Sigma + Automação com IA para PMEs em BH/MG).

PERÍODO ANALISADO: ${periodo} dias
MÉTRICAS FORNECIDAS: ${metricas || 'Não fornecidas — gerar análise modelo'}

BENCHMARKS DE REFERÊNCIA:
${JSON.stringify(BENCHMARKS, null, 2)}

TAREFA: Gere uma análise completa de performance com:

## RESUMO EXECUTIVO
[2–3 frases: achado principal + oportunidade]

## KPIs DO PERÍODO
| Métrica | Atual | Meta | Variação |

## DIAGNÓSTICO DE PADRÕES
- Formato que mais performa
- Pilar de conteúdo que mais engaja
- Melhor dia/horário
- Conteúdo que gera mais salvamentos
- Conteúdo que gera mais DMs

## FUNIL DE SAÚDE
Topo (alcance) → Meio (engajamento) → Fundo (leads/DMs)

## RECOMENDAÇÕES PRÓXIMAS 2 SEMANAS
[5 conteúdos específicos baseados em dados]

## AÇÕES DE CRESCIMENTO
Curto prazo (esta semana):
Médio prazo (este mês):`;
}

function buildNextContentPrompt(count, state) {
  return `Com base na análise de performance do Instagram da SmartOps IA (consultoria Lean + Automação com IA para PMEs em BH/MG):

HISTÓRICO RECENTE: ${JSON.stringify(state, null, 2)}

Recomende os próximos ${count} conteúdos com maior probabilidade de engajamento.

Para cada um:
- Formato: [Reel / Carrossel / Card / Story]
- Pilar: [Educação / Dor / Resultado / Opinião / Conversão]
- Tema específico
- Gancho (primeira frase)
- Por que agora (baseado em dados)
- Métrica de sucesso esperada

Ordenar por potencial de alcance.`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const mode    = getArg('mode', 'analyze');
  const periodo = getArg('periodo', '30');
  const meta    = parseInt(getArg('meta', '1000'));
  const semanas = parseInt(getArg('semanas', '8'));
  const count   = parseInt(getArg('count', '5'));
  const dir     = setupOutput();
  const state   = loadState();
  const ts      = Date.now();

  if (mode === 'report') {
    console.log('\n📊 SOCIAL MEDIA INTELLIGENCE — RELATÓRIO');
    console.log(`Análises realizadas: ${state.total_analyses || 0}`);
    console.log(`Última análise: ${state.last_analysis || 'N/A'}`);
    console.log(`Seguidores registrados: ${state.followers || 'N/A'}`);
    return;
  }

  if (mode === 'benchmark') {
    console.log('\n📈 BENCHMARKS INSTAGRAM — SmartOps IA\n');
    Object.entries(BENCHMARKS.formatos).forEach(([fmt, b]) => {
      console.log(`${fmt.toUpperCase()}: alcance ${b.alcance[0]}–${b.alcance[1]} | engajamento ${b.engajamento?.[0]}–${b.engajamento?.[1]}%`);
    });
    return;
  }

  if (mode === 'growth') {
    const seguidores = state.followers || 0;
    const plan = estimateGrowthActions(seguidores, meta, semanas);
    console.log(`\n🚀 PLANO DE CRESCIMENTO: ${seguidores} → ${meta} seguidores em ${semanas} semanas`);
    console.log(`Deficit: ${plan.deficit} seguidores`);
    console.log(`Crescimento necessário/semana: ${plan.porSemana}`);
    console.log(`Posts necessários/semana: ${plan.postsNecessarios}`);
    saveOutput(dir, `growth_plan_${ts}.json`, { atual: seguidores, meta, semanas, ...plan });
    return;
  }

  let prompt, filename;

  if (mode === 'analyze') {
    const metricas = getArg('metricas', null);
    prompt   = buildAnalyzePrompt(periodo, metricas);
    filename = `analysis_${periodo}d_${ts}.md`;
  } else if (mode === 'next-content') {
    prompt   = buildNextContentPrompt(count, state);
    filename = `next_content_${ts}.md`;
  } else if (mode === 'top-posts') {
    prompt   = `Analise os tipos de conteúdo que mais performam para contas B2B de consultoria (Lean + Automação) no Instagram em 2026.\n\nRetorne:\n1. Top 5 formatos por engajamento\n2. Top 5 temas por salvamentos\n3. Top 3 tipos de gancho por alcance\n4. Horários e dias com melhor performance\n5. Recomendação para SmartOps IA`;
    filename = `top_posts_${ts}.md`;
  } else {
    console.error(`Modo desconhecido: ${mode}`); process.exit(1);
  }

  console.log(`📊 Analisando social media [${mode}]...`);
  const msg = await client.messages.create({
    model: CONFIG.model, max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text;
  saveOutput(dir, filename, text);
  saveState({ last_analysis: new Date().toISOString(), total_analyses: (state.total_analyses || 0) + 1, last_mode: mode });
  console.log('\n' + text);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
