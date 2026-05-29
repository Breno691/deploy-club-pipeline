require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName    = get('--task')    || 'pricing';
const taskDate    = get('--date')    || new Date().toISOString().split('T')[0];
const projectType = get('--project') || 'lean_vsm';
const duration    = parseInt(get('--weeks') || '6', 10);
const clientSize  = get('--size')    || 'pme_pequena'; // pme_pequena | pme_media | media_empresa
const outputDir   = path.join('outputs', `${taskName}_${taskDate}`);
const pricingDir  = path.join(outputDir, 'pricing');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'pricing.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runPricingAgent() {
  console.log(`\nPricing Agent — SmartOps IA`);
  console.log(`Projeto: ${projectType} | ${duration} semanas | ${clientSize}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [pricingDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('pricing_agent started');

  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const financials      = readJsonSafe('data/financial_data.json');

  const horasDisponiveis = 40;
  const custoHora = 120;
  const margemAlvo = 65;

  console.log('  → Calculando precificação com margem > 60%...');
  appendLog(`Pricing for: ${projectType}, ${duration}w, ${clientSize}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    messages: [{
      role: 'user',
      content: `Você é o Pricing Agent da SmartOps IA. Precifica projetos de consultoria garantindo margem bruta > 60% e valor percebido alto.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Data:** ${taskDate}

## PARÂMETROS DO PROJETO
- **Tipo:** ${projectType.replace(/_/g, ' ')}
- **Duração:** ${duration} semanas
- **Porte do cliente:** ${clientSize.replace(/_/g, ' ')}
- **Horas disponíveis/semana:** ${horasDisponiveis}h
- **Custo interno estimado:** R$ ${custoHora}/hora (tempo do consultor)
- **Margem alvo:** ≥ ${margemAlvo}%

## PRODUTOS/SERVIÇOS ATUAIS
${productCampaign.slice(0, 600) || '(não disponível)'}

## DADOS FINANCEIROS
${financials ? `Receita atual: R$ ${financials.receita_total || 0} | Margem: ${financials.margem_bruta || 0}%` : '(sem dados financeiros)'}

---

## TASK — Análise de Precificação

# Pricing Analysis — ${projectType.replace(/_/g, ' ')}
**SmartOps IA | ${taskDate}**

---

## 1. Estimativa de Esforço

| Fase | Atividade | Horas Estimadas |
|---|---|---|
| Diagnóstico | Entrevistas, análise de dados, observação | [X]h |
| Análise | VSM/DMAIC, root cause, priorização | [X]h |
| Implementação | Quick wins, piloto, treinamento | [X]h |
| Documentação | SOP, relatório final, apresentação | [X]h |
| Gestão | Reuniões, alinhamentos, e-mails | [X]h |
| **TOTAL** | | **[X]h** |

---

## 2. Cálculo de Custo

| Item | Valor |
|---|---|
| Horas do consultor (${duration} semanas) | R$ [horas × ${custoHora}] |
| Ferramentas e APIs (Claude, Tavily) | R$ [X] |
| Deslocamentos estimados | R$ [X] |
| **Custo Total** | **R$ [X]** |

---

## 3. Precificação por Abordagem

### A) Baseada em Custo + Margem
| Cenário | Custo | Preço Mínimo (${margemAlvo}% margem) | Preço Recomendado |
|---|---|---|---|
| Pessimista (+20% horas) | R$ [X] | R$ [X] | R$ [X] |
| Base | R$ [X] | R$ [X] | R$ [X] |
| Otimista (-20% horas) | R$ [X] | R$ [X] | R$ [X] |

### B) Baseada em Valor para o Cliente
| Porte do Cliente | Problema Típico (custo/ano) | Sua Solução Economiza | Preço Justo (10-30% da economia) |
|---|---|---|---|
| PME Pequena (< 20 func.) | R$ 80-150k/ano | R$ 30-60k | R$ 8-18k |
| PME Média (20-100 func.) | R$ 200-500k/ano | R$ 80-200k | R$ 20-60k |
| Empresa Média (100+ func.) | R$ 500k+/ano | R$ 200k+ | R$ 50-150k |

### C) Referência de Mercado (Black Belt BH/MG)
| Nível | Faixa por Projeto | Faixa Mensal |
|---|---|---|
| Junior | R$ 5-15k | R$ 5-8k |
| Sênior | R$ 15-40k | R$ 8-15k |
| **Black Belt (Breno)** | **R$ 15-50k** | **R$ 10-20k** |
| Especialista IA | Premium +30-50% | |

---

## 4. Recomendação Final

### Para: ${projectType.replace(/_/g, ' ')} | ${clientSize.replace(/_/g, ' ')} | ${duration} semanas

**Preço Recomendado:** R$ [X]
**Divisão de Pagamento:** [X]% na assinatura + [X]% na entrega
**Margem Bruta Calculada:** [X]%
**Argumento de Valor:** [por que este preço é barato dado o ROI]

### Tabela de Preços por Serviço

| Serviço | Duração | Preço | Margem Est. |
|---|---|---|---|
| Quick Diagnostic | 2 dias | R$ 1.500-3.000 | >70% |
| Lean VSM Completo | 4-6 sem | R$ 8.000-18.000 | >65% |
| Six Sigma DMAIC | 8-12 sem | R$ 15.000-35.000 | >60% |
| Automação (n8n) | 2-4 sem | R$ 5.000-12.000 | >70% |
| Retainer Mensal | Recorrente | R$ 2.500-6.000/mês | >60% |

---

## 5. Como Apresentar o Preço (Script)

\`\`\`
"O investimento neste projeto é de R$ [X], dividido em [condições].

Para contextualizar: identificamos que o problema [específico] está custando
aproximadamente R$ [Y]/mês para sua empresa. O projeto se paga em [Z] meses.

E tem uma garantia: se não atingirmos [resultado específico] em [prazo],
revisamos o plano sem custo adicional."
\`\`\`

---

## 6. Quando Negociar (e Quando Não)

✅ **Pode negociar:** Forma de pagamento, parcelamento, escopo reduzido
❌ **Não negocie:** Valor/hora, margem abaixo de 50%, escopo indefinido`,
    }],
  });

  const pricingMD = resp.content[0].text.trim();
  appendLog('Pricing analysis generated');

  const safeProject = projectType.replace(/\s+/g, '_');
  fs.writeFileSync(path.join(pricingDir, `pricing_${safeProject}.md`), pricingMD);
  fs.writeFileSync(path.join(pricingDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    project_type: projectType,
    duration_weeks: duration,
    client_size: clientSize,
    file: `pricing_${safeProject}.md`,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Análise de pricing: ${path.join(pricingDir, `pricing_${safeProject}.md`)}`);

  appendLog('pricing_agent complete ✓');
}

runPricingAgent().catch(err => {
  console.error('Pricing Agent error:', err.message);
  process.exit(1);
});
