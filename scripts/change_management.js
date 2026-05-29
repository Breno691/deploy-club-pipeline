require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'change';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const change    = get('--change') || 'implementacao_lean';
const client_   = get('--client') || 'SmartOps IA';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const chgDir    = path.join(outputDir, 'change_management');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'change_management.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}

async function runChangeManagement() {
  console.log(`\nChange Management Agent — SmartOps IA`);
  console.log(`Mudança: ${change} | Cliente: ${client_}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [chgDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('change_management started');

  console.log('  → Criando plano de gestão de mudança e engajamento...');
  appendLog(`Planning change management for: ${change}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Change Management Agent da SmartOps IA. Especialista em gestão de mudança organizacional — garante que implementações de Lean, Six Sigma e Automação sejam adotadas pela equipe e sustentadas no longo prazo.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Mudança:** ${change.replace(/_/g, ' ')}
**Empresa/Cliente:** ${client_}
**Data:** ${taskDate}

---

# Change Management Plan — ${change.replace(/_/g, ' ')}
**${client_} | ${taskDate}**

---

## 1. Análise de Impacto da Mudança

### O que vai mudar?
| Área | Situação Atual | Situação Futura | Impacto nas Pessoas |
|---|---|---|---|
| [processo A] | [como é hoje] | [como será] | [quem é afetado] |
| [processo B] | | | |

### Stakeholders Afetados

| Stakeholder | Papel | Impacto | Posição Inicial | Ação Necessária |
|---|---|---|---|---|
| Dono/CEO | Patrocinador | Alto | Favorável | Manter engajado |
| Gerente operacional | Líder da mudança | Alto | Neutro | Convencer com dados |
| Equipe operacional | Usuários finais | Alto | Resistente | Treinar + envolver |
| Financeiro | Impactado indiretamente | Médio | Favorável | Informar sobre ROI |

---

## 2. Análise de Resistências

### Resistências Prováveis

| Resistência | Quem | Por Que | Como Superar |
|---|---|---|---|
| "Sempre fizemos assim" | Equipe antiga | Medo do novo | Mostrar benefício individual |
| "Não tenho tempo" | Gestores | Sobrecarga | Demonstrar que poupa tempo |
| "Isso não vai funcionar" | Céticos | Experiências passadas | Case similar com resultado |
| "Vou perder meu emprego" | Operadores | Insegurança com IA | Reposicionar como upgrade de função |

---

## 3. Estratégia de Comunicação

### Fase 1 — Preparação (semanas 1-2)
**Objetivo:** Criar urgência e visão clara

**Ações:**
1. Reunião com liderança: apresentar dados do problema e visão do futuro
2. Comunicado para equipe: "O que vai mudar e por quê"
3. Quick win visual: mostrar um processo melhorado em 1 semana

**Mensagem chave:**
> "Vamos eliminar o que atrapalha vocês trabalharem bem, não o trabalho de vocês."

### Fase 2 — Implementação (semanas 3-8)
**Objetivo:** Engajar e treinar

**Ações:**
1. Treinamento prático (não teórico) em grupos pequenos
2. Embaixadores internos: escolher 1-2 pessoas da equipe como champions
3. Quadro visual do progresso (VSM antes x depois atualizado semanalmente)
4. Celebrar quick wins publicamente

### Fase 3 — Consolidação (semanas 9-12)
**Objetivo:** Sustentar e expandir

**Ações:**
1. SOP documentado e aprovado pela equipe
2. Métricas visíveis para todos (lead time, defeitos, produtividade)
3. Reunião mensal de kaizen: equipe identifica próximas melhorias
4. Reconhecimento: quem mais abraçou a mudança

---

## 4. Plano de Treinamento

| Grupo | Conteúdo | Formato | Duração | Quando |
|---|---|---|---|---|
| Liderança | Lean leadership + ROI | Workshop 1 dia | 8h | Semana 1 |
| Supervisores | Lean tools + VSM | Treinamento prático | 4h | Semana 2 |
| Equipe operacional | Novos processos + 5S | On-the-job | 2h/semana | Semanas 3-6 |
| Todos | Resultados e celebração | Reunião | 1h | Semana 8 |

---

## 5. Métricas de Adoção da Mudança

| Métrica | Semana 4 | Semana 8 | Semana 12 |
|---|---|---|---|
| % equipe treinada | 50% | 100% | 100% |
| % processos com SOP | 30% | 80% | 100% |
| Retrabalho (% vs linha base) | -10% | -25% | -40% |
| Resistência ativa | Alta | Média | Baixa |
| NPS interno | [baseline] | [+X] | [meta] |

---

## 6. Plano de Contingência (se resistência for alta)

| Cenário | Sinal | Resposta |
|---|---|---|
| Sabotagem passiva | Processos voltando ao antigo | Reunião 1:1 + reforço positivo |
| Abandono do projeto | CEO desengajado | Mostrar ROI parcial em dados |
| Conflito interno | Equipe dividida | Mediação + ajuste do processo |

---

TÍTULO: Change Management — ${change} | ${client_}
CONTEXTO: Gestão da mudança na implementação de ${change.replace(/_/g, ' ')}
DADOS ANALISADOS: Stakeholders, resistências, gaps de capacidade
PROBLEMA IDENTIFICADO: Mudança sem gestão de pessoas tem 70% de chance de falhar
EVIDÊNCIA: Resistência de equipe é o principal motivo de falha em projetos Lean
IMPACTO: Sem gestão de mudança, o projeto tende a regredir após 3-6 meses
RECOMENDAÇÃO: Iniciar comunicação na semana 1 antes de qualquer mudança técnica
AÇÃO SUGERIDA: Reunião com CEO para alinhamento de visão e comunicado para equipe
PRIORIDADE: Alta
ESFORÇO: Médio
ROI ESPERADO: +60% de sustentação dos resultados no longo prazo
RISCO DE NÃO AGIR: Projeto tecnicamente bem feito mas rejeitado pela equipe
PRAZO: 12 semanas de acompanhamento
MÉTRICA DE SUCESSO: 100% da equipe treinada + SOP documentado + melhoria sustentada 3 meses
PRÓXIMO PASSO: Agendar reunião com liderança para criar urgência e visão compartilhada`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Change management plan generated');

  const safeChange = change.replace(/\s+/g, '_');
  fs.writeFileSync(path.join(chgDir, `change_plan_${safeChange}.md`), reportMD);
  fs.writeFileSync(path.join(chgDir, 'metadata.json'), JSON.stringify({ date: taskDate, change, client: client_ }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Change Management Plan: ${path.join(chgDir, `change_plan_${safeChange}.md`)}`);
  appendLog('change_management complete ✓');
}

runChangeManagement().catch(err => {
  console.error('Change Management error:', err.message);
  process.exit(1);
});
