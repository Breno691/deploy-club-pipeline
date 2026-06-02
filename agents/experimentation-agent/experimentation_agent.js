#!/usr/bin/env node
/**
 * Experimentation Agent — SmartOps IA
 * Motor de Otimização Contínua
 * "Dados vencem opiniões."
 *
 * Usage:
 *   node experimentation_agent.js --mode hypothesis
 *   node experimentation_agent.js --mode hypothesis --kpis '{"conversao_site_pct":1.5}'
 *   node experimentation_agent.js --mode design --hypothesis "headline com benefício específico vs genérico"
 *   node experimentation_agent.js --mode analyze --nc 150 --cc 3 --nv 148 --cv 5
 *   node experimentation_agent.js --mode cro --page "landing page /diagnostico-gratuito"
 *   node experimentation_agent.js --mode ads --platform google_ads
 *   node experimentation_agent.js --mode funnel --visitors 1000 --leads 18
 *   node experimentation_agent.js --mode learn --area site
 *   node experimentation_agent.js --mode report
 *   node experimentation_agent.js --mode dashboard
 *   node experimentation_agent.js --mode prioritize
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { generateHypothesesWithClaude, generateHypothesesLocally } = require('./src/agents/HypothesisAgent');
const { designExperimentWithClaude, designExperimentLocally }      = require('./src/agents/ExperimentDesignerAgent');
const { analyzeExperimentWithClaude, analyzeExperimentLocally }    = require('./src/agents/StatisticalAnalysisAgent');
const { runCROAnalysisWithClaude, auditPageLocally }               = require('./src/agents/CROTestingAgent');
const { analyzeAdsWithClaude, scoreAdsCampaign }                   = require('./src/agents/AdsTestingAgent');
const { analyzeFunnelWithClaude, analyzeFunnelLocally }            = require('./src/agents/FunnelTestingAgent');
const { synthesizeLearningsWithClaude, registerExperimentResult }  = require('./src/agents/ExperimentLearningAgent');
const { generateExperimentReportWithClaude, generateExperimentDashboard, buildExperimentSnapshot } = require('./src/agents/ExperimentReportAgent');
const { rankHypotheses } = require('./src/scoring/iceScore');
const { createLogger, saveOutput } = require('./src/utils/logger');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function parseJson(str, fallback = {}) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function setupOutput(mode) {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `experiment_${mode}_${date}`);
  ['logs', 'reports'].forEach(d => {
    if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true });
  });
  return { dir, date };
}

async function main() {
  const mode = getArg('mode', 'hypothesis');
  const area = getArg('area', null);

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  EXPERIMENTATION AGENT — SmartOps IA            ║');
  console.log('║  "Dados vencem opiniões."                        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode}\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY não configurada no .env');
    process.exit(1);
  }

  const { dir, date } = setupOutput(mode);
  const logger = createLogger(dir);
  logger.log(`mode=${mode}`);

  try {
    switch (mode) {

      case 'hypothesis': {
        const kpis    = parseJson(getArg('kpis', '{}'));
        const context = getArg('context', '');
        console.log('💡 Gerando hipóteses baseadas em dados...\n');

        const local = generateHypothesesLocally(kpis);
        console.log(`Hipóteses identificadas: ${local.total} | Alta prioridade: ${local.high_priority}`);
        console.log('\nTop 3 hipóteses por ICE score:');
        local.top_3.forEach((h, i) => console.log(`  ${i + 1}. [${h.area}] ${h.hypothesis} (ICE: ${h.ice_score})`));

        const report = await generateHypothesesWithClaude(kpis, context);
        console.log('\n' + report);
        saveOutput(path.join(dir, 'reports'), `hypothesis_report_${date}.md`, report);
        break;
      }

      case 'design': {
        const hypothesis = getArg('hypothesis', 'headline com benefício específico vs headline genérico');
        const testArea   = getArg('area', 'site');
        console.log(`🔬 Desenhando experimento: "${hypothesis}"\n`);

        const design = designExperimentLocally({ hypothesis, area: testArea, impact: 7, confidence: 6, ease: 8 });
        console.log(`Sample necessário: ${design.sample_required.n_per_variant} por variante`);
        console.log(`Duração estimada: ${design.duration.days} dias`);
        console.log(`ICE Score: ${design.ice_score}\n`);

        const spec = await designExperimentWithClaude(hypothesis, testArea);
        console.log(spec);
        saveOutput(path.join(dir, 'reports'), `experiment_design_${Date.now()}.md`, spec);
        break;
      }

      case 'analyze': {
        const nc = parseInt(getArg('nc', '200'));
        const cc = parseInt(getArg('cc', '4'));
        const nv = parseInt(getArg('nv', '198'));
        const cv = parseInt(getArg('cv', '7'));
        const hypothesis = getArg('hypothesis', 'Variante testada');

        console.log(`📊 Analisando experimento A/B...\n`);
        console.log(`Controle: N=${nc}, Conversões=${cc} (${(cc/nc*100).toFixed(1)}%)`);
        console.log(`Variante: N=${nv}, Conversões=${cv} (${(cv/nv*100).toFixed(1)}%)\n`);

        const local = analyzeExperimentLocally({ n_control: nc, conversions_control: cc, n_variant: nv, conversions_variant: cv });
        console.log(`Significância: ${local.significance?.confidence}% | Uplift: ${local.uplift?.uplift_pct}% | Vencedor: ${local.significance?.winner}`);

        const { analysis } = await analyzeExperimentWithClaude(
          { n_control: nc, conversions_control: cc, n_variant: nv, conversions_variant: cv, duration_days: 14 },
          hypothesis
        );
        console.log('\n' + analysis);
        saveOutput(path.join(dir, 'reports'), `analysis_${Date.now()}.md`, analysis);
        break;
      }

      case 'cro': {
        const page    = getArg('page', 'landing page /diagnostico-gratuito');
        const metrics = parseJson(getArg('metrics', '{}'));
        console.log(`🎯 Analisando CRO: "${page}"\n`);

        const audit = auditPageLocally({ ...metrics });
        console.log(`Score CRO: ${audit.cro_score}/100`);
        if (audit.issues.length) {
          console.log('\nProblemas encontrados:');
          audit.issues.forEach(i => console.log(`  ❌ [${i.severity}] ${i.issue}`));
        }

        const report = await runCROAnalysisWithClaude(page, metrics);
        console.log('\n' + report);
        saveOutput(path.join(dir, 'reports'), `cro_analysis_${Date.now()}.md`, report);
        break;
      }

      case 'ads': {
        const platform = getArg('platform', 'google_ads');
        const metrics  = parseJson(getArg('metrics', '{}'));
        console.log(`📢 Analisando Ads — ${platform}...\n`);

        const score = scoreAdsCampaign({ ...metrics, platform });
        console.log(`Score: ${score.score}/100 (${score.classification})`);
        if (score.issues.length) score.issues.forEach(i => console.log(`  ⚠️  ${i}`));

        const { analysis } = await analyzeAdsWithClaude(metrics, platform);
        console.log('\n' + analysis);
        saveOutput(path.join(dir, 'reports'), `ads_analysis_${platform}_${Date.now()}.md`, analysis);
        break;
      }

      case 'funnel': {
        const funnelData = {
          visitors:  parseInt(getArg('visitors', '1000')),
          leads:     parseInt(getArg('leads', '18')),
          meetings:  parseInt(getArg('meetings', '6')),
          proposals: parseInt(getArg('proposals', '3')),
          closed:    parseInt(getArg('closed', '1')),
          revenue_brl: parseInt(getArg('revenue', '11500')),
        };
        console.log('🔻 Analisando funil de vendas...\n');

        const local = analyzeFunnelLocally(funnelData);
        local.funnel.forEach(s => {
          console.log(`${s.from} → ${s.to}: ${s.n_from} → ${s.n_to} (${s.rate}%)${s.bottleneck ? ' ← GARGALO' : ''}`);
        });
        console.log(`\nLTV/CAC: ${local.ltv_cac}`);

        const { analysis } = await analyzeFunnelWithClaude(funnelData);
        console.log('\n' + analysis);
        saveOutput(path.join(dir, 'reports'), `funnel_analysis_${date}.md`, analysis);
        saveOutput(path.join(dir, 'reports'), 'funnel_data.json', local);
        break;
      }

      case 'learn': {
        console.log(`📚 Sintetizando aprendizados${area ? ` (área: ${area})` : ''}...\n`);
        const synthesis = await synthesizeLearningsWithClaude(area);
        console.log(synthesis);
        saveOutput(path.join(dir, 'reports'), `learnings_${area || 'geral'}_${date}.md`, synthesis);
        break;
      }

      case 'report': {
        const kpis = parseJson(getArg('kpis', '{}'));
        console.log('📋 Gerando relatório de experimentação...\n');
        const snapshot = buildExperimentSnapshot(kpis);
        const report   = await generateExperimentReportWithClaude(snapshot, 'weekly');
        console.log(report);
        saveOutput(path.join(dir, 'reports'), `experiment_report_${date}.md`, report);
        saveOutput(path.join(dir, 'reports'), 'snapshot.json', snapshot);
        break;
      }

      case 'dashboard': {
        const kpis = parseJson(getArg('kpis', '{}'));
        console.log('📊 Gerando Executive Dashboard...\n');
        const snapshot  = buildExperimentSnapshot(kpis);
        const dashboard = await generateExperimentDashboard(snapshot);
        console.log(dashboard);
        saveOutput(path.join(dir, 'reports'), `dashboard_${date}.md`, dashboard);
        break;
      }

      case 'prioritize': {
        const kpis = parseJson(getArg('kpis', '{}'));
        console.log('🎯 Priorizando hipóteses por ICE score...\n');
        const { hypotheses } = generateHypothesesLocally(kpis);
        const ranked = rankHypotheses(hypotheses);
        console.log('RANKING DE HIPÓTESES (ICE Score):\n');
        ranked.forEach((h, i) => {
          console.log(`${i + 1}. [${h.area}] ICE: ${h.ice_score} — ${h.classification.label}`);
          console.log(`   ${h.hypothesis}\n`);
        });
        saveOutput(path.join(dir, 'reports'), `prioritized_hypotheses_${date}.json`, ranked);
        break;
      }

      default:
        console.log(`Modo desconhecido: ${mode}`);
        console.log('Modos disponíveis: hypothesis | design | analyze | cro | ads | funnel | learn | report | dashboard | prioritize');
    }

    console.log(`\n✅ Output salvo em: ${dir}`);
    logger.log(`${mode} completed successfully`);

  } catch (err) {
    console.error(`\n❌ Erro: ${err.message}`);
    logger.log(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
