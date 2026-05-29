require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const taskName  = get('--task') || 'partnerships';
const taskDate  = get('--date') || new Date().toISOString().split('T')[0];
const outputDir = path.join('outputs', `${taskName}_${taskDate}`);
const partDir   = path.join(outputDir, 'partnerships');

function appendLog(msg) {
  fs.appendFileSync(path.join(outputDir, 'logs', 'partnership.log'),
    `[${new Date().toISOString()}] ${msg}\n`);
}
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

async function runPartnershipAgent() {
  console.log(`\nPartnership Agent — SmartOps IA`);
  console.log(`Task: ${taskName} | Data: ${taskDate}\n`);

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  [partDir, path.join(outputDir, 'logs')].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  appendLog('partnership_agent started');

  const brandIdentity  = readFileSafe('knowledge/brand_identity.md');
  const productCampaign = readFileSafe('knowledge/product_campaign.md');
  const partners = readJsonSafe('data/partners.json') || [];

  console.log('  → Mapeando oportunidades de parceria B2B...');
  appendLog('Generating partnership strategy...');

  const client = new Anthropic();
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    messages: [{
      role: 'user',
      content: `Você é o Partnership Agent da SmartOps IA. Mapeia, qualifica e ativa parcerias estratégicas B2B para acelerar o crescimento da consultoria.

## CONTEXTO
**SmartOps IA** — consultoria Lean Six Sigma + Automação com IA para PMEs em BH
**Consultor:** Breno Luiz — Black Belt Lean Six Sigma
**Parceiros atuais:** ${partners.length}
**Data:** ${taskDate}

## SERVIÇOS SmartOps IA
${productCampaign.slice(0, 500) || 'Lean, Six Sigma, Automação com IA para PMEs'}

---

## TASK — Estratégia de Parcerias

# Partnership Strategy — SmartOps IA
**Data:** ${taskDate}

---

## 1. Mapa de Parceiros Estratégicos

### Parceiros de Indicação (indicam clientes)
| Tipo | Exemplos em BH | Comissão Sugerida | Abordagem |
|---|---|---|---|
| Contador/BPO Contábil | [nomes de escritórios] | 10-15% do projeto | WhatsApp direto |
| Advogado empresarial | [perfil] | 10% | LinkedIn |
| Agência de marketing | [perfil] | 10-15% | Parceria mútua |
| Consultor de TI | [perfil] | 15% | Projeto conjunto |
| SEBRAE MG | [programa específico] | Sem comissão — visibilidade | Credenciamento |
| ACEMINAS/FIEMG | [programa] | Sem comissão — acesso | Associação |

### Parceiros de Entrega (ajudam a executar)
| Tipo | Perfil | Modelo | Quando Acionar |
|---|---|---|---|
| Dev/Automação | Freelancer n8n/Python | Por projeto | Quando há escopo técnico |
| Designer | Identidade visual | Por entregável | Projetos com produto visual |
| Treinador comportamental | Coach de equipes | Projetos change management | |

### Parceiros de Canal (revendem/white-label)
| Tipo | Modelo | Margem SmartOps |
|---|---|---|
| Consultoria maior | White-label do método | 40-60% do projeto |
| Software house | Bundling de consultoria | 50% |

---

## 2. Pipeline de Parcerias

| Parceiro | Tipo | Status | Próxima Ação | Data |
|---|---|---|---|---|
${partners.length > 0 ? partners.map(p => `| ${p.nome || 'N/A'} | ${p.tipo || ''} | ${p.status || 'Prospectar'} | Abordar | ${taskDate} |`).join('\n') : '| [parceiro 1] | Indicação | Prospectar | Enviar DM LinkedIn | ' + taskDate + ' |\n| [parceiro 2] | Indicação | Prospectar | Ligar | ' + taskDate + ' |'}

---

## 3. Scripts de Abordagem

### DM LinkedIn para Parceiro de Indicação
\`\`\`
Olá [Nome],

Vi seu trabalho com PMEs em BH e acho que temos uma sinergia interessante.

Sou Breno Luiz, consultor Lean Six Sigma + IA. Quando meus clientes precisam de [serviço do parceiro], indico profissionais da minha rede — e vice-versa.

Toparia um café rápido (30 min) para conversar?

Breno | SmartOps IA | (31) 97203-9180
\`\`\`

### WhatsApp para Contador/BPO
\`\`\`
Olá [Nome], tudo bem?

Sou Breno Luiz, consultor de melhoria de processos + automação. Atendo PMEs em BH.

Muitos dos meus clientes têm desafios operacionais que você resolve — e vice-versa. Tenho interesse em uma parceria de indicação mútua.

Tem interesse em conversar? Seria bem rápido.
\`\`\`

---

## 4. Acordo Padrão de Parceria

**Termos básicos:**
- Comissão de indicação: [X]% sobre valor do contrato assinado
- Pagamento: Após receber do cliente (30-60 dias)
- Validade da indicação: 6 meses
- Formalização: Email de confirmação (sem contrato formal no início)

---

## 5. Plano de Ação — Próximos 30 Dias

| Semana | Ação | Meta | Resultado Esperado |
|---|---|---|---|
| 1 | Mapear 20 potenciais parceiros no LinkedIn | Lista | Base de contatos |
| 2 | Abordar 10 parceiros (DM/WhatsApp) | 10 mensagens | 3-5 respostas |
| 3 | Reuniões de alinhamento | 2-3 reuniões | 1-2 acordos verbais |
| 4 | Formalizar 2 parcerias | 2 acordos | Pipeline + indicações |

---

## 6. Métricas de Parceria

| Métrica | Meta 30 dias | Meta 90 dias |
|---|---|---|
| Parceiros ativos | 3 | 10 |
| Leads por indicação/mês | 2 | 8 |
| Conversão indicação → cliente | — | ≥ 30% |
| Receita via parcerias | — | 30% do total |`,
    }],
  });

  const partnershipMD = resp.content[0].text.trim();
  appendLog('Partnership strategy generated');

  fs.writeFileSync(path.join(partDir, 'partnership_strategy.md'), partnershipMD);
  fs.writeFileSync(path.join(partDir, 'metadata.json'), JSON.stringify({
    date: taskDate,
    total_partners: partners.length,
    file: 'partnership_strategy.md',
  }, null, 2));

  appendLog('All outputs saved ✓');
  console.log(`\n  ✓ Estratégia: ${path.join(partDir, 'partnership_strategy.md')}`);
  console.log(`  ✓ Parceiros existentes: ${partners.length}`);

  appendLog('partnership_agent complete ✓');
}

runPartnershipAgent().catch(err => {
  console.error('Partnership Agent error:', err.message);
  process.exit(1);
});
