#!/usr/bin/env node
/**
 * Automation Agent — SmartOps IA
 * n8n, APIs, RPA, webhooks e automação de processos
 *
 * Usage:
 *   node automation_agent.js --mode discover --setor industria
 *   node automation_agent.js --mode design --processo "onboarding de cliente"
 *   node automation_agent.js --mode n8n-flow --processo "lead capture"
 *   node automation_agent.js --mode webhook --evento "novo lead"
 *   node automation_agent.js --mode whatsapp --fluxo "follow-up"
 *   node automation_agent.js --mode roi --processo "relatorio semanal"
 *   node automation_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function calcAutomationROI(horas_mes, custo_hora_brl = 50, custo_impl_brl = 2000) {
  const economia_mes = horas_mes * custo_hora_brl;
  const payback_meses = Math.ceil(custo_impl_brl / economia_mes);
  const roi_12m = ((economia_mes * 12 - custo_impl_brl) / custo_impl_brl * 100).toFixed(0);
  return { economia_mes, payback_meses, roi_12m: `${roi_12m}%`, economia_anual: economia_mes * 12 };
}

function scoreAutomation(freq_dia, impacto_erro, h_por_exec, complexidade_inv) {
  const vol = Math.min(freq_dia * 30, 100) * 0.3;
  const err = impacto_erro * 0.25;
  const time = Math.min(h_por_exec * 20, 100) * 0.3;
  const ease = complexidade_inv * 0.15;
  return Math.round(vol + err + time + ease);
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `automation_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Automation Agent da SmartOps IA — especialista em automação de processos, n8n, APIs e RPA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Foco: PMEs em BH com 5-200 funcionários.

FERRAMENTAS DISPONÍVEIS:
No-code: ${CONFIG.tools.no_code.join(', ')}
APIs: ${CONFIG.tools.apis.join(', ')}
Comunicação: ${CONFIG.tools.comms.join(', ')}
Storage: ${CONFIG.tools.storage.join(', ')}

CATÁLOGO DE AUTOMAÇÕES (ROI validado):
${CONFIG.automation_catalog.slice(0,6).map(a => `- ${a.nome}: ${a.complexidade} | ${a.roi_h_mes}h/mês | ${a.desc}`).join('\n')}

REGRAS:
- Sempre calcular ROI antes de recomendar
- Priorizar automações de alto impacto e baixa complexidade
- Nunca automatizar processo não documentado
- Sugerir sempre o n8n como ferramenta principal`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  AUTOMATION AGENT — SmartOps IA                 ║');
  console.log('║  "Automatize o repetível. Libere o humano."     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'discover': {
        const setor = getArg('setor', 'servicos');
        const candidates = CONFIG.automation_catalog;
        const scored = candidates.map(a => ({
          ...a,
          score: scoreAutomation(3, 8, a.roi_h_mes / 30, a.complexidade === 'Baixa' ? 9 : a.complexidade === 'Média' ? 6 : 3),
          roi: calcAutomationROI(a.roi_h_mes),
        })).sort((a, b) => b.score - a.score);
        console.log('\n📊 Automações por Score (calculado localmente):');
        scored.forEach((a, i) => console.log(`  ${i+1}. [${a.score}] ${a.nome} — payback ${a.roi.payback_meses} meses | ROI 12m: ${a.roi.roi_12m}`));
        const result = await ask(`${BASE}

SETOR: ${setor}
TOP CANDIDATOS (por score): ${scored.slice(0,5).map(a => a.nome).join(', ')}

Analise e priorize as automações para uma PME do setor ${setor} em BH:

## Top 5 Automações Para Este Setor
Para cada uma:
### [Nome]
**Por que é prioritária:** [contexto do setor]
**Trigger:** [o que dispara a automação]
**Fluxo resumido:** [Trigger → Ação 1 → Ação 2 → Output]
**Ferramentas:** [n8n + integração específica]
**ROI estimado:** [horas/mês + R$/mês + payback]
**Complexidade:** [Baixa/Média/Alta] | **Prazo de implementação:** [X dias]

## Quick Wins (implementar esta semana)
[2 automações que qualquer PME pode fazer em < 3 dias]

## Roadmap de Automação (90 dias)
Mês 1: [fundação]
Mês 2: [expansão]
Mês 3: [otimização]`);
        console.log(result);
        save(dir, `discover_${setor}_${date}.md`, result);
        break;
      }

      case 'design': {
        const processo = getArg('processo', 'onboarding de cliente');
        const result = await ask(`${BASE}

PROCESSO: ${processo}

Projete a AUTOMAÇÃO COMPLETA:

## Análise do Processo Atual
[Estado as-is — como é feito hoje manualmente]
[Pontos de dor, erros comuns, tempo gasto]

## Fluxo Automatizado (to-be)

### Trigger
[O que inicia a automação — evento, webhook, schedule, form]

### Fluxo Principal
\`\`\`
[Trigger]
    ↓
[Passo 1: ação + ferramenta]
    ↓
[Passo 2: condição ou transformação]
    ↓
[Passo 3: integração]
    ↓
[Output / Notificação]
\`\`\`

### Tratamento de Exceções
[O que fazer se falhar em cada passo]

## Implementação no n8n
Nodes necessários: ${CONFIG.n8n_nodes.triggers.join(', ')} etc.
[Configuração de cada node-chave]

## Dados Necessários
[Campos, APIs, credenciais que precisam estar configurados]

## Teste
[Como validar que a automação funciona corretamente]

## ROI
Horas economizadas: [X h/mês]
Custo de implementação: [R$X]
Payback: [X meses]`);
        console.log(result);
        save(dir, `design_${processo.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'n8n-flow': {
        const processo = getArg('processo', 'lead capture e notificação');
        const result = await ask(`${BASE}

Crie o WORKFLOW N8N DETALHADO para: ${processo}

## Estrutura do Workflow

### Nodes (em ordem)
1. **[Trigger Node]**
   - Tipo: [Webhook/Schedule/Form/etc]
   - Configuração: [campos específicos]

2. **[Transformation Node]**
   - Tipo: [Set/Code/If/etc]
   - Lógica: [o que transforma/filtra]

3. **[Integration Node]**
   - Tipo: [Google Sheets/Gmail/Telegram/etc]
   - Ação: [o que faz com os dados]

[Continuar para todos os nodes]

## JSON de Configuração (simplificado)
\`\`\`json
{
  "name": "${processo}",
  "nodes": [
    { "type": "[node type]", "name": "[nome]", "config": {} }
  ],
  "connections": {}
}
\`\`\`

## Variáveis de Ambiente Necessárias
[Quais .env vars configurar]

## Como Testar
[Passo a passo para validar o workflow]

## Erro mais comum e solução
[O que costuma dar errado e como resolver]`);
        console.log(result);
        save(dir, `n8n_flow_${processo.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'webhook': {
        const evento = getArg('evento', 'novo lead do formulário');
        const result = await ask(`${BASE}

EVENTO: ${evento}

Configure o WEBHOOK COMPLETO:

## Endpoint
URL: [estrutura do webhook no n8n]
Método: POST
Content-Type: application/json

## Payload Esperado
\`\`\`json
{
  "exemplo": "de payload que será recebido"
}
\`\`\`

## Validação
[Como validar que o webhook recebeu corretamente]

## Transformação
[Como tratar/normalizar os dados recebidos]

## Ações Disparadas
[O que acontece depois que o webhook é recebido]

## Segurança
[Token, IP whitelist, ou outras medidas]

## Código de Teste (cURL)
\`\`\`bash
curl -X POST [URL] -H "Content-Type: application/json" -d '{"teste": true}'
\`\`\``);
        console.log(result);
        save(dir, `webhook_${evento.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'whatsapp': {
        const fluxo = getArg('fluxo', 'follow-up de lead');
        const result = await ask(`${BASE}

FLUXO WHATSAPP: ${fluxo}

Projete o FLUXO DE WHATSAPP AUTOMATIZADO:

## Configuração
API: WhatsApp Business API / Twilio / Z-API
Integração: n8n + ${CONFIG.tools.comms[0]}

## Mensagens da Sequência

### Mensagem 1 — [Trigger]
Quando enviar: [condição]
Texto:
"""
[Mensagem exata — natural, pessoal, não robótica]
"""

### Mensagem 2 — [X horas/dias depois]
Condição: [se não respondeu ou se respondeu X]
Texto: [mensagem]

### Mensagem 3 — [Follow-up final]
Texto: [mensagem]

## Tratamento de Respostas
[Se responder "sim" → ação A | se responder "não" → ação B | sem resposta → ação C]

## Opt-out
[Como o usuário sai do fluxo]

## Métricas
[Taxa de resposta esperada, taxa de conversão, o que acompanhar]`);
        console.log(result);
        save(dir, `whatsapp_${fluxo.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'crm': {
        const resultado = await ask(`${BASE}

Configure o CRM AUTOMATIZADO da SmartOps IA usando n8n + Google Sheets (custo zero):

## Estrutura da Planilha CRM

### Aba Leads
| Coluna | Tipo | Descrição |
|--------|------|-----------|
[Definir todas as colunas]

### Aba Pipeline
[Estágios: Novo → Qualificado → Reunião → Proposta → Fechado/Perdido]

### Aba Clientes Ativos
[Campos para acompanhar projetos]

## Automações do CRM
1. **Novo lead → linha na planilha + notificação Telegram**
2. **Mudança de stage → atualiza timestamp + alerta**
3. **Lead parado > 7 dias → alerta de follow-up**
4. **Proposta enviada → lembrete em 3 dias**
5. **Cliente ativo → check semanal de satisfação**

## Integrações
[Como conectar formulário → CRM → Telegram → Email]

## Dashboard de Vendas
[Fórmulas Google Sheets para pipeline health, taxa de conversão, receita prevista]`);
        console.log(resultado);
        save(dir, `crm_config_${date}.md`, resultado);
        break;
      }

      case 'email-flow': {
        const tipo = getArg('tipo', 'nurture');
        const result = await ask(`${BASE}

FLUXO DE EMAIL: ${tipo}
Ferramenta: n8n + Gmail ou SMTP

Projete o FLUXO DE EMAIL AUTOMATIZADO:

## Trigger
[O que inicia a sequência]

## Sequência de Emails

### Email 1 — Imediato
Assunto: [max 60 chars]
Conteúdo: [estrutura do email]
Objetivo: [o que precisa acontecer]

### Email 2 — [X dias depois]
### Email 3 — [X dias depois]
### Email 4 — [X dias depois]

## Lógica de Ramificação
[Se abriu → faz X | Se não abriu → faz Y | Se clicou → faz Z]

## Configuração no n8n
[Nodes necessários: Schedule, Gmail node, IF, Set]

## Métricas de Sucesso
[Taxa de abertura meta, CTR meta, conversão meta]`);
        console.log(result);
        save(dir, `email_flow_${tipo}_${date}.md`, result);
        break;
      }

      case 'roi': {
        const processo = getArg('processo', 'relatório semanal');
        const horas = parseFloat(getArg('horas', '6'));
        const custo_impl = parseFloat(getArg('custo-impl', '2000'));
        const roi = calcAutomationROI(horas, 50, custo_impl);
        console.log('\n📊 ROI Calculado (localmente):');
        console.log(`  Horas economizadas/mês: ${horas}h`);
        console.log(`  Economia mensal: R$${roi.economia_mes}`);
        console.log(`  Economia anual: R$${roi.economia_anual}`);
        console.log(`  Custo de implementação: R$${custo_impl}`);
        console.log(`  Payback: ${roi.payback_meses} meses`);
        console.log(`  ROI 12 meses: ${roi.roi_12m}`);
        const result = await ask(`${BASE}

PROCESSO: ${processo}
HORAS ECONOMIZADAS: ${horas}h/mês
ECONOMIA MENSAL: R$${roi.economia_mes}
ROI 12 MESES: ${roi.roi_12m}
PAYBACK: ${roi.payback_meses} meses

## Análise de ROI da Automação

### Breakdown dos Benefícios
[Quantificar todos os benefícios tangíveis e intangíveis]

### Riscos de Implementação
[O que pode dar errado e quanto custaria]

### Comparação: Automatizar vs. Contratar
[Análise de custo de alternativas]

### Recomendação Final
[Go / No-go / Condicional — com justificativa]

### Cronograma para Break-even
[Mês a mês até o payback]`);
        console.log(result);
        save(dir, `roi_${processo.replace(/\s/g,'_')}_${date}.json`, { processo, horas, roi, analise: result });
        break;
      }

      case 'monitor': {
        const result = await ask(`${BASE}

Crie o PLANO DE MONITORAMENTO das automações da SmartOps IA:

## Dashboard de Automações
[Como visualizar status de todas as automações em tempo real]

## Alertas Críticos
[Quais falhas devem gerar alerta imediato no Telegram]

## Logs e Auditoria
[O que registrar, onde e por quanto tempo]

## Revisão Semanal
[Checklist de revisão toda segunda-feira]

## Indicadores de Saúde
| Automação | Execuções/dia esperadas | Tempo médio | Taxa de erro máx |
|-----------|------------------------|-------------|-----------------|

## Processo de Resposta a Falha
[O que fazer quando uma automação quebra]`);
        console.log(result);
        save(dir, `monitor_plan_${date}.md`, result);
        break;
      }

      case 'report': {
        const catalog = CONFIG.automation_catalog;
        const top3 = catalog.slice(0, 3).map(a => `${a.nome} (${a.roi_h_mes}h/mês, ${a.complexidade})`).join(' | ');
        const result = await ask(`${BASE}

TOP AUTOMAÇÕES POR ROI: ${top3}

# Automation Agent — Report Semanal

## Status das Automações Ativas
[Quais estão rodando, quais precisam de atenção]

## Quick Win da Semana
[Uma automação que Breno pode implementar em < 1 dia]

## Automação de Alto Impacto (próxima a implementar)
[A próxima automação de maior ROI — com plano de implementação]

## Insights de Processo
[Um processo observado que merece ser automatizado]

## Métricas da Semana
[Horas economizadas estimadas, automações rodando, erros detectados]

## Próximo Passo de Automação
[A ação concreta para esta semana]`);
        console.log(result);
        save(dir, `automation_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: discover | design | n8n-flow | webhook | whatsapp | crm | email-flow | roi | monitor | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
