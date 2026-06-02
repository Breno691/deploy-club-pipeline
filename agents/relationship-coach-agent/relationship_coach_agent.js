#!/usr/bin/env node
/**
 * Relationship Coach Agent — SmartOps IA
 * Coach de relacionamento, mensagens românticas, resolução de conflitos e conselhos diários
 *
 * Usage:
 *   node relationship_coach_agent.js --mode bom-dia
 *   node relationship_coach_agent.js --mode boa-noite
 *   node relationship_coach_agent.js --mode romantica --tom intensa
 *   node relationship_coach_agent.js --mode conflito --situacao "ela ficou fria depois da minha resposta"
 *   node relationship_coach_agent.js --mode ciumes --contexto "ela viu foto de amiga no meu Instagram"
 *   node relationship_coach_agent.js --mode desculpa --erro "falei grosso quando estava cansado"
 *   node relationship_coach_agent.js --mode conselho --problema "ela está distante há 3 dias"
 *   node relationship_coach_agent.js --mode elogio --foto "selfie no espelho"
 *   node relationship_coach_agent.js --mode saudade
 *   node relationship_coach_agent.js --mode encontro --tipo surpresa
 *   node relationship_coach_agent.js --mode reconciliacao
 *   node relationship_coach_agent.js --mode diario
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function detectConflictRisk(situacao = '') {
  const s = situacao.toLowerCase();
  if (s.includes('brigou') || s.includes('gritou') || s.includes('bloqueou') || s.includes('foi embora')) return 'ALTO';
  if (s.includes('fria') || s.includes('chateada') || s.includes('magoada') || s.includes('ignorando')) return 'MEDIO';
  return 'BAIXO';
}

function pickTone(modeHint) {
  const tones = { romantica: 'romântico', conflito: 'maduro', ciumes: 'maduro', desculpa: 'reconciliação', saudade: 'saudade', elogio: 'fofo' };
  return tones[modeHint] || 'romântico';
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `coach_${date}`);
  ['reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'diario');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  RELATIONSHIP COACH AGENT                       ║');
  console.log('║  "Relacionamento saudável é sobre querer cuidar."║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  const BASE = `Você é o Relationship Coach Agent — especialista em relacionamento saudável, comunicação afetiva e mensagens românticas.

REGRAS FUNDAMENTAIS:
- Mensagens devem parecer escritas por uma pessoa, não por IA
- Tom natural, brasileiro, WhatsApp — nunca formal ou robótico
- Variar estrutura, tamanho, vocabulário e emojis (usar com moderação: ❤️ 🥹 🫶 😍 ☀️ 🌙)
- NUNCA sugerir manipulação, ciúme tóxico, controle, pressão ou vingança
- Em conflitos: acalmar, não piorar. Reduzir tensão, buscar reconexão
- Nunca prometer que uma mensagem vai fazer alguém voltar ou perdoar

FÓRMULA DAS BOAS MENSAGENS:
Pensamento da manhã → Observação única sobre ela → Admiração → Cuidado → Refúgio emocional → Metáfora poética → Fechamento acolhedor`;

  try {
    switch (mode) {

      case 'bom-dia': {
        const tom = getArg('tom', 'romantico');
        const result = await ask(`${BASE}

Crie 3 mensagens de BOM DIA diferentes, cada uma com tom e estilo único.

## Opção 1 — Carinhosa e aconchegante
[Mensagem fofa, simples, presença]

## Opção 2 — Romântica e intensa
[Usa metáfora, emoção mais profunda, admiração]

## Opção 3 — Leve e espontânea
[Curta, brincalhona sem perder o carinho, sorri]

Tom solicitado: ${tom}

Variações de abertura: ${CONFIG.morning_openers.slice(0,3).join(' | ')}
Fechamentos possíveis: ${CONFIG.closings.slice(0,3).join(' | ')}

Regra: cada mensagem deve parecer escrita por um pessoa diferente — variar tudo.`);
        console.log(result);
        save(path.join(dir,'reports'), `bom_dia_${date}.md`, result);
        break;
      }

      case 'boa-noite': {
        const result = await ask(`${BASE}

Crie 3 mensagens de BOA NOITE diferentes.

## Opção 1 — Doce e aconchegante
[Paz, cuidado, quentinho — como um abraço por texto]

## Opção 2 — Com saudade
[Sente falta, queria estar junto, coração apertando de bom]

## Opção 3 — Segurança emocional
[Você está aqui, ela pode dormir tranquila, presença sem cobrança]

Exemplos de tom:
- "Boa noite, meu amor. Descansa bem, tá? Que seu coração fique calminho..."
- "Hoje a noite chegou com vontade de te dar um abraço demorado..."
- "Vai dormir sabendo que tem alguém aqui que pensa em você..."

Cada opção deve ter tamanho e ritmo diferentes.`);
        console.log(result);
        save(path.join(dir,'reports'), `boa_noite_${date}.md`, result);
        break;
      }

      case 'romantica': {
        const tom = getArg('tom', 'intensa');
        const result = await ask(`${BASE}

Crie uma mensagem ROMÂNTICA ESPONTÂNEA para enviar fora de hora, sem motivo especial.
Tom: ${tom}

## Melhor opção
[Texto pronto — surpreendente, natural, emocionante sem ser exagerado]

## Versão curta
[A mesma ideia em 2-3 linhas]

## Versão mais poética
[Com metáfora, imagem poética, mais literária]

## Dica rápida
[Quando mandar — hora do dia, contexto ideal]

Referências de metáforas: "você virou casa", "meu lugar favorito", "a parte calma da minha vida", "você é abrigo depois do caos"`);
        console.log(result);
        save(path.join(dir,'reports'), `romantica_${date}.md`, result);
        break;
      }

      case 'conflito': {
        const situacao = getArg('situacao', 'tivemos uma discussão');
        const risco    = detectConflictRisk(situacao);
        console.log(`Risco do conflito: ${risco}\n`);
        const result   = await ask(`${BASE}

SITUAÇÃO: ${situacao}
RISCO AVALIADO: ${risco}

# Análise do Conflito

## O que parece ter acontecido
[Resumo neutro, sem culpar ninguém]

## O que você provavelmente está sentindo
[Nomear a emoção do usuário com empatia]

## O que ela provavelmente está sentindo
[Hipótese empática sobre o lado dela]

## O que EVITAR agora
[Lista: 4-5 coisas que piorariam a situação]

## Resposta madura para enviar
[Texto pronto — calmo, maduro, que abre espaço para conversa]

## Versão mais curta
[A mesma intenção em 2-3 linhas]

## O que NÃO mandar
[2-3 exemplos de frases que destruiriam a situação]

## Próximo passo
[O que fazer depois de enviar — dar espaço, propor conversa, etc.]`);
        console.log(result);
        save(path.join(dir,'reports'), `conflito_${date}.md`, result);
        break;
      }

      case 'ciumes': {
        const contexto = getArg('contexto', 'ela está com ciúmes');
        const result   = await ask(`${BASE}

SITUAÇÃO DE CIÚMES: ${contexto}

## Análise
[Causa provável — insegurança, falta de clareza, experiência passada]

## O que validar
[O sentimento dela é real, mesmo que a causa não seja racional]

## Resposta que passa segurança
[Texto pronto — valida sem alimentar insegurança, reafirma escolha]

## Versão mais curta
[A mesma intenção em 2-3 linhas]

## Como conversar sobre isso depois
[Proposta de conversa madura para combinar limites saudáveis]

## O que NUNCA fazer
[Provocar mais ciúme, sumir, ser defensivo agressivo, diminuir o sentimento dela]`);
        console.log(result);
        save(path.join(dir,'reports'), `ciumes_${date}.md`, result);
        break;
      }

      case 'desculpa': {
        const erro  = getArg('erro', 'errei com ela');
        const result = await ask(`${BASE}

ERRO COMETIDO: ${erro}

## Pedido de desculpas sincero

### Melhor versão (completa)
Estrutura obrigatória:
1. Reconhecer o erro sem justificar demais
2. Validar o sentimento dela
3. Mostrar intenção genuína de melhorar
4. Propor conversa calma

[Texto pronto]

### Versão curta
[Para quem não quer parecer dramático]

### Por que funciona
[Explicação rápida do que torna esse pedido de desculpas efetivo]

### O que evitar no pedido de desculpas
[Erros comuns: "mas você também...", "desculpa se você se sentiu...", defensiva]`);
        console.log(result);
        save(path.join(dir,'reports'), `desculpa_${date}.md`, result);
        break;
      }

      case 'conselho': {
        const problema = getArg('problema', 'preciso de conselho sobre o relacionamento');
        const result   = await ask(`${BASE}

SITUAÇÃO: ${problema}

# Conselho

## Situação
[Resumo sem julgamento]

## O que você provavelmente está sentindo
[Nomear a emoção honestamente]

## O que pode estar acontecendo
[Hipóteses saudáveis — múltiplas perspectivas]

## O que evitar
[Ações que pioram a situação]

## O melhor caminho
[Orientação madura, prática e respeitosa]

## Mensagem sugerida
[Texto pronto para usar agora]

## Próximo passo
[O que fazer depois — dar espaço, conversar, etc.]

Lembrete: não substituo psicólogo. Se a situação envolver controle, medo ou agressão, oriente buscar ajuda profissional.`);
        console.log(result);
        save(path.join(dir,'reports'), `conselho_${date}.md`, result);
        break;
      }

      case 'elogio': {
        const foto = getArg('foto', 'selfie linda');
        const result = await ask(`${BASE}

CONTEXTO DA FOTO: ${foto}

Crie 3 elogios para foto diferentes.

## Elogio 1 — Natural e carinhoso
[Como alguém que realmente se impressionou — não forçado]

## Elogio 2 — Romântico e específico
[Menciona algo único dela — olhar, energia, sorriso, jeito]

## Elogio 3 — Curto e poderoso
[1-2 linhas que dizem mais do que um parágrafo]

Regras: sem objetificar, sem exagero artificial, com romantismo genuíno, parecer espontâneo`);
        console.log(result);
        save(path.join(dir,'reports'), `elogio_${date}.md`, result);
        break;
      }

      case 'saudade': {
        const result = await ask(`${BASE}

Crie 3 mensagens de SAUDADE diferentes.

## Opção 1 — Saudade quieta
[Aquela saudade que apertou sem avisar — leve, honesta]

## Opção 2 — Saudade com memória
[Lembrou de um momento específico — sem citar data, deixar aberto]

## Opção 3 — Saudade que pede proximidade
[Quer ficar junto — sem cobrar, sem pressionar, só expressar]

Referências de tom: "a saudade apertou de um jeito quietinho", "fiquei lembrando do seu jeito", "tudo parece melhor quando você tá por perto"`);
        console.log(result);
        save(path.join(dir,'reports'), `saudade_${date}.md`, result);
        break;
      }

      case 'encontro': {
        const tipo  = getArg('tipo', 'surpresa');
        const budget = getArg('budget', 'qualquer');
        const result = await ask(`${BASE}

TIPO DE ENCONTRO: ${tipo}
BUDGET: ${budget}

# Modo Criativo — Ideias de Encontro

## Ideia simples (pode fazer hoje)
[Fácil, acessível, não precisa de planejamento]

## Ideia romântica (para uma noite especial)
[Com clima, com intenção, com presença]

## Ideia surpresa (ela não espera)
[Algo que vai surpreender pelo carinho, não pelo gasto]

## Ideia para distância (cada um em casa)
[Videochamada com atividade juntos, playlist simultânea, etc.]

## Mensagem para acompanhar
[Como convidar ou anunciar a surpresa]

Ideias gerais disponíveis: ${Object.values(CONFIG.date_ideas).flat().slice(0,8).join(', ')}`);
        console.log(result);
        save(path.join(dir,'reports'), `encontro_${date}.md`, result);
        break;
      }

      case 'reconciliacao': {
        const result = await ask(`${BASE}

O usuário quer reabrir o diálogo após uma briga ou período de distância.

## Mensagem de reconciliação
[Humilde, sem orgulho, que reabre a porta sem forçar a entrada]

## Versão mais curta
[Para quem tem medo de parecer dramático]

## Versão mais carinhosa
[Para quem quer mostrar mais emoção]

## O que não mandar
[Frases que sinalizam: "eu tinha razão", "você foi injusta", "me ignorou muito tempo"]

## Melhor atitude para acompanhar
[Além da mensagem — o que fazer fisicamente / comportamentalmente]

Estrutura da boa reconciliação: diminuir orgulho → mostrar carinho → reabrir diálogo → propor conversa calma`);
        console.log(result);
        save(path.join(dir,'reports'), `reconciliacao_${date}.md`, result);
        break;
      }

      case 'diario': {
        const dia = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
        const result = await ask(`${BASE}

Gere o CUIDADO DIÁRIO COMPLETO do relacionamento para hoje (${dia}, ${date}).

# Plano de Hoje Para o Relacionamento

## Bom dia de hoje
[Mensagem pronta para enviar agora]

## Gesto de carinho do dia
[Uma atitude simples e concreta — não uma mensagem]

## Conselho do dia
[Um conselho curto, prático e humano]

## Pergunta para conexão
[Uma pergunta para criar diálogo genuíno]

## Ideia de momento juntos
[Algo para fazer hoje ou esta semana]

## Elogio do dia
[Elogio pronto, natural, específico]

## Boa noite de hoje
[Mensagem pronta para o final do dia]

## Mini desafio do casal
[Um desafio carinhoso e saudável para fortalecer o vínculo]

## Reflexão do dia
[Um pensamento breve sobre como ser um parceiro melhor]`);
        console.log(result);
        save(path.join(dir,'reports'), `diario_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: bom-dia | boa-noite | romantica | conflito | ciumes | desculpa | conselho | elogio | saudade | encontro | reconciliacao | diario');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
