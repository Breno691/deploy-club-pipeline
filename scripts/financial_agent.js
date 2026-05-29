require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || process.env.TASK_NAME || 'finance_report';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const dataFile = get('--data'); // optional: path to JSON with financial data

const outputDir  = path.join('outputs', `${taskName}_${taskDate}`);
const financeDir = path.join(outputDir, 'finance');

function appendLog(msg) {
  fs.appendFileSync(
    path.join(outputDir, 'logs', 'financial_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`
  );
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

// ── Default financial structure ───────────────────────────────────────────
const DEFAULT_STRUCTURE = {
  receita: {
    projetos_ativos: 0,          // R$ de projetos em execução este mês
    novos_fechamentos: 0,         // R$ de contratos novos assinados este mês
    parceria_mensal: 0,           // R$ de clientes em parceria recorrente
    outros: 0,
  },
  custos: {
    ferramentas_ia: 0,            // Anthropic, Tavily, n8n, EasyPanel, etc.
    plataformas: 0,               // Supabase, Upstash Redis, etc.
    marketing_ads: 0,             // Google Ads, Meta Ads (se houver)
    outros_fixos: 0,              // celular, internet, contador, etc.
  },
  pipeline: {
    leads_ativos: 0,              // número de leads em negociação
    valor_total_pipeline: 0,      // R$ total de propostas em aberto
    probabilidade_media: 0.3,     // % de chance de fechar (padrão 30%)
    reunioes_agendadas: 0,        // reuniões marcadas nos próximos 30 dias
  },
  clientes: {
    total_ativos: 0,              // clientes com projeto em andamento
    novos_mes: 0,                 // clientes fechados este mês
    perdidos_mes: 0,              // clientes que saíram
    ticket_medio: 12000,          // ticket médio por projeto
    duracao_media_meses: 3,       // duração média de um projeto
  },
  historico: {
    receita_mes_anterior: 0,
    receita_ha_3_meses: 0,
    melhor_mes: 0,
  },
};

function calcMetrics(data) {
  const r = data.receita;
  const c = data.custos;
  const p = data.pipeline;
  const cl = data.clientes;

  const receita_total = r.projetos_ativos + r.novos_fechamentos + r.parceria_mensal + r.outros;
  const custo_total   = c.ferramentas_ia + c.plataformas + c.marketing_ads + c.outros_fixos;
  const custo_entrega = receita_total * 0.25; // estimativa: 25% do faturamento em horas/esforço
  const lucro_bruto   = receita_total - custo_entrega;
  const lucro_liquido = receita_total - custo_total - custo_entrega;
  const margem_bruta  = receita_total > 0 ? (lucro_bruto / receita_total) * 100 : 0;
  const margem_liquida= receita_total > 0 ? (lucro_liquido / receita_total) * 100 : 0;

  const cac = (c.marketing_ads + custo_total * 0.2) / Math.max(cl.novos_mes || 1, 1);
  const ltv = cl.ticket_medio * cl.duracao_media_meses;
  const ltv_cac_ratio = cac > 0 ? ltv / cac : 0;

  const pipeline_esperado = p.valor_total_pipeline * p.probabilidade_media;

  const forecast_30  = receita_total + pipeline_esperado * 0.4;
  const forecast_60  = receita_total + pipeline_esperado * 0.7;
  const forecast_90  = receita_total + pipeline_esperado;

  const meses_cobertura = custo_total > 0 ? lucro_liquido / custo_total : 0;

  return {
    receita_total,
    custo_total,
    custo_entrega,
    lucro_bruto,
    lucro_liquido,
    margem_bruta: Math.round(margem_bruta * 10) / 10,
    margem_liquida: Math.round(margem_liquida * 10) / 10,
    cac: Math.round(cac),
    ltv: Math.round(ltv),
    ltv_cac_ratio: Math.round(ltv_cac_ratio * 10) / 10,
    pipeline_esperado: Math.round(pipeline_esperado),
    forecast: {
      d30: Math.round(forecast_30),
      d60: Math.round(forecast_60),
      d90: Math.round(forecast_90),
    },
    meses_cobertura: Math.round(meses_cobertura * 10) / 10,
    saude: deriveHealth(margem_bruta, margem_liquida, ltv_cac_ratio, meses_cobertura),
  };
}

function deriveHealth(margem_bruta, margem_liquida, ltv_cac, meses_cobertura) {
  const alerts = [];
  if (margem_bruta < 60)    alerts.push('Margem bruta abaixo de 60% — revisar precificação');
  if (margem_liquida < 35)  alerts.push('Margem líquida abaixo de 35% — cortar custos ou aumentar preço');
  if (ltv_cac < 3)          alerts.push('LTV:CAC abaixo de 3x — marketing não está pagando');
  if (meses_cobertura < 3)  alerts.push('Cobertura de caixa menor que 3 meses — atenção ao fluxo');
  return alerts.length === 0 ? 'saudavel' : alerts.length <= 2 ? 'atencao' : 'critico';
}

function formatBRL(n) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function buildMarkdownReport(data, metrics, aiInsights) {
  const s = metrics.saude === 'saudavel' ? '✅' : metrics.saude === 'atencao' ? '⚠️' : '🔴';
  return `# Relatório Financeiro — SmartOps IA — ${data._date}

${s} **Saúde Financeira: ${metrics.saude.toUpperCase()}**

---

## Receita do Mês

| Fonte | Valor |
|---|---|
| Projetos em execução | ${formatBRL(data.receita.projetos_ativos)} |
| Novos contratos | ${formatBRL(data.receita.novos_fechamentos)} |
| Parceria recorrente | ${formatBRL(data.receita.parceria_mensal)} |
| Outros | ${formatBRL(data.receita.outros)} |
| **TOTAL** | **${formatBRL(metrics.receita_total)}** |

## Custos do Mês

| Categoria | Valor |
|---|---|
| Ferramentas IA | ${formatBRL(data.custos.ferramentas_ia)} |
| Plataformas | ${formatBRL(data.custos.plataformas)} |
| Marketing / Ads | ${formatBRL(data.custos.marketing_ads)} |
| Outros fixos | ${formatBRL(data.custos.outros_fixos)} |
| **TOTAL** | **${formatBRL(metrics.custo_total)}** |

## Métricas Chave

| Métrica | Valor | Meta |
|---|---|---|
| Receita Total | ${formatBRL(metrics.receita_total)} | — |
| Lucro Bruto | ${formatBRL(metrics.lucro_bruto)} | — |
| Lucro Líquido | ${formatBRL(metrics.lucro_liquido)} | — |
| Margem Bruta | ${metrics.margem_bruta}% | > 60% |
| Margem Líquida | ${metrics.margem_liquida}% | > 35% |
| CAC | ${formatBRL(metrics.cac)} | — |
| LTV | ${formatBRL(metrics.ltv)} | — |
| LTV:CAC | ${metrics.ltv_cac_ratio}x | > 3x |
| Cobertura de Caixa | ${metrics.meses_cobertura} meses | ≥ 3 meses |

## Pipeline Ativo

| Métrica | Valor |
|---|---|
| Leads em negociação | ${data.pipeline.leads_ativos} |
| Valor total do pipeline | ${formatBRL(data.pipeline.valor_total_pipeline)} |
| Probabilidade média | ${(data.pipeline.probabilidade_media * 100).toFixed(0)}% |
| Receita esperada do pipeline | ${formatBRL(metrics.pipeline_esperado)} |
| Reuniões agendadas (30 dias) | ${data.pipeline.reunioes_agendadas} |

## Previsão de Caixa

| Horizonte | Receita Projetada |
|---|---|
| 30 dias | ${formatBRL(metrics.forecast.d30)} |
| 60 dias | ${formatBRL(metrics.forecast.d60)} |
| 90 dias | ${formatBRL(metrics.forecast.d90)} |

## Análise e Recomendações

${aiInsights}

---

*Relatório gerado por Financial Intelligence Agent — SmartOps IA*
`;
}

async function runFinancialAgent() {
  console.log(`\nFinancial Intelligence Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [financeDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('financial_agent started');

  // Load financial data
  let rawData = dataFile ? readJsonSafe(dataFile) : null;

  // Try to load from standard locations
  if (!rawData) {
    rawData = readJsonSafe(path.join(outputDir, 'finance', 'financial_data.json'));
  }
  if (!rawData) {
    rawData = readJsonSafe('data/financial_data.json');
  }

  // Merge with defaults
  const data = {
    ...DEFAULT_STRUCTURE,
    ...(rawData || {}),
    receita:  { ...DEFAULT_STRUCTURE.receita,  ...(rawData?.receita  || {}) },
    custos:   { ...DEFAULT_STRUCTURE.custos,   ...(rawData?.custos   || {}) },
    pipeline: { ...DEFAULT_STRUCTURE.pipeline, ...(rawData?.pipeline || {}) },
    clientes: { ...DEFAULT_STRUCTURE.clientes, ...(rawData?.clientes || {}) },
    historico:{ ...DEFAULT_STRUCTURE.historico,...(rawData?.historico|| {}) },
    _date: taskDate,
  };

  if (!rawData) {
    console.log('  ⚠ Sem dados financeiros reais — usando valores zerados. Use --data para passar dados.');
    console.log('    Exemplo: node scripts/financial_agent.js --data data/financial_data.json');
  }

  appendLog(`Data loaded: ${rawData ? (dataFile || 'auto-detected') : 'defaults (zero)'}`);

  // Calculate metrics
  const metrics = calcMetrics(data);
  console.log(`  → Métricas calculadas:`);
  console.log(`     Receita: ${formatBRL(metrics.receita_total)} | Margem bruta: ${metrics.margem_bruta}% | LTV:CAC: ${metrics.ltv_cac_ratio}x`);
  console.log(`     Saúde: ${metrics.saude} | Forecast 30d: ${formatBRL(metrics.forecast.d30)}`);

  appendLog(`Metrics: receita=${metrics.receita_total}, margem_bruta=${metrics.margem_bruta}%, saude=${metrics.saude}`);

  // ── AI analysis ─────────────────────────────────────────────────────────
  const client = new Anthropic();
  appendLog('Generating AI analysis...');
  console.log('  → Gerando análise e recomendações com IA...');

  const aiResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `Você é o Financial Intelligence Agent da SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH.

## DADOS FINANCEIROS — ${taskDate}

Receita total: ${formatBRL(metrics.receita_total)}
Lucro bruto: ${formatBRL(metrics.lucro_bruto)} (${metrics.margem_bruta}% margem)
Lucro líquido: ${formatBRL(metrics.lucro_liquido)} (${metrics.margem_liquida}% margem)
CAC: ${formatBRL(metrics.cac)} | LTV: ${formatBRL(metrics.ltv)} | LTV:CAC: ${metrics.ltv_cac_ratio}x
Pipeline: ${formatBRL(data.pipeline.valor_total_pipeline)} (${data.pipeline.leads_ativos} leads)
Previsão 30d: ${formatBRL(metrics.forecast.d30)} | 60d: ${formatBRL(metrics.forecast.d60)}
Saúde geral: ${metrics.saude}

Clientes ativos: ${data.clientes.total_ativos} | Novos este mês: ${data.clientes.novos_mes}
Ticket médio: ${formatBRL(data.clientes.ticket_medio)}

Metas: Margem bruta > 60% | Margem líquida > 35% | LTV:CAC > 3x | Caixa ≥ 3 meses

## TASK

Gere análise financeira em 4 blocos:

### Diagnóstico Financeiro
[O que os números dizem sobre a saúde do negócio? O que está bem e o que precisa de atenção?]

### Onde Investir Mais Agora
[Baseado nos dados, qual canal ou serviço tem melhor retorno? Por quê?]

### Onde Cortar Custo
[Há custo crescendo sem justificativa? O que pode ser eliminado sem afetar qualidade?]

### Ação Recomendada Esta Semana
[1 ação específica e acionável para melhorar a situação financeira nos próximos 7 dias]

Escreva em português. Seja direto. Se os dados estiverem zerados, projete cenários realistas para uma consultoria iniciante.`,
    }],
  });

  const aiInsights = aiResp.content[0].text.trim();
  appendLog('AI analysis complete');

  // ── Save outputs ──────────────────────────────────────────────────────
  const reportMD = buildMarkdownReport(data, metrics, aiInsights);

  const marginByService = [
    { servico: 'Quick Win (2–4 semanas)', valor_medio: 5500,  custo_estimado: 1200, margem_bruta_pct: 78 },
    { servico: 'Diagnóstico + Plano', valor_medio: 11500, custo_estimado: 2800, margem_bruta_pct: 76 },
    { servico: 'Projeto Completo', valor_medio: 32000, custo_estimado: 9000, margem_bruta_pct: 72 },
    { servico: 'Parceria Contínua (mensal)', valor_medio: 5500,  custo_estimado: 1100, margem_bruta_pct: 80 },
  ];

  const cashFlowForecast = {
    date: taskDate,
    saldo_atual: metrics.lucro_liquido,
    periodos: [
      { periodo: '30 dias', receita_projetada: metrics.forecast.d30, custo_projetado: metrics.custo_total, saldo_projetado: metrics.forecast.d30 - metrics.custo_total },
      { periodo: '60 dias', receita_projetada: metrics.forecast.d60, custo_projetado: metrics.custo_total * 2, saldo_projetado: metrics.forecast.d60 - metrics.custo_total * 2 },
      { periodo: '90 dias', receita_projetada: metrics.forecast.d90, custo_projetado: metrics.custo_total * 3, saldo_projetado: metrics.forecast.d90 - metrics.custo_total * 3 },
    ],
  };

  const roiByChannel = [
    { canal: 'Instagram (orgânico)', custo_mensal: 0, leads_gerados: data.pipeline.leads_ativos, roi_estimado: 'N/A (orgânico)' },
    { canal: 'Indicação', custo_mensal: 0, leads_gerados: 0, roi_estimado: 'N/A (sem custo)' },
    { canal: 'Google Ads', custo_mensal: data.custos.marketing_ads, leads_gerados: 0, roi_estimado: 'Não ativo ainda' },
  ];

  fs.writeFileSync(path.join(financeDir, 'financial_report_weekly.md'), reportMD);
  fs.writeFileSync(path.join(financeDir, 'margin_by_service.json'), JSON.stringify(marginByService, null, 2));
  fs.writeFileSync(path.join(financeDir, 'cash_flow_forecast.json'), JSON.stringify(cashFlowForecast, null, 2));
  fs.writeFileSync(path.join(financeDir, 'roi_by_channel.json'), JSON.stringify(roiByChannel, null, 2));
  fs.writeFileSync(
    path.join(financeDir, 'metrics_snapshot.json'),
    JSON.stringify({ date: taskDate, ...metrics, data }, null, 2)
  );

  appendLog('All outputs saved ✓');

  console.log(`\n  ✓ Relatório: ${path.join(financeDir, 'financial_report_weekly.md')}`);
  console.log(`  ✓ Margem por serviço: margin_by_service.json`);
  console.log(`  ✓ Fluxo de caixa: cash_flow_forecast.json`);

  if (metrics.saude !== 'saudavel') {
    console.log(`\n  ⚠ Alertas:`);
    if (metrics.margem_bruta < 60)   console.log(`    • Margem bruta: ${metrics.margem_bruta}% (meta > 60%)`);
    if (metrics.margem_liquida < 35) console.log(`    • Margem líquida: ${metrics.margem_liquida}% (meta > 35%)`);
    if (metrics.ltv_cac_ratio < 3)   console.log(`    • LTV:CAC: ${metrics.ltv_cac_ratio}x (meta > 3x)`);
  }

  appendLog('financial_agent complete ✓');
  return { status: 'ok', saude: metrics.saude, receita: metrics.receita_total, margem_bruta: metrics.margem_bruta };
}

runFinancialAgent().catch(err => {
  console.error('Financial Agent error:', err.message);
  process.exit(1);
});
