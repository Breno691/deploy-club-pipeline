#!/usr/bin/env node
/**
 * Case Study Intelligence Agent — SmartOps IA
 * Diretor de Prova Social, Resultados e Case Studies
 *
 * Ciclo: Projeto → Before/After → ROI → Permissão → Case → Ativo → Venda
 *
 * Usage:
 *   node case_study_agent.js --mode capture --client "Clínica BH" --sector clinica --problem "agendamento manual" --solution "automacao n8n" --investment 5000 --hours-before 20 --hours-after 3
 *   node case_study_agent.js --mode before-after --client "Indústria X" --sector industria --problem "retrabalho 30/semana" --intervention "kaizen + SOP" --metric-before 30 --metric-after 8 --unit "defeitos/semana"
 *   node case_study_agent.js --mode roi --case "clinica-bh-2026" --investment 5000 --monthly-savings 2400
 *   node case_study_agent.js --mode roi --case "fabrica-abc" --investment 8000 --hours-week 15 --cost-hour 50
 *   node case_study_agent.js --mode permission --client "Dr. João" --case "clinica-bh-2026" --result "40% menos retrabalho" --level 3
 *   node case_study_agent.js --mode testimonial --client "Dr. João" --sector clinica --result "reduziu 40% retrabalho"
 *   node case_study_agent.js --mode narrative --case "clinica-bh-2026" --sector clinica --problem "agendamento lento" --solution "automacao" --result "40% reducao"
 *   node case_study_agent.js --mode repurpose --case "clinica-bh-2026" --sector clinica --problem "retrabalho" --solution "kaizen" --result "40% reducao" --roi 4.2
 *   node case_study_agent.js --mode proposal --case "clinica-bh-2026" --sector clinica --problem "retrabalho" --solution "kaizen" --result "40% reducao" --target-sector clinica --pain "retrabalho"
 *   node case_study_agent.js --mode sales --objection "caro demais" --sector servicos
 *   node case_study_agent.js --mode sales --objection "não vai funcionar aqui" --sector industria
 *   node case_study_agent.js --mode analytics
 *   node case_study_agent.js --mode library
 *   node case_study_agent.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { captureCase }                  = require('./src/agents/CaseCaptureAgent');
const { generateBeforeAfter }          = require('./src/agents/BeforeAfterAgent');
const { analyzeROI }                   = require('./src/agents/ROIAnalysisAgent');
const { managePermission }             = require('./src/agents/ClientPermissionAgent');
const { generateTestimonialRequest }   = require('./src/agents/TestimonialAgent');
const { generateNarrative }            = require('./src/agents/CaseNarrativeAgent');
const { repurposeCase }                = require('./src/agents/CaseContentRepurposingAgent');
const { generateProposalBlock }        = require('./src/agents/ProposalProofAgent');
const { enableSales }                  = require('./src/agents/SalesEnablementAgent');
const { generateCaseReport, generateAnalytics, loadLibrary, saveToLibrary } = require('./src/agents/CaseReportAgent');
const { CONFIG }                       = require('./src/config');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function getNumArg(name, fallback = 0) {
  const v = getArg(name);
  return v !== null ? parseFloat(v) : fallback;
}

function saveOutput(filename, content) {
  const dir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

function printSection(title, text) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
  console.log(text);
}

async function main() {
  const mode = getArg('mode', 'report');

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║      CASE STUDY INTELLIGENCE AGENT — SmartOps IA        ║');
  console.log('║  Diretor de Prova Social, Resultados e Case Studies      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Modo: ${mode} | ${new Date().toLocaleString('pt-BR')}\n`);

  // ── CAPTURE ──────────────────────────────────────────────────────────────
  if (mode === 'capture') {
    const clientName  = getArg('client');
    const sector      = getArg('sector', 'servicos');
    const problem     = getArg('problem', 'problema não informado');
    const solution    = getArg('solution', 'solução não informada');
    const investment  = getNumArg('investment');
    const hoursBefore = getNumArg('hours-before');
    const hoursAfter  = getNumArg('hours-after');
    const costHour    = getNumArg('cost-hour') || CONFIG.default_cost_hour;
    const context     = getArg('context', '');

    console.log('  Capturando dados do projeto...');
    const result = await captureCase({ client: clientName, sector, problem, solution, investment, hoursBefore, hoursAfter, costHour, context });

    printSection('DADOS DO CASE', JSON.stringify(result.record, null, 2));
    printSection('ANÁLISE DO AGENTE', result.analysis);

    // Salvar na biblioteca
    saveToLibrary(result.record);
    saveOutput(`case_capture_${Date.now()}.json`, result);

  // ── BEFORE-AFTER ──────────────────────────────────────────────────────────
  } else if (mode === 'before-after') {
    const clientName    = getArg('client');
    const sector        = getArg('sector', 'servicos');
    const problem       = getArg('problem', 'problema não informado');
    const intervention  = getArg('intervention', 'intervenção não informada');
    const metricBefore  = getNumArg('metric-before');
    const metricAfter   = getNumArg('metric-after');
    const unit          = getArg('unit', 'unidades');
    const context       = getArg('context', '');

    console.log('  Gerando framework antes/depois...');
    const result = await generateBeforeAfter({ client: clientName, sector, problem, intervention, metricBefore, metricAfter, unit, context });

    printSection('MELHORIA CALCULADA', JSON.stringify(result.improvement, null, 2));
    printSection('ANÁLISE ANTES/DEPOIS', result.analysis);
    saveOutput(`before_after_${Date.now()}.json`, result);

  // ── ROI ───────────────────────────────────────────────────────────────────
  } else if (mode === 'roi') {
    const caseName        = getArg('case', 'Case SmartOps');
    const investment      = getNumArg('investment');
    const monthlySavings  = getNumArg('monthly-savings');
    const annualRevenuGain= getNumArg('annual-revenue-gain');
    const hoursWeek       = getNumArg('hours-week');
    const costHour        = getNumArg('cost-hour') || CONFIG.default_cost_hour;
    const context         = getArg('context', '');

    console.log('  Calculando ROI...');
    const result = await analyzeROI({ caseName, investment, monthlySavings, annualRevenuGain, hoursWeek, costHour, context });

    printSection('CÁLCULO DE ROI', JSON.stringify(result.calc, null, 2));
    printSection('NARRATIVA FINANCEIRA', result.analysis);
    saveOutput(`roi_analysis_${Date.now()}.json`, result);

  // ── PERMISSION ────────────────────────────────────────────────────────────
  } else if (mode === 'permission') {
    const clientName      = getArg('client', 'Cliente');
    const caseName        = getArg('case', 'case-smartops');
    const result          = getArg('result', 'resultado excelente');
    const currentLevel    = getNumArg('current-level') || 0;
    const requestedLevel  = getNumArg('level') || 1;

    console.log('  Gerando estratégia de permissão...');
    const res = await managePermission({ clientName, caseName, result, currentLevel, requestedLevel });

    printSection('TEMPLATE DE PEDIDO', res.requestTemplate);
    printSection('ANÁLISE DE PERMISSÃO', res.analysis);
    saveOutput(`permission_${Date.now()}.json`, res);

  // ── TESTIMONIAL ───────────────────────────────────────────────────────────
  } else if (mode === 'testimonial') {
    const clientName = getArg('client', 'Cliente');
    const sector     = getArg('sector', 'servicos');
    const result     = getArg('result', 'resultado positivo');
    const context    = getArg('context', '');

    console.log('  Gerando pedido de depoimento...');
    const res = await generateTestimonialRequest({ clientName, sector, result, context });

    printSection('PERGUNTAS PARA DEPOIMENTO', res.questions.map((q, i) => `${i+1}. ${q}`).join('\n'));
    printSection('ANÁLISE E TEMPLATES', res.analysis);
    saveOutput(`testimonial_${Date.now()}.json`, res);

  // ── NARRATIVE ─────────────────────────────────────────────────────────────
  } else if (mode === 'narrative') {
    const caseName   = getArg('case', 'case-smartops');
    const clientName = getArg('client');
    const sector     = getArg('sector', 'servicos');
    const problem    = getArg('problem', 'problema');
    const solution   = getArg('solution', 'solução');
    const result     = getArg('result', 'resultado');
    const roi        = getNumArg('roi') || null;
    const payback    = getNumArg('payback') || null;
    const framework  = getArg('framework');
    const anonymous  = getArg('public') !== 'true';

    console.log('  Gerando narrativa do case...');
    const res = await generateNarrative({ caseName, client: clientName, sector, problem, solution, result, roi, payback, framework, anonymous });

    printSection('NARRATIVA DO CASE', res.analysis);
    saveOutput(`narrative_${Date.now()}.json`, res);

  // ── REPURPOSE ─────────────────────────────────────────────────────────────
  } else if (mode === 'repurpose') {
    const caseName        = getArg('case', 'case-smartops');
    const clientName      = getArg('client');
    const sector          = getArg('sector', 'servicos');
    const problem         = getArg('problem', 'problema');
    const solution        = getArg('solution', 'solução');
    const result          = getArg('result', 'resultado positivo');
    const roi             = getNumArg('roi') || null;
    const payback         = getNumArg('payback') || null;
    const permissionLevel = getNumArg('permission') || 1;

    console.log('  Gerando ativos de conteúdo a partir do case...');
    const res = await repurposeCase({ caseName, client: clientName, sector, problem, solution, result, roi, payback, permissionLevel });

    printSection('ATIVOS GERADOS', res.analysis);
    saveOutput(`repurpose_${Date.now()}.json`, res);

  // ── PROPOSAL ──────────────────────────────────────────────────────────────
  } else if (mode === 'proposal') {
    const caseName        = getArg('case', 'case-smartops');
    const clientName      = getArg('client');
    const sector          = getArg('sector', 'servicos');
    const problem         = getArg('problem', 'problema');
    const solution        = getArg('solution', 'solução');
    const result          = getArg('result', 'resultado positivo');
    const roi             = getNumArg('roi') || null;
    const payback         = getNumArg('payback') || null;
    const targetSector    = getArg('target-sector');
    const targetPain      = getArg('pain');
    const permissionLevel = getNumArg('permission') || 1;

    console.log('  Gerando bloco de prova social para proposta...');
    const res = await generateProposalBlock({ caseName, client: clientName, sector, problem, solution, result, roi, payback, targetSector, targetPain, permissionLevel });

    printSection('BLOCO DE PROPOSTA', res.analysis);
    saveOutput(`proposal_block_${Date.now()}.json`, res);

  // ── SALES ─────────────────────────────────────────────────────────────────
  } else if (mode === 'sales') {
    const objection   = getArg('objection', 'caro demais');
    const sector      = getArg('sector');
    const pain        = getArg('pain');
    const leadProfile = getArg('lead', '');
    const context     = getArg('context', '');

    console.log('  Gerando kit de habilitação de vendas...');
    const res = await enableSales({ objection, targetSector: sector, targetPain: pain, leadProfile, context });

    printSection('KIT DE VENDAS', res.analysis);
    saveOutput(`sales_enablement_${Date.now()}.json`, res);

  // ── ANALYTICS ─────────────────────────────────────────────────────────────
  } else if (mode === 'analytics') {
    console.log('  Analisando impacto comercial da biblioteca de cases...');
    const res = await generateAnalytics();

    printSection('ANALYTICS DE CASES', JSON.stringify(res.stats, null, 2));
    printSection('ANÁLISE DE IMPACTO', res.analysis);
    saveOutput(`analytics_${Date.now()}.json`, res);

  // ── LIBRARY ───────────────────────────────────────────────────────────────
  } else if (mode === 'library') {
    const library = loadLibrary();
    console.log(`\n  📚 BIBLIOTECA DE CASES — ${library.length} case(s) registrado(s)\n`);

    if (!library.length) {
      console.log('  ⚠️  Biblioteca vazia. Use --mode capture para registrar o primeiro case.');
    } else {
      library.forEach((c, i) => {
        console.log(`  ${i+1}. [${c.status}] ${c.case_name || c.id}`);
        console.log(`     Setor: ${c.sector} | ROI: ${c.roi ? c.roi + 'x' : 'N/A'} | Perm: Nível ${c.permission_level}`);
        console.log(`     Potencial: ${c.potential?.level || 'N/A'}`);
        console.log('');
      });
    }

  // ── REPORT ────────────────────────────────────────────────────────────────
  } else if (mode === 'report') {
    console.log('  Gerando relatório completo de cases...');
    const res = await generateCaseReport();

    printSection('ESTATÍSTICAS DA BIBLIOTECA', JSON.stringify(res.stats, null, 2));
    printSection('RELATÓRIO COMPLETO', res.analysis);
    saveOutput(`case_report_${Date.now()}.json`, res);

  } else {
    console.log(`\n  ❌ Modo desconhecido: "${mode}"`);
    console.log('  Modos disponíveis: capture | before-after | roi | permission | testimonial | narrative | repurpose | proposal | sales | analytics | library | report\n');
    process.exit(1);
  }

  console.log('\n  ✅ Case Study Intelligence Agent — concluído.\n');
}

main().catch(err => {
  console.error('\n❌ ERRO:', err.message);
  process.exit(1);
});
