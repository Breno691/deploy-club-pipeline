#!/usr/bin/env node
/**
 * Content Performance Agent — SmartOps IA
 * Análise de performance de conteúdo, métricas e otimização
 *
 * Usage:
 *   node content_performance_agent.js --mode analyze --canal instagram
 *   node content_performance_agent.js --mode top-posts
 *   node content_performance_agent.js --mode benchmark --canal youtube
 *   node content_performance_agent.js --mode optimize --formato carrossel
 *   node content_performance_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function scoreContent(alcance, engajamento_pct, salvamentos_pct, ctr_cta_pct, crescimento) {
  const w = CONFIG.content_score_weights;
  const s_alc  = Math.min(alcance / 100, 10) * (w.alcance / 10);
  const s_eng  = Math.min(engajamento_pct / 10, 10) * (w.engajamento / 10);
  const s_save = Math.min(salvamentos_pct / 5, 10) * (w.salvamentos / 10);
  const s_ctr  = Math.min(ctr_cta_pct / 3, 10) * (w.ctr_cta / 10);
  const s_cres = Math.min(crescimento / 2, 10) * (w.crescimento / 10);
  return Math.round(s_alc + s_eng + s_save + s_ctr + s_cres);
}

function assessKPI(canal, kpi, valor) {
  const ref = CONFIG.kpis[canal]?.[kpi];
  if (!ref) return 'N/A';
  if (valor >= ref.excelente) return '🟢 Excelente';
  if (valor >= ref.bom) return '🟡 Bom';
  if (valor >= ref.meta) return '🟠 Na meta';
  return '🔴 Abaixo';
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `perf_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Content Performance Agent da SmartOps IA — analista de performance de conteúdo.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Nicho: Lean, Automação e IA para PMEs em BH.

METAS POR CANAL:
Instagram: ${JSON.stringify(CONFIG.kpis.instagram)}
YouTube: ${JSON.stringify(CONFIG.kpis.youtube)}

FORMATOS E PERFORMANCE ESPERADA:
${Object.entries(CONFIG.formats_performance).map(([k, v]) => `- ${k}: save rate ${v.avg_save_rate}% | reach x${v.avg_reach_multiplier} | melhor para: ${v.best_for}`).join('\n')}

REGRAS:
- Nunca sugerir mudança sem dado ou benchmarkcom justificativa
- Priorizar ações que impactam alcance orgânico (sem custo)
- Identificar padrões: o que os posts de sucesso têm em comum`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  CONTENT PERFORMANCE AGENT — SmartOps IA        ║');
  console.log('║  "O que não é medido não melhora."              ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'analyze': {
        const canal = getArg('canal', 'instagram');
        const kpis = CONFIG.kpis[canal] || CONFIG.kpis.instagram;
        console.log(`\n📊 Metas do ${canal}:`);
        Object.entries(kpis).forEach(([k, v]) => console.log(`  ${k}: meta ${v.meta} | bom ${v.bom} | excelente ${v.excelente} ${v.unidade}`));
        const result = await ask(`${BASE}

CANAL: ${canal}
METAS: ${JSON.stringify(kpis, null, 2)}

Analise a PERFORMANCE DO CANAL ${canal.toUpperCase()} da SmartOps IA:

## Diagnóstico Atual (baseado em benchmarks de nicho B2B/consultoria)
[O que esperar de uma conta com 0-1k seguidores neste nicho]

## Análise por KPI
${Object.entries(kpis).map(([k, v]) => `### ${k}
Meta: ${v.meta} | Bom: ${v.bom} | Excelente: ${v.excelente} ${v.unidade}
[Análise: o que indica, o que fazer se estiver abaixo, como melhorar]`).join('\n\n')}

## Ações de Melhoria por Prioridade
${Object.entries(CONFIG.optimization_actions).map(([k, v]) => `### Se ${k}:
${v.map(a => `- ${a}`).join('\n')}`).join('\n\n')}

## Meta para Próximos 30 Dias
[Metas realistas por KPI com ações específicas]`);
        console.log(result);
        save(dir, `analyze_${canal}_${date}.md`, result);
        break;
      }

      case 'top-posts': {
        const result = await ask(`${BASE}

Defina os CRITÉRIOS DE TOP POSTS e o que aprender com eles:

## O que Define um Top Post (SmartOps IA)
[Score mínimo, combinação de métricas]

## Padrões de Posts de Alto Performance no Nicho
[Análise de o que Lean/Consultoria/IA posts que performam bem têm em comum]

### Padrão 1 — Carrosséis que viralizam no nicho B2B
[Elementos: tema, hook, estrutura, número de slides, CTA]

### Padrão 2 — Reels que alcançam fora da base
[Hook visual, duração, texto na tela, áudio]

### Padrão 3 — Posts que geram DMs e leads
[Formato, tom, CTA, entrega de valor]

## Template de Post de Alto Performance
[Um template replicável para cada formato principal]

## O que Evitar (padrões de posts que não performam)
[3-5 erros comuns]`);
        console.log(result);
        save(dir, `top_posts_analysis_${date}.md`, result);
        break;
      }

      case 'worst-posts': {
        const result = await ask(`${BASE}

Analise os PADRÕES DE BAIXA PERFORMANCE para evitar:

## Posts que Costumam Performar Mal

### Posts de Autoridade Genérica
[Por que não funcionam, como transformar]

### Posts Muito Promocionais
[O problema e a alternativa]

### Posts Sem Hook Visual Claro
[Como diagnosticar e corrigir]

### Posts com Texto Excessivo
[Regra do 80/20 visual]

### Posts Sem CTA
[Impacto e como adicionar CTA natural]

## Checklist Anti-Flop
[10 perguntas para fazer antes de publicar]

## Como Recuperar um Post com Baixa Performance
[Repostar, editar caption, boostar, ou arquivar]`);
        console.log(result);
        save(dir, `worst_posts_analysis_${date}.md`, result);
        break;
      }

      case 'benchmark': {
        const canal = getArg('canal', 'instagram');
        const result = await ask(`${BASE}

CANAL: ${canal}

## Benchmarks do Nicho (Consultoria B2B / Lean / Automação)

### Contas de 0-1.000 seguidores
[O que esperar realista — sem inflar]

### Contas de 1.000-10.000 seguidores
[Próximo milestone e o que muda]

### Contas de 10.000+ seguidores
[Indicadores de autoridade consolidada]

## Concorrentes Referência (sem nomear diretos)
[Tipos de contas no nicho para benchmarcar]

## Como Medir sua Performance vs Benchmark
[Fórmula de score + tabela de comparação]

## O que Impacta o Benchmark
[Fatores: frequência, qualidade, consistência, nicho]`);
        console.log(result);
        save(dir, `benchmark_${canal}_${date}.md`, result);
        break;
      }

      case 'audit': {
        const result = await ask(`${BASE}

Faça uma AUDITORIA COMPLETA do conteúdo da SmartOps IA:

## Diagnóstico Geral
[Saúde da estratégia de conteúdo atual]

## Análise de Mix de Conteúdo
[Equilíbrio entre educativo/inspiracional/promocional/bastidores/interativo]
Meta: ${Object.entries(CONFIG.content_types).map(([k, v]) => `${k}: ${(v.ratio*100).toFixed(0)}%`).join(', ')}

## Análise por Formato
${Object.entries(CONFIG.formats_performance).map(([f, v]) => `### ${f}: save rate ${v.avg_save_rate}% | alcance x${v.avg_reach_multiplier}
[Diagnóstico e recomendação de uso]`).join('\n\n')}

## Top 3 Mudanças para Esta Semana
[Ações concretas de maior impacto]

## KPIs para Acompanhar Semanalmente
[Dashboard simplificado — o que olhar toda segunda]`);
        console.log(result);
        save(dir, `content_audit_${date}.md`, result);
        break;
      }

      case 'optimize': {
        const formato = getArg('formato', 'carrossel');
        const perfData = CONFIG.formats_performance[formato] || CONFIG.formats_performance.carrossel;
        const result = await ask(`${BASE}

FORMATO: ${formato}
PERFORMANCE ESPERADA: save rate ${perfData.avg_save_rate}% | reach x${perfData.avg_reach_multiplier} | melhor para: ${perfData.best_for}

## Guia de Otimização: ${formato.toUpperCase()}

### O que Define a Performance deste Formato
[Variáveis que mais impactam alcance e engajamento]

### Hook de Alta Performance para ${formato}
[Fórmulas + exemplos específicos para nicho SmartOps]

### Estrutura Ideal
[Como organizar o conteúdo para maximizar a métrica principal]

### Erros Que Derrubam a Performance
[Top 5 erros neste formato]

### Teste A/B Recomendado
[Uma variável para testar agora que tem maior impacto]

### Checklist de Publicação
[5 pontos obrigatórios antes de publicar este formato]`);
        console.log(result);
        save(dir, `optimize_${formato}_${date}.md`, result);
        break;
      }

      case 'forecast': {
        const result = await ask(`${BASE}

Faça uma PREVISÃO DE PERFORMANCE para os próximos 30/60/90 dias:

## Projeção de Crescimento (baseada em benchmarks de nicho)

### Cenário Conservador (publicar 3x/semana, qualidade média)
| Métrica | Atual | 30 dias | 60 dias | 90 dias |
|---------|-------|---------|---------|---------|

### Cenário Realista (publicar 4x/semana, alta qualidade)
| Métrica | Atual | 30 dias | 60 dias | 90 dias |

### Cenário Otimista (publicar 5x+ com virais)
| Métrica | Atual | 30 dias | 60 dias | 90 dias |

## Marcos de Crescimento
[1k | 5k | 10k — o que muda em cada milestone]

## Variáveis que Acceleram o Crescimento
[Ações de alto impacto com baixo esforço]`);
        console.log(result);
        save(dir, `forecast_${date}.md`, result);
        break;
      }

      case 'instagram': {
        const result = await ask(`${BASE}

Análise específica da performance do INSTAGRAM da SmartOps IA:

## Métricas-Chave (últimos 7 dias — usar benchmarks se não tiver dados)
${Object.entries(CONFIG.kpis.instagram).map(([k, v]) => `- ${k}: meta ${v.meta} ${v.unidade}`).join('\n')}

## Análise de Feed vs Reels vs Stories
[Performance relativa e onde focar]

## Horários de Maior Engajamento
[Quando publicar para maximizar alcance]

## Hashtag Performance
[Quais categorias funcionam melhor para o nicho]

## Ação Prioritária Esta Semana
[1 mudança concreta que mais impactaria a performance]`);
        console.log(result);
        save(dir, `instagram_perf_${date}.md`, result);
        break;
      }

      case 'youtube': {
        const result = await ask(`${BASE}

Análise específica da performance do YOUTUBE da SmartOps IA:

## Métricas-Chave
${Object.entries(CONFIG.kpis.youtube).map(([k, v]) => `- ${k}: meta ${v.meta} ${v.unidade}`).join('\n')}

## Otimização de CTR (thumbnail + título)
[O que funciona para CTR alto em canais B2B/consultoria]

## Retenção (Watch Time)
[Como estruturar vídeo para assistirem até o final]

## SEO de Vídeo
[Keywords, descrição, tags para ranquear em BH]

## Estratégia de Crescimento
[O que priorizaría para crescer de 0 a 1.000 inscritos]`);
        console.log(result);
        save(dir, `youtube_perf_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Content Performance Agent — Report Semanal

## Resumo de Performance (últimos 7 dias)
[Análise baseada em benchmarks de nicho — sem dados reais disponíveis]

## Formato Campeão da Semana
[Qual formato performou melhor e por quê]

## Conteúdo Com Maior Potencial (próxima semana)
[O tema e formato que mais vai performar baseado em tendências]

## Alerta de Performance
[Algo a corrigir imediatamente]

## Ações Prioritárias
1. [Ação de maior ROI para conteúdo]
2. [Ação de médio prazo]
3. [Teste a implementar]

## KPIs a Monitorar Esta Semana
| Métrica | Canal | Meta | Frequência |
|---------|-------|------|-----------|`);
        console.log(result);
        save(dir, `content_perf_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: analyze | instagram | youtube | top-posts | worst-posts | benchmark | audit | optimize | forecast | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
