require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'ads';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const agentDir  = path.join(outputDir, 'ads');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'ads_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
const getData = require('../lib/data');

function findLatestOutput(prefix, subdir, file) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return '';
  const dirs = fs.readdirSync(base).filter(d => d.startsWith(prefix)).sort().reverse();
  return dirs[0] ? readFileSafe(path.join(base, dirs[0], subdir, file)) : '';
}

async function runAdsAgent() {
  console.log(`\nAds Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [agentDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('ads_agent started');

  const [leads, clients, financial] = await Promise.all([
    getData.getLeads(),
    getData.getClients(),
    getData.getFinancial(),
  ]);

  const brandIdentity   = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const personas        = readFileSafe('knowledge/customer_personas.md');

  const leadReport    = findLatestOutput('lead_score', 'leads', 'lead_scoring_report.md');
  const revenueReport = findLatestOutput('revenue', 'revenue', 'revenue_report.md');

  const googleAdsConnected = !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const metaAdsConnected   = !!process.env.META_ADS_ACCESS_TOKEN;

  const hotLeads = leads.filter(l => (l.score || 0) >= 70);
  const leadOrigins = leads.reduce((acc, l) => { acc[l.origem || 'desconhecida'] = (acc[l.origem || 'desconhecida'] || 0) + 1; return acc; }, {});

  console.log('  → Gerando estratégia de ads e recomendações de campanhas...');
  appendLog('Generating ads strategy...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 5000,
    messages: [{
      role: 'user',
      content: `Você é o Ads Agent da SmartOps IA.
Seu cargo: Google Ads Manager + Meta Ads Manager + Paid Media Strategist.
Autonomia: ASSISTIDO — analisa e recomenda. Não executa mudanças em campanhas sem aprovação.

## EMPRESA
SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH/MG
Site: https://smartops-ia.com.br
Oferta de entrada: Diagnóstico gratuito de 30 minutos
Ticket médio: R$ 15.000 | Meta: R$ 30.000/mês
Data: ${taskDate}

## STATUS DAS INTEGRAÇÕES
Google Ads API: ${googleAdsConnected ? '✅ Conectada' : '⚠️ Não conectada — estratégia baseada em dados históricos e benchmarks'}
Meta Ads API: ${metaAdsConnected ? '✅ Conectada' : '⚠️ Não conectada — análise estratégica sem dados reais'}
Meta Pixel: ⚠️ Inativo (sem PUBLIC_META_PIXEL_ID) — Meta Ads cego sem conversões

## DADOS DO NEGÓCIO
- Leads no pipeline: ${leads.length}
- Leads quentes (score ≥ 70): ${hotLeads.length}
- Origens dos leads: ${JSON.stringify(leadOrigins)}
- Clientes ativos: ${clients.length}
- Receita: R$ ${financial.receita_total || 0}/mês
- Custo mensal: R$ ${financial.custos_totais || 0}/mês

## PERSONAS
${personas.slice(0, 500)}

## PRODUTO
${productCampaign.slice(0, 500)}

---

# ADS INTELLIGENCE REPORT — SmartOps IA
## ${taskDate}

---

## 1. DIAGNÓSTICO DE CAMPANHA ATUAL

### Google Ads
**Status:** ${googleAdsConnected ? 'Dados reais disponíveis' : 'Ativo (sem dados de API — análise estratégica)'}

**Configuração recomendada para consultoria B2B local em BH:**

| Tipo de campanha | Objetivo | Budget recomendado | KPI-alvo |
|---|---|---|---|
| Search — Keywords de solução | Leads diretos | R$ 800-1500/mês | CPA < R$ 150 |
| Search — Keywords de problema | Awareness qualificado | R$ 300-500/mês | CPA < R$ 200 |
| Local de empresa — Belo Horizonte | Prospecção local | R$ 200-400/mês | Impressões + cliques |

**Estrutura de campanha recomendada:**

### Campanha 1 — "Solução Lean BH" (Budget: R$ 1.000/mês)
Grupos de anúncios:
- Grupo A: consultoria lean (lean six sigma bh, consultoria lean belo horizonte, melhoria de processos empresa)
- Grupo B: redução custos (reduzir custos operacionais, eliminar desperdicio producao, aumentar produtividade empresa)
- Grupo C: automação (automatizar processos empresa, n8n automacao, consultoria automacao bh)

### Campanha 2 — "Problema" (Budget: R$ 500/mês)
Grupos de anúncios:
- Grupo A: dores de produção (retrabalho producao, linha parada, gargalo de producao)
- Grupo B: dores administrativas (processo lento empresa, muito papel trabalho, ineficiencia operacional)

---

## 2. KEYWORDS ESTRATÉGICAS

### Keywords de Alta Conversão (Compra Imediata)

| Keyword | Tipo | CPC Estimado | Volume | Concorrência | Prioridade |
|---|---|---|---|---|---|
| consultoria lean six sigma belo horizonte | Exata | R$ 3-6 | Baixo | Baixa | 🔴 Alta |
| consultoria lean bh | Exata | R$ 2-5 | Baixo | Baixa | 🔴 Alta |
| melhoria de processos industria bh | Frase | R$ 2-4 | Médio | Baixa | 🔴 Alta |
| lean six sigma empresa pequena | Frase | R$ 1-3 | Médio | Média | ⚠️ Média |
| consultoria automacao processos | Frase | R$ 2-5 | Médio | Média | ⚠️ Média |

### Keywords de Intenção de Pesquisa (Topo de Funil)

| Keyword | CPC | Volume | Uso |
|---|---|---|---|
| o que é lean six sigma | R$ 0,50-1 | Alto | Blog/SEO |
| como reduzir desperdicio producao | R$ 0,80-1,50 | Médio | Conteúdo |
| kaizen o que é | R$ 0,50-1 | Alto | Educacional |
| como automatizar empresa | R$ 1-2 | Médio | Awareness |

### Keywords Negativas (não gastar dinheiro aqui)

- lean startup (diferente de Lean Manufacturing)
- lean cuisine (alimentação)
- six sigma free (quer grátis)
- curso six sigma (quer estudar, não contratar)
- certificação lean (quer diploma, não consultoria)
- livro lean (consumo de conteúdo)

---

## 3. COPIES DE ANÚNCIOS GOOGLE ADS

### Anúncio 1 — Foco em resultado (Alta CTR esperada)
\`\`\`
Headline 1: Lean Six Sigma em BH — Resultados em 4 Semanas
Headline 2: -30% Custo Operacional Garantido
Headline 3: Diagnóstico Grátis — Sem Compromisso
Description 1: Black Belt Lean Six Sigma + Automação com IA. Elimine desperdícios e aumente margem da sua empresa.
Description 2: Atendimento presencial em BH/Contagem/Betim. Fale agora e agende seu diagnóstico gratuito.
\`\`\`

### Anúncio 2 — Foco no problema (Alta relevância)
\`\`\`
Headline 1: Sua Empresa Perde Dinheiro com Retrabalho?
Headline 2: Consultoria Lean em Belo Horizonte
Headline 3: Diagnóstico Gratuito — Agende Hoje
Description 1: Identificamos e eliminamos os 8 desperdícios que consomem sua margem. Resultado médio: -30% em 30 dias.
Description 2: Metodologia Lean Six Sigma + Automação com IA. Black Belt com foco em PMEs locais.
\`\`\`

### Anúncio 3 — Foco em automação (Diferenciação)
\`\`\`
Headline 1: Automatize Processos + Lean na Sua Empresa
Headline 2: Lean + IA + Automação em BH
Headline 3: Ganhe 20h/semana — Veja Como
Description 1: Combinação única: Lean Six Sigma + Automação com IA. Processos enxutos E automatizados.
Description 2: Consultoria presencial em BH. Diagnóstico gratuito de 30 minutos. Sem contratos longos.
\`\`\`

---

## 4. META ADS — ESTRATÉGIA

### Situação atual
Meta Pixel inativo → Meta Ads sem dados de conversão → **Não recomendado investir em Meta Ads até ativar o Pixel.**

### Após ativar o Pixel — Estratégia recomendada

**Fase 1 — Coleta de dados (2 semanas após Pixel ativo)**
- Objetivo: Tráfego para /diagnostico-gratuito
- Budget: R$ 20-30/dia
- Público: Homens 30-55 anos, BH + região, interesses em gestão, indústria, empreendedorismo
- Formato: Feed + Stories (imagem estática do SmartOps IA com copy direto)

**Fase 2 — Conversão (após ter 50+ eventos Lead no Pixel)**
- Objetivo: Conversão (Lead)
- Budget: R$ 50-100/dia
- Público: Lookalike dos leads + remarketing de visitantes do site
- Meta: CPA < R$ 100/lead

**Fase 3 — Escala (após validar CPA)**
- Objetivo: Manter CPA + escalar volume
- Budget: 2x Fase 2
- Públicos: Expand Lookalike + novos segmentos

---

## 5. COPIES DE ANÚNCIOS META ADS

### Criativo 1 — Antes/Depois (melhor formato para consultoria)
\`\`\`
HEADLINE: De 45 dias para 12 dias de entrega — sem contratar ninguém

BODY: Uma indústria em BH estava perdendo clientes por atraso na entrega.
Em 4 semanas, aplicamos Lean Six Sigma e eliminamos 3 desperdícios ocultos.
Resultado: -73% no lead time. Sem demitir. Sem investimento em equipamento.

Você sabe quantos desperdícios sua empresa tem?
Descubra grátis em 30 minutos.

CTA: Quero meu diagnóstico grátis →
\`\`\`

### Criativo 2 — Pergunta direta (alta CTR para PMEs)
\`\`\`
HEADLINE: Quanto sua empresa perde por mês com retrabalho?

BODY: A maioria dos donos de indústria não sabe responder.
E é exatamente aí que está o dinheiro parado.

Lean Six Sigma identifica isso em 30 minutos.
Diagnóstico gratuito, presencial, sem enrolação.

CTA: Agendar diagnóstico gratuito
\`\`\`

---

## 6. BUDGET RECOMENDADO — PRÓXIMOS 30 DIAS

| Canal | Budget | Objetivo | ROI esperado |
|---|---|---|---|
| Google Ads Search | R$ 1.500 | 10-15 leads qualificados | 2-3 reuniões |
| Meta Ads (após Pixel ativo) | R$ 600 | Tráfego + dados de audiência | Base para otimização |
| **Total** | **R$ 2.100** | **12-18 leads** | **1-2 clientes** |

**ROI potencial:**
- 1 cliente fechado = R$ 15.000
- Investimento em ads = R$ 2.100
- ROI = 614%

---

## 7. ALERTAS E AÇÕES AUTÔNOMAS

| Alerta | Criticidade | Ação Tomada | Aprovação |
|---|---|---|---|
| Meta Pixel inativo | 🔴 Crítica | Briefing de ativação criado | Breno adiciona Pixel ID |
| Budget ads não definido | ⚠️ Média | Budget recomendado acima | Aprovação antes de ativar |
| Copies de anúncios criados | ✅ | Prontos para upload | Revisar e ativar |

---

TÍTULO: Ads Intelligence — Estratégia Completa ${taskDate}
CONTEXTO: Google Ads + Meta Ads para SmartOps IA
DADOS ANALISADOS: Leads (${leads.length}), origens, financeiro, benchmarks de mercado
PROBLEMA IDENTIFICADO: Meta Pixel inativo invalida toda estratégia Meta Ads
EVIDÊNCIA: PUBLIC_META_PIXEL_ID ausente no .env
IMPACTO: +30-60% CPA estimado enquanto Pixel estiver inativo
RECOMENDAÇÃO: 1) Ativar Pixel 2) Google Ads com as 3 keywords de alta conversão 3) Meta Ads após 2 semanas de dados
AÇÃO SUGERIDA: Ativar Pixel hoje, subir Google Ads esta semana
PRIORIDADE: Alta
ESFORÇO: Médio (3-5h de configuração)
ROI ESPERADO: R$ 15k (1 cliente) para cada R$ 2.100 investidos = 614%
RISCO DE NÃO AGIR: Crescimento orgânico lento, dependência de indicações
PRAZO: 7 dias para primeira campanha ativa
MÉTRICA DE SUCESSO: CPA < R$ 150 no Google Ads, 10+ leads/mês
PRÓXIMO PASSO: 1) Ativar Pixel ID no .env 2) Criar conta Google Ads 3) Subir anúncio #1`,
    }],
  });

  const report = resp.content[0].text.trim();
  appendLog('Ads report generated');

  const summary = {
    date: taskDate,
    google_ads_connected: googleAdsConnected,
    meta_ads_connected: metaAdsConnected,
    pixel_active: false,
    recommended_budget_brl: 2100,
    total_leads: leads.length,
    hot_leads: hotLeads.length,
    autonomy_level: 'ASSISTIDO',
  };

  fs.writeFileSync(path.join(agentDir, 'ads_report.md'), report);
  fs.writeFileSync(path.join(agentDir, 'ads_summary.json'), JSON.stringify(summary, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Ads Report: ${path.join(agentDir, 'ads_report.md')}`);

  appendLog('ads_agent complete ✓');
}

runAdsAgent().catch(err => {
  console.error('Ads Agent error:', err.message);
  process.exit(1);
});
