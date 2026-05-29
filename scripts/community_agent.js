require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'community';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const platform  = get('--platform') || 'instagram_linkedin';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const comDir    = path.join(outputDir, 'community');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'community.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runCommunityAgent() {
  console.log(`\nCommunity Agent — SmartOps IA`);
  console.log(`Plataforma: ${platform} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [comDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('community_agent started');

  const brandIdentity   = readFileSafe('knowledge/brand_identity.md');
  const contentStrategy = readFileSafe('knowledge/content_strategy.md');
  const personas        = readFileSafe('knowledge/customer_personas.md');

  console.log('  → Criando estratégia de construção de comunidade engajada...');
  appendLog('Generating community strategy...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Community Agent da SmartOps IA. Constrói e engaja a comunidade de seguidores e clientes em potencial de Breno Luiz, transformando audiência em comunidade ativa que gera leads orgânicos.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Plataforma principal:** ${platform.replace(/_/g, ' + ')}
**Data:** ${taskDate}

${brandIdentity ? `## Brand Identity:\n${brandIdentity.slice(0, 400)}` : ''}
${contentStrategy ? `## Estratégia de Conteúdo:\n${contentStrategy.slice(0, 400)}` : ''}

---

# Community Strategy — SmartOps IA
**${taskDate}**

---

## 1. Definição da Comunidade

### Quem é a Comunidade SmartOps IA?

| Segmento | Perfil | O Que Busca | Como Engajar |
|---|---|---|---|
| Donos de PME | Empresários 35-55, BH/MG | Reduzir custos e crescer | Cases + dicas práticas |
| Gestores operacionais | Gerentes de operações | Metodologia e ferramentas | Conteúdo técnico |
| Estudantes de Lean/Six Sigma | Profissionais em formação | Aprendizado | Educação gratuita |
| Parceiros potenciais | Consultores, ERPs | Colaboração | Conteúdo de mercado |

---

## 2. Estratégia de Comunidade por Plataforma

### Instagram — Comunidade Visual

**Objetivo:** Audiência ampla de donos de PME
**Meta 90 dias:** +1.000 seguidores qualificados

**Pilares de engajamento:**
1. **Posts educativos** (3x/semana): ensinar Lean/IA de forma visual
2. **Stories diários**: bastidores da consultoria, dicas rápidas
3. **Enquetes e perguntas**: gerar participação ativa
4. **Lives mensais**: responder dúvidas ao vivo

**Conteúdo que gera mais comunidade (não só alcance):**
- Pedir opinião: "Qual é o maior desperdício na sua empresa? Vote 👇"
- Desafio: "7 dias sem retrabalho — quem topa? Comenta aqui"
- Pergunta aberta: "Qual automação você mais queria ter? Conta nos comentários"
- Behind the scenes: "Dia de diagnóstico — como funciona na prática"

**Resposta a comentários (regra das 24h):**
Todo comentário deve ser respondido em 24h com pergunta de volta para aprofundar conversa.

---

### LinkedIn — Comunidade Profissional

**Objetivo:** Autoridade e geração de leads B2B
**Meta 90 dias:** +500 conexões qualificadas

**Tipos de post que constroem comunidade:**
1. **Posts de opinião** ("Por que eu parei de fazer X..."): debates nos comentários
2. **Threads longas** (carrossel): save e compartilhamento
3. **Pedidos de ajuda genuínos** ("Estou enfrentando X, alguém já passou por isso?"): engajamento alto
4. **Celebração de resultados de clientes**: prova social + gratidão

**Estratégia de conexões:**
- Conectar com 10 prospects/dia (donos de PME em BH/MG)
- Mensagem de conexão personalizada (não pitch):
  > "Olá [nome], vi que você é [cargo] em [empresa] e que compartilhamos interesse em [tema]. Adoraria trocar experiências. 🤝"

---

### WhatsApp — Comunidade Íntima

**Objetivo:** Nurturing e fechamento de vendas
**Tipo:** Lista de transmissão semanal (não grupo)

**Frequência:** 1x/semana
**Conteúdo:** 1 dica prática + 1 case + 1 pergunta

**Template semanal:**
\`\`\`
📊 Dica SmartOps da semana:

[Dica prática de Lean/Six Sigma/IA em 3 linhas]

Caso real: [resultado de cliente em 1 linha]

Pergunta para você: [pergunta que gera resposta]

Breno | SmartOps IA
(31) 97203-9180
\`\`\`

---

## 3. Calendário de Engajamento (próximas 4 semanas)

| Semana | Instagram | LinkedIn | WhatsApp |
|---|---|---|---|
| 1 | Enquete: maior desperdício | Post de opinião sobre Lean | Dica #1 + pergunta |
| 2 | Live 30min — dúvidas ao vivo | Thread: como funciona diagnóstico | Dica #2 + case |
| 3 | Desafio 7 dias | Post resultado de cliente | Dica #3 + convite para live |
| 4 | Behind the scenes de diagnóstico | Artigo: framework proprietário | Dica #4 + link para conteúdo |

---

## 4. Métricas de Comunidade

| Métrica | Meta 30 dias | Meta 90 dias |
|---|---|---|
| Instagram: seguidores ativos | +200 | +1.000 |
| Instagram: taxa de engajamento | >5% | >7% |
| LinkedIn: conexões qualificadas | +100 | +500 |
| LinkedIn: comentários/post | >10 | >20 |
| WhatsApp lista: membros | 50 | 200 |
| WhatsApp: taxa de resposta | >20% | >30% |
| Leads originados da comunidade | 2 | 10 |

---

## 5. Programa de Embaixadores

### Critérios para ser embaixador informal
- Segue há >3 meses
- Comenta ativamente
- Já indicou alguém
- Usa/usou serviço da SmartOps IA

### Benefícios oferecidos
1. Acesso antecipado a conteúdo novo
2. Sessão estratégica gratuita de 30min/trimestre
3. Destaque nos stories como "caso de sucesso"
4. Participação em live como convidado

---

TÍTULO: Community Strategy — ${platform} ${taskDate}
CONTEXTO: Construção de comunidade engajada SmartOps IA
DADOS ANALISADOS: Plataformas, perfil da audiência, estratégias de engajamento
PROBLEMA IDENTIFICADO: Audiência passiva — seguidores sem engajamento profundo
EVIDÊNCIA: Sem comunidade, cada lead precisa de esforço de prospecção ativo
IMPACTO: Comunidade ativa gera 5-10 leads/mês sem custo adicional
RECOMENDAÇÃO: Iniciar enquete Instagram + 10 conexões LinkedIn/dia
AÇÃO SUGERIDA: Publicar enquete hoje: "Qual é o maior desperdício na sua empresa?"
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: 5 leads orgânicos/mês em 90 dias = R$ 75k em pipeline
RISCO DE NÃO AGIR: Permanecer dependente de prospecção ativa e outbound
PRAZO: 90 dias para comunidade ativa
MÉTRICA DE SUCESSO: 1.000 seguidores Instagram + 500 LinkedIn + 10 leads da comunidade
PRÓXIMO PASSO: Publicar enquete Instagram + conectar 10 prospects no LinkedIn hoje`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Community strategy generated');

  fs.writeFileSync(path.join(comDir, 'community_strategy.md'), reportMD);
  fs.writeFileSync(path.join(comDir, 'metadata.json'), JSON.stringify({ date: taskDate, platform }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Community Strategy: ${path.join(comDir, 'community_strategy.md')}`);
  appendLog('community_agent complete ✓');
}

runCommunityAgent().catch(err => {
  console.error('Community Agent error:', err.message);
  process.exit(1);
});
