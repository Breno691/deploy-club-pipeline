// PlaybookSOPAgent.js — Organizational Learning Intelligence Agent
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

async function generatePlaybookUpdate({ playbook, section, lesson, evidence = '' }) {
  const prompt = `Você é o Playbook Update Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Gere uma atualização de playbook baseada neste aprendizado.

Playbook: ${playbook}
Seção: ${section}
Aprendizado que gerou a mudança: ${lesson}
Evidência: ${evidence || 'baseado em observação de campo'}

Regras:
- Nunca remover regra crítica sem aprovação
- Sempre versionar
- A nova regra deve ser específica e acionável
- Incluir critério de qualidade

Retorne JSON:
{
  "update_id": "pb-${Date.now()}",
  "playbook": "${playbook}",
  "version": "v1.1",
  "section": "${section}",
  "update_type": "adicionar | modificar | remover | criar",
  "old_rule": "regra atual (se existir)",
  "new_rule": "nova regra proposta",
  "reason": "por que esta mudança",
  "evidence": "${evidence || 'observação de campo'}",
  "impact": "alto | médio | baixo",
  "approval_required": false,
  "related_sop": "SOP relacionado | nenhum",
  "quality_criteria": "como saber se a regra está sendo seguida",
  "effective_date": "${new Date().toISOString().split('T')[0]}",
  "owner": "Breno Luiz",
  "status": "proposed"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PlaybookSOPAgent update: no JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateSOP({ name, objective = '', context = '' }) {
  const sopContext = context || `Processo recorrente na SmartOps IA: ${name}`;

  const prompt = `Você é o SOP Agent da SmartOps IA.

SmartOps IA: consultoria Lean Six Sigma + IA para PMEs em BH/MG.

Crie um SOP (Standard Operating Procedure) completo.

Nome do SOP: ${name}
Objetivo informado: ${objective || 'documentar processo recorrente para padronização'}
Contexto: ${sopContext}

O SOP deve ser:
- específico e seguível por qualquer pessoa
- com critérios de qualidade claros
- com checklist de verificação
- com responsáveis definidos

Retorne JSON:
{
  "sop_id": "sop-${Date.now()}",
  "sop_name": "${name}",
  "version": "v1.0",
  "objective": "objetivo do SOP",
  "when_to_use": "quando executar este SOP",
  "owner": "responsável principal",
  "frequency": "sempre que X acontecer | diário | semanal | mensal",
  "inputs": ["o que precisa antes de começar"],
  "steps": [
    { "step": 1, "action": "ação específica", "tool": "ferramenta usada", "time_estimate": "X minutos", "output": "resultado desta etapa" }
  ],
  "checklist": ["item de verificação 1", "item de verificação 2"],
  "tools_required": ["ferramenta 1", "ferramenta 2"],
  "quality_criteria": ["critério de qualidade 1", "critério de qualidade 2"],
  "output": "entregável final do SOP",
  "success_metric": "como medir se foi bem executado",
  "common_mistakes": ["erro comum 1 a evitar"],
  "related_playbook": "playbook relacionado",
  "related_sops": ["SOP relacionado 1"],
  "escalation": "o que fazer se algo der errado",
  "created_at": "${new Date().toISOString()}",
  "status": "active"
}

Retorne SOMENTE o JSON válido, sem markdown.`;

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('PlaybookSOPAgent SOP: no JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generatePlaybookUpdate, generateSOP };
