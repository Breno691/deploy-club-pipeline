#!/usr/bin/env node
/**
 * seed_reports_today.js — SmartOps IA
 * Lê os relatórios já gerados em outputs/daily_YYYY-MM-DD/ e salva no Supabase.
 * Usar para popular o painel com dados existentes.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const { saveReport } = require('./reports_db');
const { AGENTS }     = require('./daily_tasks_config');

const ROOT = path.resolve(__dirname, '..');
const date = process.argv[2] || new Date().toISOString().split('T')[0];
const dailyDir = path.join(ROOT, 'outputs', `daily_${date}`);

function cleanOutput(raw) {
  if (!raw) return '';
  return raw
    .replace(/\x1B\[[0-9;]*[mGKHF]/g, '')
    .replace(/[╔╗╚╝║╠╣╦╩╬═╪╫]/g, '')
    .replace(/[┌┐└┘├┤┬┴┼─│]/g, '')
    .replace(/^.*─{5,}.*$/gm, '---')
    .replace(/^\s*[✓✗]\s+Salvo:.*$/gm, '')
    .replace(/^\s*[✓✗]\s+Saved:.*$/gm, '')
    .replace(/^\s*[✓✗]\s+.*\.(json|md|txt).*$/gm, '')
    .replace(/^(Modo:|Hora:|Agente:|Squad:|CFO Virtual).*$/gm, '')
    .replace(/^=== .* ===$\n?/gm, '')
    .replace(/^\s*→.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function main() {
  console.log(`\n📦 Seeding relatórios do dia ${date} no Supabase...\n`);

  if (!fs.existsSync(dailyDir)) {
    console.error(`❌ Pasta não encontrada: ${dailyDir}`);
    console.log('   Execute primeiro: npm run daily --no-telegram');
    process.exit(1);
  }

  let saved = 0, skipped = 0;

  for (const agent of AGENTS) {
    const squadDir  = path.join(dailyDir, `squad_${agent.squad}`, agent.key);
    const reportFile = path.join(squadDir, agent.output_file || 'report.md');
    const tasksFile  = path.join(squadDir, 'daily_tasks.md');

    if (!fs.existsSync(reportFile)) {
      console.log(`  ⏭  ${agent.key.padEnd(35)} sem arquivo`);
      skipped++;
      continue;
    }

    const content      = fs.readFileSync(reportFile, 'utf-8');
    const contentClean = cleanOutput(content);
    const hasContent   = content.trim().length > 20;
    const status       = hasContent ? 'ok' : 'partial';

    process.stdout.write(`  ⬆  ${agent.key.padEnd(35)}`);

    const id = await saveReport({
      date,
      agentKey:     agent.key,
      agentName:    agent.folder,
      squad:        agent.squad,
      mode:         agent.daily_mode,
      status,
      content,
      contentClean,
      elapsedSeconds: 0,
      telegramSent: false,
      dailyTasks:   agent.daily_tasks,
    });

    if (id) {
      console.log(`✅ ${id.slice(0, 8)}...`);
      saved++;
    } else {
      console.log('❌ falhou');
      skipped++;
    }

    await new Promise(r => setTimeout(r, 100)); // rate limit
  }

  console.log(`\n═══ Concluído: ${saved} salvos | ${skipped} pulados`);
  console.log(`\nAcesse o painel:`);
  console.log(`  https://n8n-pipeline-server.sumjyb.easypanel.host/reports\n`);
}

main().catch(e => { console.error('Erro:', e.message); process.exit(1); });
