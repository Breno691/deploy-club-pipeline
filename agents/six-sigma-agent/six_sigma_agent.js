#!/usr/bin/env node
/**
 * Six Sigma Agent — SmartOps IA
 * Especialista em DMAIC, DPMO, Cp/Cpk e controle estatístico
 *
 * Usage:
 *   node six_sigma_agent.js --mode dmaic --projeto "Reduzir retrabalho em propostas" --fase D
 *   node six_sigma_agent.js --mode dpmo --defeitos 15 --unidades 200 --oportunidades 5
 *   node six_sigma_agent.js --mode capability --usl 10 --lsl 2 --media 6 --desvio 1.2
 *   node six_sigma_agent.js --mode control --processo "aprovação de proposta"
 *   node six_sigma_agent.js --mode spc --dados "4.2,3.8,5.1,4.9,3.5,6.2,4.1"
 *   node six_sigma_agent.js --mode analyze --problema "entrega atrasada" --dados "12,15,18,10,22,14"
 *   node six_sigma_agent.js --mode report
 *   node six_sigma_agent.js --mode brief
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }
function parseNum(n, fb = 0)   { return parseFloat(getArg(n, String(fb))); }

// ─── PURE FUNCTIONS (sem Claude) ───────────────────────────────────────────

function calcDPMO(defeitos, unidades, oportunidades) {
  if (!unidades || !oportunidades) return { dpmo: 0, sigma: 0, yield_pct: 0, label: 'Inválido' };
  const dpmo = (defeitos / (unidades * oportunidades)) * 1_000_000;
  const entry = [...CONFIG.sigma_table].reverse().find(r => r.dpmo >= dpmo) || CONFIG.sigma_table[0];
  return { dpmo: Math.round(dpmo), sigma: entry.level, yield_pct: entry.yield_pct, label: classifyDPMO(dpmo) };
}

function classifyDPMO(dpmo) {
  if (dpmo <= 3.4)    return '6σ — World Class';
  if (dpmo <= 233)    return '5σ — Excelente';
  if (dpmo <= 6210)   return '4σ — Adequado';
  if (dpmo <= 66807)  return '3σ — Ruim';
  if (dpmo <= 308538) return '2σ — Incapaz';
  return '1σ — Crítico';
}

function calcCapability(usl, lsl, media, desvio) {
  if (!desvio || desvio === 0) return null;
  const cp   = (usl - lsl) / (6 * desvio);
  const cpu  = (usl - media) / (3 * desvio);
  const cpl  = (media - lsl) / (3 * desvio);
  const cpk  = Math.min(cpu, cpl);
  const dpmo_est = calcDPMO(Math.round((1 - normalCDF(cpk * 3)) * 1_000_000), 1_000_000, 1);
  const bench = Object.values(CONFIG.capability_benchmarks).find(b => cpk >= b.cpk) || CONFIG.capability_benchmarks.incapable;
  return { cp: +cp.toFixed(3), cpu: +cpu.toFixed(3), cpl: +cpl.toFixed(3), cpk: +cpk.toFixed(3), sigma_est: dpmo_est.sigma, classificacao: bench.label };
}

function normalCDF(z) {
  // Aproximação simples para CDF normal
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}

function calcSPCLimits(dados) {
  const n   = dados.length;
  const avg = dados.reduce((a, b) => a + b, 0) / n;
  const variance = dados.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / n;
  const std = Math.sqrt(variance);
  const ucl = +(avg + 3 * std).toFixed(3);
  const lcl = +(avg - 3 * std).toFixed(3);
  const outliers = dados.filter(d => d > ucl || d < lcl);
  return { n, avg: +avg.toFixed(3), std: +std.toFixed(3), ucl, lcl, outliers, in_control: outliers.length === 0 };
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `sixsigma_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  SIX SIGMA AGENT — SmartOps IA                 ║');
  console.log('║  "Medir, Analisar, Controlar. 3.4 DPMO."       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const BASE = `Você é o Six Sigma Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Empresa: SmartOps IA — consultoria Lean + Automação IA para PMEs.
Use linguagem técnica de Six Sigma mas sempre conecte ao impacto de negócio.`;

  try {
    switch (mode) {

      case 'dmaic': {
        const projeto = getArg('projeto', 'Melhoria de processo');
        const fase    = (getArg('fase', 'D') || 'D').toUpperCase();
        const faseInfo = CONFIG.dmaic_phases[fase] || CONFIG.dmaic_phases['D'];
        console.log(`DMAIC — Fase ${fase}: ${faseInfo.name}`);
        console.log(`Projeto: ${projeto}\n`);
        const result = await ask(`${BASE}

PROJETO DMAIC: ${projeto}
FASE ATUAL: ${fase} — ${faseInfo.name}
OBJETIVO DA FASE: ${faseInfo.objetivo}
ATIVIDADES: ${faseInfo.atividades.join(', ')}
FERRAMENTAS: ${faseInfo.ferramentas.join(', ')}
ENTREGÁVEL: ${faseInfo.entregavel}

Gere o guia DMAIC para esta fase:

# DMAIC — ${projeto}
## FASE ${fase}: ${faseInfo.name.toUpperCase()}

### CONTEXTO DO PROJETO
[Por que este projeto foi selecionado e qual o impacto esperado]

### OBJETIVO DA FASE
[O que precisamos alcançar nesta fase especificamente]

### PLANO DE AÇÃO (próximos 7 dias)
[Tabela: Atividade | Responsável | Prazo | Ferramenta | Output esperado]

### FERRAMENTAS RECOMENDADAS
[Para cada ferramenta: como usar neste contexto específico]

### PONTOS DE ATENÇÃO
[Armadilhas comuns desta fase e como evitar]

### CRITÉRIO DE GATE (para avançar para próxima fase)
[O que precisa estar pronto e aprovado antes de avançar]

### PRÓXIMA FASE: ${Object.keys(CONFIG.dmaic_phases)[Object.keys(CONFIG.dmaic_phases).indexOf(fase) + 1] || 'Projeto concluído'}
[Preview do que vem a seguir]`);
        console.log(result);
        save(path.join(dir,'reports'), `dmaic_${fase}_${date}.md`, result);
        break;
      }

      case 'dpmo': {
        const defeitos     = parseNum('defeitos', 0);
        const unidades     = parseNum('unidades', 100);
        const oportunidades = parseNum('oportunidades', 1);
        const resultado = calcDPMO(defeitos, unidades, oportunidades);
        console.log(`DPMO CALCULATION`);
        console.log(`Defeitos: ${defeitos} | Unidades: ${unidades} | Oportunidades: ${oportunidades}`);
        console.log(`DPMO: ${resultado.dpmo.toLocaleString('pt-BR')}`);
        console.log(`Nível Sigma: ${resultado.sigma}σ — ${resultado.label}`);
        console.log(`Yield: ${resultado.yield_pct}%\n`);
        save(path.join(dir,'reports'), 'dpmo_data.json', resultado);
        const result = await ask(`${BASE}

ANÁLISE DE DPMO:
- Defeitos encontrados: ${defeitos}
- Unidades produzidas: ${unidades}
- Oportunidades de defeito por unidade: ${oportunidades}
- DPMO calculado: ${resultado.dpmo.toLocaleString('pt-BR')}
- Nível Sigma: ${resultado.sigma}σ
- Classificação: ${resultado.label}
- Yield atual: ${resultado.yield_pct}%

# ANÁLISE DE DESEMPENHO SIGMA

## STATUS ATUAL
[Interpretação do ${resultado.sigma}σ no contexto de negócio — o que significa na prática]

## CUSTO DO DEFEITO
[Estimativa de quanto esses ${defeitos} defeitos custam por ciclo]

## META SIGMA RECOMENDADA
[Qual nível sigma atingir — com justificativa de negócio]

## PLANO DE MELHORIA
[Passos concretos para subir 0.5σ a 1σ]

## FERRAMENTAS RECOMENDADAS
[As 3 ferramentas mais adequadas para este nível e tipo de problema]`);
        console.log(result);
        save(path.join(dir,'reports'), `dpmo_analysis_${date}.md`, result);
        break;
      }

      case 'capability': {
        const usl    = parseNum('usl', 10);
        const lsl    = parseNum('lsl', 2);
        const media  = parseNum('media', 6);
        const desvio = parseNum('desvio', 1.5);
        const cap    = calcCapability(usl, lsl, media, desvio);
        console.log(`CAPABILITY ANALYSIS`);
        console.log(`USL: ${usl} | LSL: ${lsl} | Média: ${media} | Desvio: ${desvio}`);
        console.log(`Cp: ${cap.cp} | Cpk: ${cap.cpk} | CPU: ${cap.cpu} | CPL: ${cap.cpl}`);
        console.log(`Sigma estimado: ${cap.sigma_est}σ | Classificação: ${cap.classificacao}\n`);
        save(path.join(dir,'reports'), 'capability_data.json', cap);
        const result = await ask(`${BASE}

ANÁLISE DE CAPABILITY:
USL (Limite Superior): ${usl}
LSL (Limite Inferior): ${lsl}
Média do processo: ${media}
Desvio padrão: ${desvio}
Cp: ${cap.cp} | Cpk: ${cap.cpk} | CPU: ${cap.cpu} | CPL: ${cap.cpl}
Sigma estimado: ${cap.sigma_est}σ
Classificação: ${cap.classificacao}

# RELATÓRIO DE CAPABILITY DO PROCESSO

## DIAGNÓSTICO
[O processo está capaz? Por quê? Quais limites estão em risco?]

## ANÁLISE Cp vs Cpk
[O que a diferença entre Cp e Cpk revela sobre o processo — centralização ou variabilidade?]

## IMPACTO NO NEGÓCIO
[Se Cpk < 1.33, quantos defeitos por mês? Qual o custo estimado?]

## PLANO DE MELHORIA
[Como atingir Cpk ≥ 1.33 — ações específicas de centralização e redução de variabilidade]

## MONITORAMENTO
[Que métricas monitorar e com que frequência para sustentar a melhoria]`);
        console.log(result);
        save(path.join(dir,'reports'), `capability_report_${date}.md`, result);
        break;
      }

      case 'spc': {
        const dadosStr = getArg('dados', '4.2,3.8,5.1,4.9,3.5,6.2,4.1,5.0,4.7,3.9');
        const dados = dadosStr.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d));
        const spc   = calcSPCLimits(dados);
        console.log(`SPC — Statistical Process Control`);
        console.log(`N: ${spc.n} amostras | Média: ${spc.avg} | Desvio: ${spc.std}`);
        console.log(`UCL: ${spc.ucl} | LCL: ${spc.lcl}`);
        console.log(`Outliers: ${spc.outliers.length} | Status: ${spc.in_control ? '✅ Em controle' : '❌ Fora de controle'}\n`);
        save(path.join(dir,'reports'), 'spc_data.json', { dados, ...spc });
        const result = await ask(`${BASE}

CONTROLE ESTATÍSTICO DO PROCESSO (SPC):
Dados: ${dadosStr}
N: ${spc.n} | Média: ${spc.avg} | Desvio: ${spc.std}
UCL (Limite Superior de Controle): ${spc.ucl}
LCL (Limite Inferior de Controle): ${spc.lcl}
Pontos fora de controle: ${spc.outliers.join(', ') || 'Nenhum'}
Status: ${spc.in_control ? 'EM CONTROLE' : 'FORA DE CONTROLE'}

# ANÁLISE SPC — CARTA DE CONTROLE

## STATUS DO PROCESSO
[Em controle vs. Fora de controle — interpretação prática]

## PONTOS DE ATENÇÃO
[Para cada outlier detectado: possível causa e ação]

## ANÁLISE DE TENDÊNCIAS
[Algum padrão visível nos dados? Tendência de subida/descida? Agrupamentos?]

## RECOMENDAÇÃO DE AÇÃO
[O que fazer agora — aceitar o processo ou investigar/corrigir?]

## PRÓXIMAS MEDIÇÕES
[Com que frequência coletar dados e quando agir vs. observar]`);
        console.log(result);
        save(path.join(dir,'reports'), `spc_report_${date}.md`, result);
        break;
      }

      case 'analyze': {
        const problema = getArg('problema', 'variabilidade no processo');
        const dadosStr = getArg('dados', '');
        const result   = await ask(`${BASE}

ANÁLISE DE CAUSA-RAIZ (Fase Analyze do DMAIC):
Problema: ${problema}
Dados disponíveis: ${dadosStr || 'Análise qualitativa'}

# ANÁLISE DE CAUSA-RAIZ — ${problema.toUpperCase()}

## DIAGRAMA ISHIKAWA (6M)
[6 categorias: Método, Máquina, Material, Mão de obra, Medição, Meio Ambiente]
[Para cada: 3-5 causas potenciais específicas ao problema]

## 5 PORQUÊS
[Trace a causa-raiz em 5 perguntas sequenciais]

## FMEA — TOP 5 MODOS DE FALHA
[Tabela: Modo de falha | Efeito | Causa | Severidade(1-10) | Ocorrência(1-10) | Detecção(1-10) | RPN | Ação]

## CAUSAS-RAIZ VALIDADAS
[As 3 causas com maior impacto provável — com justificativa]

## PLANO DE AÇÃO ANALYZE
[Para cada causa-raiz: Como validar com dados? Teste de hipótese? Experimento?]`);
        console.log(result);
        save(path.join(dir,'reports'), `analyze_${date}.md`, result);
        break;
      }

      case 'control': {
        const processo = getArg('processo', 'processo padrão');
        const result   = await ask(`${BASE}

PLANO DE CONTROLE PARA: ${processo}

# PLANO DE CONTROLE — ${processo.toUpperCase()}

## CARTAS DE CONTROLE RECOMENDADAS
[Qual tipo de carta usar — X-bar R, p, c, u — com justificativa]

## LIMITES DE CONTROLE
[UCL, média e LCL para os KPIs principais deste processo]

## REGRAS DE DETECÇÃO DE ANOMALIA
[Regras de Western Electric / Nelson para este processo]

## PROTOCOLO DE RESPOSTA (Out of Control)
[O que fazer em < 1h quando um ponto fica fora de controle]

## SOP ATUALIZADO
[Procedimento operacional padrão em 7 passos para executar o processo controlado]

## PLANO DE AUDITORIA
[Frequência, quem audita, o que verificar, critério de aprovação]

## PLANO DE REAÇÃO
[Tabela: Evento | Ação imediata | Responsável | Prazo | Como registrar]`);
        console.log(result);
        save(path.join(dir,'reports'), `control_plan_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Gere o Six Sigma Weekly Report para SmartOps IA.
Data: ${date}

# SIX SIGMA WEEKLY REPORT — ${date}

## SCORECARD SIGMA ATUAL
[Estimativa do nível sigma dos processos críticos — Vendas, Entrega, Marketing]

## PROJETOS DMAIC ATIVOS
${CONFIG.typical_projects.map(p => `- ${p.name} (área: ${p.area}, meta: ${p.meta_sigma}σ)`).join('\n')}

## TOP 3 CAUSAS DE DEFEITOS ESTA SEMANA
[Baseado em dados disponíveis + análise das categorias mais prováveis]

## AÇÕES DE MELHORIA EM ANDAMENTO
[Status de cada ação preventiva e corretiva]

## CUSTO DO DEFEITO ESTIMADO
[R$ perdidos esta semana por retrabalho, erros e ineficiências]

## PRÓXIMOS PROJETOS PRIORIDADE
[Por ROI esperado e facilidade de implementação]

## RECOMENDAÇÃO PARA O CEO
[Uma ação de alto impacto para esta semana baseada em Six Sigma]`);
        console.log(result);
        save(path.join(dir,'reports'), `sixsigma_report_${date}.md`, result);
        break;
      }

      case 'brief': {
        const result = await ask(`${BASE}

Gere o CEO Brief de Six Sigma em formato executivo (máx 1 página).
Data: ${date}

# SIX SIGMA CEO BRIEF — ${date}

## SIGMA SCORE ATUAL: [X.Xσ]
[Uma linha: o que isso significa para o negócio]

## CUSTO DA MÁ QUALIDADE (COPQ)
[Estimativa mensal em R$ de retrabalho + erros + oportunidades perdidas]

## PROJETOS ATIVOS (status semáforo)
[🟢 = no prazo | 🟡 = atenção | 🔴 = crítico]

## GANHO REALIZADO ESTE MÊS
[R$ economizados ou receita gerada por melhorias Six Sigma]

## DECISÃO NECESSÁRIA
[Uma coisa que o CEO precisa decidir para destravar a próxima melhoria]`);
        console.log(result);
        save(path.join(dir,'reports'), `sixsigma_brief_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: dmaic | dpmo | capability | control | spc | analyze | report | brief');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
