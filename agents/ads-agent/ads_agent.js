#!/usr/bin/env node
/**
 * Ads Agent Pro — SmartOps IA
 * Especialista Sênior em Google Ads, Meta Ads, Performance e ROI
 *
 * Usage:
 *   node ads_agent.js --mode analyze
 *   node ads_agent.js --mode google --impressions 10000 --clicks 350 --cost 850 --conversions 3 --revenue 11500
 *   node ads_agent.js --mode meta --impressions 25000 --clicks 180 --cost 400 --conversions 2 --frequency 2.8
 *   node ads_agent.js --mode report
 *   node ads_agent.js --mode ceo-brief
 *   node ads_agent.js --mode score
 *   node ads_agent.js --mode creative --platform meta_ads
 *   node ads_agent.js --mode landing --ctr 3.2 --cpa 520 --conv_rate 1.1 --bounce_rate 74
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { analyzeGoogleAdsWithClaude, analyzeGoogleAdsLocally } = require('./src/agents/GoogleAdsAgent');
const { analyzeMetaAdsWithClaude, analyzeMetaAdsLocally }     = require('./src/agents/MetaAdsAgent');
const { buildAdsSnapshot, generateWeeklyReportWithClaude, generateCEOBriefWithClaude } = require('./src/agents/AdsReportAgent');
const { analyzeCreativesWithClaude, auditCreativePortfolio }  = require('./src/agents/CreativeAnalysisAgent');
const { auditLandingPageForAdsWithClaude }                    = require('./src/agents/LandingPageAuditAgent');
const { calcCampaignHealthScore, detectAdsAlerts }             = require('./src/calculations/adsCalculators');
const { CONFIG } = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function parseNum(name, fallback = 0) { return parseFloat(getArg(name, String(fallback))); }

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `ads_${date}`);
  ['logs', 'reports'].forEach(d => { if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true }); });
  return { dir, date };
}

function saveOutput(dir, filename, content) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}

async function main() {
  const mode = getArg('mode', 'analyze');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  ADS AGENT PRO — SmartOps IA                    ║');
  console.log('║  Google Ads + Meta Ads + Performance + ROI      ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode}\n`);

  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY não configurada'); process.exit(1); }

  const { dir, date } = setupOutput();

  const googleData = {
    impressions: parseNum('impressions', 10000),
    clicks:      parseNum('clicks', 350),
    cost:        parseNum('cost', 850),
    conversions: parseNum('conversions', 3),
    revenue:     parseNum('revenue', 11500),
    period:      getArg('period', `últimos 7 dias até ${date}`),
  };

  const metaData = {
    impressions: parseNum('impressions', 25000),
    reach:       parseNum('reach', 18000),
    clicks:      parseNum('clicks', 180),
    cost:        parseNum('cost', 400),
    conversions: parseNum('conversions', 2),
    revenue:     parseNum('revenue', 0),
    frequency:   parseNum('frequency', 2.8),
    period:      getArg('period', `últimos 7 dias até ${date}`),
  };

  try {
    switch (mode) {

      case 'analyze':
      case 'report': {
        const snapshot = buildAdsSnapshot(googleData, metaData);
        console.log('SNAPSHOT CONSOLIDADO:');
        console.log(`  Investimento: R$ ${snapshot.consolidated.total_cost?.toLocaleString('pt-BR')}`);
        console.log(`  Conversões: ${snapshot.consolidated.total_conversions}`);
        console.log(`  ROAS blendado: ${snapshot.consolidated.blended_roas}`);
        console.log(`  Score Google: ${snapshot.google.health.score}/100 | Meta: ${snapshot.meta.health.score}/100\n`);

        const report = await generateWeeklyReportWithClaude(snapshot);
        console.log(report);
        saveOutput(path.join(dir, 'reports'), `ads_report_${date}.md`, report);
        saveOutput(path.join(dir, 'reports'), 'snapshot.json', snapshot);
        break;
      }

      case 'google': {
        const local = analyzeGoogleAdsLocally(googleData);
        console.log(`Score: ${local.health.score}/100 (${local.health.label})`);
        console.log(`CTR: ${local.metrics.ctr}% | CPC: R$ ${local.metrics.cpc} | CPA: R$ ${local.metrics.cpa} | ROAS: ${local.metrics.roas}\n`);
        if (local.alerts.critico.length) { console.log('⚠️  ALERTAS CRÍTICOS:'); local.alerts.critico.forEach(a => console.log(`  ${a}`)); }

        const { analysis } = await analyzeGoogleAdsWithClaude(googleData);
        console.log('\n' + analysis);
        saveOutput(path.join(dir, 'reports'), `google_ads_${date}.md`, analysis);
        break;
      }

      case 'meta': {
        const local = analyzeMetaAdsLocally(metaData);
        console.log(`Score: ${local.health.score}/100 (${local.health.label})`);
        console.log(`CTR: ${local.metrics.ctr}% | CPM: R$ ${local.metrics.cpm} | CPA: R$ ${local.metrics.cpa} | Freq: ${local.metrics.frequency}`);
        console.log(`Fadiga criativa: ${local.creative_fatigue ? '⚠️ SIM' : '✅ Não'} | Escala: ${local.scale_opportunity ? '🚀 SIM' : 'Não'}\n`);

        const { analysis } = await analyzeMetaAdsWithClaude(metaData);
        console.log('\n' + analysis);
        saveOutput(path.join(dir, 'reports'), `meta_ads_${date}.md`, analysis);
        break;
      }

      case 'score': {
        const platform = getArg('platform', 'google_search');
        const metrics  = { ...googleData, ctr: 0, cpc: 0 };
        const score    = calcCampaignHealthScore(metrics, platform);
        console.log(`Score ${platform}: ${score.score}/100 (${score.label})`);
        if (score.issues.length) score.issues.forEach(i => console.log(`  ${i.severity === 'critico' ? '❌' : '⚠️'} ${i.metric}: ${i.value}`));
        saveOutput(path.join(dir, 'reports'), 'health_score.json', score);
        break;
      }

      case 'ceo-brief': {
        const snapshot = buildAdsSnapshot(googleData, metaData);
        const brief = await generateCEOBriefWithClaude(snapshot);
        console.log(brief);
        saveOutput(path.join(dir, 'reports'), `ceo_brief_${date}.md`, brief);
        break;
      }

      case 'creative': {
        const platform = getArg('platform', 'meta_ads');
        console.log(`🎨 Analisando criativos — ${platform}...\n`);
        const result = await analyzeCreativesWithClaude({ metrics: metaData }, platform);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `creative_analysis_${date}.md`, result);
        break;
      }

      case 'landing': {
        const page = getArg('page', 'landing page /diagnostico-gratuito');
        const lp_metrics = {
          ctr:          parseNum('ctr', 3.2),
          cpa:          parseNum('cpa', 520),
          conv_rate:    parseNum('conv_rate', 1.1),
          bounce_rate:  parseNum('bounce_rate', 74),
          time_on_page_s: parseNum('time', 35),
          platform:     getArg('platform', 'google_search'),
        };
        console.log(`🔍 Auditando landing page pós-clique...\n`);
        console.log(`CTR: ${lp_metrics.ctr}% | CPA: R$ ${lp_metrics.cpa} | Conv: ${lp_metrics.conv_rate}% | Bounce: ${lp_metrics.bounce_rate}%`);
        const result = await auditLandingPageForAdsWithClaude(lp_metrics, page);
        console.log('\n' + result);
        saveOutput(path.join(dir, 'reports'), `landing_audit_${date}.md`, result);
        break;
      }

      default:
        console.log(`Modo desconhecido: ${mode}\nDisponíveis: analyze | google | meta | report | score | ceo-brief | creative | landing`);
    }

    console.log(`\n✅ Output: ${dir}`);
  } catch (err) { console.error(`❌ ${err.message}`); process.exit(1); }
}

main();
