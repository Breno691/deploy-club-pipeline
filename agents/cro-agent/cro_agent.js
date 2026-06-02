#!/usr/bin/env node
/**
 * CRO Agent — SmartOps IA
 * Otimização de conversão, landing pages, funis e A/B tests
 *
 * Usage:
 *   node cro_agent.js --mode audit --url /diagnostico-gratuito
 *   node cro_agent.js --mode funnel --visitantes 500 --leads 8 --reunioes 3 --clientes 1
 *   node cro_agent.js --mode landing --url /diagnostico-gratuito
 *   node cro_agent.js --mode ab-test --elemento headline --pagina /home
 *   node cro_agent.js --mode cta --pagina /diagnostico-gratuito
 *   node cro_agent.js --mode form --campos "nome,email,telefone,empresa,problema"
 *   node cro_agent.js --mode heatmap --pagina /home
 *   node cro_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcFunnelMetrics(visitantes, leads, reunioes, propostas, clientes) {
  const conv_lead     = visitantes  > 0 ? (leads     / visitantes)  * 100 : 0;
  const conv_reuniao  = leads       > 0 ? (reunioes  / leads)       * 100 : 0;
  const conv_proposta = reunioes    > 0 ? (propostas / reunioes)    * 100 : 0;
  const conv_cliente  = propostas   > 0 ? (clientes  / propostas)   * 100 : 0;
  const conv_total    = visitantes  > 0 ? (clientes  / visitantes)  * 100 : 0;
  return { visitantes, leads, reunioes, propostas, clientes, conv_lead: +conv_lead.toFixed(2), conv_reuniao: +conv_reuniao.toFixed(1), conv_proposta: +conv_proposta.toFixed(1), conv_cliente: +conv_cliente.toFixed(1), conv_total: +conv_total.toFixed(3) };
}

function assessFunnelStage(stage, taxa) {
  const bench = CONFIG.benchmarks;
  if (stage === 'lead')     return taxa >= bench.landing_page_visitante_lead.excelente ? '🟢' : taxa >= bench.landing_page_visitante_lead.ideal ? '🟡' : '🔴';
  if (stage === 'reuniao')  return taxa >= bench.lead_reuniao.excelente ? '🟢' : taxa >= bench.lead_reuniao.ideal ? '🟡' : '🔴';
  if (stage === 'cliente')  return taxa >= bench.proposta_cliente.excelente ? '🟢' : taxa >= bench.proposta_cliente.ideal ? '🟡' : '🔴';
  return '🟡';
}

function calcSampleSize(baseline_pct, mde_pct, confidence = 0.95) {
  // Aproximação para tamanho de amostra A/B test
  const z = confidence >= 0.95 ? 1.96 : 1.645;
  const p = baseline_pct / 100;
  const delta = mde_pct / 100;
  const n = Math.ceil((2 * z * z * p * (1 - p)) / (delta * delta));
  return { n_por_variante: n, n_total: n * 2, dias_estimados: Math.ceil((n * 2) / 20) };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `cro_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  CRO AGENT — SmartOps IA                        ║');
  console.log('║  "Converter mais sem gastar mais."              ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const BASE = `Você é o CRO Agent da SmartOps IA — especialista em otimização de conversão.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Site da SmartOps: consultoria Lean + Automação IA.
Público: donos de PME em BH/MG que sofrem com processos ineficientes.
Benchmarks: visitante→lead 3-10%, lead→reunião 20-50%, proposta→cliente 15-30%.`;

  try {
    switch (mode) {

      case 'funnel': {
        const visitantes = parseNum('visitantes', 180);
        const leads      = parseNum('leads', 4);
        const reunioes   = parseNum('reunioes', 2);
        const propostas  = parseNum('propostas', 1);
        const clientes   = parseNum('clientes', 0);
        const f = calcFunnelMetrics(visitantes, leads, reunioes, propostas, clientes);
        console.log('FUNIL DE CONVERSÃO SmartOps IA\n');
        console.log(`  Visitantes → Leads:     ${f.conv_lead}%  ${assessFunnelStage('lead', f.conv_lead)} (meta 3-10%)`);
        console.log(`  Leads → Reuniões:       ${f.conv_reuniao}%  ${assessFunnelStage('reuniao', f.conv_reuniao)} (meta 20-50%)`);
        console.log(`  Reuniões → Propostas:   ${f.conv_proposta}%  (meta 50-90%)`);
        console.log(`  Propostas → Clientes:   ${f.conv_cliente}%  ${assessFunnelStage('cliente', f.conv_cliente)} (meta 15-30%)`);
        console.log(`  Conversão Total:        ${f.conv_total}%\n`);
        save(path.join(dir,'reports'), 'funnel_data.json', f);
        const result = await ask(`${BASE}

DADOS DO FUNIL:
${JSON.stringify(f, null, 2)}

# ANÁLISE DE FUNIL DE CONVERSÃO

## DIAGNÓSTICO DO FUNIL
[Qual etapa é o maior gargalo? Por quê?]

## ANÁLISE POR ETAPA
[Para cada etapa: taxa atual, benchmark, gap, causa provável, ação]

## PRIORIDADE DE OTIMIZAÇÃO
[Onde otimizar primeiro para impacto máximo? (regra da etapa mais fraca)]

## QUICK WINS (implementar esta semana)
[3 ações que podem melhorar o funil sem investimento adicional]

## SIMULAÇÃO DE IMPACTO
[Se melhorar a pior etapa em 50%, qual o impacto em clientes/receita mensal?]

## PLANO 30 DIAS
[Ações por semana para otimizar o funil e atingir a meta de ${CONFIG.funnel_stages.find(s=>s.stage==='Cliente')?.meta || 2} clientes/mês]`);
        console.log(result);
        save(path.join(dir,'reports'), `funnel_analysis_${date}.md`, result);
        break;
      }

      case 'audit': {
        const url = getArg('url', '/');
        const pagina = CONFIG.key_pages.find(p => p.page === url) || { page: url, nome: url, tipo: 'geral' };
        const result = await ask(`${BASE}

AUDITORIA CRO DA PÁGINA: ${pagina.nome} (${url})
Tipo: ${pagina.tipo}
Meta de conversão: ${pagina.meta_conv ? pagina.meta_conv + '%' : 'indefinida'}

# AUDITORIA CRO — ${pagina.nome.toUpperCase()}

## SCORE DE CONVERSÃO ESTIMADO: [X/100]
[Baseado nos elementos críticos de CRO]

## ANÁLISE DOS ELEMENTOS CRÍTICOS
${Object.entries(CONFIG.cro_elements).map(([k,v]) => `### ${v.desc}\n[Status, problema e melhoria específica]`).join('\n\n')}

## TOP 3 PROBLEMAS DE CONVERSÃO
[Os maiores inibidores de conversão nesta página]

## PLANO DE OTIMIZAÇÃO PRIORIZADO
[Tabela: Elemento | Problema | Solução | Impacto Esperado | Esforço | Prazo]

## TESTE A/B RECOMENDADO
[Qual elemento testar primeiro e como estruturar o teste]`);
        console.log(result);
        save(path.join(dir,'reports'), `cro_audit_${url.replace(/\//g,'_')}_${date}.md`, result);
        break;
      }

      case 'landing': {
        const url = getArg('url', '/diagnostico-gratuito');
        const result = await ask(`${BASE}

ANÁLISE DE LANDING PAGE: ${url}

# LANDING PAGE CRO REPORT — ${url}

## ESTRUTURA IDEAL (Above the Fold)
[O que o visitante deve ver nos primeiros 3 segundos sem scroll]

## HEADLINE RECOMENDADA
[3 opções de headline para testar — foco no resultado do cliente]

## SUBHEADLINE
[Complementa a headline com prova ou especificidade]

## CORPO DA PÁGINA (estrutura completa)
[Hero → Problema → Solução → Prova → Oferta → CTA → FAQ → CTA final]

## CTA PRINCIPAL
[Texto exato, posicionamento, cor recomendada]

## ELEMENTOS DE PROVA SOCIAL
[O que incluir para aumentar credibilidade imediatamente]

## FORMULÁRIO IDEAL
[Quantos campos, quais campos, placeholder, botão submit]

## OBJEÇÕES A ANTECIPAR
[As 5 objeções mais comuns de visitantes e como endereçar na página]

## COPYWRITING COMPLETO (seção Hero)
[Copy pronta para implementar — headline, subheadline, bullet points, CTA]`);
        console.log(result);
        save(path.join(dir,'reports'), `landing_page_${date}.md`, result);
        break;
      }

      case 'ab-test': {
        const elemento = getArg('elemento', 'headline');
        const pagina   = getArg('pagina', '/');
        const baseline = parseNum('baseline', 3.0);
        const mde      = parseNum('mde', 30);
        const sample   = calcSampleSize(baseline, mde);
        console.log(`A/B TEST — ${elemento} em ${pagina}`);
        console.log(`Baseline: ${baseline}% | MDE: ${mde}% de melhoria`);
        console.log(`Amostra necessária: ${sample.n_por_variante} por variante (${sample.n_total} total)`);
        console.log(`Duração estimada: ~${sample.dias_estimados} dias\n`);
        const result = await ask(`${BASE}

TESTE A/B:
Elemento: ${elemento}
Página: ${pagina}
Taxa atual (baseline): ${baseline}%
Melhoria mínima detectável: ${mde}%
Amostra necessária: ${sample.n_total} visitantes (${sample.dias_estimados} dias estimados)

# PLANO DE TESTE A/B — ${elemento.toUpperCase()}

## HIPÓTESE
[H0 e H1 do teste — o que esperamos provar]

## CONTROLE (Variante A — atual)
[Como o elemento está hoje]

## VARIANTE B
[O que mudar — copy exato, design, posicionamento]

## VARIANTE C (opcional)
[Se fizer sentido testar uma terceira opção]

## CRITÉRIO DE SUCESSO
[Qual métrica mede o sucesso? Qual uplift mínimo para declarar vencedor?]

## CONFIGURAÇÃO DO TESTE
[Como configurar — ferramentas, segmentação, split %]

## RISCOS E CUIDADOS
[O que pode invalidar o teste e como evitar]

## ANÁLISE PÓS-TESTE
[O que fazer com os resultados — quando aplicar, quando reprovar]`);
        console.log(result);
        save(path.join(dir,'reports'), `ab_test_${elemento}_${date}.md`, result);
        break;
      }

      case 'cta': {
        const pagina = getArg('pagina', '/diagnostico-gratuito');
        const result = await ask(`${BASE}

OTIMIZAÇÃO DE CTA para página: ${pagina}
Exemplos de CTAs da SmartOps: ${CONFIG.cro_elements.cta.exemplos.join(' | ')}

# CTA OPTIMIZATION REPORT

## DIAGNÓSTICO DO CTA ATUAL
[Problemas típicos: vago, passivo, focado em nós e não no cliente]

## 5 VARIAÇÕES DE CTA PARA TESTAR
[Cada uma com: texto exato + justificativa psicológica + quando usar]

## POSICIONAMENTO IDEAL
[Onde colocar o CTA na página — above the fold, no final, em sticky bar?]

## DESIGN DO BOTÃO
[Cor recomendada, tamanho, contraste, bordas, ícone]

## MICRO-COPY (texto auxiliar)
[Texto abaixo do botão que reduz o medo de clicar]

## MOBILE VS DESKTOP
[Como adaptar o CTA para mobile onde há 60%+ do tráfego]

## TESTE RECOMENDADO
[Qual variação de CTA testar primeiro e por quê]`);
        console.log(result);
        save(path.join(dir,'reports'), `cta_optimization_${date}.md`, result);
        break;
      }

      case 'form': {
        const campos  = getArg('campos', 'nome,email,telefone,empresa,problema');
        const lista   = campos.split(',').map(c => c.trim());
        const result  = await ask(`${BASE}

FORMULÁRIO ATUAL: ${lista.length} campos — [${lista.join(', ')}]

# OTIMIZAÇÃO DE FORMULÁRIO

## DIAGNÓSTICO
[${lista.length} campos é muito? O que pode ser eliminado ou movido para depois?]

## CAMPOS ESSENCIAIS (máx 3 para primeira conversão)
[Quais são absolutamente necessários neste primeiro momento?]

## FORMULÁRIO OTIMIZADO
[Campo por campo: label, placeholder, tipo (text/email/tel), obrigatório]

## SEQUÊNCIA DE PERGUNTAS
[A ordem psicológica certa — do mais fácil ao mais pessoal]

## MICROCOPY DO FORMULÁRIO
[Texto de privacidade, texto do botão, mensagem de confirmação]

## MULTI-STEP FORM (se fizer sentido)
[Como dividir em etapas para aumentar o engajamento progressivo]

## IMPACTO ESTIMADO
[Se reduzir de ${lista.length} para 3 campos, qual o impacto esperado na conversão?]`);
        console.log(result);
        save(path.join(dir,'reports'), `form_optimization_${date}.md`, result);
        break;
      }

      case 'heatmap': {
        const pagina = getArg('pagina', '/');
        const result = await ask(`${BASE}

ANÁLISE DE HEATMAP (simulada) para: ${pagina}

Com base em padrões comportamentais típicos para sites de consultoria B2B:

# ANÁLISE DE HEATMAP — ${pagina}

## PADRÕES DE LEITURA ESPERADOS
[F-pattern, Z-pattern, ou outro — o que esperar para este tipo de página]

## ZONAS QUENTES (alta atenção)
[Onde os olhos e cliques devem se concentrar — e o que colocar lá]

## ZONAS FRIAS (baixa atenção)
[Onde os visitantes perdem interesse — o que remover ou reestruturar]

## SCROLL DEPTH ESPERADO
[Até onde os visitantes chegam — onde está o abandono crítico]

## ELEMENTOS MAIS CLICADOS
[O que provavelmente recebe mais cliques — e se é o CTA certo]

## RECOMENDAÇÕES BASEADAS NO COMPORTAMENTO
[6 melhorias específicas baseadas nos padrões de heatmap]

## CONFIGURAÇÃO DE RASTREAMENTO REAL
[Como configurar Hotjar/Microsoft Clarity/GA4 para obter dados reais]`);
        console.log(result);
        save(path.join(dir,'reports'), `heatmap_analysis_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Data: ${date}

# CRO WEEKLY REPORT — ${date}

## SCORECARD DE CONVERSÃO
| Etapa | Taxa Atual | Benchmark | Status | Prioridade |
|-------|-----------|-----------|--------|------------|
| Visitante → Lead | ? | 3-10% | — | ALTA |
| Lead → Reunião | ? | 20-50% | — | ALTA |
| Proposta → Cliente | ? | 15-30% | — | ALTA |

## TOP 3 GARGALOS DE CONVERSÃO
[Os maiores inibidores de conversão identificados]

## TESTES A/B EM ANDAMENTO
[Status de cada teste, dias restantes, resultado parcial]

## QUICK WINS DA SEMANA
[3 ações que podem ser implementadas em < 2h com impacto imediato]

## IMPACTO EM RECEITA
[Se a taxa de conversão visitante→cliente subir de X% para Y%, qual o impacto no MRR?]

## PLANO DE TESTES PRÓXIMOS 30 DIAS
[Calendário de testes priorizados por impacto esperado]`);
        console.log(result);
        save(path.join(dir,'reports'), `cro_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: audit | funnel | landing | ab-test | cta | form | heatmap | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
