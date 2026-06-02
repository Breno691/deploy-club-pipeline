#!/usr/bin/env node
/**
 * Video Ad Specialist Agent — SmartOps IA
 * Criativos de vídeo, VSL, UGC, roteiros e direção de conteúdo em vídeo
 *
 * Usage:
 *   node video_ad_specialist_agent.js --mode roteiro --tema "automação economiza tempo"
 *   node video_ad_specialist_agent.js --mode vsl --servico "diagnostico"
 *   node video_ad_specialist_agent.js --mode ugc --setor industria
 *   node video_ad_specialist_agent.js --mode reel --duracao 30 --tema "lean"
 *   node video_ad_specialist_agent.js --mode hook --angulo dor
 *   node video_ad_specialist_agent.js --mode storyboard --formato reel_30s
 *   node video_ad_specialist_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `video_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Video Ad Specialist Agent da SmartOps IA — especialista em criativos de vídeo de alta conversão.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Foco: Vídeos para PMEs em BH — Lean, Automação, IA.

FORMATOS DISPONÍVEIS:
${Object.entries(CONFIG.video_formats).map(([k, v]) => `- ${k}: ${v.plataforma} | ${v.objetivo} | hook nos ${v.hook_seconds}s`).join('\n')}

FÓRMULAS DE HOOK:
${Object.entries(CONFIG.hook_formulas).map(([k, v]) => `- ${k}: "${v}"`).join('\n')}

MÉTRICAS DE SUCESSO:
${Object.entries(CONFIG.metrics).map(([k, v]) => `- ${k}: meta ${v.meta_pct}% | ${v.desc}`).join('\n')}

REGRAS:
- Os primeiros 3 segundos determinam tudo
- Nunca começar com "Olá, meu nome é..."
- Sempre ter CTA único e específico
- Texto na tela: max 7 palavras por frame
- Vídeo UGC: nunca parecer anúncio`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  VIDEO AD SPECIALIST — SmartOps IA              ║');
  console.log('║  "Os primeiros 3s definem tudo."                ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'roteiro': {
        const tema    = getArg('tema', 'automação economiza 40 horas por mês');
        const formato = getArg('formato', 'reel_30s');
        const fmtInfo = CONFIG.video_formats[formato] || CONFIG.video_formats.reel_30s;
        const result  = await ask(`${BASE}

TEMA: ${tema}
FORMATO: ${formato} — ${fmtInfo.plataforma} | ${fmtInfo.objetivo}
DURAÇÃO: baseada no formato | HOOK em ${fmtInfo.hook_seconds}s

Escreva o ROTEIRO COMPLETO:

## ROTEIRO: ${tema}

### [0-${fmtInfo.hook_seconds}s] HOOK
**Fala exata:** "[primeira frase que para o scroll]"
**Texto na tela:** [max 5 palavras]
**Ação visual:** [o que está acontecendo]
**Por que funciona:** [psicologia do hook]

### [${fmtInfo.hook_seconds}-[X]s] DESENVOLVIMENTO
**Fala:** [desenvolvimento natural]
**Texto na tela:** [key points]
**Transição:** [como vai para o próximo momento]

### [final-${fmtInfo.cta}] CTA
**Fala:** [CTA específico e único]
**Texto na tela:** [ação visual]

## DIREÇÃO DE CENA
- Ambiente: [onde gravar]
- Câmera: [ângulo, distância]
- Edição: [cortes, ritmo, efeitos]

## THUMBNAIL
Texto: [max 5 palavras em Bebas Neue]
Visual: [descrição da capa]

## CAPTION (Instagram/YouTube)
[Hook + copy + CTA + hashtags]`);
        console.log(result);
        save(dir, `roteiro_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'vsl': {
        const servico = getArg('servico', 'diagnostico');
        const duracao = getArg('duracao', '3min');
        const vsl     = CONFIG.vsl_structure;
        const result  = await ask(`${BASE}

SERVIÇO: ${servico}
DURAÇÃO: ${duracao}
VSL ESTRUTURA: ${JSON.stringify(vsl)}

Escreva a VSL COMPLETA:

## VSL: ${servico.toUpperCase()} — ${duracao}

${Object.entries(vsl).map(([fase, info]) => `### [${Math.round(info.duracao_pct/100 * (duracao === '3min' ? 180 : 600))}s] ${fase.toUpperCase()} — ${info.objetivo}
**ROTEIRO:**
[Texto exato — ${duracao === '3min' ? 'conciso' : 'detalhado'}, natural, conversacional]

**TEXTO NA TELA:**
[Highlights visuais desta seção]

**AÇÃO:**
[O que Breno faz enquanto fala]`).join('\n\n')}

## Elementos de Prova
[Estatísticas, casos, depoimentos a mencionar]

## Garantia
[Como apresentar a garantia de forma que reduza risco percebido]

## Urgência/Escassez
[Como criar urgência real — sem ser fake]`);
        console.log(result);
        save(dir, `vsl_${servico}_${duracao}_${date}.md`, result);
        break;
      }

      case 'ugc': {
        const setor  = getArg('setor', 'industria');
        const result = await ask(`${BASE}

SETOR DO CREATOR: ${setor}
UGC CONFIG: ${JSON.stringify(CONFIG.ugc_brief_template)}

Escreva o BRIEF DE UGC COMPLETO:

# UGC Brief — SmartOps IA × Creator de ${setor}

## Perfil do Creator Ideal
[Quem deve gravar, o que deve aparentar, background]

## IMPORTANTE — NÃO fazer
${CONFIG.ugc_brief_template?.proibido?.map(p => `❌ ${p}`).join('\n')}

## Guia de Gravação (NÃO é um roteiro — é um guia)

**Situação inicial (falar naturalmente):**
"Descreva como era [área de problema] na sua empresa antes..."

**O que mudou:**
"O que aconteceu especificamente quando trabalharam com a SmartOps..."

**Resultado concreto:**
"Dê um número: quanto tempo economizou / quanto reduziu / quanto melhorou..."

**Recomendação:**
"Para quem você indicaria e por quê..."

## Ambiente e Produção
Local: [onde gravar]
Iluminação: [como iluminar]
Câmera: [posição e ângulo]
Duração: 30-60 segundos
Formato: vertical 9:16

## O que Fazer com o UGC
[Como usar: feed, stories, anúncio, landing page]

## Métricas Esperadas
Hook rate meta: ${CONFIG.metrics.hook_rate.meta_pct}% | Completion meta: ${CONFIG.metrics.completion.meta_pct}%`);
        console.log(result);
        save(dir, `ugc_brief_${setor}_${date}.md`, result);
        break;
      }

      case 'reel': {
        const duracao = parseInt(getArg('duracao', '30'));
        const tema    = getArg('tema', 'lean');
        const formatoKey = `reel_${duracao}s`;
        const fmtInfo = CONFIG.video_formats[formatoKey] || CONFIG.video_formats.reel_30s;
        const result  = await ask(`${BASE}

TEMA: ${tema} | DURAÇÃO: ${duracao}s
PLATAFORMA: ${fmtInfo.plataforma} | OBJETIVO: ${fmtInfo.objetivo}

Crie o REEL COMPLETO com 3 variações:

## Variação 1 — Hook por Pergunta
[Roteiro completo de ${duracao}s]

## Variação 2 — Hook por Afirmação Polêmica
[Roteiro alternativo]

## Variação 3 — Hook por Número/Dado
[Roteiro alternativo]

Para cada variação:
**Segundos 0-3:** [hook exato + visual]
**Segundos 3-${Math.round(duracao * 0.7)}:** [desenvolvimento]
**Segundos ${Math.round(duracao * 0.7)}-${duracao}:** [CTA]

## Recomendação de Teste
[Qual variação testar primeiro e por quê]

## Dicas de Edição
[Cortes, transições, texto, ritmo para este tema]`);
        console.log(result);
        save(dir, `reel_${duracao}s_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'hook': {
        const angulo  = getArg('angulo', 'dor');
        const formula = CONFIG.hook_formulas[angulo] || CONFIG.hook_formulas.pergunta;
        const result  = await ask(`${BASE}

ÂNGULO: ${angulo}
FÓRMULA: "${formula}"

Crie 15 HOOKS de vídeo para SmartOps IA:

## Hooks Tipo: ${angulo}
[Aplicar a fórmula: "${formula}"]

${[...Array(15)].map((_, i) => `### Hook ${i+1}
**Fala:** "[texto exato — max 15 palavras]"
**Texto na tela:** "[max 5 palavras]"
**Duração:** [X segundos]
**Por que para o scroll:** [1 linha]`).join('\n\n')}

## Top 3 Para Testar Primeiro
[Ranking dos mais promissores com justificativa]`);
        console.log(result);
        save(dir, `hooks_${angulo}_${date}.md`, result);
        break;
      }

      case 'testimonial': {
        const cliente = getArg('cliente', 'dono de empresa em BH');
        const result  = await ask(`${BASE}

CLIENTE: ${cliente}

Crie o BRIEF DE DEPOIMENTO EM VÍDEO:

## Estrutura do Depoimento (2-3 minutos)

### Abertura (0-20s)
Pergunta para o cliente: "Me fale um pouco sobre sua empresa e o que a levou a buscar uma consultoria..."

### Situação Anterior (20-60s)
Pergunta: "Como era [a área problemática] antes da SmartOps?"

### Processo de Trabalho (60-90s)
Pergunta: "Como foi trabalhar com a SmartOps? O que te surpreendeu?"

### Resultado Específico (90-150s)
Pergunta: "Qual resultado concreto você conseguiu? Tem algum número?"

### Recomendação (150-180s)
Pergunta: "Para quem você indicaria a SmartOps e por quê?"

## Dicas para a Gravação
[Iluminação, posição, como não parecer ensaiado]

## Como Editar
[Highlights, cortes, textos sobrepostos com números]

## Como Usar
[Feed, stories, landing page, proposta comercial, anúncio]`);
        console.log(result);
        save(dir, `testimonial_brief_${date}.md`, result);
        break;
      }

      case 'storyboard': {
        const formato = getArg('formato', 'reel_30s');
        const tema    = getArg('tema', 'automação de processos');
        const fmtInfo = CONFIG.video_formats[formato] || CONFIG.video_formats.reel_30s;
        const result  = await ask(`${BASE}

FORMATO: ${formato} | TEMA: ${tema}
DURAÇÃO BASE: ${fmtInfo.plataforma}

Crie o STORYBOARD COMPLETO (texto visual):

# Storyboard: ${tema}

| Frame | Tempo | Cena/Visual | Fala/Narração | Texto na Tela | Música/SFX |
|-------|-------|-------------|--------------|--------------|-----------|
| 1 | 0-1s | [descrição] | [fala] | [texto] | [sfx] |
| 2 | 1-2s | | | | |
| 3 | 2-3s | | | | |
[continuar para toda a duração]

## Notas de Direção
**Ritmo:** [rápido/médio/lento — quando]
**Transições:** [tipo de corte entre frames]
**Cor/Grading:** [tom visual]
**Música:** [energia, BPM, tipo]

## Checklist de Produção
[O que preparar antes de gravar]`);
        console.log(result);
        save(dir, `storyboard_${formato}_${date}.md`, result);
        break;
      }

      case 'shorts': {
        const tema   = getArg('tema', 'quick win de processo');
        const result = await ask(`${BASE}

TEMA: ${tema}
FORMATO: YouTube Shorts (60s máx, vertical 9:16)

Crie 3 ROTEIROS DE SHORTS:

## Shorts 1 — Dica Rápida (30s)
[Roteiro completo]

## Shorts 2 — Antes e Depois (45s)
[Roteiro completo]

## Shorts 3 — Pergunta + Resposta (60s)
[Roteiro completo]

Para cada short:
- Hook (0-3s): [fala + visual]
- Corpo: [desenvolvimento]
- CTA (últimos 5s): [ação]
- Thumbnail title: [max 4 palavras]
- Hashtags: #lean #automacao #processosempresariais`);
        console.log(result);
        save(dir, `shorts_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'audit': {
        const result = await ask(`${BASE}

Faça uma AUDITORIA DE VÍDEOS para SmartOps IA:

## Framework de Análise

### Hook (0-3s)
[Critérios + como avaliar + score 0-10]

### Retenção
[Como avaliar se o vídeo mantém o espectador]

### Clareza da Mensagem
[A mensagem principal é clara? Chega ao CTA?]

### CTA
[Único? Claro? Criado urgência?]

### Produção
[Qualidade mínima aceitável vs. excelente]

## Checklist de Qualidade (antes de publicar)
${['Hook nos primeiros 3s', 'Texto na tela legível', 'Áudio limpo', 'CTA único e claro', 'Thumbnail impactante', 'Caption com hook forte'].map((c, i) => `${i+1}. [ ] ${c}`).join('\n')}

## Melhoria #1 para Vídeos SmartOps Agora
[A mudança que mais aumentaria as métricas]`);
        console.log(result);
        save(dir, `video_audit_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Video Ad Specialist — Report Semanal

## Vídeos Para Produzir Esta Semana
| Formato | Tema | Hook | Prioridade |
|---------|------|------|-----------|

## Hook da Semana
[O melhor hook para usar em todos os vídeos desta semana]

## VSL para Criar (se ainda não tem)
[Brief resumido da VSL mais importante]

## UGC para Solicitar
[Perfil do creator + tema + briefing resumido]

## Benchmark de Performance
[O que medir em cada vídeo para saber se está funcionando]

## Insight de Vídeo
[Uma técnica de vídeo para experimentar esta semana]`);
        console.log(result);
        save(dir, `video_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: roteiro | vsl | ugc | reel | hook | testimonial | storyboard | shorts | audit | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
