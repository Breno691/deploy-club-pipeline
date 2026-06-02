// Offer Optimization Agent — config
const CONFIG = {
  agent: {
    name:    'Offer Optimization Agent',
    version: '1.0.0',
    role:    'Especialista em Design e Otimização de Ofertas',
    mission: 'Criar ofertas irresistíveis que reduzem fricção, aumentam conversão e maximizam valor percebido',
    mantra:  'Uma oferta perfeita vende sozinha. Um pitch ruim não tem conserto.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Ofertas atuais com score de força
  current_offers: [
    {
      nome: 'Diagnóstico Gratuito',
      preco: 0,
      tipo: 'lead_magnet',
      promessa: 'Descubra os 3 principais gargalos do seu negócio em 45 minutos',
      entregaveis: ['Relatório PDF com gargalos', 'Estimativa de perda mensal', 'Top 3 ações de melhoria'],
      cta: 'Quero meu diagnóstico grátis',
      score: 85,
    },
    {
      nome: 'Diagnóstico Express',
      preco: 997,
      tipo: 'entry_offer',
      promessa: 'Mapa completo dos seus desperdícios com plano de ação em 48h',
      entregaveis: ['Relatório VSM simplificado', 'Top 5 melhorias priorizadas por ROI', 'Plano de ação 30 dias', '1 sessão de acompanhamento'],
      garantia: '100% de satisfação ou reembolso total',
      cta: 'Quero o Diagnóstico Express',
      score: 78,
    },
    {
      nome: 'SmartOps Monthly',
      preco: 3500,
      tipo: 'core_offer',
      promessa: 'Seu processo melhorando todo mês com IA + Lean — garantido',
      entregaveis: ['4 reuniões de análise', 'Relatórios semanais de performance', 'Implementação de 2 melhorias/mês', 'Acesso ao sistema de IA'],
      garantia: 'Sem fidelidade. Cancele a qualquer momento.',
      cta: 'Quero melhorar meu negócio todo mês',
      score: 82,
    },
    {
      nome: 'Sprint Automação n8n',
      preco: 6500,
      tipo: 'solution_offer',
      promessa: '3 automações implementadas e funcionando em 30 dias ou devolvemos o dinheiro',
      entregaveis: ['Mapeamento de processos automáveis', '3 workflows n8n completos', 'Documentação técnica', '30 dias de suporte', 'Treinamento da equipe'],
      garantia: 'Garantia de funcionamento por 90 dias',
      cta: 'Automatizar meu negócio agora',
      score: 88,
    },
  ],

  // Framework de avaliação de ofertas (score 0-100)
  offer_score_weights: {
    clareza_da_promessa:   { weight: 20, desc: 'O cliente entende o resultado em 5 segundos?' },
    especificidade:        { weight: 15, desc: 'Números, prazos e entregáveis concretos?' },
    credibilidade:         { weight: 15, desc: 'Prova social, certificações, resultados reais?' },
    urgencia_escassez:     { weight: 10, desc: 'Há razão para agir agora?' },
    garantia:              { weight: 15, desc: 'O risco percebido foi reduzido?' },
    cta_poder:             { weight: 15, desc: 'O CTA é claro, direto e orientado ao benefício?' },
    valor_percebido:       { weight: 10, desc: 'O preço parece pequeno vs. o valor entregue?' },
  },

  // Tipos de garantia disponíveis
  garantias: [
    { tipo: 'Satisfação garantida', desc: 'Reembolso total se não gostar', risco_para_nos: 'Baixo', impacto_conv: '+20-40%' },
    { tipo: 'Garantia de resultado', desc: 'Entregamos X ou devolvemos Y%', risco_para_nos: 'Medio', impacto_conv: '+30-60%' },
    { tipo: 'Sem fidelidade', desc: 'Cancele a qualquer momento', risco_para_nos: 'Baixo', impacto_conv: '+10-25%' },
    { tipo: 'Primeira sessão grátis', desc: 'Conhece antes de pagar', risco_para_nos: 'Baixo', impacto_conv: '+40-80%' },
  ],

  // Gatilhos de urgência/escassez
  urgency_triggers: [
    { tipo: 'Vagas limitadas', exemplo: 'Apenas 3 vagas disponíveis este mês' },
    { tipo: 'Prazo de oferta', exemplo: 'Preço válido até sexta-feira' },
    { tipo: 'Bônus por tempo', exemplo: 'Bônus incluído para contratos fechados esta semana' },
    { tipo: 'Timing externo', exemplo: 'Ideal fechar antes do próximo trimestre fiscal' },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
