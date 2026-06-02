#!/usr/bin/env node
/**
 * Offer Optimization Agent — SmartOps IA
 * Design e otimização de ofertas irresistíveis
 *
 * Usage:
 *   node offer_optimization_agent.js --mode analyze --oferta "Diagnóstico Express"
 *   node offer_optimization_agent.js --mode design --problema "processo manual 30h/semana"
 *   node offer_optimization_agent.js --mode test --oferta "Sprint Automação" --conv-atual 15
 *   node offer_optimization_agent.js --mode bundle
 *   node offer_optimization_agent.js --mode guarantee --tipo satisfacao
 *   node offer_optimization_agent.js --mode urgency --tipo vagas
 *   node offer_optimization_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function scoreOffer(offer) {
  const weights = CONFIG.offer_score_weights;
  let total = 0;
  // Score simplificado baseado nos elementos da oferta
  const hasNumbers  = /R\$|\d+%|\d+ (dias|meses|clientes|horas|automações)/i.test(offer.promessa || '');
  const hasDuration = offer.entregaveis?.length >= 3;
  const hasGuarantee = !!offer.garantia;
  const hasCTA      = !!offer.cta;
  total += hasNumbers   ? weights.especificidade.weight : weights.especificidade.weight * 0.4;
  total += hasDuration  ? weights.clareza_da_promessa.weight * 0.8 : weights.clareza_da_promessa.weight * 0.4;
  total += hasGuarantee ? weights.garantia.weight : 0;
  total += hasCTA       ? weights.cta_poder.weight * 0.8 : 0;
  total += weights.credibilidade.weight * 0.5; // assume media sem dados externos
  total += weights.urgencia_escassez.weight * 0.3; // baixo por padrão
  total += weights.valor_percebido.weight * 0.6;
  return Math.min(100, Math.round(total));
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `offer_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  OFFER OPTIMIZATION AGENT — SmartOps IA         ║');
  console.log('║  "Uma oferta perfeita vende sozinha."           ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const BASE = `Você é o Offer Optimization Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Empresa: consultoria Lean + Automação IA para PMEs.
Filosofia: A oferta deve ser tão clara e valiosa que o preço pareça óbvio.`;

  try {
    switch (mode) {

      case 'analyze': {
        const ofertaNome = getArg('oferta', 'Diagnóstico Express');
        const oferta = CONFIG.current_offers.find(o => o.nome.toLowerCase().includes(ofertaNome.toLowerCase())) || CONFIG.current_offers[1];
        const score  = scoreOffer(oferta);
        console.log(`OFFER ANALYSIS — ${oferta.nome}`);
        console.log(`Score: ${score}/100`);
        console.log(`Preço: R$ ${oferta.preco.toLocaleString('pt-BR')} | Tipo: ${oferta.tipo}\n`);
        const result = await ask(`${BASE}

OFERTA ANALISADA: ${oferta.nome}
Preço: R$ ${oferta.preco.toLocaleString('pt-BR')}
Promessa: ${oferta.promessa}
Entregáveis: ${oferta.entregaveis?.join(', ')}
Garantia: ${oferta.garantia || 'Nenhuma'}
CTA: ${oferta.cta}
Score atual: ${score}/100

# ANÁLISE DA OFERTA — ${oferta.nome.toUpperCase()}

## SCORE DETALHADO (${score}/100)
${Object.entries(CONFIG.offer_score_weights).map(([k,v]) => `### ${v.desc} (peso ${v.weight}%)\n[Score e o que melhorar]`).join('\n\n')}

## TOP 3 PROBLEMAS DA OFERTA
[O que está enfraquecendo a conversão]

## OFERTA REESCRITA (versão melhorada)
Promessa: [nova]
Entregáveis: [lista melhorada]
Garantia: [nova]
CTA: [novo]

## IMPACTO ESPERADO NA CONVERSÃO
[Se implementar as melhorias, qual o impacto estimado na taxa de fechamento]`);
        console.log(result);
        save(path.join(dir,'reports'), `offer_analysis_${date}.md`, result);
        break;
      }

      case 'design': {
        const problema = getArg('problema', 'processos manuais que consomem tempo e dinheiro');
        const publico  = getArg('publico', 'dono de PME em BH');
        const result   = await ask(`${BASE}

DESIGN DE NOVA OFERTA:
Problema do cliente: ${problema}
Público-alvo: ${publico}

# DESIGN DE OFERTA — Do Zero

## DIAGNÓSTICO DO PROBLEMA
[Quantifique o problema: em R$/mês, horas/semana, % de eficiência perdida]

## PROMESSA CENTRAL (1 frase)
[O resultado específico que o cliente vai obter — com número e prazo]

## NOME DA OFERTA
[3 opções de nome que comunicam valor]

## ENTREGÁVEIS (tangibilize)
[O que o cliente recebe fisicamente/digitalmente — máx 6 itens super específicos]

## GARANTIA
[Qual garantia elimina o medo de comprar]

## PRECIFICAÇÃO
[Preço sugerido baseado no problema e no valor entregue]

## CTA PRINCIPAL
[Texto exato do botão/chamada para ação]

## PITCH DE 30 SEGUNDOS
[Como apresentar esta oferta em uma conversa — natural, sem parecer script]

## OBJEÇÕES E RESPOSTAS
[As 3 objeções mais comuns e como responder]`);
        console.log(result);
        save(path.join(dir,'reports'), `offer_design_${date}.md`, result);
        break;
      }

      case 'test': {
        const ofertaNome = getArg('oferta', 'Sprint Automação');
        const convAtual  = parseNum('conv-atual', 15);
        const result     = await ask(`${BASE}

TESTE DE OFERTA: ${ofertaNome}
Conversão atual: ${convAtual}%
Meta de melhoria: +30% na taxa de fechamento

# PLANO DE TESTE DE OFERTA — ${ofertaNome}

## VARIANTE A (controle — atual)
[Como a oferta é apresentada hoje]

## VARIANTE B (teste de promessa)
[Mudar apenas a promessa principal — copy exato]

## VARIANTE C (teste de garantia)
[Adicionar/mudar garantia — o que testar]

## VARIANTE D (teste de entregáveis)
[Adicionar/reposicionar entregáveis]

## CRITÉRIO DE DECISÃO
[Como medir qual variante é melhor — quantas reuniões/propostas/fechamentos]

## PROTOCOLO DE TESTE
[Como testar: com quem, por quanto tempo, como registrar resultado]

## IMPACTO PROJETADO
[Se sair de ${convAtual}% para ${convAtual*1.3}%, qual o impacto no MRR mensal]`);
        console.log(result);
        save(path.join(dir,'reports'), `offer_test_${date}.md`, result);
        break;
      }

      case 'bundle': {
        const ofertas = CONFIG.current_offers.filter(o => o.preco > 0);
        const result  = await ask(`${BASE}

OFERTAS DISPONÍVEIS PARA BUNDLE:
${ofertas.map(o => `- ${o.nome}: R$ ${o.preco.toLocaleString('pt-BR')}`).join('\n')}

# ESTRATÉGIA DE BUNDLE

## BUNDLE LÓGICA
[Quais combinações fazem sentido para o cliente — e por quê]

## BUNDLE 1 — STARTER PACK
[Combinação de baixo risco para o primeiro cliente — nome, preço, o que inclui]

## BUNDLE 2 — CORE PACK
[A combinação mais vendável para o cliente típico]

## BUNDLE 3 — PREMIUM PACK
[A combinação de maior valor e maior ticket]

## DESCONTO DO BUNDLE
[Percentual de desconto vs. soma individual — por que o desconto não reduz a margem]

## SEQUÊNCIA DE UPSELL
[Como levar o cliente do Bundle 1 ao Bundle 3 naturalmente]

## SCRIPT DE APRESENTAÇÃO
[Como apresentar o bundle ao cliente em reunião sem parecer forçado]`);
        console.log(result);
        save(path.join(dir,'reports'), `bundle_strategy_${date}.md`, result);
        break;
      }

      case 'guarantee': {
        const tipo   = getArg('tipo', 'satisfacao');
        const gInfo  = CONFIG.garantias.find(g => g.tipo.toLowerCase().includes(tipo)) || CONFIG.garantias[0];
        const result = await ask(`${BASE}

TIPO DE GARANTIA: ${gInfo.tipo}
Descrição: ${gInfo.desc}
Impacto estimado na conversão: ${gInfo.impacto_conv}

# ESTRATÉGIA DE GARANTIA

## GARANTIA RECOMENDADA PARA SMARTOPS
[Baseado no perfil de cliente e nos serviços — qual garantia implementar]

## COPY DA GARANTIA (3 versões)
[Texto exato para usar na proposta, site e pitch]

## COMO ESTRUTURAR A GARANTIA JURIDICAMENTE
[Condições claras, prazo, o que está e não está incluso]

## IMPACTO NA CONVERSÃO
[Dados e lógica: por que a garantia aumenta o fechamento]

## COMO COMUNICAR A GARANTIA
[Onde colocar na proposta, site e pitch — na ordem certa]

## RISCO REAL VS. RISCO PERCEBIDO
[Qual é o risco real de ativar a garantia e como mitigar]`);
        console.log(result);
        save(path.join(dir,'reports'), `guarantee_strategy_${date}.md`, result);
        break;
      }

      case 'urgency': {
        const tipo   = getArg('tipo', 'vagas');
        const trigger = CONFIG.urgency_triggers.find(t => t.tipo.toLowerCase().includes(tipo)) || CONFIG.urgency_triggers[0];
        const result = await ask(`${BASE}

GATILHO DE URGÊNCIA: ${trigger.tipo}
Exemplo: ${trigger.exemplo}

# ESTRATÉGIA DE URGÊNCIA E ESCASSEZ

## URGÊNCIA AUTÊNTICA DA SMARTOPS
[Razões genuínas pelas quais o cliente deve agir agora — sem inventar]

## IMPLEMENTAÇÃO DO GATILHO: ${trigger.tipo}
[Como comunicar: "${trigger.exemplo}" — copy completo para site, proposta e WhatsApp]

## SEQUÊNCIA DE FOLLOW-UP COM URGÊNCIA
[Mensagem 1 (após reunião) → Mensagem 2 (3 dias) → Mensagem 3 (urgência final)]

## O QUE NÃO FAZER
[Urgências falsas que destroem credibilidade — exemplos e por que evitar]

## TIMING IDEAL
[Quando introduzir urgência no processo de vendas]

## SCRIPT DE WHATSAPP (urgência)
[Mensagem exata para usar quando o lead está "pensando" há mais de 7 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `urgency_strategy_${date}.md`, result);
        break;
      }

      case 'report': {
        const scores = CONFIG.current_offers.map(o => ({ nome: o.nome, preco: o.preco, score: o.score || scoreOffer(o) }));
        scores.forEach(s => console.log(`  ${s.nome}: R$ ${s.preco.toLocaleString('pt-BR')} | Score: ${s.score}/100`));
        console.log('');
        const result = await ask(`${BASE}

PORTFÓLIO DE OFERTAS:
${scores.map(s => `- ${s.nome}: R$ ${s.preco.toLocaleString('pt-BR')} | Score ${s.score}/100`).join('\n')}

Data: ${date}

# OFFER OPTIMIZATION REPORT — ${date}

## SCORECARD DO PORTFÓLIO
[Cada oferta avaliada por: clareza, especificidade, garantia, CTA, valor percebido]

## OFERTA COM MAIOR POTENCIAL DE MELHORIA
[Qual oferta, se otimizada, teria maior impacto no faturamento]

## GAPS NO PORTFÓLIO
[O que está faltando: entry-level, mid-tier, premium — algum gap evidente?]

## TOP 3 MELHORIAS PARA IMPLEMENTAR ESTA SEMANA
[Ações específicas nas ofertas existentes]

## NOVA OFERTA RECOMENDADA
[Uma nova oferta que o mercado está pedindo e que a SmartOps pode criar agora]

## IMPACTO PROJETADO
[Se implementar as melhorias: quantas propostas a mais? Qual o impacto no MRR?]`);
        console.log(result);
        save(path.join(dir,'reports'), `offer_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: analyze | design | test | bundle | guarantee | urgency | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
