#!/usr/bin/env node
/**
 * Pricing Agent — SmartOps IA
 * Precificação estratégica baseada em valor, custo e posicionamento
 *
 * Usage:
 *   node pricing_agent.js --mode calculate --service diagnostico_express
 *   node pricing_agent.js --mode calculate --custo 500 --horas 20 --valor-cliente 30000
 *   node pricing_agent.js --mode package
 *   node pricing_agent.js --mode anchor --preco-atual 997
 *   node pricing_agent.js --mode margin --preco 2500 --custo 500
 *   node pricing_agent.js --mode competitive
 *   node pricing_agent.js --mode value --problema "perda de 30h/semana em tarefas manuais"
 *   node pricing_agent.js --mode optimize
 *   node pricing_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcCostPlus(custo, margemDesejada = 0.65) {
  const preco = custo / (1 - margemDesejada);
  const margem_rs = preco - custo;
  return { preco: Math.round(preco), custo, margem_rs: Math.round(margem_rs), margem_pct: +(margemDesejada * 100).toFixed(1) };
}

function calcValueBased(valorCliente, captureRate = 0.10) {
  const preco = valorCliente * captureRate;
  return { preco: Math.round(preco), valor_cliente: valorCliente, capture_rate: captureRate, pct_valor: +(captureRate * 100).toFixed(1) };
}

function calcMargin(preco, custo) {
  const margem_rs  = preco - custo;
  const margem_pct = preco > 0 ? (margem_rs / preco) * 100 : 0;
  const markup     = custo > 0 ? (margem_rs / custo) * 100 : 0;
  const label      = margem_pct >= 70 ? 'Excelente' : margem_pct >= 55 ? 'Boa' : margem_pct >= 40 ? 'Aceitável' : 'Insuficiente';
  return { preco, custo, margem_rs: +margem_rs.toFixed(2), margem_pct: +margem_pct.toFixed(1), markup: +markup.toFixed(1), label };
}

function calcPriceFloor(custo, horas, taxaHora = CONFIG.taxa_hora.min) {
  const custo_hora = horas * taxaHora;
  const floor = custo + custo_hora;
  return { floor: Math.round(floor), custo_materiais: custo, custo_horas: Math.round(custo_hora), horas, taxa_hora: taxaHora };
}

function getPriceRange(service) {
  const s = CONFIG.services[service];
  if (!s) return null;
  const floor = calcCostPlus(s.custo_direto, 0.40);
  const ideal = calcCostPlus(s.custo_direto, 0.70);
  const value = calcValueBased(s.valor_gerado_min, CONFIG.capture_rate.ideal);
  return { service: s.name, preco_atual: s.preco_atual, floor: floor.preco, ideal: ideal.preco, value: value.preco, margin_atual: calcMargin(s.preco_atual, s.custo_direto) };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `pricing_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  PRICING AGENT — SmartOps IA                    ║');
  console.log('║  "O preço é a mensagem."                        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const BASE = `Você é o Pricing Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Empresa: SmartOps IA — consultoria Lean + Automação IA para PMEs.
Filosofia: Preço baseado em valor gerado, não em custo. Sempre conecte o preço ao ROI do cliente.`;

  try {
    switch (mode) {

      case 'calculate': {
        const serviceKey = getArg('service', '');
        let data;
        if (serviceKey && CONFIG.services[serviceKey]) {
          const s = CONFIG.services[serviceKey];
          data = getPriceRange(serviceKey);
          console.log(`PRICING — ${s.name}`);
          console.log(`Preço atual: R$ ${s.preco_atual.toLocaleString('pt-BR')}`);
          console.log(`Piso (cost+): R$ ${data.floor.toLocaleString('pt-BR')} | Ideal: R$ ${data.ideal.toLocaleString('pt-BR')} | Value-based: R$ ${data.value.toLocaleString('pt-BR')}`);
          console.log(`Margem atual: ${data.margin_atual.margem_pct}% — ${data.margin_atual.label}\n`);
          save(path.join(dir,'reports'), 'pricing_data.json', data);
        } else {
          const custo         = parseNum('custo', 500);
          const horas         = parseNum('horas', 20);
          const valorCliente  = parseNum('valor-cliente', 30000);
          const costPlus      = calcCostPlus(custo, 0.65);
          const valueBased    = calcValueBased(valorCliente);
          const floor         = calcPriceFloor(custo, horas);
          data = { custo, horas, valor_cliente: valorCliente, floor: floor.floor, cost_plus: costPlus.preco, value_based: valueBased.preco };
          console.log(`PRICING CALCULATION`);
          console.log(`Piso mínimo: R$ ${floor.floor.toLocaleString('pt-BR')}`);
          console.log(`Cost-plus (65%): R$ ${costPlus.preco.toLocaleString('pt-BR')}`);
          console.log(`Value-based (10%): R$ ${valueBased.preco.toLocaleString('pt-BR')}\n`);
          save(path.join(dir,'reports'), 'pricing_data.json', data);
        }
        const result = await ask(`${BASE}

ANÁLISE DE PRECIFICAÇÃO:
${JSON.stringify(data, null, 2)}

# ESTRATÉGIA DE PRECIFICAÇÃO

## PREÇO RECOMENDADO
[Qual preço cobrar — com justificativa clara baseada em valor]

## POSICIONAMENTO
[Como apresentar este preço ao cliente sem gerar objeção]

## ANCORAGEM
[Como usar ancoragem para tornar o preço parecer razoável]

## SCRIPT DE APRESENTAÇÃO DO PREÇO
[Como revelar o preço na proposta — exato, direto, com confiança]

## OBJEÇÕES COMUNS E RESPOSTAS
[Top 3 objeções de preço e como responder com dados de ROI]`);
        console.log(result);
        save(path.join(dir,'reports'), `pricing_strategy_${date}.md`, result);
        break;
      }

      case 'package': {
        const servicos = Object.values(CONFIG.services);
        servicos.forEach(s => {
          const m = calcMargin(s.preco_atual, s.custo_direto);
          console.log(`  ${s.name}: R$ ${s.preco_atual.toLocaleString('pt-BR')} | Margem: ${m.margem_pct}%`);
        });
        console.log('');
        const result = await ask(`${BASE}

PORTFÓLIO ATUAL DE SERVIÇOS:
${servicos.map(s => `- ${s.name}: R$ ${s.preco_atual.toLocaleString('pt-BR')} | Custo: R$ ${s.custo_direto.toLocaleString('pt-BR')} | Horas: ${s.horas}h | Valor gerado min: R$ ${s.valor_gerado_min.toLocaleString('pt-BR')}`).join('\n')}

# ESTRATÉGIA DE PACOTES

## LADDER DE VALOR (escada de preços)
[Mostre a progressão lógica de cada serviço para o próximo]

## PACOTE STARTER (entrada de funil)
[Serviço de baixo risco para fechar o primeiro contrato — preço, entregável, promessa]

## PACOTE CORE (maior volume)
[O serviço que mais deve ser vendido — por quê e como apresentar]

## PACOTE PREMIUM (maior margem)
[A oferta de maior valor — quem compra, quando, como vender]

## BUNDLE ESPECIAL
[Uma combinação de serviços que aumenta o ticket médio sem aumentar o custo proporcionalmente]

## DESCONTO ANUAL
[Proposta de plano anual para aumentar LTV — valor, desconto, condições]`);
        console.log(result);
        save(path.join(dir,'reports'), `package_strategy_${date}.md`, result);
        break;
      }

      case 'anchor': {
        const precoAtual = parseNum('preco-atual', 997);
        const result     = await ask(`${BASE}

PREÇO ATUAL: R$ ${precoAtual.toLocaleString('pt-BR')}

# ESTRATÉGIA DE ANCORAGEM DE PREÇO

## ÂNCORA ALTA (apresentar primeiro)
[Preço premium que torna o atual parecer razoável — justificativa]

## OPÇÃO ISCA (decoy)
[Um pacote intermediário que torna o premium mais atraente]

## PREÇO PRINCIPAL
[R$ ${precoAtual.toLocaleString('pt-BR')} — como apresentar após a âncora]

## OPÇÃO ENTRY-LEVEL
[Uma versão mais barata que funciona como porta de entrada]

## SCRIPT DE APRESENTAÇÃO
[Como apresentar as 3 opções em sequência para maximizar conversão]

## FRAMING DO VALOR
[Como enquadrar R$ ${precoAtual.toLocaleString('pt-BR')} como investimento com ROI claro]`);
        console.log(result);
        save(path.join(dir,'reports'), `anchoring_${date}.md`, result);
        break;
      }

      case 'margin': {
        const preco = parseNum('preco', 2500);
        const custo = parseNum('custo', 500);
        const m     = calcMargin(preco, custo);
        console.log(`MARGIN ANALYSIS`);
        console.log(`Preço: R$ ${preco.toLocaleString('pt-BR')} | Custo: R$ ${custo.toLocaleString('pt-BR')}`);
        console.log(`Margem: ${m.margem_pct}% (R$ ${m.margem_rs.toLocaleString('pt-BR')}) — ${m.label}`);
        console.log(`Markup: ${m.markup}%\n`);
        save(path.join(dir,'reports'), 'margin_data.json', m);
        const result = await ask(`${BASE}

ANÁLISE DE MARGEM:
Preço: R$ ${preco.toLocaleString('pt-BR')}
Custo: R$ ${custo.toLocaleString('pt-BR')}
Margem bruta: ${m.margem_pct}% (R$ ${m.margem_rs.toLocaleString('pt-BR')})
Markup: ${m.markup}%
Classificação: ${m.label}

# ANÁLISE DE MARGEM — SmartOps IA

## DIAGNÓSTICO
[${m.label} — o que significa para a saúde financeira e sustentabilidade]

## BENCHMARK DO SETOR
[Margens típicas de consultoria Lean + Automação — onde a SmartOps se posiciona]

## ALAVANCAS DE MARGEM
[Como aumentar a margem: reduzir custo, aumentar preço, mudar mix de serviços]

## SIMULAÇÃO
[O que acontece se subir o preço 20%? Se reduzir o custo 15%?]

## RECOMENDAÇÃO
[Ação específica para melhorar a margem nas próximas 4 semanas]`);
        console.log(result);
        save(path.join(dir,'reports'), `margin_report_${date}.md`, result);
        break;
      }

      case 'competitive': {
        const comps = CONFIG.competitors;
        Object.entries(comps).forEach(([k, v]) => {
          console.log(`  ${k}: R$ ${v.preco_min.toLocaleString('pt-BR')} — R$ ${v.preco_max.toLocaleString('pt-BR')} | ${v.diferencial}`);
        });
        console.log('');
        const result = await ask(`${BASE}

MERCADO CONCORRENTE BH:
${Object.entries(comps).map(([k,v]) => `- ${k}: R$ ${v.preco_min}–${v.preco_max} | Diferencial: ${v.diferencial}`).join('\n')}

Preços SmartOps IA:
${Object.values(CONFIG.services).map(s => `- ${s.name}: R$ ${s.preco_atual}`).join('\n')}

# ANÁLISE COMPETITIVA DE PREÇO

## POSICIONAMENTO ATUAL
[Onde a SmartOps está na escala de preço vs. mercado — barato, médio ou premium?]

## JUSTIFICATIVA DO PREÇO PREMIUM
[Por que a SmartOps pode cobrar mais que freelancers e consultores tradicionais]

## GAPS DE OPORTUNIDADE
[Onde existe espaço para aumentar preços sem perder clientes]

## ESTRATÉGIA DE DIFERENCIAÇÃO POR PREÇO
[Como usar o preço como comunicação de posicionamento — "caro mas vale"]

## RESPOSTA À OBJEÇÃO "O CONCORRENTE COBRA MENOS"
[Script exato para responder quando o cliente compara preços com o mercado]`);
        console.log(result);
        save(path.join(dir,'reports'), `competitive_pricing_${date}.md`, result);
        break;
      }

      case 'value': {
        const problema = getArg('problema', 'processo manual ineficiente');
        const result   = await ask(`${BASE}

PROBLEMA DO CLIENTE: ${problema}

# CÁLCULO DE VALOR BASEADO EM PROBLEMA

## QUANTIFICAÇÃO DO PROBLEMA
[Traduza "${problema}" em R$/mês perdidos — horas × taxa, retrabalho, oportunidade perdida]

## VALOR GERADO PELA SOLUÇÃO
[Estimativa conservadora, realista e otimista de ganho em 12 meses]

## PREÇO JUSTO (capture rate 10%)
[Quanto cobrar pelo valor gerado — com justificativa]

## ROI DO CLIENTE
[Tabela: Investimento vs. Ganho em 3/6/12 meses]

## SCRIPT DE APRESENTAÇÃO DE VALOR
[Como apresentar o problema, a solução e o ROI ao cliente — na ordem certa]

## GARANTIA DE RESULTADO
[Como estruturar uma garantia que reduz o risco percebido e justifica o preço]`);
        console.log(result);
        save(path.join(dir,'reports'), `value_analysis_${date}.md`, result);
        break;
      }

      case 'optimize': {
        const result = await ask(`${BASE}

Portfólio completo:
${Object.values(CONFIG.services).map(s => {
  const m = calcMargin(s.preco_atual, s.custo_direto);
  return `- ${s.name}: R$ ${s.preco_atual} | Margem ${m.margem_pct}% | Tipo: ${s.tipo || 'projeto'}`;
}).join('\n')}

# OTIMIZAÇÃO DE PORTFÓLIO E PREÇOS

## DIAGNÓSTICO DO PORTFÓLIO
[Qual serviço ganha mais, qual tem mais margem, qual fecha mais facilmente]

## OPORTUNIDADES DE REPRICING
[Quais serviços estão subprecificados e quanto podem subir sem prejudicar vendas]

## MIX IDEAL DE RECEITA
[Qual combinação de serviços gera a maior receita com a melhor margem]

## NOVO SERVIÇO RECOMENDADO
[Uma lacuna no portfólio que poderia ser preenchida para aumentar LTV]

## PLANO DE IMPLEMENTAÇÃO
[Como ajustar os preços gradualmente sem perder clientes existentes]

## PROJEÇÃO DE IMPACTO
[Se otimizar os preços: impacto no MRR em 1, 3 e 6 meses]`);
        console.log(result);
        save(path.join(dir,'reports'), `pricing_optimization_${date}.md`, result);
        break;
      }

      case 'report': {
        const servicos = Object.values(CONFIG.services).map(s => {
          const m = calcMargin(s.preco_atual, s.custo_direto);
          return { ...s, margem: m };
        });
        const result = await ask(`${BASE}

Data: ${date}

PORTFÓLIO:
${servicos.map(s => `- ${s.name}: R$ ${s.preco_atual} | Margem ${s.margem.margem_pct}% | ${s.margem.label}`).join('\n')}

# PRICING INTELLIGENCE REPORT — ${date}

## HEALTH DO PORTFÓLIO
[Score de precificação 0-100 — cada serviço avaliado]

## ANÁLISE POR SERVIÇO
[Para cada serviço: preço atual, margem, gap para o ideal, recomendação]

## OPORTUNIDADE DE RECEITA IMEDIATA
[O ajuste de preço mais simples e rápido para aumentar o MRR]

## ESTRATÉGIA NEXT 90 DIAS
[Como evoluir a estratégia de preço para atingir MRR de R$ ${CONFIG.metas.mrr_meta.toLocaleString('pt-BR')}]

## TOP 3 DECISÕES DE PRICING PARA O CEO
[As 3 decisões mais importantes sobre preço que o CEO deve tomar]`);
        console.log(result);
        save(path.join(dir,'reports'), `pricing_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: calculate | package | anchor | margin | competitive | value | optimize | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
