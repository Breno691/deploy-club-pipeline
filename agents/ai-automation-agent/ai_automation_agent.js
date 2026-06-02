#!/usr/bin/env node
/**
 * AI Automation Discovery Agent — SmartOps IA
 * Diretor de Automação Inteligente, n8n e Bots WhatsApp IA
 *
 * Usage:
 *   node ai_automation_agent.js --mode discover
 *   node ai_automation_agent.js --mode discover --area vendas
 *   node ai_automation_agent.js --mode map-process --process "envio manual de proposta toda semana por email"
 *   node ai_automation_agent.js --mode score
 *   node ai_automation_agent.js --mode roi
 *   node ai_automation_agent.js --mode n8n-architect --workflow "lead capture to CRM"
 *   node ai_automation_agent.js --mode n8n-build --workflow "lead-capture-crm"
 *   node ai_automation_agent.js --mode whatsapp-bot --objective "qualificar leads de consultoria"
 *   node ai_automation_agent.js --mode test --workflow "SALES_LEAD_CAPTURE_CRM"
 *   node ai_automation_agent.js --mode monitor
 *   node ai_automation_agent.js --mode document --automation "Follow-up WhatsApp"
 *   node ai_automation_agent.js --mode productize --automation "Bot WhatsApp Leads"
 *   node ai_automation_agent.js --mode report
 *   node ai_automation_agent.js --mode ceo-brief
 *   node ai_automation_agent.js --mode ai-usecase --task "classificar leads por texto livre"
 *   node ai_automation_agent.js --mode integration --from site_forms --to crm
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { discoverAutomationsWithClaude, buildLocalDiscoveryReport } = require('./src/agents/AutomationDiscoveryAgent');
const { mapProcessWithClaude, buildLocalProcessMap }               = require('./src/agents/ProcessMappingAgent');
const { scoreAutomationsWithClaude, scoreLocally }                 = require('./src/agents/AutomationScoringAgent');
const { analyzeROIWithClaude, analyzeROILocally }                  = require('./src/agents/ROIAnalysisAgent');
const { architectWorkflowWithClaude, buildLocalArchitecture }      = require('./src/agents/N8nWorkflowArchitectAgent');
const { buildWorkflowWithClaude }                                   = require('./src/agents/N8nWorkflowBuilderAgent');
const { designBotWithClaude, buildLocalBotFlow }                   = require('./src/agents/WhatsAppBotAgent');
const { generateTestSpecWithClaude, generateTestPlan }             = require('./src/agents/WorkflowTestingAgent');
const { generateMonitoringReportWithClaude, assessWorkflowHealth } = require('./src/agents/WorkflowMonitoringAgent');
const { generateDocumentationWithClaude }                          = require('./src/agents/AutomationDocumentationAgent');
const { productizeAutomationWithClaude }                           = require('./src/agents/AutomationProductizationAgent');
const { generateFullReportWithClaude, generateCEOBriefWithClaude, buildLocalAutomationSnapshot } = require('./src/agents/AutomationReportAgent');
const { evaluateAIUseCaseWithClaude, classifyTaskLocally }       = require('./src/agents/AIUseCaseAgent');
const { designIntegrationWithClaude, buildIntegrationSpec }      = require('./src/agents/IntegrationAgent');
const { discoverCandidatesLocally }                                = require('./src/discovery/discoverAutomationCandidates');
const { createLogger, saveOutput }                                 = require('./src/utils/logger');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function setupOutput(mode) {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `automation_${mode}_${date}`);
  ['logs', 'reports', 'workflows', 'bots'].forEach(d => {
    if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true });
  });
  return { dir, date };
}

async function main() {
  const mode = getArg('mode', 'discover');
  const area = getArg('area', null);

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  AI AUTOMATION DISCOVERY AGENT — SmartOps IA    ║');
  console.log('║  Diretor de Automação Inteligente                ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode}${area ? ` | Área: ${area}` : ''}\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY não configurada no .env');
    process.exit(1);
  }

  const { dir, date } = setupOutput(mode);
  const logger = createLogger(dir);
  logger.log(`mode=${mode} area=${area || 'geral'}`);

  try {
    switch (mode) {

      case 'discover': {
        console.log('🔍 Descobrindo oportunidades de automação...\n');
        const context = getArg('context', '');

        // Relatório local imediato
        const { report, discovery } = buildLocalDiscoveryReport(area);
        console.log(report);
        saveOutput(path.join(dir, 'reports'), 'local_discovery.md', report);
        saveOutput(path.join(dir, 'reports'), 'discovery_data.json', discovery);

        // Enriquecimento com Claude
        console.log('\n🤖 Analisando com IA...\n');
        const aiReport = await discoverAutomationsWithClaude(area, context);
        console.log(aiReport);
        saveOutput(path.join(dir, 'reports'), 'ai_discovery_report.md', aiReport);
        logger.log('discovery complete');
        break;
      }

      case 'map-process': {
        const processDesc = getArg('process', 'processo manual não descrito');
        console.log(`🗺️  Mapeando processo: "${processDesc}"\n`);
        const map = await mapProcessWithClaude(processDesc, area);
        console.log(map);
        saveOutput(path.join(dir, 'reports'), `process_map_${Date.now()}.md`, map);
        break;
      }

      case 'score': {
        console.log('📊 Calculando scores de automação...\n');
        const discovery = discoverCandidatesLocally(area);
        const { ranked, summary } = scoreLocally(discovery.candidates);

        console.log('AUTOMATION SCORE RANKING\n');
        console.log(`Total: ${summary.total} | Automatizar agora: ${summary.automatizar_agora} | PoC: ${summary.poc} | Melhorar antes: ${summary.melhorar_antes}\n`);
        ranked.slice(0, 5).forEach((c, i) => {
          console.log(`${i + 1}. ${c.name}`);
          console.log(`   Score: ${c.automation_score}/100 — ${c.classification.label} (${c.classification.color})`);
          console.log(`   ROI: R$ ${c.roi?.net_monthly_savings?.toLocaleString('pt-BR') || '?'}/mês\n`);
        });

        if (ranked.length > 0) {
          console.log('\n🤖 Analisando com IA...\n');
          const { analysis } = await scoreAutomationsWithClaude(discovery.candidates.slice(0, 5));
          console.log(analysis);
          saveOutput(path.join(dir, 'reports'), 'score_analysis.md', analysis);
        }
        saveOutput(path.join(dir, 'reports'), 'scores.json', ranked);
        break;
      }

      case 'roi': {
        console.log('💰 Calculando ROI das automações...\n');
        const discovery = discoverCandidatesLocally(area);
        const { automations, portfolio } = analyzeROILocally(discovery.candidates);

        console.log('ROI SUMMARY\n');
        console.log(`Portfolio completo:`);
        console.log(`  Horas liberadas/mês: ${portfolio.total_hours_saved_month}h`);
        console.log(`  Economia mensal:     R$ ${portfolio.total_monthly_savings?.toLocaleString('pt-BR')}`);
        console.log(`  Economia anual:      R$ ${portfolio.total_annual_savings?.toLocaleString('pt-BR')}`);
        console.log(`  Payback portfolio:   ${portfolio.portfolio_payback_months} meses\n`);

        automations.slice(0, 3).forEach(a => {
          console.log(`${a.name}`);
          console.log(`  ROI 12m: ${a.roi.roi_12m_pct}% | Payback: ${a.roi.payback_months}m | ${a.roi.roi_label}`);
          console.log(`  Economia: R$ ${a.roi.net_monthly_savings?.toLocaleString('pt-BR')}/mês\n`);
        });

        const { analysis } = await analyzeROIWithClaude(automations.slice(0, 5));
        console.log(analysis);
        saveOutput(path.join(dir, 'reports'), 'roi_analysis.md', analysis);
        saveOutput(path.join(dir, 'reports'), 'roi_data.json', { automations, portfolio });
        break;
      }

      case 'n8n-architect': {
        const workflow = getArg('workflow', 'lead capture formulário para CRM com alerta Telegram');
        const wfName   = getArg('name', '');
        console.log(`🏗️  Arquitetando workflow: "${workflow}"\n`);
        const arch = await architectWorkflowWithClaude(workflow, wfName);
        console.log(arch);
        saveOutput(path.join(dir, 'workflows'), `architecture_${Date.now()}.md`, arch);
        break;
      }

      case 'n8n-build': {
        const workflow = getArg('workflow', 'lead-capture-crm');
        console.log(`🔧 Construindo workflow: "${workflow}"\n`);
        const localArch = buildLocalArchitecture(workflow);
        if (localArch.error) {
          console.log(`Templates disponíveis: ${localArch.available.join(', ')}`);
        } else {
          console.log(JSON.stringify(localArch, null, 2));
        }
        const spec = await buildWorkflowWithClaude(workflow, path.join(dir));
        console.log('\n' + spec);
        saveOutput(path.join(dir, 'workflows'), `workflow_spec_${workflow}.md`, spec);
        break;
      }

      case 'whatsapp-bot': {
        const objective = getArg('objective', 'qualificar leads de consultoria Lean e automação');
        const target    = getArg('target', 'PME em BH');
        console.log(`🤖 Desenhando bot WhatsApp: "${objective}"\n`);

        const localFlow = buildLocalBotFlow('lead-qualification');
        console.log('Flow local de referência carregado: lead-qualification\n');

        const botSpec = await designBotWithClaude(objective, target);
        console.log(botSpec);
        saveOutput(path.join(dir, 'bots'), `bot_spec_${Date.now()}.md`, botSpec);
        break;
      }

      case 'test': {
        const workflow = getArg('workflow', 'SALES_LEAD_CAPTURE_CRM');
        console.log(`🧪 Gerando plano de testes para: "${workflow}"\n`);
        const plan = generateTestPlan(workflow);
        console.log(`Casos de teste padrão: ${plan.total_cases} | Risco alto: ${plan.high_risk}`);
        console.log('\nChecklist de pré-deploy:');
        plan.checklist.forEach(item => console.log(`  ✅ ${item}`));
        const spec = await generateTestSpecWithClaude(workflow);
        console.log('\n' + spec);
        saveOutput(path.join(dir, 'reports'), `test_plan_${workflow}.md`, spec);
        break;
      }

      case 'monitor': {
        console.log('📡 Gerando relatório de monitoramento...\n');
        const discovery = discoverCandidatesLocally(area);
        const mockWorkflows = discovery.candidates.slice(0, 4).map(c => ({
          name:   c.id,
          health: assessWorkflowHealth([
            { status: 'success', duration_s: 3 },
            { status: 'success', duration_s: 4 },
            { status: Math.random() > 0.85 ? 'failed' : 'success', duration_s: 5 },
          ]),
        }));
        const report = await generateMonitoringReportWithClaude(mockWorkflows);
        console.log(report);
        saveOutput(path.join(dir, 'reports'), 'monitoring_report.md', report);
        break;
      }

      case 'document': {
        const automation = getArg('automation', 'Follow-up de leads no WhatsApp');
        console.log(`📝 Documentando automação: "${automation}"\n`);
        const doc = await generateDocumentationWithClaude(automation);
        console.log(doc);
        saveOutput(path.join(dir, 'reports'), `docs_${Date.now()}.md`, doc);
        break;
      }

      case 'productize': {
        const automation = getArg('automation', 'Bot WhatsApp de Qualificação de Leads');
        const sector     = getArg('sector', 'PME');
        console.log(`🚀 Productizando automação: "${automation}" para ${sector}\n`);
        const discovery = discoverCandidatesLocally();
        const target = discovery.candidates.find(c => c.name.toLowerCase().includes(automation.toLowerCase()))
          || { name: automation, impl_hours: 16, reuse_pct: 85, roi: { roi_12m_pct: 300 } };
        const product = await productizeAutomationWithClaude(target, sector);
        console.log(product);
        saveOutput(path.join(dir, 'reports'), `product_brief_${Date.now()}.md`, product);
        break;
      }

      case 'report': {
        console.log('📋 Gerando relatório completo de automação...\n');
        const snapshot = buildLocalAutomationSnapshot(area);
        console.log(`Snapshot: ${snapshot.total} oportunidades | ${snapshot.portfolio.total_hours_saved_month}h/mês a liberar\n`);
        const report = await generateFullReportWithClaude(snapshot, 'weekly');
        console.log(report);
        saveOutput(path.join(dir, 'reports'), `full_report_${date}.md`, report);
        saveOutput(path.join(dir, 'reports'), 'snapshot.json', snapshot);
        break;
      }

      case 'ceo-brief': {
        console.log('👔 Gerando CEO Automation Brief...\n');
        const snapshot = buildLocalAutomationSnapshot(area);
        const brief = await generateCEOBriefWithClaude(snapshot);
        console.log(brief);
        saveOutput(path.join(dir, 'reports'), `ceo_brief_${date}.md`, brief);
        break;
      }

      case 'ai-usecase': {
        const task = getArg('task', 'classificar leads por texto livre de WhatsApp');
        const ctx  = getArg('context', '');
        console.log(`🤖 Avaliando uso de IA: "${task}"\n`);
        const local = classifyTaskLocally(task);
        console.log(`Recomendação local: ${local.recommendation} (confiança: ${local.confidence})`);
        console.log(`Score IA: ${local.ai_score} | Score Regra: ${local.rule_score}`);
        console.log(`Razão: ${local.reason}\n`);
        const { analysis } = await evaluateAIUseCaseWithClaude(task, ctx);
        console.log(analysis);
        saveOutput(path.join(dir, 'reports'), `ai_usecase_${Date.now()}.md`, analysis);
        break;
      }

      case 'integration': {
        const from = getArg('from', 'site_forms');
        const to   = getArg('to',   'crm');
        const desc = getArg('desc', `Integrar ${from} com ${to} automaticamente`);
        console.log(`🔌 Desenhando integração: ${from} → ${to}\n`);
        const spec = buildIntegrationSpec(from, to);
        if (spec.error) {
          console.log(`Erro: ${spec.error}\nDisponíveis: ${spec.available.join(', ')}`);
        } else {
          console.log(`Viável: ${spec.feasible ? 'Sim' : 'Polling'} | Horas: ~${spec.estimated_setup_hours}h`);
          console.log(`Credenciais: ${spec.credentials_needed.join(', ')}\n`);
        }
        const arch = await designIntegrationWithClaude(desc, [from, to]);
        console.log(arch);
        saveOutput(path.join(dir, 'reports'), `integration_${from}_${to}_${Date.now()}.md`, arch);
        break;
      }

      default:
        console.log(`Modo desconhecido: ${mode}`);
        console.log('Modos disponíveis: discover | map-process | score | roi | n8n-architect | n8n-build | whatsapp-bot | test | monitor | document | productize | report | ceo-brief | ai-usecase | integration');
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
