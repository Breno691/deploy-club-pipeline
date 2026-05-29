require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'market_opp';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const focus     = get('--focus')  || 'bh_pme';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const moDir     = path.join(outputDir, 'market_opportunity');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'market_opportunity.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

const { TavilyClient } = require('@tavily/core');

async function runMarketOpportunity() {
  console.log(`\nMarket Opportunity Agent — SmartOps IA`);
  console.log(`Foco: ${focus} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [moDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('market_opportunity started');

  let marketData = '';
  if (process.env.TAVILY_API_KEY) {
    try {
      console.log('  → Pesquisando oportunidades de mercado em tempo real...');
      const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
      const results = await tavily.search({
        query: 'consultoria lean six sigma automacao ia PME Brasil 2026 mercado oportunidade',
        maxResults: 6,
        searchDepth: 'basic',
      });
      marketData = results.results.map(r => `- ${r.title}: ${r.content?.slice(0, 250)}`).join('\n');
      appendLog('Tavily market research complete');
    } catch {
      appendLog('Tavily unavailable — using base knowledge');
    }
  }

  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const personas        = readFileSafe('knowledge/customer_personas.md');

  console.log('  → Identificando novos mercados e nichos para SmartOps IA...');
  appendLog('Generating market opportunity report...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Market Opportunity Agent da SmartOps IA. Identifica novos mercados, nichos e oportunidades de crescimento para a consultoria, priorizando aquelas com maior potencial de receita e menor concorrência.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Foco de análise:** ${focus.replace(/_/g, ' ')}
**Data:** ${taskDate}

${marketData ? `## DADOS DE MERCADO (pesquisa em tempo real):\n${marketData}` : ''}
${productCampaign ? `## Serviços Atuais:\n${productCampaign.slice(0, 400)}` : ''}
${personas ? `## Personas Atuais:\n${personas.slice(0, 400)}` : ''}

---

# Market Opportunity Report — SmartOps IA
**${taskDate}**

---

## 1. Análise do Mercado Atual

### Tamanho do Mercado Endereçável (BH / MG)

| Segmento | Empresas em BH/MG | % Acessíveis | Potencial/empresa | TAM estimado |
|---|---|---|---|---|
| Manufatura/Indústria | ~8.000 | 10% | R$ 25k | R$ 20M/ano |
| Serviços de saúde | ~15.000 | 8% | R$ 15k | R$ 18M/ano |
| Restaurantes/Food | ~12.000 | 5% | R$ 12k | R$ 7M/ano |
| Serviços B2B | ~20.000 | 6% | R$ 20k | R$ 24M/ano |
| **Total TAM** | ~55.000 | | | **~R$ 69M/ano** |

**Participação atual SmartOps IA:** < 0,01%
**Meta em 2 anos:** 0,1% = R$ 690k/ano

---

## 2. Oportunidades Imediatas (0-90 dias)

### 🔥 OPORTUNIDADE 1 — Clínicas Odontológicas de BH

**Por que agora:**
- Crescimento acelerado pós-pandemia em clínicas
- Alta margem mas processos caóticos
- Dores claras: agendamento, inadimplência, retrabalho na equipe
- Ticket médio: R$ 8-15k por projeto

**Ação imediata:**
1. Mapear 50 clínicas odontológicas em BH com 5-15 funcionários
2. Criar conteúdo específico: "3 desperdícios em clínicas odontológicas"
3. Oferecer diagnóstico gratuito específico para clínicas
4. Meta: 3 clientes neste nicho em 90 dias

### 🔥 OPORTUNIDADE 2 — Distribuidoras e Atacadistas de MG

**Por que agora:**
- Processo logístico complexo = muitos desperdícios
- Presença forte no interior de MG (mercado menos disputado)
- Dores: estoque desajustado, picking ineficiente, rotas ruins
- Ticket médio: R$ 20-40k

**Ação imediata:**
1. Participar de evento da ACEMG (distribuidores)
2. Criar case hipotético de distribuição
3. Parceria com software de WMS local

### ⭐ OPORTUNIDADE 3 — Escritórios de Contabilidade

**Por que agora:**
- Digitalização forçando mudança de processos
- Clientes deles são os mesmos que a SmartOps IA atende
- Parceria gera indicações mútuas
- Ticket médio: R$ 10-20k + indicações

**Ação imediata:**
1. Mapear 10 escritórios de contabilidade em BH
2. Proposta de parceria de indicação (10-15% de comissão)
3. Criar conteúdo conjunto para LinkedIn

---

## 3. Oportunidades de Médio Prazo (3-12 meses)

### Nicho 1 — Empresas de Logística Urbana
- **Contexto:** Crescimento do e-commerce gera demanda por logística eficiente
- **Dores:** Last mile caótico, rotas ineficientes, alta rotatividade
- **Diferencial SmartOps:** Lean + automação de rotas com IA
- **Ticket potencial:** R$ 30-60k por projeto
- **Acesso:** LinkedIn + associações de logística

### Nicho 2 — Hospitais e Clínicas de Médio Porte
- **Contexto:** Regulatório forçando melhoria de processos (RDC/Anvisa)
- **Dores:** Lead time de atendimento, retrabalho, gestão de leitos
- **Diferencial SmartOps:** Six Sigma hospitalar + automação de fluxos
- **Ticket potencial:** R$ 50-100k por projeto
- **Acesso:** Parceria com consultorias de saúde

### Nicho 3 — Franquias e Redes (expansão para múltiplas unidades)
- **Contexto:** Franquia que padroniza processos pode escalar mais rápido
- **Dores:** Inconsistência entre unidades, treinamento caro, retrabalho
- **Diferencial SmartOps:** Lean + SOP digital + treinamento automatizado
- **Ticket potencial:** R$ 40-80k + royalty mensal por unidade
- **Acesso:** ABF (Associação Brasileira de Franchising)

---

## 4. Análise de Concorrência por Nicho

| Nicho | Concorrentes em BH | Diferencial SmartOps | Facilidade de Entrar |
|---|---|---|---|
| Manufatura | Grandes consultorias | Menor custo + mais ágil | ⭐⭐⭐⭐ |
| Saúde | Consultorias hospitalares | IA + automação + Lean juntos | ⭐⭐⭐ |
| Alimentos | Quase nenhum | First mover advantage | ⭐⭐⭐⭐⭐ |
| Logística | Alguns | Process mining + automação | ⭐⭐⭐ |
| Franquias | Nenhum em BH focado nisso | Escala via metodologia | ⭐⭐⭐⭐ |

---

## 5. Priorização de Oportunidades (matriz 2x2)

\`\`\`
ALTO RETORNO, BAIXO ESFORÇO (FAZER AGORA):
  ✅ Clínicas odontológicas (nicho identificado, dor clara)
  ✅ Parceria com contadores (gera indicações)

ALTO RETORNO, ALTO ESFORÇO (PLANEJAR):
  📋 Hospitais e clínicas de médio porte
  📋 Franquias e redes

BAIXO RETORNO, BAIXO ESFORÇO (TESTAR):
  🧪 Logística urbana
  🧪 Distribuidoras interior MG

BAIXO RETORNO, ALTO ESFORÇO (EVITAR):
  ❌ Grandes corporações (ciclo de venda longo, muito competitivo)
  ❌ Setor público (burocracia, pouco ROI)
\`\`\`

---

TÍTULO: Market Opportunity — ${focus} ${taskDate}
CONTEXTO: Identificação de novos mercados e nichos para SmartOps IA
DADOS ANALISADOS: TAM de BH/MG, nichos por dor, concorrência, acessibilidade
PROBLEMA IDENTIFICADO: Crescimento limitado sem estratégia de nicho definida
EVIDÊNCIA: TAM estimado R$ 69M/ano em BH/MG, penetração atual < 0,01%
IMPACTO: 3 clientes em nicho odontológico = +R$ 40k de receita em 90 dias
RECOMENDAÇÃO: Focar primeiro em clínicas odontológicas e parceria com contadores
AÇÃO SUGERIDA: Criar conteúdo específico para clínicas odontológicas esta semana
PRIORIDADE: Alta
ESFORÇO: Médio
ROI ESPERADO: R$ 40k em receita nova em 90 dias
RISCO DE NÃO AGIR: Continuar generalista = competindo com todos, ganhando de poucos
PRAZO: 90 dias para 3 clientes no nicho prioritário
MÉTRICA DE SUCESSO: 3 clientes em nicho odontológico + 2 parcerias com contadores
PRÓXIMO PASSO: Criar conteúdo "3 desperdícios em clínicas odontológicas de BH" hoje`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Market opportunity report generated');

  fs.writeFileSync(path.join(moDir, 'market_opportunity_report.md'), reportMD);
  fs.writeFileSync(path.join(moDir, 'metadata.json'), JSON.stringify({ date: taskDate, focus }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Market Opportunity Report: ${path.join(moDir, 'market_opportunity_report.md')}`);
  appendLog('market_opportunity complete ✓');
}

runMarketOpportunity().catch(err => {
  console.error('Market Opportunity error:', err.message);
  process.exit(1);
});
