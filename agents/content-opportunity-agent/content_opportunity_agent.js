#!/usr/bin/env node
/**
 * Content Opportunity Agent — SmartOps IA
 * Detecta gaps de conteúdo, tendências emergentes e oportunidades de pauta.
 *
 * Usage:
 *   node content_opportunity_agent.js --mode scan
 *   node content_opportunity_agent.js --mode gap --area seo
 *   node content_opportunity_agent.js --mode trend --fonte instagram
 *   node content_opportunity_agent.js --mode pauta --count 10
 *   node content_opportunity_agent.js --mode competitor --rival "consultor lean BH"
 *   node content_opportunity_agent.js --mode prioritize
 *   node content_opportunity_agent.js --mode report
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
  const dir  = path.join(__dirname, 'outputs', `opportunity_${date}`);
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
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return { opportunities: [] }; }
}

function saveState(updates) {
  const f     = path.join(__dirname, 'current_state.json');
  const state = loadState();
  fs.writeFileSync(f, JSON.stringify({ ...state, ...updates, last_updated: new Date().toISOString() }, null, 2));
}

// ─── CALCULADORAS LOCAIS ─────────────────────────────────────────────────────

function scoreOpportunity({ potencial, urgencia, dificuldade }) {
  const p = { alto: 10, medio: 6, baixo: 3 };
  const u = { imediata: 10, semana: 7, mes: 4 };
  const d = { baixa: 10, media: 6, alta: 3 };
  return Math.round(
    (p[potencial?.toLowerCase()] || 5) * 0.4 +
    (u[urgencia?.toLowerCase()]  || 5) * 0.3 +
    (d[dificuldade?.toLowerCase()] || 5) * 0.3
  );
}

const CONTENT_GAPS = [
  { tema: 'Lean Six Sigma para autoescolas', demanda: 'alta', competicao: 'baixa', intencao: 'comercial' },
  { tema: 'Automação com n8n para clínicas BH', demanda: 'alta', competicao: 'baixa', intencao: 'comercial' },
  { tema: 'Como calcular custo do retrabalho', demanda: 'media', competicao: 'media', intencao: 'educacional' },
  { tema: 'DMAIC na prática para PMEs', demanda: 'alta', competicao: 'media', intencao: 'educacional' },
  { tema: 'n8n vs Make vs Zapier para pequenas empresas', demanda: 'alta', competicao: 'alta', intencao: 'comparativo' },
  { tema: 'Como montar SDR com IA sem programar', demanda: 'alta', competicao: 'media', intencao: 'comercial' },
  { tema: 'Gestão visual Lean para escritório', demanda: 'media', competicao: 'baixa', intencao: 'educacional' },
  { tema: 'Automação de agendamento para pet shops', demanda: 'alta', competicao: 'baixa', intencao: 'comercial' },
];

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

function buildScanPrompt() {
  return `Você é um especialista em estratégia de conteúdo para consultoria Lean Six Sigma + Automação com IA para PMEs em BH/MG.

ANÁLISE PEDIDA: Varredura semanal de oportunidades de conteúdo

Com base no seguinte banco de gaps conhecidos:
${JSON.stringify(CONTENT_GAPS, null, 2)}

Gere um relatório com:

1. TOP 5 OPORTUNIDADES URGENTES
   - Tema exato
   - Por que agora
   - Canal ideal (Instagram, LinkedIn, Blog)
   - Formato recomendado (reel, carrossel, artigo)
   - Gancho sugerido
   - CTA

2. TEMAS EM ALTA (tendências de mercado em Lean/IA/automação)

3. GAPS DE CONCORRENTES (o que não está sendo bem coberto)

4. HANDOFF
   - Para Content Agent: [o que produzir]
   - Para SEO Agent: [como otimizar]
   - Para Copywriter Agent: [o que escrever]

Formato de saída markdown profissional.`;
}

function buildPautaPrompt(count) {
  return `Gere ${count} pautas de conteúdo para SmartOps IA (consultoria Lean + Automação com IA para PMEs em BH/MG).

Para cada pauta:
- Título claro
- Tipo: [Gap de Informação / Tendência / Pergunta Sem Resposta / Gap de Concorrente / Conversão]
- Canal: [Instagram / LinkedIn / Blog / YouTube]
- Formato: [Reel / Carrossel / Card / Artigo / Short]
- Potencial: Alto / Médio / Baixo
- Urgência: Imediata / Esta semana / Este mês
- Gancho
- CTA

Nunca incluir Manutenção TI. Foco em Lean, Six Sigma, Kaizen, automação, n8n, IA para processos.
Ordenar por prioridade (mais urgente primeiro).`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const mode  = getArg('mode', 'scan');
  const area  = getArg('area', 'instagram');
  const count = parseInt(getArg('count', '10'));
  const rival = getArg('rival', 'consultor lean BH');
  const dir   = setupOutput();
  const ts    = Date.now();

  if (mode === 'report') {
    const state = loadState();
    console.log('\n📊 CONTENT OPPORTUNITY — RELATÓRIO');
    console.log(`Oportunidades identificadas: ${state.opportunities?.length || 0}`);
    console.log(`Última varredura: ${state.last_scan || 'N/A'}`);
    return;
  }

  let prompt;
  let filename;

  if (mode === 'scan') {
    prompt = buildScanPrompt();
    filename = `scan_${ts}.md`;
  } else if (mode === 'pauta') {
    prompt = buildPautaPrompt(count);
    filename = `pauta_semanal_${ts}.md`;
  } else if (mode === 'gap') {
    prompt = `Analise gaps de conteúdo na área de "${area}" para consultoria Lean + Automação com IA para PMEs em BH/MG.\n\nIdentifique:\n1. O que o público busca mas não encontra\n2. Perguntas sem boa resposta online\n3. Conteúdo superficial que pode ser aprofundado\n4. Oportunidades de fundo de funil\n\nRetorne lista priorizada com: tema, gap identificado, sugestão de conteúdo, canal, formato, potencial.`;
    filename = `gap_${area}_${ts}.md`;
  } else if (mode === 'trend') {
    prompt = `Identifique as 10 principais tendências emergentes em Lean Six Sigma e Automação com IA para PMEs no Brasil em 2026.\n\nPara cada tendência:\n- Nome da tendência\n- Por que está emergindo\n- Janela de oportunidade (semanas até saturar)\n- Tipo de conteúdo ideal\n- Gancho sugerido\n\nOrdenar por urgência.`;
    filename = `trends_${ts}.md`;
  } else if (mode === 'competitor') {
    prompt = `Analise os gaps de conteúdo de um concorrente típico no nicho "${rival}".\n\nIdentifique:\n1. O que eles cobrem bem (evitar duplicar)\n2. O que eles cobrem superficialmente (oportunidade de ir mais fundo)\n3. O que eles não cobrem (gap puro)\n4. Angle diferenciado para SmartOps IA\n\nRetorne: tabela comparativa + 5 oportunidades concretas.`;
    filename = `competitor_gap_${ts}.md`;
  } else if (mode === 'prioritize') {
    const scored = CONTENT_GAPS.map(g => ({
      ...g,
      score: scoreOpportunity({
        potencial:   g.demanda,
        urgencia:    g.demanda === 'alta' ? 'imediata' : 'semana',
        dificuldade: g.competicao,
      }),
    })).sort((a, b) => b.score - a.score);
    console.log('\n🎯 OPORTUNIDADES PRIORIZADAS:\n');
    scored.forEach((o, i) => console.log(`${i + 1}. [${o.score}/10] ${o.tema} — ${o.intencao}`));
    saveOutput(dir, `prioritized_${ts}.json`, scored);
    saveState({ last_prioritize: new Date().toISOString() });
    return;
  } else {
    console.error(`Modo desconhecido: ${mode}`); process.exit(1);
  }

  console.log(`🔍 Detectando oportunidades [${mode}]...`);
  const msg = await client.messages.create({
    model: CONFIG.model, max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text;
  saveOutput(dir, filename, text);
  saveState({ last_scan: new Date().toISOString(), last_mode: mode });
  console.log('\n' + text);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
