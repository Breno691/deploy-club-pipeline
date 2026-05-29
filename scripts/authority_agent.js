require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'authority';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const format    = get('--format') || 'all'; // linkedin | palestra | artigo | podcast | all
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const authDir   = path.join(outputDir, 'authority');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'authority.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runAuthorityAgent() {
  console.log(`\nAuthority Building Agent — SmartOps IA`);
  console.log(`Formato: ${format} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [authDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('authority_agent started');

  const brandIdentity   = readFileSafe('knowledge/brand_identity.md');
  const contentStrategy = readFileSafe('knowledge/content_strategy.md');

  console.log('  → Gerando conteúdo de autoridade...');
  appendLog(`Generating authority content: format=${format}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Authority Building Agent da SmartOps IA. Constrói autoridade digital de Breno Luiz através de palestras, artigos LinkedIn, lives e podcasts.

## QUEM É BRENO LUIZ
- Black Belt Lean Six Sigma
- Especialista em Automação com IA para PMEs (BH/MG)
- Diferencial: "o único consultor que combina Lean + IA na prática para PMEs"
- Público: donos de PME em BH, gestores de operações, diretores industriais
- Contato: (31) 97203-9180

## BRAND IDENTITY
${brandIdentity.slice(0, 500) || ''}

## CONTENT STRATEGY
${contentStrategy.slice(0, 400) || ''}

## FORMATO SOLICITADO: ${format}
## DATA: ${taskDate}

---

## TASK — Conteúdo de Autoridade

# Authority Building — Breno Luiz
**SmartOps IA | ${taskDate}**

---

## Artigo LinkedIn (Pronto para Publicar)

**Título:** [título que gera curiosidade + promete resultado específico]

**Abertura (Hook):**
[1 parágrafo provocador — uma estatística surpresa, uma verdade inconveniente ou uma história]

**Desenvolvimento:**
[3-4 parágrafos com conteúdo valioso — metodologia + exemplo real + resultado]

**Conclusão + CTA:**
[resumo + convite para diagnóstico gratuito]

**Hashtags:** #lean #melhoriadeprocessos #ia #pme #[mais 3]

---

## Pitch de Palestra (30-60 min)

**Título:** "[Título impactante da palestra]"

**Para quem:** [público-alvo específico — ex: Associação Comercial BH, FIEMG, SEBRAE]

**Promessa:** [o que o participante vai saber fazer ao sair]

**Estrutura:**
| # | Bloco | Tempo | Conteúdo |
|---|---|---|---|
| 1 | Abertura | 5min | [história + provocação] |
| 2 | O Problema | 10min | [realidade das PMEs em MG] |
| 3 | A Metodologia | 20min | [Lean + IA — como funciona] |
| 4 | Casos Reais | 15min | [2-3 antes/depois] |
| 5 | Encerramento | 10min | [chamada para ação + contato] |

**Como conseguir este evento:** [estratégia — ACMINAS, SEBRAE, FIEMG, grupos WhatsApp]

---

## Roteiro de Live (Instagram/YouTube — 20 min)

**Tema:** [tema quente para live]
**Dia/horário ideal:** [baseado em audiência de PMEs]

**Roteiro:**
1. **[0-2min]** Abertura: [script de boas-vindas + o que vão aprender]
2. **[2-8min]** Conteúdo principal: [estrutura do que ensinar]
3. **[8-15min]** Demonstração/caso: [mostrar na prática]
4. **[15-18min]** Q&A: [perguntas frequentes + respostas]
5. **[18-20min]** CTA: [script de encerramento com diagnóstico gratuito]

---

## Proposta para Podcast

**Tema do Episódio:** "[título atraente para host de podcast de negócios]"

**Pitch para o host:**
[Email/DM template — assunto + por que Breno é o convidado ideal + o que o público vai aprender]

**Pontos de discussão:**
1. [ponto 1]
2. [ponto 2]
3. [ponto 3]

**Podcasts-alvo em BH/MG:** [lista de podcasts relevantes para abordar]

---

## Calendário de Autoridade — Próximos 30 Dias

| Semana | Ação | Canal | Meta |
|---|---|---|---|
| 1 | Publicar artigo LinkedIn + live Instagram | LinkedIn + IG | 200 visualizações |
| 2 | Enviar pitch para 3 podcasts + 1 evento | Email | 1 resposta |
| 3 | Artigo + Reel bastidores | LinkedIn + IG | 300 visualizações |
| 4 | Avaliação + próximo mês | | |`,
    }],
  });

  const authorityMD = resp.content[0].text.trim();
  appendLog('Authority content generated');

  fs.writeFileSync(path.join(authDir, `authority_content_${format}.md`), authorityMD);
  fs.writeFileSync(path.join(authDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    format,
    file: `authority_content_${format}.md`,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Conteúdo de autoridade: ${path.join(authDir, `authority_content_${format}.md`)}`);

  appendLog('authority_agent complete ✓');
}

runAuthorityAgent().catch(err => {
  console.error('Authority Agent error:', err.message);
  process.exit(1);
});
