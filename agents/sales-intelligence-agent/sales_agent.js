#!/usr/bin/env node
/**
 * Sales Intelligence Agent — SmartOps IA
 * Leads, qualificação BANT, objeções, scripts e fechamento
 * "Vender é descobrir a dor. Solução vem depois."
 *
 * Usage:
 *   node sales_agent.js --mode qualify --nome "João" --empresa "Metal BH" --setor industria --urgencia 8 --decisor
 *   node sales_agent.js --mode objections --objection "é muito caro"
 *   node sales_agent.js --mode objections --playbook
 *   node sales_agent.js --mode script --stage reuniao_inicial
 *   node sales_agent.js --mode pipeline --leads 5 --reunioes 2 --propostas 1
 *   node sales_agent.js --mode followup --stage proposta_enviada --days 3
 *   node sales_agent.js --mode proposal-brief --nome "João" --problema "retrabalho na linha"
 *   node sales_agent.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { qualifyLeadWithClaude }                              = require('./src/agents/LeadQualificationAgent');
const { handleObjectionWithClaude, buildObjectionsPlaybook } = require('./src/agents/ObjectionsAgent');
const { calcBANTScore, calcPipelineHealth, calcSalesVelocity } = require('./src/calculations/salesCalculators');
const { CONFIG } = require('./src/config');

const client = new Anthropic();

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function parseNum(name, fallback = 0) { return parseFloat(getArg(name, String(fallback))); }
function hasFlag(name) { return process.argv.includes(`--${name}`); }

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `sales_${date}`);
  ['logs', 'reports'].forEach(d => { if (!fs.existsSync(path.join(dir, d))) fs.mkdirSync(path.join(dir, d), { recursive: true }); });
  return { dir, date };
}

function saveOutput(dir, filename, content) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✓ ${p}`);
}

async function runClaude(prompt) {
  const res = await client.messages.create({
    model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.content[0].text;
}

async function main() {
  const mode = getArg('mode', 'pipeline');

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  SALES INTELLIGENCE AGENT — SmartOps IA         ║');
  console.log('║  "Vender é descobrir a dor. Solução vem depois." ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode}\n`);

  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY não configurada'); process.exit(1); }

  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'qualify': {
        const leadData = {
          nome:         getArg('nome', 'Lead'),
          empresa:      getArg('empresa', ''),
          setor:        getArg('setor', ''),
          porte:        getArg('porte', ''),
          problema:     getArg('problema', ''),
          urgencia:     parseNum('urgencia', 5),
          e_decisor:    hasFlag('decisor'),
          tem_budget:   hasFlag('budget'),
          prazo:        getArg('prazo', 'nao_informado'),
          origem:       getArg('origem', 'site'),
        };
        console.log(`Qualificando lead: ${leadData.nome} (${leadData.empresa || 'empresa não informada'})\n`);

        const bant = calcBANTScore({
          budget: leadData.tem_budget ? 8 : 3, authority: leadData.e_decisor ? 9 : 4,
          need: leadData.urgencia >= 7 ? 9 : leadData.urgencia >= 4 ? 6 : 3,
          timeline: leadData.prazo === 'urgente' ? 10 : 7,
        });
        console.log(`BANT Score: ${bant.score}/100 (${bant.classification})`);
        console.log(`Próxima ação: ${bant.next_action}\n`);

        const { analysis } = await qualifyLeadWithClaude(leadData);
        console.log(analysis);
        saveOutput(path.join(dir, 'reports'), `qualify_${leadData.nome.replace(/\s/g, '_')}_${Date.now()}.md`, analysis);
        break;
      }

      case 'objections': {
        if (hasFlag('playbook')) {
          console.log('📚 Gerando Playbook de Objeções completo...\n');
          const playbook = await buildObjectionsPlaybook();
          console.log(playbook);
          saveOutput(path.join(dir, 'reports'), `objections_playbook_${date}.md`, playbook);
        } else {
          const objection = getArg('objection', 'é muito caro');
          const context   = getArg('context', '');
          console.log(`💬 Tratando objeção: "${objection}"\n`);
          const response = await handleObjectionWithClaude(objection, context);
          console.log(response);
          saveOutput(path.join(dir, 'reports'), `objection_${Date.now()}.md`, response);
        }
        break;
      }

      case 'script': {
        const stage  = getArg('stage', 'primeiro_contato');
        const context= getArg('context', '');
        console.log(`📝 Gerando script para: ${stage}\n`);

        const scripts = {
          primeiro_contato: 'primeira mensagem WhatsApp para lead novo que chegou pelo site',
          reuniao_inicial:  'abertura e descoberta na primeira reunião de diagnóstico',
          proposta_followup:'follow-up 3 dias após enviar proposta sem resposta',
          fechamento:       'empurrar para o sim após objeções já tratadas',
        };

        const result = await runClaude(`Você é o Sales Intelligence Agent da SmartOps IA.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma
Serviços: Quick Win (R$ 5.500), Diagnóstico+Plano (R$ 11.500), Projeto Completo (R$ 32.000), Parceria Mensal (R$ 5.500/mês)
ICP: ${CONFIG.icp.porte} | ${CONFIG.icp.setor} | BH | dor: ${CONFIG.icp.dor_principal}

Crie o script completo para: ${scripts[stage] || stage}
${context ? `Contexto específico: ${context}` : ''}

Inclua:
1. OBJETIVO DO SCRIPT
2. SCRIPT COMPLETO (palavra por palavra — natural, não robótico)
3. VARIAÇÕES (2-3 formas diferentes de dizer)
4. SE A PESSOA RESPONDER X → diga Y (mapeamento de respostas)
5. RED FLAGS (quando parar de insistir)
6. PRÓXIMO PASSO se funcionar`);

        console.log(result);
        saveOutput(path.join(dir, 'reports'), `script_${stage}_${date}.md`, result);
        break;
      }

      case 'pipeline': {
        const pipelineData = {
          leads_mes:       parseNum('leads', 8),
          taxa_reuniao:    parseNum('taxa-reuniao', CONFIG.targets.taxa_reuniao_lead),
          taxa_proposta:   parseNum('taxa-proposta', CONFIG.targets.taxa_proposta_reuniao),
          taxa_fechamento: parseNum('taxa-fecha', CONFIG.targets.taxa_fechamento),
          ticket_medio:    parseNum('ticket', CONFIG.targets.ticket_medio),
        };
        const velocity = calcSalesVelocity(pipelineData);

        console.log('PIPELINE ANALYSIS\n');
        console.log(`Leads/mês: ${velocity.leads_mes} → Reuniões: ${velocity.reunioes} → Propostas: ${velocity.propostas} → Clientes: ${velocity.clientes}`);
        console.log(`Receita esperada/mês: R$ ${velocity.receita_mes.toLocaleString('pt-BR')}`);
        console.log(`Meta: ${velocity.meta_clientes} clientes | Gap: ${velocity.gap_clientes} clientes`);
        console.log(`Leads necessários para bater meta: ${velocity.leads_necessarios_meta}/mês\n`);

        const report = await runClaude(`Você é o Sales Intelligence Agent da SmartOps IA.

Pipeline SmartOps IA:
Leads/mês: ${velocity.leads_mes}
Reuniões/mês: ${velocity.reunioes} (taxa: ${Math.round(pipelineData.taxa_reuniao * 100)}%)
Propostas/mês: ${velocity.propostas} (taxa: ${Math.round(pipelineData.taxa_proposta * 100)}%)
Clientes/mês: ${velocity.clientes} (taxa fechamento: ${Math.round(pipelineData.taxa_fechamento * 100)}%)
Receita esperada: R$ ${velocity.receita_mes.toLocaleString('pt-BR')}
Meta: ${velocity.meta_clientes} clientes / R$ ${CONFIG.targets.ticket_medio * CONFIG.targets.clientes_mes} mês

Gere:

# PIPELINE REPORT

## DIAGNÓSTICO
[O que está bem e o que precisa melhorar no funil]

## MAIOR GARGALO
[Qual etapa tem a menor taxa de conversão e o que fazer]

## TOP 3 AÇÕES PARA AUMENTAR RECEITA ESTE MÊS
[Com estimativa de impacto em R$]

## META vs REALIDADE
[Gap atual e o que precisa acontecer para fechar a meta]

## PRÓXIMA SEMANA
[3 ações de prospecção para esta semana]`);

        console.log(report);
        saveOutput(path.join(dir, 'reports'), `pipeline_${date}.md`, report);
        saveOutput(path.join(dir, 'reports'), 'velocity.json', velocity);
        break;
      }

      case 'followup': {
        const stage = getArg('stage', 'proposta_enviada');
        const days  = parseNum('days', 3);
        const nome  = getArg('nome', 'cliente');
        console.log(`📱 Gerando follow-up para ${stage} (${days} dias sem resposta)...\n`);

        const result = await runClaude(`Você é o Sales Intelligence Agent da SmartOps IA.

Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz

Situação: ${nome} está em estágio "${stage}" há ${days} dias sem resposta.

Crie um follow-up profissional:

1. DIAGNÓSTICO: por que pode estar sem responder (lista de possíveis razões)
2. MENSAGEM DE FOLLOW-UP (texto pronto para WhatsApp — curto, direto, sem pressão)
3. VARIANTE EMAIL (se preferir)
4. SE NÃO RESPONDER MAIS ${days + 3} DIAS: próximo follow-up
5. QUANDO PARAR: após quantas tentativas e como encerrar bem
6. GATILHO ALTERNATIVO: o que mais pode mover essa pessoa para responder`);

        console.log(result);
        saveOutput(path.join(dir, 'reports'), `followup_${stage}_${Date.now()}.md`, result);
        break;
      }

      case 'proposal-brief': {
        const leadInfo = {
          nome:       getArg('nome', 'Prospect'),
          empresa:    getArg('empresa', ''),
          setor:      getArg('setor', ''),
          problema:   getArg('problema', ''),
          impacto:    getArg('impacto', ''),
          servico:    getArg('service', 'diagnostico-plano'),
        };
        const service = CONFIG.services[leadInfo.servico] || CONFIG.services['diagnostico-plano'];

        console.log(`📄 Gerando brief de proposta para ${leadInfo.nome}...\n`);
        const result = await runClaude(`Você é o Sales Intelligence Agent da SmartOps IA.

Gere o brief completo para a proposta comercial:

Cliente: ${leadInfo.nome} | Empresa: ${leadInfo.empresa} | Setor: ${leadInfo.setor}
Problema principal: ${leadInfo.problema}
Impacto financeiro estimado: ${leadInfo.impacto || 'não informado'}
Serviço: ${leadInfo.servico} — R$ ${service.ticket} | Prazo: ${service.sla_semanas || 'mensal'} semanas

Breno Luiz — Black Belt Lean Six Sigma + automação IA

Crie o brief de proposta:

# PROPOSAL BRIEF — ${leadInfo.nome}

## RESUMO DO PROBLEMA
[2-3 linhas sobre o que o cliente precisa resolver]

## SOLUÇÃO PROPOSTA
[O que a SmartOps vai entregar]

## METODOLOGIA
[Como vai ser feito — passo a passo resumido]

## RESULTADO ESPERADO
[O que o cliente vai ter ao final + ROI estimado]

## INVESTIMENTO
Valor: R$ ${service.ticket}
Forma: [sugestão de pagamento]
Prazo: ${service.sla_semanas || 'recorrente'} semanas

## DIFERENCIAIS (por que SmartOps vs outros)
[3 razões específicas para esse cliente]

## PRÓXIMO PASSO
[O que acontece após o cliente dizer sim]`);

        console.log(result);
        saveOutput(path.join(dir, 'reports'), `proposal_brief_${leadInfo.nome.replace(/\s/g, '_')}_${Date.now()}.md`, result);
        break;
      }

      case 'report': {
        const pipeline = calcSalesVelocity({ leads_mes: parseNum('leads', 8) });
        const result = await runClaude(`Você é o Sales Intelligence Agent da SmartOps IA.

Gere um Sales Intelligence Report completo para SmartOps:

Dados: ${JSON.stringify(pipeline)}
Metas: ${JSON.stringify(CONFIG.targets)}
ICP: ${JSON.stringify(CONFIG.icp)}
Serviços: ${JSON.stringify(CONFIG.services)}

Inclua:
1. STATUS DO PIPELINE
2. ONDE ESTÃO OS GARGALOS
3. TOP 5 FONTES DE LEADS A EXPLORAR
4. MELHORES ABORDAGENS PARA O ICP SMARTOPS
5. SCRIPT MESTRE DE PROSPECÇÃO
6. PLANO DE 30 DIAS PARA FECHAR PRIMEIROS 3 CLIENTES`);

        console.log(result);
        saveOutput(path.join(dir, 'reports'), `sales_report_${date}.md`, result);
        break;
      }

      default:
        console.log(`Modo desconhecido: ${mode}\nDisponíveis: qualify | objections | script | pipeline | followup | proposal-brief | report`);
    }

    console.log(`\n✅ Output: ${dir}`);
  } catch (err) { console.error(`❌ ${err.message}`); process.exit(1); }
}

main();
