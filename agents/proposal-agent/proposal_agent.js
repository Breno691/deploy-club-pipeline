#!/usr/bin/env node
/**
 * Proposal Agent — SmartOps IA
 * Propostas comerciais personalizadas com ROI calculado
 *
 * Usage:
 *   node proposal_agent.js --mode generate --nome "João" --empresa "Metal BH" --problema "retrabalho 15%"
 *   node proposal_agent.js --mode roi --ticket 11500 --waste-cost 8000 --impl-hours 40
 *   node proposal_agent.js --mode followup --nome "João" --days 3 --stage proposta_enviada
 *   node proposal_agent.js --mode template --service diagnostico-plano
 *   node proposal_agent.js --mode customize --service quick-win --sector saude
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0) { return parseFloat(getArg(n, String(fb))); }
function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `proposal_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, content) {
  const p = path.join(dir, fn);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}

function calcProposalROI(ticket, wasteCostMonth, implHours) {
  const impl_cost = implHours * 150;
  const monthly_savings = wasteCostMonth;
  const payback = monthly_savings > 0 ? Math.ceil(impl_cost / monthly_savings) : null;
  const roi_12m = impl_cost > 0 && monthly_savings > 0 ? Math.round(((monthly_savings * 12 - impl_cost) / impl_cost) * 100) : 0;
  return {
    ticket, impl_cost, monthly_savings, payback_months: payback,
    roi_12m_pct: roi_12m, annual_savings: Math.round(monthly_savings * 12),
    roi_ratio: impl_cost > 0 ? Math.round((monthly_savings * 12 / impl_cost) * 10) / 10 : 0,
  };
}

async function ask(prompt) {
  const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] });
  return r.content[0].text;
}

async function main() {
  const mode = getArg('mode', 'generate');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  PROPOSAL AGENT — SmartOps IA                   ║');
  console.log('║  Propostas que fecham negócios                  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  const services = CONFIG.services;

  try {
    switch (mode) {
      case 'generate': {
        const nome     = getArg('nome', 'Prospect');
        const empresa  = getArg('empresa', '');
        const setor    = getArg('sector', 'industria');
        const problema = getArg('problema', '');
        const impacto  = parseNum('impact', 0);
        const service  = getArg('service', 'diagnostico-plano');
        const svc      = services[service] || services['diagnostico-plano'];
        const roi      = calcProposalROI(svc.ticket, impacto, 40);

        console.log(`Gerando proposta para ${nome} (${empresa})...\n`);
        console.log(`Serviço: ${svc.name} | Ticket: R$ ${svc.ticket.toLocaleString('pt-BR')}`);
        if (impacto > 0) console.log(`ROI estimado: ${roi.roi_12m_pct}% em 12 meses | Payback: ${roi.payback_months} meses\n`);

        const result = await ask(`Você é o Proposal Agent da SmartOps IA.
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Empresa: SmartOps IA — consultoria Lean + Automação IA, BH

Gere uma proposta comercial completa e personalizada:

CLIENTE: ${nome} | EMPRESA: ${empresa} | SETOR: ${setor}
PROBLEMA: ${problema || 'processos manuais com retrabalho'}
IMPACTO FINANCEIRO ESTIMADO: R$ ${impacto.toLocaleString('pt-BR')}/mês
SERVIÇO: ${svc.name}
TICKET: R$ ${svc.ticket.toLocaleString('pt-BR')}
PRAZO: ${svc.semanas ? svc.semanas + ' semanas' : 'mensal recorrente'}
ENTREGÁVEIS: ${svc.entregaveis.join(', ')}
GARANTIA: ${svc.garantia}

ROI CALCULADO:
Custo mensal do problema: R$ ${impacto.toLocaleString('pt-BR')}
Investimento: R$ ${svc.ticket.toLocaleString('pt-BR')}
Economia anual esperada: R$ ${roi.annual_savings.toLocaleString('pt-BR')}
Payback: ${roi.payback_months || '?'} meses
ROI 12 meses: ${roi.roi_12m_pct}%

Estrutura obrigatória da proposta:

# PROPOSTA COMERCIAL — ${empresa || nome}
## SmartOps IA × ${empresa || nome}

### 1. SUMÁRIO EXECUTIVO (1 parágrafo — foco no problema e no ROI)
### 2. DIAGNÓSTICO DA SITUAÇÃO ATUAL (o que observamos)
### 3. CUSTO DO PROBLEMA ATUAL (em R$ — tornando a dor tangível)
### 4. SOLUÇÃO PROPOSTA (o que a SmartOps vai fazer)
### 5. METODOLOGIA (como vamos trabalhar juntos)
### 6. ENTREGÁVEIS (lista clara do que será entregue)
### 7. CRONOGRAMA (semana a semana)
### 8. ROI CALCULADO (tabela: investimento × retorno × payback)
### 9. INVESTIMENTO (valor, forma de pagamento, garantia)
### 10. PRÓXIMOS PASSOS (o que fazer para começar)`);

        console.log(result);
        save(path.join(dir,'reports'), `proposal_${nome.replace(/\s/g,'_')}_${Date.now()}.md`, result);
        save(path.join(dir,'reports'), 'roi_data.json', roi);
        break;
      }
      case 'roi': {
        const ticket     = parseNum('ticket', 11500);
        const waste_cost = parseNum('waste-cost', 5000);
        const impl_hours = parseNum('impl-hours', 40);
        const roi = calcProposalROI(ticket, waste_cost, impl_hours);
        console.log('ROI DA PROPOSTA\n');
        console.log(`Ticket: R$ ${ticket.toLocaleString('pt-BR')}`);
        console.log(`Custo mensal do desperdício: R$ ${waste_cost.toLocaleString('pt-BR')}`);
        console.log(`Custo de implementação: R$ ${roi.impl_cost.toLocaleString('pt-BR')}`);
        console.log(`Economia anual: R$ ${roi.annual_savings.toLocaleString('pt-BR')}`);
        console.log(`Payback: ${roi.payback_months} meses | ROI 12m: ${roi.roi_12m_pct}% | Ratio: ${roi.roi_ratio}×\n`);
        save(path.join(dir,'reports'), 'roi_calculation.json', roi);
        break;
      }
      case 'followup': {
        const nome  = getArg('nome', 'cliente');
        const days  = parseNum('days', 3);
        const stage = getArg('stage', 'proposta_enviada');
        const result = await ask(`Você é o Proposal Agent da SmartOps IA.
${nome} recebeu uma proposta há ${days} dias (stage: ${stage}) e não respondeu.
Empresa: SmartOps IA — consultoria Lean + Automação IA

Crie 3 opções de follow-up:

# PROPOSAL FOLLOW-UP — ${nome}

## CONTEXTO
[Por que pode estar sem responder — 3 hipóteses]

## MENSAGEM 1 — WhatsApp (curta, direta)
[2-3 linhas máximo — sem pressão]

## MENSAGEM 2 — Email (média, com valor)
[Adiciona algo novo — insight, dado, case]

## MENSAGEM 3 — Última tentativa (após 7+ dias)
[Deixa porta aberta, remove atrito]

## QUANDO PARAR
[Após quantas tentativas e como encerrar bem]`);
        console.log(result);
        save(path.join(dir,'reports'), `followup_${nome.replace(/\s/g,'_')}_${Date.now()}.md`, result);
        break;
      }
      case 'template': {
        const service = getArg('service', 'diagnostico-plano');
        const svc     = services[service] || services['diagnostico-plano'];
        const result  = await ask(`Você é o Proposal Agent da SmartOps IA.

Crie um template de proposta reutilizável para o serviço: ${svc.name}
Ticket: R$ ${svc.ticket.toLocaleString('pt-BR')}
Entregáveis: ${svc.entregaveis.join(', ')}
Garantia: ${svc.garantia}

O template deve ter [VARIÁVEIS] nos campos a personalizar.
Formato: proposta completa pronta para enviar após substituir as variáveis.`);
        console.log(result);
        save(path.join(dir,'reports'), `template_${service}.md`, result);
        break;
      }
      default:
        console.log('Modos: generate | roi | followup | template | customize');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
