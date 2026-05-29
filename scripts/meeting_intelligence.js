require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName   = get('--task')   || 'meeting_intel';
const taskDate   = get('--date')   || new Date().toISOString().split('T')[0];
const clientName = get('--client') || 'Prospect';
const notesFile  = get('--notes')  || null;
const outputDir  = path.join('outputs', `${taskName}_${taskDate}`);
const mtgDir     = path.join(outputDir, 'meeting_intelligence');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'meeting_intelligence.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runMeetingIntelligence() {
  console.log(`\nMeeting Intelligence Agent — SmartOps IA`);
  console.log(`Cliente: ${clientName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [mtgDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('meeting_intelligence started');

  const meetingNotes = notesFile ? readFileSafe(notesFile) : '';
  const salesPlaybook = readFileSafe('knowledge/sales_playbook.md');
  const personas      = readFileSafe('knowledge/customer_personas.md');

  console.log('  → Analisando reunião e extraindo insights, objeções e próximos passos...');
  appendLog(`Analyzing meeting with: ${clientName}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Meeting Intelligence Agent da SmartOps IA. Analisa reuniões de diagnóstico e vendas para extrair objeções, insights sobre o cliente, probabilidade de fechamento e o melhor próximo passo.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Cliente/Prospect:** ${clientName}
**Data da reunião:** ${taskDate}

${meetingNotes ? `## NOTAS DA REUNIÃO:\n${meetingNotes}` : '## NOTAS DA REUNIÃO:\n[Nenhuma nota fornecida — gerar template de análise]'}

${salesPlaybook ? `## SALES PLAYBOOK (referência):\n${salesPlaybook.slice(0, 600)}` : ''}

---

# Meeting Intelligence Report — ${clientName}
**${taskDate}**

---

## 1. Resumo Executivo da Reunião

**Cliente:** ${clientName}
**Duração:** [X] minutos
**Tipo:** [Diagnóstico Gratuito / Follow-up / Proposta / Negociação]
**Resultado:** [Positivo / Neutro / Negativo]
**Próximo passo acordado:** [ação]
**Prazo:** [data]

---

## 2. Perfil do Cliente (extraído da reunião)

| Atributo | Informação |
|---|---|
| Cargo/Função | [dono/gestor/CEO] |
| Empresa | [nome + segmento] |
| Nº de funcionários | [X] |
| Faturamento estimado | R$ [X]/mês |
| Processo com mais problema | [área] |
| Já tentou resolver? | [Sim/Não — como] |
| Urgência | [Alta/Média/Baixa] |
| Tomador de decisão | [Ele/Outros envolvidos] |
| Persona SmartOps | [Carlos/Roberto/Ana/Paulo] |

---

## 3. Mapa de Objeções

| Objeção Levantada | Tipo | Como Foi Respondida | Status |
|---|---|---|---|
| "É caro" | Preço | [resposta usada] | [Resolvida/Pendente] |
| "Não tenho tempo" | Prioridade | | |
| "Já tentamos isso antes" | Ceticismo | | |
| "Preciso pensar" | Indecisão | | |
| [outra objeção] | | | |

**Objeção principal não resolvida:** [objeção + estratégia para próxima conversa]

---

## 4. Sinais de Compra Detectados

### Sinais Positivos ✅
- [sinal 1: ex. "ele perguntou sobre prazo de implementação"]
- [sinal 2: ex. "mencionou quanto custa o problema atual"]
- [sinal 3: ex. "pediu para ver uma proposta"]

### Sinais de Alerta ⚠️
- [alerta 1: ex. "não soube responder sobre o orçamento"]
- [alerta 2: ex. "envolveu mais pessoas na decisão"]

---

## 5. Score de Fechamento

| Critério GPCTBA | Respondido? | Score |
|---|---|---|
| Goals (quais são os objetivos?) | [S/N] | [0-10] |
| Plans (tem plano para atingir?) | [S/N] | [0-10] |
| Challenges (quais obstáculos?) | [S/N] | [0-10] |
| Timeline (qual prazo?) | [S/N] | [0-10] |
| Budget (tem orçamento?) | [S/N] | [0-10] |
| Authority (decide sozinho?) | [S/N] | [0-10] |

**Score Total:** [X]/60
**Probabilidade de fechamento:** [X]%
**Prazo provável:** [X semanas]

---

## 6. Plano de Follow-up

### Próxima mensagem (enviar em [X] horas)

**Canal:** WhatsApp / Email
**Objetivo:** [manter momentum / superar objeção / enviar proposta]

**Template de mensagem:**
\`\`\`
Olá [nome], foi um prazer conversar hoje!

Conforme alinhamos, vou [ação combinada] até [prazo].

Enquanto isso, [valor adicional — ex. artigo relevante, dado, case].

Qualquer dúvida, pode me chamar aqui. 🤝
Breno
\`\`\`

### Cronograma de follow-up

| Dia | Ação | Canal | Objetivo |
|---|---|---|---|
| D+1 | Enviar resumo da reunião | WhatsApp | Manter engajamento |
| D+3 | Enviar case relevante | WhatsApp | Aumentar confiança |
| D+5 | Enviar proposta (se pedida) | Email | Avançar |
| D+7 | Follow-up da proposta | WhatsApp | Superar objeções |
| D+14 | Decisão final | Ligação | Fechar |

---

## 7. Aprendizados para a Equipe de Vendas

**O que funcionou nessa reunião:**
[tática, abordagem ou pergunta que gerou resultado]

**O que pode melhorar:**
[ponto de melhoria específico para a próxima reunião]

**Insight sobre esse perfil de cliente:**
[aprendizado que se aplica a outros leads similares]

---

TÍTULO: Meeting Intelligence — ${clientName} ${taskDate}
CONTEXTO: Análise da reunião de ${taskDate} com ${clientName}
DADOS ANALISADOS: Notas da reunião, objeções, sinais de compra, GPCTBA
PROBLEMA IDENTIFICADO: [principal obstáculo ao fechamento]
EVIDÊNCIA: [dado da reunião que comprova]
IMPACTO: Ticket potencial: R$ [X]
RECOMENDAÇÃO: [melhor próximo passo para fechar]
AÇÃO SUGERIDA: [ação específica nas próximas 24h]
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: R$ [ticket] se fechar em [prazo]
RISCO DE NÃO AGIR: Lead esfria e fecha com concorrente
PRAZO: [X] dias para decisão
MÉTRICA DE SUCESSO: Proposta enviada + reunião de fechamento agendada
PRÓXIMO PASSO: [ação nas próximas 2 horas]`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Meeting intelligence report generated');

  const safeClient = clientName.replace(/\s+/g, '_').toLowerCase();
  fs.writeFileSync(path.join(mtgDir, `meeting_${safeClient}_${taskDate}.md`), reportMD);
  fs.writeFileSync(path.join(mtgDir, 'metadata.json'), JSON.stringify({
    date: taskDate, client: clientName, notesFile,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Meeting Report: ${path.join(mtgDir, `meeting_${safeClient}_${taskDate}.md`)}`);
  appendLog('meeting_intelligence complete ✓');
}

runMeetingIntelligence().catch(err => {
  console.error('Meeting Intelligence error:', err.message);
  process.exit(1);
});
