require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName   = get('--task')       || 'framework';
const taskDate   = get('--date')       || new Date().toISOString().split('T')[0];
const topic      = get('--topic')      || 'lean_ia_pme';
const outputDir  = path.join('outputs', `${taskName}_${taskDate}`);
const fwDir      = path.join(outputDir, 'framework_creation');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'framework_creation.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runFrameworkCreation() {
  console.log(`\nFramework Creation Agent — SmartOps IA`);
  console.log(`Tópico: ${topic} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [fwDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('framework_creation started');

  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');

  console.log(`  → Criando framework proprietário para: ${topic.replace(/_/g, ' ')}...\n`);
  appendLog(`Creating framework for: ${topic}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Framework Creation Agent da SmartOps IA. Cria metodologias proprietárias que diferenciam a consultoria, transformam expertise em frameworks reutilizáveis e aumentam percepção de valor.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Tópico do Framework:** ${topic.replace(/_/g, ' ')}
**Data:** ${taskDate}

${brandIdentity ? `## Brand Identity:\n${brandIdentity.slice(0, 400)}` : ''}
${productCampaign ? `## Serviços e Selling Points:\n${productCampaign.slice(0, 400)}` : ''}

---

# Framework Creation Report — SmartOps IA
**Tópico: ${topic.replace(/_/g, ' ').toUpperCase()}**
**${taskDate}**

---

## 1. Framework Principal — SmartOps IA

### Nome Sugerido
> **[Nome do Framework]™** — [subtítulo descritivo]

*Exemplos de naming:*
- "Sistema LEAP™" (Lean + Execução + Automação + Pessoas)
- "Metodologia 4D SmartOps™" (Diagnosticar, Desenhar, Desenvolver, Defender)
- "Framework OpIA™" (Operações Inteligentes com IA)

---

## 2. Estrutura do Framework

### Visão Geral

\`\`\`
[FASE 1] → [FASE 2] → [FASE 3] → [FASE 4]
  ↓           ↓           ↓           ↓
[entrega]  [entrega]  [entrega]  [entrega]
\`\`\`

### Fase 1 — [Nome] (semanas 1-2)

**Objetivo:** [o que acontece nesta fase]
**Ferramenta principal:** [diagnóstico / VSM / DMAIC / etc.]
**Entregável:** [documento ou resultado tangível]
**Pergunta respondida:** "[pergunta que o cliente quer responder]"

| Atividade | Quem | Quando | Saída |
|---|---|---|---|
| [atividade] | Breno + cliente | Semana 1 | [entregável] |

---

### Fase 2 — [Nome] (semanas 3-4)

**Objetivo:** [o que acontece]
**Ferramenta principal:** [ferramenta]
**Entregável:** [resultado]
**Pergunta respondida:** "[pergunta]"

---

### Fase 3 — [Nome] (semanas 5-8)

**Objetivo:** [implementação]
**Ferramenta principal:** [ferramenta]
**Entregável:** [resultado mensurável]
**Pergunta respondida:** "[pergunta]"

---

### Fase 4 — [Nome] (semanas 9-10)

**Objetivo:** [sustentação e controle]
**Ferramenta principal:** [SOP + dashboard]
**Entregável:** [documentação + métricas]
**Pergunta respondida:** "[pergunta]"

---

## 3. Diferencial Proprietário

### Por que este framework é único?

**Combinação exclusiva:**
1. **Lean Six Sigma** (metodologia comprovada globalmente)
2. **IA como acelerador** (não como substituto humano)
3. **Foco em PME** (adaptado para realidade de empresa pequena, não corporação)
4. **Resultado em 10 semanas** (não em 2 anos como projetos tradicionais)
5. **ROI mensurável** (não "melhoria de cultura", mas número concreto)

**O que os concorrentes fazem diferente (e pior):**
- Grandes consultorias: muito caro, muito lento, muito teórico
- Coaches de processos: sem metodologia rigorosa, sem dados
- Software de automação: sem contexto operacional, sem change management

---

## 4. Material Visual do Framework

### Diagrama (descrever para Design Agent criar)

\`\`\`
[Diagrama sugerido]
Círculo central: RESULTADO (ROI + Sustentação)
4 setas de entrada: Diagnóstico / Otimização / Automação / Pessoas
Cada seta com ícone e cor:
- Diagnóstico: roxo (#7C3AED) — lupa
- Otimização: verde (#10B981) — engrenagem
- Automação: azul (#3B82F6) — raio
- Pessoas: laranja (#F59E0B) — pessoa
\`\`\`

---

## 5. Aplicações do Framework

### Como usar em Vendas

**Na proposta:**
> "Nossa metodologia proprietária [Nome]™ garante resultado em 10 semanas porque une Lean Six Sigma, IA e gestão de pessoas — três elementos que separadamente falham, juntos entregam."

**No diagnóstico gratuito:**
> "Em 30 minutos, vamos mapear em qual fase da metodologia [Nome]™ você está — e identificar qual mudança dá o maior retorno no menor tempo."

### Como usar em Marketing

**LinkedIn:**
> "Depois de 50+ projetos, sistematizei o método que reduz custos operacionais de PMEs em 30% em 10 semanas. Chamo de [Nome]™. Aqui está como funciona: [thread]"

**Instagram:**
> "3 fases que toda empresa precisa antes de automatizar qualquer coisa [carrossel]"

---

## 6. Próximos Passos para Lançar o Framework

| Ação | Prazo | Output |
|---|---|---|
| Nomear o framework | Esta semana | Nome aprovado |
| Criar diagrama visual | Esta semana | Imagem 1080x1080 |
| Escrever artigo no LinkedIn | Próxima semana | Post de autoridade |
| Criar landing page dedicada | Próximo mês | Página /metodologia |
| Gravar vídeo explicativo | Próximo mês | Reel de 90s |
| Registrar o nome (INPI) | 60 dias | Proteção da marca |

---

TÍTULO: Framework Creation — ${topic} ${taskDate}
CONTEXTO: Criação de metodologia proprietária SmartOps IA
DADOS ANALISADOS: Expertise Lean + IA + PME, diferenciação de mercado
PROBLEMA IDENTIFICADO: Consultoria sem framework propriamente nomeado e visual
EVIDÊNCIA: Concorrentes com frameworks visuais convertem mais (percepção de método)
IMPACTO: Framework proprietário aumenta confiança e conversão em +20-30%
RECOMENDAÇÃO: Nomear e visualizar o framework nos próximos 7 dias
AÇÃO SUGERIDA: Escolher nome do framework hoje e criar diagrama visual
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: +20% taxa de fechamento com metodologia visual clara
RISCO DE NÃO AGIR: Parecer genérico frente a concorrentes com "método XYZ"
PRAZO: 7 dias para versão 1 do framework
MÉTRICA DE SUCESSO: Framework nomeado + diagrama criado + artigo no LinkedIn publicado
PRÓXIMO PASSO: Escolher entre os 3 nomes sugeridos e criar diagrama com Design Agent`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Framework creation report generated');

  const safeTopic = topic.replace(/\s+/g, '_');
  fs.writeFileSync(path.join(fwDir, `framework_${safeTopic}.md`), reportMD);
  fs.writeFileSync(path.join(fwDir, 'metadata.json'), JSON.stringify({ date: taskDate, topic }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Framework Creation: ${path.join(fwDir, `framework_${safeTopic}.md`)}`);
  appendLog('framework_creation complete ✓');
}

runFrameworkCreation().catch(err => {
  console.error('Framework Creation error:', err.message);
  process.exit(1);
});
