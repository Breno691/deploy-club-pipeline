#!/usr/bin/env node
/**
 * daily_master_runner.js — SmartOps IA
 * Runner diário definitivo: executa todos os agentes, salva em pastas organizadas, envia Telegram.
 *
 * ESTRUTURA DE SAÍDA:
 *   outputs/daily_YYYY-MM-DD/
 *     RESUMO_DIARIO.md          ← resumo consolidado legível
 *     DAILY_LOG.json            ← log completo de execução
 *     squad_marketing/          ← uma subpasta por squad
 *       copywriter/
 *         report.md             ← saída capturada do agente
 *       seo/
 *         report.md
 *     squad_growth/
 *       ads/
 *         report.md
 *     ... etc
 *
 * Usage:
 *   node scripts/daily_master_runner.js                  → diário (26 agentes prioritários)
 *   node scripts/daily_master_runner.js --level weekly   → semanais (rodar toda segunda)
 *   node scripts/daily_master_runner.js --level full     → todos os 51 agentes
 *   node scripts/daily_master_runner.js --squad sales    → só um squad
 *   node scripts/daily_master_runner.js --agent ads      → só 1 agente
 *   node scripts/daily_master_runner.js --dry-run        → simula sem chamar agentes (testa estrutura)
 *   node scripts/daily_master_runner.js --no-telegram    → roda agentes mas não envia Telegram
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { DAILY_AGENTS, WEEKLY_AGENTS, ALL_AGENTS, AGENTS, getBySquad } = require('./daily_tasks_config');
const { sendTelegram, sendDailySummary, telegramPost } = require('./send_telegram_direct');

const ROOT       = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'agents');

// CLI flags
const DRY_RUN       = process.argv.includes('--dry-run');
const NO_TELEGRAM   = process.argv.includes('--no-telegram');
const LEVEL         = (() => { const i = process.argv.indexOf('--level');  return i !== -1 ? process.argv[i+1] : 'daily'; })();
const SQUAD_FILTER  = (() => { const i = process.argv.indexOf('--squad');  return i !== -1 ? process.argv[i+1] : null; })();
const AGENT_FILTER  = (() => { const i = process.argv.indexOf('--agent');  return i !== -1 ? process.argv[i+1] : null; })();
const TIMEOUT_MS    = 120000; // 2 min por agente

// ─── Seleção de agentes ───────────────────────────────────────────────────────

function selectAgents() {
  let agents;
  if (AGENT_FILTER) {
    agents = AGENTS.filter(a => a.key === AGENT_FILTER || a.folder.includes(AGENT_FILTER));
  } else if (SQUAD_FILTER) {
    agents = AGENTS.filter(a => a.squad === SQUAD_FILTER);
  } else if (LEVEL === 'full') {
    agents = ALL_AGENTS;
  } else if (LEVEL === 'weekly') {
    agents = WEEKLY_AGENTS;
  } else {
    agents = DAILY_AGENTS;
  }

  // CEO Advisor sempre por último
  return agents.sort((a, b) => (a.runs_last ? 1 : 0) - (b.runs_last ? 1 : 0));
}

// ─── Setup de pastas ─────────────────────────────────────────────────────────

function setupDirs(date) {
  const dailyDir = path.join(ROOT, 'outputs', `daily_${date}`);
  fs.mkdirSync(dailyDir, { recursive: true });
  return dailyDir;
}

function agentOutputDir(dailyDir, agent) {
  const dir = path.join(dailyDir, `squad_${agent.squad}`, agent.key);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ─── Execução de um agente ────────────────────────────────────────────────────

function runAgent(agent) {
  const agentDir  = path.join(AGENTS_DIR, agent.folder);
  const entryFile = path.join(agentDir, agent.entry);

  if (!fs.existsSync(entryFile)) {
    return { status: 'error', error: `Entry point não encontrado: ${agent.entry}` };
  }

  const cmd = `node "${agent.entry}" --mode ${agent.daily_mode}`;

  try {
    const output = execSync(cmd, {
      cwd: agentDir,
      timeout: TIMEOUT_MS,
      encoding: 'utf8',
      env: { ...process.env },
    });
    return { status: 'ok', output: output.trim() };
  } catch (e) {
    const output = (e.stdout || '') + (e.stderr || '');
    // Se saiu com erro mas tem output, é partial
    if (output.trim().length > 50) {
      return { status: 'partial', output: output.trim(), error: e.message.slice(0, 200) };
    }
    return { status: 'error', error: e.message.slice(0, 200), output: output.slice(0, 500) };
  }
}

// ─── Formata relatório para Telegram ─────────────────────────────────────────

function formatTelegramReport(agent, result, tasks) {
  const statusEmoji = result.status === 'ok' ? '✅' : result.status === 'partial' ? '⚠️' : '❌';

  const tasksText = tasks && tasks.length > 0
    ? '\n*Tarefas do dia:*\n' + tasks.map(t => `• ${t}`).join('\n')
    : '';

  if (result.status === 'error') {
    return `${statusEmoji} *${agent.telegram_title}*\n\n❌ Erro: ${result.error || 'Falha na execução'}${tasksText}`;
  }

  // Limita output a 1500 chars para não lotara Telegram
  const outputPreview = result.output
    ? result.output.replace(/\x1B\[[0-9;]*m/g, '') // remove ANSI colors
        .replace(/[╔╗╚╝║═]/g, '') // remove box chars
        .trim()
        .slice(0, 1500)
    : '(sem output)';

  return `${statusEmoji} ${agent.telegram_title}\n\n${outputPreview}`;
}

// ─── Formata resumo do squad ─────────────────────────────────────────────────

function buildSquadSummary(squadName, agentResults) {
  const lines = [`📦 *SQUAD ${squadName.toUpperCase()}*\n`];
  for (const r of agentResults) {
    const icon = r.status === 'ok' ? '✅' : r.status === 'partial' ? '⚠️' : '❌';
    lines.push(`${icon} ${r.agent.telegram_title.replace(/^[^\w\s]*\s/, '')}`);
  }
  return lines.join('\n');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const date     = new Date().toISOString().split('T')[0];
  const timeStr  = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const agents   = selectAgents();
  const dailyDir = setupDirs(date);
  const log      = { date, level: LEVEL, started_at: new Date().toISOString(), agents: [] };

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   DAILY MASTER RUNNER — SmartOps IA                     ║');
  console.log(`║   ${date} ${timeStr.padEnd(38)}║`);
  console.log(`║   Nível: ${LEVEL.toUpperCase().padEnd(48)}║`);
  console.log(`║   Agentes: ${String(agents.length).padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`📁 Pasta de saída: outputs/daily_${date}/\n`);

  if (DRY_RUN) console.log('  🔵 DRY RUN — agentes não serão chamados\n');
  if (NO_TELEGRAM) console.log('  📵 NO TELEGRAM — mensagens não serão enviadas\n');

  // ── Envia mensagem de início no Telegram ──────────────────────────────────
  if (!NO_TELEGRAM && !DRY_RUN) {
    try {
      await telegramPost(
        `🚀 *SMARTOPS IA — INICIANDO ROTINA DIÁRIA*\n📅 ${date} | ${timeStr}\n⏱️ Executando ${agents.length} agentes...\n\n_Aguarde os relatórios de cada squad..._`
      );
    } catch (e) {
      console.log(`  ⚠️  Telegram início: ${e.message}`);
    }
  }

  // ── Executa agentes por squad ─────────────────────────────────────────────
  const allResults    = [];
  const squads        = [...new Set(agents.map(a => a.squad))];
  const squadResults  = {};

  for (const squad of squads) {
    const squadAgents = agents.filter(a => a.squad === squad);
    squadResults[squad] = [];

    console.log(`\n  ── SQUAD ${squad.toUpperCase()} ──────────────────────────────`);

    for (const agent of squadAgents) {
      const outDir  = agentOutputDir(dailyDir, agent);
      const start   = Date.now();

      process.stdout.write(`  ⏳ ${agent.folder.padEnd(40)}`);

      let result;
      if (DRY_RUN) {
        result = { status: 'ok', output: `[DRY RUN] ${agent.folder} --mode ${agent.daily_mode}` };
      } else {
        result = runAgent(agent);
      }

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const icon    = result.status === 'ok' ? '✅' : result.status === 'partial' ? '⚠️ ' : '❌';
      console.log(`${icon} ${elapsed}s`);

      // Salva output na pasta dedicada do agente
      const reportPath  = path.join(outDir, agent.output_file || 'report.md');
      const reportContent = result.output || result.error || '(sem output)';
      fs.writeFileSync(reportPath, reportContent, 'utf-8');

      // Salva tasks do dia
      const tasksPath = path.join(outDir, 'daily_tasks.md');
      const tasksContent = `# Tarefas Diárias — ${agent.folder}\nData: ${date}\n\n${agent.daily_tasks.map((t, i) => `${i+1}. ${t}`).join('\n')}`;
      fs.writeFileSync(tasksPath, tasksContent, 'utf-8');

      // Log
      const entry = {
        key:      agent.key,
        folder:   agent.folder,
        squad:    agent.squad,
        mode:     agent.daily_mode,
        status:   result.status,
        elapsed_s: parseFloat(elapsed),
        output_file: reportPath,
        error:    result.error || null,
      };
      log.agents.push(entry);

      const resultForReport = { ...result, agent, title: agent.telegram_title };
      allResults.push(resultForReport);
      squadResults[squad].push(resultForReport);
    }

    // ── Envia relatório do squad no Telegram ──────────────────────────────
    if (!NO_TELEGRAM && !DRY_RUN && squadResults[squad].length > 0) {
      const squadEmojis = {
        marketing: '📢', growth: '📈', operations: '⚙️',
        sales: '💼', executive: '🎯', finance: '💰',
        client: '🤝', knowledge: '📚', brand: '👤',
        'ai-lab': '🔬', orchestration: '🎛️',
      };
      const emoji = squadEmojis[squad] || '📦';

      // Para squads com muitos agentes, envia 1 msg por agente (detalhado)
      // Para squads menores, envia resumo
      if (squadAgents.length > 4) {
        // Resumo compacto do squad
        const summaryText = buildSquadSummary(squad, squadResults[squad]);
        try {
          await telegramPost(`${emoji} *SQUAD ${squad.toUpperCase()}*\n\n${summaryText}`);
        } catch (e) { console.log(`  ⚠️  Telegram squad ${squad}: ${e.message}`); }
      } else {
        // Relatório detalhado por agente
        for (const r of squadResults[squad]) {
          const msg = formatTelegramReport(r.agent, r, r.agent.daily_tasks);
          try {
            await sendTelegram({ agent: r.agent.folder, message: msg, emoji });
          } catch (e) { console.log(`  ⚠️  Telegram ${r.agent.key}: ${e.message}`); }
          await new Promise(res => setTimeout(res, 600));
        }
      }
      await new Promise(res => setTimeout(res, 800));
    }
  }

  // ── CEO Advisor (relatório especial — envia detalhado sempre) ────────────
  const ceoResult = allResults.find(r => r.agent?.key === 'ceo-advisor');
  if (ceoResult && !NO_TELEGRAM && !DRY_RUN) {
    const ceoMsg = formatTelegramReport(ceoResult.agent, ceoResult, ceoResult.agent.daily_tasks);
    try {
      await sendTelegram({ agent: 'CEO Advisor', message: ceoMsg, emoji: '🧠' });
    } catch (e) { console.log(`  ⚠️  Telegram CEO: ${e.message}`); }
  }

  // ── Estatísticas finais ───────────────────────────────────────────────────
  const ok      = allResults.filter(r => r.status === 'ok').length;
  const partial = allResults.filter(r => r.status === 'partial').length;
  const errors  = allResults.filter(r => r.status === 'error').length;
  const total   = allResults.length;

  // ── Resumo diário consolidado (arquivo) ──────────────────────────────────
  const summaryLines = [
    `# RESUMO DIÁRIO — SmartOps IA`,
    `**Data:** ${date}`,
    `**Hora:** ${timeStr} (BRT)`,
    `**Nível:** ${LEVEL}`,
    `**Total de agentes:** ${total} | ✅ ${ok} | ⚠️ ${partial} | ❌ ${errors}`,
    '',
    `## RESULTADOS POR SQUAD`,
    '',
  ];

  for (const [squad, results] of Object.entries(squadResults)) {
    summaryLines.push(`### ${squad.toUpperCase()}`);
    for (const r of results) {
      const icon = r.status === 'ok' ? '✅' : r.status === 'partial' ? '⚠️' : '❌';
      summaryLines.push(`- ${icon} **${r.agent.folder}** (\`--mode ${r.agent.daily_mode}\`)`);
      if (r.status !== 'ok') summaryLines.push(`  - Erro: ${r.error || 'parcial'}`);
    }
    summaryLines.push('');
  }

  summaryLines.push(`## TAREFAS POR AGENTE`);
  summaryLines.push('');
  for (const agent of agents) {
    summaryLines.push(`### ${agent.folder}`);
    agent.daily_tasks.forEach((t, i) => summaryLines.push(`${i+1}. ${t}`));
    summaryLines.push('');
  }

  const summaryPath = path.join(dailyDir, 'RESUMO_DIARIO.md');
  fs.writeFileSync(summaryPath, summaryLines.join('\n'), 'utf-8');

  // ── Log JSON ──────────────────────────────────────────────────────────────
  log.finished_at    = new Date().toISOString();
  log.stats          = { total, ok, partial, errors };
  const logPath = path.join(dailyDir, 'DAILY_LOG.json');
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');

  // ── Mensagem de encerramento Telegram ────────────────────────────────────
  if (!NO_TELEGRAM && !DRY_RUN) {
    const statusEmoji = errors > 0 ? '⚠️' : '✅';
    const finalMsg = `${statusEmoji} *ROTINA DIÁRIA CONCLUÍDA*\n📅 ${date}\n\n✅ OK: ${ok} | ⚠️ Parcial: ${partial} | ❌ Erro: ${errors}\n\n📁 Relatórios salvos em:\n\`outputs/daily_${date}/\`\n\n_SmartOps IA · ${timeStr} BRT_`;
    try {
      await telegramPost(finalMsg);
    } catch (e) { console.log(`  ⚠️  Telegram final: ${e.message}`); }
  }

  // ── Console final ─────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  ✅ OK:      ${ok}/${total}`);
  if (partial > 0) console.log(`  ⚠️  Parcial: ${partial}/${total}`);
  if (errors  > 0) console.log(`  ❌ Erros:   ${errors}/${total}`);
  console.log(`\n  📁 Relatórios: outputs/daily_${date}/`);
  console.log(`  📄 Resumo:     outputs/daily_${date}/RESUMO_DIARIO.md`);
  console.log(`  📊 Log:        outputs/daily_${date}/DAILY_LOG.json`);
  console.log('══════════════════════════════════════════════════════════════\n');

  process.exit(errors > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('\n❌ Erro fatal no runner:', e.message);
  process.exit(1);
});
