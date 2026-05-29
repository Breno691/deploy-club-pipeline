require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || 'sales_intel';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const salesDir  = path.join(outputDir, 'sales');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'sales_intelligence.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

const SCORE_RULES = [
  { label: 'Dono/CEO (decide sozinho)',              key: 'is_decision_maker', pts: 15 },
  { label: '10–50 funcionários',                     key: 'mid_size',          pts: 10 },
  { label: 'Urgência clara (perda de dinheiro)',     key: 'urgent',            pts: 12 },
  { label: 'Veio por indicação',                     key: 'referral',          pts: 15 },
  { label: 'Já tentou resolver e falhou',            key: 'tried_before',      pts: 8  },
  { label: 'Setor prioritário (saúde/serviços/ind)', key: 'priority_sector',   pts: 8  },
  { label: 'Respondeu perguntas com detalhes',       key: 'engaged',           pts: 10 },
  { label: 'LinkedIn/Instagram ativo',               key: 'social_active',     pts: 5  },
];

function calcScore(lead) {
  let score = 0;
  if (lead.is_decision_maker) score += 15;
  if (lead.employees >= 10 && lead.employees <= 50) score += 10;
  if (lead.urgent) score += 12;
  if (lead.origem === 'indicacao') score += 15;
  if (lead.tried_before) score += 8;
  const prioritySectors = ['saude', 'servicos', 'industria', 'clinica', 'restaurante'];
  if (prioritySectors.some(s => (lead.setor || '').toLowerCase().includes(s))) score += 8;
  if (lead.engaged) score += 10;
  if (lead.social_active) score += 5;
  return Math.min(score, 100);
}

async function runSalesIntelligence() {
  console.log(`\nSales Intelligence Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [salesDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('sales_intelligence started');

  const leads = readJsonSafe('data/leads.json') || [];
  const playbook  = readFileSafe('knowledge/sales_playbook.md');
  const personas  = readFileSafe('knowledge/customer_personas.md');

  console.log(`  → ${leads.length} leads carregados de data/leads.json`);

  const client = new Anthropic();

  // Score + classify cada lead
  const scoredLeads = leads.map(lead => ({
    ...lead,
    score_calculado: calcScore(lead),
    prioridade: calcScore(lead) >= 60 ? 'alta' : calcScore(lead) >= 35 ? 'media' : 'baixa',
  })).sort((a, b) => b.score_calculado - a.score_calculado);

  appendLog(`Leads scored: ${scoredLeads.length}`);
  console.log(`  → Leads scored e ordenados por prioridade`);

  // AI: gera análise do pipeline e ações
  appendLog('Generating pipeline analysis...');
  console.log('  → Gerando análise de pipeline e scripts de abordagem...');

  const analysisResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Você é o Sales Intelligence Agent da SmartOps IA. Breno Luiz é Black Belt Lean Six Sigma, consultoria para PMEs em BH.

## LEADS ATUAIS (${scoredLeads.length} leads, ordenados por score)

${scoredLeads.length > 0
  ? JSON.stringify(scoredLeads.slice(0, 10), null, 2)
  : 'Nenhum lead cadastrado ainda. Situação: consultoria nova, construindo pipeline.'}

## PLAYBOOK DE VENDAS (framework GPCTBA)

${playbook.slice(0, 2000)}

## PERSONAS

${personas.slice(0, 1500)}

## TASK

Gere o relatório completo de Sales Intelligence para hoje (${taskDate}):

# Sales Intelligence Report — ${taskDate}

## Situação do Pipeline
[Análise honesta do pipeline atual: quantos leads, distribuição por etapa, valor estimado]

## Top Leads para Abordar HOJE
[Liste os 3 leads com maior score e a ação específica para cada um]
[Se não há leads: sugira como gerar os primeiros 5 leads nos próximos 3 dias]

## Scripts de Abordagem por Segmento

### Para dono de clínica/saúde:
[Script WhatsApp completo, primeira mensagem, follow-up]

### Para dono de restaurante:
[Script WhatsApp completo]

### Para empresa de serviços B2B:
[Script WhatsApp completo]

## Objeções Mais Comuns e Como Quebrar
[Top 3 objeções + resposta exata para cada uma]

## Meta da Semana
[1 meta específica e atingível para o pipeline de vendas desta semana]

## Próxima Ação Imediata
[1 ação concreta para fazer nos próximos 60 minutos]`,
    }],
  });

  const reportMD = analysisResp.content[0].text.trim();
  appendLog('Pipeline analysis generated');

  // Save outputs
  fs.writeFileSync(path.join(salesDir, 'pipeline_report.md'), reportMD);
  fs.writeFileSync(path.join(salesDir, 'lead_actions.json'), JSON.stringify({
    date: taskDate,
    total_leads: scoredLeads.length,
    high_priority: scoredLeads.filter(l => l.prioridade === 'alta').length,
    med_priority:  scoredLeads.filter(l => l.prioridade === 'media').length,
    low_priority:  scoredLeads.filter(l => l.prioridade === 'baixa').length,
    leads: scoredLeads,
  }, null, 2));

  appendLog('All outputs saved ✓');

  console.log(`\n  ✓ Relatório: ${path.join(salesDir, 'pipeline_report.md')}`);
  console.log(`  ✓ Leads JSON: lead_actions.json`);
  console.log(`\n  Pipeline: ${scoredLeads.length} leads`);
  console.log(`    Alta prioridade:  ${scoredLeads.filter(l => l.prioridade === 'alta').length}`);
  console.log(`    Média prioridade: ${scoredLeads.filter(l => l.prioridade === 'media').length}`);

  if (scoredLeads.length > 0) {
    console.log(`\n  Top lead: ${scoredLeads[0].nome || 'sem nome'} — score ${scoredLeads[0].score_calculado}/100`);
  }

  appendLog('sales_intelligence complete ✓');
}

runSalesIntelligence().catch(err => {
  console.error('Sales Intelligence error:', err.message);
  process.exit(1);
});
