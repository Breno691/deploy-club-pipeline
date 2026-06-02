// Knowledge Management Agent — config
const CONFIG = {
  agent: {
    name:    'Knowledge Management Agent',
    version: '1.0.0',
    role:    'Diretor de Gestão do Conhecimento',
    mission: 'Capturar, organizar e distribuir o conhecimento da SmartOps para acelerar resultados',
    mantra:  'O conhecimento que não está documentado é conhecimento perdido.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Categorias de conhecimento
  knowledge_categories: {
    operacional: {
      name:     'Operacional',
      tipos:    ['SOPs', 'Checklists', 'Workflows', 'Templates'],
      exemplos: ['SOP de entrega de projeto', 'Checklist de diagnóstico', 'Template de proposta'],
    },
    comercial: {
      name:     'Comercial',
      tipos:    ['Playbooks de vendas', 'Objeções e respostas', 'Scripts', 'Proposta padrão'],
      exemplos: ['Playbook de fechamento', 'Script de reunião de descoberta', 'Objection handling'],
    },
    tecnico: {
      name:     'Técnico',
      tipos:    ['Documentação n8n', 'Guias de ferramentas', 'Arquiteturas', 'Troubleshooting'],
      exemplos: ['Documentação de workflows n8n', 'Guia de configuração Supabase'],
    },
    cliente: {
      name:     'Cliente',
      tipos:    ['Cases de sucesso', 'Perfis de cliente', 'Histórico de projetos', 'Testimonials'],
      exemplos: ['Case study cliente A', 'Perfil ICP Lean Manufacturing'],
    },
    metodologia: {
      name:     'Metodologia',
      tipos:    ['Lean Six Sigma', 'Kaizen', 'DMAIC', 'Automação IA', 'Frameworks próprios'],
      exemplos: ['Framework Diagnóstico SmartOps', 'Protocolo de Kaizen Rápido'],
    },
    marketing: {
      name:     'Marketing',
      tipos:    ['Guias de conteúdo', 'Brand guidelines', 'Templates de post', 'Calendário editorial'],
      exemplos: ['Guia de voz da marca', 'Templates Instagram', 'Estratégia de conteúdo'],
    },
  },

  // Templates de SOP padrão SmartOps
  sop_templates: [
    { nome: 'SOP de Diagnóstico',      codigo: 'SOP-001', area: 'Operacional', passos: 7, tempo: '45min' },
    { nome: 'SOP de Proposta',         codigo: 'SOP-002', area: 'Comercial',   passos: 5, tempo: '2h' },
    { nome: 'SOP de Onboarding',       codigo: 'SOP-003', area: 'Operacional', passos: 8, tempo: '1h' },
    { nome: 'SOP de Entrega de Projeto',codigo: 'SOP-004', area: 'Operacional', passos: 6, tempo: '30min' },
    { nome: 'SOP de Reunião Semanal',  codigo: 'SOP-005', area: 'Operacional', passos: 4, tempo: '15min' },
    { nome: 'SOP de Follow-up de Lead',codigo: 'SOP-006', area: 'Comercial',   passos: 5, tempo: '10min' },
    { nome: 'SOP de Criação de Conteúdo', codigo: 'SOP-007', area: 'Marketing', passos: 6, tempo: '2h' },
    { nome: 'SOP de Análise de Dados', codigo: 'SOP-008', area: 'Técnico',     passos: 5, tempo: '1h' },
  ],

  // Playbooks estratégicos
  playbooks: [
    { nome: 'Playbook de Vendas',      target: 'Breno', foco: 'Fechamento de novos clientes' },
    { nome: 'Playbook de Diagnóstico', target: 'Breno', foco: 'Execução do diagnóstico e descoberta de dor' },
    { nome: 'Playbook de Onboarding',  target: 'Breno', foco: 'Início de projeto sem fricção' },
    { nome: 'Playbook de Kaizen',      target: 'Breno', foco: 'Execução de evento kaizen com cliente' },
    { nome: 'Playbook de Automação',   target: 'Breno', foco: 'Levantamento e implementação de automações' },
    { nome: 'Playbook de Retenção',    target: 'Breno', foco: 'Prevenção de churn e expansão de contrato' },
  ],

  // Score de maturidade do conhecimento
  maturity_levels: {
    1: { label: 'Ad-hoc',       desc: 'Conhecimento apenas na cabeça das pessoas' },
    2: { label: 'Documentado',  desc: 'Alguma documentação, mas incompleta' },
    3: { label: 'Padronizado',  desc: 'SOPs escritos, seguidos pela maioria' },
    4: { label: 'Mensurável',   desc: 'KPIs para qualidade do conhecimento' },
    5: { label: 'Otimizado',    desc: 'Melhoria contínua do conhecimento, base viva' },
  },

  // Ferramenta de armazenamento de conhecimento SmartOps
  knowledge_tools: ['Notion', 'Google Drive', 'GitHub (código)', 'Supabase (estruturado)', 'Pasta outputs/ local'],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
