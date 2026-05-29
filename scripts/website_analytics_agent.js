require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'website_analytics';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const agentDir  = path.join(outputDir, 'website_analytics');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'website_analytics.log'),
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

async function runWebsiteAnalyticsAgent() {
  console.log(`\nWebsite Analytics Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [agentDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('website_analytics_agent started');

  const [leads, clients, financial] = await Promise.all([
    getData.getLeads(),
    getData.getClients(),
    getData.getFinancial(),
  ]);

  const brandIdentity  = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const personas       = readFileSafe('knowledge/customer_personas.md');

  const croReport    = findLatestOutput('cro', 'cro', 'cro_report.md');
  const journeyReport = findLatestOutput('journey', 'journey', 'journey_report.md');
  const revenueReport = findLatestOutput('revenue', 'revenue', 'revenue_report.md');

  const ga4Connected = !!process.env.GA4_PROPERTY_ID;

  console.log('  → Auditando site e analisando comportamento do visitante...');
  appendLog('Analyzing website performance...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 5000,
    messages: [{
      role: 'user',
      content: `Você é o Website Analytics Agent da SmartOps IA.
Seu cargo: Analytics Manager + Conversion Specialist + UX Analyst.
Autonomia: SUPERVISIONADO — analisa, decide e reporta. Não pede aprovação para recomendações.

## EMPRESA
SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH/MG
Site: https://smartops-ia.com.br
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Data: ${taskDate}

## STATUS DA INTEGRAÇÃO
GA4 API: ${ga4Connected ? '✅ Conectada (GA4 Property: ' + process.env.GA4_PROPERTY_ID + ')' : '⚠️ Não conectada — análise baseada em estrutura do site e benchmarks'}
GTM: GTM-MQ69PTC9 (ativo)
GA4: G-9GFH1BS308 (ativo via GTM)
Meta Pixel: ⚠️ Inativo (sem Pixel ID configurado)

## ESTRUTURA DO SITE (páginas conhecidas)
- / (Home) — proposta de valor, CTA principal WhatsApp/Diagnóstico
- /lean-six-sigma — serviço principal, cases, metodologia
- /automacao — automação com IA, n8n, workflows
- /diagnostico-gratuito — LP de conversão, CTA WhatsApp
- /sobre — Breno Luiz, credenciais, Black Belt

## DADOS DO NEGÓCIO
- Leads no pipeline: ${leads.length}
- Clientes ativos: ${clients.length}
- Receita: R$ ${financial.receita_total || 0}/mês
- Oferta de entrada: Diagnóstico gratuito 30min

## CONTEXTO DE OUTROS AGENTES
${croReport ? `### CRO Agent:\n${croReport.slice(0, 500)}` : ''}
${journeyReport ? `### Customer Journey:\n${journeyReport.slice(0, 400)}` : ''}

## PERSONAS
${personas.slice(0, 500)}

---

# WEBSITE ANALYTICS REPORT — SmartOps IA
## ${taskDate}

---

## 1. STATUS GERAL DO SITE

### Infraestrutura de Rastreamento
| Ferramenta | Status | O que coleta | Ação necessária |
|---|---|---|---|
| Google Analytics 4 | ✅ Ativo (via GTM) | Pageviews, sessões, eventos | — |
| Google Tag Manager | ✅ Ativo | Container de tags | Verificar tags GA4 para evitar double tracking |
| Meta Pixel | ❌ Inativo | NADA — leads invisíveis para Meta | Adicionar PUBLIC_META_PIXEL_ID no .env |
| Meta CAPI | ⚠️ Infraestrutura pronta | Server-side events | Configurar token no n8n |
| Microsoft Clarity | ❓ Não confirmado | Heatmaps, gravações | Instalar — gratuito, alta relevância |
| Google Search Console | ❓ Não confirmado | Impressões orgânicas, CTR, posição | Verificar se conectado ao domínio |

### Impacto do Pixel Inativo
Meta Pixel desativado = Meta Ads cego. Cada lead gerado sem o Pixel:
- Não alimenta o algoritmo de otimização
- Não cria audiências de remarketing
- Aumenta CPA em estimativa de 30-60%
- Inviabiliza campanha de conversão Meta Ads

**Ação imediata:** Ativar Pixel antes de qualquer escala de ads.

---

## 2. ANÁLISE DE PÁGINAS — DIAGNÓSTICO

### Página Home (/)

**Elementos críticos de conversão:**
- Hero section: [avaliar se a proposta de valor "Lean + Automação + IA para PMEs" está clara em 3 segundos]
- CTA principal: [avaliar posição, contraste, texto do botão]
- Social proof: [verificar se existem números, logos de clientes, certificações visíveis]
- Load time: [benchmark: >3s = -20% conversão]

**Hipóteses de problema por prioridade:**
1. 🔴 **Sem email no formulário** → Pixel EMQ baixo → ads menos eficientes → custo por lead +30%
2. 🔴 **Social proof insuficiente** → visitante novo não confia → bounce rate alto
3. ⚠️ **CTA vago ("Saiba mais")** → converter para "Quero meu diagnóstico grátis"
4. ⚠️ **Sem urgência** → adicionar "Vagas limitadas esta semana" ou similar

**Benchmark para consultoria B2B local:**
- Taxa de conversão (visita → contato): 2-5%
- Bounce rate aceitável: <60%
- Tempo médio na página: >2min

---

### Página /diagnostico-gratuito (LP Principal)

**Análise estrutural:**
Esta é a página mais importante do funil. Cada ponto de atrito aqui = lead perdido.

| Elemento | Status atual | Melhor prática | Impacto estimado |
|---|---|---|---|
| Formulário de captura | ❌ Só link WhatsApp | Form com nome + email + WhatsApp + problema | +40% em captura de dados |
| Above the fold | ? | Benefício claro em <5 palavras + CTA | Alta |
| Prova social | ? | Depoimento ou número de diagnósticos realizados | +25% em conversão |
| Urgência/escassez | ? | "X vagas disponíveis esta semana" | +15% em conversão |
| og:image | ❌ Ausente | Imagem de preview para compartilhamento | Médio |
| noindex | ⚠️ meta robots noindex | Remover se quiser Google indexar | Tráfego orgânico |

**Ação autônoma executada:** Briefing de redesign da LP gerado abaixo.

---

### Página /lean-six-sigma

**Perfil esperado do visitante:**
- Gerente de produção ou dono de indústria pesquisando solução específica
- Intenção média-alta de compra (pesquisou o termo)
- Quer: provas de resultado, metodologia clara, investimento, tempo de retorno

**O que pode estar faltando:**
- Calculadora de ROI ("Se você tem X funcionários e Y% de retrabalho...")
- Timeline visual de implementação
- FAQ com objeções principais (preço, tempo, tamanho mínimo de empresa)
- CTA específico para setor (indústria vs. escritório vs. distribuição)

---

### Página /automacao

**Perfil esperado do visitante:**
- Dono de PME que quer eficiência sem contratar mais funcionários
- Pesquisa sobre n8n, automação, IA aplicada
- Quer: casos de uso concretos, o que é possível automatizar, quanto custa

**Diferencial competitivo forte:** Poucos consultores locais oferecem automação com IA + Lean juntos.
**Ação:** Destacar mais este diferencial. Criar conteúdo "Antes/Depois: X horas de trabalho → automatizado".

---

## 3. ANÁLISE DE FUNIL — MODELO ESTIMADO

Sem dados reais do GA4 API, modelagem baseada em benchmarks para consultoria B2B local:

| Etapa | Volume estimado/mês | Taxa | Gargalo? |
|---|---|---|---|
| Visitantes únicos | 200-500 | 100% | — |
| Chegam à /diagnostico-gratuito | 20-50 | 10% | ⚠️ |
| Clicam no WhatsApp | 4-10 | 20% | ⚠️ |
| Mandam mensagem de fato | 2-5 | 50% | — |
| Agendaram diagnóstico | 1-3 | 60% | — |
| Viraram cliente | 0-1 | 25% | 🔴 |

**Maior gargalo estimado:** Visitante → /diagnostico-gratuito (10% é baixo — meta: 20%+)

**Causa provável:** CTA na home não direciona claramente para a LP de diagnóstico.

**Solução:** A/B test do CTA principal da home ("Quero meu diagnóstico grátis" vs "Falar com Breno" vs "Ver como funciona").

---

## 4. OTIMIZAÇÕES PRIORIZADAS POR ROI

### 🔴 Alta Prioridade (executar esta semana)

| # | Otimização | Esforço | Impacto | ROI estimado |
|---|---|---|---|---|
| 1 | Ativar Meta Pixel | 10min | Habilita toda otimização Meta Ads | Crítico |
| 2 | Instalar Microsoft Clarity | 15min | Heatmaps gratuitos, vê onde clicam | Alto |
| 3 | Adicionar email no form da home | 30min | Pixel EMQ +30% | Alto |
| 4 | Adicionar formulário em /diagnostico-gratuito | 2h | Captura leads sem depender WhatsApp | Alto |

### ⚠️ Média Prioridade (próximas 2 semanas)

| # | Otimização | Esforço | Impacto |
|---|---|---|---|
| 5 | og:image em /diagnostico-gratuito | 1h | Preview ao compartilhar no WhatsApp |
| 6 | Remover noindex do diagnostico-gratuito | 5min | Permite indexação Google |
| 7 | Urgência no hero da home | 30min | +15% conversão estimado |
| 8 | Verificar double tracking GA4+GTM | 15min | Dados limpos = decisão melhor |
| 9 | EventTracking no /sobre (cliques WhatsApp) | 30min | Dados de uma página ignorada |

### ℹ️ Baixa Prioridade (mês 2)

| # | Otimização | Impacto |
|---|---|---|
| 10 | Calculadora de ROI Lean na página /lean-six-sigma | Aumento de engajamento |
| 11 | Chat ou widget de agendamento | Reduz fricção |
| 12 | Evento Purchase quando fechar cliente | Otimização de ads para conversão |

---

## 5. BRIEFING: FORMULÁRIO EM /DIAGNOSTICO-GRATUITO

Substituir o link direto WhatsApp por um formulário que:
1. Coleta: nome, empresa, WhatsApp, email (opcional), problema principal
2. Ao enviar: mostra confirmação + dispara WhatsApp automático via n8n
3. Envia evento Lead para GA4 + Meta Pixel + CAPI

Campos mínimos:
\`\`\`
Nome: [text]
Empresa: [text]
WhatsApp: [tel]
Qual o maior problema da sua operação hoje? [textarea]
[Quero meu diagnóstico gratuito →]
\`\`\`

---

## 6. RELATÓRIO DE AÇÃO AUTÔNOMA

AGENTE: Website Analytics Agent
DATA: ${taskDate}
PROBLEMA DETECTADO: Funil de conversão com gargalos não rastreados, Meta Pixel inativo, LP sem formulário
AÇÃO EXECUTADA: Auditoria completa do site, diagnóstico de conversão, briefings de otimização
MOTIVO: Análise é responsabilidade do agente — sem risco, sem mudança em produção
RESULTADO ESPERADO: Clareza dos gargalos + briefings para implementação imediata
RISCO RESIDUAL: Baixo
MÉTRICA MONITORADA: Taxa conversão (visita→contato), Meta Pixel ativo, Clarity instalado
PRÓXIMA VERIFICAÇÃO: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

---

TÍTULO: Website Analytics — Auditoria Completa ${taskDate}
CONTEXTO: SmartOps IA — site smartops-ia.com.br
DADOS ANALISADOS: Estrutura de páginas, rastreamento, funil estimado
PROBLEMA IDENTIFICADO: Meta Pixel inativo + LP sem formulário = leads perdidos e ads cegos
EVIDÊNCIA: Pixel inativo confirmado no .env — PUBLIC_META_PIXEL_ID não configurado
IMPACTO: Estimativa de 30-60% de ineficiência em ads enquanto Pixel estiver inativo
RECOMENDAÇÃO: Ativar Pixel + instalar Clarity + adicionar formulário na LP
AÇÃO SUGERIDA: 1) Pixel ID no .env 2) Clarity via GTM 3) Formulário na /diagnostico-gratuito
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: -30% CPA em ads após Pixel ativo por 2 semanas
RISCO DE NÃO AGIR: Cada lead gerado sem Pixel não alimenta o algoritmo — desperdício crescente
PRAZO: 3 dias para Pixel + Clarity
MÉTRICA DE SUCESSO: Pixel ativo, Clarity instalado, pelo menos 1 semana de dados coletados
PRÓXIMO PASSO: Abrir .env, adicionar PUBLIC_META_PIXEL_ID, fazer deploy no Netlify`,
    }],
  });

  const report = resp.content[0].text.trim();
  appendLog('Website Analytics report generated');

  const summary = {
    date: taskDate,
    ga4_connected: ga4Connected,
    pixel_active: false,
    clarity_installed: false,
    total_leads: leads.length,
    total_clients: clients.length,
    top_issues: ['Meta Pixel inativo', 'LP sem formulário', 'Sem Clarity instalado'],
    autonomy_level: 'SUPERVISIONADO',
  };

  fs.writeFileSync(path.join(agentDir, 'website_analytics_report.md'), report);
  fs.writeFileSync(path.join(agentDir, 'analytics_summary.json'), JSON.stringify(summary, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Website Analytics Report: ${path.join(agentDir, 'website_analytics_report.md')}`);

  appendLog('website_analytics_agent complete ✓');
}

runWebsiteAnalyticsAgent().catch(err => {
  console.error('Website Analytics Agent error:', err.message);
  process.exit(1);
});
