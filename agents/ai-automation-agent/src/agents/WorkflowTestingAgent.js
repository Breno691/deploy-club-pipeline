// WorkflowTestingAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

const STANDARD_TEST_CASES = [
  { id: 'TC01', name: 'Input válido',       type: 'happy_path',  risk: 'baixo'  },
  { id: 'TC02', name: 'Input inválido',     type: 'edge_case',   risk: 'medio'  },
  { id: 'TC03', name: 'Campo obrigatório vazio', type: 'edge_case', risk: 'alto' },
  { id: 'TC04', name: 'API externa timeout',type: 'error',       risk: 'alto'   },
  { id: 'TC05', name: 'Credencial inválida',type: 'error',       risk: 'alto'   },
  { id: 'TC06', name: 'Dados duplicados',   type: 'edge_case',   risk: 'medio'  },
  { id: 'TC07', name: 'Alta carga (10x volume)', type: 'stress', risk: 'medio'  },
  { id: 'TC08', name: 'Resposta inesperada da API', type: 'error', risk: 'alto' },
];

function generateTestPlan(workflowName, customCases = []) {
  const cases = [...STANDARD_TEST_CASES, ...customCases];
  return {
    workflow:    workflowName,
    test_plan:   cases,
    total_cases: cases.length,
    high_risk:   cases.filter(c => c.risk === 'alto').length,
    created_at:  new Date().toISOString(),
    checklist: [
      'Credenciais configuradas no n8n',
      'Webhook URL acessível',
      'Banco de dados conectado',
      'Telegram bot configurado',
      'Executar em modo teste (não produção)',
      'Verificar logs após cada teste',
      'Confirmar Error Handler funcionando',
    ],
  };
}

async function generateTestSpecWithClaude(workflowSpec) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Workflow Testing Agent da SmartOps IA.

Missão: Criar plano de testes completo para garantir que um workflow n8n funcione em produção sem surpresas.

Workflow: ${typeof workflowSpec === 'string' ? workflowSpec : JSON.stringify(workflowSpec)}

Casos de teste obrigatórios a cobrir:
${STANDARD_TEST_CASES.map(tc => `- ${tc.id}: ${tc.name} (risco: ${tc.risk})`).join('\n')}

Responda no formato:

# TEST PLAN — [NOME DO WORKFLOW]

## AMBIENTE DE TESTE
[Como configurar ambiente isolado para teste]

## CASOS DE TESTE
Para cada caso:
TC_ID: [ID]
NOME: [nome]
TIPO: [happy_path/edge_case/error/stress]
PASSO A PASSO:
  1. [preparar]
  2. [executar]
  3. [verificar]
INPUT: [dados de entrada]
RESULTADO_ESPERADO: [o que deve acontecer]
RESULTADO_REAL: [preencher após testar]
STATUS: [PASSOU/FALHOU/PULOU]
OBSERVAÇÕES: [notas]

## CRITÉRIOS DE ACEITE
[O que precisa passar para ir a produção]

## REGRESSÃO
[Testes a rodar cada vez que o workflow for alterado]

## RELATÓRIO PÓS-TESTE
[Formato para documentar resultado dos testes]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { generateTestPlan, generateTestSpecWithClaude, STANDARD_TEST_CASES };
