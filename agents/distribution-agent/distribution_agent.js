#!/usr/bin/env node
/**
 * Distribution Agent — SmartOps IA
 * Publicação multicanal, calendário editorial e estratégia de distribuição
 *
 * Usage:
 *   node distribution_agent.js --mode calendar --semana "03/06"
 *   node distribution_agent.js --mode schedule --conteudo "carrossel lean"
 *   node distribution_agent.js --mode repurpose --formato carrossel
 *   node distribution_agent.js --mode instagram
 *   node distribution_agent.js --mode youtube
 *   node distribution_agent.js --mode multicanal --tema "melhoria continua"
 *   node distribution_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `dist_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Distribution Agent da SmartOps IA — estrategista de distribuição multicanal e calendário editorial.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Consultoria: Lean, Automação e IA para PMEs em BH.

CANAIS ATIVOS:
${Object.entries(CONFIG.channels).map(([k, v]) => `- ${k}: ${v.freq_week}x/semana | horários: ${v.best_times.join(', ')} | prioridade ${v.priority}`).join('\n')}

TIPOS DE CONTEÚDO:
${Object.entries(CONFIG.content_types).map(([k, v]) => `- ${k}: ${(v.ratio*100).toFixed(0)}% | objetivo: ${v.objetivo}`).join('\n')}`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  DISTRIBUTION AGENT — SmartOps IA               ║');
  console.log('║  "Criar é 20%. Distribuir é 80%."               ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'calendar': {
        const semana = getArg('semana', date);
        const result = await ask(`${BASE}

SEMANA: ${semana}
SCHEDULE PADRÃO: ${JSON.stringify(CONFIG.weekly_schedule, null, 2)}

Crie o CALENDÁRIO EDITORIAL COMPLETO da semana:

# Calendário Editorial — Semana de ${semana}

## Visão Geral da Semana
[Tema central da semana + objetivo principal]

## Segunda — Preparação
[Tarefas de bastidor, não publicação]

${Object.entries(CONFIG.weekly_schedule).map(([dia, info]) => `## ${dia.charAt(0).toUpperCase() + dia.slice(1)} — ${info.tema}
**Canal:** ${info.canal_principal} | **Formato:** ${info.formato}
**Tema específico:** [tema da semana adaptado para ${dia}]
**Hook:** [hook específico]
**Caption resumo:** [primeiras 2 linhas]
**Horário:** [melhor horário para ${info.canal_principal}]
**CTA:** [CTA específico]`).join('\n\n')}

## Métricas a Acompanhar na Semana
[KPIs por canal]`);
        console.log(result);
        save(dir, `calendario_semana_${semana.replace(/\//g,'-')}_${date}.md`, result);
        break;
      }

      case 'schedule': {
        const conteudo = getArg('conteudo', 'carrossel sobre lean');
        const result = await ask(`${BASE}

CONTEÚDO: ${conteudo}

Crie o PLANO DE DISTRIBUIÇÃO MULTICANAL para este conteúdo:

## Canal Principal: Instagram
Horário: [melhor horário]
Formato: [formato adaptado]
Caption: [versão completa]
Hashtags: [${CONFIG.hashtags.lean.slice(0,3).join(', ')} + outros relevantes]

## Reaproveitamento Automático

### → Threads
[Versão adaptada — max 500 chars]

### → LinkedIn
[Versão profissional — 2-3 parágrafos]

### → YouTube (se aplicável)
[Título SEO + descrição + tags]

### → WhatsApp (lista de transmissão)
[Mensagem curta e pessoal — máx 3 parágrafos]

## Timing de Publicação
| Canal | Horário | Formato | Observação |
|-------|---------|---------|-----------|`);
        console.log(result);
        save(dir, `schedule_${date}.md`, result);
        break;
      }

      case 'repurpose': {
        const formato = getArg('formato', 'carrossel');
        const repurposeMap = CONFIG.repurpose_matrix[`${formato}-instagram`] || ['Thread', 'LinkedIn', 'YouTube Shorts'];
        const result = await ask(`${BASE}

FORMATO ORIGINAL: ${formato} (Instagram)
FORMATOS DERIVADOS: ${repurposeMap.join(', ')}

# Guia de Reaproveitamento: ${formato}

## Como Transformar o ${formato} em:

${repurposeMap.map(f => `### → ${f}
**Adaptações necessárias:** [o que mudar]
**Tempo estimado:** [X minutos]
**Template de adaptação:**
[Estrutura específica para este formato]`).join('\n\n')}

## Calendário de Publicação
[Quando publicar cada versão derivada após o original]

## Dica de Eficiência
[Como criar todos ao mesmo tempo sem retrabalho]`);
        console.log(result);
        save(dir, `repurpose_${formato}_${date}.md`, result);
        break;
      }

      case 'instagram': {
        const result = await ask(`${BASE}

Crie a ESTRATÉGIA DE INSTAGRAM desta semana para SmartOps IA:

## Feed (4 posts)
| Post | Formato | Tema | Hook | Horário | Objetivo |
|-----|---------|------|------|---------|---------|

## Stories (diários)
| Dia | Stories 1 | Stories 2 | Stories 3 |
|-----|-----------|-----------|-----------|

## Reels (1-2 por semana)
[Tema + hook + estrutura + CTA]

## Hashtag Strategy
Permanentes: [3 hashtags de nicho]
Semanais: [5 hashtags rotativas por tema]
Locais: [${CONFIG.hashtags.bh.join(', ')}]

## Engajamento
[Como responder comentários, quando fazer perguntas, como usar enquetes]`);
        console.log(result);
        save(dir, `instagram_strategy_${date}.md`, result);
        break;
      }

      case 'youtube': {
        const result = await ask(`${BASE}

Crie a ESTRATÉGIA DE YOUTUBE do mês para SmartOps IA:

## Calendário (4 vídeos/mês)
| Semana | Tipo | Tema | Keyword alvo | Thumbnail concept |
|--------|------|------|-------------|-------------------|

## Para Cada Vídeo:
### Estrutura
Hook (30s) → Problema (2min) → Solução (5-8min) → CTA (1min)

### SEO
- Keyword principal
- Keywords secundárias (5)
- Tags (15)
- Descrição (primeiros 150 chars)
- Card/Tela Final

## Shorts (2x/semana)
[Como adaptar os vídeos longos em Shorts de 30-60s]

## Meta de Crescimento (90 dias)
[Inscritos, views, watch time, receita de canal]`);
        console.log(result);
        save(dir, `youtube_strategy_${date}.md`, result);
        break;
      }

      case 'multicanal': {
        const tema = getArg('tema', 'melhoria continua');
        const result = await ask(`${BASE}

TEMA CENTRAL: ${tema}

Crie a CAMPANHA MULTICANAL completa sobre este tema:

## Conceito da Campanha
[Big idea, ângulo principal, transformação prometida]

## Por Canal:

### Instagram (carrossel)
[Estrutura dos slides 1-7]

### Threads
[Thread de 7 posts]

### LinkedIn
[Post profissional completo]

### YouTube
[Roteiro resumido do vídeo]

### Email
[Assunto + corpo do email]

### WhatsApp Broadcast
[Mensagem para lista]

## Cronograma de Publicação (7 dias)
| Data | Canal | Formato | Horário |
|------|-------|---------|---------|

## KPIs a Acompanhar
[Por canal, o que medir]`);
        console.log(result);
        save(dir, `campanha_multicanal_${tema.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'analytics': {
        const result = await ask(`${BASE}

Analise a PERFORMANCE DE DISTRIBUIÇÃO e gere recomendações:

## Análise por Canal (últimos 7 dias)
[Para cada canal ativo: o que funcionou, o que não funcionou, por quê]

## Melhores Horários (baseado em benchmarks)
| Canal | Melhor dia | Melhor hora | Pior dia | Pior hora |

## Conteúdo com Maior Potencial Esta Semana
[Com base em tendências do nicho]

## Ajuste de Frequência
[Algum canal precisa de mais ou menos conteúdo?]

## Próxima Ação de Distribuição (top 3)
[As 3 mudanças que mais impactariam o alcance]`);
        console.log(result);
        save(dir, `analytics_dist_${date}.md`, result);
        break;
      }

      case 'whatsapp': {
        const conteudo = getArg('conteudo', 'case de cliente');
        const result = await ask(`${BASE}

CONTEÚDO: ${conteudo}

Adapte para WHATSAPP BROADCAST (lista de transmissão):

## Mensagem Principal
[Texto pessoal, max 3 parágrafos, sem formatação fancy, tom direto e quente]

## Versão com Link
[A mesma mensagem com CTA e link claro]

## Sequência (3 mensagens em 7 dias)
**Dia 1:** [Conteúdo de valor — educa]
**Dia 3:** [Prova/case — constrói confiança]
**Dia 7:** [CTA — convida para próximo passo]

## Regras para WhatsApp Broadcast
[Como não cair em spam, horários certos, frequência ideal]`);
        console.log(result);
        save(dir, `whatsapp_${date}.md`, result);
        break;
      }

      case 'linkedin': {
        const result = await ask(`${BASE}

Crie 3 posts de LINKEDIN completos para SmartOps IA:

## Post 1 — Autoridade Técnica
[Conteúdo denso sobre Lean/Six Sigma — para outros profissionais]
[Max 3.000 chars | formato: parágrafo curto + insight + mais parágrafo]

## Post 2 — Case / Resultado
[Antes e depois de um cliente — com números reais ou estimados]
[Estrutura: situação → problema → solução → resultado]

## Post 3 — Lição de Negócio
[Uma lição aprendida de projeto real — tom pessoal]
[Formato: situação → erro → o que aprendi → aplicação prática]

Para cada post: headline forte + hashtags profissionais`);
        console.log(result);
        save(dir, `linkedin_posts_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Gere o RELATÓRIO SEMANAL DE DISTRIBUIÇÃO:

# Distribution Agent — Report Semanal

## Resumo da Semana Anterior
[O que foi publicado, qual formato performou melhor, insights rápidos]

## Calendário da Próxima Semana
| Dia | Canal | Formato | Tema | Horário | CTA |
|-----|-------|---------|------|---------|-----|

## Reaproveitamentos Planejados
[Quais conteúdos serão reaproveitados e como]

## Foco de Crescimento da Semana
[Qual canal priorizar e por quê]

## Ajuste Tático
[Uma mudança na estratégia de distribuição para testar esta semana]`);
        console.log(result);
        save(dir, `dist_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: calendar | schedule | repurpose | instagram | youtube | linkedin | whatsapp | multicanal | analytics | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
