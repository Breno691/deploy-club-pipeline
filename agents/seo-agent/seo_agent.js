#!/usr/bin/env node
/**
 * SEO Agent — SmartOps IA
 * Especialista em SEO Estratégico, Clusters e Crescimento Orgânico
 *
 * Usage:
 *   node seo_agent.js --mode analyze
 *   node seo_agent.js --mode keywords --topic "consultoria lean BH"
 *   node seo_agent.js --mode cluster --topic "automação de processos PME"
 *   node seo_agent.js --mode technical --url "smartopsIA.com.br"
 *   node seo_agent.js --mode content
 *   node seo_agent.js --mode report
 *   node seo_agent.js --mode technical --url "smartopsIA.com.br"
 *   node seo_agent.js --mode content-audit
 *   node seo_agent.js --mode local
 *   node seo_agent.js --mode competitors
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { researchKeywordsWithClaude, analyzeKeywordsLocally } = require('./src/agents/KeywordResearchAgent');
const { buildSEOSnapshot, generateSEOReportWithClaude }      = require('./src/agents/SEOReportAgent');
const { auditTechnicalSEOWithClaude }                        = require('./src/agents/TechnicalSEOAgent');
const { auditContentWithClaude }                             = require('./src/agents/ContentAuditAgent');
const { analyzeLocalSEOWithClaude }                          = require('./src/agents/LocalSEOAgent');
const { analyzeCompetitorSEOWithClaude }                     = require('./src/agents/CompetitorSEOAgent');
const { calcSEOScore, identifyQuickWins }                    = require('./src/calculations/seoCalculators');
const { CONFIG } = require('./src/config');

const client = new Anthropic();

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `seo_${date}`);
  ['logs', 'reports'].forEach(d => { if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true }); });
  return { dir, date };
}

function saveOutput(dir, filename, content) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}

async function runClaudeMode(prompt) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].text;
}

async function main() {
  const mode  = getArg('mode', 'analyze');
  const topic = getArg('topic', 'consultoria Lean e automação IA para PMEs em BH');

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  SEO AGENT — SmartOps IA                        ║');
  console.log('║  SEO Estratégico + Clusters + Crescimento        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode}${topic ? ` | Tema: ${topic}` : ''}\n`);

  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY não configurada'); process.exit(1); }

  const { dir, date } = setupOutput();

  // Dados de exemplo do Search Console
  const sampleQueries = [
    { query: 'consultoria lean bh',                  clicks: 8,  impressions: 420,  position: 6.2,  optimized: false },
    { query: 'lean six sigma belo horizonte',        clicks: 5,  impressions: 310,  position: 9.1,  optimized: false },
    { query: 'automação processos pequenas empresas',clicks: 3,  impressions: 280,  position: 14.5, optimized: false },
    { query: 'como eliminar desperdício empresa',    clicks: 4,  impressions: 520,  position: 8.3,  optimized: false },
    { query: 'consultoria melhoria contínua bh',     clicks: 2,  impressions: 190,  position: 18.2, optimized: false },
    { query: 'n8n automação belo horizonte',         clicks: 1,  impressions: 95,   position: 24.1, optimized: false },
    { query: 'reduzir custos operacionais empresa',  clicks: 6,  impressions: 650,  position: 5.8,  optimized: true  },
  ];

  try {
    switch (mode) {

      case 'analyze':
      case 'report': {
        const snapshot = buildSEOSnapshot(
          { clicks: 29, impressions: 2465, ctr: 1.9, avg_position: 11.3, queries: sampleQueries, sessions_organic: 380, conversions_organic: 3 },
          { errors: 2, content_score: 5, internal_links: 12, backlinks: 8 }
        );

        console.log(`Score SEO: ${snapshot.score.score}/100 (${snapshot.score.label})`);
        console.log(`Cliques: ${snapshot.kpis.clicks} | CTR: ${snapshot.kpis.ctr}% | Posição: ${snapshot.kpis.avg_position}`);
        console.log(`Quick wins disponíveis: ${snapshot.quick_wins.length}\n`);

        const report = await generateSEOReportWithClaude(snapshot, 'weekly');
        console.log(report);
        saveOutput(path.join(dir, 'reports'), `seo_report_${date}.md`, report);
        saveOutput(path.join(dir, 'reports'), 'snapshot.json', snapshot);
        break;
      }

      case 'keywords': {
        const { analysis, data } = await researchKeywordsWithClaude(sampleQueries, topic);
        console.log(`Consultas analisadas: ${data.total_queries}`);
        console.log(`Oportunidades (pos 4-20): ${data.opportunities.length}`);
        console.log(`CTR baixo (<2%): ${data.low_ctr_opportunities.length}\n`);
        console.log(analysis);
        saveOutput(path.join(dir, 'reports'), `keywords_${date}.md`, analysis);
        break;
      }

      case 'cluster': {
        console.log(`Criando cluster semântico para: "${topic}"\n`);
        const result = await runClaudeMode(`Você é o SEO Agent da SmartOps IA.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma

Crie um cluster semântico completo para o tema: "${topic}"

Inclua:
1. PÁGINA PILAR — título, URL, intenção, objetivo, estrutura H2
2. CONTEÚDOS SATÉLITE (8-12) — keyword, título, URL, intenção, CTA, link para pilar
3. LINKAGEM INTERNA — grafo de links entre páginas
4. CALENDÁRIO — ordem de publicação por prioridade
5. META ESPERADA — posicionamento e cliques em 90 dias`);

        console.log(result);
        saveOutput(path.join(dir, 'reports'), `cluster_${date}.md`, result);
        break;
      }

      case 'technical': {
        const url = getArg('url', 'smartopsIA.com.br');
        console.log(`Auditoria técnica de SEO: ${url}\n`);
        const result = await runClaudeMode(`Você é o SEO Agent da SmartOps IA — especialista em SEO técnico.

Site: ${url}
Data: ${date}

Faça uma auditoria técnica de SEO completa e responda:

# AUDITORIA TÉCNICA SEO — ${url}

## CHECKLIST TÉCNICO
Para cada item: Status [OK/VERIFICAR/PROBLEMA] + Recomendação

- Robots.txt
- Sitemap.xml
- Canonical tags
- Status HTTP (200, 301, 404, 5xx)
- Velocidade mobile (Core Web Vitals: LCP, INP, CLS)
- HTTPS
- Estrutura de headings (H1 único, H2 organizados)
- Schema markup
- Imagens otimizadas (alt text, tamanho)
- Links internos
- Conteúdo duplicado
- Indexação correta
- Mobile friendly

## PRIORIDADE DE CORREÇÃO
P1 — Crítico (afeta indexação ou ranking)
P2 — Alto (afeta performance e UX)
P3 — Médio (otimização)

## IMPACTO ESTIMADO DE CADA CORREÇÃO
[O que melhora com cada fix]`);

        console.log(result);
        saveOutput(path.join(dir, 'reports'), `technical_audit_${date}.md`, result);
        break;
      }

      case 'content': {
        console.log('Gerando estratégia de conteúdo SEO...\n');
        const result = await runClaudeMode(`Você é o SEO Agent da SmartOps IA.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Data: ${date}

Keywords estratégicas:
${CONFIG.strategic_keywords.map(k => `- "${k.kw}" [${k.intent}] prioridade ${k.priority}`).join('\n')}

Crie uma estratégia completa de conteúdo orgânico:

# CONTENT SEO STRATEGY — SmartOps IA

## ESTRATÉGIA GERAL
[Posicionamento e abordagem]

## CALENDÁRIO EDITORIAL (próximas 4 semanas)
Para cada conteúdo:
SEMANA: [N]
TÍTULO: [title tag otimizado]
H1: [headline da página]
KEYWORD PRINCIPAL: [keyword]
INTENÇÃO: [informacional/comercial/transacional]
ETAPA FUNIL: [topo/meio/fundo]
CTA: [próximo passo]
URL: [slug sugerido]
LINKAR PARA: [página pilar ou comercial]
PRIORIDADE: [P1/P2/P3]

## BRIEFING DO 1º CONTEÚDO (prioritário)
[Briefing completo para criar agora]

## META DE 90 DIAS
[Projeção de cliques e conversões com essa estratégia]`);

        console.log(result);
        saveOutput(path.join(dir, 'reports'), `content_strategy_${date}.md`, result);
        break;
      }

      case 'technical': {
        const url = getArg('url', CONFIG.company.site);
        console.log(`⚙️  Auditoria técnica: ${url}\n`);
        const result = await auditTechnicalSEOWithClaude(url);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `technical_seo_${date}.md`, result);
        break;
      }

      case 'content-audit': {
        console.log('📄 Auditando conteúdos publicados...\n');
        const pages = sampleQueries.map(q => ({
          url: `/${q.query.replace(/\s+/g, '-')}`,
          title: q.query,
          clicks: q.clicks, impressions: q.impressions, position: q.position,
          has_cta: Math.random() > 0.5, published_date: '2024-06-01',
        }));
        const result = await auditContentWithClaude(pages, 'consultoria Lean + Automação IA');
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `content_audit_${date}.md`, result);
        break;
      }

      case 'local': {
        console.log('📍 Análise de SEO Local — BH...\n');
        const result = await analyzeLocalSEOWithClaude({});
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `local_seo_${date}.md`, result);
        break;
      }

      case 'competitors': {
        console.log('🔎 Análise de SEO dos concorrentes...\n');
        const result = await analyzeCompetitorSEOWithClaude([], { keywords: CONFIG.strategic_keywords.map(k => k.kw) });
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `competitor_seo_${date}.md`, result);
        break;
      }

      default:
        console.log(`Modo desconhecido: ${mode}\nDisponíveis: analyze | keywords | cluster | technical | content | content-audit | report | local | competitors`);
    }

    console.log(`\n✅ Output: ${dir}`);
  } catch (err) { console.error(`❌ ${err.message}`); process.exit(1); }
}

main();
