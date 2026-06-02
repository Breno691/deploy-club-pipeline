#!/usr/bin/env node
/**
 * Consulting Company Builder Agent — SmartOps IA
 * Estruturar, organizar e escalar empresa de consultoria profissional
 *
 * Usage:
 *   node consulting_company_builder_agent.js --mode estrutura
 *   node consulting_company_builder_agent.js --mode servicos
 *   node consulting_company_builder_agent.js --mode proposta --cliente "Indústria X" --problema "alto retrabalho"
 *   node consulting_company_builder_agent.js --mode diagnostico --setor industria
 *   node consulting_company_builder_agent.js --mode processo --etapa onboarding
 *   node consulting_company_builder_agent.js --mode comercial
 *   node consulting_company_builder_agent.js --mode indicadores
 *   node consulting_company_builder_agent.js --mode metodologia
 *   node consulting_company_builder_agent.js --mode rotina
 *   node consulting_company_builder_agent.js --mode escalar
 *   node consulting_company_builder_agent.js --mode report
 */
require('dotenv').config();
const fs = require('fs'), path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('./src/config');
const client = new Anthropic();

function getArg(n, fb = null) { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i+1] ? process.argv[i+1] : fb; }

function setupOutput() {
  const date = new Date().toISOString().split('T')[0];
  const dir  = path.join(__dirname, 'outputs', `consulting_builder_${date}`);
  ['reports'].forEach(d => { if (!fs.existsSync(path.join(dir,d))) fs.mkdirSync(path.join(dir,d),{recursive:true}); });
  return { dir, date };
}
function save(dir, fn, c) { const p=path.join(dir,fn); fs.writeFileSync(p,typeof c==='string'?c:JSON.stringify(c,null,2),'utf-8'); console.log(`  ✓ ${p}`); }
async function ask(prompt) { const r=await client.messages.create({model:CONFIG.claude.model,max_tokens:CONFIG.claude.maxTokens,messages:[{role:'user',content:prompt}]}); return r.content[0].text; }

async function main() {
  const mode = getArg('mode', 'report');
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  CONSULTING COMPANY BUILDER — SmartOps IA       ║');
  console.log('║  "Primeiro diagnosticar, depois escalar."       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  if (!process.env.ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY missing'); process.exit(1); }
  const { dir, date } = setupOutput();

  const BASE = `Você é o Consulting Company Builder Agent da SmartOps IA — sócio estratégico e consultor sênior.
CEO: Breno Luiz — Black Belt Lean Six Sigma, BH/MG.
Missão: transformar a SmartOps IA numa consultoria premium, organizada, escalável e com valor percebido alto.

METODOLOGIA OPEX:
O = Organização | P = Processos | E = Execução | X = Expansão

REGRAS:
- Nunca responder genérico. Sempre transformar ideia em processo.
- Sempre sugerir entregáveis concretos e próximo passo.
- Primeiro diagnosticar, depois organizar, depois executar, depois medir, depois escalar.
- Nunca recomendar automação antes de padronização.`;

  try {
    switch (mode) {

      case 'estrutura': {
        const result = await ask(`${BASE}

# Estrutura Consultiva — Diagnóstico Completo da SmartOps IA

## Diagnóstico
[Estado atual da consultoria: o que existe, o que falta, gaps críticos]

## Áreas Internas Necessárias
[Para cada área: Estratégia | Comercial | Operações | Técnica | CS | Marketing | Financeiro]
[Status atual + O que implementar primeiro]

## Priorização das Áreas
[Matriz impacto × esforço — o que estruturar agora vs. depois]

## Plano de Ação 7 Dias
[As 5 ações mais importantes para esta semana]

## Plano de Ação 30 Dias
[As 10 ações estruturais para o próximo mês]

## Conclusão
[O primeiro passo exato, hoje]`);
        console.log(result);
        save(path.join(dir,'reports'), `estrutura_${date}.md`, result);
        break;
      }

      case 'servicos': {
        const result = await ask(`${BASE}

PACOTES DISPONÍVEIS:
${Object.values(CONFIG.packages).map(p => `- ${p.nome}: ${p.duracao} | R$${p.preco_min.toLocaleString('pt-BR')}–${p.preco_max.toLocaleString('pt-BR')} | ${p.entregaveis.length} entregáveis`).join('\n')}

# Estratégia de Portfólio de Serviços

## Diagnóstico do Portfólio Atual
[Qual serviço é mais fácil de vender agora? Qual tem maior margem? Qual prova mais valor?]

## Ladder de Valor (escada)
[Como o cliente sobe de um serviço para o próximo — com transição natural]

## Serviço de Entrada (mínima fricção)
[O que fechar o primeiro cliente mais rápido e mais fácil]

## Serviço Core (maior volume)
[O que deve ser a maioria das vendas — por quê e como posicionar]

## Serviço Premium (maior ticket)
[A oferta que faz os R$15k MRR virar realidade]

## Novo Serviço Recomendado
[Uma lacuna no mercado que a SmartOps pode preencher agora]

## Plano de Go-to-Market
[Como lançar o portfólio de forma que o cliente entenda e compre]`);
        console.log(result);
        save(path.join(dir,'reports'), `servicos_${date}.md`, result);
        break;
      }

      case 'proposta': {
        const cliente  = getArg('cliente', 'PME em BH');
        const problema = getArg('problema', 'ineficiência operacional');
        const pacote   = getArg('pacote', 'diagnostico_express');
        const pkInfo   = CONFIG.packages[pacote] || CONFIG.packages.diagnostico_express;
        const result   = await ask(`${BASE}

CLIENTE: ${cliente}
PROBLEMA: ${problema}
PACOTE: ${pkInfo.nome} (${pkInfo.duracao})

Gere uma PROPOSTA COMERCIAL COMPLETA e PROFISSIONAL:

# Proposta de Consultoria — ${pkInfo.nome}

## Para: ${cliente}

## Contexto
[Situação atual do cliente — baseada no problema: ${problema}]

## Problemas Identificados
[Top 3-5 problemas específicos com impacto financeiro estimado]

## Objetivo do Projeto
[O que será alcançado — com métrica de sucesso]

## Escopo
Inclui: ${pkInfo.entregaveis.join(' | ')}
Não inclui: [o que está fora do escopo — importante para não ter retrabalho]

## Metodologia OPEX
[Como cada fase será executada especificamente para este cliente]

## Cronograma
| Fase | Duração | Entregável |
|------|---------|-----------|

## Investimento
[R$${pkInfo.preco_min.toLocaleString('pt-BR')} a R$${pkInfo.preco_max.toLocaleString('pt-BR')} | Forma de pagamento | Validade]

## ROI Esperado
[Estimativa de retorno em 3, 6 e 12 meses]

## Próximos Passos
1. Aprovação da proposta
2. Assinatura do contrato
3. Reunião de kickoff
4. Início do diagnóstico`);
        console.log(result);
        save(path.join(dir,'reports'), `proposta_${cliente.replace(/\s/g,'_')}_${date}.md`, result);
        break;
      }

      case 'diagnostico': {
        const setor = getArg('setor', 'servicos');
        const bench = CONFIG.sectors[setor] || CONFIG.sectors.servicos;
        const result = await ask(`${BASE}

SETOR: ${setor}
BENCHMARKS DO SETOR: ${JSON.stringify(bench)}
FASES DO DIAGNÓSTICO: ${CONFIG.diagnostic_phases.map(f => `Fase ${f.fase}: ${f.nome} (${f.tempo})`).join(' → ')}

# Guia de Diagnóstico Lean — ${setor.toUpperCase()}

## Roteiro de Entrevista
[15 perguntas específicas para descobrir os maiores gargalos deste tipo de empresa]

## Mapa de Observação (Gemba Walk)
[O que observar, o que cronometrar, o que fotografar]

## Análise dos 8 Desperdícios
[Para cada desperdício: como se manifesta neste setor + como identificar]

## Score de Maturidade
[Critérios para avaliar o nível 1-5 desta empresa]

## Template de Diagnóstico Final
[Estrutura do relatório: situação atual → problemas → causas → oportunidades → plano]

## Primeiros Quick Wins
[3 melhorias que podem ser implementadas em < 1 semana com impacto visível]`);
        console.log(result);
        save(path.join(dir,'reports'), `diagnostico_${setor}_${date}.md`, result);
        break;
      }

      case 'processo': {
        const etapa = getArg('etapa', 'onboarding');
        const result = await ask(`${BASE}

PROCESSO A ESTRUTURAR: ${etapa}

# Processo: ${etapa.toUpperCase()} — SmartOps IA

## Objetivo do Processo
[O que este processo deve entregar e qual o critério de sucesso]

## SIPOC
| Fornecedores | Entradas | Processo | Saídas | Clientes |
|--------------|---------|---------|-------|--------|

## Passo a Passo Detalhado
| Passo | Ação | Responsável | Ferramenta | Tempo | Output |
|-------|------|-------------|-----------|-------|--------|

## Pontos de Decisão
[Onde o processo se bifurca e como decidir]

## Erros Comuns (e como prevenir)
[Top 3 falhas neste processo e o antídoto]

## Automações Possíveis
[O que pode ser automatizado com n8n ou outras ferramentas]

## KPIs do Processo
[Como medir se está funcionando bem]

## Template de POP (Procedimento Operacional Padrão)
[Versão resumida pronta para imprimir ou salvar no Notion]`);
        console.log(result);
        save(path.join(dir,'reports'), `processo_${etapa}_${date}.md`, result);
        break;
      }

      case 'comercial': {
        const result = await ask(`${BASE}

PROCESSO COMERCIAL SmartOps IA:
Etapas: ${CONFIG.sales_process.etapas.join(' → ')}
Perguntas de diagnóstico: ${CONFIG.sales_process.perguntas_diagnostico.slice(0,5).join(' | ')}

# Estratégia Comercial Completa

## Funil de Vendas
[Cada etapa com: objetivo, ação, ferramenta, taxa esperada, como avançar]

## Script de Reunião Diagnóstica (30-45 min)
[Abertura → Perguntas de descoberta → Apresentação de valor → Próximo passo]

## Follow-up Que Converte
[Sequência: após reunião → 24h → 3 dias → 7 dias → 14 dias]

## Resposta Para "Vou Pensar"
[O que dizer quando o cliente está no fence — sem pressionar]

## Resposta Para "Está Caro"
[Reframe de valor com ROI — como transformar objeção de preço em conversa de resultado]

## CRM Recomendado
[Qual CRM usar agora com zero orçamento e como organizar o pipeline]

## Meta Comercial Semanal
[O que Breno deve fazer toda semana para chegar em R$15k MRR em 90 dias]`);
        console.log(result);
        save(path.join(dir,'reports'), `comercial_${date}.md`, result);
        break;
      }

      case 'indicadores': {
        const result = await ask(`${BASE}

INDICADORES DA CONSULTORIA:
Comercial: ${CONFIG.kpis.comercial.join(', ')}
Operacional: ${CONFIG.kpis.operacional.join(', ')}
Financeiro: ${CONFIG.kpis.financeiro.join(', ')}

# Dashboard de Indicadores — SmartOps IA

## KPI Dashboard Semanal
[Os 10 indicadores mais importantes para revisar toda segunda-feira]

## Semáforo de Saúde da Consultoria
[Para cada KPI: meta, alerta, crítico — com benchmark de mercado]

## Como Coletar Esses Dados (sem sistema caro)
[Planilha Google Sheets + n8n — estrutura mínima viável]

## Indicadores do Cliente (para entregar nos projetos)
[Os 5 KPIs que todo cliente deve acompanhar durante o projeto]

## Relatório Mensal Executivo
[Template de uma página com os resultados da consultoria e dos clientes]`);
        console.log(result);
        save(path.join(dir,'reports'), `indicadores_${date}.md`, result);
        break;
      }

      case 'metodologia': {
        const result = await ask(`${BASE}

METODOLOGIA OPEX:
${Object.entries(CONFIG.methodology.fases).map(([k,v]) => `${k} = ${v.nome}: ${v.objetivo} → ${v.entregaveis.join(', ')}`).join('\n')}

# Metodologia OPEX — Documentação Completa

## Manifesto da Metodologia
[Por que o OPEX existe, o que o diferencia de outros métodos, a filosofia por trás]

## Como Apresentar ao Cliente
[Pitch de 2 minutos que explica o OPEX de forma simples e poderosa]

## OPEX em Detalhes (fase a fase)
[Para cada fase: objetivo, duração, ferramentas, entregáveis, critério de gate]

## Cases de Aplicação
[3 exemplos hipotéticos de como o OPEX seria aplicado em diferentes setores em BH]

## Materiais de Venda
[Como usar o OPEX como diferencial competitivo na proposta e no site]

## Evolução do Método
[Como documentar aprendizados e versionar a metodologia conforme a consultoria cresce]`);
        console.log(result);
        save(path.join(dir,'reports'), `metodologia_opex_${date}.md`, result);
        break;
      }

      case 'rotina': {
        const result = await ask(`${BASE}

# Rotina de Gestão Interna da SmartOps IA

## Rotina Diária (30 min)
[O que verificar toda manhã: pipeline, projetos, mensagens, tarefas críticas]

## Rotina Semanal (2h)
[Segunda-feira: o que revisar, o que priorizar, o que planejar]

## Rotina Mensal (4h)
[Fechamento: indicadores, resultados, ajustes, próximo mês]

## Checklist de Kickoff de Projeto
[Tudo o que precisa estar alinhado antes de começar um projeto com cliente]

## Checklist de Encerramento de Projeto
[O que entregar, o que coletar, como fazer a transição de forma profissional]

## Templates Essenciais a Criar Esta Semana
[Os 5 documentos que a SmartOps mais precisa ter prontos agora]

## Automações de Rotina Prioritárias
[Top 3 automações que economizariam mais tempo na rotina semanal]`);
        console.log(result);
        save(path.join(dir,'reports'), `rotina_${date}.md`, result);
        break;
      }

      case 'escalar': {
        const mrr_atual = getArg('mrr-atual', '0');
        const mrr_meta  = getArg('mrr-meta', '15000');
        const result    = await ask(`${BASE}

MRR ATUAL: R$ ${mrr_atual}
MRR META (90 dias): R$ ${Number(mrr_meta).toLocaleString('pt-BR')}

# Plano de Escalagem — SmartOps IA

## Diagnóstico de Prontidão para Escalar
[O que precisa estar funcionando antes de tentar escalar]

## Gargalo Principal Agora
[O que está impedindo o crescimento: comercial, operacional, posicionamento, produtividade?]

## Alavancas de Crescimento
[Top 5 iniciativas rankeadas por impacto × esforço para atingir R$${Number(mrr_meta).toLocaleString('pt-BR')} MRR]

## Modelo de Receita para Escalar
[Mix ideal: projetos vs. recorrente vs. produtos vs. treinamentos]

## O Que Padronizar Antes de Crescer
[Processos que precisam estar no piloto automático antes de contratar ou expandir]

## Automações Que Liberam Tempo para Crescer
[O que automatizar agora para que Breno tenha mais horas para vender]

## Plano Semana a Semana (próximas 12 semanas)
[O que focar cada semana para chegar na meta]`);
        console.log(result);
        save(path.join(dir,'reports'), `escalar_${date}.md`, result);
        break;
      }

      case 'report': {
        const result = await ask(`${BASE}

Data: ${date}

# Consulting Company Builder — Weekly Report

## Status da Consultoria SmartOps IA
[Avaliação honesta do estágio atual: posicionamento, comercial, operações, crescimento]

## TOP 3 Prioridades Esta Semana
[As 3 ações de maior impacto para construir a consultoria agora]

## Gaps Críticos Identificados
[O que está faltando que está bloqueando o crescimento]

## Oportunidade de Mercado da Semana
[Uma oportunidade específica para PME em BH que a SmartOps pode abordar agora]

## Templates/Documentos Mais Urgentes
[O que criar esta semana para parecer mais profissional ao próximo cliente]

## Decisão Estratégica Para o CEO
[Uma decisão sobre a estrutura da consultoria que Breno deve tomar hoje]`);
        console.log(result);
        save(path.join(dir,'reports'), `consulting_report_${date}.md`, result);
        break;
      }

      default:
        console.log('Modos: estrutura | servicos | proposta | diagnostico | processo | comercial | indicadores | metodologia | rotina | escalar | report');
    }
    console.log(`\n✅ Output: ${dir}`);
  } catch(e) { console.error(`❌ ${e.message}`); process.exit(1); }
}
main();
