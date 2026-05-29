require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { tavily } = require('@tavily/core');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task') || 'seo';
const taskDate = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const seoDir    = path.join(outputDir, 'seo');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'seo_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}

const SEED_KEYWORDS = [
  'consultoria lean six sigma belo horizonte',
  'melhoria de processos pequenas empresas bh',
  'automação whatsapp pequena empresa',
  'lean six sigma restaurante',
  'lean six sigma clinica',
  'black belt lean six sigma belo horizonte freelancer',
  'consultoria processos bh preço',
  'como reduzir custos operacionais empresa',
  'automação processos IA pequenas empresas brasil',
];

async function runSeoAgent() {
  console.log(`\nSEO Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [seoDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('seo_agent started');

  const rawSearch = {};
  if (process.env.TAVILY_API_KEY) {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    for (const kw of SEED_KEYWORDS.slice(0, 5)) {
      console.log(`  → Pesquisando: "${kw}"`);
      try {
        const r = await tvly.search(kw + ' site concorrente consultoria', { searchDepth: 'basic', maxResults: 3 });
        rawSearch[kw] = { answer: r.answer, results: r.results?.map(x => ({ title: x.title, url: x.url })) };
        appendLog(`Searched: ${kw}`);
      } catch (e) { rawSearch[kw] = { error: e.message }; }
    }
  }

  console.log('  → Gerando estratégia SEO com IA...');
  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Você é o SEO Agent da SmartOps IA — consultoria Lean Six Sigma + Automação IA para PMEs em BH.

## DADOS DE PESQUISA DE KEYWORDS

${JSON.stringify(rawSearch, null, 2)}

## KEYWORDS SEMENTE

${SEED_KEYWORDS.join('\n')}

## TASK — Estratégia SEO Completa

# SEO Report — SmartOps IA — ${taskDate}

## Análise de Intenção de Busca

### Buscas de Problema (topo do funil — maior volume)
| Keyword | Intenção | Volume estimado | Concorrência | Prioridade |
|---|---|---|---|---|
| [keyword] | Informacional | | | |

### Buscas de Solução (meio de funil)
| Keyword | Intenção | Prioridade |
|---|---|---|

### Buscas de Compra (fundo de funil — converter agora)
| Keyword | Intenção | Prioridade |
|---|---|---|

## Cluster de Conteúdo — Arquitetura do Site

### Página Pilar: "Consultoria Lean Six Sigma em BH"
- URL sugerida: /consultoria-lean-six-sigma-belo-horizonte
- H1: [sugestão]
- Subpáginas satélite:
  1. /lean-six-sigma-para-clinicas (Carlos persona)
  2. /lean-six-sigma-para-restaurantes (Roberto persona)
  3. /automacao-processos-pme (Ana persona)
  4. /dmaic-melhoria-continua (Paulo persona)

## Top 10 Keywords para Ranquear (3-6 meses)

| # | Keyword | Volume/mês (estimado) | Dificuldade | Prioridade |
|---|---|---|---|---|
| 1 | [keyword] | | | |

## Otimização On-Page — Cheklist

### Página Inicial
- [ ] Title tag: [sugestão]
- [ ] Meta description: [sugestão 155 chars]
- [ ] H1: [sugestão]
- [ ] Alt text das imagens: [padrão]

### Blog — 5 Artigos Prioritários
1. **"[Título]"** — keyword: [keyword] — intenção: [info/solução]
2. **"[Título]"** — keyword: [keyword]
3. **"[Título]"**
4. **"[Título]"**
5. **"[Título]"**

## Link Building
- Diretórios locais BH: [3 diretórios]
- Parceiros para link: [3 tipos de parceiro]
- Guest posts: [2 sites do setor]

## Ação Imediata (sem custo)
[1 coisa para fazer hoje que melhora o SEO sem nenhum custo]`,
    }],
  });

  const seoMD = resp.content[0].text.trim();
  appendLog('SEO report generated');

  // Keywords JSON
  const kwResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Com base neste relatório SEO, gere as top keywords em JSON:
[{"keyword":"string","intencao":"informacional|solucao|compra","volume_estimado":"string","dificuldade":"baixa|media|alta","prioridade":"alta|media|baixa","conteudo_sugerido":"string"}]
Retorne APENAS o array JSON sem markdown. Max 15 keywords.
RELATÓRIO: ${seoMD.slice(0, 2000)}`,
    }],
  });

  let keywords = [];
  try {
    const raw = kwResp.content[0].text.trim().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    keywords = JSON.parse(raw);
  } catch { keywords = []; }

  fs.writeFileSync(path.join(seoDir, 'seo_report.md'), seoMD);
  fs.writeFileSync(path.join(seoDir, 'keywords.json'), JSON.stringify({ date: taskDate, keywords, raw_search: rawSearch }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Relatório SEO: ${path.join(seoDir, 'seo_report.md')}`);
  console.log(`  ✓ Keywords: keywords.json (${keywords.length} keywords)`);
  keywords.filter(k => k.prioridade === 'alta').slice(0,3).forEach(k => console.log(`    🎯 "${k.keyword}" — ${k.intencao}`));

  appendLog('seo_agent complete ✓');
}

runSeoAgent().catch(err => {
  console.error('SEO Agent error:', err.message);
  process.exit(1);
});
