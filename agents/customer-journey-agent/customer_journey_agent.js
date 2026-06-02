#!/usr/bin/env node
/**
 * Customer Journey Agent — SmartOps IA
 * Mapeamento da jornada completa do cliente — da consciência à retenção
 *
 * Usage:
 *   node customer_journey_agent.js --mode map
 *   node customer_journey_agent.js --mode touchpoints --etapa decisao
 *   node customer_journey_agent.js --mode friction --etapa consideracao
 *   node customer_journey_agent.js --mode persona --persona dono_fabrica
 *   node customer_journey_agent.js --mode awareness
 *   node customer_journey_agent.js --mode decision
 *   node customer_journey_agent.js --mode retention
 *   node customer_journey_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcJourneyHealthScore() {
  const stages   = Object.keys(CONFIG.journey_stages);
  const friction = CONFIG.friction_points;
  const touchpts = Object.values(CONFIG.touchpoints).flat().length;
  const score    = Math.max(20, Math.min(100, (stages.length * 10) + (touchpts * 2) - (friction.length * 5)));
  const label    = score >= 80 ? 'Jornada bem mapeada' : score >= 60 ? 'Jornada parcial' : 'Jornada com gaps críticos';
  return { score, label, stages: stages.length, touchpoints: touchpts, friction_count: friction.length };
}

function getFrictionByStage(etapa) {
  return CONFIG.friction_points.filter(f => f.etapa.toLowerCase().includes(etapa.toLowerCase()));
}

function getTouchpointsByStage(etapa) {
  const stage = Object.entries(CONFIG.journey_stages).find(([k,v]) => v.nome.toLowerCase().includes(etapa.toLowerCase()));
  return stage ? stage[1].canais : [];
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `journey_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'map');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  CUSTOMER JOURNEY AGENT — SmartOps IA           ║');
  console.log('║  "O cliente não compra um serviço. Compra uma   ║');
  console.log('║   transformação."                               ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const health = calcJourneyHealthScore();
  const BASE = `Você é o Customer Journey Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Empresa: SmartOps IA — consultoria Lean + Automação IA para PMEs.
Journey Health Score: ${health.score}/100 — ${health.label}.
Personas: Jorge (dono de indústria), Ana (gestora de serviços), Rafael (empreendedor digital).
Jornada tem 5 etapas: Consciência → Consideração → Decisão → Pós-Compra → Retenção.`;

  try {
    switch (mode) {

      case 'map': {
        const stages = CONFIG.journey_stages;
        console.log('CUSTOMER JOURNEY MAP — SmartOps IA\n');
        Object.entries(stages).forEach(([k,v]) => {
          const friction = getFrictionByStage(v.nome);
          console.log(`  ${v.nome.toUpperCase()} → ${v.pergunta}`);
          if (friction.length) console.log(`    ⚠️ Fricção: ${friction[0].fricao}`);
        });
        console.log('');
        const result = await ask(`${BASE}

JORNADA COMPLETA:
${Object.entries(CONFIG.journey_stages).map(([k,v]) => `${v.nome}: "${v.pergunta}" | Canais: ${v.canais.join(', ')} | KPI: ${v.kpi}`).join('\n')}

PONTOS DE FRICÇÃO:
${CONFIG.friction_points.map(f => `[${f.etapa}] ${f.fricao} → Solução: ${f.solucao}`).join('\n')}

# CUSTOMER JOURNEY MAP — SmartOps IA

## VISÃO GERAL DA JORNADA
[Narrativa de ponta a ponta — como um cliente vai de "nunca ouvi falar" a "indicou 3 amigos"]

## ETAPA A ETAPA (detalhado)
${Object.entries(CONFIG.journey_stages).map(([k,v]) => `### ${v.nome.toUpperCase()}\n**Pergunta do cliente:** ${v.pergunta}\n**Canais:** ${v.canais.join(', ')}\n**Conteúdo certo:** ${v.conteudo.join(', ')}\n**O que a SmartOps deve fazer nesta etapa:** [detalhar]\n**KPI:** ${v.kpi}`).join('\n\n')}

## MOMENTOS DA VERDADE (make or break)
[As 3 situações onde o cliente decide ficar ou ir embora]

## MAPA VISUAL (texto)
[Representação linear da jornada com setas e pontos-chave]`);
        console.log(result);
        save(path.join(dir,'reports'), `journey_map_${date}.md`, result);
        save(path.join(dir,'reports'), 'journey_data.json', { stages: CONFIG.journey_stages, friction: CONFIG.friction_points, health });
        break;
      }

      case 'touchpoints': {
        const etapa  = getArg('etapa', 'decisao');
        const tps    = getTouchpointsByStage(etapa);
        const stage  = Object.values(CONFIG.journey_stages).find(v => v.nome.toLowerCase().includes(etapa.toLowerCase()));
        console.log(`TOUCHPOINTS — ${etapa.toUpperCase()}`);
        if (stage) {
          console.log(`  Pergunta: ${stage.pergunta}`);
          console.log(`  Canais: ${tps.join(', ')}\n`);
        }
        const result = await ask(`${BASE}

ETAPA: ${etapa.toUpperCase()}
${stage ? `Pergunta do cliente: ${stage.pergunta}
Canais ativos: ${tps.join(', ')}
Conteúdo certo: ${stage.conteudo?.join(', ')}
KPI desta etapa: ${stage.kpi}` : ''}

# ANÁLISE DE TOUCHPOINTS — ${etapa.toUpperCase()}

## MAPA DE TOUCHPOINTS
[Todos os pontos de contato possíveis nesta etapa — digital, físico, humano]

## TOUCHPOINT DE MAIOR IMPACTO
[O ponto de contato que mais influencia a decisão nesta etapa]

## QUALIDADE ATUAL DOS TOUCHPOINTS
[Como a SmartOps está se saindo em cada canal nesta etapa — nota e diagnóstico]

## OPORTUNIDADES DE MELHORIA
[O que adicionar, otimizar ou eliminar nos touchpoints desta etapa]

## SEQUÊNCIA IDEAL DE CONTATO
[A ordem certa de ativar os touchpoints para maximizar progressão]

## MENSAGEM POR CANAL
[Copy adaptada para cada canal nesta etapa — tom, formato, CTA]`);
        console.log(result);
        save(path.join(dir,'reports'), `touchpoints_${etapa}_${date}.md`, result);
        break;
      }

      case 'friction': {
        const etapa   = getArg('etapa', 'consideracao');
        const frictions = getFrictionByStage(etapa);
        const stage   = Object.values(CONFIG.journey_stages).find(v => v.nome.toLowerCase().includes(etapa.toLowerCase()));
        console.log(`FRICTION ANALYSIS — ${etapa.toUpperCase()}\n`);
        frictions.forEach(f => console.log(`  ⚠️ ${f.fricao} → ${f.solucao}`));
        console.log('');
        const result = await ask(`${BASE}

ANÁLISE DE FRICÇÃO — ${etapa.toUpperCase()}
Fricções conhecidas: ${frictions.map(f => f.fricao).join(' | ') || 'Nenhuma mapeada ainda'}
Soluções propostas: ${frictions.map(f => f.solucao).join(' | ') || 'Nenhuma'}

# FRICTION ANALYSIS — ${etapa.toUpperCase()}

## DIAGNÓSTICO DA ETAPA
[Por que os clientes travam na etapa de ${etapa}?]

## MAPA DE FRICÇÃO (completo)
[Todos os pontos de atrito possíveis nesta etapa — mesmo os não listados]

## IMPACTO DE CADA FRICÇÃO
[Para cada fricção: quantos % dos clientes desistem por causa dela?]

## SOLUÇÕES PRIORIZADAS
[Tabela: Fricção | Solução | Esforço | Impacto | Prazo]

## QUICK FIX (implementar hoje)
[A remoção de fricção mais fácil e rápida com maior impacto na progressão]

## TESTE RECOMENDADO
[Como validar se a solução funcionou — métricas antes e depois]`);
        console.log(result);
        save(path.join(dir,'reports'), `friction_${etapa}_${date}.md`, result);
        break;
      }

      case 'persona': {
        const personaKey = getArg('persona', 'dono_fabrica');
        const persona    = CONFIG.personas[personaKey] || CONFIG.personas.dono_fabrica;
        console.log(`PERSONA — ${persona.nome}\n`);
        console.log(`  Cargo: ${persona.cargo}`);
        console.log(`  Dor: ${persona.dor}`);
        console.log(`  Meta: ${persona.meta}`);
        console.log(`  Objeção: ${persona.objecao}\n`);
        const result = await ask(`${BASE}

PERSONA: ${persona.nome}
Cargo: ${persona.cargo}
Empresa: ${persona.empresa}
Dor principal: ${persona.dor}
Meta: ${persona.meta}
Objeção típica: ${persona.objecao}
Canal preferido: ${persona.canal}
Ticket: ${persona.ticket}
Perfil de decisão: ${persona.decisao}

# PERSONA DEEP DIVE — ${persona.nome.split('—')[0].trim().toUpperCase()}

## QUEM É ELA/ELE
[Retrato completo — um dia na vida desta persona]

## DOR PROFUNDA
[O que mantém ${persona.nome.split('—')[0].trim()} acordado às 3h — além da dor declarada]

## JORNADA ESPECÍFICA DESTA PERSONA
[Como ${persona.nome.split('—')[0].trim()} passa de consciência a cliente — com seus próprios canais e comportamentos]

## MENSAGEM CERTA PARA CADA ETAPA
[O que dizer em cada etapa da jornada para essa persona específica]

## COMO FECHAR ESTA PERSONA
[A abordagem certa: argumento, garantia, sequência de follow-up]

## CONTEÚDO QUE RESSOA
[Que tipo de post, vídeo, caso de sucesso faz os olhos brilharem desta persona]

## RED FLAGS (o que afasta esta persona)
[O que a SmartOps não pode fazer para não perder esta persona]`);
        console.log(result);
        save(path.join(dir,'reports'), `persona_${personaKey}_${date}.md`, result);
        break;
      }

      case 'awareness': {
        const result = await ask(`${BASE}

ETAPA: CONSCIÊNCIA
Canais: ${CONFIG.journey_stages.consciencia.canais.join(', ')}
Conteúdo que funciona: ${CONFIG.journey_stages.consciencia.conteudo.join(', ')}
KPI: ${CONFIG.journey_stages.consciencia.kpi}

# ESTRATÉGIA DE CONSCIÊNCIA — SmartOps IA

## ESTADO ATUAL
[Como a SmartOps está na etapa de consciência — alcance, visibilidade, autoridade]

## ESTRATÉGIA DE CONTEÚDO PARA CONSCIÊNCIA
[O que criar para cada persona chegar à SmartOps antes do concorrente]

## CALENDÁRIO DE CONTEÚDO (30 dias)
[4 semanas de conteúdo de consciência por canal]

## HOOKS MAIS PODEROSOS
[As 5 frases de abertura que param o scroll da persona no feed]

## SEO PARA CONSCIÊNCIA
[As keywords que as personas usam quando têm a dor mas não sabem a solução]

## DISTRIBUIÇÃO E AMPLIFICAÇÃO
[Como fazer o conteúdo de consciência chegar em mais pessoas organicamente]`);
        console.log(result);
        save(path.join(dir,'reports'), `awareness_strategy_${date}.md`, result);
        break;
      }

      case 'decision': {
        const result = await ask(`${BASE}

ETAPA: DECISÃO
Canais: ${CONFIG.journey_stages.decisao.canais.join(', ')}
Pergunta do cliente: "${CONFIG.journey_stages.decisao.pergunta}"
KPI: ${CONFIG.journey_stages.decisao.kpi}

# ESTRATÉGIA DE DECISÃO — SmartOps IA

## O QUE O CLIENTE PRECISA PARA DECIDIR
[Os 5 elementos que reduzem o risco percebido e aumentam a confiança]

## ESTRUTURA DA REUNIÃO DE DECISÃO
[Como conduzir a reunião de proposta para maximizar o fechamento]

## FOLLOW-UP PÓS-REUNIÃO
[Sequência de mensagens: 0h → 24h → 3 dias → 7 dias → 14 dias]

## COMO RESPONDER "Vou pensar"
[A resposta exata que mantém o processo vivo sem pressionar]

## PROPOSTA IRRESISTÍVEL
[Os elementos que toda proposta SmartOps deve ter para ser aceita]

## SINAIS DE COMPRA
[Como identificar que a persona está pronta para fechar]

## COMO ACELERAR A DECISÃO
[Urgência genuína e gatilhos que ajudam sem pressionar]`);
        console.log(result);
        save(path.join(dir,'reports'), `decision_strategy_${date}.md`, result);
        break;
      }

      case 'retention': {
        const result = await ask(`${BASE}

ETAPA: RETENÇÃO E ADVOCACY
Canais: ${CONFIG.journey_stages.retencao.canais.join(', ')}
KPI: ${CONFIG.journey_stages.retencao.kpi}

# ESTRATÉGIA DE RETENÇÃO E ADVOCACY

## O QUE FAZ CLIENTE CONTINUAR
[Os 3 fatores que mais impactam a decisão de renovar com a SmartOps]

## PROGRAMA DE SUCESSO DO CLIENTE
[Como garantir resultado visível nos primeiros 30/60/90 dias]

## COMUNICAÇÃO PROATIVA
[Cadência ideal de comunicação durante o projeto]

## EARLY WARNING SYSTEM
[Sinais que indicam risco de churn 30 dias antes — e como agir]

## UPSELL NATURAL
[Como apresentar o próximo serviço de forma que pareça óbvio — não vendendo]

## PROGRAMA DE INDICAÇÃO
[Como transformar clientes satisfeitos em fonte de novos leads]

## ADVOCACY (cliente promotor)
[Como criar cases de sucesso, testimonials e referências com clientes felizes]`);
        console.log(result);
        save(path.join(dir,'reports'), `retention_strategy_${date}.md`, result);
        break;
      }

      case 'report': {
        const personas   = Object.values(CONFIG.personas);
        const frictions  = CONFIG.friction_points;
        const result     = await ask(`${BASE}

Data: ${date}

PERSONAS ATIVAS: ${personas.map(p => p.nome.split('—')[0].trim()).join(', ')}
FRICÇÕES MAPEADAS: ${frictions.length}
TOUCHPOINTS ATIVOS: ${Object.values(CONFIG.touchpoints).flat().length}
JOURNEY HEALTH: ${health.score}/100

# CUSTOMER JOURNEY REPORT — ${date}

## HEALTH SCORE DA JORNADA: ${health.score}/100 — ${health.label}

## STATUS POR ETAPA
| Etapa | Canais | KPI | Status | Principal Gap |
|-------|--------|-----|--------|---------------|
${Object.entries(CONFIG.journey_stages).map(([k,v]) => `| ${v.nome} | ${v.canais.length} | ${v.kpi.split(',')[0]} | — | — |`).join('\n')}

## TOP 3 FRICÇÕES CRÍTICAS
${frictions.slice(0,3).map(f => `- **[${f.etapa}]** ${f.fricao} → ${f.solucao}`).join('\n')}

## PERSONA COM MAIOR POTENCIAL DE CONVERSÃO AGORA
[Qual das 3 personas tem o melhor fit com a oferta atual e o menor tempo de decisão]

## PLANO DE OTIMIZAÇÃO DA JORNADA (30 dias)
[As 5 ações mais impactantes para melhorar a jornada nos próximos 30 dias]

## PRÓXIMA MILESTONE DA JORNADA
[O que implementar primeiro para o maior impacto em conversão]`);
        console.log(result);
        save(path.join(dir,'reports'), `journey_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: map | touchpoints | friction | persona | awareness | decision | retention | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
