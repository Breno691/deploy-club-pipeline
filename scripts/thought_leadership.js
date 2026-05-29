require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'thought_leadership';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const focus     = get('--focus')  || 'lean_automation';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const tlDir     = path.join(outputDir, 'thought_leadership');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'thought_leadership.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runThoughtLeadership() {
  console.log(`\nThought Leadership Agent — SmartOps IA`);
  console.log(`Foco: ${focus} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [tlDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('thought_leadership started');

  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const contentStrategy = readFileSafe('knowledge/content_strategy.md');

  console.log('  → Criando plano de autoridade pública e thought leadership...');
  appendLog('Generating thought leadership plan...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Thought Leadership Agent da SmartOps IA. Constrói autoridade pública para Breno Luiz como referência em Lean Six Sigma + Automação com IA para PMEs no Brasil.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Foco de autoridade:** ${focus.replace(/_/g, ' ')}
**Data:** ${taskDate}

${brandIdentity ? `## Brand Identity:\n${brandIdentity.slice(0, 500)}` : ''}

---

# Thought Leadership Plan — Breno Luiz / SmartOps IA
**${taskDate}**

---

## 1. Posicionamento de Autoridade

**Claim central:**
> "Breno Luiz é o consultor que une Lean Six Sigma com IA para transformar PMEs em empresas de alta performance — sem precisar de grande equipe ou orçamento."

**Pilares de autoridade:**
1. **Lean Six Sigma aplicado à realidade das PMEs** (não teoria corporativa)
2. **Automação com IA acessível** (não só para grandes empresas)
3. **Resultados mensuráveis em 4-8 semanas** (não projetos de 1 ano)
4. **Black Belt que faz, não só que fala** (consultor operador)

---

## 2. Plano de Artigos LinkedIn (próximas 8 semanas)

| Semana | Título | Tema Central | CTA |
|---|---|---|---|
| 1 | "3 desperdícios que toda PME tem e ninguém vê" | Lean para PME | Diagnóstico gratuito |
| 2 | "Como a IA eliminou 40% do retrabalho numa clínica de BH" | Case + IA | Contar o caso |
| 3 | "Six Sigma não é só para grandes empresas. É para você." | Desmistificar | Seguir |
| 4 | "O que aprendi depois de 50 diagnósticos de processos" | Autoridade | Compartilhar |
| 5 | "Automatizei minha própria consultoria. Aqui está o que usei." | Transparência | Curtir |
| 6 | "Por que seu processo demora 3x mais do que deveria" | Provocação | Diagnóstico |
| 7 | "O maior erro dos donos de PME em processos" | Educação | Debate |
| 8 | "De 45 dias para 21 dias: o projeto Lean que transformou uma fábrica" | Resultado | Case |

---

## 3. Plano de Palestras e Eventos

### Eventos para Prospectar em BH (próximos 90 dias)

| Evento | Público | Tema Sugerido | Quando |
|---|---|---|---|
| Encontro da FIEMG | Donos de indústria | "Lean + IA para indústria de MG" | Ago-Set 2026 |
| SEBRAE BH — Workshop | Pequenas empresas | "Processos sem desperdício" | Jul 2026 |
| Meetup de Startups BH | Tech + Negócios | "Automação com IA na prática" | Jun 2026 |
| ACMINAS | Empresários BH | "De PME para empresa de alta performance" | Jul 2026 |

**Proposta de palestra padrão (45 min):**
\`\`\`
1. O problema: por que PMEs perdem dinheiro todos os dias (10 min)
2. A metodologia: Lean + Six Sigma + IA = resultado previsível (15 min)
3. Case real: antes → depois com números (10 min)
4. Como começar: diagnóstico gratuito (10 min)
\`\`\`

---

## 4. Plano de Lives e Podcasts

### Lives mensais (Instagram + LinkedIn)

| Mês | Tema | Convidado Sugerido | Objetivo |
|---|---|---|---|
| Jun | "Automação que qualquer PME pode fazer agora" | Solo | Leads |
| Jul | "Lean Six Sigma na prática: dúvidas ao vivo" | Solo | Autoridade |
| Ago | "Resultados reais: case ao vivo com cliente" | Cliente | Prova social |

### Podcasts para aparecer

| Podcast | Foco | Tema de Pitch |
|---|---|---|
| Pizza de Dados | Tech + Dados | IA + Process Mining para PMEs |
| Empreendedores BH (local) | Negócios BH | Lean aplicado à realidade mineira |
| Operações que Escalam | Operações | Six Sigma sem burocracia |

---

## 5. Conteúdo de Autoridade Técnica

### 3 Artigos Técnicos Profundos (para SEO e LinkedIn)

**Artigo 1:** "Guia completo: Como aplicar Lean Six Sigma em PMEs sem estrutura formal"
- Palavras-chave: lean six sigma pme, melhoria de processos pequena empresa
- Tamanho: 2.500 palavras
- Objetivo: Top 3 Google + 500 curtidas LinkedIn

**Artigo 2:** "n8n + IA: como automatizei 80% das tarefas repetitivas da minha consultoria"
- Palavras-chave: automação n8n, automação com ia para consultoria
- Tamanho: 2.000 palavras
- Objetivo: Viral no LinkedIn de tech/automação

**Artigo 3:** "O que é Process Mining e por que toda empresa deveria usar"
- Palavras-chave: process mining, análise de processos com dados
- Tamanho: 2.000 palavras
- Objetivo: Posicionar em nicho menos competitivo

---

## 6. Métricas de Autoridade (acompanhar mensalmente)

| Métrica | Hoje | Meta 90 dias |
|---|---|---|
| Seguidores LinkedIn | [X] | +500 |
| Seguidores Instagram | [X] | +1.000 |
| Alcance médio/post | [X] | 2.000+ |
| Palestras realizadas | 0 | 3 |
| Artigos publicados | 0 | 8 |
| Entrevistas/podcasts | 0 | 2 |
| Menções online | 0 | 10+ |

---

TÍTULO: Thought Leadership — Breno Luiz ${taskDate}
CONTEXTO: Plano para construir autoridade pública como referência em Lean + IA para PMEs
DADOS ANALISADOS: Posicionamento, oportunidades de conteúdo, eventos BH, benchmarks
PROBLEMA IDENTIFICADO: Autoridade não construída sistematicamente ainda
EVIDÊNCIA: 0 artigos publicados, 0 palestras, sem presença consistente
IMPACTO: Autoridade gera leads inbound — elimina dependência de prospecção ativa
RECOMENDAÇÃO: Publicar 1 artigo/semana no LinkedIn + 1 palestra/mês
AÇÃO SUGERIDA: Escrever artigo #1 da lista esta semana
PRIORIDADE: Alta
ESFORÇO: Médio
ROI ESPERADO: 3-5 leads/mês de origem orgânica em 90 dias
RISCO DE NÃO AGIR: Concorrentes menos qualificados dominam o espaço de conteúdo
PRAZO: 90 dias para estabelecer presença consistente
MÉTRICA DE SUCESSO: 8 artigos publicados + 3 palestras + 500 novos seguidores LinkedIn
PRÓXIMO PASSO: Escrever e publicar artigo "3 desperdícios que toda PME tem e ninguém vê"`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Thought leadership plan generated');

  fs.writeFileSync(path.join(tlDir, 'thought_leadership_plan.md'), reportMD);
  fs.writeFileSync(path.join(tlDir, 'metadata.json'), JSON.stringify({ date: taskDate, focus }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Thought Leadership Plan: ${path.join(tlDir, 'thought_leadership_plan.md')}`);
  appendLog('thought_leadership complete ✓');
}

runThoughtLeadership().catch(err => {
  console.error('Thought Leadership error:', err.message);
  process.exit(1);
});
