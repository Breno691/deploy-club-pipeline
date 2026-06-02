#!/usr/bin/env node
/**
 * Marketing Research Agent Enterprise — SmartOps IA
 * Sistema de Inteligência de Mercado — v2.0.0-enterprise
 * "Nunca achismo. Sempre evidência."
 *
 * MODOS DISPONÍVEIS:
 *
 * --- Pesquisa Direta ---
 *   --mode trends          Relatório de tendências com classificação
 *   --mode competitors     Análise competitiva
 *   --mode audience        Mapa de público
 *   --mode validate        Validação de ideia (--idea ou --topic)
 *   --mode brief           Research brief completo (--topic)
 *   --mode deep            Deep research report (--topic)
 *   --mode content-ideas   Ideias de conteúdo baseadas em pesquisa
 *
 * --- Pesquisa de Suporte ---
 *   --mode audience-deep      Pesquisa profunda de audiência com TrendsAgent
 *   --mode competitive-intel  Inteligência competitiva completa com subagentes
 *   --mode voice              Voz do cliente — dores, frases, linguagem
 *   --mode gaps               Lacunas de mercado
 *   --mode trend-eval         Avaliação: tendência saudável vs modinha (--topic)
 *
 * --- Pesquisa Para Agentes ---
 *   --mode content-brief  Brief de pesquisa para Content Agent (--topic)
 *   --mode ads-brief      Brief de pesquisa para Ads Agent (--topic)
 *   --mode seo-brief      Brief de pesquisa para SEO Agent (--topic)
 *   --mode sales-brief    Brief de pesquisa para Sales Agent (--topic)
 *   --mode lean-brief     Brief de pesquisa para Lean Consulting Agent (--topic)
 *
 * --- Pesquisa Operacional ---
 *   --mode sector         Pesquisa por setor (--sector)
 *   --mode local          Pesquisa local (--topic --location)
 *   --mode pricing        Pesquisa de precificação (--topic)
 *   --mode channels       Pesquisa de canais (--topic --audience)
 *   --mode message        Pesquisa de mensagem (--topic --audience)
 *   --mode offer          Pesquisa para criar oferta (--topic --audience)
 *
 * --- Monitoramento e Inteligência Contínua ---
 *   --mode radar          Radar semanal de mercado (--topic)
 *   --mode weekly         Relatório semanal de inteligência de mercado
 *   --mode alert          Alerta de mercado (--topic --type)
 *   --mode hypothesis     Avaliar/criar hipótese comercial (--topic)
 *
 * --- Análise Comparativa ---
 *   --mode niche-compare  Comparar nichos de consultoria
 *   --mode intel-map      Mapa de inteligência de mercado (--topic)
 *   --mode proposal-intel Inteligência para proposta comercial (--topic --audience)
 *   --mode diagnostic     Pesquisa para diagnóstico gratuito (--audience)
 *   --mode sprint         Research Sprint rápido (--topic)
 *   --mode executive      Síntese executiva de decisão (--topic)
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { CONFIG } = require('./src/config');
const { researchTrendsWithTavily, analyzeTrendsWithClaude }  = require('./src/agents/TrendsResearchAgent');
const { buildCompetitiveIntelligenceReport }                  = require('./src/agents/CompetitorIntelligenceAgent');
const { buildAudienceMapWithClaude, researchAudienceWithTavily } = require('./src/agents/AudienceResearchAgent');
const client = new Anthropic();

// Knowledge context — loaded once at startup
let KNOWLEDGE_CTX = '';

function loadKnowledge() {
  const base = path.join(__dirname, '..', '..', 'knowledge');
  const files = [
    { file: 'brand_identity.md',   label: 'Brand Identity' },
    { file: 'product_campaign.md', label: 'Serviços e Ângulos' },
    { file: 'customer_personas.md',label: 'Personas' },
  ];
  const parts = [];
  for (const { file, label } of files) {
    const fp = path.join(base, file);
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, 'utf-8').slice(0, 1200);
      parts.push(`### ${label}\n${content}`);
    }
  }
  if (parts.length) {
    KNOWLEDGE_CTX = `\n\n## CONHECIMENTO DA EMPRESA (Knowledge Base)\n${parts.join('\n\n---\n\n')}`;
    console.log(`  📚 Knowledge carregado: ${parts.length} arquivo(s)\n`);
  }
}

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `research_${date}`);
  ['logs', 'reports', 'briefs'].forEach(d => {
    if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true });
  });
  return { dir, date };
}

function saveOutput(dir, filename, content) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}

async function searchWithTavily(queries, maxResultsPerQuery = 3) {
  if (!process.env.TAVILY_API_KEY) {
    console.log('  ℹ️  Tavily não configurado — pesquisa sem dados em tempo real\n');
    return '';
  }
  try {
    const { TavilyClient } = require('@tavily/core');
    const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
    const results = [];
    for (const q of queries.slice(0, 4)) {
      const res = await tavily.search({ query: q, maxResults: maxResultsPerQuery, searchDepth: 'basic' });
      results.push(...(res.results || []));
    }
    return results.map(r => `• ${r.title}\n  ${r.content?.slice(0, 250)}`).join('\n\n');
  } catch (e) {
    return `Tavily indisponível: ${e.message}`;
  }
}

async function runClaude(prompt, maxTokens = null) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: maxTokens || CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].text;
}

function companyCtx() {
  return `Empresa: ${CONFIG.company.name} — ${CONFIG.company.sector}, ${CONFIG.company.location}
Público-alvo: ${CONFIG.target_audience.primary}
Dores do público: ${CONFIG.target_audience.pain}
Concorrentes: ${CONFIG.competitors.map(c => c.name).join(', ')}${KNOWLEDGE_CTX}`;
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const mode     = getArg('mode', 'brief');
  const topic    = getArg('topic', 'automação IA e Lean para PMEs em BH 2026');
  const idea     = getArg('idea', '');
  const sector   = getArg('sector', '');
  const location = getArg('location', 'Belo Horizonte, MG');
  const audience = getArg('audience', CONFIG.target_audience.primary);
  const alertType= getArg('type', 'Oportunidade');

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  MARKETING RESEARCH AGENT ENTERPRISE — SmartOps IA      ║');
  console.log('║  v2.0.0 | "Nunca achismo. Sempre evidência."             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode} | Tema: ${topic}\n`);

  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY não configurada'); process.exit(1); }

  loadKnowledge();
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      // ─── TENDÊNCIAS ────────────────────────────────────────────────────────
      case 'trends': {
        console.log(`🔍 Pesquisando tendências: "${topic}"\n`);
        const tavilyData = await researchTrendsWithTavily(topic, CONFIG.company.sector);
        const result = await analyzeTrendsWithClaude(topic, tavilyData.results || []);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `trends_${date}.md`, result);
        break;
      }

      // ─── CONCORRENTES ──────────────────────────────────────────────────────
      case 'competitors': {
        console.log('🔎 Analisando concorrentes...\n');
        const trendData = await searchWithTavily([
          `consultoria lean automação pequenas empresas Brasil posicionamento 2026`,
          `automação processos PME preços concorrentes`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# ANÁLISE COMPETITIVA — SmartOps IA

## RESUMO
[Estado atual do mercado competitivo]

## ANÁLISE POR TIPO DE CONCORRENTE
${CONFIG.competitors.map(c => `
### ${c.name} (${c.type})
Segmento: ${c.segment}
POSICIONAMENTO:
PROPOSTA:
FORÇAS:
FRAQUEZAS:
OPORTUNIDADE PARA SMARTOPS:`).join('\n')}

## MATRIZ COMPETITIVA
| Critério | SmartOps IA | Lean Tradicional | Automação Digital | Big 4 | Freelancer IA |
|---|---|---|---|---|---|
| Preço | | | | | |
| Resultado entregue | | | | | |
| IA/Automação | | | | | |
| Proximidade BH | | | | | |
| Prazo de entrega | | | | | |
| Prova social | | | | | |

## LACUNAS DE MERCADO
[O que nenhum concorrente atende bem]

## OPORTUNIDADES DE DIFERENCIAÇÃO
[Como SmartOps pode se destacar]

## POSICIONAMENTO RECOMENDADO
[Declaração de posicionamento ideal]

## MENSAGENS A EVITAR
[Frases usadas demais pelos concorrentes]

## AÇÕES IMEDIATAS
P1: P2: P3:`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `competitors_${date}.md`, result);
        break;
      }

      // ─── PÚBLICO ───────────────────────────────────────────────────────────
      case 'audience': {
        console.log('👥 Mapeando público-alvo...\n');
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}

# AUDIENCE INTELLIGENCE REPORT

## MAPA DO PÚBLICO

### Quem é (perfil detalhado)
### O que quer (desejos e aspirações)
### O que teme (medos e riscos percebidos)
### O que impede a compra (barreiras)
### O que faz comprar (gatilhos de decisão)

## FRASES REAIS DO PÚBLICO
[20 frases que clientes reais diriam — linguagem natural, não corporativa]

## JORNADA DO CLIENTE SmartOps
ESTÁGIO 1 — CONSCIÊNCIA: como descobre o problema
ESTÁGIO 2 — CONSIDERAÇÃO: como pesquisa soluções
ESTÁGIO 3 — DECISÃO: o que precisa ver para fechar
ESTÁGIO 4 — IMPLEMENTAÇÃO: o que precisa para ter sucesso
ESTÁGIO 5 — DEFESA: o que o tornaria promotor

## OBJEÇÕES E RESPOSTAS
[Para cada objeção: [objeção] → [resposta ideal SmartOps]]

## MENSAGENS POR CANAL
LinkedIn: | Google Ads: | Instagram: | WhatsApp:

## INSIGHTS PARA PRODUTO
[O que o público revela sobre novos serviços ou ofertas]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `audience_${date}.md`, result);
        break;
      }

      // ─── VALIDAÇÃO DE IDEIA ────────────────────────────────────────────────
      case 'validate': {
        const ideaToValidate = idea || topic;
        console.log(`✅ Validando ideia: "${ideaToValidate}"\n`);
        const trendData = await searchWithTavily([
          `${ideaToValidate} mercado demanda Brasil`,
          `${ideaToValidate} concorrentes reviews`,
          `${ideaToValidate} dores público`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}

Ideia a validar: "${ideaToValidate}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# VALIDAÇÃO DE IDEIA

## IDEIA
[Descrição clara]

## VEREDITO
[Forte / Promissora / Incerta / Fraca / Arriscada]
[1 parágrafo de justificativa]

## ANÁLISE DE DEMANDA
Existe mercado? [Sim/Não/Incerto]
Evidências: [fontes ou sinais]

## PÚBLICO PROVÁVEL
[Quem compraria + quantos existem no mercado alvo]

## CONCORRÊNCIA
[Quem já faz + diferenciais possíveis]

## SCORE DE OPORTUNIDADE
Nota: X/100
Demanda (20): | Crescimento (15): | Dor do público (20): | Potencial comercial (20): | Concorrência (10): | Facilidade (10): | Aderência (5):
Total:

## SCORE DE CONFIANÇA
Nota: X/100 | Classificação: [Alta/Boa/Moderada/Baixa]

## RISCOS PRINCIPAIS
[Top 3 riscos com impacto e como mitigar]

## TESTE MÍNIMO
[Como validar com o menor investimento possível]

## CRITÉRIO PARA AVANÇAR
[Condição que confirma a ideia]

## CRITÉRIO PARA PARAR
[Condição que invalida]

## MÉTRICAS DE SUCESSO
[Quando considerar validada / invalidada]

## PRÓXIMA AÇÃO
[Primeiro passo para validar ou executar]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `validation_${Date.now()}.md`, result);
        break;
      }

      // ─── BRIEF / REPORT ────────────────────────────────────────────────────
      case 'brief':
      case 'report': {
        console.log(`📋 Gerando Research Brief Enterprise: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} Brasil 2026`,
          `${topic} oportunidade mercado`,
          `${topic} dores empresas`,
          `${topic} concorrentes posicionamento`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}" | Data: ${date}

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# Research Brief Enterprise — ${topic}

## OBJETIVO DA PESQUISA
[Qual decisão será apoiada]

## PREMISSAS
Região: ${location} | Público: ${CONFIG.target_audience.primary} | Período: ${date}

## RESUMO EXECUTIVO
[Síntese em 3-4 frases]

## SCORE DE CONFIANÇA
Nota: X/100 | Classificação: Alta/Boa/Moderada/Baixa | Limitações:

## PRINCIPAIS DESCOBERTAS
[5-7 insights com evidência e grau de confiança: Fato/Sinal/Tendência/Hipótese]

## EVIDÊNCIAS
| Evidência | Tipo | Fonte | Confiança (A/B/C/D) | Observação |
|---|---|---|---|---|

## TENDÊNCIAS IDENTIFICADAS
| Tendência | Força | Recência | Impacto | Confiança |
|---|---|---|---|---|

## PÚBLICO E COMPORTAMENTO
Dores: | Desejos: | Objeções: | Linguagem real: | Canais:

## CONCORRENTES OBSERVADOS
| Concorrente | Posicionamento | Força | Fraqueza | Oportunidade |
|---|---|---|---|---|

## OPORTUNIDADES PRIORIZADAS
| Oportunidade | Score | Impacto | Esforço | Prioridade |
|---|---|---|---|---|

## RISCOS
| Risco | Probabilidade | Impacto | Como reduzir |
|---|---|---|---|

## RECOMENDAÇÕES
P1 — Prioridade Máxima: | Motivo: | Resultado esperado: | Como validar:
P2 — Alta: | Motivo: | Resultado esperado:
P3 — Média: | Motivo:

## IDEIAS DE CONTEÚDO
| Tema | Canal | Formato | Gancho | CTA | Prioridade |
|---|---|---|---|---|---|

## IDEIAS DE CAMPANHA
| Campanha | Público | Promessa | Canal | Objetivo | Métrica |
|---|---|---|---|---|---|

## PRÓXIMOS TESTES
| Teste | Hipótese | Como executar | Métrica | Critério de sucesso |
|---|---|---|---|---|

## HANDOFF PARA OUTROS AGENTES
[SEO Agent / Ads Agent / Sales Agent / Content Agent — com tarefas específicas]

## FONTES CONSULTADAS
| Fonte | Tipo | Confiança | Observação |
|---|---|---|---|

## CONCLUSÃO
[A primeira ação baseada nessa pesquisa]`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `research_brief_${date}.md`, result);
        break;
      }

      // ─── DEEP RESEARCH ─────────────────────────────────────────────────────
      case 'deep': {
        console.log(`🔬 Deep Research Report: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} Brasil 2026 mercado`,
          `${topic} público dores comportamento`,
          `${topic} concorrentes análise`,
          `${topic} tendências futuro`,
        ], 4);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA, realizando análise profunda de mercado.
${companyCtx()}
Tema: "${topic}" | Profundidade: Deep Research | Data: ${date}

${trendData ? `DADOS DE PESQUISA EM TEMPO REAL:\n${trendData}\n---` : ''}

# DEEP RESEARCH REPORT — ${topic}

## OBJETIVO
[Objetivo desta pesquisa profunda]

## PREMISSAS
Região: ${location} | Público: ${audience} | Período: ${date}

## RESUMO EXECUTIVO
[Síntese executiva]

## ANÁLISE DE MERCADO
Tamanho estimado: | Crescimento: | Contexto:
Principais movimentos: | Barreiras de entrada:

## ANÁLISE DE PÚBLICO
Perfil: | Dor principal: | Desejo principal: | Objeções: | Linguagem real: | Canais:

## ANÁLISE COMPETITIVA
[Análise detalhada por tipo de concorrente + matriz]

## TENDÊNCIAS IDENTIFICADAS
[Top 5 tendências com força, recência e impacto]

## LACUNAS DE MERCADO
[O que o mercado não entrega bem — nossa maior oportunidade]

## SCORE DE OPORTUNIDADE GERAL
Nota: X/100 | Classificação: [Prioridade máxima / Alta / Boa / Baixa]

## SCORE DE CONFIANÇA
Nota: X/100 | Classificação: [Alta / Boa / Moderada / Baixa]

## OPORTUNIDADES PRIORIZADAS
P1: P2: P3:

## RISCOS
[Riscos de mercado + riscos de pesquisa + Red Flags]

## ESTRATÉGIA DE ENTRADA RECOMENDADA
[Caminho de menor risco para maior oportunidade]

## PLANO DE VALIDAÇÃO
| Teste | Hipótese | Como executar | Métrica | Prazo | Custo estimado |
|---|---|---|---|---|---|

## HANDOFF PARA AGENTES
| Agente | Tarefa específica | Entregável esperado |
|---|---|---|

## FONTES CONSULTADAS
[Lista com classificação A/B/C/D]

## CONCLUSÃO
[Primeira ação e por que agora]`, 6000);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `deep_research_${date}.md`, result);
        break;
      }

      // ─── IDEIAS DE CONTEÚDO ────────────────────────────────────────────────
      case 'content-ideas': {
        console.log('💡 Gerando ideias de conteúdo baseadas em pesquisa...\n');
        const trendData = await searchWithTavily([
          `${CONFIG.company.sector} conteúdo viral 2026`,
          'lean ia automação pequena empresa tendência conteúdo',
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Data: ${date}

${trendData ? `TENDÊNCIAS ATUAIS:\n${trendData}\n---` : ''}

# IDEIAS DE CONTEÚDO BASEADAS EM PESQUISA

## TOP 10 IDEIAS PRIORIZADAS
Para cada ideia:
TEMA: | TENDÊNCIA RELACIONADA: | PÚBLICO: | CANAL: | FORMATO: | GANCHO: | PROMESSA: | CTA: | PRIORIDADE: | KEYWORDS SEO (se aplicável):

## SÉRIE DE CONTEÚDO RECOMENDADA
[Sequência de 5-7 posts que contam uma história]

## CONTEÚDO DE CONVERSÃO (fundo de funil)
[2-3 ideias que levam direto ao diagnóstico gratuito]

## CALENDÁRIO SUGERIDO (próximas 2 semanas)
[Dia a dia com tema + canal + CTA]

## HANDOFF PARA CONTENT AGENT
Temas prioritários para produzir esta semana:`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `content_ideas_${date}.md`, result);
        break;
      }

      // ─── AUDIENCE DEEP ─────────────────────────────────────────────────────
      case 'audience-deep': {
        console.log('👥 Pesquisando audiência em profundidade...\n');
        const tavilyData = await researchAudienceWithTavily(CONFIG.company.sector);
        const result = await buildAudienceMapWithClaude({}, tavilyData);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `audience_deep_${date}.md`, result);
        break;
      }

      // ─── COMPETITIVE INTEL ─────────────────────────────────────────────────
      case 'competitive-intel': {
        console.log('🕵️  Construindo inteligência competitiva completa...\n');
        const { consolidated } = await buildCompetitiveIntelligenceReport();
        console.log(consolidated);
        saveOutput(path.join(dir, 'reports'), `competitive_intel_${date}.md`, consolidated);
        break;
      }

      // ─── VOZ DO CLIENTE ────────────────────────────────────────────────────
      case 'voice': {
        console.log(`🗣️  Análise de Voz do Cliente: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} reclamações reviews problemas`,
          `${topic} fórum dúvidas opiniões`,
          `${topic} clientes comentários`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema/público: "${topic}"

${trendData ? `DADOS DE PESQUISA — COMENTÁRIOS E REVIEWS:\n${trendData}\n---` : ''}

# VOZ DO CLIENTE — ${topic}

## PÚBLICO ANALISADO
[Perfil]

## DORES MAIS REPETIDAS (ordenadas por frequência)
* [Dor mais comum]

## FRASES REAIS OU PRÓXIMAS DO REAL
* "[Frase exata ou adaptada que o público diz]"

## DESEJOS EXPRESSOS
* [Desejo]

## OBJEÇÕES MAIS COMUNS
* [Objeção]

## EXPECTATIVAS NÃO ATENDIDAS PELOS CONCORRENTES
* [Expectativa]

## LINGUAGEM QUE DEVE SER USADA NO MARKETING
* [Termo ou frase específica]

## LINGUAGEM A EVITAR
* [Termo ou frase que afasta]

## PROMESSAS QUE PODEM FUNCIONAR
* [Promessa baseada em dores reais]

## GATILHOS DE DECISÃO
* [O que faz o público agir]

## CONTEÚDOS QUE ESSE PÚBLICO CONSOME
* [Tipo de conteúdo]

## OFERTA QUE FAZ SENTIDO PARA ESSE PÚBLICO
[Oferta recomendada]

## HANDOFF RECOMENDADO
Ads Agent: [como usar isso em anúncio]
Content Agent: [como usar isso em conteúdo]
Sales Agent: [como usar isso em script de venda]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `voice_customer_${date}.md`, result);
        break;
      }

      // ─── LACUNAS DE MERCADO ────────────────────────────────────────────────
      case 'gaps': {
        console.log(`🔍 Identificando lacunas de mercado: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} problemas não resolvidos reclamações`,
          `${topic} concorrentes fraquezas`,
          `${topic} o que falta no mercado`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema/mercado: "${topic}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# LACUNAS DE MERCADO — ${topic}

## MERCADO ANALISADO
[Resumo do mercado]

## LACUNAS IDENTIFICADAS (ordenadas por oportunidade)

### Lacuna 1 — [Nome]
TIPO: [Preço / Atendimento / Qualidade / Clareza / Personalização / Outra]
EVIDÊNCIA: [Como foi percebida]
CONCORRENTES AFETADOS: [Quem não resolve isso]
OPORTUNIDADE: [Como aproveitar]
OFERTA SUGERIDA: [Oferta]
MENSAGEM COMERCIAL: [Mensagem]
PRIORIDADE: P1/P2/P3

### Lacuna 2 — [Nome]
[idem]

### Lacuna 3 — [Nome]
[idem]

## MATRIZ DE LACUNAS
| Lacuna | Frequência | Urgência | Oportunidade Comercial | Facilidade | Prioridade |
|---|---|---|---|---|---|

## OPORTUNIDADE DE DIFERENCIAÇÃO
[Como SmartOps pode se posicionar para cobrir essas lacunas]

## PRÓXIMAS AÇÕES
P1: P2: P3:

## HANDOFF
[Qual agente deve transformar cada lacuna em ação]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `market_gaps_${date}.md`, result);
        break;
      }

      // ─── AVALIAÇÃO DE TENDÊNCIA ────────────────────────────────────────────
      case 'trend-eval': {
        console.log(`📊 Avaliando: tendência saudável vs modinha — "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} crescimento dados recentes`,
          `${topic} sustentabilidade mercado`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.

Tema a avaliar: "${topic}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# AVALIAÇÃO DE TENDÊNCIA — ${topic}

## TEMA
[Descrição clara do tema]

## CLASSIFICAÇÃO
[Tendência Saudável / Sinal Emergente / Modinha / Ruído / Tendência Saturada]

## EVIDÊNCIAS QUE SUSTENTAM A CLASSIFICAÇÃO
* [Evidência 1]
* [Evidência 2]
* [Evidência 3]

## POR QUE PODE CRESCER (ou por que não vai crescer)
[Motivo baseado em dados]

## RISCO DE SATURAÇÃO
Baixo / Médio / Alto | Prazo estimado:

## SINAIS QUE MOSTRAM QUE É TENDÊNCIA SAUDÁVEL
* Cresce em várias fontes: Sim/Não
* Tem aplicação prática: Sim/Não
* Resolve dor real: Sim/Não
* Demanda aparente: Sim/Não
* Pode gerar receita: Sim/Não

## SINAIS QUE MOSTRAM QUE É MODINHA
* Depende de viral sem base: Sim/Não
* Muita gente copiando igual: Sim/Não
* Baixa diferenciação: Sim/Não
* Sem dados sólidos: Sim/Não

## COMO USAR SEM COPIAR TODO MUNDO
[Aplicação inteligente — como SmartOps pode aproveitar com diferenciação]

## RECOMENDAÇÃO
[O que fazer agora]

## PRÓXIMA AÇÃO
[Primeiro passo]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `trend_eval_${date}.md`, result);
        break;
      }

      // ─── BRIEF PARA CONTENT AGENT ──────────────────────────────────────────
      case 'content-brief': {
        console.log(`📝 Gerando brief de pesquisa para Content Agent: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} perguntas frequentes público`,
          `${topic} conteúdo educativo dúvidas`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# BRIEFING PARA CONTENT AGENT — ${topic}

## TEMA CENTRAL
## CLUSTER PRINCIPAL
## INTENÇÃO DO PÚBLICO (Informacional / Educativo / Decisório)

## IDEIAS DE CONTEÚDO POR CANAL
| Tema | Intenção | Canal | Formato | Gancho | CTA |
|---|---|---|---|---|---|

## PERGUNTAS FREQUENTES DO PÚBLICO
* [Pergunta que o público faz]

## PALAVRAS E TERMOS IMPORTANTES
* [Termo que o público usa]

## CONTEÚDOS DE FUNDO DE FUNIL (perto da compra)
* [Tema que leva à conversão]

## CONTEÚDO EM SÉRIE RECOMENDADA
[5-7 posts conectados que educam e convertem]

## ENTREGÁVEIS ESPERADOS DO CONTENT AGENT
* Posts: | Carrosséis: | Reels: | Artigos:

## PRIORIDADE DE PRODUÇÃO
P1: | P2: | P3:`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `content_brief_${date}.md`, result);
        break;
      }

      // ─── BRIEF PARA ADS AGENT ──────────────────────────────────────────────
      case 'ads-brief': {
        console.log(`📢 Gerando brief para Ads Agent: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} anúncios campanhas estratégia`,
          `${topic} dores público promessas`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema de campanha: "${topic}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# BRIEFING PARA ADS AGENT — ${topic}

## PÚBLICO-ALVO DA CAMPANHA
## DOR PRINCIPAL
## DESEJO PRINCIPAL

## PROMESSA PRINCIPAL DA CAMPANHA
[Resultado claro e verificável]

## ÂNGULOS DE CRIATIVO
1. [Ângulo — dor]
2. [Ângulo — resultado]
3. [Ângulo — prova social]

## OBJEÇÕES PARA QUEBRAR NOS ANÚNCIOS
* [Objeção e como responder visualmente]

## GANCHOS (primeiras 3 segundos / primeira linha)
* [Gancho 1]
* [Gancho 2]
* [Gancho 3]

## CTA PRINCIPAL
[CTA]

## CANAIS RECOMENDADOS
Meta Ads: Sim/Não | Google Ads: Sim/Não | LinkedIn Ads: Sim/Não | YouTube Ads: Sim/Não

## MÉTRICAS DE SUCESSO DA CAMPANHA
CTR esperado: | CPC máximo: | CPA máximo: | Conversão esperada:

## ENTREGÁVEIS PARA O ADS AGENT
Criativos: | Copies: | Públicos: | Segmentações sugeridas:`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `ads_brief_${date}.md`, result);
        break;
      }

      // ─── BRIEF PARA SEO AGENT ──────────────────────────────────────────────
      case 'seo-brief': {
        console.log(`🔍 Gerando brief para SEO Agent: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} palavras chave busca SEO`,
          `${topic} perguntas Google dúvidas`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema SEO: "${topic}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# BRIEFING PARA SEO AGENT — ${topic}

## TEMA PRINCIPAL
## INTENÇÃO DE BUSCA DOMINANTE
Informacional / Comercial / Transacional / Navegacional

## CLUSTERS SUGERIDOS
* [Cluster 1] — palavras satélite:
* [Cluster 2] — palavras satélite:
* [Cluster 3] — palavras satélite:

## PERGUNTAS FREQUENTES (PAA — People Also Ask)
* [Pergunta 1]
* [Pergunta 2]
* [Pergunta 3]

## PÁGINAS PILAR RECOMENDADAS
* [Página 1]
* [Página 2]

## CONTEÚDOS SATÉLITES
* [Conteúdo]

## OPORTUNIDADES DE PALAVRA-CHAVE (baixa competição / boa intenção)
| Keyword | Volume estimado | Competição | Tipo | Prioridade |
|---|---|---|---|---|

## ENTREGÁVEIS PARA O SEO AGENT
Artigos pilar: | Conteúdos satélite: | Landing pages:`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `seo_brief_${date}.md`, result);
        break;
      }

      // ─── BRIEF PARA SALES AGENT ────────────────────────────────────────────
      case 'sales-brief': {
        console.log(`💼 Gerando brief para Sales Agent: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} objeções clientes não compram`,
          `${topic} argumentos venda convincentes`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Contexto de venda: "${topic}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# BRIEFING PARA SALES AGENT — ${topic}

## PÚBLICO-ALVO DA VENDA
## DOR PRINCIPAL
## SITUAÇÃO ATUAL DO LEAD (antes de comprar)

## OBJEÇÕES MAPEADAS
| Objeção | Frequência | Resposta Recomendada |
|---|---|---|

## ARGUMENTOS COMERCIAIS
* [Argumento baseado em ROI ou dor]

## PROVAS QUE VENCEM OBJEÇÕES
* [Prova social / dado / caso]

## PERGUNTAS DE DIAGNÓSTICO PARA REUNIÃO
* [Pergunta que revela dor]

## GATILHOS DE DECISÃO
* [O que faz o lead fechar]

## PROPOSTA DE VALOR
[Frase concisa que resume o valor único]

## SCRIPT INICIAL DE ABORDAGEM
[Script de primeiro contato]

## ENTREGÁVEIS PARA O SALES AGENT
Scripts: | Argumentários: | Perguntas de qualificação:`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `sales_brief_${date}.md`, result);
        break;
      }

      // ─── BRIEF PARA LEAN CONSULTING ────────────────────────────────────────
      case 'lean-brief': {
        const targetSector = sector || topic;
        console.log(`⚙️  Gerando brief para Lean Consulting Agent: "${targetSector}"\n`);
        const trendData = await searchWithTavily([
          `${targetSector} problemas processos operacionais`,
          `${targetSector} ineficiências desperdício retrabalho`,
          `automação ${targetSector} processos manuais`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Setor/tema para consultoria Lean: "${targetSector}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# BRIEFING PARA LEAN CONSULTING AGENT — ${targetSector}

## SETOR ANALISADO
## CONTEXTO DO MERCADO

## PROBLEMAS OPERACIONAIS COMUNS
* [Problema]

## DESPERDÍCIOS LEAN PROVÁVEIS (8 desperdícios)
* Superprodução: | Espera: | Transporte: | Processamento extra: |
* Estoque: | Movimento: | Defeitos: | Talento subutilizado:

## PROCESSOS CRÍTICOS QUE MAIS CAUSAM DOR
* [Processo]

## AUTOMAÇÕES POSSÍVEIS
* [Automação com ferramenta]

## OPORTUNIDADE DE OFERTA DE CONSULTORIA
[Pacote de serviço recomendado]

## PERGUNTAS PARA DIAGNÓSTICO
* [Pergunta que o Lean Agent fará no cliente]

## INDICADORES A LEVANTAR
* [KPI que mostra o problema]

## ENTREGÁVEIS PARA O LEAN AGENT
Diagnóstico: | VSM: | Plano de ação: | Indicadores:`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `lean_brief_${date}.md`, result);
        break;
      }

      // ─── PESQUISA POR SETOR ────────────────────────────────────────────────
      case 'sector': {
        const targetSector = sector || topic || 'Autoescolas';
        console.log(`🏭 Pesquisa setorial: "${targetSector}"\n`);
        const trendData = await searchWithTavily([
          `${targetSector} problemas gestão processos Brasil`,
          `${targetSector} automação oportunidade`,
          `${targetSector} dores proprietários gestores`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}

Setor a pesquisar: "${targetSector}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# PESQUISA SETORIAL — ${targetSector}

## SETOR
## CONTEXTO DO MERCADO
[Tamanho, crescimento, número de empresas no Brasil]

## PRINCIPAIS DORES DO SETOR
* [Dor 1 — mais impactante]
* [Dor 2]
* [Dor 3]

## PROBLEMAS OPERACIONAIS COMUNS
* [Problema]

## TENDÊNCIAS
* [Tendência relevante para o setor]

## PERFIL DO DECISOR
Cargo: | Faixa etária: | Canais que usa: | Como toma decisões:

## CONCORRÊNCIA (quem já atende esse setor)
* [Concorrente ou tipo]

## OPORTUNIDADES DE CONSULTORIA LEAN
* [Oportunidade]

## OPORTUNIDADES DE AUTOMAÇÃO
* [Automação possível com n8n / WhatsApp / IA]

## OPORTUNIDADES DE MARKETING
* [Tipo de campanha / conteúdo que funciona]

## OFERTA RECOMENDADA
[Pacote de entrada para esse setor]

## TICKET ESTIMADO
Baixo (<R$2k) / Médio (R$2k-8k) / Alto (>R$8k)

## FACILIDADE DE VENDA
Alta / Média / Baixa | Por que:

## PRÓXIMO TESTE
[Como validar interesse desse setor em 1 semana]

## HANDOFF
Lean Agent: | Ads Agent: | Sales Agent:`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `sector_${targetSector.replace(/\s+/g, '_')}_${date}.md`, result);
        break;
      }

      // ─── PESQUISA LOCAL ────────────────────────────────────────────────────
      case 'local': {
        console.log(`📍 Pesquisa local: "${topic}" em ${location}\n`);
        const trendData = await searchWithTavily([
          `${topic} ${location}`,
          `${topic} mercado local pequenas empresas ${location}`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}" | Região: ${location}

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# PESQUISA LOCAL — ${topic} | ${location}

## REGIÃO
## MERCADO LOCAL
## PÚBLICO LOCAL
[Perfil específico da região]

## CONCORRENTES LOCAIS
* [Concorrente ou tipo na região]

## DORES LOCAIS (específicas da região)
* [Dor]

## OPORTUNIDADES
* [Oportunidade específica para a região]

## CANAIS LOCAIS MAIS EFETIVOS
* Google Business Profile
* Instagram com geolocalização
* LinkedIn local
* Indicações e networking
* Eventos locais

## AÇÃO RECOMENDADA
[Primeira ação para esse mercado local]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `local_${date}.md`, result);
        break;
      }

      // ─── PESQUISA DE PRECIFICAÇÃO ──────────────────────────────────────────
      case 'pricing': {
        console.log(`💰 Pesquisa de precificação: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} preço consultoria custo Brasil`,
          `${topic} quanto custa serviço`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Serviço/produto a precificar: "${topic}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# PESQUISA DE PRECIFICAÇÃO — ${topic}

## SERVIÇO/PRODUTO
## CONTEXTO DO MERCADO

## PREÇOS ENCONTRADOS
| Fonte/Concorrente | Preço/Faixa | Modelo | Observação |
|---|---|---|---|

## MODELOS DE COBRANÇA NO MERCADO
Fixo por projeto: | Mensalidade: | Por hora: | Por performance: | Híbrido:

## PERCEPÇÃO DE VALOR DO PÚBLICO
[Como o mercado enxerga o valor desse serviço]

## FATORES QUE AUMENTAM VALOR PERCEBIDO
* [Fator]

## FATORES QUE DIMINUEM VALOR PERCEBIDO
* [Fator]

## FAIXA RECOMENDADA PARA TESTE
Entrada: R$ | Padrão: R$ | Premium: R$

## RISCO DE PRECIFICAÇÃO
[Risco de preço muito alto ou muito baixo]

## PRÓXIMO TESTE
[Como testar o preço com o menor risco]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `pricing_${date}.md`, result);
        break;
      }

      // ─── PESQUISA DE CANAIS ────────────────────────────────────────────────
      case 'channels': {
        console.log(`📡 Pesquisa de canais: "${topic}" para "${audience}"\n`);
        const trendData = await searchWithTavily([
          `${topic} ${audience} melhores canais aquisição`,
          `${topic} onde anunciar consultoria`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}" | Público: "${audience}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# PESQUISA DE CANAIS — ${topic}

## PÚBLICO
## OBJETIVO (Tráfego / Leads / Vendas)

## CANAIS ANALISADOS
| Canal | Por que usar | Tipo de conteúdo ideal | Formato | Custo | Prioridade |
|---|---|---|---|---|---|

## CANAL PRINCIPAL RECOMENDADO
[Canal] | Motivo: | Primeiro passo:

## CANAIS DE APOIO
* [Canal] — Como usar:

## CANAIS A EVITAR POR ENQUANTO
* [Canal] — Por que não agora:

## COMO TESTAR (menor custo, maior aprendizado)
[Teste de canal]

## MÉTRICA DE VALIDAÇÃO DE CANAL
[O que medir para saber se o canal funciona]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `channels_${date}.md`, result);
        break;
      }

      // ─── PESQUISA DE MENSAGEM ──────────────────────────────────────────────
      case 'message': {
        console.log(`💬 Pesquisa de mensagem: "${topic}" para "${audience}"\n`);
        const trendData = await searchWithTavily([
          `${topic} ${audience} promessas que funcionam`,
          `${topic} copy conversão linguagem`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}" | Público: "${audience}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# PESQUISA DE MENSAGEM — ${topic}

## PÚBLICO
## DOR CENTRAL
## DESEJO CENTRAL
## OBJEÇÃO PRINCIPAL

## PROMESSAS QUE PODEM FUNCIONAR (baseadas em dores reais)
* [Promessa 1]
* [Promessa 2]
* [Promessa 3]

## FRASES QUE PODEM RESSOAR
* "[Frase]"
* "[Frase]"
* "[Frase]"

## FRASES A EVITAR
* "[Frase genérica ou distante]"

## TOM RECOMENDADO
[Tom de voz — direto / técnico / empático / urgente / educativo]

## GANCHOS PARA ANÚNCIO OU CONTEÚDO
* [Gancho 1 — primeiros 3 segundos]
* [Gancho 2]

## CTA RECOMENDADO
[CTA]

## HANDOFF
Copywriter Agent: [use essas promessas e frases]
Ads Agent: [use esses ganchos]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `message_${date}.md`, result);
        break;
      }

      // ─── PESQUISA PARA OFERTA ──────────────────────────────────────────────
      case 'offer': {
        console.log(`🎯 Pesquisa para criar oferta: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} dor mercado problema não resolvido`,
          `${topic} serviço consultoria oferta`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema da oferta: "${topic}" | Público: "${audience}"

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# PESQUISA PARA OFERTA — ${topic}

## DOR DE MERCADO IDENTIFICADA
## PÚBLICO-ALVO
## SITUAÇÃO ATUAL DO PÚBLICO (antes de comprar)
## SOLUÇÕES EXISTENTES NO MERCADO (e por que são ruins)
## LACUNAS (o que falta)

## OFERTA RECOMENDADA
[Nome e descrição do serviço/pacote]

## PROMESSA PRINCIPAL
[Resultado claro e mensurável]

## ENTREGÁVEIS
* [Entregável 1]
* [Entregável 2]

## OBJEÇÕES A ANTECIPAR
* [Objeção e como quebrar]

## PROVAS NECESSÁRIAS
* [Prova social / dado / garantia]

## MODELO DE ENTREGA
Diagnóstico: | Projeto fechado: | Mensalidade: | Híbrido:

## PREÇO PERCEBIDO
Baixo / Médio / Alto | Faixa de mercado:

## TESTE DE VALIDAÇÃO
[Como testar a oferta com 3-5 potenciais clientes]

## CANAIS DE VENDA
[Como distribuir / vender]

## HANDOFF
Sales Agent: | Pricing Agent: | Proposal Agent:`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `offer_research_${date}.md`, result);
        break;
      }

      // ─── RADAR DE MERCADO ──────────────────────────────────────────────────
      case 'radar': {
        console.log(`📡 Gerando Radar de Mercado: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} novidades semana tendências`,
          `${topic} mudanças mercado recente`,
          `${topic} concorrentes novos movimentos`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA atuando como radar contínuo de mercado.
${companyCtx()}
Tema monitorado: "${topic}" | Período: ${date}

${trendData ? `DADOS EM TEMPO REAL:\n${trendData}\n---` : ''}

# RADAR DE MERCADO — ${topic}

## PERÍODO
${date}

## TEMA MONITORADO

## PRINCIPAIS SINAIS (ordenados por importância)
1. [Sinal]
2. [Sinal]
3. [Sinal]
4. [Sinal]
5. [Sinal]

## O QUE MUDOU
[Resumo das mudanças perceptíveis]

## O QUE PERMANECE IGUAL
[O que não mudou e ainda é relevante]

## OPORTUNIDADES EMERGENTES
* [Oportunidade]

## RISCOS EMERGENTES
* [Risco]

## AGENTES QUE DEVEM SER ACIONADOS
| Agente | Sinal que o aciona | Ação recomendada |
|---|---|---|

## AÇÕES RECOMENDADAS
P1: [Urgente — esta semana]
P2: [Importante — próximas 2 semanas]
P3: [Monitorar — este mês]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `radar_${date}.md`, result);
        break;
      }

      // ─── RELATÓRIO SEMANAL ─────────────────────────────────────────────────
      case 'weekly': {
        console.log('📊 Gerando Relatório Semanal de Inteligência de Mercado...\n');
        const trendData = await searchWithTavily([
          `lean automação IA PME Brasil tendências semana`,
          `consultoria processos pequenas empresas novidades`,
          `automação n8n IA negócios novidades recentes`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Período: semana de ${date}

${trendData ? `DADOS DE PESQUISA DESTA SEMANA:\n${trendData}\n---` : ''}

# RELATÓRIO SEMANAL DE INTELIGÊNCIA DE MERCADO

## PERÍODO
Semana de ${date}

## RESUMO EXECUTIVO
[3 frases sobre o que mais importou esta semana]

## TENDÊNCIAS DA SEMANA
| Tendência | Força | Evidência | Oportunidade | Risco |
|---|---|---|---|---|

## CONCORRENTES EM MOVIMENTO
| Concorrente/Tipo | Movimento | Impacto | Resposta Recomendada |
|---|---|---|---|

## CONTEÚDOS EM ALTA
| Tema | Canal | Por que importa | Como usar |
|---|---|---|---|

## DORES DO PÚBLICO (sinais recentes)
* [Dor identificada]

## OPORTUNIDADES COMERCIAIS DA SEMANA
* [Oportunidade]

## RISCOS DE MERCADO
* [Risco]

## RECOMENDAÇÕES PARA A PRÓXIMA SEMANA
P1 — Prioridade Máxima: [Ação urgente]
P2 — Alta: [Ação importante]
P3 — Média: [Ação planejada]

## HANDOFF PARA OUTROS AGENTES
| Agente | Tarefa da semana |
|---|---|

## PRÓXIMO RADAR
[O que monitorar com mais atenção na próxima semana]`, 5000);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `weekly_intel_${date}.md`, result);
        break;
      }

      // ─── ALERTA DE MERCADO ─────────────────────────────────────────────────
      case 'alert': {
        console.log(`🚨 Alerta de Mercado: "${topic}" (tipo: ${alertType})\n`);
        const trendData = await searchWithTavily([
          `${topic} mudança urgente recente`,
          `${topic} impacto oportunidade risco`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA emitindo um alerta de mercado.
${companyCtx()}
Assunto do alerta: "${topic}" | Data: ${date}

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# ALERTA DE MERCADO

## TIPO DE ALERTA
${alertType} [Tendência / Concorrente / Risco / Oportunidade]

## O QUE ACONTECEU
[Descrição clara e objetiva]

## EVIDÊNCIA
[Fontes ou sinais que confirmam]

## IMPACTO POTENCIAL PARA SMARTOPS IA
Marketing: | Vendas: | Produto: | Posicionamento:

## URGÊNCIA
Baixa / Média / Alta

## JANELA DE OPORTUNIDADE (se aplicável)
[Quanto tempo temos para agir]

## RECOMENDAÇÃO
[Ação]

## PRÓXIMO AGENTE QUE DEVE AGIR
[Agente + ação específica]

## CRITÉRIO PARA ESCALAR
[Quando isso vira prioridade máxima]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `alert_${Date.now()}.md`, result);
        break;
      }

      // ─── HIPÓTESE COMERCIAL ────────────────────────────────────────────────
      case 'hypothesis': {
        console.log(`🧪 Hipótese comercial: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} demanda sinal mercado`,
          `${topic} potencial comercial evidência`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Hipótese: "${topic}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# HIPÓTESE COMERCIAL — ${topic}

## HIPÓTESE
[Descrição clara e testável]

## ORIGEM
[De onde veio o sinal ou ideia]

## TIPO
Mercado / Público / Concorrência / Produto / Conteúdo / Oferta

## EVIDÊNCIA INICIAL (sinais observados)
* [Evidência]

## CONFIANÇA ATUAL
Baixa / Média / Alta | Motivo:

## VEREDITO INICIAL
[Forte / Promissora / Incerta / Fraca / Arriscada]

## COMO VALIDAR
[Teste mínimo — sem investimento alto]

## MÉTRICA DE VALIDAÇÃO
[O que mede sucesso]

## CRITÉRIO PARA AVANÇAR
[Condição que confirma]

## CRITÉRIO PARA REJEITAR
[Condição que invalida]

## PRAZO DE VALIDAÇÃO
[Tempo razoável para ter resposta]

## STATUS
Aberta / Em teste / Validada / Rejeitada`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `hypothesis_${Date.now()}.md`, result);
        break;
      }

      // ─── COMPARATIVO DE NICHOS ─────────────────────────────────────────────
      case 'niche-compare': {
        console.log('⚖️  Comparativo de nichos para consultoria...\n');
        const nichos = CONFIG.sectors.slice(0, 6);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}

Compare estes nichos para a SmartOps priorizar consultoria:
${nichos.map((n, i) => `${i + 1}. ${n}`).join('\n')}

# COMPARATIVO DE NICHOS — SmartOps IA

## MATRIZ DE NICHOS
| Nicho | Dor operacional | Poder de compra | Facilidade de venda | Potencial automação | Recorrência | Prioridade |
|---|---|---|---|---|---|---|
${nichos.map(n => `| ${n} | | | | | | |`).join('\n')}

## ANÁLISE DETALHADA POR NICHO
${nichos.slice(0, 3).map(n => `
### ${n}
Dor principal: | Problema mais comum:
Oportunidade Lean: | Oportunidade automação:
Ticket provável: | Facilidade de acesso ao decisor:
Veredito: [Forte / Promissor / Incerto / Fraco]`).join('\n')}

## RANKING FINAL
1. [Nicho mais promissor] — Por que:
2. [Segundo] — Por que:
3. [Terceiro] — Por que:

## NICHO RECOMENDADO PARA COMEÇAR
[Nicho] | Motivo: | Primeiro passo:

## PRIMEIRO TESTE
[Como validar em 1 semana sem custo alto]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `niche_compare_${date}.md`, result);
        break;
      }

      // ─── MAPA DE INTELIGÊNCIA ──────────────────────────────────────────────
      case 'intel-map': {
        console.log(`🗺️  Mapa de Inteligência de Mercado: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} mercado público concorrentes`,
          `${topic} tendências oportunidades`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# MAPA DE INTELIGÊNCIA DE MERCADO — ${topic}

## MERCADO
[Visão geral]

## PÚBLICO
[Perfil e comportamento]

## DORES
* [Dor]

## DESEJOS
* [Desejo]

## CONCORRENTES
* [Concorrente ou tipo]

## TENDÊNCIAS
* [Tendência]

## LACUNAS
* [Lacuna de mercado]

## OPORTUNIDADES (priorizadas)
* P1: [Oportunidade mais urgente]
* P2: [Segunda oportunidade]
* P3: [Terceira]

## RISCOS
* [Risco]

## AÇÕES RECOMENDADAS
* [Ação imediata]

## HANDOFFS
| Agente | Tarefa específica |
|---|---|`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `intel_map_${date}.md`, result);
        break;
      }

      // ─── INTELIGÊNCIA PARA PROPOSTA ────────────────────────────────────────
      case 'proposal-intel': {
        console.log(`📄 Inteligência para proposta: "${topic}" | Público: "${audience}"\n`);
        const trendData = await searchWithTavily([
          `${topic} ${audience} dores problemas`,
          `${topic} ROI resultados consultoria`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Cliente/nicho: "${topic}" | Público: "${audience}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# INTELIGÊNCIA PARA PROPOSTA COMERCIAL

## CLIENTE OU NICHO
## CONTEXTO PROVÁVEL

## DORES PROVÁVEIS
* [Dor com impacto no negócio]

## IMPACTO FINANCEIRO PROVÁVEL
* [Custo do problema não resolvido]

## OPORTUNIDADES
* [Oportunidade de melhoria]

## LINGUAGEM RECOMENDADA
[Como falar com esse público — técnico, direto, empático]

## PROPOSTA DE VALOR
[Frase central da proposta]

## ARGUMENTOS PARA USAR
* [Argumento com dado]

## OBJEÇÕES PARA ANTECIPAR
* [Objeção] → [Resposta]

## PROVAS QUE AJUDAM
* [Prova social / dado / garantia]

## ESTRUTURA DE PROPOSTA SUGERIDA
1. Diagnóstico do problema
2. Impacto atual
3. Solução SmartOps
4. Resultados esperados
5. Investimento
6. Próximos passos`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `proposal_intel_${date}.md`, result);
        break;
      }

      // ─── PESQUISA PARA DIAGNÓSTICO GRATUITO ───────────────────────────────
      case 'diagnostic': {
        console.log(`🩺 Pesquisa para diagnóstico gratuito: "${audience}"\n`);
        const trendData = await searchWithTavily([
          `${audience} dores gestão processos reclamações`,
          `${audience} problemas operacionais frequentes`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Público para diagnóstico: "${audience}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# PESQUISA PARA DIAGNÓSTICO GRATUITO — ${audience}

## PÚBLICO-ALVO
## DOR QUE ATRAI ATENÇÃO
[Dor que justifica o diagnóstico]

## PROMESSA DO DIAGNÓSTICO
[O que a pessoa vai descobrir]

## PERGUNTAS DO DIAGNÓSTICO (para identificar dor e qualificar)
1. [Pergunta — processo atual]
2. [Pergunta — impacto financeiro]
3. [Pergunta — tentativas anteriores]
4. [Pergunta — urgência]
5. [Pergunta — decision maker]

## INDICADORES A LEVANTAR NO DIAGNÓSTICO
* [Indicador que revela o problema]

## PROBLEMAS QUE DEVEM APARECER
* [Problema esperado]

## SINAL DE LEAD QUALIFICADO
[O que indica que o lead é bom cliente]

## OFERTA APÓS DIAGNÓSTICO
[Serviço ou pacote a apresentar]

## SCRIPT DE ENCERRAMENTO
[Como apresentar a proposta ao final do diagnóstico]`);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `diagnostic_${date}.md`, result);
        break;
      }

      // ─── RESEARCH SPRINT ───────────────────────────────────────────────────
      case 'sprint': {
        console.log(`⚡ Research Sprint: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} resumo rápido oportunidade`,
          `${topic} público dores principais`,
        ], 2);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema do sprint: "${topic}"

${trendData ? `DADOS RÁPIDOS:\n${trendData}\n---` : ''}

# RESEARCH SPRINT — ${topic}

## OBJETIVO
[Em 1 frase]

## PRINCIPAIS ACHADOS (top 3-5)
* [Achado]

## OPORTUNIDADE PRINCIPAL
[Oportunidade com evidência]

## RISCO PRINCIPAL
[Risco a considerar]

## MENSAGEM RECOMENDADA
[Como falar sobre isso]

## PRÓXIMO TESTE
[Como validar em 48h]

## HANDOFF IMEDIATO
[Quem deve agir agora]`, 2000);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `sprint_${Date.now()}.md`, result);
        break;
      }

      // ─── SÍNTESE EXECUTIVA ─────────────────────────────────────────────────
      case 'executive': {
        console.log(`👔 Síntese Executiva de Decisão: "${topic}"\n`);
        const trendData = await searchWithTavily([`${topic} decisão mercado análise`]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Decisão a apoiar: "${topic}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# SÍNTESE EXECUTIVA DE DECISÃO

## DECISÃO A TOMAR
[Decisão clara e específica]

## RECOMENDAÇÃO
[Sim — avançar / Não — não avançar / Validar antes de decidir]

## CONFIANÇA NA RECOMENDAÇÃO
Alta / Média / Baixa | Motivo:

## CONCLUSÃO PRINCIPAL
[Em 2-3 frases]

## OPORTUNIDADE
[O que ganharíamos ao avançar]

## RISCO PRINCIPAL
[O que pode dar errado]

## TESTE RECOMENDADO (se incerto)
[Como validar antes de comprometer recursos]

## CRITÉRIO PARA AVANÇAR
[Condição]

## CRITÉRIO PARA PARAR
[Condição]

## PRÓXIMO PASSO
[Ação imediata — quem faz, quando e como medir]`, 2000);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `executive_${Date.now()}.md`, result);
        break;
      }

      // ─── HTML REPORT ──────────────────────────────────────────────────────
      case 'html-report': {
        console.log(`🌐 Gerando Interactive Report HTML: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} tendências oportunidades 2026`,
          `${topic} concorrentes mercado`,
        ]);
        const reportData = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}" | Data: ${date}
${trendData ? `DADOS:\n${trendData}\n---` : ''}

Gere um JSON estruturado para um relatório HTML interativo:

{
  "titulo": "${topic}",
  "data": "${date}",
  "resumo": "3 frases executivas",
  "score_confianca": {"nota": X, "classificacao": "Alta/Boa/Moderada/Baixa"},
  "tendencias": [
    {"nome": "", "classificacao": "Forte/Emergente/Modinha/Fraca", "impacto": "Alto/Médio/Baixo", "oportunidade": ""}
  ],
  "oportunidades": [
    {"titulo": "", "score": X, "impacto": "", "esforco": "Alto/Médio/Baixo", "prioridade": "P1/P2/P3"}
  ],
  "riscos": [{"titulo": "", "probabilidade": "Alta/Média/Baixa", "impacto": "Alto/Médio/Baixo"}],
  "dores_publico": ["string"],
  "concorrentes": [{"nome": "", "ponto_forte": "", "lacuna": ""}],
  "acoes": [{"prioridade": "P1", "acao": "", "agente": ""}],
  "handoffs": [{"agente": "", "tarefa": ""}]
}

Responda APENAS o JSON, sem markdown.`, 3000);

        let data;
        try { data = JSON.parse(reportData); } catch { data = { titulo: topic, data: date, resumo: reportData.slice(0, 200) }; }

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Research Report — ${data.titulo}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0A0A0F;color:#E5E7EB;font-family:'Inter',sans-serif;min-height:100vh;padding:24px}
h1,h2,h3{font-family:'Bebas Neue',sans-serif;letter-spacing:.05em}
.header{border-bottom:1px solid #1F2937;padding-bottom:20px;margin-bottom:28px}
.header h1{font-size:2.5rem;color:#fff;margin-bottom:4px}
.header p{color:#9CA3AF;font-size:.9rem}
.score-badge{display:inline-block;padding:4px 14px;border-radius:9999px;font-size:.8rem;font-weight:600;background:#7C3AED;color:#fff;margin-left:12px;vertical-align:middle}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:28px}
.card{background:#0B0F17;border:1px solid #1F2937;border-radius:12px;padding:20px}
.card h2{font-size:1.1rem;color:#7C3AED;margin-bottom:14px;text-transform:uppercase}
.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.72rem;font-weight:600;margin-right:4px}
.tag-forte{background:#10B981;color:#fff}
.tag-emergente{background:#3B82F6;color:#fff}
.tag-fraca,.tag-modinha{background:#6B7280;color:#fff}
.tag-p1{background:#7C3AED;color:#fff}
.tag-p2{background:#1F2937;color:#9CA3AF;border:1px solid #374151}
.tag-p3{background:#111827;color:#6B7280;border:1px solid #1F2937}
.item{padding:10px 0;border-bottom:1px solid #1F2937}
.item:last-child{border-bottom:none}
.item-title{font-size:.9rem;font-weight:500;color:#F9FAFB;margin-bottom:3px}
.item-sub{font-size:.78rem;color:#9CA3AF}
.resumo{background:#0B0F17;border-left:3px solid #7C3AED;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;font-size:.95rem;line-height:1.6;color:#D1D5DB}
footer{text-align:center;margin-top:40px;color:#4B5563;font-size:.78rem;padding-top:20px;border-top:1px solid #1F2937}
</style>
</head>
<body>
<div class="header">
  <h1>${data.titulo} <span class="score-badge">${data.score_confianca?.nota || '—'}/100</span></h1>
  <p>SmartOps IA · Market Intelligence · ${data.data}</p>
</div>
<div class="resumo">${data.resumo}</div>
<div class="grid">
  <div class="card">
    <h2>Tendências</h2>
    ${(data.tendencias||[]).map(t=>`<div class="item"><div class="item-title"><span class="tag tag-${(t.classificacao||'').toLowerCase()}">${t.classificacao}</span> ${t.nome}</div><div class="item-sub">${t.oportunidade}</div></div>`).join('')}
  </div>
  <div class="card">
    <h2>Oportunidades</h2>
    ${(data.oportunidades||[]).map(o=>`<div class="item"><div class="item-title"><span class="tag tag-${(o.prioridade||'P3').toLowerCase()}">${o.prioridade}</span> ${o.titulo}</div><div class="item-sub">Score: ${o.score}/100 · Esforço: ${o.esforco}</div></div>`).join('')}
  </div>
  <div class="card">
    <h2>Riscos</h2>
    ${(data.riscos||[]).map(r=>`<div class="item"><div class="item-title">${r.titulo}</div><div class="item-sub">Probabilidade: ${r.probabilidade} · Impacto: ${r.impacto}</div></div>`).join('')}
  </div>
  <div class="card">
    <h2>Dores do Público</h2>
    ${(data.dores_publico||[]).map(d=>`<div class="item"><div class="item-title">· ${d}</div></div>`).join('')}
  </div>
  <div class="card">
    <h2>Concorrentes</h2>
    ${(data.concorrentes||[]).map(c=>`<div class="item"><div class="item-title">${c.nome}</div><div class="item-sub">Forte: ${c.ponto_forte}<br>Lacuna: ${c.lacuna}</div></div>`).join('')}
  </div>
  <div class="card">
    <h2>Próximas Ações</h2>
    ${(data.acoes||[]).map(a=>`<div class="item"><div class="item-title"><span class="tag tag-${(a.prioridade||'P3').toLowerCase()}">${a.prioridade}</span> ${a.acao}</div><div class="item-sub">→ ${a.agente}</div></div>`).join('')}
  </div>
</div>
<footer>SmartOps IA · Marketing Research Agent Enterprise v2.0.0 · Breno Luiz · (31) 97203-9180</footer>
</body></html>`;

        const htmlPath = path.join(dir, 'reports', `interactive_report_${date}.html`);
        fs.writeFileSync(htmlPath, html, 'utf-8');
        console.log(`  ✓ ${htmlPath}`);
        break;
      }

      // ─── DECISION MEMO (Camada 4) ─────────────────────────────────────────
      case 'decision-memo': {
        console.log(`📋 Decision Memo: "${topic}"\n`);
        const trendData = await searchWithTavily([`${topic} mercado dados evidências`]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Decisão: "${topic}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# DECISION MEMO — ${topic}

## DECISÃO
[O que precisa ser decidido]

## CONTEXTO
[Situação atual]

## OPÇÕES
1. [Opção — Avançar]
2. [Opção — Validar antes]
3. [Opção — Não priorizar]

## ANÁLISE
[Resumo da análise de mercado]

## EVIDÊNCIAS PRINCIPAIS
| Evidência | Fonte | Nível | Triangulação (Mercado/Cliente/Concorrente) |
|---|---|---|---|

## NÍVEL DE EVIDÊNCIA GERAL
Forte / Boa / Promissora / Fraca / Insuficiente | Motivo:

## MATRIZ DE TRIANGULAÇÃO
| Hipótese | Mercado confirma? | Cliente confirma? | Concorrente confirma? | Confiança |
|---|---|---|---|---|

## RECOMENDAÇÃO
[Avançar / Validar / Pausar / Não priorizar] | Motivo:

## RISCOS
* [Risco]

## TESTE RECOMENDADO
[Menor teste útil]

## CRITÉRIO PARA AVANÇAR
[Condição]

## CRITÉRIO PARA PARAR
[Condição]

## PRÓXIMA AÇÃO
[Ação imediata — quem faz, quando, métrica]`, 3000);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `decision_memo_${Date.now()}.md`, result);
        break;
      }

      // ─── MARKET MAP (Camada 4) ─────────────────────────────────────────────
      case 'market-map': {
        console.log(`🗺️  Market Map: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} mercado segmentos público concorrentes`,
          `${topic} tendências canais oportunidades`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Mercado: "${topic}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# MARKET MAP — ${topic}

## MERCADO
Contexto: | Tamanho estimado: | Crescimento:

## SEGMENTOS
* [Segmento 1]
* [Segmento 2]

## PÚBLICOS
* [Público 1]
* [Público 2]

## CONCORRENTES
| Concorrente | Oferta | Força | Fraqueza | Lacuna |
|---|---|---|---|---|

## CANAIS RELEVANTES
* [Canal + como usar]

## DORES PRINCIPAIS
* [Dor]

## TENDÊNCIAS
| Tendência | Força | Impacto | Classificação |
|---|---|---|---|

## OPORTUNIDADES
| Oportunidade | Score | Dor | Esforço | Prioridade |
|---|---|---|---|---|

## RISCOS
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|

## OPORTUNIDADE PRINCIPAL
[A melhor oportunidade agora]

## PRÓXIMA AÇÃO
[Primeiro passo]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `market_map_${date}.md`, result);
        break;
      }

      // ─── TEST PLAN (Camada 4) ──────────────────────────────────────────────
      case 'test-plan': {
        console.log(`🧪 Plano de Teste: "${topic}"\n`);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Hipótese a testar: "${topic}"

# PLANO DE TESTE — ${topic}

## HIPÓTESE
[Hipótese clara e testável]

## OBJETIVO
[O que queremos validar]

## PÚBLICO
[Quem participará do teste]

## TESTE ESCOLHIDO
Tipo: [Interesse/Demanda/Comercial/Pagamento]
Como: [Descrição]
Canal: [Onde testar]
Custo estimado: [Custo]
Duração: [Prazo]

## ENTREGÁVEL DO TESTE
[O que será criado: post, página, anúncio, diagnóstico]

## MÉTRICA PRINCIPAL
[O que medir]

## VOLUME MÍNIMO
[Quantas respostas/cliques/leads precisamos]

## CRITÉRIO DE SUCESSO
[Condição que confirma a hipótese]

## CRITÉRIO DE PARADA
[Condição que invalida]

## INVESTIMENTO MÁXIMO
R$ [Valor máximo antes de decidir]

## PRÓXIMA AÇÃO SE CONFIRMAR
[O que fazer se der certo]

## PRÓXIMA AÇÃO SE FALHAR
[O que fazer se não der certo]

## RESPONSÁVEL
[Agente ou pessoa]

## PRAZO PARA ANÁLISE
[Data]`, 2000);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `test_plan_${Date.now()}.md`, result);
        break;
      }

      // ─── HANDOFF BRIEF (Camada 4) ──────────────────────────────────────────
      case 'handoff-brief': {
        const targetAgent = getArg('agent', 'Ads Agent');
        console.log(`📤 Handoff Brief para ${targetAgent}: "${topic}"\n`);
        const trendData = await searchWithTavily([`${topic} ${audience} dados recentes`]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Pesquisa: "${topic}" | Público: "${audience}" | Agente destino: ${targetAgent}

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# HANDOFF BRIEF — Para ${targetAgent}

## PESQUISA BASE
Tema: "${topic}" | Data: ${date}

## AGENTE DESTINO
${targetAgent}

## OBJETIVO DO HANDOFF
[O que o agente destino deve fazer com essa pesquisa]

## PRINCIPAIS INSIGHTS (Top 5)
* [Insight]

## PÚBLICO
Perfil: | Dor principal: | Desejo: | Objeções: | Linguagem:

## OPORTUNIDADE
[Oportunidade identificada]

## RISCOS A CONSIDERAR
* [Risco]

## ENTREGÁVEL ESPERADO DO AGENTE
[O que ${targetAgent} deve criar]

## MENSAGEM PRINCIPAL
[A mensagem mais forte baseada na pesquisa]

## MÉTRICAS DE SUCESSO
[Como medir se o agente usou bem os insights]

## DADOS COMPLEMENTARES DISPONÍVEIS
[Links ou arquivos de referência se existirem]`, 2000);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `handoff_${targetAgent.replace(/\s+/g, '_')}_${Date.now()}.md`, result);
        break;
      }

      // ─── RELATÓRIO PARA CLIENTE (Camada 5) ────────────────────────────────
      case 'client-report': {
        const clientName = getArg('client', 'Cliente');
        console.log(`📊 Relatório Premium para Cliente: "${clientName}" — ${topic}\n`);
        const trendData = await searchWithTavily([
          `${topic} mercado tendências 2026`,
          `${topic} concorrentes análise`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA, preparando relatório executivo para cliente.
Consultoria: ${CONFIG.company.name}
Cliente: ${clientName}
Tema: "${topic}" | Data: ${date}

${trendData ? `DADOS DE PESQUISA:\n${trendData}\n---` : ''}

# RELATÓRIO DE INTELIGÊNCIA DE MERCADO

## Cliente: ${clientName}
## Projeto: ${topic}
## Data: ${date}
## Preparado por: SmartOps IA

---

## SUMÁRIO EXECUTIVO
[Resumo curto: o que foi analisado, o que foi descoberto, qual oportunidade existe, qual recomendação principal]

## OBJETIVO DA PESQUISA
[Qual decisão esta pesquisa apoia]

## PREMISSAS
Região: | Público: | Período: | Limitações:

## PRINCIPAIS DESCOBERTAS
[3-7 descobertas com evidência e impacto]

## ANÁLISE DE PÚBLICO
Perfil: | Dores: | Desejos: | Objeções: | Critérios de decisão:

## ANÁLISE DE CONCORRENTES
| Concorrente | Oferta | Força | Fraqueza | Oportunidade |
|---|---|---|---|---|

## TENDÊNCIAS E SINAIS
| Tendência | Classificação | Impacto |
|---|---|---|

## OPORTUNIDADES
| Oportunidade | Impacto | Esforço | Risco | Prioridade |
|---|---|---|---|---|

## RISCOS
| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|

## RECOMENDAÇÃO EXECUTIVA
[Avançar / Validar / Pausar / Não priorizar] | Motivo:

## PLANO DE TESTE RECOMENDADO
Hipótese: | Como testar: | Métrica: | Critério de sucesso:

## PRÓXIMOS PASSOS
1. [Ação — Responsável — Prazo]
2. [Ação — Responsável — Prazo]
3. [Ação — Responsável — Prazo]`, 5000);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `client_report_${clientName.replace(/\s+/g, '_')}_${date}.md`, result);
        break;
      }

      // ─── ESTUDO DE NICHO (Camada 5) ────────────────────────────────────────
      case 'niche-study': {
        const targetSector = sector || topic;
        console.log(`🔬 Estudo de Nicho Para Consultoria: "${targetSector}"\n`);
        const trendData = await searchWithTavily([
          `${targetSector} problemas gestão processos automação`,
          `${targetSector} dores gestores empresários reclamações`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Nicho: "${targetSector}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# ESTUDO DE NICHO PARA CONSULTORIA — ${targetSector}

## NICHO
## RESUMO DO NICHO
[Contexto, tamanho, perfil típico de empresa]

## DORES OPERACIONAIS
* [Dor — frequência — impacto]

## DORES COMERCIAIS
* [Dor — impacto nas vendas]

## DORES FINANCEIRAS
* [Dor — impacto no caixa]

## PROBLEMAS DE PROCESSO (Lean)
| Problema | Desperdício Lean | Impacto | Solução possível |
|---|---|---|---|

## OPORTUNIDADES DE AUTOMAÇÃO
* [Automação com ferramenta]

## OPORTUNIDADES DE MARKETING
* [Tipo de campanha/conteúdo]

## OFERTA RECOMENDADA
Nome: | Promessa: | Entregáveis: | Formato: | Ticket estimado:

## DIAGNÓSTICO INICIAL PARA VENDER
[5 perguntas que revelam a dor e qualificam o lead]
1. 2. 3. 4. 5.

## ARGUMENTO COMERCIAL
[Frase de 1-2 linhas que resume o valor]

## FACILIDADE DE VENDA
Alta / Média / Baixa | Por que:

## TICKET POTENCIAL
Baixo (<R$2k) / Médio (R$2k-8k) / Alto (>R$8k)

## PRIORIDADE PARA SMARTOPS
P1 / P2 / P3 / P4 | Por que:

## PRIMEIRO TESTE COMERCIAL
[Como abordar 3-5 potenciais clientes desse nicho em 1 semana]`, 4000);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `niche_study_${targetSector.replace(/\s+/g, '_')}_${date}.md`, result);
        break;
      }

      // ─── DA PESQUISA PARA OFERTA (Camada 5) ───────────────────────────────
      case 'research-to-offer': {
        console.log(`🎯 Da Pesquisa Para Oferta: "${topic}"\n`);
        const trendData = await searchWithTavily([`${topic} dor mercado solução`]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Insight de pesquisa: "${topic}" | Público: "${audience}"

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# DA PESQUISA PARA OFERTA

## DOR ENCONTRADA
[Dor identificada na pesquisa]

## EVIDÊNCIA
[De onde veio o insight]

## PÚBLICO QUE SENTE ESSA DOR
[Perfil específico]

## SOLUÇÕES ATUAIS E POR QUE SÃO RUINS
[O que o público usa hoje e suas limitações]

## LACUNA (o que falta)
[O que ninguém entrega bem]

## OFERTA SUGERIDA
Nome: [Nome da oferta]
Promessa: [Resultado claro]
Entregáveis:
* [Entregável]
Formato: Diagnóstico / Projeto / Mensalidade / Pacote

## OBJEÇÕES A ANTECIPAR
* [Objeção] → [Como quebrar]

## PROVAS NECESSÁRIAS
* [Prova social / dado / garantia]

## PREÇO PERCEBIDO
Baixo / Médio / Alto | Faixa: R$

## PRIMEIRO TESTE COMERCIAL
[Como apresentar para 3-5 potenciais clientes]

## HANDOFF
Sales Agent: [o que fazer com essa oferta]
Pricing Agent: [como precificar]
Proposal Agent: [como criar a proposta]`, 2500);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `research_to_offer_${Date.now()}.md`, result);
        break;
      }

      // ─── DA PESQUISA PARA CONTEÚDO (Camada 5) ─────────────────────────────
      case 'research-to-content': {
        console.log(`📝 Da Pesquisa Para Conteúdo: "${topic}"\n`);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Insight de pesquisa: "${topic}" | Público: "${audience}"

# DA PESQUISA PARA CONTEÚDO

## INSIGHT BASE
[Insight da pesquisa que será transformado]

## PÚBLICO
## CONTEÚDO PILAR
[Tema principal / artigo / vídeo longo]

## CONTEÚDOS SATÉLITES (baseados no pilar)
* [Tema]
* [Tema]

## POSTS RÁPIDOS (Instagram/LinkedIn)
| Ideia | Canal | Formato | Gancho | CTA |
|---|---|---|---|---|

## ROTEIROS DE VÍDEO / REELS
* [Roteiro resumido]

## GANCHOS TESTÁVEIS
* [Gancho 1 — dor]
* [Gancho 2 — resultado]
* [Gancho 3 — dado]

## CTA RECOMENDADO
[CTA]

## PALAVRAS-CHAVE DO CONTEÚDO
* [Keyword]

## HANDOFF
Content Agent: [o que criar]
SEO Agent: [como otimizar]`, 2000);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `research_to_content_${Date.now()}.md`, result);
        break;
      }

      // ─── DA PESQUISA PARA CAMPANHA (Camada 5) ─────────────────────────────
      case 'research-to-campaign': {
        console.log(`📢 Da Pesquisa Para Campanha: "${topic}"\n`);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Insight de pesquisa: "${topic}" | Público: "${audience}"

# DA PESQUISA PARA CAMPANHA

## DOR/DESEJO BASE
[Insight que origina a campanha]

## PÚBLICO DA CAMPANHA
## NOME DA CAMPANHA
## OBJETIVO
[Awareness / Leads / Vendas / Reconversão]

## PROMESSA CENTRAL
[Resultado que a campanha promete]

## CANAIS
Meta Ads: Sim/Não | Google Ads: Sim/Não | LinkedIn: Sim/Não | Instagram orgânico: Sim/Não

## CRIATIVOS SUGERIDOS
1. [Tipo + conceito visual]
2. [Tipo + conceito visual]

## COPY PRINCIPAL
Gancho: [Primeira frase]
Corpo: [Resumo]
CTA: [CTA]

## OBJEÇÕES QUE O CRIATIVO DEVE QUEBRAR
* [Objeção]

## TESTE A/B INICIAL
Variante A: | Variante B:

## MÉTRICA PRINCIPAL
[CTR / CPL / CPA / ROAS]

## HANDOFF
Ads Agent: [o que criar]
Copywriter Agent: [o que escrever]
Content Agent: [orgânico]`, 2500);
        console.log(result);
        saveOutput(path.join(dir, 'briefs'), `research_to_campaign_${Date.now()}.md`, result);
        break;
      }

      // ─── DASHBOARD TEXTUAL (Camada 5) ──────────────────────────────────────
      case 'dashboard': {
        console.log(`📊 Dashboard de Inteligência de Mercado: "${topic}"\n`);
        const trendData = await searchWithTavily([
          `${topic} mercado status oportunidade`,
          `${topic} concorrentes movimentos recentes`,
        ]);
        const result = await runClaude(`Você é o Marketing Research Agent Enterprise da SmartOps IA.
${companyCtx()}
Tema: "${topic}" | Data: ${date}

${trendData ? `DADOS:\n${trendData}\n---` : ''}

# DASHBOARD DE INTELIGÊNCIA DE MERCADO — ${topic}

## STATUS GERAL
[Estável / Oportunidade / Atenção / Risco]

## TENDÊNCIA MAIS FORTE
[Tendência] | Força: | Classificação:

## MAIOR OPORTUNIDADE
[Oportunidade] | Score estimado: /100

## MAIOR RISCO
[Risco] | Probabilidade: | Impacto:

## CONCORRENTE EM MOVIMENTO
[Concorrente] | O que mudou: | Impacto:

## PÚBLICO MAIS PROMISSOR
[Público] | Dor principal: | Canal ideal:

## CANAL MAIS PROMISSOR
[Canal] | Motivo:

## LACUNA IDENTIFICADA
[Lacuna] | Como explorar:

## TOP 3 AÇÕES RECOMENDADAS
P1: [Ação urgente — prazo]
P2: [Ação importante]
P3: [Ação planejada]

## HANDOFF DA SEMANA
| Agente | Tarefa |
|---|---|`, 2500);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `dashboard_${date}.md`, result);
        break;
      }

      default:
        console.log(`
Modo desconhecido: "${mode}"

MODOS DISPONÍVEIS:
  trends          Relatório de tendências
  competitors     Análise competitiva
  audience        Mapa de público
  validate        Validação de ideia (--idea ou --topic)
  brief           Research brief Enterprise (--topic)
  deep            Deep research report (--topic)
  content-ideas   Ideias de conteúdo

  audience-deep   Pesquisa profunda de audiência
  competitive-intel  Inteligência competitiva completa
  voice           Voz do cliente (--topic)
  gaps            Lacunas de mercado (--topic)
  trend-eval      Tendência vs modinha (--topic)

  content-brief   Brief para Content Agent (--topic)
  ads-brief       Brief para Ads Agent (--topic)
  seo-brief       Brief para SEO Agent (--topic)
  sales-brief     Brief para Sales Agent (--topic)
  lean-brief      Brief para Lean Consulting Agent (--topic)

  sector          Pesquisa por setor (--sector)
  local           Pesquisa local (--topic --location)
  pricing         Pesquisa de precificação (--topic)
  channels        Pesquisa de canais (--topic --audience)
  message         Pesquisa de mensagem (--topic --audience)
  offer           Pesquisa para criar oferta (--topic)

  radar           Radar de mercado (--topic)
  weekly          Relatório semanal de inteligência
  alert           Alerta de mercado (--topic --type)
  hypothesis      Hipótese comercial (--topic)

  niche-compare   Comparativo de nichos para consultoria
  intel-map       Mapa de inteligência (--topic)
  proposal-intel  Inteligência para proposta (--topic --audience)
  diagnostic      Pesquisa para diagnóstico gratuito (--audience)
  sprint          Research Sprint rápido (--topic)
  executive       Síntese executiva de decisão (--topic)

  --- Documentação Estratégica (Camada 4) ---
  decision-memo   Decision Memo com evidências e triangulação (--topic)
  market-map      Market Map completo (--topic)
  test-plan       Plano de teste para hipótese (--topic)
  handoff-brief   Handoff Brief para agente destino (--topic --agent --audience)

  --- Produtização (Camada 5) ---
  client-report   Relatório executivo para cliente (--topic --client)
  niche-study     Estudo de nicho para consultoria (--sector ou --topic)
  research-to-offer      Da pesquisa para oferta (--topic --audience)
  research-to-content    Da pesquisa para conteúdo (--topic --audience)
  research-to-campaign   Da pesquisa para campanha (--topic --audience)
  dashboard       Dashboard textual de inteligência de mercado (--topic)

Exemplos:
  node marketing_research_agent.js --mode trends --topic "automação n8n PME"
  node marketing_research_agent.js --mode sector --sector "Autoescolas"
  node marketing_research_agent.js --mode validate --idea "consultoria para pet shops BH"
  node marketing_research_agent.js --mode radar --topic "lean ia pequenas empresas"
  node marketing_research_agent.js --mode ads-brief --topic "automação processos manuais"
  node marketing_research_agent.js --mode sprint --topic "chatbot whatsapp clínicas"
`);
    }

    console.log(`\n✅ Output: ${dir}`);
  } catch (err) { console.error(`❌ ${err.message}`); process.exit(1); }
}

main();
