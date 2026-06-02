#!/usr/bin/env node
/**
 * Lean Consulting Agent — SmartOps IA
 * Diagnóstico operacional, mapeamento de processos, eliminação de desperdícios e automação
 *
 * Usage:
 *   node lean_consulting_agent.js --mode diagnostico --empresa "Indústria X" --setor industria
 *   node lean_consulting_agent.js --mode mapeamento --processo "recebimento de pedidos"
 *   node lean_consulting_agent.js --mode desperdicios --setor servicos --sintomas "retrabalho,espera,sobrecarga"
 *   node lean_consulting_agent.js --mode vsm --processo "atendimento ao cliente"
 *   node lean_consulting_agent.js --mode kaizen --area "financeiro" --problema "conciliacao manual"
 *   node lean_consulting_agent.js --mode pdca --problema "lead time de 10 dias"
 *   node lean_consulting_agent.js --mode 5s --area "escritorio"
 *   node lean_consulting_agent.js --mode automacao --setor servicos
 *   node lean_consulting_agent.js --mode indicadores --setor industria
 *   node lean_consulting_agent.js --mode plano --empresa "PME X" --prazo 90
 *   node lean_consulting_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function scoreWaste(custo, frequencia, impactoCliente, facilidade, rapidoResultado) {
  const w = CONFIG.waste_priority_weights;
  return Math.round(
    (custo          * w.custo_mes_brl.weight / 100) +
    (frequencia     * w.frequencia.weight / 100) +
    (impactoCliente * w.impacto_cliente.weight / 100) +
    (facilidade     * w.facilidade_fix.weight / 100) +
    (rapidoResultado* w.rapido_resultado.weight / 100)
  );
}

function calcOEE(disponibilidade, performance, qualidade) {
  const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100;
  const bench = CONFIG.sectors.industria.oee_min;
  return { oee: +oee.toFixed(1), benchmark: bench, gap: +(oee - bench).toFixed(1), label: oee >= bench ? 'Adequado' : oee >= bench * 0.8 ? 'Atenção' : 'Crítico' };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `lean_${date}`);
  ['reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  LEAN CONSULTING AGENT — SmartOps IA            ║');
  console.log('║  "Identificar o desperdício, a causa raiz       ║');
  console.log('║   e a ação concreta. Sempre."                  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  const BASE = `Você é o Lean Consulting Agent da SmartOps IA — consultor Lean sênior, especialista em processos e automação.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Princípio: NUNCA responder genérico. Sempre identificar o desperdício específico, a causa raiz real e a ação concreta.
Ferramentas: ${Object.values(CONFIG.lean_tools).flat().slice(0,10).join(', ')}.`;

  try {
    switch (mode) {

      case 'diagnostico': {
        const empresa = getArg('empresa', 'empresa cliente');
        const setor   = getArg('setor', 'servicos');
        const bench   = CONFIG.sectors[setor] || CONFIG.sectors.servicos;
        const result  = await ask(`${BASE}

EMPRESA: ${empresa} | SETOR: ${setor}
BENCHMARKS DO SETOR: ${JSON.stringify(bench)}
FASES: ${CONFIG.diagnostic_phases.map(f => `${f.nome}(${f.tempo})`).join(' → ')}

# Diagnóstico Lean Completo — ${empresa}

## Roteiro de Entrevista (reunião diagnóstica)
[20 perguntas por categoria: Fluxo | Pessoas | Tecnologia | Qualidade | Cliente]

## Gemba Walk — O Que Observar
[Checklist de observação in loco ou remota: o que ver, o que cronometrar, o que registrar]

## Os 8 Desperdícios: Mapa de Diagnóstico
${Object.entries(CONFIG.eight_wastes).map(([k,v]) => `### ${k} — ${v.nome}\nSinal de presença: [Como identificar neste setor]\nImpacto típico: [custo/hora/qualidade]\nPergunta diagnóstica: [Pergunta específica para este setor]`).join('\n\n')}

## Score de Maturidade Operacional (1-5)
| Dimensão | Critério | Score | Evidência |
|----------|---------|-------|-----------|
[Para cada nível do config.maturity_levels]

## Diagnóstico Financeiro do Desperdício
[Estimar: quanto o desperdício principal custa por mês em R$]

## Top 3 Quick Wins
[Melhorias implementáveis em < 1 semana com impacto imediato]

## Próximas 3 Semanas
[Plano de ação detalhado após diagnóstico]`);
        console.log(result);
        save(path.join(dir,'reports'), `diagnostico_${empresa.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'mapeamento': {
        const processo = getArg('processo', 'processo principal');
        const result   = await ask(`${BASE}

PROCESSO A MAPEAR: ${processo}

# Mapeamento de Processo — ${processo.toUpperCase()}

## SIPOC
| Fornecedores | Entradas | Processo | Saídas | Clientes |
|-------------|---------|---------|-------|--------|
[Preencher cada coluna com elementos específicos do processo]

## Fluxograma do Estado Atual (AS IS)
[Descrever cada etapa numerada com: responsável, ferramenta, tempo, output, possíveis falhas]

## Mapa de Tempo
| Etapa | Tempo de Ciclo | Tempo de Espera | Desperdício % | Observação |
|-------|---------------|----------------|--------------|------------|

## Lead Time Total
Tempo de valor agregado: [X min/h]
Tempo de espera: [X min/h]
% Valor agregado: [X%]

## Principais Gargalos
[Top 3 pontos de acúmulo, espera ou retrabalho no fluxo]

## Estado Futuro (TO BE)
[Como o processo deveria funcionar após melhorias — fluxo simplificado]

## Ganho Estimado
[Lead time reduzido em X% | Retrabalho eliminado | Tempo economizado/mês]`);
        console.log(result);
        save(path.join(dir,'reports'), `mapeamento_${processo.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'desperdicios': {
        const setor    = getArg('setor', 'servicos');
        const sintomas = getArg('sintomas', 'retrabalho,espera,sobrecarga');
        const listaS   = sintomas.split(',').map(s => s.trim());
        const result   = await ask(`${BASE}

SETOR: ${setor}
SINTOMAS RELATADOS: ${listaS.join(', ')}

# Análise dos 8 Desperdícios — ${setor.toUpperCase()}

## Diagnóstico por Desperdício
${Object.entries(CONFIG.eight_wastes).map(([k,v]) => `### ${v.icon} ${k} — ${v.nome}
Presente neste setor? [Sim/Provável/Baixa Chance]
Como se manifesta: [específico para ${setor}]
Custo estimado: R$ [valor/mês]
Evidência nos sintomas: ${listaS.some(s => s.toLowerCase().includes(k.toLowerCase()) || v.desc.toLowerCase().includes(s.toLowerCase())) ? '⚠️ Provável' : '—'}`).join('\n\n')}

## PARETO DOS DESPERDÍCIOS
[Top 3 que concentram 80% do problema — com custo estimado total]

## PLANO DE ELIMINAÇÃO PRIORIZADO
| Desperdício | Ação | Ferramenta | Responsável | Prazo | Custo | Ganho Esperado |
|-------------|------|-----------|-------------|-------|-------|----------------|

## ROI TOTAL ESTIMADO
[Quanto a empresa economiza/ganha eliminando os top 3 desperdícios em 90 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `desperdicios_${setor}_${date}.md`, result);
        break;
      }

      case 'vsm': {
        const processo = getArg('processo', 'fluxo principal');
        const result   = await ask(`${BASE}

PROCESSO PARA VSM: ${processo}

# Value Stream Mapping (VSM) — ${processo.toUpperCase()}

## Família de Produtos/Serviços
[Qual serviço/produto seguirá pelo fluxo — definição do escopo]

## Estado Atual — Fluxo de Valor
[Descrever passo a passo: Fornecedor → Processos → Cliente]
[Para cada processo: nome, responsável, tempo de ciclo (T/C), tempo de troca, operadores, % defeitos]

## Fluxo de Informação
[Como a informação flui: manual, sistema, email, WhatsApp — identificar atrasos]

## Linha do Tempo (Value vs. Waste)
[Total Lead Time: X dias/horas]
[Value-Added Time: X horas]
[Non-Value-Added: X horas (X%)]

## Problemas Kaizen (raios de melhoria)
[Pontos onde há desperdício visível — cada um com: tipo de desperdício + ação sugerida]

## Estado Futuro — VSM Melhorado
[Como o fluxo deve ficar após as melhorias — princípios: eliminar, combinar, simplificar, automatizar]

## Plano de Implementação do Estado Futuro
[Fases, prazos e responsáveis para sair do AS IS para o TO BE]`);
        console.log(result);
        save(path.join(dir,'reports'), `vsm_${processo.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'kaizen': {
        const area     = getArg('area', 'operações');
        const problema = getArg('problema', 'processo ineficiente');
        const result   = await ask(`${BASE}

ÁREA: ${area}
PROBLEMA: ${problema}

# Evento Kaizen — ${area.toUpperCase()}

## Definição do Problema (A3 Resumido)
Situação atual: [o que está acontecendo]
Situação desejada: [o que queremos]
Gap: [distância entre as duas]

## 5 Porquês
Por quê 1: ${problema} → Por quê?
[Traçar até a causa raiz verdadeira em 5 perguntas]
CAUSA RAIZ: [causa real identificada]

## Brainstorming de Soluções
[10 ideias — da mais simples à mais complexa]

## TOP 3 SOLUÇÕES PRIORIZADAS (impacto × facilidade)
| Solução | Impacto | Facilidade | Custo | Prazo |
|---------|---------|-----------|-------|-------|

## QUICK WINS (implementar hoje/amanhã)
[O que pode ser feito em < 2 horas com impacto imediato]

## PLANO PDCA
| Fase | Ação | Responsável | Prazo | Indicador |
|------|------|------------|-------|-----------|

## MÉTRICAS ANTES × DEPOIS
[Baseline → meta → como medir]

## ROI ESTIMADO
[Economia mensal R$ × custo de implementação = payback em X meses]`);
        console.log(result);
        save(path.join(dir,'reports'), `kaizen_${area}_${date}.md`, result);
        break;
      }

      case 'pdca': {
        const problema = getArg('problema', 'problema identificado');
        const fase     = (getArg('fase', 'P') || 'P').toUpperCase();
        const result   = await ask(`${BASE}

PROBLEMA: ${problema}
FASE DO PDCA: ${fase}

# PDCA Completo — ${problema.toUpperCase()}

## FASE P — PLAN (Planejar)
Problema específico: [definir com dados]
Meta SMART: [Específica, Mensurável, Atingível, Relevante, Temporal]
Análise de causa raiz: [Ishikawa ou 5 Porquês]
Plano de ação: [5W2H simplificado]

## FASE D — DO (Executar)
Ações implementadas: [o que fazer, quem, quando]
Dados a coletar: [o que medir durante a execução]
Comunicação: [como informar a equipe]

## FASE C — CHECK (Verificar)
Métricas de controle: [o que analisar]
Comparação meta × resultado: [tabela]
Desvios identificados: [o que fugiu do planejado]

## FASE A — ACT (Agir)
Se funcionou: [como padronizar — POP, treinamento, checklist]
Se não funcionou: [ajustes e novo ciclo]
Aprendizados: [o que documentar para próximos projetos]

## PRÓXIMO CICLO PDCA
[A próxima oportunidade de melhoria revelada por este ciclo]`);
        console.log(result);
        save(path.join(dir,'reports'), `pdca_${date}.md`, result);
        break;
      }

      case '5s': {
        const area = getArg('area', 'escritório');
        const result = await ask(`${BASE}

ÁREA PARA IMPLEMENTAR 5S: ${area}

# Implementação 5S — ${area.toUpperCase()}

## S1 — SEIRI (Separar / Utilização)
O que jogar fora: [itens sem uso em ${area}]
O que manter: [critério de necessidade]
Rotina de revisão: [quando fazer triagem]

## S2 — SEITON (Organizar / Ordenação)
Como organizar: [regras de lugar para cada coisa]
Sistema visual: [etiquetas, cores, marcações]
Regra dos 30 segundos: [tudo deve ser encontrado em 30s]

## S3 — SEISO (Limpar / Limpeza)
Rotina de limpeza: [quem limpa o quê, quando]
Padrão de limpeza: [checklist diário/semanal]
Identificação de fontes de sujeira: [onde surge e como eliminar]

## S4 — SEIKETSU (Padronizar / Higiene)
POPs de manutenção: [procedimentos para manter os 3 primeiros S]
Gestão visual: [o que sinalizar, onde]
Treinamento: [como treinar a equipe]

## S5 — SHITSUKE (Disciplinar / Autodisciplina)
Sistema de auditoria: [checklist de avaliação semanal]
Score de 5S: [como pontuar e acompanhar]
Melhoria contínua do 5S: [como evoluir]

## CRONOGRAMA DE IMPLEMENTAÇÃO
| Semana | Foco | Atividades | Responsável |
|--------|------|----------|------------|

## INDICADOR DE SUCESSO
[Como medir que o 5S está funcionando — score 0-100]`);
        console.log(result);
        save(path.join(dir,'reports'), `5s_${area}_${date}.md`, result);
        break;
      }

      case 'automacao': {
        const setor = getArg('setor', 'servicos');
        const autos = CONFIG.common_automations;
        const result = await ask(`${BASE}

SETOR: ${setor}

AUTOMAÇÕES DISPONÍVEIS:
${autos.map(a => `- ${a.processo}: ${a.ferramenta} | ROI: ${a.roi_h_mes}h/mês economizadas | Complexidade: ${a.complexidade}`).join('\n')}

# Plano de Automação — ${setor.toUpperCase()}

## Diagnóstico: O Que Está Manual Demais
[Top 5 tarefas repetitivas que consomem mais tempo neste setor]

## PRIORIZAÇÃO (impacto × complexidade)
| Processo | Horas/mês economizadas | Complexidade | Ferramenta | Prioridade |
|----------|----------------------|-------------|-----------|-----------|

## AUTOMAÇÃO #1 — IMPLEMENTAR AGORA
Processo: [nome]
Fluxo atual: [passo a passo manual]
Solução n8n: [como automatizar — gatilho, ações, saída]
Tempo de implementação: [X horas]
ROI: [horas/mês economizadas × taxa hora = R$/mês]

## AUTOMAÇÃO #2 — PRÓXIMA SEMANA
[Mesma estrutura]

## AUTOMAÇÃO #3 — PRÓXIMO MÊS
[Mesma estrutura]

## REGRA DE OURO
Antes de automatizar: o processo está padronizado? Se não, padronizar primeiro.
[Verificar se há POP, RACI e treinamento antes de automatizar]`);
        console.log(result);
        save(path.join(dir,'reports'), `automacao_${setor}_${date}.md`, result);
        break;
      }

      case 'indicadores': {
        const setor = getArg('setor', 'servicos');
        const bench = CONFIG.sectors[setor] || CONFIG.sectors.servicos;
        const result = await ask(`${BASE}

SETOR: ${setor}
BENCHMARKS: ${JSON.stringify(bench)}

# Dashboard de Indicadores Lean — ${setor.toUpperCase()}

## KPIs de FLUXO
| Indicador | Fórmula | Meta | Alerta | Crítico | Como medir |
|-----------|---------|------|--------|---------|-----------|
[Lead Time | Cycle Time | Takt Time | Throughput]

## KPIs de QUALIDADE
| Indicador | Fórmula | Meta | Como medir |
|-----------|---------|------|-----------|
[Taxa de defeitos | Retrabalho % | DPMO | NPS]

## KPIs de PRODUTIVIDADE
[Utilização de capacidade | OEE (se indústria) | Horas/entrega]

## KPIs DE DESPERDÍCIO
[Custo do retrabalho | Tempo de espera | Superprodução detectada]

## DASHBOARD VISUAL (texto)
[Como montar um dashboard simples em Google Sheets ou Notion]

## ROTINA DE REVISÃO
Diária: [O que checar em 5 min]
Semanal: [O que analisar em 30 min]
Mensal: [O que decidir com base nos dados]`);
        console.log(result);
        save(path.join(dir,'reports'), `indicadores_lean_${setor}_${date}.md`, result);
        break;
      }

      case 'plano': {
        const empresa = getArg('empresa', 'empresa cliente');
        const prazo   = parseInt(getArg('prazo', '90'));
        const result  = await ask(`${BASE}

EMPRESA: ${empresa}
PRAZO: ${prazo} dias

# Plano de Melhoria Lean — ${empresa} (${prazo} dias)

## FASE 1 — Diagnóstico e Mapeamento (dias 1-15)
[Atividades, responsáveis, entregáveis]

## FASE 2 — Quick Wins e Padronização (dias 16-45)
[Top 5 melhorias rápidas + POPs + treinamentos]

## FASE 3 — Kaizens e Melhorias Estruturais (dias 46-75)
[Eventos kaizen, redesenho de processos, automações]

## FASE 4 — Indicadores, Controle e Sustentação (dias 76-${prazo})
[Dashboard, auditorias, rotina de gestão, transferência de conhecimento]

## MARCOS CRÍTICOS (gates de qualidade)
| Marco | Prazo | Critério de Aprovação |
|-------|-------|---------------------|

## RESULTADO ESPERADO AO FINAL
[Métricas antes → meta → impacto financeiro estimado em R$]

## PLANO DE RISCO
[Top 3 riscos do projeto + plano de mitigação]

## INVESTIMENTO VS. RETORNO
[Custo do projeto × ganho em 12 meses = ROI estimado]`);
        console.log(result);
        save(path.join(dir,'reports'), `plano_${empresa.replace(/\s/g,'_')}_${prazo}d_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Data: ${date}

# Lean Consulting Intelligence Report — ${date}

## MERCADO DE LEAN EM BH/MG
[Oportunidades para consultoria Lean + Automação em PMEs locais esta semana]

## DESPERDÍCIO MAIS COMUM HOJE
[O tipo de desperdício mais prevalente nas PMEs do setor de serviços em BH agora]

## CASO DE USO DO DIA
[Um exemplo hipotético de aplicação Lean que geraria alto ROI para uma PME em BH]

## FERRAMENTA LEAN DA SEMANA
[Uma ferramenta pouco explorada que tem alto impacto para serviços/consultoria]

## TENDÊNCIA DE AUTOMAÇÃO
[Processo que mais PMEs estão automatizando agora + ferramenta recomendada]

## PROPOSTA LEAN DO DIA
[Pitch de 30 segundos para vender Lean + Automação para um dono de PME em BH]

## DECISÃO PARA O CEO
[Uma oportunidade de projeto Lean que Breno deveria prospectar esta semana]`);
        console.log(result);
        save(path.join(dir,'reports'), `lean_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: diagnostico | mapeamento | desperdicios | vsm | kaizen | pdca | 5s | automacao | indicadores | plano | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
