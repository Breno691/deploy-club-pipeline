#!/usr/bin/env node
/**
 * Lean Agent — SmartOps IA
 * 8 Desperdícios, VSM, Melhoria Contínua para PMEs
 * "Fazer mais com menos. Sem desperdício."
 *
 * Usage:
 *   node lean_agent.js --mode waste --process "operador busca ferramenta 10x por turno"
 *   node lean_agent.js --mode vsm --process "atendimento de pedido do cliente"
 *   node lean_agent.js --mode diagnose --process "produção de relatório semanal"
 *   node lean_agent.js --mode oee --availability 78 --performance 85 --quality 96
 *   node lean_agent.js --mode lead-time
 *   node lean_agent.js --mode kaizen --hours-saved 20 --defect-reduction 30
 *   node lean_agent.js --mode 5s --area "escritório"
 *   node lean_agent.js --mode report
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { analyzeWastesWithClaude, analyzeWastesLocally } = require('./src/agents/WasteAnalysisAgent');
const { createVSMWithClaude }                           = require('./src/agents/VSMAgent');
const { calcOEE, calcLeadTime, calcKaizenROI, calcWasteScore } = require('./src/calculations/leanCalculators');
const { CONFIG } = require('./src/config');

const client = new Anthropic();

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function parseNum(name, fallback = 0) { return parseFloat(getArg(name, String(fallback))); }

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `lean_${date}`);
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
  const mode    = getArg('mode', 'waste');
  const process = getArg('process', 'processo de atendimento ao cliente');
  const sector  = getArg('sector', 'servicos');

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  LEAN AGENT — SmartOps IA                       ║');
  console.log('║  "Fazer mais com menos. Sem desperdício."        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nModo: ${mode}${process !== 'processo de atendimento ao cliente' ? ` | Processo: ${process}` : ''}\n`);

  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY não configurada'); process.exit(1); }

  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'waste': {
        console.log('🔍 Identificando desperdícios...\n');
        const local = analyzeWastesLocally({ description: process });
        if (local.signals.found.length > 0) {
          console.log(`Sinais detectados: ${local.signals.found.map(s => s.pt).join(', ')}\n`);
        }
        const { analysis } = await analyzeWastesWithClaude(process, sector);
        console.log(analysis);
        saveOutput(path.join(dir, 'reports'), `waste_analysis_${Date.now()}.md`, analysis);
        break;
      }

      case 'vsm': {
        console.log('🗺️  Criando Value Stream Map...\n');
        const vsm = await createVSMWithClaude(process, sector);
        console.log(vsm);
        saveOutput(path.join(dir, 'reports'), `vsm_${Date.now()}.md`, vsm);
        break;
      }

      case 'diagnose': {
        console.log('🏥 Diagnóstico Lean completo...\n');
        const result = await runClaude(`Você é o Lean Agent da SmartOps IA — Black Belt Lean Six Sigma.

Faça um diagnóstico Lean completo do processo: "${process}"
Setor: ${sector}

Inclua:
1. SITUAÇÃO ATUAL — como o processo funciona hoje
2. DESPERDÍCIOS ENCONTRADOS (dos 8: DOWNTIME) — por ordem de impacto
3. MÉTRICAS ATUAIS ESTIMADAS — Lead Time, Eficiência, Custo do Desperdício
4. QUICK WINS — 3 melhorias implementáveis esta semana
5. KAIZEN RECOMENDADO — 1 evento kaizen para próximo mês
6. ROI ESPERADO — economia mensal se implementar recomendações
7. FERRAMENTAS LEAN A USAR — quais e como

Formato padrão SmartOps:
DIAGNÓSTICO: / PROBLEMA IDENTIFICADO: / EVIDÊNCIA: / IMPACTO: R$ X/mês /
RECOMENDAÇÃO: / AÇÃO SUGERIDA: / PRIORIDADE: / ESFORÇO: / ROI ESPERADO: /
PRAZO: / MÉTRICA DE SUCESSO: / PRÓXIMO PASSO:`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `lean_diagnose_${Date.now()}.md`, result);
        break;
      }

      case 'oee': {
        const availability = parseNum('availability', 80);
        const performance  = parseNum('performance', 85);
        const quality      = parseNum('quality', 95);
        const oee = calcOEE(availability, performance, quality);
        console.log(`OEE ANALYSIS\n`);
        console.log(`OEE: ${oee.oee}% (${oee.classification})`);
        console.log(`Disponibilidade: ${oee.availability}% | Performance: ${oee.performance}% | Qualidade: ${oee.quality}%`);
        console.log(`Gap para World Class (85%): ${oee.gap_to_world_class}%`);
        console.log(`Maior perda: ${oee.biggest_loss}\n`);

        const advice = await runClaude(`Você é o Lean Agent da SmartOps IA.

OEE calculado: ${oee.oee}% (${oee.classification})
Disponibilidade: ${oee.availability}% | Performance: ${oee.performance}% | Qualidade: ${oee.quality}%
Maior perda: ${oee.biggest_loss}
Gap para World Class: ${oee.gap_to_world_class}%

Explique:
1. O que o OEE de ${oee.oee}% significa em termos práticos
2. Qual a causa raiz mais provável da maior perda (${oee.biggest_loss})
3. Top 3 ações para aumentar o OEE em 5-10 pontos nos próximos 30 dias
4. ROI estimado de cada ponto percentual de melhoria do OEE`);
        console.log(advice);
        saveOutput(path.join(dir, 'reports'), `oee_analysis_${date}.md`, advice);
        saveOutput(path.join(dir, 'reports'), 'oee_data.json', oee);
        break;
      }

      case 'kaizen': {
        const hours_saved    = parseNum('hours-saved', 10);
        const defect_red     = parseNum('defect-reduction', 0);
        const defect_cost    = parseNum('defect-cost', 500);
        const impl_hours     = parseNum('impl-hours', 8);
        const roi = calcKaizenROI({
          horas_economizadas_mes: hours_saved,
          custo_hora_brl:         parseNum('cost-per-hour', 60),
          reducao_defeitos_pct:    defect_red,
          custo_defeito_brl:       defect_cost,
          implementacao_horas:     impl_hours,
        });
        console.log('KAIZEN ROI ANALYSIS\n');
        console.log(`Economia mensal: R$ ${roi.monthly_savings.toLocaleString('pt-BR')}`);
        console.log(`Economia anual:  R$ ${roi.annual_savings.toLocaleString('pt-BR')}`);
        console.log(`Custo de impl.:  R$ ${roi.implementation_cost.toLocaleString('pt-BR')}`);
        console.log(`Payback: ${roi.payback_months} meses | ROI 12m: ${roi.roi_12m_pct}%`);
        console.log(`Veredicto: ${roi.verdict}\n`);
        saveOutput(path.join(dir, 'reports'), 'kaizen_roi.json', roi);
        break;
      }

      case '5s': {
        const area = getArg('area', 'área de trabalho geral');
        const result = await runClaude(`Você é o Lean Agent da SmartOps IA — especialista em 5S.

Crie um plano de implementação 5S completo para: "${area}"
Setor: ${sector}

Inclua:
1. DIAGNÓSTICO ATUAL — problemas de organização estimados
2. PLANO 5S DETALHADO:
   S1 - SEIRI (Classificação): o que eliminar
   S2 - SEITON (Organização): como organizar o que fica
   S3 - SEISOU (Limpeza): padrão de limpeza
   S4 - SEIKETSU (Padronização): como manter o padrão
   S5 - SHITSUKE (Disciplina): como sustentar o 5S
3. CRONOGRAMA (1 S por semana)
4. CHECKLIST de auditoria semanal
5. ANTES × DEPOIS esperado
6. ROI: horas economizadas por mês com ambiente organizado`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `5s_plan_${Date.now()}.md`, result);
        break;
      }

      case 'lead-time': {
        // Exemplo de steps para demonstrar
        const steps = [
          { name: 'Receber pedido',    duration_min: 5,   adds_value: true  },
          { name: 'Aguardar aprovação',duration_min: 480, adds_value: false },
          { name: 'Processar pedido',  duration_min: 30,  adds_value: true  },
          { name: 'Transportar',       duration_min: 60,  adds_value: false },
          { name: 'Entregar',          duration_min: 10,  adds_value: true  },
        ];
        const lt = calcLeadTime(steps);
        console.log('LEAD TIME ANALYSIS\n');
        console.log(`Lead Time Total: ${lt.total_min} min`);
        console.log(`Valor Agregado: ${lt.value_added_min} min (${lt.efficiency_pct}%)`);
        console.log(`Desperdício: ${lt.non_value_min} min (${lt.waste_pct}%)`);
        console.log(`Gargalo: ${lt.bottleneck}`);
        console.log(`\n${lt.improvement_potential}\n`);
        saveOutput(path.join(dir, 'reports'), 'lead_time.json', lt);
        break;
      }

      case 'report': {
        const result = await runClaude(`Você é o Lean Agent da SmartOps IA.

Gere um Relatório Lean completo para o contexto SmartOps IA:
Empresa: SmartOps IA — consultoria Lean + Automação IA, BH
Consultor: Breno Luiz — Black Belt Lean Six Sigma

O relatório deve ser um GUIA DE VENDAS para convencer PMEs a contratar a SmartOps:

# LEAN ASSESSMENT GUIDE — SmartOps IA

## O QUE O LEAN ENTREGA EM NÚMEROS
[Benchmarks reais de projetos Lean em PMEs: % redução lead time, custo, retrabalho]

## OS 8 DESPERDÍCIOS MAIS COMUNS EM PMEs DE BH
[Para cada um: custo típico + como identificar + quick win]

## DIAGNÓSTICO EM 30 MINUTOS
[Roteiro de perguntas para identificar os principais desperdícios do cliente]

## PROPOSTA LEAN PADRÃO SmartOps
[Como estruturar uma proposta de projeto Lean com ROI calculado]

## CASES DE ROI (genéricos mas realistas)
[3 cases com antes/depois e números]

## PRÓXIMA AÇÃO PARA O CLIENTE
[Como fechar o diagnóstico gratuito]`);
        console.log(result);
        saveOutput(path.join(dir, 'reports'), `lean_guide_${date}.md`, result);
        break;
      }

      default:
        console.log(`Modo desconhecido: ${mode}\nDisponíveis: waste | vsm | diagnose | oee | kaizen | 5s | lead-time | report`);
    }

    console.log(`\n✅ Output: ${dir}`);
  } catch (err) { console.error(`❌ ${err.message}`); process.exit(1); }
}

main();
