require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName    = get('--task')    || 'productization';
const taskDate    = get('--date')    || new Date().toISOString().split('T')[0];
const service     = get('--service') || 'lean_consultoria';
const outputDir   = path.join('outputs', `${taskName}_${taskDate}`);
const prodDir     = path.join(outputDir, 'productization');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'productization.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

async function runProductizationAgent() {
  console.log(`\nProductization Agent — SmartOps IA`);
  console.log(`Serviço: ${service} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [prodDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('productization_agent started');

  const brandIdentity   = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');

  console.log('  → Transformando serviço em produto escalável...');
  appendLog(`Productizing service: ${service}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Productization Agent da SmartOps IA. Transforma serviços de consultoria personalizados em produtos padronizados, escaláveis e vendíveis.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Serviço a produtizar:** ${service.replace(/_/g, ' ')}
**Data:** ${taskDate}

## PRODUCT CAMPAIGN
${productCampaign.slice(0, 600) || '(não disponível)'}

---

## TASK — Design de Produto Escalável

# Produto SmartOps IA: ${service.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
**Data:** ${taskDate}

---

## 1. Definição do Produto

**Nome do Produto:** [nome comercial atraente — ex: "Sprint Lean 30"]
**Tagline:** [frase de 1 linha que comunica o valor]
**Para quem é:** [ICP — perfil exato do comprador ideal]
**Problema que resolve:** [dor específica em 1 frase]
**Resultado garantido:** [promessa mensurável — ex: "reduzir lead time em 30% em 45 dias"]

---

## 2. Estrutura do Produto (O Que Inclui)

### Entregáveis Fixos (sempre os mesmos)
| # | Entregável | Formato | Quando |
|---|---|---|---|
| 1 | Diagnóstico inicial | Relatório PDF | Semana 1 |
| 2 | Mapa de valor (VSM) | Diagrama + relatório | Semana 2 |
| 3 | Plano de ação prioritizado | Planilha + MD | Semana 2 |
| 4 | [entregável 4] | | |
| 5 | Relatório final com ROI | PDF | Final |

### O Que NÃO inclui (para controlar escopo)
- [lista do que está fora do escopo]

---

## 3. Precificação Sugerida

| Tier | Nome | Preço | O Que Inclui | Para Quem |
|---|---|---|---|---|
| Entry | [Nome] | R$ [X] | [básico] | PME < 20 funcionários |
| Core | [Nome] | R$ [X] | [completo] | PME 20-100 funcionários |
| Premium | [Nome] | R$ [X] | [tudo + suporte] | Indústria médio porte |

**Recorrência possível:** [como criar receita mensal com este produto]

---

## 4. Cronograma Padrão de Execução

| Semana | Fase | Atividades | Entregável |
|---|---|---|---|
| 1 | Diagnóstico | Entrevistas, dados, observação | Diagnóstico PDF |
| 2 | Análise | VSM, 8 desperdícios, root cause | Mapa + prioridades |
| 3-4 | Implementação | Quick wins, piloto | Primeiros resultados |
| 5-6 | Consolidação | Treinamento, KPIs | SOP + métricas |

---

## 5. Kit de Venda (Sales Enablement)

### Pitch de 30 Segundos
[Script exato para WhatsApp/LinkedIn — problema → solução → resultado → CTA]

### Objeções Mais Comuns e Respostas
| Objeção | Resposta |
|---|---|
| "É caro" | [resposta com ROI] |
| "Não tenho tempo" | [resposta] |
| "Já tentamos e não funcionou" | [resposta] |

### Proposta Rápida (1 página)
[Template da proposta em markdown — pronto para enviar]

---

## 6. Métricas de Produto

| Métrica | Target | Como Medir |
|---|---|---|
| Satisfação do cliente | ≥ 4.5/5 | NPS pós-entrega |
| Prazo de execução | ≤ 6 semanas | Data início → fim |
| ROI documentado | ≥ 3x | Antes/depois 90 dias |
| Taxa de renovação/upsell | ≥ 40% | Contratos expandidos |

---

## 7. Como Escalar Este Produto

1. **Padronização:** [o que documentar para replicar sem Breno]
2. **Automação:** [quais partes do processo podem ser automatizadas com n8n/Claude]
3. **Parceiros:** [quem pode ajudar a entregar ou vender]
4. **Marketing de produto:** [como comunicar para gerar inbound]`,
    }],
  });

  const productMD = resp.content[0].text.trim();
  appendLog('Product design generated');

  const safeService = service.replace(/\s+/g, '_');
  fs.writeFileSync(path.join(prodDir, `product_${safeService}.md`), productMD);
  fs.writeFileSync(path.join(prodDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    service,
    product_file: `product_${safeService}.md`,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Produto: ${path.join(prodDir, `product_${safeService}.md`)}`);

  appendLog('productization_agent complete ✓');
}

runProductizationAgent().catch(err => {
  console.error('Productization Agent error:', err.message);
  process.exit(1);
});
