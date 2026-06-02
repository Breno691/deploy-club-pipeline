// AutomationDocumentationAgent.js
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

function buildDocTemplate(automationName, type = 'workflow') {
  return {
    automation_name: automationName,
    type,
    sections: [
      'objetivo',
      'fluxo_completo',
      'ferramentas_e_credenciais',
      'como_testar',
      'como_monitorar',
      'como_corrigir',
      'como_desligar',
      'metricas_de_sucesso',
      'historico_de_alteracoes',
      'responsaveis',
    ],
    created_at: new Date().toISOString(),
    template: `# ${automationName} — Documentação Técnica

## Objetivo
[Descrever em 2-3 frases o que essa automação faz e por que existe]

## Fluxo Completo
[Diagrama ou descrição passo a passo]
1. Trigger: [como é disparada]
2. [etapa 2]
...

## Ferramentas e Credenciais
| Ferramenta | Credencial n8n | Permissões Necessárias |
|---|---|---|
| | | |

## Como Testar
[Passo a passo para testar a automação]

## Como Monitorar
- Onde ver execuções: [link n8n]
- Métricas no Supabase: [tabela]
- Alerta Telegram: [configuração]

## Como Corrigir Problemas Comuns
| Erro | Causa | Solução |
|---|---|---|
| | | |

## Como Desligar (em emergência)
1. [passo para desativar workflow no n8n]
2. [notificar responsável]
3. [tratar itens em fila]

## Métricas de Sucesso
- Taxa de sucesso esperada: > 95%
- Latência máxima: < 30s
- [outras métricas]

## Histórico
| Data | Versão | Alteração | Responsável |
|---|---|---|---|
| ${new Date().toISOString().split('T')[0]} | 1.0.0 | Criação | Breno Luiz |

## Responsáveis
- Dono: Breno Luiz
- Backup: [definir]`,
  };
}

async function generateDocumentationWithClaude(automationData) {
  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Automation Documentation Agent da SmartOps IA.

Missão: Criar documentação técnica completa para que qualquer pessoa possa entender, operar e manter a automação.

Automação: ${typeof automationData === 'string' ? automationData : JSON.stringify(automationData, null, 2)}

Gere documentação completa nos seguintes formatos:

# [NOME] — DOCUMENTAÇÃO OPERACIONAL

## 1. VISÃO GERAL
- Objetivo (1 parágrafo)
- Quem usa / quem é impactado
- Frequência de execução
- Impacto de falha

## 2. FLUXO TÉCNICO
[Descrição detalhada de cada etapa]

## 3. PRÉ-REQUISITOS
[Credenciais, permissões, ferramentas necessárias]

## 4. RUNBOOK OPERACIONAL
### Iniciar
### Pausar
### Retomar
### Desligar (emergência)

## 5. TROUBLESHOOTING
[Erros mais comuns + solução]

## 6. MONITORAMENTO
[O que monitorar, onde, com qual frequência]

## 7. CHANGELOG
[Formato para registrar alterações]

## 8. GLOSSÁRIO
[Termos técnicos usados]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { buildDocTemplate, generateDocumentationWithClaude };
