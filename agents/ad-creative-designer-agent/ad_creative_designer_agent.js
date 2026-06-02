#!/usr/bin/env node
/**
 * Ad Creative Designer Agent — SmartOps IA
 * Briefings de criativos, layouts, direção visual e conceitos de anúncios
 *
 * Usage:
 *   node ad_creative_designer_agent.js --mode brief --formato carrossel
 *   node ad_creative_designer_agent.js --mode layout --formato stories
 *   node ad_creative_designer_agent.js --mode conceito --angulo dor
 *   node ad_creative_designer_agent.js --mode carousel --slides 6
 *   node ad_creative_designer_agent.js --mode ugc --perfil "dono de industria"
 *   node ad_creative_designer_agent.js --mode audit
 *   node ad_creative_designer_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `creative_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Ad Creative Designer Agent da SmartOps IA — diretor de arte e especialista em criativos de performance.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Brand tokens: BG ${CONFIG.brand.bg} | Card ${CONFIG.brand.card} | Accent roxo ${CONFIG.brand.accent1} | Accent verde ${CONFIG.brand.accent2} | Texto ${CONFIG.brand.text}
Fontes: ${CONFIG.brand.headline} (headlines) + ${CONFIG.brand.body} (corpo)

CHECKLIST CRIATIVO:
${CONFIG.creative_checklist.map((c, i) => `${i+1}. ${c}`).join('\n')}

ÂNGULOS DISPONÍVEIS:
${Object.entries(CONFIG.ad_angles).map(([k, v]) => `- ${k}: ${v.gatilho} — ex: "${v.exemplo}"`).join('\n')}`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  AD CREATIVE DESIGNER — SmartOps IA             ║');
  console.log('║  "O criativo para o scroll. O copy fecha."       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'brief': {
        const formato = getArg('formato', 'carrossel');
        const fmtInfo = CONFIG.creative_types[formato] || CONFIG.creative_types.carrossel;
        const result = await ask(`${BASE}

FORMATO: ${formato} — ${JSON.stringify(fmtInfo)}

Crie o BRIEFING COMPLETO DE CRIATIVO:

# Brief: ${formato.toUpperCase()} — SmartOps IA

## Objetivo
[Conversão / Alcance / Engajamento / Autoridade]

## Público-Alvo
[Dono de PME BH, setor, dor específica]

## Conceito Central
[A big idea em 1 frase]

## Ângulo Principal
[Qual dos 7 ângulos usar e por quê]

## Elementos Visuais
**Cores:** [quais brand tokens usar e onde]
**Headline:** [texto exato, fonte Bebas Neue, tamanho sugerido]
**Subheadline:** [texto exato, fonte Inter]
**Imagem/Ilustração:** [descrição detalhada do que mostrar]
**Ícones/Gráficos:** [elementos de apoio]
**CTA visual:** [botão ou elemento de call-to-action]

## Hierarquia Visual
1. [O que os olhos devem ver primeiro]
2. [O que vem depois]
3. [O que ancoreia a ação]

## Especificações Técnicas
Resolução: ${fmtInfo.resolution || '1080x1080'}
Formato de entrega: PNG + HTML

## O que EVITAR
[Erros comuns para este formato]`);
        console.log(result);
        save(dir, `brief_${formato}_${date}.md`, result);
        break;
      }

      case 'layout': {
        const formato = getArg('formato', 'feed');
        const result = await ask(`${BASE}

FORMATO: ${formato}

Descreva o LAYOUT DETALHADO do criativo (como um wireframe em texto):

## Layout Visual — ${formato}

\`\`\`
[ASCII wireframe do layout — mostrar onde cada elemento vai]
+----------------------------------+
|  LOGO              data/hora     |
|                                  |
|  [HEADLINE GRANDE]               |
|                                  |
|  [Imagem/Ilustração central]     |
|                                  |
|  [Subheadline]                   |
|  [Dado/Prova]                    |
|                                  |
|  [CTA Button]                    |
+----------------------------------+
\`\`\`

## Especificações de Cada Elemento
| Elemento | Conteúdo | Fonte | Tamanho | Cor | Posição |
|---------|---------|-------|---------|-----|---------|

## Paleta de Cores
[Quais brand tokens usar, onde e por quê]

## Tipografia
[Hierarquia tipográfica completa]

## Versões
- Versão A: [descrição]
- Versão B: [variação para teste]`);
        console.log(result);
        save(dir, `layout_${formato}_${date}.md`, result);
        break;
      }

      case 'conceito': {
        const angulo = getArg('angulo', 'dor');
        const angleInfo = CONFIG.ad_angles[angulo] || CONFIG.ad_angles.dor;
        const result = await ask(`${BASE}

ÂNGULO: ${angulo} — ${angleInfo.gatilho}
EXEMPLO DE REFERÊNCIA: "${angleInfo.exemplo}"

Crie 3 CONCEITOS CRIATIVOS diferentes para este ângulo:

## Conceito 1 — [Nome criativo]
**Big Idea:** [frase central]
**Visual:** [descrição detalhada da imagem/cena]
**Headline:** [texto exato]
**Subheadline:** [texto exato]
**CTA:** [texto exato]
**Por que funciona:** [psicologia por trás]

## Conceito 2 — [Nome criativo]
[Mesma estrutura com abordagem diferente]

## Conceito 3 — [Nome criativo]
[Versão mais ousada/criativa]

## Ranking de Recomendação
[Qual testar primeiro e por quê]`);
        console.log(result);
        save(dir, `conceitos_${angulo}_${date}.md`, result);
        break;
      }

      case 'carousel': {
        const slides = parseInt(getArg('slides', '6'));
        const tema = getArg('tema', '8 desperdícios que custam R$20k/mês');
        const result = await ask(`${BASE}

TEMA: ${tema}
SLIDES: ${slides}
RESOLUÇÃO: 1080x1080

Crie o ROTEIRO VISUAL COMPLETO do carrossel:

## Slide 1 — CAPA (Hook)
Headline: [texto grande, impactante, Bebas Neue]
Subheadline: [complemento, Inter]
Visual: [descrição da imagem]
Elemento de curiosidade: [o que faz querer passar para o próximo]

${Array.from({length: slides-2}, (_, i) => `## Slide ${i+2} — [TÍTULO]
Conteúdo: [texto exato]
Visual: [ícone/ilustração]
Dado/Destaque: [número ou frase em destaque]`).join('\n\n')}

## Slide ${slides} — CTA
Headline: [chamada para ação]
CTA: [botão/texto de ação]
Info de contato: [como chegar na SmartOps]

## Dicas de Design
[Consistência, espaçamento, progressão visual entre slides]`);
        console.log(result);
        save(dir, `carousel_${slides}slides_${date}.md`, result);
        break;
      }

      case 'stories': {
        const objetivo = getArg('objetivo', 'leads');
        const result = await ask(`${BASE}

OBJETIVO DOS STORIES: ${objetivo}

Crie SEQUÊNCIA DE 5 STORIES:

## Story 1 — Hook
[Visual + texto + elemento interativo]

## Story 2 — Desenvolvimento
[Conteúdo de valor curto]

## Story 3 — Prova/Dado
[Número ou resultado impactante]

## Story 4 — Enquete/Interação
[Pergunta para aumentar engajamento]

## Story 5 — CTA
[Link, DM ou swipe up]

Para cada story:
- Texto exato (max 10 palavras por tela)
- Elementos visuais
- Posição do texto na tela (topo/centro/base)
- Duração (7s/10s/15s)
- Elemento interativo se aplicável`);
        console.log(result);
        save(dir, `stories_seq_${date}.md`, result);
        break;
      }

      case 'banner': {
        const tamanho = getArg('tamanho', '300x250');
        const result = await ask(`${BASE}

TAMANHO: ${tamanho}
CONTEXTO: Display/Retargeting Google Ads

Crie o BANNER para ${tamanho}:

## Conteúdo (adaptado ao espaço)
Headline: [max 7 palavras]
Subheadline: [max 10 palavras, se couber]
CTA Button: [max 3 palavras]
Logo: [posição]

## Hierarquia Visual
[O que aparece primeiro, segundo, terceiro]

## Considerações de Tamanho
[O que incluir e o que cortar para este formato específico]

## Versões para Outros Tamanhos
| Tamanho | Ajustes necessários |
|---------|-------------------|`);
        console.log(result);
        save(dir, `banner_${tamanho.replace('x','_')}_${date}.md`, result);
        break;
      }

      case 'video-brief': {
        const tipo = getArg('tipo', 'reel-30s');
        const fmtInfo = CONFIG.creative_types[tipo.replace('-','_')] || CONFIG.creative_types.reel_30s;
        const result = await ask(`${BASE}

TIPO: ${tipo} — ${JSON.stringify(fmtInfo)}

Crie o BRIEFING DE PRODUÇÃO DE VÍDEO:

# Brief de Vídeo: ${tipo.toUpperCase()}

## Conceito
[Big idea em 1 frase]

## Roteiro (cena a cena)
| Tempo | Cena | Fala/Texto | Transição |
|-------|------|-----------|-----------|

## Direção de Arte
- Ambiente: [onde gravar]
- Iluminação: [como iluminar]
- Figurino: [o que vestir]
- Props: [o que usar]
- Ângulo de câmera: [plano, posição]

## Texto na Tela
[Quais textos adicionar na edição, onde e quando]

## Música de Fundo
[Tom/estilo — sem indicar músicas específicas protegidas]

## Edição
[Cortes, efeitos, transições sugeridos]

## Thumbnail
[Descrição da imagem parada de capa]`);
        console.log(result);
        save(dir, `video_brief_${tipo.replace('-','_')}_${date}.md`, result);
        break;
      }

      case 'audit': {
        const result = await ask(`${BASE}

Faça uma AUDITORIA DE CRIATIVOS para a SmartOps IA:

# Auditoria de Criativos — SmartOps IA

## O que Analisar
[Checklist dos 10 critérios de criativo aplicados]

## Diagnóstico (baseado em benchmarks de mercado)
${Object.entries(CONFIG.performance_benchmarks).map(([canal, b]) => `### ${canal}
CTR esperado: ${b.ctr_bom}% | Threshold mínimo: ${b.ctr_min}%
[Status atual hipotético + o que pode estar faltando]`).join('\n\n')}

## Principais Melhorias para os Criativos Atuais
[Top 5 mudanças que aumentariam performance]

## Testes A/B Recomendados (próximas 4 semanas)
| Semana | Variável | Versão A | Versão B | Métrica |
|--------|---------|---------|---------|--------|

## Próximo Criativo a Produzir
[O que priorizar agora com maior ROI]`);
        console.log(result);
        save(dir, `audit_criativos_${date}.md`, result);
        break;
      }

      case 'ugc': {
        const perfil = getArg('perfil', 'dono de empresa BH');
        const result = await ask(`${BASE}

UGC BRIEF — PERFIL DO CREATOR: ${perfil}

Crie o BRIEFING COMPLETO DE UGC:

# UGC Brief — SmartOps IA

## Sobre o Creator
Perfil: ${perfil}
Tom: ${CONFIG.creative_types.ugc_brief.tom || 'Natural, verdadeiro'}
Ambiente: ${CONFIG.ugc_brief_template?.ambiente || 'Escritório real'}

## O que NÃO fazer
${(CONFIG.ugc_brief_template?.proibido || ['Teleprompter', 'Cenário artificial']).map(p => `❌ ${p}`).join('\n')}

## Roteiro (NÃO ler — usar como guia)
[0-5s] "Começa assim: [frase de abertura natural]"
[5-20s] [Situação: o problema que tinha antes]
[20-40s] [O que mudou com a SmartOps]
[40-55s] [Resultado específico — número ou melhoria concreta]
[55-60s] [Recomendação sincera + CTA]

## Perguntas para o Creator Responder Naturalmente
1. Como era [área/processo] antes?
2. O que te fez buscar uma consultoria?
3. O que mudou especificamente?
4. Que número ou melhoria você notou?
5. Para quem você indicaria a SmartOps?

## Especificações Técnicas
Duração: 30-60s | Formato: vertical 9:16 | Qualidade: mínimo 1080p
Iluminação: natural ou anel de luz simples
Áudio: microfone embutido OK se ambiente quieto`);
        console.log(result);
        save(dir, `ugc_brief_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Ad Creative Designer — Report Semanal

## Criativos Prioritários Esta Semana
[3 criativos para produzir, ordenados por impacto esperado]

## Conceito da Semana
[Um conceito criativo novo para testar esta semana]

## Insight de Design
[Uma técnica visual que aumentaria CTR nos criativos atuais]

## Testes A/B Ativos
[O que está sendo testado, resultado esperado]

## Checklist de Qualidade
[Os 10 critérios — aplicar em todos os criativos]

## Próximo Formato a Explorar
[Um formato que a SmartOps ainda não usa mas deveria]`);
        console.log(result);
        save(dir, `creative_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: brief | layout | conceito | carousel | stories | banner | video-brief | audit | ugc | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
