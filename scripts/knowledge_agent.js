require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName    = get('--task')    || 'knowledge';
const taskDate    = get('--date')    || new Date().toISOString().split('T')[0];
const process_    = get('--process') || 'consultoria_lean';
const sector      = get('--sector')  || 'manufatura';
const outputDir   = path.join('outputs', `${taskName}_${taskDate}`);
const kmDir       = path.join(outputDir, 'knowledge');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'knowledge_agent.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runKnowledgeAgent() {
  console.log(`\nKnowledge Management Agent — SmartOps IA`);
  console.log(`Processo: ${process_} | Setor: ${sector}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [kmDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('knowledge_agent started');

  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const salesPlaybook = readFileSafe('knowledge/sales_playbook.md');

  console.log('  → Gerando SOP e playbook...');
  appendLog(`Generating SOP for process: ${process_}`);

  const client = new Anthropic();

  const sopResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Knowledge Management Agent da SmartOps IA. Cria SOPs (Procedimentos Operacionais Padrão) e playbooks para processos recorrentes da consultoria.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Processo a documentar:** ${process_}
**Setor do cliente:** ${sector}
**Data:** ${taskDate}

## BRAND IDENTITY
${brandIdentity.slice(0, 500) || '(não disponível)'}

---

## TASK — Criar SOP Completo

Gere o SOP em Markdown:

# SOP — ${process_.replace(/_/g, ' ').toUpperCase()}
**SmartOps IA | Versão 1.0 | ${taskDate}**

---

## 1. Objetivo
[O que este processo entrega e qual valor gera para o cliente]

## 2. Escopo
- **Aplicável a:** [tipos de empresa/setor]
- **Responsável:** Breno Luiz (Consultor Líder)
- **Duração típica:** [X semanas/dias]

## 3. Pré-requisitos
[O que precisa estar pronto antes de iniciar este processo]
- Acesso a dados de: [lista]
- Ferramentas necessárias: [lista]
- Informações do cliente: [lista]

## 4. Etapas do Processo

### Etapa 1 — [Nome]
**Duração:** [X dias/horas]
**Responsável:** Breno
**Ação:**
1. [passo 1 detalhado]
2. [passo 2]
3. [passo 3]
**Entregável:** [o que é gerado ao final desta etapa]
**Critério de conclusão:** [como saber que está pronto]

### Etapa 2 — [Nome]
[mesma estrutura]

### Etapa 3 — [Nome]
[mesma estrutura]

## 5. Checklist de Qualidade

**Antes de entregar ao cliente, verificar:**
- [ ] [critério 1]
- [ ] [critério 2]
- [ ] [critério 3]
- [ ] Formato SmartOps IA (8 perguntas + 10 elementos) usado

## 6. Perguntas Frequentes do Cliente

| Pergunta | Resposta Padrão |
|---|---|
| [pergunta comum] | [resposta] |

## 7. Métricas de Sucesso do Processo

| Métrica | Target | Como Medir |
|---|---|---|
| Satisfação do cliente | ≥ 4.5/5 | NPS pós-projeto |
| Prazo de entrega | ≤ [X dias] | Data início → entrega |
| ROI documentado | ≥ 3x | Antes/depois em 90 dias |

## 8. Lições Aprendidas

[Espaço para registrar aprendizados após cada execução]

## 9. Histórico de Versões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | ${taskDate} | Versão inicial |`,
    }],
  });

  const sopMD = sopResp.content[0].text.trim();
  appendLog('SOP generated');

  const playbookResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é o Knowledge Management Agent da SmartOps IA.

Gere um Playbook de Execução rápido (cheatsheet) para o processo "${process_}" no setor "${sector}":

# Playbook Rápido — ${process_.replace(/_/g, ' ')}
**SmartOps IA | ${taskDate}**

## Checklist de Abertura de Projeto

- [ ] Entendimento do problema principal
- [ ] Dados disponíveis mapeados
- [ ] Stakeholders identificados
- [ ] Cronograma definido

## Scripts de Comunicação

**Primeira reunião:**
[template de agenda + abertura]

**Alinhamento semanal:**
[template]

**Entrega de resultados:**
[template]

## Ferramentas e Templates

| Ferramenta | Quando Usar | Link/Comando |
|---|---|---|
| CEO Advisor | Briefing semanal | npm run ceo |
| Risk Agent | Alertas de risco | npm run risk |
| Proposal Agent | Nova proposta | npm run proposal |

## Red Flags — Sinais de Alerta do Cliente

[Situações que exigem ação imediata durante o projeto]

## Arquivos Padrão SmartOps IA

[Lista de documentos que sempre devem ser criados e entregues]`,
    }],
  });

  const playbookMD = playbookResp.content[0].text.trim();
  appendLog('Playbook generated');

  fs.writeFileSync(path.join(kmDir, `sop_${process_}.md`), sopMD);
  fs.writeFileSync(path.join(kmDir, `playbook_${process_}.md`), playbookMD);
  fs.writeFileSync(path.join(kmDir, 'index.json'), JSON.stringify({
    date: taskDate,
    process: process_,
    sector,
    files: [`sop_${process_}.md`, `playbook_${process_}.md`],
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ SOP: ${path.join(kmDir, `sop_${process_}.md`)}`);
  console.log(`  ✓ Playbook: ${path.join(kmDir, `playbook_${process_}.md`)}`);

  appendLog('knowledge_agent complete ✓');
}

runKnowledgeAgent().catch(err => {
  console.error('Knowledge Agent error:', err.message);
  process.exit(1);
});
