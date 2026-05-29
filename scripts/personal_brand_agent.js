require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'personal_brand';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const focus     = get('--focus') || 'posicionamento_geral';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const pbDir     = path.join(outputDir, 'personal_brand');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'personal_brand.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runPersonalBrandAgent() {
  console.log(`\nPersonal Brand Agent — SmartOps IA`);
  console.log(`Foco: ${focus} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [pbDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('personal_brand_agent started');

  const brandIdentity  = readFileSafe('knowledge/brand_identity.md');
  const contentStrategy = readFileSafe('knowledge/content_strategy.md');
  const personas        = readFileSafe('knowledge/customer_personas.md');

  console.log('  → Construindo narrativa de autoridade e posicionamento...');
  appendLog(`Generating personal brand strategy: ${focus}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Personal Brand Agent da SmartOps IA. Constrói a narrativa de autoridade e posicionamento de Breno Luiz como referência em Lean Six Sigma + IA para PMEs no Brasil.

## QUEM É BRENO LUIZ
- Black Belt Lean Six Sigma
- Consultor de Melhoria Contínua + Automação com IA
- Foco: PMEs em Belo Horizonte / Minas Gerais
- Diferencial: combina metodologia Lean tradicional com automação de IA (n8n, Claude, LLMs)
- Contato: (31) 97203-9180 | brenoluiz691@gmail.com

## BRAND IDENTITY
${brandIdentity.slice(0, 600) || '(não disponível)'}

## CONTENT STRATEGY
${contentStrategy.slice(0, 400) || '(não disponível)'}

## PERSONAS DO PÚBLICO
${personas.slice(0, 400) || '(não disponível)'}

## FOCO DESTA ANÁLISE: ${focus.replace(/_/g, ' ')}

---

## TASK — Estratégia de Personal Brand

# Personal Brand — Breno Luiz
**SmartOps IA | ${taskDate}**

---

## 1. Posicionamento Central

**Quem é Breno Luiz em 1 linha:**
[frase de posicionamento precisa — quem você é, para quem, qual resultado]

**Proof Point Único:**
[o que só Breno tem/faz que justifica este posicionamento]

**Território de Autoridade:**
[os 3 temas nos quais Breno é a referência — sem dispersar]

---

## 2. Narrativa de Origem

### História de Transformação (para LinkedIn/Bio)
[Origem → Problema encontrado → Metodologia desenvolvida → Resultado para clientes → Missão atual]

### Versão Curta (para bio de 150 palavras)
[Bio pronta para copiar — LinkedIn, Instagram, site]

### Versão Ultra-Curta (para DMs/WhatsApp)
[2-3 linhas que criam credibilidade imediata]

---

## 3. Pilares de Conteúdo

| Pilar | Tema | Frequência | Formato Principal |
|---|---|---|---|
| 1 | Lean aplicado à realidade brasileira | 2x/semana | Carrossel Instagram |
| 2 | IA na consultoria — casos reais | 1x/semana | LinkedIn artigo |
| 3 | Bastidores da consultoria | 1x/semana | Reels/Stories |

---

## 4. Estratégia por Canal

### LinkedIn
- **Objetivo:** Autoridade B2B, geração de leads qualificados
- **Frequência:** 3x/semana
- **Formatos:** Artigos longos, carrosséis de resultados, depoimentos
- **Tom:** Profissional + acessível

### Instagram
- **Objetivo:** Reconhecimento de marca, autoridade visual
- **Frequência:** 3x/semana (Ter/Qui/Sáb)
- **Formatos:** Carrossel educativo, reels antes/depois, stories bastidores
- **Tom:** Direto, prático, sem enrolação

---

## 5. Conteúdo Próximos 30 Dias

| Data | Canal | Tema | Formato | Hook |
|---|---|---|---|---|
| Semana 1 | LinkedIn | [tema] | Artigo | [frase de abertura] |
| Semana 1 | Instagram | [tema] | Carrossel | [hook visual] |
| Semana 2 | LinkedIn | [tema] | Case | |
| Semana 2 | Instagram | [tema] | Reels | |
| Semana 3 | LinkedIn | [tema] | | |
| Semana 3 | Instagram | [tema] | | |
| Semana 4 | LinkedIn | [tema] | | |
| Semana 4 | Instagram | [tema] | | |

---

## 6. Métricas de Autoridade

| Métrica | Atual | Meta 30 dias | Meta 90 dias |
|---|---|---|---|
| Seguidores LinkedIn | [X] | +100 | +500 |
| Seguidores Instagram | [X] | +200 | +1000 |
| Posts publicados/mês | 0 | 12 | 36 |
| Inbound leads/mês | 0 | 2 | 10 |

---

## 7. Ações Imediatas (Esta Semana)

1. [Ação 1 — ex: otimizar bio LinkedIn]
2. [Ação 2 — ex: criar primeiro post de posicionamento]
3. [Ação 3 — ex: conectar com 20 donos de PME no LinkedIn]`,
    }],
  });

  const brandMD = resp.content[0].text.trim();
  appendLog('Personal brand strategy generated');

  fs.writeFileSync(path.join(pbDir, 'brand_strategy.md'), brandMD);
  fs.writeFileSync(path.join(pbDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    focus,
    file: 'brand_strategy.md',
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Estratégia de marca: ${path.join(pbDir, 'brand_strategy.md')}`);

  appendLog('personal_brand_agent complete ✓');
}

runPersonalBrandAgent().catch(err => {
  console.error('Personal Brand Agent error:', err.message);
  process.exit(1);
});
