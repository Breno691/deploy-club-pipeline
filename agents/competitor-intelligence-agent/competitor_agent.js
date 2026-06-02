#!/usr/bin/env node
/**
 * Competitor Intelligence Agent — SmartOps IA
 * Diretor de Inteligência Competitiva
 *
 * Ciclo: Descobrir → Monitorar → Analisar → Gap → Oportunidade → Diferenciação → Ação
 *
 * Usage:
 *   node competitor_agent.js --mode discover
 *   node competitor_agent.js --mode landscape
 *   node competitor_agent.js --mode instagram --competitor "Consultor Lean BH" --profile "@perfillean" --context "consultor solo, posts sobre lean"
 *   node competitor_agent.js --mode google --query "consultoria lean belo horizonte"
 *   node competitor_agent.js --mode seo --keyword "consultoria lean belo horizonte"
 *   node competitor_agent.js --mode seo --map
 *   node competitor_agent.js --mode ads --competitor "Agência X" --platform meta --offer "diagnóstico gratuito de processos"
 *   node competitor_agent.js --mode website --competitor "Consultoria Y" --url "consultoriay.com.br"
 *   node competitor_agent.js --mode differentiate --gap "nenhum concorrente usa Lean + IA juntos"
 *   node competitor_agent.js --mode opportunity --gap "nenhum concorrente tem página de diagnóstico gratuito em BH"
 *   node competitor_agent.js --mode brief
 *   node competitor_agent.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { discoverCompetitors, mapCompetitiveLandscape }  = require('./src/agents/CompetitorDiscoveryAgent');
const { analyzeInstagramCompetitor }                     = require('./src/agents/InstagramCompetitorAgent');
const { analyzeGoogleCompetition }                       = require('./src/agents/GoogleCompetitorAgent');
const { analyzeSEOKeyword, generateSEOOpportunityMap }   = require('./src/agents/SEOCompetitorAgent');
const { analyzeCompetitorAd }                            = require('./src/agents/AdsCompetitorAgent');
const { analyzeCompetitorWebsite }                       = require('./src/agents/WebsiteCompetitorAgent');
const { generateDifferentiation, generateOpportunityBrief } = require('./src/agents/DifferentiationAgent');
const { generateWeeklyReport, generateCEOCompetitorBrief, updateMemory } = require('./src/agents/CompetitorReportAgent');
const { CONFIG }                                         = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function hasFlag(name) { return process.argv.includes(`--${name}`); }

function saveOutput(filename, content) {
  const dir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

function printSection(title, text) {
  console.log(`\n${'─'.repeat(62)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(62));
  console.log(text);
}

async function main() {
  const mode = getArg('mode', 'report');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    COMPETITOR INTELLIGENCE AGENT — SmartOps IA            ║');
  console.log('║    Diretor de Inteligência Competitiva                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`  Modo: ${mode} | ${new Date().toLocaleString('pt-BR')}\n`);

  // ── DISCOVER ──────────────────────────────────────────────────────────────
  if (mode === 'discover') {
    const context = getArg('context', '');
    console.log('  Mapeando cenário competitivo completo...');
    const res = await discoverCompetitors({ context });

    printSection('MAPA COMPETITIVO', res.landscape.map(c =>
      `[${c.type.toUpperCase()}] ${c.name} | ${c.channels.join('+')} | Ameaça: ${c.threat}`
    ).join('\n'));
    printSection('ANÁLISE DO CENÁRIO', res.analysis);
    updateMemory({ competitors_mapped: res.landscape.length });
    saveOutput(`discover_${Date.now()}.json`, res);

  // ── LANDSCAPE ─────────────────────────────────────────────────────────────
  } else if (mode === 'landscape') {
    const { landscape } = await mapCompetitiveLandscape();
    console.log(`\n  🗺️  LANDSCAPE COMPETITIVO — ${landscape.length} concorrentes mapeados\n`);
    const byType = {};
    landscape.forEach(c => {
      if (!byType[c.type]) byType[c.type] = [];
      byType[c.type].push(c);
    });
    Object.entries(byType).forEach(([type, list]) => {
      console.log(`\n  [${type.toUpperCase()}]`);
      list.forEach(c => console.log(`  • ${c.name} | Canais: ${c.channels.join('+')} | Ameaça: ${c.threat}`));
    });
    saveOutput(`landscape_${Date.now()}.json`, { landscape });

  // ── INSTAGRAM ─────────────────────────────────────────────────────────────
  } else if (mode === 'instagram') {
    const competitor    = getArg('competitor', 'Concorrente');
    const profile       = getArg('profile', '@perfil');
    const context       = getArg('context', '');
    const recentContent = getArg('content', '');

    console.log(`  Analisando Instagram: ${competitor} (${profile})...`);
    const res = await analyzeInstagramCompetitor({ competitor, profile, context, recentContent });

    printSection('ANÁLISE DE INSTAGRAM', res.analysis);
    updateMemory({ analyses_run: (require('./src/agents/CompetitorReportAgent').loadMemory().analyses_run || 0) + 1 });
    saveOutput(`instagram_${Date.now()}.json`, res);

  // ── GOOGLE ────────────────────────────────────────────────────────────────
  } else if (mode === 'google') {
    const query   = getArg('query', 'consultoria lean belo horizonte');
    const context = getArg('context', '');

    console.log(`  Analisando Google: "${query}"...`);
    const res = await analyzeGoogleCompetition({ query, context });

    printSection('COMPETIÇÃO ESTIMADA', JSON.stringify(res.competition, null, 2));
    printSection('ANÁLISE DE GOOGLE', res.analysis);
    saveOutput(`google_${Date.now()}.json`, res);

  // ── SEO ───────────────────────────────────────────────────────────────────
  } else if (mode === 'seo') {
    if (hasFlag('map')) {
      console.log('  Gerando mapa de oportunidades SEO...');
      const context = getArg('context', '');
      const res = await generateSEOOpportunityMap({ context });

      printSection('KEYWORDS RANKEADAS POR OPORTUNIDADE', res.keywords.map((k, i) =>
        `${i+1}. "${k.kw}" — score: ${k.opp.score} | ${k.opp.difficulty} | ${k.opp.priority}`
      ).join('\n'));
      printSection('MAPA DE OPORTUNIDADES SEO', res.analysis);
      saveOutput(`seo_map_${Date.now()}.json`, res);
    } else {
      const keyword = getArg('keyword', 'consultoria lean belo horizonte');
      const context = getArg('context', '');

      console.log(`  Analisando keyword: "${keyword}"...`);
      const res = await analyzeSEOKeyword({ keyword, context });

      printSection('OPORTUNIDADE', JSON.stringify(res.opportunity, null, 2));
      printSection('PLANO DE CONTEÚDO', JSON.stringify(res.contentPlan, null, 2));
      printSection('ANÁLISE SEO', res.analysis);
      saveOutput(`seo_${Date.now()}.json`, res);
    }

  // ── ADS ───────────────────────────────────────────────────────────────────
  } else if (mode === 'ads') {
    const competitor = getArg('competitor', 'Concorrente');
    const platform   = getArg('platform', 'meta');
    const offer      = getArg('offer', 'diagnóstico gratuito');
    const adCopy     = getArg('copy', '');
    const hook       = getArg('hook', '');
    const context    = getArg('context', '');

    console.log(`  Analisando anúncio: ${competitor} no ${platform}...`);
    const res = await analyzeCompetitorAd({ competitor, platform, offer, adCopy, hook, context });

    printSection('ANÁLISE DE ANÚNCIO + CONTRA-MOVIMENTO', res.analysis);
    saveOutput(`ads_${Date.now()}.json`, res);

  // ── WEBSITE ───────────────────────────────────────────────────────────────
  } else if (mode === 'website') {
    const competitor = getArg('competitor', 'Concorrente');
    const url        = getArg('url', 'site.com.br');
    const context    = getArg('context', '');

    console.log(`  Analisando site: ${competitor} (${url})...`);
    const res = await analyzeCompetitorWebsite({ competitor, url, context });

    printSection('ANÁLISE DE SITE', res.analysis);
    saveOutput(`website_${Date.now()}.json`, res);

  // ── DIFFERENTIATE ─────────────────────────────────────────────────────────
  } else if (mode === 'differentiate') {
    const gap     = getArg('gap', '');
    const context = getArg('context', '');

    console.log('  Gerando análise de diferenciação...');
    const res = await generateDifferentiation({ gap, context });

    printSection('MATRIZ DE DIFERENCIAÇÃO', JSON.stringify(res.matrix, null, 2));
    printSection('ANÁLISE DE DIFERENCIAÇÃO', res.analysis);
    saveOutput(`differentiation_${Date.now()}.json`, res);

  // ── OPPORTUNITY ───────────────────────────────────────────────────────────
  } else if (mode === 'opportunity') {
    const gap     = getArg('gap', 'gap competitivo não informado');
    const context = getArg('context', '');

    console.log(`  Criando opportunity brief: "${gap}"...`);
    const res = await generateOpportunityBrief({ gap, context });

    printSection('OPPORTUNITY BRIEF', `Score: ${res.opportunityScore.score}/100 — ${res.opportunityScore.color} ${res.opportunityScore.label}`);
    printSection('ANÁLISE', res.analysis);
    updateMemory({ opportunities_created: (require('./src/agents/CompetitorReportAgent').loadMemory().opportunities_created || 0) + 1 });
    saveOutput(`opportunity_${Date.now()}.json`, res);

  // ── BRIEF ─────────────────────────────────────────────────────────────────
  } else if (mode === 'brief') {
    const context = getArg('context', '');
    console.log('  Gerando CEO Competitor Brief...');
    const res = await generateCEOCompetitorBrief({ context });

    printSection('CEO COMPETITOR BRIEF', res.analysis);
    saveOutput(`ceo_brief_${Date.now()}.json`, res);

  // ── REPORT ────────────────────────────────────────────────────────────────
  } else if (mode === 'report') {
    const context = getArg('context', '');
    console.log('  Gerando relatório semanal de inteligência competitiva...');
    const res = await generateWeeklyReport({ context });

    printSection('RELATÓRIO SEMANAL COMPETITIVO', res.analysis);
    saveOutput(`weekly_report_${Date.now()}.json`, res);

  } else {
    console.log(`\n  ❌ Modo desconhecido: "${mode}"`);
    console.log('  Modos: discover | landscape | instagram | google | seo | ads | website | differentiate | opportunity | brief | report\n');
    process.exit(1);
  }

  console.log('\n  ✅ Competitor Intelligence Agent — concluído.\n');
}

main().catch(err => {
  console.error('\n❌ ERRO:', err.message);
  process.exit(1);
});
