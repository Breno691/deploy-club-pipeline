// ClientPermissionAgent.js — Case Study Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// ── Calculadoras locais ──────────────────────────────────────────────────────

function getPermissionCapabilities(level) {
  const caps = {
    0: { can_use: ['uso interno apenas'],           cannot_use: ['publicar', 'proposta externa', 'post', 'site'] },
    1: { can_use: ['case anônimo', 'posts', 'propostas'], cannot_use: ['nome da empresa', 'logo', 'dados identificáveis'] },
    2: { can_use: ['setor + resultado', 'carrossel', 'palestras'], cannot_use: ['nome da empresa', 'logo', 'depoimento nominal'] },
    3: { can_use: ['nome do cliente', 'proposta', 'site', 'apresentação'], cannot_use: ['logo', 'foto do cliente', 'anúncio pago'] },
    4: { can_use: ['nome + logo + depoimento', 'tudo exceto anúncio pago'], cannot_use: ['anúncio pago sem aprovação adicional'] },
    5: { can_use: ['publicação irrestrita', 'site', 'anúncio', 'post', 'palestra', 'proposta', 'apresentação'], cannot_use: [] },
  };
  return caps[level] || caps[0];
}

function buildPermissionRequest({ clientName, caseName, result, level = 1 }) {
  const templates = {
    1: `Olá, ${clientName}. Tudo bem?

O projeto que realizamos gerou resultados muito relevantes, especialmente em ${result}.

Gostaríamos de documentar esse caso como estudo de melhoria, de forma completamente **anônima** — sem citar o nome da empresa, sem dados identificáveis.

O objetivo é mostrar como a melhoria contínua e automação podem gerar resultado real.

Antes de qualquer publicação, enviamos o material para sua aprovação.

Podemos seguir com a versão anônima?`,

    2: `Olá, ${clientName}. Tudo bem?

O projeto que realizamos gerou um resultado excelente: ${result}.

Gostaríamos de usar esse resultado em nosso conteúdo, citando apenas o **setor da empresa** (ex: "uma empresa do setor de serviços em BH").

Nada que identifique a empresa será publicado.

Podemos usar essa informação?`,

    3: `Olá, ${clientName}. Tudo bem?

O projeto que fizemos juntos gerou um resultado que vale compartilhar: ${result}.

Gostaríamos de citar o **nome da empresa** (sem logo) como referência em nossas propostas e materiais de venda.

Antes de qualquer uso, enviamos o conteúdo para aprovação.

Você autoriza?`,

    4: `Olá, ${clientName}. Tudo bem?

O resultado do projeto foi excelente: ${result}.

Gostaríamos de criar um estudo de caso completo com o **nome, logo da empresa e um depoimento seu** — para usar em nosso site, propostas e apresentações.

Você revisaria o material antes da publicação.

Teria interesse em participar como case de sucesso?`,

    5: `Olá, ${clientName}. Tudo bem?

O resultado que alcançamos juntos foi extraordinário: ${result}.

Gostaríamos de transformar nossa parceria em um **case de sucesso público** — com nome, logo, depoimento e possibilidade de uso em anúncios, site e apresentações comerciais.

Você revisaria todo o material antes da publicação.

Podemos agendar uma conversa rápida para alinhar os detalhes?`,
  };

  return templates[level] || templates[1];
}

// ── Agente Claude ────────────────────────────────────────────────────────────

async function managePermission({ clientName, caseName, result, currentLevel, requestedLevel = 1 }) {
  const capabilities = getPermissionCapabilities(currentLevel || 0);
  const request      = buildPermissionRequest({ clientName, caseName, result, level: requestedLevel });

  const prompt = `Você é o Client Permission Agent da SmartOps IA.
Sua missão é gerenciar autorizações de uso de cases de clientes de forma ética e eficiente.

SITUAÇÃO:
- Cliente: ${clientName}
- Case: ${caseName}
- Resultado principal: ${result}
- Nível atual de permissão: ${currentLevel || 0} — ${CONFIG.permission_levels[currentLevel || 0].label}
- Nível solicitado: ${requestedLevel} — ${CONFIG.permission_levels[requestedLevel].label}

O QUE JÁ PODEMOS FAZER (nível ${currentLevel || 0}):
${capabilities.can_use.join(', ')}

O QUE NÃO PODEMOS FAZER:
${capabilities.cannot_use.join(', ')}

TEMPLATE DE PEDIDO GERADO:
${request}

Analise a situação e responda:

PERMISSION_STATUS: [nível atual e o que permite]
UPGRADE_RECOMMENDED: [qual nível recomendar para este case]
REQUEST_CHANNEL: [melhor canal para pedir — WhatsApp/e-mail/reunião]
REQUEST_TIMING: [melhor momento para pedir — logo após projeto/1 semana depois/em reunião de resultado]
RISK_IF_NOT_ASKED: [o que perdemos comercialmente sem a autorização]
ANONYMIZATION_VERSION: [como usar o case sem autorização nenhuma]
ASSETS_UNLOCKED_AT_LEVEL_3: [ativos disponíveis se obtivermos nível 3]
ASSETS_UNLOCKED_AT_LEVEL_4: [ativos disponíveis se obtivermos nível 4]
MESSAGE_TO_SEND: [mensagem final recomendada para enviar ao cliente]`;

  const resp = await client.messages.create({
    model:      CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });

  return {
    clientName,
    caseName,
    currentLevel:  currentLevel || 0,
    requestedLevel,
    capabilities,
    requestTemplate: request,
    analysis: resp.content[0].text,
    created_at: new Date().toISOString(),
  };
}

module.exports = { managePermission, getPermissionCapabilities, buildPermissionRequest };
