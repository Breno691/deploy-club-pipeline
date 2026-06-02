#!/usr/bin/env node
/**
 * Copywriter Agent — SmartOps IA
 * Copy, hooks, scripts, CTAs, reels e conteúdo de conversão
 *
 * Usage:
 *   node copywriter_agent.js --mode hook --tema "automação de processos"
 *   node copywriter_agent.js --mode caption --tema "8 desperdícios" --plataforma instagram
 *   node copywriter_agent.js --mode cta --servico "diagnostico-express"
 *   node copywriter_agent.js --mode vsl --servico "lean-melhoria"
 *   node copywriter_agent.js --mode email --tipo nurture
 *   node copywriter_agent.js --mode reel --tema "retrabalho custa caro"
 *   node copywriter_agent.js --mode headline --produto "diagnostico"
 *   node copywriter_agent.js --mode ad-copy --canal meta --objetivo conversao
 *   node copywriter_agent.js --mode thread --tema "melhoria continua"
 *   node copywriter_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `copy_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Copywriter Agent da SmartOps IA — especialista em copy de conversão, storytelling e marketing digital.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Consultoria: Lean, Automação e IA para PMEs em BH.

REGRAS DE COPY:
- Nunca genérico. Sempre específico, concreto, com dado ou resultado.
- Linguagem: direta, sem jargão corporativo, brasileira natural.
- Fórmulas disponíveis: ${Object.keys(CONFIG.frameworks).join(', ')}
- Sempre incluir: hook forte + corpo + CTA único
- PME foco: donos de empresa 5-200 funcionários, BH/MG

SERVIÇOS:
${CONFIG.services.map(s => `- ${s.nome}: ${s.preco} — "${s.promessa}"`).join('\n')}`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  COPYWRITER AGENT — SmartOps IA                 ║');
  console.log('║  "Bom copy vende a transformação, não o produto."║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'hook': {
        const tema = getArg('tema', 'automação de processos');
        const result = await ask(`${BASE}

TEMA: ${tema}

Crie 10 HOOKS diferentes para o tema acima, usando variações dos tipos:
${Object.entries(CONFIG.hooks).map(([k, v]) => `- ${k}: ${v[0]}`).join('\n')}

## Hooks Tipo Curiosidade (3)
## Hooks Tipo Dor (3)
## Hooks Tipo Prova/Número (2)
## Hooks Tipo Urgência (2)

Para cada hook:
[HOOK]
Tipo: [tipo]
Plataforma ideal: [instagram/threads/linkedin/youtube]
Por que funciona: [1 linha]`);
        console.log(result);
        save(dir, `hooks_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'caption': {
        const tema = getArg('tema', 'desperdícios em processos');
        const plataforma = getArg('plataforma', 'instagram');
        const platform = CONFIG.platforms[plataforma] || CONFIG.platforms.instagram;
        const result = await ask(`${BASE}

TEMA: ${tema}
PLATAFORMA: ${plataforma} (max ${platform.max_caption || 500} chars, hashtags: ${platform.hashtags || 0})

Escreva 3 versões de caption:

## Versão 1 — Educativa (Fórmula PAS)
[Caption completo com hook, corpo, CTA e hashtags]

## Versão 2 — Storytelling (Fórmula BAB)
[Caption completo com história, transformação, CTA e hashtags]

## Versão 3 — Direta (Fórmula AIDA)
[Caption curto, impacto direto, CTA forte e hashtags]

Para cada versão incluir:
- Emojis estratégicos (não excessivos)
- CTA do tipo: ${CONFIG.ctas.diagnostico[0]}
- Hashtags relevantes para BH + Lean + Automação`);
        console.log(result);
        save(dir, `caption_${plataforma}_${date}.md`, result);
        break;
      }

      case 'cta': {
        const servico = getArg('servico', 'diagnostico-express');
        const svc = CONFIG.services.find(s => s.nome.toLowerCase().includes(servico.split('-')[0])) || CONFIG.services[0];
        const result = await ask(`${BASE}

SERVIÇO: ${svc.nome} — ${svc.promessa} (${svc.preco})

Crie 15 CTAs diferentes para este serviço:

## CTAs para Botão (até 5 palavras) — 5 opções
## CTAs para Instagram Stories (até 10 palavras) — 5 opções
## CTAs para Anúncio (frase completa com urgência) — 5 opções

Para cada CTA: [TEXTO] | Gatilho: [curiosidade/urgência/prova/dor] | Canal ideal`);
        console.log(result);
        save(dir, `cta_${servico}_${date}.md`, result);
        break;
      }

      case 'vsl': {
        const servico = getArg('servico', 'lean-melhoria');
        const duracao = getArg('duracao', '3min');
        const result = await ask(`${BASE}

SERVIÇO: ${CONFIG.services[2].nome}
DURAÇÃO: ${duracao}
PÚBLICO: Dono de PME em BH, 30-55 anos, empresa de 10-100 funcionários

Escreva o ROTEIRO COMPLETO DA VSL seguindo a estrutura:

## [0:00-0:${duracao === '3min' ? '18' : '30'}] HOOK
[Cenas + narração exata]

## [0:${duracao === '3min' ? '18' : '30'}-0:${duracao === '3min' ? '50' : '90'}] PROBLEMA
[Identifica e amplifica a dor com dado específico]

## AGITAÇÃO
[Custo de não resolver — tempo, dinheiro, risco]

## SOLUÇÃO — Método OPEX
[Apresenta a SmartOps e o método sem vender ainda]

## PROVA
[Case real ou hipotético detalhado com números]

## OFERTA
[O que está sendo oferecido, garantia, preço âncora]

## CTA
[Ação única, clara, com urgência real]

Para cada seção: CENA | NARRAÇÃO | TEXTO NA TELA`);
        console.log(result);
        save(dir, `vsl_${duracao}_${date}.md`, result);
        break;
      }

      case 'email': {
        const tipo = getArg('tipo', 'nurture');
        const result = await ask(`${BASE}

TIPO DE EMAIL: ${tipo}
PÚBLICO: Lead que baixou conteúdo ou pediu diagnóstico gratuito

Escreva 3 emails da sequência de ${tipo}:

## Email 1 — [Assunto]
De: Breno Luiz <breno@smartopsIA.com.br>
Assunto: [max 60 chars — taxa de abertura alta]
Preview: [max 90 chars]

[Corpo do email — 200-400 palavras, pessoal, sem HTML fancy, CTA único]

## Email 2 — [Assunto] (2-3 dias depois)
## Email 3 — [Assunto] (5-7 dias depois)

Cada email deve ter: assunto que causa curiosidade + corpo conversacional + CTA claro`);
        console.log(result);
        save(dir, `email_${tipo}_${date}.md`, result);
        break;
      }

      case 'reel': {
        const tema = getArg('tema', 'retrabalho custa caro');
        const result = await ask(`${BASE}

TEMA DO REEL: ${tema}
DURAÇÃO: 30-45 segundos
FORMATO: Talking head (Breno fala para câmera) + texto na tela

## ROTEIRO DO REEL

**[0-3s] HOOK VISUAL + FALA**
Texto na tela: [chamada forte]
Fala: [primeiras palavras exatas que param o scroll]

**[3-20s] DESENVOLVIMENTO**
[Cena a cena com fala + texto sobrepost]

**[20-35s] SOLUÇÃO/INSIGHT**
[O ponto de virada que entrega valor]

**[35-45s] CTA**
Fala: [CTA direto]
Texto na tela: [CTA visual]

## THUMBNAIL/CAPA
Texto: [max 5 palavras, tamanho grande]
Visual: [o que mostrar na imagem parada]

## CAPTION (Instagram)
[Hook + desenvolvimento + CTA + hashtags]`);
        console.log(result);
        save(dir, `reel_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'headline': {
        const produto = getArg('produto', 'diagnostico');
        const result = await ask(`${BASE}

PRODUTO/SERVIÇO: ${produto}

Crie 20 headlines para landing page, anúncio e conteúdo:

## Headlines para Landing Page (promessa + transformação) — 5
## Headlines para Anúncio Meta/Google (dor + solução) — 5
## Headlines para Carrossel (curiosidade + número) — 5
## Headlines para YouTube (SEO + clique) — 5

Critérios: específico, com número quando possível, sem clichê, focado em resultado real`);
        console.log(result);
        save(dir, `headlines_${produto}_${date}.md`, result);
        break;
      }

      case 'ad-copy': {
        const canal = getArg('canal', 'meta');
        const objetivo = getArg('objetivo', 'conversao');
        const result = await ask(`${BASE}

CANAL: ${canal}
OBJETIVO: ${objetivo}

Escreva 3 variações de anúncio completo:

## Variação 1 — Ângulo Dor
**Headline:** [max 40 chars]
**Texto primário:** [max 125 chars para preview]
[Corpo completo: 200-300 palavras]
**CTA:** [botão]

## Variação 2 — Ângulo Prova/Caso
## Variação 3 — Ângulo Número/Dado

Para cada um: qual público segmentar, interesse para targeting, orçamento mínimo sugerido`);
        console.log(result);
        save(dir, `ad_copy_${canal}_${date}.md`, result);
        break;
      }

      case 'thread': {
        const tema = getArg('tema', 'melhoria continua');
        const result = await ask(`${BASE}

TEMA: ${tema}
PLATAFORMA: Threads (max 500 chars por post)

Escreva uma thread de 8-10 posts sobre o tema:

1/ [Hook — para o scroll. Promessa do que vem a seguir]
2/ [Contexto/problema]
3/ [Ponto 1 com dado]
4/ [Ponto 2 com exemplo]
5/ [Ponto 3 com insight]
6/ [Ponto 4 com dica prática]
7/ [Virada/insight principal]
8/ [Resumo + lição]
9/ [CTA suave — sem pressão]
10/ (opcional) [Bônus ou pergunta para engajamento]

Cada post: conciso, completo em si mesmo, mas que faz querer ler o próximo`);
        console.log(result);
        save(dir, `thread_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Gere o RELATÓRIO SEMANAL DE COPY da SmartOps IA:

# Copywriter Agent — Report Semanal

## Conteúdo da Semana
[Sugestão de 4 peças de conteúdo para Ter/Qui/Sáb + extra]
| Dia | Formato | Tema | Hook | CTA |

## Hook da Semana
[O melhor hook para usar nos próximos 7 dias — com 3 variações]

## Oportunidade de Conteúdo
[Trend ou gancho atual que a SmartOps pode usar esta semana]

## Email para a Base
[Assunto + preview + estrutura do email desta semana]

## CTA Principal da Semana
[Um CTA para usar em todos os canais esta semana]

## Palavras a Evitar
[3-5 palavras/frases batidas que diminuem conversão]

## Insight de Copy
[Uma lição ou técnica de copywriting para aplicar esta semana]`);
        console.log(result);
        save(dir, `copy_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: hook | caption | cta | vsl | email | reel | headline | ad-copy | thread | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
