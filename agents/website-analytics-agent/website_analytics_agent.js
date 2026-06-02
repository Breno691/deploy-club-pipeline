#!/usr/bin/env node
/**
 * Website Analytics Agent — SmartOps IA
 * Análise de sessões, eventos, páginas, funil e tráfego (funciona sem GA4 API)
 *
 * Usage:
 *   node website_analytics_agent.js --mode sessions --sessoes 180 --rejeicao 72 --duracao 85
 *   node website_analytics_agent.js --mode events
 *   node website_analytics_agent.js --mode pages
 *   node website_analytics_agent.js --mode funnel --sessoes 180 --leads 4 --reunioes 2
 *   node website_analytics_agent.js --mode conversion --sessoes 180 --conversoes 4
 *   node website_analytics_agent.js --mode seo-traffic --organico 45 --total 180
 *   node website_analytics_agent.js --mode heatmap --pagina /
 *   node website_analytics_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcSessionQuality(rejeicao, duracao, paginas) {
  const b = CONFIG.benchmarks;
  const score_rejeicao = rejeicao <= b.taxa_rejeicao.excelente ? 100 : rejeicao <= b.taxa_rejeicao.bom ? 75 : rejeicao <= b.taxa_rejeicao.regular ? 50 : 25;
  const score_duracao  = duracao >= b.tempo_sessao_s.excelente ? 100 : duracao >= b.tempo_sessao_s.bom ? 75 : duracao >= b.tempo_sessao_s.regular ? 50 : 25;
  const score_paginas  = paginas >= b.paginas_sessao.excelente ? 100 : paginas >= b.paginas_sessao.bom ? 75 : paginas >= b.paginas_sessao.regular ? 50 : 25;
  const total = (score_rejeicao * 0.4) + (score_duracao * 0.35) + (score_paginas * 0.25);
  const label = total >= 80 ? 'Excelente' : total >= 60 ? 'Bom' : total >= 40 ? 'Regular' : 'Ruim';
  return { score: +total.toFixed(1), label, score_rejeicao, score_duracao, score_paginas };
}

function calcConversionRate(sessoes, conversoes) {
  if (!sessoes) return { taxa: 0, label: 'Sem dados' };
  const taxa = (conversoes / sessoes) * 100;
  const b    = CONFIG.benchmarks.conversao_lead;
  const label = taxa >= b.excelente ? 'Excelente' : taxa >= b.bom ? 'Bom' : taxa >= b.regular ? 'Regular' : 'Ruim';
  return { taxa: +taxa.toFixed(2), conversoes, sessoes, label };
}

function calcTrafficHealth(organico, total) {
  if (!total) return { pct_organico: 0, label: 'Sem dados' };
  const pct   = (organico / total) * 100;
  const label = pct >= 40 ? 'Ótimo (independência de ads)' : pct >= 25 ? 'Bom' : 'Dependente de ads';
  return { pct_organico: +pct.toFixed(1), label };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `website_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  WEBSITE ANALYTICS AGENT — SmartOps IA          ║');
  console.log('║  "Todo clique conta uma intenção."              ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  // Dados do CLI (fallback para dados de exemplo do config)
  const d = CONFIG.dados_exemplo;
  const sessoes     = parseNum('sessoes', d.sessoes_mes);
  const rejeicao    = parseNum('rejeicao', d.taxa_rejeicao);
  const duracao     = parseNum('duracao', d.duracao_media_s);
  const paginas     = parseNum('paginas', d.paginas_por_sessao);
  const conversoes  = parseNum('conversoes', d.leads_gerados);
  const organico    = parseNum('organico', Math.round(d.sessoes_mes * 0.45));

  const quality  = calcSessionQuality(rejeicao, duracao, paginas);
  const conv     = calcConversionRate(sessoes, conversoes);
  const traffic  = calcTrafficHealth(organico, sessoes);

  const BASE = `Você é o Website Analytics Agent da SmartOps IA.
Site: consultoria Lean + Automação IA para PMEs em BH.
Dados do site: ${sessoes} sessões/mês, ${rejeicao}% de rejeição, ${duracao}s duração média.
Taxa de conversão: ${conv.taxa}% (${conv.label}).
Quality Score: ${quality.score}/100 (${quality.label}).`;

  try {
    switch (mode) {

      case 'sessions': {
        console.log(`SESSION QUALITY ANALYSIS`);
        console.log(`Sessões: ${sessoes} | Rejeição: ${rejeicao}% | Duração: ${duracao}s | Páginas/sessão: ${paginas}`);
        console.log(`Quality Score: ${quality.score}/100 — ${quality.label}\n`);
        save(path.join(dir,'reports'), 'session_quality.json', { sessoes, rejeicao, duracao, paginas, quality });
        const result = await ask(`${BASE}

ANÁLISE DE SESSÕES:
- Sessões/mês: ${sessoes} (meta: ${CONFIG.benchmarks.sessoes_mes.meta})
- Taxa de rejeição: ${rejeicao}% (benchmark bom: < ${CONFIG.benchmarks.taxa_rejeicao.bom}%)
- Duração média: ${duracao}s (benchmark bom: > ${CONFIG.benchmarks.tempo_sessao_s.bom}s)
- Páginas/sessão: ${paginas} (benchmark bom: > ${CONFIG.benchmarks.paginas_sessao.bom})
- Quality Score: ${quality.score}/100 (${quality.label})

# ANÁLISE DE SESSÕES — ${date}

## DIAGNÓSTICO GERAL
[Quality Score ${quality.score}/100 — o que está bem e o que está ruim]

## ANÁLISE DE TAXA DE REJEIÇÃO (${rejeicao}%)
[Causa provável + impacto + ação]

## ANÁLISE DE DURAÇÃO (${duracao}s)
[Por que os visitantes saem cedo? O que está faltando?]

## COMPARAÇÃO COM BENCHMARK
[${sessoes} sessões vs. meta ${CONFIG.benchmarks.sessoes_mes.meta} — gap e projeção]

## PLANO DE MELHORIA
[5 ações para melhorar o Quality Score nos próximos 30 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `sessions_report_${date}.md`, result);
        break;
      }

      case 'events': {
        const result = await ask(`${BASE}

EVENTOS CRÍTICOS A RASTREAR:
${CONFIG.critical_events.map(e => `- ${e.evento}: ${e.descricao} (valor: ${e.valor_negocio})`).join('\n')}

# TRACKING DE EVENTOS — PLANO DE IMPLEMENTAÇÃO

## STATUS DOS EVENTOS (estimado)
[Quais eventos provavelmente estão ou não estão sendo rastreados — e como verificar]

## TOP 3 EVENTOS MAIS IMPORTANTES
[O que rastrear primeiro para obter insights de negócio imediatamente]

## IMPLEMENTAÇÃO GA4 (sem código)
[Como configurar os eventos no GA4 via Google Tag Manager — passo a passo simples]

## DASHBOARD DE EVENTOS RECOMENDADO
[Quais eventos exibir no dashboard e com que frequência monitorar]

## EVENTOS DE CONVERSÃO CUSTOMIZADOS
[Como criar conversões no GA4 baseado nos eventos críticos]

## ALERTA DE ANOMALIA
[Como configurar alertas no GA4 quando eventos críticos param de disparar]`);
        console.log(result);
        save(path.join(dir,'reports'), `events_plan_${date}.md`, result);
        break;
      }

      case 'pages': {
        const result = await ask(`${BASE}

PÁGINAS-CHAVE DO SITE:
${CONFIG.key_pages.map(p => `- ${p.nome} (${p.url}): meta conv ${p.meta_conv || '—'}%, tipo ${p.tipo}`).join('\n')}

# ANÁLISE DE PÁGINAS — ${date}

## RANKING DE PÁGINAS POR IMPACTO NO NEGÓCIO
[Da mais importante à menos importante para geração de leads]

## DIAGNÓSTICO POR PÁGINA
[Para cada página crítica: o que provavelmente está funcionando e o que melhorar]

## PÁGINAS COM MAIOR OPORTUNIDADE
[Onde uma melhoria de CRO teria maior impacto no funil]

## CONTEÚDO RECOMENDADO POR PÁGINA
[O que adicionar/remover em cada página para melhorar conversão]

## ESTRUTURA DE NAVEGAÇÃO
[O fluxo ideal de páginas para guiar o visitante até o formulário]`);
        console.log(result);
        save(path.join(dir,'reports'), `pages_analysis_${date}.md`, result);
        break;
      }

      case 'funnel': {
        const leads   = parseNum('leads', conversoes);
        const reunioes = parseNum('reunioes', Math.floor(leads * 0.5));
        const result = await ask(`${BASE}

FUNIL DO SITE:
Sessões: ${sessoes} → Leads: ${leads} → Reuniões: ${reunioes}
Conversão visitante→lead: ${((leads/sessoes)*100).toFixed(2)}%
Conversão lead→reunião: ${leads > 0 ? ((reunioes/leads)*100).toFixed(1) : 0}%

# ANÁLISE DO FUNIL DO SITE

## MAPA DO FUNIL
[Visualização textual: visitante → engajado → lead → qualificado]

## GARGALO PRINCIPAL
[Onde o funil perde mais visitantes — e por quê]

## ANÁLISE POR FONTE DE TRÁFEGO
[Qual fonte de tráfego tem melhor conversão visitante→lead]

## PÁGINAS DE ENTRADA E SAÍDA
[Onde os visitantes entram e onde abandonam o site]

## PLANO DE OTIMIZAÇÃO DO FUNIL
[3 ações específicas para aumentar a conversão global em 30%]`);
        console.log(result);
        save(path.join(dir,'reports'), `funnel_report_${date}.md`, result);
        break;
      }

      case 'conversion': {
        console.log(`CONVERSION ANALYSIS`);
        console.log(`Sessões: ${sessoes} | Conversões: ${conversoes} | Taxa: ${conv.taxa}% — ${conv.label}\n`);
        save(path.join(dir,'reports'), 'conversion_data.json', conv);
        const result = await ask(`${BASE}

TAXA DE CONVERSÃO: ${conv.taxa}% (${conv.label})
Sessões: ${sessoes} | Conversões (leads): ${conversoes}
Benchmark bom: ${CONFIG.benchmarks.conversao_lead.bom}% | Excelente: ${CONFIG.benchmarks.conversao_lead.excelente}%

# ANÁLISE DE CONVERSÃO

## STATUS ATUAL
[${conv.taxa}% — diagnóstico honesto da situação]

## PRINCIPAIS BARREIRAS DE CONVERSÃO
[O que impede mais visitantes de virar leads no site da SmartOps]

## SIMULAÇÃO DE IMPACTO
[Se a taxa sair de ${conv.taxa}% para ${CONFIG.benchmarks.conversao_lead.bom}%, quantos leads a mais por mês? E clientes?]

## TOP 5 AÇÕES PARA MELHORAR A CONVERSÃO
[Priorizadas por impacto e facilidade de implementação]

## TESTE RÁPIDO RECOMENDADO
[Uma mudança que pode ser testada em < 1 dia com potencial de dobrar a conversão]`);
        console.log(result);
        save(path.join(dir,'reports'), `conversion_report_${date}.md`, result);
        break;
      }

      case 'seo-traffic': {
        console.log(`SEO TRAFFIC ANALYSIS`);
        console.log(`Orgânico: ${organico} (${traffic.pct_organico}%) | Total: ${sessoes}`);
        console.log(`Status: ${traffic.label}\n`);
        const result = await ask(`${BASE}

TRÁFEGO ORGÂNICO: ${organico} sessões (${traffic.pct_organico}% do total)
Total de sessões: ${sessoes}
Status: ${traffic.label}

# ANÁLISE DE TRÁFEGO ORGÂNICO

## DIAGNÓSTICO DA DEPENDÊNCIA DE CANAL
[${traffic.pct_organico}% orgânico — risco de concentração e estratégia de diversificação]

## KEYWORDS COM MAIOR POTENCIAL
[As 10 keywords mais estratégicas para SmartOps em BH/MG — por intenção e volume]

## CONTEÚDO QUE MAIS TRAZ TRÁFEGO QUALIFICADO
[Que tipo de conteúdo atrai donos de PME prontos para contratar consultoria]

## PLANO DE CRESCIMENTO ORGÂNICO (90 dias)
[Ações específicas para dobrar o tráfego orgânico]

## QUICK SEO WINS
[3 melhorias técnicas simples que podem impactar o ranking em 30 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `seo_traffic_${date}.md`, result);
        break;
      }

      case 'heatmap': {
        const pagina = getArg('pagina', '/');
        const result = await ask(`${BASE}

ANÁLISE DE COMPORTAMENTO — ${pagina}

# ANÁLISE DE COMPORTAMENTO DO USUÁRIO — ${pagina}

## PADRÃO DE LEITURA
[Como os visitantes provavelmente leem esta página — F-pattern, Z-pattern, etc.]

## ELEMENTOS QUE MAIS ATRAEM ATENÇÃO
[O que os visitantes provavelmente olham primeiro — e o que deve estar lá]

## PONTOS DE ABANDONO
[Onde provavelmente saem sem converter — e por quê]

## ELEMENTOS IGNORADOS
[O que provavelmente não está sendo lido — que pode ser removido]

## MAPA DE CALOR IDEAL
[Como a página deveria ser estruturada para maximizar atenção no CTA]

## COMO IMPLEMENTAR HEATMAP REAL
[Hotjar free tier ou Microsoft Clarity — como instalar e o que monitorar]`);
        console.log(result);
        save(path.join(dir,'reports'), `heatmap_${pagina.replace(/\//g,'_')}_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Data: ${date}

# WEBSITE ANALYTICS REPORT — ${date}

## SCORECARD DO SITE
| Métrica | Atual | Benchmark | Status |
|---------|-------|-----------|--------|
| Sessões/mês | ${sessoes} | ${CONFIG.benchmarks.sessoes_mes.meta} | ${sessoes >= CONFIG.benchmarks.sessoes_mes.meta ? '🟢' : '🔴'} |
| Taxa de rejeição | ${rejeicao}% | < ${CONFIG.benchmarks.taxa_rejeicao.bom}% | ${rejeicao <= CONFIG.benchmarks.taxa_rejeicao.bom ? '🟢' : '🔴'} |
| Conversão | ${conv.taxa}% | > ${CONFIG.benchmarks.conversao_lead.bom}% | ${conv.taxa >= CONFIG.benchmarks.conversao_lead.bom ? '🟢' : '🔴'} |
| Quality Score | ${quality.score}/100 | > 70 | ${quality.score >= 70 ? '🟢' : '🔴'} |

## TOP 3 INSIGHTS
[As descobertas mais importantes sobre o comportamento dos visitantes]

## GARGALO PRINCIPAL
[Onde o site mais falha na conversão de visitantes em leads]

## PLANO DE MELHORIA SEMANAL
[3 ações práticas para esta semana]

## CONFIGURAÇÃO DE ANALYTICS RECOMENDADA
[O que configurar no GA4 para ter dados mais precisos — sem developer]`);
        console.log(result);
        save(path.join(dir,'reports'), `website_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: sessions | events | pages | funnel | conversion | seo-traffic | heatmap | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
