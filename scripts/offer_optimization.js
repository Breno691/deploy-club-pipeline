require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task')  || 'offer_opt';
const taskDate  = get('--date')  || new Date().toISOString().split('T')[0];
const offerName = get('--offer') || 'todos_os_servicos';
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const offerDir  = path.join(outputDir, 'offers');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'offer_optimization.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runOfferOptimization() {
  console.log(`\nOffer Optimization Agent — SmartOps IA`);
  console.log(`Oferta: ${offerName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [offerDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('offer_optimization started');

  const brandIdentity   = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const personas        = readFileSafe('knowledge/customer_personas.md');
  const salesPlaybook   = readFileSafe('knowledge/sales_playbook.md');
  const leads           = readJsonSafe('data/leads.json') || [];

  const objections = leads.reduce((acc, l) => {
    if (l.objection) acc.push(l.objection);
    return acc;
  }, []);

  console.log('  → Analisando e otimizando ofertas...');
  appendLog(`Optimizing offer: ${offerName}`);

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é o Offer Optimization Agent da SmartOps IA. Analisa as ofertas existentes e propõe variações para aumentar taxa de aprovação e valor percebido.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Data:** ${taskDate}
**Oferta em análise:** ${offerName.replace(/_/g, ' ')}

## PRODUCT & SERVICES
${productCampaign.slice(0, 700) || ''}

## PERSONAS
${personas.slice(0, 400) || ''}

## OBJEÇÕES REGISTRADAS (dos leads)
${objections.length > 0 ? objections.slice(0, 10).map((o, i) => `${i + 1}. ${o}`).join('\n') : 'Nenhuma objeção registrada ainda'}

## BRAND IDENTITY
${brandIdentity.slice(0, 300) || ''}

---

## TASK — Análise e Otimização de Oferta

# Offer Optimization — SmartOps IA
**Data:** ${taskDate}

---

## 1. Auditoria da Oferta Atual

### Pontos Fortes
[O que está funcionando na oferta atual — atrativos, diferenciadores]

### Pontos Fracos
[O que provavelmente está afastando clientes — objeções, gaps]

### Score de Oferta: [X/10]

| Critério | Score | Observação |
|---|---|---|
| Clareza do valor | /10 | |
| Prova social | /10 | |
| Risco percebido | /10 (menor = melhor) | |
| Urgência | /10 | |
| Preço vs valor | /10 | |

---

## 2. Variações de Oferta (A/B Testing)

### Variação A — Atual (baseline)
[Resumo da oferta como provavelmente está sendo apresentada]

### Variação B — Foco em ROI Garantido
**Hook:** "Se não reduzirmos seu lead time em 30% em 60 dias, você não paga a segunda parcela."
**Estrutura:**
- [o que inclui]
- [garantia específica]
- **Preço:** R$ [X] em [Y] parcelas
- **Para quem:** [perfil]

### Variação C — Entrada Baixa (Quick Win)
**Hook:** "Comece com R$ [X] e veja resultado em 2 semanas."
**Estrutura:**
- Diagnóstico de 2 dias
- Identificação de 1 problema crítico
- Plano de ação com ROI estimado
- **Preço:** R$ [X] (entrada — sem continuidade obrigatória)
- **Upsell natural:** "Quer que a gente implemente?"

### Variação D — Pacote Recorrente
**Hook:** "SmartOps IA mensalmente — melhoria contínua sem precisar contratar."
**Estrutura:**
- [reunião mensal de acompanhamento]
- [relatório de performance]
- [1 ação de melhoria/mês]
- **Preço:** R$ [X]/mês
- **Contrato:** 6 meses mínimo

---

## 3. Otimização do Funil por Etapa

### Topo — Captação de Leads
| Ação Atual | Problema | Otimização |
|---|---|---|
| [ex: DM genérico] | [baixa resposta] | [personalizar com contexto do lead] |

### Meio — Diagnóstico Gratuito
| O Que Fazer | Como Apresentar | Resultado Esperado |
|---|---|---|
| [diagnóstico de 30min] | [frame como auditoria, não venda] | [lead percebe problema real] |

### Fundo — Proposta e Fechamento
| Objeção | Script Otimizado |
|---|---|
| "É caro" | "Quanto está custando [problema] por mês? O projeto se paga em [X meses]." |
| "Vou pensar" | "O que faltou ficar claro para você tomar a decisão?" |
| "Não tenho tempo" | "Por isso mesmo — vou fazer o trabalho pesado, você aprova as direções." |

---

## 4. Oferta Recomendada (Variação Vencedora)

**Oferta:** [nome comercial]
**Para:** [ICP específico]
**Preço:** R$ [X]
**Garantia:** [se houver]
**Entregáveis:** [lista]
**Prazo:** [X semanas]
**Argumento principal:** [1 frase que justifica o investimento]

---

## 5. Próximos Testes

1. Testar **Variação B** com próximos 3 leads → medir taxa de aprovação
2. Criar landing page simples para **Variação C** → medir custo por lead
3. Propor **Variação D** para clientes após projeto → medir upsell rate`,
    }],
  });

  const offerMD = resp.content[0].text.trim();
  appendLog('Offer optimization generated');

  const safeOffer = offerName.replace(/\s+/g, '_');
  fs.writeFileSync(path.join(offerDir, `offer_analysis_${safeOffer}.md`), offerMD);
  fs.writeFileSync(path.join(offerDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    offer: offerName,
    objections_analyzed: objections.length,
    file: `offer_analysis_${safeOffer}.md`,
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Análise de oferta: ${path.join(offerDir, `offer_analysis_${safeOffer}.md`)}`);

  appendLog('offer_optimization complete ✓');
}

runOfferOptimization().catch(err => {
  console.error('Offer Optimization error:', err.message);
  process.exit(1);
});
