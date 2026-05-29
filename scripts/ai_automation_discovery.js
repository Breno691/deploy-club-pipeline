require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'ai_auto';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const area      = get('--area')   || 'operacoes_internas';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const autoDir   = path.join(outputDir, 'ai_automation_discovery');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'ai_auto_discovery.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

const { TavilyClient } = require('@tavily/core');

async function runAiAutomationDiscovery() {
  console.log(`\nAI Automation Discovery Agent — SmartOps IA`);
  console.log(`Área: ${area} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [autoDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('ai_automation_discovery started');

  const clients = readJsonSafe('data/clients.json') || [];
  let trendData = '';

  if (process.env.TAVILY_API_KEY) {
    try {
      console.log('  → Pesquisando novas automações com IA disponíveis...');
      const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
      const results = await tavily.search({
        query: 'AI automation n8n tools 2026 small business process',
        maxResults: 5,
        searchDepth: 'basic',
      });
      trendData = results.results.map(r => `- ${r.title}: ${r.content?.slice(0, 200)}`).join('\n');
      appendLog('Tavily search complete');
    } catch {
      appendLog('Tavily unavailable — proceeding without live data');
    }
  }

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o AI Automation Discovery Agent da SmartOps IA. Descobre novas oportunidades de automação com IA para a própria consultoria e para clientes, avaliando ROI e facilidade de implementação.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Área de análise:** ${area.replace(/_/g, ' ')}
**Data:** ${taskDate}
**Clientes ativos:** ${clients.length}

${trendData ? `## TENDÊNCIAS ATUAIS DE AUTOMAÇÃO:\n${trendData}` : ''}

---

# AI Automation Discovery Report
**${taskDate}**

---

## 1. Oportunidades de Automação — SmartOps IA (Interna)

### Processos Mais Automatizáveis

| Processo | Frequência | Tempo Atual | Ferramenta IA | ROI Estimado | Esforço |
|---|---|---|---|---|---|
| Geração de proposta comercial | Semanal | 3h | Claude API (já feito) | ✅ Feito | - |
| Relatório executivo semanal | Semanal | 4h | Claude + n8n (já feito) | ✅ Feito | - |
| Pesquisa de mercado | 3x/semana | 2h | Tavily + Claude (já feito) | ✅ Feito | - |
| Follow-up de leads | Diário | 1h | n8n + WhatsApp | R$ 800/mês | Médio |
| Onboarding de novos clientes | Mensal | 3h | n8n + Notion/Google Drive | R$ 400/mês | Baixo |
| Relatório de progresso para cliente | Semanal | 2h | Claude API + template | R$ 600/mês | Baixo |
| Agendamento de reuniões | Diário | 30min | Calendly + n8n | R$ 200/mês | Baixo |
| Cobrança e follow-up de pagamento | Mensal | 1h | n8n + WhatsApp | R$ 200/mês | Baixo |

**Total de horas automatizáveis:** ~14h/semana → R$ 2.200/mês de tempo liberado

---

## 2. Oportunidades de Automação — Para Clientes PME

### Por Setor

**Manufatura/Indústria:**
| Automação | Ferramenta | ROI Para o Cliente | Dificuldade |
|---|---|---|---|
| Controle de estoque com alertas | n8n + planilha | Reduz estoque em 20-30% | Baixa |
| Relatório de produção diário | n8n + Google Sheets | -2h/dia do gestor | Baixa |
| Alerta de manutenção preditiva | n8n + IoT básico | Evita parada de máquina | Média |
| Qualidade: fotos de defeito para IA | Claude Vision + n8n | -50% tempo de inspeção | Média |

**Serviços/Saúde:**
| Automação | Ferramenta | ROI Para o Cliente | Dificuldade |
|---|---|---|---|
| Confirmação de consulta por WhatsApp | n8n + Twilio | -30% no show | Baixa |
| Prontuário com transcrição de IA | Whisper + n8n | -1h/dia do médico | Média |
| Cobrança automática pós-consulta | n8n + PIX API | -70% inadimplência | Média |
| Triagem de pacientes por IA | Claude + formulário | -40% tempo de recepção | Alta |

**Restaurante/Alimentação:**
| Automação | Ferramenta | ROI Para o Cliente | Dificuldade |
|---|---|---|---|
| Pedido de estoque automático | n8n + fornecedores | -15% custo de estoque | Baixa |
| Cardápio digital com IA de sugestão | Claude + WhatsApp | +15% ticket médio | Média |
| Análise de desperdício de alimentos | n8n + planilha | -20% custo de food waste | Baixa |

---

## 3. Stack de Automação Recomendado para PMEs

\`\`\`
NÍVEL 1 — Starter (R$ 0-500/mês)
  n8n (self-hosted) + Google Workspace + WhatsApp
  → Para: follow-ups, alertas, relatórios básicos

NÍVEL 2 — Growth (R$ 500-2k/mês)
  n8n + Claude API + Supabase + Zapier backup
  → Para: IA em processos, geração de conteúdo, análise de dados

NÍVEL 3 — Scale (R$ 2k-10k/mês)
  n8n + Claude + RAG (pgvector) + APIs especializadas
  → Para: agentes autônomos, memória de longo prazo, multi-cliente
\`\`\`

---

## 4. Próximas 5 Automações a Implementar

| Prioridade | Automação | Benefício | Esforço | Implementar em |
|---|---|---|---|---|
| 1 | Follow-up de leads no WhatsApp | +20% taxa de resposta | 4h | Esta semana |
| 2 | Relatório semanal de progresso para clientes | -2h/semana | 3h | Esta semana |
| 3 | Onboarding automatizado (Google Drive + WhatsApp) | -3h por novo cliente | 6h | Próxima semana |
| 4 | Alerta de KPI abaixo da meta | Detecção precoce de problemas | 2h | Esta semana |
| 5 | Agendamento de diagnóstico via Calendly+n8n | +5 diagnósticos/mês | 2h | Hoje |

---

## 5. Tendências de Automação com IA (2026)

### O Que Está Chegando para PMEs
1. **Agentes de IA autônomos** — executam tarefas multi-step sem intervenção humana
2. **Voice AI para atendimento** — substitui recepcionista em clínicas e escritórios
3. **Computer Vision para controle de qualidade** — câmera + IA detecta defeitos
4. **RAG para knowledge base do cliente** — IA responde sobre o processo do cliente
5. **AI-powered analytics** — BI conversacional para PMEs sem analista de dados

---

TÍTULO: AI Automation Discovery — ${area} ${taskDate}
CONTEXTO: Mapeamento de oportunidades de automação com IA para SmartOps IA e clientes
DADOS ANALISADOS: Processos internos, setores de clientes, tendências 2026
PROBLEMA IDENTIFICADO: 14h/semana de tarefas manuais automatizáveis na própria consultoria
EVIDÊNCIA: Processos de follow-up, onboarding e relatórios feitos manualmente
IMPACTO: R$ 2.200/mês de tempo liberado para trabalho estratégico
RECOMENDAÇÃO: Implementar as 5 automações priorizadas
AÇÃO SUGERIDA: Criar workflow n8n de follow-up de leads esta semana
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: 3x ROI em 60 dias (tempo liberado = mais clientes atendidos)
RISCO DE NÃO AGIR: Continuar gastando tempo em tarefas que a IA já faz melhor
PRAZO: 30 dias para implementar top 5
MÉTRICA DE SUCESSO: 5 automações ativas + 14h/semana liberadas
PRÓXIMO PASSO: Criar workflow n8n de follow-up de leads hoje`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('AI automation discovery report generated');

  fs.writeFileSync(path.join(autoDir, 'ai_automation_discovery.md'), reportMD);
  fs.writeFileSync(path.join(autoDir, 'metadata.json'), JSON.stringify({ date: taskDate, area }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ AI Automation Discovery: ${path.join(autoDir, 'ai_automation_discovery.md')}`);
  appendLog('ai_automation_discovery complete ✓');
}

runAiAutomationDiscovery().catch(err => {
  console.error('AI Automation Discovery error:', err.message);
  process.exit(1);
});
