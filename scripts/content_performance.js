require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')     || 'content_perf';
const taskDate  = get('--date')     || new Date().toISOString().split('T')[0];
const platform  = get('--platform') || 'instagram';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const perfDir   = path.join(outputDir, 'content_performance');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'content_perf.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runContentPerformance() {
  console.log(`\nContent Performance Agent — SmartOps IA`);
  console.log(`Plataforma: ${platform} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [perfDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('content_performance started');

  const contentStrategy  = readFileSafe('knowledge/content_strategy.md');
  const brandIdentity    = readFileSafe('knowledge/brand_identity.md');
  const platformGuide    = readFileSafe('knowledge/platform_guidelines.md');

  console.log('  → Analisando performance de conteúdo e identificando padrões vencedores...');
  appendLog('Generating content performance analysis...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Content Performance Agent da SmartOps IA. Descobre padrões de conteúdo vencedor, identifica o que gera mais engajamento, alcance e conversão, e orienta a produção de conteúdo baseada em dados.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Plataforma:** ${platform}
**Data:** ${taskDate}

## KNOWLEDGE BASE
${contentStrategy ? `### Estratégia de Conteúdo:\n${contentStrategy.slice(0, 600)}` : ''}
${brandIdentity ? `### Brand Identity:\n${brandIdentity.slice(0, 400)}` : ''}
${platformGuide ? `### Diretrizes de Plataforma:\n${platformGuide.slice(0, 400)}` : ''}

---

# Content Performance Report — SmartOps IA
**${platform.toUpperCase()} | ${taskDate}**

---

## 1. Análise de Conteúdo Vencedor

### Top Formatos por Engajamento

| Formato | Alcance Médio | Engajamento | Salvamentos | Conversões | Score |
|---|---|---|---|---|---|
| Carrossel educativo (8 slides) | [X] | [X]% | Alto | Médio | ⭐⭐⭐⭐⭐ |
| Reel com problema + solução | [X] | [X]% | Médio | Alto | ⭐⭐⭐⭐⭐ |
| Post de resultado/caso | [X] | [X]% | Baixo | Alto | ⭐⭐⭐⭐ |
| Vídeo educativo longo (>60s) | [X] | [X]% | Alto | Médio | ⭐⭐⭐⭐ |
| Post estático com dado | [X] | [X]% | Médio | Baixo | ⭐⭐⭐ |

---

## 2. Padrões dos Hooks Vencedores

### Os 5 Hooks que Mais Funcionam para SmartOps IA

**Hook 1 — Dado Chocante:**
> "Sua empresa está jogando [X]% do faturamento fora todo mês"

**Hook 2 — Pergunta Direta:**
> "Você sabe quanto custa cada hora de retrabalho na sua empresa?"

**Hook 3 — Revelação:**
> "3 desperdícios que todo restaurante tem e ninguém fala"

**Hook 4 — Resultado Concreto:**
> "Como reduzimos o lead time de 45 para 21 dias em 4 semanas"

**Hook 5 — Contraditório:**
> "Contratei mais funcionários e a produção piorou. Aprendi isso da forma difícil."

---

## 3. Temas com Maior Potencial de Viral

| Tema | Tipo | Potencial Viral | Por Que Funciona |
|---|---|---|---|
| 8 desperdícios no cotidiano da PME | Educativo | ⭐⭐⭐⭐⭐ | Identificação imediata |
| ROI da automação com número real | Prova social | ⭐⭐⭐⭐⭐ | Dado concreto = credibilidade |
| "Você está fazendo X errado" | Disruptivo | ⭐⭐⭐⭐ | Gatilho de curiosidade |
| Processo antes x depois | Transformação | ⭐⭐⭐⭐⭐ | Prova visual de resultado |
| IA que qualquer PME pode usar | Acessível | ⭐⭐⭐⭐ | Desmistifica tecnologia |

---

## 4. Calendário de Conteúdo Baseado em Performance

### Semana Ideal (3 publicações)

**Terça-feira (melhor alcance orgânico):**
- Formato: Carrossel educativo
- Tema: [tema com maior potencial de compartilhamento]
- Objetivo: Autoridade + novos seguidores

**Quinta-feira (melhor engajamento):**
- Formato: Reel 30-60 segundos
- Tema: [problema com solução rápida]
- Objetivo: Engajamento + saves

**Sábado (melhor conversão):**
- Formato: Post com CTA direto
- Tema: [oferta + prova social]
- Objetivo: Leads + WhatsApp cliques

---

## 5. O Que Parar de Fazer

| Conteúdo | Problema | Substituir por |
|---|---|---|
| Posts genéricos sobre Lean sem contexto PME | Baixa identificação | Cases reais + números |
| Texto longo sem hierarquia visual | Abandono rápido | Bullets + negrito estratégico |
| CTA vago ("saiba mais") | Baixa conversão | CTA específico com benefício |
| Posts sem dado/evidência | Pouca credibilidade | Sempre incluir dado ou resultado |

---

## 6. Template de Conteúdo Vencedor

\`\`\`
LINHA 1 (Hook): [Dado chocante OU pergunta OU resultado]
LINHA 2 (Contexto): Para [persona] que [situação]
LINHA 3-7 (Corpo): [3-5 bullets com conteúdo de valor]
LINHA 8 (CTA): [Ação específica + benefício claro]
\`\`\`

---

## 7. Próximos 5 Conteúdos Recomendados

| # | Tema | Formato | Hook | Objetivo |
|---|---|---|---|---|
| 1 | [tema] | Carrossel | [hook] | Autoridade |
| 2 | [tema] | Reel | [hook] | Engajamento |
| 3 | [tema] | Post | [hook] | Conversão |
| 4 | [tema] | Carrossel | [hook] | Seguidores |
| 5 | [tema] | Reel | [hook] | Leads |

---

TÍTULO: Content Performance — ${platform} ${taskDate}
CONTEXTO: Análise de padrões de conteúdo vencedor SmartOps IA
DADOS ANALISADOS: Formatos, hooks, temas, engajamento por tipo
PROBLEMA IDENTIFICADO: [principal gap de performance]
EVIDÊNCIA: [padrão identificado nos dados]
IMPACTO: [X]% mais alcance com conteúdo otimizado
RECOMENDAÇÃO: Priorizar [formato] sobre [formato]
AÇÃO SUGERIDA: Criar os 5 conteúdos do item 7 esta semana
PRIORIDADE: Alta
ESFORÇO: Médio
ROI ESPERADO: +40% engajamento em 30 dias
RISCO DE NÃO AGIR: Continuar produzindo conteúdo sem dados = desperdício de tempo
PRAZO: 30 dias para validar novo mix
MÉTRICA DE SUCESSO: Engajamento médio >5%, saves >50/post
PRÓXIMO PASSO: Produzir conteúdo #1 da lista de recomendados`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Content performance report generated');

  fs.writeFileSync(path.join(perfDir, 'content_performance_report.md'), reportMD);
  fs.writeFileSync(path.join(perfDir, 'metadata.json'), JSON.stringify({
    date: taskDate, platform,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Content Performance Report: ${path.join(perfDir, 'content_performance_report.md')}`);
  appendLog('content_performance complete ✓');
}

runContentPerformance().catch(err => {
  console.error('Content Performance error:', err.message);
  process.exit(1);
});
