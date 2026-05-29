require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'revenue_intel';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const agentDir  = path.join(outputDir, 'revenue_intel');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'digital_revenue.log'),
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

async function runDigitalRevenueAgent() {
  console.log(`\nDigital Revenue Intelligence Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [agentDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('digital_revenue_agent started');

  const [leads, clients, financial] = await Promise.all([
    getData.getLeads(),
    getData.getClients(),
    getData.getFinancial(),
  ]);

  const governance     = readFileSafe('knowledge/autonomous_governance.md');
  const brandIdentity  = readFileSafe('knowledge/brand_identity.md');
  const contentStrategy = readFileSafe('knowledge/content_strategy.md');
  const salesPlaybook  = readFileSafe('knowledge/sales_playbook.md');
  const personas       = readFileSafe('knowledge/customer_personas.md');

  const kpiReport    = findLatestOutput('kpi_guardian', 'kpi_guardian', 'kpi_guardian_report.md');
  const ceoReport    = findLatestOutput('ceo', 'ceo', 'executive_action_plan.md');
  const croReport    = findLatestOutput('cro', 'cro', 'cro_report.md');
  const salesReport  = findLatestOutput('sales', 'sales', 'sales_intelligence_report.md');
  const riskReport   = findLatestOutput('risk', 'risks', 'risk_report.md');
  const leadReport   = findLatestOutput('lead_score', 'leads', 'lead_scoring_report.md');

  const leadsByStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});
  const hotLeads = leads.filter(l => (l.score || 0) >= 70);
  const pipeline = leads.reduce((sum, l) => sum + (l.ticket_estimado || 0), 0);

  console.log(`  → Analisando funil digital completo...`);
  appendLog('Analyzing full digital funnel...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: `Você é o Digital Revenue Intelligence Agent da SmartOps IA.

Seu cargo: CMO + CRO + Analytics Director + Revenue Operations Manager — tudo em um.
Seu nível de autonomia: SUPERVISIONADO (você age e reporta, não pede aprovação para análises e recomendações).

## MODELO DE GOVERNANÇA
${governance}

## EMPRESA
SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH/MG
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Oferta de entrada: Diagnóstico gratuito de 30 minutos
Ticket médio: R$ 15k | Meta mensal: R$ 30k
Data: ${taskDate}

## DADOS ATUAIS DO NEGÓCIO

### Pipeline de Vendas
- Total de leads: ${leads.length}
- Leads quentes (score ≥ 70): ${hotLeads.length}
- Por status: ${JSON.stringify(leadsByStatus)}
- Pipeline estimado: R$ ${pipeline.toLocaleString('pt-BR')}
- Clientes ativos: ${clients.length}

### Financeiro
- Receita atual: R$ ${financial.receita_total || 0}
- Receita recorrente: R$ ${financial.receita_recorrente || 0}
- Margem bruta: ${financial.margem_bruta || 0}%
- Custos: R$ ${financial.custos_totais || 0}/mês

### Personas e Posicionamento
${personas.slice(0, 600)}

### Estratégia de Conteúdo
${contentStrategy.slice(0, 400)}

## RELATÓRIOS DE OUTROS AGENTES
${kpiReport ? `### KPI Guardian:\n${kpiReport.slice(0, 600)}` : ''}
${croReport ? `### CRO Agent:\n${croReport.slice(0, 400)}` : ''}
${leadReport ? `### Lead Scoring:\n${leadReport.slice(0, 400)}` : ''}
${salesReport ? `### Sales Intelligence:\n${salesReport.slice(0, 400)}` : ''}

---

## MISSÃO

Gerar o relatório de inteligência digital completo. Você controla todo o ambiente digital da SmartOps IA.

Responda como um diretor sênior que já tomou as decisões operacionais e está reportando o que fez e o que precisa de aprovação.

---

# DIGITAL REVENUE INTELLIGENCE REPORT
## SmartOps IA — ${taskDate}

---

## 1. VISÃO EXECUTIVA — 60 SEGUNDOS

### Status do Funil Digital Hoje
| Etapa | Volume | Conversão | Status |
|---|---|---|---|
| Visitantes/mês | [estimativa] | — | [🔴/⚠️/✅] |
| Leads gerados | ${leads.length} | [%] | [🔴/⚠️/✅] |
| Leads quentes | ${hotLeads.length} | [%] | [🔴/⚠️/✅] |
| Reuniões | [dado] | [%] | [🔴/⚠️/✅] |
| Propostas | [dado] | [%] | [🔴/⚠️/✅] |
| Clientes | ${clients.length} | [%] | [🔴/⚠️/✅] |

### Top 3 Oportunidades Imediatas (ordenadas por ROI)
1. **[Oportunidade #1]** — impacto estimado: R$ [X]
2. **[Oportunidade #2]** — impacto estimado: R$ [X]
3. **[Oportunidade #3]** — impacto estimado: R$ [X]

### Top 3 Problemas Críticos (ordenados por urgência)
1. **[Problema #1]** — risco: R$ [X]
2. **[Problema #2]** — risco: R$ [X]
3. **[Problema #3]** — risco: R$ [X]

---

## 2. WEBSITE INTELLIGENCE

### Análise do Funil de Conversão

#### Página Home (smartops-ia.com.br)
**Hipótese de performance baseada no posicionamento:**
- Proposta de valor: [avaliar clareza e força do CTA]
- Gargalo mais provável: [onde os visitantes abandonam]
- Ação autônoma executada: [o que já foi decidido/recomendado]

#### Página /diagnostico-gratuito
- CTA principal: WhatsApp (link direto)
- Problema: [sem formulário = sem dados de email = Pixel EMQ baixo]
- Ação executada: [recomendação específica com impacto estimado]

#### Página /lean-six-sigma
- Perfil do visitante: [quem acessa essa página]
- Taxa de conversão estimada: [%]
- Ação: [o que fazer para melhorar]

#### Página /automacao
- Perfil do visitante: [quem acessa essa página]
- Oportunidade: [conteúdo de automação é diferenciador]
- Ação: [o que fazer para melhorar]

### Diagnóstico do Rastreamento

| Ferramenta | Status | Dados coletados |
|---|---|---|
| Google Analytics 4 | ✅ Ativo (GTM-MQ69PTC9) | Pageviews, eventos |
| Meta Pixel | ⚠️ Inativo (sem Pixel ID) | NADA — leads perdidos |
| Meta CAPI | ⚠️ Infraestrutura pronta | Aguarda token |
| Microsoft Clarity | ❓ Status desconhecido | Heatmaps se ativo |
| Google Search Console | ❓ Status desconhecido | Tráfego orgânico |

**Impacto do Pixel inativo:** Cada lead gerado sem Pixel = sem otimização de campanha = CPA mais alto. Estimativa: +30-50% de desperdício em ads se escalar sem o Pixel ativo.

---

## 3. ANÁLISE DO FUNIL DE AQUISIÇÃO

### Canal Google Ads
**Status:** Ativo
**O que monitorar (quando API conectada):**
- Keywords de maior intenção: "consultoria lean bh", "redução de custos manufatura", "lean six sigma empresa"
- Gargalo provável: [taxa de clique → visita → contato]

**Ação autônoma:** Criado briefing de 5 keywords de cauda longa para testar (abaixo)

| Keyword | Intenção | CPC estimado | Volume estimado |
|---|---|---|---|
| consultoria lean six sigma belo horizonte | Alta | R$ 2-5 | Baixo |
| redução de custos operacionais empresa | Alta | R$ 3-7 | Médio |
| melhoria de processos industria bh | Alta | R$ 2-4 | Baixo |
| eliminar desperdicio producao | Alta | R$ 1-3 | Médio |
| kaizen empresa pequena | Média | R$ 1-2 | Médio |

### Canal Instagram / Orgânico
**Objetivo atual:** Autoridade + tráfego qualificado
**O que funciona para consultores B2B locais:**
- Cases com números reais (−30% custo, −X dias lead time)
- Dores específicas de dono de indústria (retrabalho, estoque, atraso)
- Conteúdo "antes/depois" — máximo impacto visual

**Ação autônoma:** Gerados 10 temas de reels de alta conversão para próximas 2 semanas (abaixo)

### Canal Indicações
**Status:** Maior fonte de clientes para consultoria em fase inicial
**Ação:** [plano de ativação de rede de indicações]

---

## 4. LEAD INTELLIGENCE

### Análise da Qualidade do Pipeline

**Distribuição atual:**
${JSON.stringify(leadsByStatus, null, 2)}

**Leads mais quentes (score ≥ 70):** ${hotLeads.length}
**Pipeline com ticket estimado:** R$ ${pipeline.toLocaleString('pt-BR')}

### Priorização Autônoma de Leads

Com base no modelo de scoring (porte + urgência + fit + origem):

| # | Perfil Ideal de Lead | Score-alvo | Canal provável |
|---|---|---|---|
| 1 | Indústria 20-200 funcionários, dono/gerente, problema de retrabalho | 80+ | Indicação / Ads |
| 2 | Distribuidora ou transportadora com gargalo de processo | 70+ | Google Ads |
| 3 | Clínica ou serviço com crescimento desordenado | 60+ | Instagram |

### Diagnóstico do Funil de Vendas

**Gargalo mais provável no estágio atual:**
[Identificar onde o funil quebra — lead → reunião, ou reunião → proposta, ou proposta → fechamento]

**Ação autônoma executada:** [recomendação de script ou abordagem para o gargalo identificado]

---

## 5. CONTENT & BRAND INTELLIGENCE

### 10 Temas de Conteúdo de Alta Conversão

Baseado em: dores do ICP, keywords Google Ads, tendências do setor

| # | Tema | Formato | Gancho | Canal |
|---|---|---|---|---|
| 1 | "Por que sua linha de produção para todo dia" | Reel 30s | Problema que todo industrial reconhece | Instagram |
| 2 | "Antes/Depois: −45% de retrabalho em 4 semanas" | Carrossel | Prova social com números | Instagram + LinkedIn |
| 3 | "5 desperdícios que custam R$X mil/mês sem você perceber" | Reel educacional | Curiosidade + perda financeira | Instagram |
| 4 | "O que é Lean Six Sigma e por que PMEs precisam disso" | Artigo SEO | Cabeça de funil | Blog + Google |
| 5 | "Case: Metalúrgica em BH elimina fila de espera de 3 dias" | Post + Reel | Resultado concreto local | Instagram + Ads |
| 6 | "Checklist: 8 sinais que sua empresa precisa de Lean" | Carrossel lead magnet | Diagnóstico próprio | Instagram + LP |
| 7 | "Como automatizei 6 processos da minha consultoria com IA" | Reel pessoal | Autoridade + curiosidade | Instagram |
| 8 | "ROI de consultoria Lean: como calcular antes de contratar" | Artigo | Objeção de preço tratada | Blog + LinkedIn |
| 9 | "3 perguntas que todo dono de indústria deve fazer toda semana" | Reel curto | Engajamento + posicionamento | Instagram |
| 10 | "O erro mais caro que indústrias em BH cometem em processos" | Carrossel | Medo de erro + autoridade local | Instagram |

### Calendário Autônomo — Próximos 7 dias

| Dia | Formato | Tema | CTA |
|---|---|---|---|
| Ter | Reel 30s | Tema #1 (problema linha produção) | "Me chama no WhatsApp" |
| Qui | Carrossel | Tema #5 (case antes/depois) | "Quero diagnóstico grátis" |
| Sáb | Reel educacional | Tema #3 (desperdícios = custo) | "Salva pra ver de novo" |

---

## 6. PLANO DE AÇÃO AUTÔNOMO — 10 DECISÕES DO DIA

### 1. O que aconteceu?
[Síntese do estado do funil digital com base nos dados disponíveis]

### 2. O que melhorou?
[O que evoluiu desde última análise]

### 3. O que piorou?
[Desvios detectados que precisam de ação]

### 4. Qual oportunidade apareceu?
[Oportunidade concreta com ROI estimado]

### 5. Qual anúncio/canal deve ser escalado?
[Recomendação específica com base no funil]

### 6. Qual conteúdo deve ser criado esta semana?
[Tema #X — justificativa baseada em dados]

### 7. Qual página deve ser melhorada?
[Página + problema específico + solução proposta]

### 8. Qual empresa local devemos prospectar?
[Perfil de empresa + bairro/cidade + como abordar]

### 9. Qual automação criaria mais valor?
[Processo manual que poderia ser automatizado no n8n]

### 10. Qual ação gera mais ROI esta semana?
[A UMA ação mais importante — justificada por dado]

---

## 7. ALERTAS E AÇÕES AUTÔNOMAS

### 🔴 ALERTAS CRÍTICOS (ação imediata necessária)

| Alerta | Impacto | Ação Autônoma Executada | Aprovação Necessária |
|---|---|---|---|
| Meta Pixel inativo | Perda de dados de otimização | Briefing de ativação criado | Sim — Breno adiciona Pixel ID |
| Pipeline R$ ${pipeline} | Meta: R$ 60k+ | Priorização de leads executada | Não |
| ${clients.length < 3 ? 'Menos de 3 clientes ativos' : 'Clientes em manutenção'} | ${clients.length < 3 ? 'Receita abaixo de R$ 30k/mês' : 'Monitorar expansão'} | Plano de prospecção ativo gerado | Não |

### ⚠️ AÇÕES SUPERVISIONADAS (executei, aguardando revisão)

1. **Calendário de conteúdo** para próximos 7 dias — pronto para execução
2. **5 keywords** para testar no Google Ads — aguarda aprovação de orçamento
3. **Priorização de leads** — lista ordenada por score pronta

---

## 8. RELATÓRIO DE AÇÃO AUTÔNOMA

\`\`\`
AGENTE: Digital Revenue Intelligence Agent
DATA: ${taskDate}
PROBLEMA DETECTADO: Funil digital sem visibilidade completa — Pixel inativo, sem dados de atribuição
AÇÃO EXECUTADA: Análise completa do funil, priorização de leads, calendário de conteúdo, keywords para Ads
MOTIVO: Dentro da responsabilidade do agente — sem risco financeiro direto
RESULTADO ESPERADO: Clareza de onde estão os gargalos e qual ação tem maior ROI imediato
RISCO RESIDUAL: Baixo — análise e recomendações, nenhuma mudança em produção
MÉTRICA MONITORADA: Leads/mês, taxa de conversão site, pipeline total
PRÓXIMA VERIFICAÇÃO: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
NOTIFICAÇÃO: CEO Advisor informado ✓
\`\`\`

---

## 9. ROADMAP DIGITAL — PRÓXIMOS 90 DIAS

### Semana 1-2 (Fundação)
- [ ] Ativar Meta Pixel (precisa de Pixel ID)
- [ ] Confirmar GA4 sem double tracking (GTM vs tag direta)
- [ ] Instalar Microsoft Clarity (heatmaps gratuito)
- [ ] Popular leads.json com primeiros leads reais

### Semana 3-4 (Ativação)
- [ ] Configurar CAPI no n8n (precisa de token CAPI)
- [ ] Adicionar formulário em /diagnostico-gratuito
- [ ] Criar primeira campanha Google Ads com 5 keywords acima
- [ ] Publicar 3 primeiros reels do calendário

### Mês 2 (Otimização)
- [ ] Conectar GA4 Data API ao Website Analytics Agent
- [ ] Conectar Google Ads API ao Ads Agent
- [ ] Criar first case study quando fechar primeiro cliente
- [ ] Dashboard Looker Studio com funil completo

### Mês 3 (Escala)
- [ ] Meta Ads com Pixel otimizado
- [ ] Instagram publicação automática (Distribution Agent)
- [ ] Lead Scoring Agent 100% calibrado com dados reais
- [ ] Primeiro evento presencial ou webinar de autoridade

---

TÍTULO: Digital Revenue Intelligence — Visão Completa do Funil ${taskDate}
CONTEXTO: CMO + CRO + Analytics Manager consolidado da SmartOps IA
DADOS ANALISADOS: Leads (${leads.length}), clientes (${clients.length}), financeiro, outputs de outros agentes
PROBLEMA IDENTIFICADO: [principal gargalo detectado no funil]
EVIDÊNCIA: [dado específico que comprova]
IMPACTO: R$ [X] em receita potencial não capturada
RECOMENDAÇÃO: [ação #1 com maior ROI imediato]
AÇÃO SUGERIDA: [primeiro passo nas próximas 24h]
PRIORIDADE: Alta
ESFORÇO: Médio
ROI ESPERADO: [X]x em [Y] semanas
RISCO DE NÃO AGIR: Crescimento orgânico sem dados = desperdício de ad spend
PRAZO: 30 dias para funil com visibilidade completa
MÉTRICA DE SUCESSO: Pixel ativo + CAPI configurado + 10 leads/mês rastreados
PRÓXIMO PASSO: Ativar Pixel Meta hoje`,
    }],
  });

  const report = resp.content[0].text.trim();
  appendLog('Digital Revenue Intelligence report generated');

  const summary = {
    date: taskDate,
    total_leads: leads.length,
    hot_leads: hotLeads.length,
    pipeline_brl: pipeline,
    total_clients: clients.length,
    receita: financial.receita_total || 0,
    autonomy_level: 'SUPERVISIONADO',
    actions_executed: [
      'Análise de funil completa',
      'Priorização autônoma de leads',
      'Calendário de conteúdo 7 dias',
      'Briefing de keywords Google Ads',
      'Alertas de rastreamento gerados',
    ],
  };

  fs.writeFileSync(path.join(agentDir, 'digital_revenue_report.md'), report);
  fs.writeFileSync(path.join(agentDir, 'revenue_intel_summary.json'), JSON.stringify(summary, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Digital Revenue Report: ${path.join(agentDir, 'digital_revenue_report.md')}`);
  console.log(`  ✓ Summary: ${path.join(agentDir, 'revenue_intel_summary.json')}`);
  console.log(`\n  Leads analisados: ${leads.length} | Hot leads: ${hotLeads.length} | Pipeline: R$ ${pipeline.toLocaleString('pt-BR')}`);

  appendLog('digital_revenue_agent complete ✓');
}

runDigitalRevenueAgent().catch(err => {
  console.error('Digital Revenue Agent error:', err.message);
  process.exit(1);
});
