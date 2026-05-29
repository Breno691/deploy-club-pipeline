require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')  || 'experiment';
const taskDate  = get('--date')  || new Date().toISOString().split('T')[0];
const area      = get('--area')  || 'landing_page';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const expDir    = path.join(outputDir, 'experimentation');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'experimentation.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runExperimentationAgent() {
  console.log(`\nExperimentation Agent — SmartOps IA`);
  console.log(`Área: ${area} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [expDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('experimentation_agent started');

  const leads   = readJsonSafe('data/leads.json') || [];
  const clients = readJsonSafe('data/clients.json') || [];

  console.log('  → Desenhando experimentos A/B e calculando impacto esperado...');
  appendLog(`Generating experimentation plan for: ${area}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Experimentation Agent da SmartOps IA. Desenha e acompanha testes A/B rigorosos para aumentar conversão, engajamento e receita. Cada experimento tem hipótese clara, critério de sucesso definido e impacto estimado em receita.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Área de teste:** ${area.replace(/_/g, ' ')}
**Data:** ${taskDate}
**Leads ativos:** ${leads.length} | **Clientes:** ${clients.length}

---

# Experimentation Plan — SmartOps IA
**${taskDate}**

---

## 1. Backlog de Experimentos Priorizados

### Critério de Priorização: ICE Score
- **Impact** (1-10): impacto esperado na métrica principal
- **Confidence** (1-10): confiança na hipótese
- **Ease** (1-10): facilidade de implementar

| # | Experimento | Métrica | Impact | Confidence | Ease | ICE Score |
|---|---|---|---|---|---|---|
| 1 | [experimento A] | Conversão LP | 9 | 7 | 8 | **8.0** |
| 2 | [experimento B] | CTR botão WhatsApp | 8 | 8 | 7 | **7.7** |
| 3 | [experimento C] | Abertura de email | 7 | 6 | 9 | **7.3** |
| 4 | [experimento D] | Engajamento post | 6 | 7 | 8 | **7.0** |

---

## 2. Experimento Ativo #1 — ${area.replace(/_/g, ' ').toUpperCase()}

### Hipótese
> "Se mudarmos [elemento X], então [métrica Y] vai aumentar [Z]% porque [razão baseada em dados ou princípio de persuasão]."

**Elemento testado:** [título da LP / CTA / headline / imagem]
**Variante A (controle):** [situação atual]
**Variante B (tratamento):** [mudança proposta]

### Setup do Teste

| Parâmetro | Valor |
|---|---|
| Métrica primária | Taxa de conversão (visita → lead) |
| Métrica secundária | CTR do botão CTA |
| Duração mínima | 14 dias |
| Amostra mínima por variante | 200 visitantes |
| Confiança estatística mínima | 95% |
| Segmentação | Todos os visitantes orgânicos |

### Cálculo de Impacto

\`\`\`
Taxa atual de conversão: [X]%
Visitantes/mês: [N]
Leads atuais/mês: N × X% = [leads]

Se teste elevar conversão para [X+3]%:
Leads adicionais/mês: N × 3% = [delta leads]
Taxa de fechamento: 25%
Novos clientes/mês: [delta leads × 25%]
Receita adicional/mês: [clientes × ticket médio R$ 15k]
\`\`\`

---

## 3. Experimentos a Lançar Este Mês

### Experimento A — Headline da Landing Page
**Hipótese:** Headline com dado específico converte mais que headline genérica
- Controle: "Consultoria Lean Six Sigma para sua empresa"
- Tratamento: "Reduza 30% dos custos operacionais em 4 semanas"
- Duração: 14 dias | Impacto esperado: +2-4% na conversão

### Experimento B — CTA do Botão WhatsApp
**Hipótese:** CTA com benefício específico tem CTR maior que CTA genérico
- Controle: "Fale Conosco"
- Tratamento: "Quero meu Diagnóstico Gratuito →"
- Duração: 14 dias | Impacto esperado: +30-50% no CTR

### Experimento C — Prova Social
**Hipótese:** Mostrar número de diagnósticos realizados aumenta confiança e conversão
- Controle: Sem contador
- Tratamento: "+47 diagnósticos realizados em BH"
- Duração: 21 dias | Impacto esperado: +1-2% na conversão

### Experimento D — Formulário vs WhatsApp
**Hipótese:** Formulário converte mais leads qualificados que link direto para WhatsApp
- Controle: Link WhatsApp direto
- Tratamento: Formulário de 3 campos (nome, empresa, problema principal)
- Duração: 30 dias | Impacto esperado: Leads de qualidade superior

---

## 4. Resultados dos Experimentos Anteriores

| Experimento | Resultado | Aprendizado | Ação |
|---|---|---|---|
| [exp passado] | [resultado] | [insight] | [implementado?] |

*(Registrar resultados aqui conforme testes completarem)*

---

## 5. Calendário de Experimentos (próximos 90 dias)

| Mês | Experimento | Área | Impacto Esperado |
|---|---|---|---|
| Jun 2026 | Headline LP + CTA WhatsApp | Site | +3% conversão |
| Jul 2026 | Prova social + formulário | Site | +2% conversão |
| Ago 2026 | Hook dos posts Instagram | Conteúdo | +40% engajamento |

---

TÍTULO: Experimentation Plan — ${area} ${taskDate}
CONTEXTO: Testes A/B para aumentar conversão e engajamento SmartOps IA
DADOS ANALISADOS: Taxa de conversão atual, CTR, engajamento, funil de leads
PROBLEMA IDENTIFICADO: Conversão pode ser otimizada sistematicamente com dados
EVIDÊNCIA: Pequenas mudanças de CTA e headline têm impacto direto em conversão
IMPACTO: +R$ 15-45k/mês se elevar conversão em 2-3%
RECOMENDAÇÃO: Iniciar com experimento B (CTA) por ser mais fácil e rápido
AÇÃO SUGERIDA: Lançar experimento B (CTA WhatsApp) hoje
PRIORIDADE: Alta
ESFORÇO: Baixo
ROI ESPERADO: Cada 1% de conversão a mais = +1-2 leads/mês
RISCO DE NÃO AGIR: Continuar com versão não otimizada indefinidamente
PRAZO: 14 dias para primeiro resultado
MÉTRICA DE SUCESSO: Experimento A/B com 95% confiança estatística
PRÓXIMO PASSO: Implementar variante B do CTA WhatsApp e medir por 14 dias`,
    }],
  });

  const reportMD = resp.content[0].text.trim();
  appendLog('Experimentation plan generated');

  fs.writeFileSync(path.join(expDir, 'experimentation_plan.md'), reportMD);
  fs.writeFileSync(path.join(expDir, 'metadata.json'), JSON.stringify({ date: taskDate, area }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Experimentation Plan: ${path.join(expDir, 'experimentation_plan.md')}`);
  appendLog('experimentation_agent complete ✓');
}

runExperimentationAgent().catch(err => {
  console.error('Experimentation Agent error:', err.message);
  process.exit(1);
});
