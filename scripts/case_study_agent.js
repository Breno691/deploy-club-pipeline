require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName   = get('--task')   || 'case_study';
const taskDate   = get('--date')   || new Date().toISOString().split('T')[0];
const clientName = get('--client') || 'Cliente SmartOps';
const sector     = get('--sector') || 'manufatura';
const dataFile   = get('--data')   || null;
const outputDir  = path.join('outputs', `${taskName}_${taskDate}`);
const csDir      = path.join(outputDir, 'case_study');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'case_study.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runCaseStudyAgent() {
  console.log(`\nCase Study Agent — SmartOps IA`);
  console.log(`Cliente: ${clientName} | Setor: ${sector}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [csDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('case_study_agent started');

  const brandIdentity = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const clientData = dataFile ? readFileSafe(dataFile) : null;

  console.log('  → Documentando caso antes/depois com ROI...');
  appendLog(`Generating case study for: ${clientName}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Case Study Agent da SmartOps IA. Documenta casos de sucesso com dados antes/depois e ROI real para usar como prova social nas vendas.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Cliente:** ${clientName}
**Setor:** ${sector}
**Data:** ${taskDate}

## DADOS DO PROJETO
${clientData || `[Dados não fornecidos — criar case study modelo para setor: ${sector}]

Cenário típico para ${sector}:
- Problema: processo manual com alto tempo de setup/troca
- Duração do projeto: 3 meses
- Resultados obtidos:
  • Redução de lead time: 35%
  • Eliminação de retrabalho: 60%
  • Economia mensal: R$ 8.000-15.000
  • ROI do projeto: 4x em 6 meses`}

## BRAND IDENTITY
${brandIdentity.slice(0, 400) || ''}

---

## TASK — Case Study Completo

# Case Study: ${clientName} + SmartOps IA
**Setor:** ${sector} | **Data:** ${taskDate}

---

## Resumo Executivo (para LinkedIn/proposta)
[2-3 frases impactantes com o resultado mais impressionante]

---

## O Contexto

### Quem é ${clientName}
[Perfil da empresa: tamanho, setor, tempo de mercado, desafio principal]

### O Desafio
[Descrição do problema em linguagem não técnica — o que o dono da empresa sentia]

---

## O Diagnóstico SmartOps IA

### Análise Inicial
[O que foi identificado no diagnóstico — dados, observações, desperdícios mapeados]

### Métricas ANTES

| Indicador | Valor Antes | Impacto no Negócio |
|---|---|---|
| Lead time médio | [X dias] | [Atraso nas entregas, cliente insatisfeito] |
| Retrabalho | [X%] | [Custo extra de R$ X/mês] |
| Tempo de setup | [X horas] | [Perda de X horas/semana] |
| Custo do problema | [R$ X/mês] | [Total anual: R$ X] |

---

## A Solução

### Metodologia Aplicada
[Lean, Six Sigma, Automação — o que foi usado e por quê]

### Implementação
**Fase 1 (Semanas 1-4):** [o que foi feito]
**Fase 2 (Semanas 5-8):** [o que foi feito]
**Fase 3 (Semanas 9-12):** [consolidação e treinamento]

---

## Os Resultados

### Métricas DEPOIS

| Indicador | Antes | Depois | Melhoria |
|---|---|---|---|
| Lead time médio | [X dias] | [Y dias] | **↓ X%** |
| Retrabalho | [X%] | [Y%] | **↓ X%** |
| Tempo de setup | [X horas] | [Y horas] | **↓ X%** |
| Economia mensal | — | [R$ X/mês] | **+R$ X/mês** |

### ROI do Projeto

| Item | Valor |
|---|---|
| Investimento total (projeto) | R$ [X] |
| Economia mensal gerada | R$ [X/mês] |
| Payback | [X meses] |
| ROI em 12 meses | **[X]x** |
| ROI em 24 meses | **[X]x** |

---

## O Que o Cliente Diz

> "[Depoimento do cliente — real ou template para substituir depois]"
> — [Nome, Cargo], ${clientName}

---

## Por Que Funcionou

1. **[Razão 1]:** [explicação]
2. **[Razão 2]:** [explicação]
3. **[Razão 3]:** [explicação]

---

## Próximos Passos para ${clientName}

[O que foi contratado na expansão ou o que seria a próxima fase]

---

## Para Empresas Similares

**Se você tem uma empresa de ${sector} e enfrenta [problema similar], a SmartOps IA pode entregar resultados equivalentes em 90 dias.**

📱 WhatsApp: (31) 97203-9180
📧 brenoluiz691@gmail.com

*Diagnóstico gratuito — sem compromisso.*`,
    }],
  });

  const caseMD = resp.content[0].text.trim();
  appendLog('Case study generated');

  const snippet = caseMD.split('\n').slice(0, 10).join('\n');
  const socialResp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Com base neste case study da SmartOps IA, crie 2 posts para LinkedIn:

POST 1 (curto — resultado em 1 linha):
[headline impactante] + [breve contexto] + [número principal] + CTA

POST 2 (storytelling — 150 palavras):
[início com dor do cliente] + [virada com SmartOps IA] + [resultado numérico] + CTA

CASE: ${caseMD.slice(0, 1000)}`,
    }],
  });

  const socialMD = socialResp.content[0].text.trim();

  const safeClientName = clientName.replace(/\s+/g, '_').toLowerCase();
  fs.writeFileSync(path.join(csDir, `case_study_${safeClientName}.md`), caseMD);
  fs.writeFileSync(path.join(csDir, `social_posts_${safeClientName}.md`), socialMD);
  fs.writeFileSync(path.join(csDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    client: clientName,
    sector,
    files: [`case_study_${safeClientName}.md`, `social_posts_${safeClientName}.md`],
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Case Study: ${path.join(csDir, `case_study_${safeClientName}.md`)}`);
  console.log(`  ✓ Posts LinkedIn: ${path.join(csDir, `social_posts_${safeClientName}.md`)}`);

  appendLog('case_study_agent complete ✓');
}

runCaseStudyAgent().catch(err => {
  console.error('Case Study Agent error:', err.message);
  process.exit(1);
});
