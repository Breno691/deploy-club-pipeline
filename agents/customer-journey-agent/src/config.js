// Customer Journey Agent — config
const CONFIG = {
  agent: {
    name:    'Customer Journey Agent',
    version: '1.0.0',
    role:    'Especialista em Jornada do Cliente',
    mission: 'Mapear, analisar e otimizar cada etapa da jornada do cliente para maximizar conversão e retenção',
    mantra:  'O cliente não compra um serviço. Compra uma transformação.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Personas principais da SmartOps
  personas: {
    dono_fabrica: {
      nome:       'Jorge — Dono de Indústria',
      cargo:      'Proprietário / Diretor Industrial',
      empresa:    'Indústria de médio porte, 20-100 funcionários, BH',
      dor:        'Produção parada por retrabalho, desperdício de matéria-prima, horas extras constantes',
      meta:       'Reduzir custo de produção 20% e aumentar capacidade sem contratar',
      objecao:    '"Já tentei consultoria antes e não funcionou"',
      canal:      'LinkedIn, Google, indicação de contador',
      decisao:    'Racional e lenta — precisa de dados e cases',
      ticket:     'R$ 5.000 – R$ 15.000',
    },
    gestor_servicos: {
      nome:       'Ana — Gestora de Serviços',
      cargo:      'Sócia / Gestora de Operações',
      empresa:    'Escritório contábil ou clínica, 5-30 funcionários, BH',
      dor:        'Equipe sobrecarregada, clientes esperando, processos feitos no braço',
      meta:       'Automatizar tarefas repetitivas e ter mais tempo para crescer',
      objecao:    '"Não tenho budget agora"',
      canal:      'Instagram, indicação de amigo, Google',
      decisao:    'Emocional e rápida — precisa de confiança e resultado claro',
      ticket:     'R$ 2.500 – R$ 7.000',
    },
    empreendedor_digital: {
      nome:       'Rafael — Empreendedor Digital',
      cargo:      'Fundador / CEO',
      empresa:    'E-commerce ou SaaS pequeno, 3-10 pessoas, BH/remoto',
      dor:        'Cresceu rápido mas os processos não acompanharam — caos operacional',
      meta:       'Escalar sem perder qualidade — automação e processos que funcionam sem ele',
      objecao:    '"Preciso ver resultado antes de comprometer valor maior"',
      canal:      'Instagram, LinkedIn, YouTube',
      decisao:    'Dados + prova social — precisa de cases com ROI comprovado',
      ticket:     'R$ 3.000 – R$ 10.000',
    },
  },

  // Etapas da jornada
  journey_stages: {
    consciencia: {
      nome:        'Consciência',
      descricao:   'O cliente descobre que tem um problema mas não sabe a solução',
      pergunta:    '"Por que meus processos estão tão lentos?"',
      canais:      ['Google', 'Instagram', 'LinkedIn', 'Boca a boca'],
      conteudo:    ['Posts de educação', 'Artigos de blog', 'Reels sobre desperdício', 'Diagnóstico gratuito'],
      kpi:         'Alcance, impressões, novos seguidores',
    },
    consideracao: {
      nome:        'Consideração',
      descricao:   'O cliente pesquisa soluções e compara alternativas',
      pergunta:    '"Lean Six Sigma vs. Automação? Consultoria vs. Contratar?"',
      canais:      ['Site', 'YouTube', 'Google', 'Reviews'],
      conteudo:    ['Cases com ROI', 'Comparativos', 'Testimonials', 'Demo/webinar'],
      kpi:         'Sessões no site, tempo na página, leads gerados',
    },
    decisao: {
      nome:        'Decisão',
      descricao:   'O cliente avalia a SmartOps especificamente',
      pergunta:    '"Posso confiar no Breno? O investimento vale a pena?"',
      canais:      ['Reunião', 'WhatsApp', 'Proposta', 'LinkedIn'],
      conteudo:    ['Proposta personalizada', 'Garantia', 'Piloto/diagnóstico', 'Referências'],
      kpi:         'Taxa de fechamento, tempo de decisão',
    },
    pos_compra: {
      nome:        'Pós-Compra',
      descricao:   'O cliente está no projeto — experiência e resultado são tudo',
      pergunta:    '"Valeu a pena? Estou vendo resultado?"',
      canais:      ['WhatsApp', 'Reuniões', 'Dashboard', 'Relatórios'],
      conteudo:    ['Relatórios de progresso', 'Quick wins visíveis', 'Comunicação proativa'],
      kpi:         'NPS, health score, retorno de reunião',
    },
    retencao: {
      nome:        'Retenção / Advocacy',
      descricao:   'O cliente renova e indica novos clientes',
      pergunta:    '"Quero continuar. Quero indicar."',
      canais:      ['WhatsApp', 'LinkedIn', 'Reunião de renovação'],
      conteudo:    ['Case study do cliente', 'Programa de indicação', 'Upsell de novo serviço'],
      kpi:         'Churn rate, upsell rate, indicações recebidas',
    },
  },

  // Pontos de fricção mais comuns
  friction_points: [
    { etapa: 'Consciência',  fricao: 'Não sabe que Lean+IA existe para PME', solucao: 'Conteúdo educativo específico para PME BH' },
    { etapa: 'Consideração', fricao: 'Site não convence — sem casos reais', solucao: 'Adicionar cases com ROI no site urgente' },
    { etapa: 'Decisão',      fricao: 'Preço parece alto sem contexto de ROI', solucao: 'Proposta com cálculo de ROI personalizado' },
    { etapa: 'Pós-compra',   fricao: 'Cliente não vê progresso nas primeiras 2 semanas', solucao: 'Quick wins documentados na primeira semana' },
    { etapa: 'Retenção',     fricao: 'Sem programa de indicação estruturado', solucao: 'Criar programa de referência com incentivo' },
  ],

  // Touchpoints digitais e físicos
  touchpoints: {
    digitais: ['Instagram', 'LinkedIn', 'Site', 'Google Ads', 'Email', 'WhatsApp', 'YouTube', 'Blog'],
    fisicos:  ['Reunião presencial BH', 'Evento/palestra', 'Workshop', 'Visita à operação do cliente'],
    hibridos: ['Webinar', 'Diagnóstico online', 'Reunião via Meet/Zoom'],
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
