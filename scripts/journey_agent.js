require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName = get('--task')    || 'journey';
const taskDate = get('--date')    || new Date().toISOString().split('T')[0];
const persona  = get('--persona') || 'dono_pme';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const journeyDir = path.join(outputDir, 'journey');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'journey.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runJourneyAgent() {
  console.log(`\nCustomer Journey Agent — SmartOps IA`);
  console.log(`Persona: ${persona} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [journeyDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('journey_agent started');

  const brandIdentity   = readFileSafe('knowledge/brand_identity.md');
  const personas        = readFileSafe('knowledge/customer_personas.md');
  const contentStrategy = readFileSafe('knowledge/content_strategy.md');
  const leads           = readJsonSafe('data/leads.json') || [];

  console.log('  → Mapeando jornada do cliente visitante → contratante...');
  appendLog(`Mapping journey for persona: ${persona}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Customer Journey Agent da SmartOps IA. Mapeia a jornada completa do cliente desde o primeiro contato até a contratação e expansão.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Persona em análise:** ${persona.replace(/_/g, ' ')}
**Data:** ${taskDate}

## PERSONAS
${personas.slice(0, 700) || ''}

## BRAND IDENTITY
${brandIdentity.slice(0, 400) || ''}

## CONTENT STRATEGY
${contentStrategy.slice(0, 300) || ''}

---

## TASK — Mapa de Jornada do Cliente

# Customer Journey Map — ${persona.replace(/_/g, ' ')}
**SmartOps IA | ${taskDate}**

---

## 1. Perfil da Persona

**Nome fictício:** [Nome]
**Cargo:** [Dono/Diretor de PME]
**Empresa:** [Setor + tamanho típico]
**Principal dor:** [em 1 frase — o que o mantém acordado à noite]
**Objetivo:** [o que ele quer alcançar]
**Como descobre soluções:** [Google / LinkedIn / indicação / evento]

---

## 2. Jornada Completa — 5 Fases

### FASE 1 — DESCOBERTA (Visitante)
**Situação:** [persona ainda não conhece SmartOps IA]

| Elemento | Detalhe |
|---|---|
| Gatilho | [o que faz ele buscar solução] |
| Canais de busca | [Google, LinkedIn, WhatsApp grupo] |
| Palavras-chave usadas | [ex: "consultoria lean BH", "como reduzir retrabalho"] |
| Conteúdo que o atrai | [tipo de post / artigo que chama atenção] |
| Sentimento | Confuso / Curioso |

**Pontos de Atrito:**
- [o que pode afastar nesta fase]

**Ação de Melhoria:**
- [o que SmartOps IA pode fazer para capturar este visitante]

---

### FASE 2 — CONSIDERAÇÃO (Lead)
**Situação:** [persona conhece SmartOps IA mas ainda avalia]

| Elemento | Detalhe |
|---|---|
| Comportamento | [o que ele faz — lê posts, segue Instagram, visita site] |
| Dúvidas | [dúvidas típicas — funciona? é caro? tenho tempo?] |
| Comparação | [com quem compara SmartOps IA] |
| Gatilho para agir | [o que o faz dar o próximo passo] |
| Sentimento | Interessado / Inseguro |

**Pontos de Atrito:**
- [falta de prova social]
- [preço não claro]

**Ação de Melhoria:**
- [case study + depoimento + diagnóstico gratuito sem risco]

---

### FASE 3 — DECISÃO (Diagnóstico → Proposta)
**Situação:** [persona agendou diagnóstico ou pediu proposta]

| Elemento | Detalhe |
|---|---|
| Expectativa | [o que espera do diagnóstico] |
| Objeções típicas | [É caro / Não tenho tempo / Já tentamos] |
| Critérios de decisão | [resultado garantido / referências / preço] |
| Tempo médio de decisão | [dias] |
| Sentimento | Avaliando / Com medo de errar |

**Script de Diagnóstico:**
[Roteiro das 30 primeiras min — perguntas + demonstração de valor]

**Quebra de Objeções:**
| Objeção | Resposta |
|---|---|
| "É caro" | [ROI calculado] |
| "Vou pensar" | "O que precisa ficar mais claro?" |
| "Não tenho tempo" | "Faço o trabalho pesado, você aprova" |

---

### FASE 4 — ONBOARDING (Cliente Novo)
**Situação:** [contrato assinado — primeiras semanas]

| Semana | O que o cliente sente | O que SmartOps entrega | Ação de Sucesso |
|---|---|---|---|
| 1 | Ansioso / esperançoso | Diagnóstico completo | "Você fez certo em contratar" |
| 2 | Curioso / observando | VSM + prioridades | Primeiro quick win visível |
| 3-4 | Animado / testando | Implementação piloto | Resultado mensurável |
| 5-6 | Confiante | Resultado + treinamento | "Quando a gente continua?" |

---

### FASE 5 — EXPANSÃO (Cliente Recorrente)
**Situação:** [projeto concluído — oportunidade de upsell]

| Gatilho | Oferta | Momento |
|---|---|---|
| Pergunta "o que mais podemos melhorar?" | Próxima área / fase 2 | Semana 8-10 |
| Resultado acima da meta | Retainer mensal | Na entrega final |
| Problema novo identificado | Novo projeto | Após 30 dias |

---

## 3. Pontos de Atrito Críticos (Gargalos)

| Etapa | Atrito | Impacto | Solução |
|---|---|---|---|
| Descoberta → Lead | [falta de SEO/presença] | Alto | [conteúdo + Google Meu Negócio] |
| Lead → Reunião | [barreira de agendamento] | Alto | [Calendly/WhatsApp direto] |
| Reunião → Proposta | [proposta genérica] | Médio | [Proposal Agent personalizado] |
| Proposta → Contrato | [demora no follow-up] | Alto | [follow-up em 48h] |

---

## 4. Momentos de Encantamento (WOW Moments)

1. **[Momento 1]:** [o que fazer para surpreender neste ponto]
2. **[Momento 2]:** [pequeno gesto de alto impacto]
3. **[Momento 3]:** [entrega acima da expectativa]

---

## 5. Mapa de Comunicação por Fase

| Fase | Canal | Frequência | Conteúdo |
|---|---|---|---|
| Descoberta | Instagram + LinkedIn | 3x/semana | Educativo + autoridade |
| Consideração | WhatsApp + Email | 1x/semana | Cases + convite |
| Decisão | WhatsApp + Reunião | Ativa | Diagnóstico + proposta |
| Onboarding | WhatsApp + Reunião | Semanal | Progresso + resultados |
| Expansão | WhatsApp + Email | Mensal | ROI + próxima fase |`,
    }],
  });

  const journeyMD = resp.content[0].text.trim();
  appendLog('Journey map generated');

  const safePersona = persona.replace(/\s+/g, '_');
  fs.writeFileSync(path.join(journeyDir, `journey_${safePersona}.md`), journeyMD);
  fs.writeFileSync(path.join(journeyDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    persona,
    file: `journey_${safePersona}.md`,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Journey Map: ${path.join(journeyDir, `journey_${safePersona}.md`)}`);

  appendLog('journey_agent complete ✓');
}

runJourneyAgent().catch(err => {
  console.error('Journey Agent error:', err.message);
  process.exit(1);
});
