#!/usr/bin/env node
/**
 * Kaizen Agent — SmartOps IA
 * Eventos de melhoria contínua, PDCA, resultados e celebração
 *
 * Usage:
 *   node kaizen_agent.js --mode event --area vendas --tipo rapid_improvement
 *   node kaizen_agent.js --mode plan --problema "lead time de proposta 4h" --meta "1h"
 *   node kaizen_agent.js --mode pdca --fase P --acao "criar template de proposta"
 *   node kaizen_agent.js --mode track --melhoria "template proposta" --baseline 240 --atual 60 --unidade "minutos"
 *   node kaizen_agent.js --mode results --economia-mensal 3000 --horas-economizadas 20
 *   node kaizen_agent.js --mode celebrate --melhoria "redução 75% tempo proposta"
 *   node kaizen_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcKaizenROI(economiaAnual, custoImplementacao) {
  if (!custoImplementacao) return { roi_pct: 0, payback_dias: 0, label: 'Sem custo' };
  const roi = ((economiaAnual - custoImplementacao) / custoImplementacao) * 100;
  const payback = Math.round((custoImplementacao / economiaAnual) * 365);
  return { roi_pct: +roi.toFixed(1), payback_dias: payback, label: roi >= 300 ? 'Excelente' : roi >= 100 ? 'Bom' : 'Marginal' };
}

function calcImprovement(baseline, atual) {
  if (!baseline) return { reducao_pct: 0, label: 'Sem baseline' };
  const pct = ((baseline - atual) / baseline) * 100;
  return { reducao_pct: +pct.toFixed(1), label: pct >= 50 ? 'Transformacional' : pct >= 25 ? 'Significativo' : pct >= 10 ? 'Incremental' : 'Mínimo' };
}

function getPDCAPlan(fase, acao) {
  const faseInfo = CONFIG.pdca[fase.toUpperCase()] || CONFIG.pdca['P'];
  return { fase: fase.toUpperCase(), nome: faseInfo.name, atividades: faseInfo.atividades, acao };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `kaizen_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  KAIZEN AGENT — SmartOps IA                     ║');
  console.log('║  "Pequenas melhorias todos os dias."            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const BASE = `Você é o Kaizen Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Empresa: SmartOps IA — consultoria Lean + Automação IA para PMEs.
Filosofia: Toda melhoria, por menor que seja, conta. Sustentabilidade é mais importante que velocidade.`;

  try {
    switch (mode) {

      case 'event': {
        const area = getArg('area', 'operacoes');
        const tipo = getArg('tipo', 'rapid_improvement');
        const tipoInfo = CONFIG.event_types[tipo] || CONFIG.event_types.rapid_improvement;
        const areaInfo = CONFIG.improvement_areas[area] || CONFIG.improvement_areas.operacoes;
        console.log(`KAIZEN EVENT — ${area} | Tipo: ${tipo} (${tipoInfo.duration_days} dias)\n`);
        const result = await ask(`${BASE}

KAIZEN EVENT:
Área: ${areaInfo.name}
Tipo: ${tipo} — ${tipoInfo.focus}
Duração: ${tipoInfo.duration_days} dias
KPIs da área: ${areaInfo.kpis.join(', ')}

# KAIZEN EVENT PLAN — ${areaInfo.name.toUpperCase()}

## ESCOPO DO EVENTO
[Processo específico a melhorar, limites e o que está fora do escopo]

## EQUIPE
[Papéis necessários: facilitador, dono do processo, especialistas, operadores]

## AGENDA DO EVENTO (${tipoInfo.duration_days} dia(s))
[Hora a hora: atividade, ferramenta, responsável, output esperado]

## ESTADO ATUAL (AS IS)
[Como o processo funciona hoje — pontos de desperdício identificados]

## ESTADO FUTURO (TO BE)
[Como o processo deve funcionar após o evento]

## METAS MENSURÁVEIS
[3 métricas com: baseline esperado → meta após evento]

## FERRAMENTAS A USAR
[${CONFIG.ferramentas.slice(0,5).join(', ')}]

## PLANO DE SUSTENTAÇÃO (30/60/90 dias)
[Como garantir que a melhoria não regride]`);
        console.log(result);
        save(path.join(dir,'reports'), `kaizen_event_${area}_${date}.md`, result);
        break;
      }

      case 'plan': {
        const problema = getArg('problema', 'ineficiência no processo');
        const meta     = getArg('meta', '50% redução');
        const result   = await ask(`${BASE}

PLANEJAMENTO KAIZEN:
Problema: ${problema}
Meta: ${meta}

# PLANO KAIZEN — ${problema.toUpperCase()}

## DEFINIÇÃO DO PROBLEMA (A3 Resumido)
[Situação atual → situação desejada → gap a fechar]

## ANÁLISE DE CAUSA-RAIZ
[5 Porquês aplicado ao problema]

## SOLUÇÕES KAIZEN (brainstorming estruturado)
[10 ideias de melhoria — da mais simples à mais complexa]

## TOP 3 AÇÕES PRIORIZADAS (por impacto × facilidade)
[Para cada: o que fazer, quem, quando, como medir, custo estimado]

## QUICK WINS (implementar em < 2 dias)
[O que pode ser feito imediatamente sem recursos adicionais]

## CRONOGRAMA PDCA
| Fase | Ação | Prazo | Responsável |
|------|------|-------|-------------|

## KPIs E META
[Métricas antes → meta → como medir]`);
        console.log(result);
        save(path.join(dir,'reports'), `kaizen_plan_${date}.md`, result);
        break;
      }

      case 'pdca': {
        const fase = getArg('fase', 'P');
        const acao = getArg('acao', 'melhoria do processo');
        const pdca = getPDCAPlan(fase, acao);
        console.log(`PDCA — Fase ${pdca.fase}: ${pdca.nome}`);
        console.log(`Ação: ${acao}\n`);
        const result = await ask(`${BASE}

CICLO PDCA:
Fase: ${pdca.fase} — ${pdca.nome}
Ação em andamento: ${acao}
Atividades desta fase: ${pdca.atividades.join(', ')}

# PDCA — FASE ${pdca.fase}: ${pdca.nome.toUpperCase()}

## CONTEXTO DA AÇÃO
[${acao} — por que esta ação foi selecionada]

## EXECUÇÃO DA FASE ${pdca.fase}
[Passo a passo detalhado para executar esta fase perfeitamente]

## CHECKLIST DE CONCLUSÃO
[O que precisa estar feito antes de avançar para a próxima fase]

## RISCOS DESTA FASE
[O que pode dar errado e como prevenir]

## PRÓXIMA FASE: ${pdca.fase === 'A' ? 'Reinício do ciclo' : Object.keys(CONFIG.pdca)[Object.keys(CONFIG.pdca).indexOf(pdca.fase) + 1]}
[O que preparar agora para facilitar a próxima fase]`);
        console.log(result);
        save(path.join(dir,'reports'), `pdca_${fase}_${date}.md`, result);
        break;
      }

      case 'track': {
        const melhoria = getArg('melhoria', 'melhoria kaizen');
        const baseline = parseNum('baseline', 100);
        const atual    = parseNum('atual', 70);
        const unidade  = getArg('unidade', 'unidade');
        const imp      = calcImprovement(baseline, atual);
        console.log(`TRACK — ${melhoria}`);
        console.log(`Baseline: ${baseline} ${unidade} → Atual: ${atual} ${unidade}`);
        console.log(`Redução: ${imp.reducao_pct}% — ${imp.label}\n`);
        const result = await ask(`${BASE}

TRACKING DE MELHORIA KAIZEN:
Melhoria: ${melhoria}
Baseline: ${baseline} ${unidade}
Resultado atual: ${atual} ${unidade}
Redução: ${imp.reducao_pct}% (${imp.label})

# TRACKING KAIZEN — ${melhoria.toUpperCase()}

## RESULTADO ALCANÇADO
[${imp.reducao_pct}% de melhoria — contexto e significado]

## ANÁLISE: SUSTENTADO OU ACIDENTE?
[Fatores que explicam o resultado — melhoria real ou variação normal?]

## COMPARAÇÃO COM META
[Distância da meta e trajetória atual]

## PRÓXIMOS PASSOS
[Sustentação | Ajuste | Nova rodada PDCA]

## APRENDIZADOS
[O que este resultado ensina para futuros kaikens]`);
        console.log(result);
        save(path.join(dir,'reports'), `kaizen_track_${date}.md`, result);
        break;
      }

      case 'results': {
        const economiaMensal  = parseNum('economia-mensal', 0);
        const horasEconomizadas = parseNum('horas-economizadas', 0);
        const custoImplementacao = parseNum('custo-impl', 500);
        const roi = calcKaizenROI(economiaMensal * 12, custoImplementacao);
        console.log(`KAIZEN RESULTS`);
        console.log(`Economia mensal: R$ ${economiaMensal.toLocaleString('pt-BR')}`);
        console.log(`Horas economizadas/mês: ${horasEconomizadas}h`);
        console.log(`ROI: ${roi.roi_pct}% | Payback: ${roi.payback_dias} dias | ${roi.label}\n`);
        const result = await ask(`${BASE}

RESULTADOS DO EVENTO KAIZEN:
Economia mensal: R$ ${economiaMensal.toLocaleString('pt-BR')}
Economia anual estimada: R$ ${(economiaMensal*12).toLocaleString('pt-BR')}
Horas economizadas/mês: ${horasEconomizadas}h
Custo de implementação: R$ ${custoImplementacao.toLocaleString('pt-BR')}
ROI: ${roi.roi_pct}% | Payback: ${roi.payback_dias} dias | ${roi.label}

# RESULTADOS KAIZEN — RELATÓRIO DE IMPACTO

## HEADLINE DO RESULTADO
[Uma frase poderosa sobre o que foi conquistado]

## BENEFÍCIOS QUANTIFICADOS
[Tabela completa: métricas antes → depois → melhoria]

## ROI DO EVENTO
[${roi.roi_pct}% em ${roi.payback_dias} dias — análise detalhada]

## IMPACTO NO NEGÓCIO
[Como esta melhoria afeta o cliente, a equipe e a competitividade]

## LIÇÕES APRENDIDAS
[O que funcionou, o que não funcionou, o que fazer diferente]

## PRÓXIMO KAIZEN RECOMENDADO
[Qual área atacar agora baseado nos aprendizados]`);
        console.log(result);
        save(path.join(dir,'reports'), `kaizen_results_${date}.md`, result);
        break;
      }

      case 'celebrate': {
        const melhoria = getArg('melhoria', 'grande melhoria alcançada');
        const result   = await ask(`${BASE}

MELHORIA ALCANÇADA: ${melhoria}

Crie uma comunicação de celebração motivadora para compartilhar com a equipe e nas redes sociais da SmartOps IA.

# 🏆 CELEBRAÇÃO KAIZEN

## CONQUISTA
[${melhoria} — descrição impactante do que foi alcançado]

## PARA A EQUIPE (mensagem WhatsApp)
[Mensagem calorosa, motivadora, que reconhece o esforço e inspira continuidade — máx 5 linhas]

## PARA LINKEDIN (post)
[Post profissional com dados reais, 3-5 parágrafos, hashtags Lean Six Sigma]

## PARA INSTAGRAM (legenda)
[Legenda visual, engajante, que conta a história da melhoria — máx 150 palavras]

## PRÓXIMO DESAFIO
[Como seguir o momento positivo com o próximo evento kaizen]`);
        console.log(result);
        save(path.join(dir,'reports'), `kaizen_celebrate_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Gere o Kaizen Monthly Report da SmartOps IA.
Data: ${date}

# KAIZEN MONTHLY REPORT — ${date}

## SCORECARD DO MÊS
| KPI | Meta | Realizado | Status |
|-----|------|-----------|--------|
| Eventos kaizen | ${CONFIG.benchmarks.eventos_por_trimestre_min}/trimestre | ? | — |
| Melhoria média | ${CONFIG.benchmarks.melhoria_min_pct}% | ? | — |

## EVENTOS KAIZEN DO MÊS
[Lista de eventos realizados com: área, tipo, resultado, ROI]

## TOP 3 MELHORIAS DO MÊS
[Com dados quantificados: antes → depois → impacto financeiro]

## CULTURA KAIZEN
[Score de 0-10 para: engajamento da equipe, velocidade de melhoria, sustentação]

## PIPELINE DE MELHORIAS (próximo mês)
[Top 5 oportunidades identificadas por ROI esperado]

## RECOMENDAÇÃO ESTRATÉGICA
[Uma ação de alto impacto para acelerar a cultura kaizen na SmartOps]`);
        console.log(result);
        save(path.join(dir,'reports'), `kaizen_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: event | plan | pdca | track | results | celebrate | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
