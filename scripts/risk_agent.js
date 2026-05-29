require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || 'risk_monitor';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const riskDir   = path.join(outputDir, 'risks');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'risk_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runRiskAgent() {
  console.log(`\nRisk Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [riskDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('risk_agent started');

  // Collect all available data
  const leads     = readJsonSafe('data/leads.json') || [];
  const clients   = readJsonSafe('data/clients.json') || [];
  const finances  = (() => {
    const base = 'outputs';
    if (!fs.existsSync(base)) return null;
    const dirs = fs.readdirSync(base).filter(d => d.startsWith('finance')).sort().reverse();
    return dirs[0] ? readJsonSafe(path.join(base, dirs[0], 'finance', 'metrics_snapshot.json')) : null;
  })();
  const ceoReport = (() => {
    const base = 'outputs';
    if (!fs.existsSync(base)) return '';
    const dirs = fs.readdirSync(base).filter(d => d.startsWith('ceo')).sort().reverse();
    return dirs[0] ? readFileSafe(path.join(base, dirs[0], 'ceo', 'executive_action_plan.md')) : '';
  })();

  console.log('  → Analisando riscos do negócio...');
  appendLog('Analyzing risks...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Você é o Risk Agent da SmartOps IA. Monitora riscos e emite alertas preventivos.

## SITUAÇÃO ATUAL (${taskDate})

**Leads:** ${leads.length} leads em data/leads.json
**Clientes ativos:** ${clients.length}
**Dados Financeiros:**
${finances ? `Receita: R$ ${finances.receita_total || 0} | Margem: ${finances.margem_bruta || 0}% | Saúde: ${finances.saude || 'desconhecida'}` : 'Sem dados financeiros'}
**CEO Report recente:**
${ceoReport.slice(0, 600) || 'Sem CEO report recente'}

## TASK

Gere relatório de riscos em Markdown:

# Risk Monitor — SmartOps IA — ${taskDate}

## 🔴 Alertas Críticos (ação imediata necessária)
[Riscos que se não tratados hoje causam dano irreversível]

## ⚠️ Alertas de Atenção (ação esta semana)
[Riscos em desenvolvimento que precisam de monitoramento ativo]

## 🔵 Riscos Monitorados (ação este mês)
[Riscos identificados mas controlados — manter vigilância]

## Mapa de Riscos

| Risco | Categoria | Probabilidade | Impacto | Nível | Ação Preventiva |
|---|---|---|---|---|---|
| Pipeline vazio | Vendas | ${leads.length === 0 ? 'Muito Alta' : 'Média'} | Crítico | ${leads.length === 0 ? '🔴' : '⚠️'} | Abordar 5 leads/dia |
| Sem clientes pagantes | Financeiro | ${clients.length === 0 ? 'Confirmado' : 'Baixa'} | Crítico | ${clients.length === 0 ? '🔴' : '🔵'} | Proposta esta semana |
| Dependência de 1 pessoa | Operação | Alta | Alto | ⚠️ | Documentar SOPs |
| Concorrente entra no nicho | Mercado | Média | Médio | ⚠️ | Construir autoridade |
| API key expira/limite | Técnico | Baixa | Alto | 🔵 | Monitorar uso mensal |
| [outros riscos identificados] | | | | | |

## Painel de Indicadores de Risco

| Indicador | Valor Atual | Threshold de Alerta | Status |
|---|---|---|---|
| Dias sem cliente pagante | ${clients.length === 0 ? '30+' : '0'} | > 30 dias | ${clients.length === 0 ? '🔴 CRÍTICO' : '✅ OK'} |
| Leads no pipeline | ${leads.length} | < 5 | ${leads.length < 5 ? '🔴 BAIXO' : '✅ OK'} |
| Margem bruta | ${finances?.margem_bruta || 0}% | < 60% | ${(finances?.margem_bruta || 0) < 60 ? '⚠️ ATENÇÃO' : '✅ OK'} |
| Cobertura de caixa | ${finances?.meses_cobertura || '?'} meses | < 3 | ${(finances?.meses_cobertura || 0) < 3 ? '🔴 CRÍTICO' : '✅ OK'} |

## Plano de Ação Preventivo — Próximos 7 Dias

| Dia | Ação | Risco Mitigado | Responsável |
|---|---|---|---|
| Hoje | [ação urgente] | [qual risco] | Breno |
| Amanhã | [ação] | | Breno |
| Sem 1 | [ação] | | Breno |

## Monitoramento Contínuo
[Quais métricas verificar diariamente e quais sinais indicam que um risco virou problema]`,
    }],
  });

  const riskMD = resp.content[0].text.trim();
  appendLog('Risk analysis generated');

  // Risks JSON
  const risky = [];
  if (leads.length === 0) risky.push({ risco: 'Pipeline vazio', nivel: 'critico', acao: 'Abordar 5 PMEs via WhatsApp hoje' });
  if (clients.length === 0) risky.push({ risco: 'Sem clientes pagantes', nivel: 'critico', acao: 'Enviar proposta esta semana' });
  if ((finances?.margem_bruta || 0) < 60 && finances?.receita_total > 0) risky.push({ risco: 'Margem abaixo de 60%', nivel: 'atencao', acao: 'Revisar precificação' });

  fs.writeFileSync(path.join(riskDir, 'risk_report.md'), riskMD);
  fs.writeFileSync(path.join(riskDir, 'risks.json'), JSON.stringify({ date: taskDate, total_risks: risky.length, critical: risky.filter(r => r.nivel === 'critico').length, risks: risky }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Risk Report: ${path.join(riskDir, 'risk_report.md')}`);
  console.log(`  ⚠ Riscos críticos: ${risky.filter(r => r.nivel === 'critico').length}`);
  risky.forEach(r => console.log(`    ${r.nivel === 'critico' ? '🔴' : '⚠️'} ${r.risco} → ${r.acao}`));

  appendLog('risk_agent complete ✓');
}

runRiskAgent().catch(err => {
  console.error('Risk Agent error:', err.message);
  process.exit(1);
});
