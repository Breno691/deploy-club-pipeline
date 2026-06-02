#!/usr/bin/env node
/**
 * Organizational Learning Intelligence Agent — SmartOps IA
 * Diretor de Aprendizado Organizacional e Melhoria Contínua Interna
 *
 * Ciclo: Executar → Medir → Aprender → Documentar → Atualizar → Treinar → Melhorar
 *
 * Usage:
 *   node organizational_learning.js --mode retro --type monthly
 *   node organizational_learning.js --mode retro --type weekly
 *   node organizational_learning.js --mode retro --type campaign --event "Campanha X"
 *   node organizational_learning.js --mode lesson --area marketing --event "reel sobre retrabalho gerou 3 leads"
 *   node organizational_learning.js --mode pattern
 *   node organizational_learning.js --mode failure --area ads --event "campanha gastou R$300 sem lead"
 *   node organizational_learning.js --mode success --area marketing --event "post viral sobre desperdício"
 *   node organizational_learning.js --mode sop --name "publicar-conteudo"
 *   node organizational_learning.js --mode sop --name "followup-lead" --objective "padronizar follow-up de leads"
 *   node organizational_learning.js --mode playbook --playbook marketing --section "conteudo" --lesson "reels sobre retrabalho convertem 3x mais"
 *   node organizational_learning.js --mode agent-review --agent "partnership-agent"
 *   node organizational_learning.js --mode decision --decision "Priorizar indicação como canal" --context "alto CAC em ads" --why "CAC mais baixo em indicação"
 *   node organizational_learning.js --mode score
 *   node organizational_learning.js --mode report
 *   node organizational_learning.js --mode monthly
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { generateRetrospective, generateWeeklyRetro, generateMonthlyRetro, generateCampaignRetro } = require('./src/agents/RetrospectiveAgent');
const { captureAndAnalyzeLesson, rankAndPrioritizeLessons } = require('./src/agents/LessonsLearnedAgent');
const { detectPatterns, analyzeRecurringProblems }           = require('./src/agents/PatternDetectionAgent');
const { analyzeFailure, analyzeSuccessForReplication }        = require('./src/agents/FailureAnalysisAgent');
const { generatePlaybookUpdate, generateSOP }                 = require('./src/agents/PlaybookSOPAgent');
const { reviewAgentPerformance, logDecision, calculateLearningScore } = require('./src/agents/AgentImprovementAgent');
const { generateWeeklyLearningReport, generateMonthlyOrgReport }      = require('./src/agents/LearningReportAgent');
const { CONFIG } = require('./src/config');

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
  const mode = getArg('mode', 'report');
  const ts   = Date.now();

  console.log('\n=== ORGANIZATIONAL LEARNING INTELLIGENCE AGENT ===');
  console.log(`Diretor de Aprendizado Organizacional e Melhoria Contínua Interna`);
  console.log(`Ciclo: Executar → Aprender → Documentar → Melhorar`);
  console.log(`Modo: ${mode}\n`);

  // ── RETRO — retrospectiva ──────────────────────────────────────────────────
  if (mode === 'retro') {
    const type    = getArg('type',    'monthly');
    const period  = getArg('period',  '');
    const event   = getArg('event',   '');
    const context = getArg('context', '');

    console.log(`  → Gerando retrospectiva [${type}]...`);
    const result = await generateRetrospective({ type, period, context: event || context });
    saveOutput(`retro-${type}-${ts}.json`, result);

    console.log(`\n  Retrospectiva: ${result.retro_type} — ${result.period}`);
    console.log('\n  🏆 3 WINS:');
    (result.wins || []).forEach(w => {
      console.log(`  ${w.number}. ${w.title}`);
      console.log(`     ${w.result}`);
      console.log(`     Como repetir: ${w.how_to_repeat}`);
    });
    console.log('\n  📚 3 LEARNINGS:');
    (result.learnings || []).forEach(l => {
      console.log(`  ${l.number}. ${l.title}`);
      console.log(`     Causa: ${l.root_cause}`);
      console.log(`     Mudança: ${l.recommended_change}`);
    });
    console.log('\n  🔧 3 CHANGES:');
    (result.changes || []).forEach(c => {
      console.log(`  ${c.number}. [${c.priority}] ${c.action}`);
      console.log(`     Prazo: ${c.deadline_days} dias | Playbook: ${c.playbook_affected}`);
    });
    if (result.executive_summary) {
      console.log(`\n  Resumo CEO: ${result.executive_summary}`);
    }
  }

  // ── LESSON — capturar aprendizado ──────────────────────────────────────────
  else if (mode === 'lesson') {
    const area    = getArg('area',    'geral');
    const event   = getArg('event',   'evento não informado');
    const context = getArg('context', '');

    console.log(`  → Capturando aprendizado: [${area}] "${event}"...`);
    const result = await captureAndAnalyzeLesson({ area, event, context });
    saveOutput(`lesson-${area}-${ts}.json`, result);

    console.log(`\n  Área: ${result.area}`);
    console.log(`  Impacto: ${result.impact_score}/100`);
    console.log(`  Prioridade: ${result.priority}`);
    console.log(`  Lição: ${result.lesson}`);
    console.log(`  Ação: ${result.recommended_action}`);
    console.log(`  ROI se agir: ${result.roi_if_acted}`);
    console.log(`  Risco se ignorar: ${result.risk_if_ignored}`);
    if (result.playbook_to_update !== 'nenhum') {
      console.log(`  → Playbook a atualizar: ${result.playbook_to_update}`);
    }
    if (result.sop_to_create !== 'nenhum') {
      console.log(`  → SOP a criar: ${result.sop_to_create}`);
    }
    console.log(`  Prevenção: ${result.repeat_prevention}`);
  }

  // ── PATTERN — detectar padrões ────────────────────────────────────────────
  else if (mode === 'pattern') {
    const area = getArg('area', '');
    console.log('  → Detectando padrões de sucesso e falha...');
    const result = await detectPatterns([], { area: area || 'todos', phase: 'pré-receita' });
    saveOutput(`patterns-${ts}.json`, result);

    console.log(`\n  Qualidade dos dados: ${result.data_quality}`);
    console.log(`  Top padrão: ${result.top_pattern}`);
    if (result.patterns?.length > 0) {
      console.log('\n  Padrões detectados:');
      result.patterns.slice(0, 4).forEach((p, i) => {
        console.log(`  ${i+1}. [${p.impact.toUpperCase()}] ${p.title}`);
        console.log(`     ${p.description}`);
        console.log(`     Ação: ${p.recommended_action} (${p.urgency})`);
      });
    }
    console.log(`\n  Insight: ${result.insight}`);
    console.log(`  Recomendação: ${result.recommendation}`);
  }

  // ── FAILURE — analisar falha ──────────────────────────────────────────────
  else if (mode === 'failure') {
    const area    = getArg('area',    'geral');
    const event   = getArg('event',   'falha não descrita');
    const impact  = getArg('impact',  '');
    const context = getArg('context', '');

    console.log(`  → Analisando falha [${area}]: "${event}"...`);
    const result = await analyzeFailure({ area, event, impact, context });
    saveOutput(`failure-${area}-${ts}.json`, result);

    console.log(`\n  Severidade: ${result.severity}`);
    console.log(`  Causa raiz: ${result.root_cause}`);
    console.log('\n  5 Porquês:');
    (result.five_whys || []).forEach(w => console.log(`  ${w.why}. ${w.answer}`));
    console.log('\n  Plano de prevenção:');
    (result.prevention_plan || []).forEach((p, i) => {
      console.log(`  ${i+1}. [${p.type}] ${p.action} (${p.deadline_days} dias)`);
    });
    if (result.playbook_update?.new_rule) {
      console.log(`\n  Playbook a atualizar: ${result.playbook_update.playbook}`);
      console.log(`  Nova regra: ${result.playbook_update.new_rule}`);
    }
    console.log(`  Custo da falha: ${result.estimated_cost_of_failure}`);
    console.log(`  Custo da prevenção: ${result.estimated_cost_of_prevention}`);
  }

  // ── SUCCESS — replicar sucesso ────────────────────────────────────────────
  else if (mode === 'success') {
    const area    = getArg('area',    'marketing');
    const event   = getArg('event',   'sucesso não descrito');
    const context = getArg('context', '');

    console.log(`  → Analisando sucesso para replicação [${area}]: "${event}"...`);
    const result = await analyzeSuccessForReplication({ area, event, context });
    saveOutput(`success-${area}-${ts}.json`, result);

    console.log(`\n  O que funcionou: ${result.what_worked}`);
    console.log(`  Por que funcionou: ${result.why_it_worked}`);
    console.log(`  Evidência: ${result.evidence}`);
    console.log('\n  Plano de replicação:');
    (result.replication_plan || []).forEach((p, i) => {
      console.log(`  ${i+1}. ${p.action} → ${p.expected_result}`);
    });
    console.log(`  Onde mais aplicar: ${(result.where_else_to_apply || []).join(', ')}`);
    console.log(`  Oportunidade de escala: ${result.scale_opportunity}`);
    if (result.playbook_update?.new_rule) {
      console.log(`\n  Playbook: ${result.playbook_update.playbook}`);
      console.log(`  Nova regra: ${result.playbook_update.new_rule}`);
    }
  }

  // ── SOP — criar SOP ───────────────────────────────────────────────────────
  else if (mode === 'sop') {
    const name      = getArg('name',      'processo-padrao');
    const objective = getArg('objective', '');
    const context   = getArg('context',   '');

    console.log(`  → Criando SOP: "${name}"...`);
    const result = await generateSOP({ name, objective, context });
    saveOutput(`sop-${name}-${ts}.json`, result);

    console.log(`\n  SOP: ${result.sop_name} (${result.version})`);
    console.log(`  Objetivo: ${result.objective}`);
    console.log(`  Quando usar: ${result.when_to_use}`);
    console.log(`  Responsável: ${result.owner}`);
    console.log(`  Frequência: ${result.frequency}`);
    console.log('\n  Passos:');
    (result.steps || []).forEach(s => {
      console.log(`  ${s.step}. ${s.action} [${s.time_estimate}] → ${s.output}`);
    });
    console.log('\n  Checklist:');
    (result.checklist || []).forEach((c, i) => console.log(`  ☐ ${c}`));
    console.log(`\n  Critério de sucesso: ${result.success_metric}`);
  }

  // ── PLAYBOOK — atualizar playbook ─────────────────────────────────────────
  else if (mode === 'playbook') {
    const playbook = getArg('playbook', 'marketing');
    const section  = getArg('section',  'geral');
    const lesson   = getArg('lesson',   'aprendizado não descrito');
    const evidence = getArg('evidence', '');

    console.log(`  → Atualizando playbook [${playbook}/${section}]...`);
    const result = await generatePlaybookUpdate({ playbook, section, lesson, evidence });
    saveOutput(`playbook-update-${playbook}-${ts}.json`, result);

    console.log(`\n  Playbook: ${result.playbook} (${result.version})`);
    console.log(`  Seção: ${result.section}`);
    console.log(`  Tipo: ${result.update_type}`);
    if (result.old_rule) console.log(`  Regra antiga: ${result.old_rule}`);
    console.log(`  Nova regra: ${result.new_rule}`);
    console.log(`  Motivo: ${result.reason}`);
    console.log(`  Impacto: ${result.impact}`);
    console.log(`  Critério de qualidade: ${result.quality_criteria}`);
    if (result.approval_required) {
      console.log('  ⚠️  REQUER APROVAÇÃO antes de aplicar');
    }
  }

  // ── AGENT-REVIEW — revisar performance de agente ──────────────────────────
  else if (mode === 'agent-review') {
    const agentName    = getArg('agent',   'partnership-agent');
    const observations = getArg('obs',     '');
    const period       = getArg('period',  'última semana');

    console.log(`  → Revisando performance: ${agentName}...`);
    const result = await reviewAgentPerformance({
      agentName, period,
      observations: observations ? [observations] : [],
    });
    saveOutput(`agent-review-${agentName}-${ts}.json`, result);

    console.log(`\n  Agente: ${result.agent}`);
    console.log(`  Performance: ${result.performance_score}/100 — ${result.performance_label}`);
    console.log(`  Autonomia: ${result.autonomy_recommendation} (${result.autonomy_reason})`);
    if (result.prompt_updates?.length > 0) {
      console.log('\n  Atualizações de prompt:');
      result.prompt_updates.forEach(p => console.log(`  [${p.priority}] ${p.issue} → ${p.suggested_fix}`));
    }
    if (result.data_gaps?.length > 0) {
      console.log(`  Dados faltantes: ${result.data_gaps.join(', ')}`);
    }
    console.log(`  Próxima capacidade: ${result.next_capability}`);
    console.log(`  Recomendação: ${result.recommendation}`);
  }

  // ── DECISION — registrar decisão ──────────────────────────────────────────
  else if (mode === 'decision') {
    const decision   = getArg('decision', 'decisão não descrita');
    const context    = getArg('context',  '');
    const why        = getArg('why',      '');
    const expected   = getArg('expected', '');
    const metric     = getArg('metric',   '');

    console.log(`  → Registrando decisão: "${decision}"...`);
    const result = await logDecision({ decision, context, why, expectedResult: expected, metric });
    saveOutput(`decision-${ts}.json`, result);

    console.log(`\n  Decisão registrada: ${result.decision_id}`);
    console.log(`  Qualidade: ${result.analysis?.decision_quality}`);
    console.log(`  Indicadores de sucesso:`);
    (result.analysis?.success_indicators || []).forEach((s, i) => console.log(`  ${i+1}. ${s}`));
    console.log(`  Revisão em: ${result.analysis?.review_date_recommendation}`);
    console.log(`  Nota CEO: ${result.analysis?.ceo_note}`);
    console.log(`  Riscos: ${(result.analysis?.risks || []).join(', ')}`);
  }

  // ── SCORE — learning score atual ──────────────────────────────────────────
  else if (mode === 'score') {
    const metrics = {
      learnings_captured:        parseInt(getArg('learnings',    '0'), 10),
      changes_implemented:       parseInt(getArg('changes',      '0'), 10),
      playbooks_updated:         parseInt(getArg('playbooks',    '0'), 10),
      recurring_errors_reduced:  parseInt(getArg('errors-fixed', '0'), 10),
      improvements_with_impact:  parseInt(getArg('improvements', '0'), 10),
      agents_improved:           parseInt(getArg('agents',       '0'), 10),
      decisions_reviewed:        parseInt(getArg('decisions',    '0'), 10),
      sops_created:              parseInt(getArg('sops',         '0'), 10),
      knowledge_reused:          parseInt(getArg('reuse',        '0'), 10),
    };

    const score = calculateLearningScore(metrics);
    saveOutput(`learning-score-${ts}.json`, score);

    console.log(`\n  Learning Score: ${score.score}/100`);
    console.log(`  Nível: ${score.level}`);
    console.log(`  Meta: ${score.target}/100 (gap: ${score.gap} pontos)`);
    console.log('\n  Contribuição por métrica:');
    score.metrics_breakdown.forEach(m => {
      const bar = '█'.repeat(Math.round(parseFloat(m.contribution)));
      console.log(`  ${m.metric.padEnd(30)} ${m.value}/${m.max} → ${m.contribution}pts`);
    });
  }

  // ── REPORT — relatório semanal de aprendizado ─────────────────────────────
  else if (mode === 'report') {
    console.log('  → Gerando relatório semanal de aprendizado organizacional...');
    const result = await generateWeeklyLearningReport({
      learnings:       [],
      retros:          [],
      decisions:       [],
      playbook_updates:[],
      sops_created:    [],
      failures:        [],
      wins:            [],
      agent_reviews:   [],
    });
    saveOutput(`weekly-learning-report-${ts}.json`, result);

    console.log(`\n  ${result.report_title}`);
    console.log(`  Learning Score: ${result.learning_score}/100 — ${result.learning_level}`);
    console.log(`  ${result.executive_summary}`);
    console.log('\n  Top aprendizados:');
    (result.top_learnings || []).forEach((l, i) => console.log(`  ${i+1}. ${l}`));
    console.log('\n  Ações de melhoria:');
    (result.improvement_actions || []).slice(0, 3).forEach((a, i) => {
      console.log(`  ${i+1}. [${a.priority}] ${a.action} (${a.deadline})`);
    });
    console.log(`\n  Brief CEO: ${result.ceo_brief}`);
  }

  // ── MONTHLY — relatório mensal ────────────────────────────────────────────
  else if (mode === 'monthly') {
    console.log('  → Gerando relatório mensal de aprendizado organizacional...');
    const result = await generateMonthlyOrgReport({
      total_learnings:    parseInt(getArg('learnings', '0'), 10),
      total_changes:      parseInt(getArg('changes',   '0'), 10),
      total_playbook_updates: parseInt(getArg('playbooks', '0'), 10),
      total_sops:         parseInt(getArg('sops',      '0'), 10),
      total_decisions:    parseInt(getArg('decisions', '0'), 10),
      recurring_errors_fixed: parseInt(getArg('fixed', '0'), 10),
    });
    saveOutput(`monthly-learning-report-${ts}.json`, result);

    console.log(`\n  ${result.report_title}`);
    console.log(`  Mês: ${result.month}`);
    console.log(`  Learning Score: ${result.learning_score}/100 — ${result.learning_level}`);
    console.log(`  ${result.executive_summary}`);
    console.log('\n  3-3-3 do Mês:');
    console.log('  WINS:');
    (result.monthly_3_3_3?.wins || []).forEach((w, i) => console.log(`    ${i+1}. ${w}`));
    console.log('  LEARNINGS:');
    (result.monthly_3_3_3?.learnings || []).forEach((l, i) => console.log(`    ${i+1}. ${l}`));
    console.log('  CHANGES:');
    (result.monthly_3_3_3?.changes || []).forEach((c, i) => console.log(`    ${i+1}. ${c}`));
    console.log(`\n  Velocidade de aprendizado: ${result.learning_velocity}`);
    console.log(`  Recomendação: ${result.recommendation_to_ceo}`);
  }

  else {
    console.log('Modos disponíveis:');
    console.log('  retro | lesson | pattern | failure | success');
    console.log('  sop | playbook | agent-review | decision');
    console.log('  score | report | monthly');
  }
}

main().catch(err => {
  console.error('\n✗ Org Learning Agent error:', err.message);
  process.exit(1);
});
