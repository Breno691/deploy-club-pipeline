#!/usr/bin/env node
/**
 * Process Mining Agent — SmartOps IA
 * Descoberta e análise de processos por dados, logs e comportamento
 *
 * Usage:
 *   node process_mining_agent.js --mode discover --processo vendas
 *   node process_mining_agent.js --mode map --processo onboarding
 *   node process_mining_agent.js --mode bottleneck --processo atendimento
 *   node process_mining_agent.js --mode conformance --processo financeiro
 *   node process_mining_agent.js --mode sla --processo entrega
 *   node process_mining_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function detectBottlenecks(waiting_time_h, utilization_pct, rework_pct) {
  const alerts = [];
  CONFIG.bottleneck_indicators.forEach(b => {
    if (b.threshold_h && waiting_time_h > b.threshold_h) alerts.push({ tipo: b.nome, valor: `${waiting_time_h}h > ${b.threshold_h}h`, impacto: b.impacto });
    if (b.threshold_pct && utilization_pct > b.threshold_pct) alerts.push({ tipo: b.nome, valor: `${utilization_pct}% > ${b.threshold_pct}%`, impacto: b.impacto });
    if (b.nome.includes('Rework') && rework_pct > b.threshold_pct) alerts.push({ tipo: b.nome, valor: `${rework_pct}% > ${b.threshold_pct}%`, impacto: b.impacto });
  });
  return alerts;
}

function calcProcessHealth(lead_time_atual, lead_time_ideal, rework_pct, conformance_pct) {
  const lt_score = Math.max(0, 100 - ((lead_time_atual - lead_time_ideal) / lead_time_ideal) * 50);
  const rw_score = Math.max(0, 100 - rework_pct * 5);
  const cf_score = conformance_pct;
  return Math.round((lt_score * 0.4 + rw_score * 0.3 + cf_score * 0.3));
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, 'outputs', `process_mining_${date}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return { dir, date };
}
function save(dir, fn, c) { const p = path.join(dir, fn); fs.writeFileSync(p, typeof c === 'string' ? c : JSON.stringify(c, null, 2), 'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r = await client.messages.create({ model: CONFIG.claude.model, max_tokens: CONFIG.claude.maxTokens, messages: [{ role: 'user', content: prompt }] }); return r.content[0].text; }

const BASE = `Você é o Process Mining Agent da SmartOps IA — especialista em descoberta de processos por dados.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Foco: PMEs em BH com 5-200 funcionários.

TIPOS DE PROCESSO:
${Object.entries(CONFIG.process_types).map(([k, v]) => `- ${k}: ${v.etapas.join('→')} | SLA ${v.sla_dias || v.sla_h+'h'}`).join('\n')}

INDICADORES DE GARGALO:
${CONFIG.bottleneck_indicators.map(b => `- ${b.nome}: ${b.impacto}`).join('\n')}

CONFORMANCE METAS:
${Object.entries(CONFIG.conformance_types).map(([k, v]) => `- ${k}: min ${v.meta_min_pct}%`).join('\n')}

REGRAS:
- Processo real ≠ processo documentado — sempre questionar o as-is
- Foco em dados: sem dado, sem conclusão (só hipótese)
- Priorizar gargalos que impactam o cliente final
- Conformance < 80% = processo precisa ser redesenhado`;

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  PROCESS MINING AGENT — SmartOps IA             ║');
  console.log('║  "O processo real raramente é o documentado."   ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  try {
    switch (mode) {

      case 'discover': {
        const processo = getArg('processo', 'vendas');
        const procInfo = CONFIG.process_types[processo] || CONFIG.process_types.vendas;
        const result   = await ask(`${BASE}

PROCESSO: ${processo}
ETAPAS ESPERADAS: ${procInfo.etapas.join(' → ')}
SLA: ${procInfo.sla_dias || procInfo.sla_h+'h'}

# Descoberta do Processo: ${processo.toUpperCase()}

## Metodologia de Coleta de Dados
[Como extrair o event log deste processo — fontes de dados, ferramentas]

## Event Log Necessário
Campos obrigatórios: ${CONFIG.event_log_fields.obrigatorios.join(', ')}
Campos opcionais: ${CONFIG.event_log_fields.opcionais.join(', ')}
[Como coletar cada campo deste processo específico]

## Processo As-Is Provável (baseado em padrões de PME)
[Diagrama textual do que provavelmente acontece na prática]

## Variantes Esperadas
[As 3-5 variações mais comuns de como este processo é executado]

## Perguntas para o Gemba Walk
[15 perguntas para entrevistar quem executa o processo]

## O que Observar
[O que cronometrar, o que contar, o que fotografar]

## Armadilhas Comuns
[O que as pessoas geralmente escondem ou não percebem ao descrever o processo]`);
        console.log(result);
        save(dir, `discover_${processo}_${date}.md`, result);
        break;
      }

      case 'map': {
        const processo = getArg('processo', 'onboarding');
        const procInfo = CONFIG.process_types[processo] || CONFIG.process_types.onboarding;
        const result   = await ask(`${BASE}

PROCESSO: ${processo}
ETAPAS: ${procInfo.etapas.join(' → ')}

# Mapeamento do Processo: ${processo.toUpperCase()}

## SIPOC
| Fornecedores | Entradas | Processo | Saídas | Clientes |
|-------------|---------|---------|-------|--------|
[Para o processo ${processo}]

## Fluxo Detalhado (As-Is)
\`\`\`
[Diagrama textual com: atividade | responsável | tempo | sistema | decisão]
${procInfo.etapas.map(e => `${e} → `).join('')}[Fim]
\`\`\`

## Mapa de Tempos
| Etapa | Tempo Touch | Tempo Waiting | Lead Time | % Valor Agregado |
|-------|------------|--------------|-----------|-----------------|
${procInfo.etapas.map(e => `| ${e} | | | | |`).join('\n')}

## Análise de Valor
[O que agrega valor ao cliente vs. o que é desperdício]

## Oportunidades de Melhoria Identificadas
[Top 5 melhorias com impacto estimado]

## Processo To-Be (proposto)
[Como o processo deveria ser após melhorias]`);
        console.log(result);
        save(dir, `map_${processo}_${date}.md`, result);
        break;
      }

      case 'bottleneck': {
        const processo = getArg('processo', 'atendimento');
        const wait_h   = parseFloat(getArg('waiting-time', '6'));
        const util_pct = parseFloat(getArg('utilization', '85'));
        const rework   = parseFloat(getArg('rework', '12'));
        const alerts   = detectBottlenecks(wait_h, util_pct, rework);
        console.log('\n📊 Gargalos detectados (localmente):');
        alerts.forEach(a => console.log(`  ⚠️  ${a.tipo}: ${a.valor} → ${a.impacto}`));
        if (alerts.length === 0) console.log('  ✅ Nenhum gargalo detectado nos thresholds.');
        const result = await ask(`${BASE}

PROCESSO: ${processo}
DADOS: Waiting time ${wait_h}h | Utilização ${util_pct}% | Retrabalho ${rework}%
GARGALOS DETECTADOS: ${alerts.length > 0 ? alerts.map(a => a.tipo).join(', ') : 'Nenhum nos thresholds padrão'}

# Análise de Gargalos: ${processo.toUpperCase()}

## Diagnóstico dos Gargalos
${alerts.map(a => `### ${a.tipo}
Valor atual: ${a.valor}
Impacto: ${a.impacto}
Causa raiz provável: [análise]
Solução imediata: [ação]
Solução estrutural: [ação de médio prazo]`).join('\n\n')}

## Análise de Causa Raiz (5 Porquês)
[Aplicar ao gargalo principal]

## Impacto Financeiro Estimado
[Custo mensal do(s) gargalo(s)]

## Plano de Desgargalamento
| Ação | Responsável | Prazo | Impacto |
|------|------------|-------|--------|

## Quick Win (< 7 dias)
[Melhoria imediata que reduz o gargalo sem investimento]`);
        console.log(result);
        save(dir, `bottleneck_${processo}_${date}.md`, result);
        break;
      }

      case 'conformance': {
        const processo     = getArg('processo', 'financeiro');
        const conformance  = parseFloat(getArg('conformance', '72'));
        const procInfo     = CONFIG.process_types[processo] || CONFIG.process_types.financeiro;
        const result       = await ask(`${BASE}

PROCESSO: ${processo}
TAXA DE CONFORMIDADE: ${conformance}%
META: ${CONFIG.conformance_types.fitness.meta_min_pct}%
STATUS: ${conformance >= CONFIG.conformance_types.fitness.meta_min_pct ? '✅ OK' : '🔴 ABAIXO DA META'}

# Análise de Conformidade: ${processo.toUpperCase()}

## O que Significa ${conformance}% de Conformidade
[Tradução prática: X% dos casos seguem o processo padrão]

## Desvios Mais Comuns
[Baseado no processo ${processo} — quais etapas são mais frequentemente desviadas]
${procInfo.etapas.map(e => `- ${e}: [tipo de desvio mais comum]`).join('\n')}

## Causas dos Desvios
[Por que as pessoas desviam do processo documentado]

## Impacto dos Desvios
[Qualidade, custo, tempo, satisfação do cliente]

## Plano para Atingir ${CONFIG.conformance_types.fitness.meta_min_pct}%
1. [Ação de curto prazo]
2. [Padronização]
3. [Treinamento]
4. [Controle automático]

## Redesenho vs. Treinamento
[O processo precisa ser mudado ou as pessoas precisam ser treinadas?]`);
        console.log(result);
        save(dir, `conformance_${processo}_${date}.md`, result);
        break;
      }

      case 'variant': {
        const processo = getArg('processo', 'vendas');
        const result   = await ask(`${BASE}

PROCESSO: ${processo}

# Análise de Variantes: ${processo.toUpperCase()}

## Variante Dominante (Happy Path)
[A sequência mais comum — o "jeito certo"]
[Frequência estimada: X% dos casos]

## Variantes Secundárias

### Variante 2 — [Nome]
[Sequência diferente — quando ocorre, por quê, impacto]
[Frequência estimada: X%]

### Variante 3 — [Nome]
[Outra sequência — loops, retornos, puladas de etapa]
[Frequência estimada: X%]

### Variante 4 — [Nome de problema]
[Variante problemática — o que causa e como eliminar]
[Frequência estimada: X%]

## O que Fazer com Cada Variante
[Padronizar / Aceitar / Eliminar / Investigar]

## Variante para Padronizar Primeiro
[A que tem maior impacto na qualidade/eficiência]`);
        console.log(result);
        save(dir, `variant_${processo}_${date}.md`, result);
        break;
      }

      case 'sla': {
        const processo = getArg('processo', 'entrega');
        const procInfo = CONFIG.process_types[processo] || CONFIG.process_types.entrega;
        const result   = await ask(`${BASE}

PROCESSO: ${processo}
SLA DEFINIDO: ${procInfo.sla_dias || procInfo.sla_h+'h'}
ETAPAS: ${procInfo.etapas.join(' → ')}

# Análise de SLA: ${processo.toUpperCase()}

## Distribuição de Lead Time (estimativa)
| Percentil | Lead Time | Status |
|-----------|-----------|--------|
| P50 (mediana) | | |
| P80 | | |
| P95 | | |
| P99 | | |

## Casos Fora do SLA
[Quais etapas mais contribuem para violação de SLA]

## Causa das Violações de SLA
[Fila, falta de recurso, processo mal definido, dependência externa]

## Como Monitorar o SLA em Tempo Real
[Sistema simples de controle — planilha + alerta]

## Plano para 95% de Compliance com SLA
[Ações específicas por etapa]`);
        console.log(result);
        save(dir, `sla_${processo}_${date}.md`, result);
        break;
      }

      case 'handover': {
        const processo = getArg('processo', 'vendas');
        const result   = await ask(`${BASE}

PROCESSO: ${processo}

# Análise de Handover: ${processo.toUpperCase()}

## Mapa de Handovers
[Todos os pontos onde o processo muda de mão — quem passa para quem]

## Riscos em Cada Handover
[O que se perde, se atrasa ou se distorce em cada transferência]

## Handover Mais Crítico
[Onde mais problemas acontecem — por quê]

## Protocolo de Handover Padrão
[O que deve ser passado, como, com que ferramenta, com qual SLA]

## Template de Handover
[Documento/checklist para cada passagem de mão]

## Automação Possível
[Qual handover pode ser automatizado com n8n]`);
        console.log(result);
        save(dir, `handover_${processo}_${date}.md`, result);
        break;
      }

      case 'root-cause': {
        const problema = getArg('problema', 'alto índice de retrabalho');
        const result   = await ask(`${BASE}

PROBLEMA: ${problema}

# Análise de Causa Raiz

## 5 Porquês

**Por que ${problema}?**
1. Porque [causa 1]
   2. Porque [causa da causa 1]
      3. Porque [causa mais profunda]
         4. Porque [causa sistêmica]
            5. Porque [causa raiz real]

**Causa Raiz Identificada:** [causa raiz]

## Ishikawa (6M)
| M | Causa Identificada | Contribuição % |
|---|-------------------|---------------|
| Máquina | | |
| Método | | |
| Material | | |
| Mão de obra | | |
| Medição | | |
| Meio ambiente | | |

## Solução Para a Causa Raiz
[Ação que resolve o problema na raiz — não no sintoma]

## Validação
[Como confirmar que a causa raiz foi identificada corretamente]`);
        console.log(result);
        save(dir, `root_cause_${date}.md`, result);
        break;
      }

      case 'simulate': {
        const processo = getArg('processo', 'vendas');
        const melhoria = getArg('melhoria', 'automatizar follow-up');
        const result   = await ask(`${BASE}

PROCESSO: ${processo}
MELHORIA PROPOSTA: ${melhoria}

# Simulação de Melhoria: ${processo.toUpperCase()}

## Estado Atual (As-Is)
[Lead time total, taxa de erro, throughput, custo]

## Estado Futuro (To-Be) com a melhoria: ${melhoria}
[Lead time projetado, taxa de erro esperada, throughput novo, custo]

## Impacto Quantificado
| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|---------|
| Lead Time | | | |
| Taxa de Erro | | | |
| Throughput | | | |
| Custo/caso | | | |

## ROI da Melhoria
[Economia mensal, custo de implementação, payback]

## Riscos da Implementação
[O que pode dar errado ao implementar]

## Implementação Gradual
[Como implementar sem impactar a operação atual]`);
        console.log(result);
        save(dir, `simulate_${processo}_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

# Process Mining Report — Semanal

## Processo em Foco Esta Semana
[O processo com maior oportunidade de melhoria]

## Descoberta da Semana
[Um insight sobre um processo que estava oculto]

## Gargalo Prioritário
[O gargalo com maior impacto financeiro]

## Conformidade da Semana
[Status de conformidade dos principais processos]

## Quick Win de Processo
[Uma melhoria de processo implementável em < 3 dias]

## Proposta de Projeto
[Um processo que justifica um projeto Lean formal — argumento de ROI]`);
        console.log(result);
        save(dir, `process_mining_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: discover | map | bottleneck | conformance | variant | sla | handover | root-cause | simulate | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
