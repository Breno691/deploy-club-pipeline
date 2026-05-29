require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'org_learn';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const period    = get('--period') || 'mensal';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const olDir     = path.join(outputDir, 'organizational_learning');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'org_learning.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

function findLatestReport(prefix, subdir, file) {
  const base = 'outputs';
  if (!fs.existsSync(base)) return '';
  const dirs = fs.readdirSync(base).filter(d => d.startsWith(prefix)).sort().reverse();
  return dirs[0] ? readFileSafe(path.join(base, dirs[0], subdir, file)) : '';
}

async function runOrganizationalLearning() {
  console.log(`\nOrganizational Learning Agent — SmartOps IA`);
  console.log(`Período: ${period} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [olDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('organizational_learning started');

  const clients     = readJsonSafe('data/clients.json') || [];
  const leads       = readJsonSafe('data/leads.json') || [];
  const riskReport  = findLatestReport('risk', 'risks', 'risk_report.md');
  const ceoReport   = findLatestReport('ceo', 'ceo', 'executive_action_plan.md');
  const salesReport = findLatestReport('sales', 'sales', 'sales_intelligence_report.md');

  console.log('  → Consolidando aprendizados e gerando knowledge base atualizada...');
  appendLog('Generating organizational learning report...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Organizational Learning Agent da SmartOps IA. Captura aprendizados de projetos, reuniões, erros e acertos, e transforma tudo em conhecimento institucional reutilizável.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Período de análise:** ${period}
**Data:** ${taskDate}

## DADOS DO PERÍODO
- Clientes ativos: ${clients.length}
- Leads no pipeline: ${leads.length}
${riskReport ? `### Riscos Identificados:\n${riskReport.slice(0, 500)}` : ''}
${salesReport ? `### Intelligence de Vendas:\n${salesReport.slice(0, 500)}` : ''}

---

# Organizational Learning Report — SmartOps IA
**${period.toUpperCase()} | ${taskDate}**

---

## 1. O Que Aprendemos Este Período

### Aprendizados de Vendas

| Aprendizado | Contexto | Como Aplicar |
|---|---|---|
| [aprendizado 1] | [situação] | [ação futura] |
| [aprendizado 2] | | |
| [aprendizado 3] | | |

### Aprendizados de Projetos

| Aprendizado | Projeto | Impacto | Como Evitar/Replicar |
|---|---|---|---|
| [aprendizado] | [projeto] | [resultado] | [ação] |

### Aprendizados de Marketing/Conteúdo

| Aprendizado | Contexto | Aplicar Como |
|---|---|---|
| [aprendizado] | [situação] | [ação] |

---

## 2. Erros e Acertos — Retrospectiva

### ✅ O Que Funcionou Bem

1. **[Acerto 1]** — [descrição + por que funcionou + como replicar]
2. **[Acerto 2]** — [descrição]
3. **[Acerto 3]** — [descrição]

### ❌ O Que Não Funcionou

1. **[Erro 1]** — [descrição + causa raiz + como evitar no futuro]
2. **[Erro 2]** — [descrição]
3. **[Erro 3]** — [descrição]

---

## 3. Padrões Identificados

### Padrão de Cliente Ideal (atualizado)

Baseado nos clientes deste período:
- **Setor com maior aderência:** [setor]
- **Problema mais comum:** [problema]
- **Objeção mais recorrente:** [objeção] → **melhor resposta:** [resposta]
- **Canal de aquisição mais eficiente:** [canal]
- **Semana mais crítica do projeto:** semana [X] — [por quê]

### Padrão de Projeto de Sucesso

\`\`\`
Semana 1-2: Diagnóstico profundo com dados reais
Semana 3:   Quick win visível (resultado rápido = confiança)
Semana 4-6: Implementação das melhorias principais
Semana 7-8: Treinamento da equipe + SOP
Semana 9-10: Medição de resultados + documentação
→ Resultado: -30% lead time, -20% retrabalho, NPS > 8
\`\`\`

### Padrão de Projeto com Problema

\`\`\`
Sinal de alerta semana 2: cliente não aparece na reunião
→ Ação: ligação imediata + replanejar escopo
Sinal de alerta semana 4: equipe não está usando novo processo
→ Ação: Change Management Agent + treino adicional
Sinal de alerta semana 6: resultado abaixo do esperado
→ Ação: Revisão de causa raiz + ajuste de solução
\`\`\`

---

## 4. Atualização da Base de Conhecimento

### Novos SOPs a Criar Este Mês

| SOP | Processo | Por Que Criar | Quem Usa |
|---|---|---|---|
| SOP-001 | Diagnóstico inicial (30min) | Padronizar coleta de dados | Breno |
| SOP-002 | Follow-up de proposta | Aumentar taxa de fechamento | Breno |
| SOP-003 | Onboarding de novo cliente | Reduzir tempo de setup | Breno + cliente |
| SOP-004 | Medição de resultados Lean | Consistência de métricas | Breno + equipe cliente |

### Atualizar Knowledge Files

| Arquivo | O Que Atualizar | Prazo |
|---|---|---|
| knowledge/sales_playbook.md | Novos scripts para objeção "[objeção]" | Esta semana |
| knowledge/customer_personas.md | Novo padrão identificado em [setor] | Esta semana |
| knowledge/product_campaign.md | Case de resultado [X] adicionado | Esta semana |

---

## 5. Decisões e Por Que Tomamos

| Decisão | Data | Contexto | Resultado Esperado |
|---|---|---|---|
| [decisão] | [data] | [contexto] | [resultado] |

*(Registrar decisões importantes aqui para referência futura)*

---

## 6. Perguntas Abertas (para próxima retrospectiva)

1. [pergunta estratégica não respondida]
2. [incerteza sobre o mercado ou produto]
3. [hipótese a validar]

---

TÍTULO: Organizational Learning — ${period} ${taskDate}
CONTEXTO: Retrospectiva e captura de aprendizados do período
DADOS ANALISADOS: Projetos, vendas, marketing, erros e acertos
PROBLEMA IDENTIFICADO: Conhecimento gerado precisa ser sistematicamente capturado
EVIDÊNCIA: Padrões repetidos sem documentação = erros recorrentes
IMPACTO: Knowledge base atualizada = projetos mais eficientes + vendas melhores
RECOMENDAÇÃO: Fazer retrospectiva mensal e atualizar knowledge files
AÇÃO SUGERIDA: Criar SOP-001 (diagnóstico inicial) esta semana
PRIORIDADE: Média
ESFORÇO: Baixo
ROI ESPERADO: -30% tempo em projetos similares com SOPs documentados
RISCO DE NÃO AGIR: Reinventar a roda a cada novo projeto
PRAZO: Mensal
MÉTRICA DE SUCESSO: 4 SOPs criados + knowledge files atualizados mensalmente
PRÓXIMO PASSO: Escrever SOP do diagnóstico inicial (o processo mais repetido)`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Organizational learning report generated');

  fs.writeFileSync(path.join(olDir, `org_learning_${period}_${taskDate}.md`), reportMD);
  fs.writeFileSync(path.join(olDir, 'metadata.json'), JSON.stringify({ date: taskDate, period }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Organizational Learning: ${path.join(olDir, `org_learning_${period}_${taskDate}.md`)}`);
  appendLog('organizational_learning complete ✓');
}

runOrganizationalLearning().catch(err => {
  console.error('Organizational Learning error:', err.message);
  process.exit(1);
});
