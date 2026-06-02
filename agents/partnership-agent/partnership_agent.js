#!/usr/bin/env node
/**
 * Partnership Intelligence Agent — SmartOps IA
 * Diretor de Parcerias Estratégicas e Canais B2B
 *
 * Usage:
 *   node partnership_agent.js --mode research --type accountants
 *   node partnership_agent.js --mode top-list
 *   node partnership_agent.js --mode qualify --name "João Silva" --type accountants --company "Contábil BH"
 *   node partnership_agent.js --mode outreach --name "João Silva" --type accountants --channel whatsapp
 *   node partnership_agent.js --mode commission --name "João Silva" --type accountants
 *   node partnership_agent.js --mode enablement --type accountants
 *   node partnership_agent.js --mode success --name "João Silva" --type accountants --stage activated
 *   node partnership_agent.js --mode referral
 *   node partnership_agent.js --mode report
 *   node partnership_agent.js --mode scorecard
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { researchPartnerType, buildTopPartnerList } = require('./src/agents/PartnerResearchAgent');
const { qualifyPartner }         = require('./src/agents/PartnerQualificationAgent');
const { generatePartnerOutreach, generatePartnerBrief } = require('./src/agents/OutreachAgent');
const { defineCommissionModel, generateCommissionReport } = require('./src/agents/CommissionModelAgent');
const { analyzeReferralPipeline } = require('./src/agents/ReferralTrackingAgent');
const { analyzePartnerHealth, generateEnablementKit } = require('./src/agents/PartnerSuccessAgent');
const { generateWeeklyPartnerReport, generatePartnerScorecard } = require('./src/agents/PartnerReportAgent');

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function saveOutput(filename, content) {
  const dir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ Saved: ${p}`);
  return p;
}

async function main() {
  const mode = getArg('mode', 'top-list');
  const ts   = Date.now();

  console.log('\n=== PARTNERSHIP INTELLIGENCE AGENT ===');
  console.log(`Diretor de Parcerias Estratégicas e Canais B2B`);
  console.log(`Modo: ${mode}\n`);

  // ── TOP-LIST — melhores tipos de parceiros para abordar agora ─────────────
  if (mode === 'top-list') {
    console.log('  → Gerando lista de top parceiros...');
    const result = await buildTopPartnerList();
    saveOutput(`top-partners-${ts}.json`, result);

    console.log(`\n  Foco da semana: ${result.weekly_focus}`);
    console.log(`  Quick win: ${result.quick_win}`);
    console.log('\n  Top Parceiros:');
    (result.top_partners || []).forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.score}] ${p.type} — ${p.priority.toUpperCase()}`);
      console.log(`     ${p.why_now}`);
      console.log(`     Próxima ação: ${p.next_action}`);
    });
  }

  // ── RESEARCH — pesquisar tipo específico de parceiro ──────────────────────
  else if (mode === 'research') {
    const type = getArg('type', 'accountants');
    const city = getArg('city', 'Belo Horizonte');
    console.log(`  → Pesquisando parceiros: ${type} em ${city}...`);
    const result = await researchPartnerType(type, city);
    saveOutput(`research-${type}-${ts}.json`, result);

    console.log(`\n  Por que estratégico: ${result.why_strategic}`);
    console.log(`  Canal de abordagem: ${result.best_outreach_channel}`);
    console.log(`  Top recomendação: ${result.top_recommendation}`);
    console.log(`\n  Prospects encontrados: ${(result.prospects || []).length}`);
    (result.prospects || []).slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.initial_score}] ${p.name}`);
      console.log(`     ${p.why_fit}`);
    });
  }

  // ── QUALIFY — qualificar um parceiro específico ───────────────────────────
  else if (mode === 'qualify') {
    const name    = getArg('name',    'Parceiro não informado');
    const type    = getArg('type',    'accountants');
    const company = getArg('company', '');
    const city    = getArg('city',    'Belo Horizonte');
    const desc    = getArg('desc',    '');

    console.log(`  → Qualificando parceiro: ${name}...`);
    const result = await qualifyPartner({ name, type, company, city, description: desc });
    saveOutput(`qualify-${name.replace(/\s/g, '-')}-${ts}.json`, result);

    console.log(`\n  Score total: ${result.total_score}/100`);
    console.log(`  Classificação: ${result.classification?.label}`);
    console.log(`  Stage: ${result.stage}`);
    console.log(`  Público: ${result.audience}`);
    console.log(`  Proposta: ${result.recommended_offer}`);
    console.log(`  Comissão: Modelo ${result.commission_model}`);
    console.log(`  Canal: ${result.best_outreach_channel}`);
    console.log(`  Próxima ação: ${result.next_action}`);
  }

  // ── OUTREACH — gerar mensagens de abordagem ───────────────────────────────
  else if (mode === 'outreach') {
    const name      = getArg('name',     'Parceiro');
    const type      = getArg('type',     'accountants');
    const company   = getArg('company',  '');
    const audience  = getArg('audience', 'PMEs locais');
    const channel   = getArg('channel',  'whatsapp');

    console.log(`  → Gerando mensagens de outreach para: ${name}...`);
    const result = await generatePartnerOutreach({ name, type, company, audience, channel });
    saveOutput(`outreach-${name.replace(/\s/g, '-')}-${ts}.json`, result);

    console.log(`\n  Estratégia: ${result.outreach_strategy}`);
    console.log(`  Proposta de valor: ${result.value_proposition}`);
    console.log(`  Melhor momento: ${result.best_moment_to_approach}`);
    console.log('\n  --- WhatsApp ---');
    console.log(result.messages?.whatsapp_initial);

    if (getArg('brief') === 'true') {
      const brief = await generatePartnerBrief({ name, type, qualification: { audience } });
      saveOutput(`brief-${name.replace(/\s/g, '-')}-${ts}.json`, brief);
      console.log('\n  Brief gerado!');
    }
  }

  // ── COMMISSION — definir modelo de comissão ───────────────────────────────
  else if (mode === 'commission') {
    const name     = getArg('name',   'Parceiro');
    const type     = getArg('type',   'accountants');
    const volume   = getArg('volume', 'baixo');
    const contract = parseFloat(getArg('contract', '3000'));

    console.log(`  → Definindo comissão para: ${name} (${type})...`);
    const result = await defineCommissionModel({ name, type, volume_estimate: volume, contract_avg: contract });
    saveOutput(`commission-${type}-${ts}.json`, result);

    console.log(`\n  Modelo recomendado: ${result.recommended_model} — ${result.model_label}`);
    console.log(`  Percentual: ${result.percentage}%`);
    console.log(`  Justificativa: ${result.justification}`);
    console.log(`  Regra de pagamento: ${result.payment_rule}`);
    console.log(`  Comissão no 1º cliente: R$ ${result.estimated_commission_first_client}`);
    console.log(`  Upgrade quando: ${result.upgrade_condition}`);
  }

  // ── ENABLEMENT — gerar kit de ativação para parceiro ─────────────────────
  else if (mode === 'enablement') {
    const type = getArg('type', 'accountants');
    console.log(`  → Gerando enablement kit para: ${type}...`);
    const result = await generateEnablementKit(type);
    saveOutput(`enablement-${type}-${ts}.json`, result);

    console.log(`\n  Kit gerado: ${result.kit_title}`);
    console.log(`  Sinais identificados: ${(result.referral_signals || []).length}`);
    console.log(`  FAQ: ${(result.faq || []).length} perguntas`);
    console.log('\n  Mensagem pronta do parceiro:');
    console.log(`  "${result.ready_message}"`);
  }

  // ── SUCCESS — avaliar saúde de um parceiro ────────────────────────────────
  else if (mode === 'success') {
    const name       = getArg('name',       'Parceiro');
    const type       = getArg('type',       'accountants');
    const stage      = getArg('stage',      'activated');
    const lastDays   = parseInt(getArg('last-contact', '0'));
    const referrals  = parseInt(getArg('referrals',    '0'));
    const revenue    = parseFloat(getArg('revenue',    '0'));

    console.log(`  → Avaliando saúde do parceiro: ${name}...`);
    const result = await analyzePartnerHealth({
      name, type, stage,
      last_contact_days: lastDays,
      referrals_total:   referrals,
      revenue_generated: revenue,
    });
    saveOutput(`success-${name.replace(/\s/g, '-')}-${ts}.json`, result);

    console.log(`\n  Health Score: ${result.health_score}/100`);
    console.log(`  Status: ${result.status} — ${result.health_label}`);
    console.log(`  Riscos: ${(result.risks || []).join(', ')}`);
    console.log(`  Co-marketing: ${result.co_marketing_opportunity}`);
    console.log('\n  Ações recomendadas:');
    (result.recommended_actions || []).forEach((a, i) => {
      console.log(`  ${i + 1}. [${a.urgency}] ${a.action}`);
    });
    console.log('\n  Mensagem de relacionamento:');
    console.log(`  "${result.message_to_send}"`);
  }

  // ── REFERRAL — analisar pipeline de indicações ────────────────────────────
  else if (mode === 'referral') {
    console.log('  → Analisando pipeline de indicações...');
    const result = await analyzeReferralPipeline([]);
    saveOutput(`referral-pipeline-${ts}.json`, result);

    console.log(`\n  Total de indicações: ${result.total_referrals || 0}`);
    console.log(`  Insight: ${result.insight || result.weekly_summary}`);
    console.log(`  Próxima ação: ${result.next_action || (result.next_actions || [])[0]}`);
  }

  // ── REPORT — relatório semanal de parcerias ───────────────────────────────
  else if (mode === 'report') {
    console.log('  → Gerando relatório semanal de parcerias...');
    const result = await generateWeeklyPartnerReport({
      active_partners: parseInt(getArg('partners', '0')),
      referrals_received: parseInt(getArg('referrals', '0')),
      contracts_closed: parseInt(getArg('closed', '0')),
      revenue_from_partners: parseFloat(getArg('revenue', '0')),
    });
    saveOutput(`weekly-report-${ts}.json`, result);

    console.log(`\n  ${result.report_title}`);
    console.log(`  ${result.executive_summary}`);
    console.log(`  Health: ${result.pipeline_health}`);
    console.log(`  Insight: ${result.weekly_insight}`);
    console.log('\n  Prioridades semana seguinte:');
    (result.next_week_priorities || []).forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  }

  // ── SCORECARD — scorecard de todos os parceiros ───────────────────────────
  else if (mode === 'scorecard') {
    console.log('  → Gerando scorecard de parceiros...');
    const result = await generatePartnerScorecard([]);
    saveOutput(`scorecard-${ts}.json`, result);

    console.log(`\n  Total parceiros: ${result.total_partners}`);
    console.log(`  Health do programa: ${result.program_health}`);
    console.log(`  ${result.summary}`);
  }

  else {
    console.log('Modos: top-list | research | qualify | outreach | commission | enablement | success | referral | report | scorecard');
  }
}

main().catch(err => {
  console.error('\n✗ Partnership Agent error:', err.message);
  process.exit(1);
});
