require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')   || 'expand';
const taskDate  = get('--date')   || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const expDir    = path.join(outputDir, 'client_expansion');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'client_expansion.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runClientExpansion() {
  console.log(`\nClient Expansion Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [expDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('client_expansion started');

  const clients       = readJsonSafe('data/clients.json') || [];
  const financialData = readJsonSafe('data/financial_data.json') || {};
  const salesPlaybook = readFileSafe('knowledge/sales_playbook.md');

  console.log(`  → Identificando oportunidades de expansão em ${clients.length} clientes ativos...\n`);
  appendLog(`Analyzing expansion opportunities for ${clients.length} clients...`);

  const clientsContext = clients.length > 0
    ? clients.map((c, i) => `Cliente ${i+1}: ${JSON.stringify(c)}`).join('\n')
    : 'Nenhum cliente ativo ainda. Gerar framework de expansão para uso futuro.';

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Client Expansion Agent da SmartOps IA. Identifica oportunidades de upsell e cross-sell em clientes ativos, maximizando LTV e receita recorrente sem custo de aquisição adicional.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Data:** ${taskDate}
**Clientes ativos:** ${clients.length}
**Receita mensal atual:** R$ ${financialData.receita_total || 0}

## CLIENTES ATIVOS
${clientsContext}

---

# Client Expansion Report — SmartOps IA
**${taskDate}**

---

## 1. Matriz de Expansão por Cliente

${clients.length > 0 ? `
| Cliente | Projeto Atual | Semana | Satisfação Est. | Upsell Potencial | Receita Potencial |
|---|---|---|---|---|---|
${clients.map(c => `| ${c.nome || '-'} | ${c.projeto || '-'} | ${c.semana || '-'} | [estimar] | [identificar] | R$ [X] |`).join('\n')}
` : `
*(Nenhum cliente ativo ainda. Framework criado para uso quando clientes forem adicionados a data/clients.json)*
`}

---

## 2. Oportunidades de Upsell por Perfil

### Após Projeto Lean (VSM + Quick Wins)
**Próximo passo natural:** Six Sigma no processo principal
- Timing ideal: semana 6-8 do projeto Lean
- Pitch: "Agora que mapeamos e eliminamos os desperdícios, podemos usar Six Sigma para eliminar os defeitos que restam"
- Ticket adicional: R$ 15-25k
- Probabilidade: 60% se o cliente está satisfeito

### Após Six Sigma (DMAIC)
**Próximo passo natural:** Automação do processo melhorado
- Timing ideal: semana 8-10 do projeto
- Pitch: "Com o processo otimizado, automatizar agora tem ROI de 3x em 6 meses"
- Ticket adicional: R$ 8-20k (projeto) + R$ 2-5k/mês (manutenção)
- Probabilidade: 70% se conseguiu resultados mensuráveis

### Após qualquer projeto bem-sucedido
**Próximo passo natural:** Retainer mensal de acompanhamento
- Timing ideal: semana 10-12 (fim do projeto)
- Pitch: "Para sustentar os resultados e expandir para outras áreas"
- Ticket adicional: R$ 3-8k/mês recorrente
- Probabilidade: 40% geral, 80% se NPS > 8

---

## 3. Plano de Expansão por Cliente

${clients.length > 0 ? clients.map(c => `
### ${c.nome || 'Cliente'} — Semana ${c.semana || '?'} do Projeto ${c.projeto || '?'}

**Situação atual:** Projeto em andamento
**Satisfação estimada:** [alta/média — baseado no andamento]
**Próxima oportunidade:** [upsell identificado]
**Pitch ideal:** "[mensagem específica baseada no projeto]"
**Timing:** [quando abordar]
**Probabilidade:** [X]%
**Receita potencial:** R$ [X]
`).join('') : `
*(Adicionar clientes em data/clients.json para análise personalizada)*
`}

---

## 4. Estratégia de Retenção

### Sinais de Risco de Churn

| Sinal | O Que Significa | Ação Imediata |
|---|---|---|
| Sem reunião há 2 semanas | Desengajamento | Ligar e verificar progresso |
| Não responde WhatsApp em 48h | Problema oculto | Visita presencial |
| Resultado abaixo do prometido | Risco alto | Replanejar entregas + oferecer compensação |
| Mencionou corte de custos | Risco financeiro | Mostrar ROI do projeto em números |

### Check-in Proativo (mensagem semanal)

**Template:**
\`\`\`
Olá [nome], semana [X] do projeto!

🎯 Esta semana: [entrega da semana]
📊 Resultado parcial: [dado de progresso]
🔜 Próxima semana: [o que vem por aí]

Alguma dúvida ou algo que posso antecipar?
Breno
\`\`\`

---

## 5. Expansão para Indicações

### Clientes com Maior Potencial de Indicação

Os clientes mais satisfeitos (semana 8+ do projeto com bons resultados) devem ser abordados para:

1. **Depoimento em vídeo** (2 minutos): ROI do projeto
2. **Post no LinkedIn** (co-autoria): "Como reduzimos X com Lean"
3. **Indicação de outro gestor** da rede: "Você conhece algum sócio com problema similar?"

**Script de abordagem:**
\`\`\`
"[Nome], você foi um dos clientes que mais evoluiu com a metodologia.
Você toparia gravar um rápido vídeo ou post sobre o resultado?
Pode ajudar outros empresários de BH a tomarem a mesma decisão que você tomou."
\`\`\`

---

## 6. Forecast de Expansão (próximos 90 dias)

| Oportunidade | Cliente | Valor | Probabilidade | Receita Esperada |
|---|---|---|---|---|
| Retainer pós-projeto | [cliente] | R$ 5k/mês | 50% | R$ 2.500/mês |
| Upsell Six Sigma | [cliente] | R$ 20k | 40% | R$ 8.000 |
| Novo projeto mesma empresa | [cliente] | R$ 15k | 30% | R$ 4.500 |
| **Total forecast** | | | | **R$ [X]** |

---

TÍTULO: Client Expansion — ${taskDate}
CONTEXTO: Oportunidades de upsell e retenção em ${clients.length} clientes SmartOps IA
DADOS ANALISADOS: Status de projetos, semana do projeto, histórico de serviços
PROBLEMA IDENTIFICADO: ${clients.length === 0 ? 'Nenhum cliente ativo ainda' : 'Oportunidades de expansão não estruturadas'}
EVIDÊNCIA: ${clients.length} clientes ativos | receita recorrente: R$ ${financialData.receita_recorrente || 0}
IMPACTO: +R$ 5-15k/mês por cliente retido como retainer
RECOMENDAÇÃO: ${clients.length > 0 ? 'Abordar cliente mais avançado para proposta de retainer' : 'Fechar primeiro cliente para ativar este agente'}
AÇÃO SUGERIDA: ${clients.length > 0 ? 'Enviar proposta de retainer para cliente mais antigo' : 'Popular data/clients.json quando fechar primeiro cliente'}
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: Custo de expansão é 5x menor que novo cliente
RISCO DE NÃO AGIR: Perder cliente no final do projeto (churn)
PRAZO: Abordar na semana 8 de cada projeto
MÉTRICA DE SUCESSO: 50% dos clientes assinam retainer pós-projeto
PRÓXIMO PASSO: ${clients.length > 0 ? 'Identificar cliente mais próximo do fim do projeto' : 'Fechar primeiro cliente'}`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Client expansion report generated');

  fs.writeFileSync(path.join(expDir, 'client_expansion_report.md'), reportMD);
  fs.writeFileSync(path.join(expDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    total_clients: clients.length,
    receita_recorrente: financialData.receita_recorrente || 0,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Client Expansion Report: ${path.join(expDir, 'client_expansion_report.md')}`);
  console.log(`  ✓ ${clients.length} clientes analisados`);
  appendLog('client_expansion complete ✓');
}

runClientExpansion().catch(err => {
  console.error('Client Expansion error:', err.message);
  process.exit(1);
});
