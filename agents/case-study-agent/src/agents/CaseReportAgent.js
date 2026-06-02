// CaseReportAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');
const fs   = require('fs');
const path = require('path');

const client = new Anthropic();

// ── Biblioteca de cases local ─────────────────────────────────────────────────

const LIBRARY_PATH = path.join(__dirname, '../../outputs/case_library.json');

function loadLibrary() {
  if (fs.existsSync(LIBRARY_PATH)) {
    try { return JSON.parse(fs.readFileSync(LIBRARY_PATH, 'utf-8')); } catch { return []; }
  }
  return [];
}

function saveToLibrary(caseRecord) {
  const lib = loadLibrary();
  const idx = lib.findIndex(c => c.id === caseRecord.id);
  if (idx >= 0) lib[idx] = caseRecord;
  else lib.push(caseRecord);
  fs.mkdirSync(path.dirname(LIBRARY_PATH), { recursive: true });
  fs.writeFileSync(LIBRARY_PATH, JSON.stringify(lib, null, 2), 'utf-8');
  return lib;
}

function computeLibraryStats(library) {
  const total      = library.length;
  const byStatus   = {};
  const bySector   = {};
  const byType     = {};
  let totalROI     = 0;
  let roiCount     = 0;
  let totalSavings = 0;

  for (const c of library) {
    byStatus[c.status]   = (byStatus[c.status]   || 0) + 1;
    bySector[c.sector]   = (bySector[c.sector]   || 0) + 1;
    byType[c.case_type]  = (byType[c.case_type]  || 0) + 1;
    if (c.roi) { totalROI += c.roi; roiCount++; }
    if (c.monthly_savings) totalSavings += c.monthly_savings;
  }

  return {
    total,
    by_status:         byStatus,
    by_sector:         bySector,
    by_type:           byType,
    avg_roi:           roiCount > 0 ? parseFloat((totalROI / roiCount).toFixed(2)) : 0,
    total_monthly_savings: parseFloat(totalSavings.toFixed(2)),
    total_annual_savings:  parseFloat((totalSavings * 12).toFixed(2)),
    public_ready:      library.filter(c => c.status === 'public_ready' || c.status === 'published').length,
    anonymous_ready:   library.filter(c => c.status === 'anonymous_ready').length,
  };
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function generateCaseReport() {
  const library = loadLibrary();
  const stats   = computeLibraryStats(library);

  const libSummary = library.slice(0, 10).map(c => (
    `- ${c.case_name || c.id}: ${c.sector} | ${c.status} | ROI: ${c.roi ? c.roi + 'x' : 'N/A'} | Perm: ${c.permission_level}`
  )).join('\n');

  const prompt = `Você é o Case Report Agent da SmartOps IA.
Gere um relatório completo da biblioteca de cases.

ESTATÍSTICAS:
- Total de cases: ${stats.total}
- ROI médio: ${stats.avg_roi}x
- Economia mensal total documentada: R$ ${stats.total_monthly_savings}
- Economia anual total: R$ ${stats.total_annual_savings}
- Cases prontos para publicar: ${stats.public_ready}
- Cases anônimos prontos: ${stats.anonymous_ready}
- Por status: ${JSON.stringify(stats.by_status)}
- Por setor: ${JSON.stringify(stats.by_sector)}
- Por tipo: ${JSON.stringify(stats.by_type)}

CASES RECENTES (últimos 10):
${libSummary || 'Nenhum case registrado ainda.'}

Gere o relatório no formato SmartOps:

TÍTULO: Relatório de Cases SmartOps IA
CONTEXTO: [estado atual da biblioteca de prova social]
DADOS ANALISADOS: [principais números]
PROBLEMA IDENTIFICADO: [gaps na biblioteca de cases]
EVIDÊNCIA: [cases mais fortes disponíveis]
IMPACTO: [impacto comercial estimado dos cases disponíveis]
RECOMENDAÇÃO: [o que fazer para fortalecer a biblioteca]
AÇÃO SUGERIDA: [próxima ação imediata]
PRIORIDADE: [Alta / Média / Baixa]
ESFORÇO: [Baixo / Médio / Alto]
ROI ESPERADO: [impacto de ter cases sólidos na taxa de fechamento]
RISCO DE NÃO AGIR: [perda comercial por falta de prova social]
PRAZO: [quando tomar a ação]
MÉTRICA DE SUCESSO: [como medir sucesso]
PRÓXIMO PASSO: [ação específica]

---

DASHBOARD DE CASES:
${stats.total === 0 ? '⚠️ Biblioteca vazia — nenhum case registrado ainda. Capture o primeiro projeto!' : `
✅ ${stats.public_ready} cases públicos
📋 ${stats.anonymous_ready} cases anônimos prontos
📊 ${stats.total} cases no total
💰 ROI médio: ${stats.avg_roi}x
💵 Economia documentada: R$ ${stats.total_annual_savings}/ano`}

CASES POR SETOR:
${Object.entries(stats.by_sector).map(([s, n]) => `- ${s}: ${n} case(s)`).join('\n') || '- Nenhum ainda'}

PRÓXIMAS AÇÕES:
1. [ação prioritária de case]
2. [ação de permissão/depoimento]
3. [ação de repurposing]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    stats,
    library_count: library.length,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

async function generateAnalytics() {
  const library = loadLibrary();
  const stats   = computeLibraryStats(library);

  const prompt = `Você é o Case Analytics Agent da SmartOps IA.
Analise o impacto comercial da biblioteca de cases da SmartOps IA.

DADOS:
- Total: ${stats.total} cases
- ROI médio documentado: ${stats.avg_roi}x
- Economia mensal total: R$ ${stats.total_monthly_savings}
- Cases prontos para venda: ${stats.public_ready + stats.anonymous_ready}

Gere análise de impacto:

IMPACTO_COMERCIAL: [como os cases impactam a taxa de fechamento]
GAPS_NA_BIBLIOTECA: [setores/tipos de case que faltam]
OPORTUNIDADES: [cases que podem ser criados rapidamente]
RECOMENDACAO_CONTEUDO: [qual case transformar em conteúdo agora]
RECOMENDACAO_PROPOSTA: [qual case colocar na próxima proposta]
KPI_DA_SEMANA: [métrica a perseguir essa semana]
META_30_DIAS: [meta de cases para os próximos 30 dias]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return { stats, analysis: resp.content[0].text, created_at: new Date().toISOString() };
}

module.exports = { generateCaseReport, generateAnalytics, loadLibrary, saveToLibrary, computeLibraryStats };
