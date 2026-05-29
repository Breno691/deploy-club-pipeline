require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName    = get('--task') || 'process_mining';
const taskDate    = get('--date') || new Date().toISOString().split('T')[0];
const processFile = get('--process') || null;
const outputDir   = path.join('outputs', `${taskName}_${taskDate}`);
const agentDir    = path.join(outputDir, 'process_mining');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'process_mining.log'),
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

async function runProcessMiningAgent() {
  console.log(`\nProcess Mining Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [agentDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('process_mining_agent started');

  const clients = await getData.getClients();

  const processData = processFile ? readFileSafe(processFile) : '';
  const leanReport  = findLatestOutput('lean', 'lean', 'lean_report.md');
  const sigmaReport = findLatestOutput('six_sigma', 'sigma', 'six_sigma_report.md');
  const kaizenReport = findLatestOutput('kaizen', 'kaizen', 'kaizen_report.md');

  const hasProcessData = processData.length > 0;

  console.log('  → Minerando processos e identificando gargalos...');
  appendLog(`Process data available: ${hasProcessData}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 5000,
    messages: [{
      role: 'user',
      content: `Você é o Process Mining Agent da SmartOps IA.
Seu cargo: Process Mining Specialist + Operational Excellence Analyst.
Especialidade: Descobrir processos reais a partir de dados, logs e eventos — não como deveriam ser, mas como são.
Autonomia: SUPERVISIONADO — analisa dados disponíveis e cria framework de coleta para clientes.

## EMPRESA / CONTEXTO
SmartOps IA — consultoria Lean Six Sigma + Automação com IA para PMEs em BH/MG
Data: ${taskDate}
Clientes ativos: ${clients.length}

## DADOS DE PROCESSO DISPONÍVEIS
${hasProcessData ? `### Arquivo de processo fornecido:\n${processData.slice(0, 2000)}` : `⚠️ Sem dados de processo de clientes ainda.
Modo: Framework de diagnóstico + preparação para quando tiver clientes reais.`}

## RELATÓRIOS DE OUTROS AGENTES
${leanReport ? `### Lean Agent:\n${leanReport.slice(0, 400)}` : ''}
${sigmaReport ? `### Six Sigma Agent:\n${sigmaReport.slice(0, 400)}` : ''}

---

# PROCESS MINING REPORT — SmartOps IA
## ${taskDate}

---

## 1. O QUE É PROCESS MINING E POR QUE É CRÍTICO

Process Mining descobre como os processos REALMENTE funcionam — não como estão no fluxograma.

### Diferença fundamental:
| Abordagem | O que mostra | Problema |
|---|---|---|
| Fluxograma tradicional | Como deveria ser | Ignora variações reais |
| Entrevistas | Como as pessoas acham que é | Viés de confirmação |
| **Process Mining** | **Como realmente é (dados)** | **Precisa de dados de sistema** |

### Onde encontrar dados para mining em PMEs:
- ERP (SAP, TOTVS, Senior) → ordens de produção, movimentação de estoque
- CRM → contatos, propostas, fechamentos, follow-ups
- E-mail → comunicações de processo
- Planilhas Excel → qualquer processo gerido em planilha
- WhatsApp Business → atendimento e vendas
- Sistema de tickets/chamados → suporte e manutenção
- Nota fiscal eletrônica → fluxo de venda e entrega
- Ponto eletrônico → presença e rotatividade

---

## 2. FRAMEWORK DE DIAGNÓSTICO DE PROCESSO

### 2.1 Perguntas Essenciais para Qualquer Cliente

**Para descobrir o processo real (não o ideal):**

\`\`\`
BLOCO A — Fluxo de Trabalho
1. Qual sistema registra o início de cada pedido/ordem?
2. Quantos sistemas diferentes um pedido passa até ser entregue?
3. Qual etapa mais atrasa? Quanto tempo leva em média?
4. Onde o trabalho "fica parado" esperando aprovação ou informação?
5. Quais exceções acontecem com mais frequência?

BLOCO B — Dados Disponíveis
6. Vocês têm ERP? Qual? Desde quando?
7. Os dados de produção são registrados em sistema ou planilha?
8. Quantos registros de pedidos têm nos últimos 6 meses?
9. Vocês registram data/hora de cada etapa do processo?
10. Alguém tem acesso de extração de dados do sistema?

BLOCO C — Métricas Ocultas
11. Qual o lead time médio (pedido → entrega)?
12. Quantos pedidos têm retrabalho por semana?
13. Qual o percentual de entregas no prazo?
14. Quantas reclamações de cliente por mês?
15. Quanto material vai para rejeito por semana?
\`\`\`

---

## 3. MODELOS DE PROCESSO PARA SETOR DA SMARTOPS IA

### 3.1 Indústria / Manufatura

**Processos com maior potencial de mining:**

| Processo | Dados-fonte | Desperdícios típicos | Ganho estimado |
|---|---|---|---|
| Pedido → Produção → Entrega | ERP/ordem de produção | Espera entre etapas, lote mínimo alto | -30-50% lead time |
| Compras → Recebimento → Almoxarifado | NF-e + ERP | Excesso de estoque, falta de materiais críticos | -20% capital imobilizado |
| Qualidade → Retrabalho → Rejeito | Registros de defeito | Problema na origem não identificado | -40-60% retrabalho |
| Manutenção → Parada → Reparo | CMMS/planilha | Manutenção reativa vs preventiva | -25% downtime |

**Como coletar dados em 1 semana:**
1. Solicitar export de ordens de produção dos últimos 3 meses
2. Colunas necessárias: ID, data_abertura, data_encerramento, etapa, responsável, status
3. Com isso + Excel/Python → identificamos top 3 gargalos em 2h

---

### 3.2 Serviços / Escritório (Lean Office)

**Processos com maior potencial:**

| Processo | Dados-fonte | Desperdícios típicos | Ganho estimado |
|---|---|---|---|
| Proposta → Aprovação → Contrato | CRM/e-mail | Retrabalho em propostas, aprovações longas | -50% ciclo de venda |
| Atendimento → Resolução → Fechamento | Tickets/CRM | Fila longa, escaladas desnecessárias | -40% tempo de resolução |
| Recrutamento → Onboarding | RH/planilha | Processo manual, candidatos perdidos | -30% tempo de contratação |
| Faturamento → Cobrança → Pagamento | Financeiro | Atrasos em boletos, erros de NF | -60% inadimplência |

---

## 4. DESCOBERTA AUTOMÁTICA DE GARGALOS — MÉTODO

${hasProcessData ? `### Análise dos Dados Fornecidos:

#### Etapas detectadas:
[Analisar o arquivo ${processFile} e identificar etapas únicas]

#### Distribuição de tempo por etapa:
[Calcular tempo médio em cada etapa e identificar onde está o maior tempo]

#### Variações e outliers:
[Identificar casos fora do padrão — casos que demoram 2x mais que a média]

#### Top 3 gargalos identificados:
1. [Etapa X] — tempo médio: Y horas | frequência: Z%
2. [Etapa Y] — tempo médio: Y horas | frequência: Z%
3. [Etapa Z] — tempo médio: Y horas | frequência: Z%` : `### Sem dados de processo disponíveis

Para rodar uma análise real, forneça um arquivo CSV/Excel com:
\`\`\`
node scripts/process_mining_agent.js --process data/processo_cliente.csv
\`\`\`

Formato esperado do arquivo:
\`\`\`csv
case_id,atividade,timestamp,recurso
OP-001,Abertura OS,2026-05-01 08:00,João
OP-001,Produção,2026-05-01 09:30,Máquina 1
OP-001,Qualidade,2026-05-01 14:00,Maria
OP-001,Expedição,2026-05-02 10:00,Pedro
OP-002,Abertura OS,2026-05-01 10:00,Carlos
...
\`\`\`

Com esses dados: identifica automaticamente gargalos, calcula lead time por etapa, detecta loops e retrabalho.`}

---

## 5. PLAYBOOK DE COLETA DE DADOS PARA CLIENTES

### Sprint de Descoberta (1 semana)

**Dia 1-2: Mapeamento com o cliente**
- Workshop de 2h: "Me mostre como um pedido vira entrega"
- Filmar o processo (com permissão) — captura o que não é dito
- Coletar amostras de documentos físicos ou digitais usados

**Dia 3: Extração de dados**
- Solicitar export do sistema (ERP, CRM, planilha)
- Formato: qualquer coisa que tenha data/hora + etapa + ID
- Mínimo: 100 registros dos últimos 3 meses

**Dia 4: Análise**
- Rodar este agente com os dados reais
- Construir mapa de processo atual (as-is)
- Identificar top 3 gargalos com dados

**Dia 5: Apresentação**
- Mostrar o processo real vs. o que o cliente achou que era
- Quantificar o impacto financeiro de cada gargalo
- Propor processo futuro (to-be)

---

## 6. FERRAMENTAS DE PROCESS MINING

### Gratuitas (para começar)
| Ferramenta | O que faz | Onde usar |
|---|---|---|
| PM4Py (Python) | Mining completo via código | Análises avançadas |
| Disco (free tier) | Interface visual, BPMN | Demos para clientes |
| Excel + Power Query | Mining básico em planilhas | Clientes sem sistema |

### Pagas (quando escalar)
| Ferramenta | Especialidade |
|---|---|
| Celonis | Enterprise, conecta a ERPs |
| UiPath Process Mining | Integrado ao RPA |
| Minit | Análise de compliance |

### Para automatizar com n8n
- n8n lê dados do ERP via API ou CSV
- Roda análise básica (lead time, gargalos)
- Envia relatório semanal automático para o cliente
- Isso vira produto de monitoramento contínuo (receita recorrente)

---

## 7. OPORTUNIDADE DE PRODUTO

**Process Mining como Serviço Recorrente:**
- Fase 1: Diagnóstico inicial (R$ 5.000 — 1 semana)
- Fase 2: Monitoramento mensal via dashboard (R$ 2.000/mês)
- Fase 3: Alertas automáticos quando KPI desviar (n8n + WhatsApp)

Esse modelo transforma uma consultoria pontual em receita recorrente.

---

TÍTULO: Process Mining — Framework e Diagnóstico ${taskDate}
CONTEXTO: SmartOps IA — análise de processos para clientes PMEs
DADOS ANALISADOS: ${hasProcessData ? 'Dados de processo fornecidos' : 'Framework sem dados de cliente ainda'}
PROBLEMA IDENTIFICADO: ${hasProcessData ? 'Gargalos identificados nos dados' : 'Sem dados de processo de clientes — framework criado para quando chegar'}
EVIDÊNCIA: ${hasProcessData ? 'Análise de logs de processo' : 'Metodologia baseada em benchmarks industriais'}
IMPACTO: Potencial de -30-50% lead time para clientes de manufatura
RECOMENDAÇÃO: ${hasProcessData ? 'Apresentar análise ao cliente' : 'Usar framework para próximo cliente — coletar dados na primeira visita'}
AÇÃO SUGERIDA: ${hasProcessData ? 'Agendar apresentação de resultados' : 'Incluir coleta de dados no próximo diagnóstico gratuito'}
PRIORIDADE: ${hasProcessData ? 'Alta' : 'Média'}
ESFORÇO: ${hasProcessData ? 'Baixo (análise pronta)' : 'Baixo (usar quando tiver dados)'}
ROI ESPERADO: R$ 5.000-7.000 por projeto de mining + R$ 2.000/mês recorrente
RISCO DE NÃO AGIR: Perder diferencial competitivo de análise baseada em dados
PRAZO: Implementar no próximo cliente
MÉTRICA DE SUCESSO: Pelo menos 1 projeto de mining fechado em 90 dias
PRÓXIMO PASSO: ${hasProcessData ? 'Apresentar resultados ao cliente' : 'Na próxima visita comercial, solicitar export do ERP/sistema do prospect'}`,
    }],
  });

  const report = resp.content[0].text.trim();
  appendLog('Process Mining report generated');

  const summary = {
    date: taskDate,
    has_process_data: hasProcessData,
    clients_active: clients.length,
    mode: hasProcessData ? 'analysis' : 'framework',
    autonomy_level: 'SUPERVISIONADO',
  };

  fs.writeFileSync(path.join(agentDir, 'process_mining_report.md'), report);
  fs.writeFileSync(path.join(agentDir, 'process_mining_summary.json'), JSON.stringify(summary, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Process Mining Report: ${path.join(agentDir, 'process_mining_report.md')}`);
  if (!hasProcessData) {
    console.log(`  ℹ️  Para analisar dados reais: npm run process-mining -- --process data/processo.csv`);
  }

  appendLog('process_mining_agent complete ✓');
}

runProcessMiningAgent().catch(err => {
  console.error('Process Mining Agent error:', err.message);
  process.exit(1);
});
