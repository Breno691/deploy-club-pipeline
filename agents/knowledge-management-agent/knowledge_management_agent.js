#!/usr/bin/env node
/**
 * Knowledge Management Agent — SmartOps IA
 * SOPs, playbooks, base de conhecimento e onboarding
 *
 * Usage:
 *   node knowledge_management_agent.js --mode sop --processo "diagnóstico express" --area operacional
 *   node knowledge_management_agent.js --mode playbook --tipo vendas
 *   node knowledge_management_agent.js --mode capture --titulo "Como conduzir reunião de descoberta" --categoria comercial
 *   node knowledge_management_agent.js --mode search --query "proposta"
 *   node knowledge_management_agent.js --mode gap
 *   node knowledge_management_agent.js --mode update --sop SOP-001
 *   node knowledge_management_agent.js --mode onboard
 *   node knowledge_management_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

// ─── PURE FUNCTIONS ─────────────────────────────────────────────────────────

function calcMaturityScore() {
  // Avalia o nível atual de maturidade do conhecimento da SmartOps
  const sops_existentes = CONFIG.sop_templates.length;
  const playbooks_existentes = CONFIG.playbooks.length;
  const score = Math.min(5, Math.round((sops_existentes / 20 + playbooks_existentes / 15) * 3 + 1));
  return { score, label: CONFIG.maturity_levels[score]?.label || 'Ad-hoc', sops: sops_existentes, playbooks: playbooks_existentes };
}

function getKnowledgeGaps() {
  const essential = ['SOP de Diagnóstico','SOP de Proposta','SOP de Onboarding','Playbook de Vendas','Playbook de Diagnóstico'];
  const existing  = [...CONFIG.sop_templates.map(s => s.nome), ...CONFIG.playbooks.map(p => p.nome)];
  const gaps = essential.filter(e => !existing.some(ex => ex.toLowerCase().includes(e.toLowerCase().replace('sop de ','').replace('playbook de ',''))));
  return gaps;
}

function loadKnowledgeBase() {
  const kbPath = path.join(__dirname, 'outputs', 'knowledge_base.json');
  if (fs.existsSync(kbPath)) return JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
  return { sops: [], playbooks: [], articles: [], created: new Date().toISOString() };
}

function saveKnowledgeBase(kb) {
  const kbPath = path.join(__dirname, 'outputs', 'knowledge_base.json');
  if (!fs.existsSync(path.join(__dirname, 'outputs'))) fs.mkdirSync(path.join(__dirname, 'outputs'), { recursive: true });
  fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2), 'utf-8');
}

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `knowledge_${date}`);
  ['logs','reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  KNOWLEDGE MANAGEMENT AGENT — SmartOps IA       ║');
  console.log('║  "Conhecimento documentado é vantagem competitiva."║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();
  const maturity = calcMaturityScore();
  const BASE = `Você é o Knowledge Management Agent da SmartOps IA.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH, MG.
Empresa: SmartOps IA — consultoria Lean + Automação IA.
Maturidade atual do conhecimento: ${maturity.score}/5 — ${maturity.label}.
SOPs existentes: ${maturity.sops} | Playbooks: ${maturity.playbooks}.
Objetivo: construir uma base de conhecimento que permita escalar sem depender apenas do Breno.`;

  try {
    switch (mode) {

      case 'sop': {
        const processo = getArg('processo', 'processo padrão');
        const area     = getArg('area', 'operacional');
        const catInfo  = CONFIG.knowledge_categories[area] || CONFIG.knowledge_categories.operacional;
        const nextCode = `SOP-${String(CONFIG.sop_templates.length + 1).padStart(3, '0')}`;
        const result   = await ask(`${BASE}

CRIAÇÃO DE SOP:
Processo: ${processo}
Área: ${catInfo.name}
Código: ${nextCode}

# ${nextCode} — SOP: ${processo.toUpperCase()}

## METADADOS
- Código: ${nextCode}
- Área: ${catInfo.name}
- Versão: 1.0
- Responsável: Breno Luiz
- Criado em: ${date}
- Revisão: trimestral

## OBJETIVO
[O que este processo faz e por que é importante]

## ESCOPO
[Quando aplicar este SOP — gatilhos de início e fim]

## RESPONSÁVEL E PARTICIPANTES
[Quem executa, quem aprova, quem é impactado]

## MATERIAIS NECESSÁRIOS
[Templates, ferramentas, acessos necessários antes de começar]

## PASSO A PASSO (detalhado)
| Passo | Ação | Responsável | Tempo | Output |
|-------|------|-------------|-------|--------|

## PONTOS DE DECISÃO
[Onde o processo tem bifurcações e como decidir]

## ERROS COMUNS (e como evitar)
[Top 3 falhas neste processo e o antídoto]

## CRITÉRIO DE QUALIDADE
[Como saber que o processo foi executado corretamente]

## MÉTRICAS
[KPI para monitorar a eficácia deste processo]

## HISTÓRICO DE REVISÕES
| Versão | Data | Mudança | Aprovador |
|--------|------|---------|-----------|`);
        console.log(result);
        save(path.join(dir,'reports'), `${nextCode}_${processo.replace(/\s/g,'_')}.md`, result);
        // Atualiza KB
        const kb = loadKnowledgeBase();
        kb.sops.push({ codigo: nextCode, nome: processo, area, date, arquivo: `${nextCode}_${processo.replace(/\s/g,'_')}.md` });
        saveKnowledgeBase(kb);
        break;
      }

      case 'playbook': {
        const tipo  = getArg('tipo', 'vendas');
        const pb    = CONFIG.playbooks.find(p => p.nome.toLowerCase().includes(tipo)) || CONFIG.playbooks[0];
        const result = await ask(`${BASE}

CRIAÇÃO DE PLAYBOOK: ${pb.nome}
Target: ${pb.target}
Foco: ${pb.foco}

# PLAYBOOK: ${pb.nome.toUpperCase()}

## OBJETIVO DO PLAYBOOK
[${pb.foco} — o resultado esperado de quem segue este playbook]

## QUANDO USAR
[Situações específicas que ativam este playbook]

## MINDSET
[A mentalidade certa para executar este playbook com excelência]

## FLUXO PRINCIPAL (etapa por etapa)
[Cada etapa com: o que fazer, o que dizer, o que evitar, como medir]

## SCRIPTS E TEMPLATES
[Copy exata para mensagens, emails, perguntas de descoberta]

## OBJEÇÕES E RESPOSTAS
[As 5 objeções mais comuns neste contexto e a resposta ideal]

## SINAIS DE PROGRESSO
[Como saber que o playbook está funcionando]

## SINAIS DE ALERTA
[Quando mudar de abordagem ou pedir ajuda]

## EXEMPLOS REAIS
[2-3 situações reais da SmartOps onde este playbook se aplica]

## FERRAMENTAS
[Ferramentas, templates e recursos necessários]`);
        console.log(result);
        save(path.join(dir,'reports'), `playbook_${tipo}_${date}.md`, result);
        const kb = loadKnowledgeBase();
        kb.playbooks.push({ nome: pb.nome, tipo, date, arquivo: `playbook_${tipo}_${date}.md` });
        saveKnowledgeBase(kb);
        break;
      }

      case 'capture': {
        const titulo   = getArg('titulo', 'Conhecimento capturado');
        const categoria = getArg('categoria', 'operacional');
        const result   = await ask(`${BASE}

CAPTURA DE CONHECIMENTO:
Título: ${titulo}
Categoria: ${categoria}

# KNOWLEDGE ARTICLE: ${titulo.toUpperCase()}

## RESUMO (1 parágrafo)
[O essencial sobre este conhecimento]

## CONTEXTO
[Quando e onde este conhecimento é aplicável]

## DETALHE
[Explicação completa — o suficiente para alguém sem experiência executar]

## EXEMPLOS PRÁTICOS
[2-3 situações reais de aplicação na SmartOps]

## ARMADILHAS COMUNS
[O que não fazer e por quê]

## REFERÊNCIAS
[Links, livros, frameworks relacionados]

## TAGS
[Palavras-chave para encontrar este artigo: ${titulo.toLowerCase().split(' ').join(', ')}]`);
        console.log(result);
        const slug = titulo.toLowerCase().replace(/\s/g,'_').slice(0,30);
        save(path.join(dir,'reports'), `kb_${slug}_${date}.md`, result);
        const kb = loadKnowledgeBase();
        kb.articles.push({ titulo, categoria, date, arquivo: `kb_${slug}_${date}.md` });
        saveKnowledgeBase(kb);
        break;
      }

      case 'search': {
        const query = getArg('query', '');
        const kb    = loadKnowledgeBase();
        const all   = [...(kb.sops||[]).map(s => ({...s, tipo:'SOP'})), ...(kb.playbooks||[]).map(p => ({...p, tipo:'Playbook'})), ...(kb.articles||[]).map(a => ({...a, tipo:'Article'}))];
        const found = query ? all.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) : all;
        console.log(`SEARCH: "${query}" — ${found.length} resultado(s) encontrado(s)\n`);
        found.forEach(f => console.log(`  [${f.tipo}] ${f.nome || f.titulo} — ${f.date}`));
        if (!found.length) {
          console.log('  Nenhum resultado. Use --mode gap para ver o que falta documentar.');
        }
        save(path.join(dir,'reports'), 'search_results.json', { query, found });
        break;
      }

      case 'gap': {
        const gaps = getKnowledgeGaps();
        console.log(`GAP ANALYSIS — Conhecimento Faltante\n`);
        if (gaps.length) {
          console.log(`  ${gaps.length} gap(s) crítico(s) identificado(s):`);
          gaps.forEach(g => console.log(`  ⚠️ ${g}`));
        } else {
          console.log('  ✅ Documentação básica completa!');
        }
        console.log('');
        const result = await ask(`${BASE}

GAPS DE CONHECIMENTO IDENTIFICADOS:
${gaps.length ? gaps.map(g => `- ${g} (FALTANDO)`).join('\n') : 'Documentação básica presente'}

SOPs EXISTENTES: ${CONFIG.sop_templates.map(s => s.nome).join(', ')}
PLAYBOOKS EXISTENTES: ${CONFIG.playbooks.map(p => p.nome).join(', ')}

# KNOWLEDGE GAP ANALYSIS

## DIAGNÓSTICO
[O que está faltando e o impacto para o negócio — cada gap tem um custo]

## PRIORIZAÇÃO DOS GAPS
[Ranking por urgência × impacto — o que documentar primeiro]

## PLANO DE DOCUMENTAÇÃO (4 semanas)
| Semana | Documento | Responsável | Tempo estimado |
|--------|-----------|-------------|----------------|

## CONHECIMENTO TÁCITO EM RISCO
[O que está apenas na cabeça do Breno que precisa ser documentado urgente]

## QUICK DOCUMENTATION (hoje)
[Um conhecimento que pode ser capturado em < 30 minutos com alto impacto]`);
        console.log(result);
        save(path.join(dir,'reports'), `gap_analysis_${date}.md`, result);
        save(path.join(dir,'reports'), 'gaps_data.json', { gaps, maturity });
        break;
      }

      case 'update': {
        const sopCode = getArg('sop', 'SOP-001');
        const sop     = CONFIG.sop_templates.find(s => s.codigo === sopCode) || CONFIG.sop_templates[0];
        const result  = await ask(`${BASE}

REVISÃO DE SOP: ${sop.codigo} — ${sop.nome}
Área: ${sop.area} | Passos: ${sop.passos} | Tempo: ${sop.tempo}

# REVISÃO DE SOP — ${sop.codigo}

## CHECKLIST DE REVISÃO
[O que verificar ao revisar um SOP: precisão, relevância, clareza, exemplos]

## POSSÍVEIS PONTOS DE MELHORIA
[Baseado em boas práticas de gestão de SOPs em consultoria]

## PERGUNTAS PARA O PROCESSO
[O que perguntar a quem executa este processo para capturar melhorias]

## COMO COMUNICAR A ATUALIZAÇÃO
[Como notificar a equipe de que o SOP foi atualizado]

## TEMPLATE DE CHANGELOG
[Como registrar mudanças de forma rastreável]`);
        console.log(result);
        save(path.join(dir,'reports'), `sop_update_${sopCode}_${date}.md`, result);
        break;
      }

      case 'onboard': {
        const result = await ask(`${BASE}

Crie o Guia de Onboarding completo para qualquer pessoa que entre na SmartOps IA.

# ONBOARDING GUIDE — SmartOps IA

## BEM-VINDO À SMARTOPS IA
[Missão, visão e o que fazemos em 3 parágrafos]

## SEMANA 1 — ENTENDENDO O SISTEMA
| Dia | O que fazer | Onde encontrar | Checkpoint |
|-----|-------------|----------------|------------|

## SEMANA 2 — PRIMEIROS PROJETOS
[Como executar o primeiro diagnóstico, a primeira proposta, o primeiro projeto]

## RECURSOS ESSENCIAIS
[Links, passwords (onde ficam), ferramentas, acessos necessários]

## GLOSSÁRIO SMARTOPS
[Termos-chave que todo colaborador precisa conhecer]

## QUEM PERGUNTAR O QUÊ
[Mapa de especialidade — quem sabe o quê na SmartOps]

## COMO FUNCIONA O DIA A DIA
[Rotinas diárias, reuniões, relatórios, comunicação interna]

## MÉTRICAS QUE IMPORTAM
[Os KPIs que todo colaborador deve conhecer e monitorar]`);
        console.log(result);
        save(path.join(dir,'reports'), `onboarding_guide_${date}.md`, result);
        break;
      }

      case 'report': {
        const kb     = loadKnowledgeBase();
        const gaps   = getKnowledgeGaps();
        const result = await ask(`${BASE}

ESTADO ATUAL DA BASE DE CONHECIMENTO:
SOPs registrados: ${CONFIG.sop_templates.length} (templates) + ${kb.sops?.length || 0} (gerados)
Playbooks: ${CONFIG.playbooks.length}
Artigos: ${kb.articles?.length || 0}
Gaps críticos: ${gaps.length}
Nível de maturidade: ${maturity.score}/5 — ${maturity.label}

Data: ${date}

# KNOWLEDGE MANAGEMENT REPORT — ${date}

## SCORECARD DO CONHECIMENTO
| Categoria | Documentos | Score | Status |
|-----------|------------|-------|--------|
${Object.entries(CONFIG.knowledge_categories).map(([k,v]) => `| ${v.name} | ${v.tipos.length} tipos | — | — |`).join('\n')}

## GAPS PRIORITÁRIOS
${gaps.map(g => `- ⚠️ ${g}`).join('\n') || '- Documentação básica completa'}

## CONHECIMENTO MAIS ACESSADO
[Os documentos mais úteis para o dia a dia da SmartOps]

## PLANO DE EVOLUÇÃO (próximo mês)
[O que documentar em ordem de prioridade]

## ROI DA DOCUMENTAÇÃO
[Como uma boa base de conhecimento impacta: qualidade, escala, churn de colaborador, replicabilidade]`);
        console.log(result);
        save(path.join(dir,'reports'), `knowledge_report_${date}.md`, result);
        save(path.join(dir,'reports'), 'knowledge_state.json', { maturity, gaps, sops: CONFIG.sop_templates.length, playbooks: CONFIG.playbooks.length, kb_size: (kb.sops?.length||0)+(kb.playbooks?.length||0)+(kb.articles?.length||0) });
        break;
      }

      default:
        console.log('Modos: sop | playbook | capture | search | gap | update | onboard | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
