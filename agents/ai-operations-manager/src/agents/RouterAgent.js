// RouterAgent — classifica pedidos e seleciona agentes corretos
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

/**
 * Analisa o pedido do usuário e decide quais agentes acionar.
 * Retorna: { agents: string[], requestType: string, complexity: string, reasoning: string }
 */
async function routeRequest(userRequest, context = {}) {
  const agentList = Object.entries(CONFIG.agents)
    .map(([key, a]) => `${key}: ${a.description} | triggers: ${a.triggers.join(', ')}`)
    .join('\n');

  const prompt = `Você é o roteador central do sistema SmartOps IA.

Analise o pedido abaixo e decida quais agentes devem ser acionados.

PEDIDO DO USUÁRIO:
${userRequest}

CONTEXTO ADICIONAL:
${JSON.stringify(context, null, 2)}

AGENTES DISPONÍVEIS:
${agentList}

Responda em JSON com este formato exato:
{
  "agents": ["agent_key1", "agent_key2"],
  "request_type": "diagnóstico|plano|relatório|pesquisa|execução|decisão|criação",
  "complexity": "simples|médio|complexo",
  "primary_agent": "agent_key_principal",
  "reasoning": "Por que estes agentes foram escolhidos",
  "estimated_outputs": ["output1", "output2"],
  "priority": "P1|P2|P3|P4",
  "requires_consolidation": true
}

Regras:
- Se o pedido for amplo (ex: "quero lançar um serviço"), acione múltiplos agentes
- Se for específico (ex: "crie um script de vendas"), acione apenas o agente mais adequado
- Sempre inclua o ceo_advisor quando a resposta envolver decisão estratégica
- Para pedidos de conteúdo completo, inclua orchestrator
- Máximo de 5 agentes por vez para não sobrecarregar`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('RouterAgent: resposta sem JSON válido');

  return JSON.parse(jsonMatch[0]);
}

/**
 * Gera um briefing para cada agente selecionado.
 */
async function generateAgentBriefings(userRequest, routingResult) {
  const briefings = {};

  for (const agentKey of routingResult.agents) {
    const agentConfig = CONFIG.agents[agentKey];
    if (!agentConfig) continue;

    briefings[agentKey] = {
      agent: agentConfig.name,
      squad: agentConfig.squad,
      task: userRequest,
      priority: routingResult.priority,
      context: {
        request_type: routingResult.request_type,
        other_agents: routingResult.agents.filter(a => a !== agentKey),
        primary: agentKey === routingResult.primary_agent,
      },
      expected_output: routingResult.estimated_outputs,
    };
  }

  return briefings;
}

module.exports = { routeRequest, generateAgentBriefings };
