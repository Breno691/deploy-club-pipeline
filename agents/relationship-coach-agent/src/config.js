// Relationship Coach Agent — config
const CONFIG = {
  agent: {
    name:    'Relationship Coach Agent',
    version: '1.0.0',
    role:    'Coach de Relacionamento, Conselheiro Afetivo e Criador de Mensagens Românticas',
    mission: 'Ajudar a cuidar do relacionamento com maturidade, respeito, carinho, presença e criatividade',
    mantra:  'Relacionamento saudável não é sobre acertar sempre. É sobre querer cuidar mesmo quando o dia não ajuda.',
  },

  // Linguagens do amor
  love_languages: {
    palavras:  { name: 'Palavras de Afirmação', desc: 'Elogios, mensagens, reconhecimento, frases de segurança' },
    tempo:     { name: 'Tempo de Qualidade',    desc: 'Momentos juntos, atenção sem distração, conversas profundas' },
    presentes: { name: 'Presentes',             desc: 'Lembranças simbólicas, pequenos mimos, surpresas com significado' },
    servicos:  { name: 'Atos de Serviço',       desc: 'Ajudar, facilitar, resolver, apoiar na rotina' },
    toque:     { name: 'Toque Físico',          desc: 'Abraço, mãos dadas, carinho, presença física respeitosa' },
  },

  // Tons disponíveis
  tones: {
    fofo:          'Leve, doce, carinho simples',
    romantico:     'Mais intenso, com emoção e presença',
    brincalhao:    'Divertido, sem perder o carinho',
    maduro:        'Calmo, bom para resolver conflito',
    saudade:       'Afetuoso, ideal para distância',
    reconciliacao: 'Humilde, cuidadoso e sincero',
  },

  // Aberturas para mensagens de bom dia
  morning_openers: [
    'Hoje eu acordei pensando em você...',
    'Acordei com você na cabeça e no coração...',
    'Tem dias que eu acordo e parece que meu coração lembra de você antes mesmo de eu abrir os olhos.',
    'Meu coração chegou em você antes de eu acordar.',
    'Hoje o dia começou com seu nome nos meus pensamentos.',
    'Acordei com um sorriso bobo aqui... e a culpa é sua.',
    'Hoje eu acordei com uma certeza muito boa no coração...',
  ],

  // Elementos de elogio
  compliments: {
    beleza:       ['Você é linda de um jeito raro.', 'Você é linda até nos momentos em que não percebe.', 'Você é linda no jeito de existir.'],
    personalidade: ['Você tem uma luz própria.', 'Você deixa tudo mais leve.', 'Você tem uma presença que acalma.'],
    existencia:   ['Você é uma das partes mais bonitas da minha vida.', 'Você virou meu lugar favorito.', 'Você é minha paz.'],
  },

  // Frases de refúgio emocional
  refuge_phrases: [
    'Se o dia ficar pesado, estou aqui.',
    'Volta pro meu abraço.',
    'Aqui no meu carinho você sempre tem abrigo.',
    'Quero ser sua paz.',
    'Você nunca precisa enfrentar tudo sozinha.',
    'Quero ser o lugar onde seu coração descansa.',
  ],

  // Fórmula das mensagens de bom dia
  morning_formula: [
    'Pensamento da manhã (pensou em você)',
    'Observação única sobre ela (personalidade/presença)',
    'Admiração profunda (força, delicadeza, jeito)',
    'Demonstração de cuidado (vai com calma, cuida de você)',
    'Refúgio emocional (estou aqui se o dia ficar pesado)',
    'Metáfora poética (você virou casa, meu lugar favorito)',
    'Fechamento acolhedor (tenha um dia lindo, minha princesa)',
  ],

  // Fechamentos
  closings: [
    'Tenha um dia lindo, minha princesa ❤️',
    'Vai viver seu dia sabendo que é muito amada 💖',
    'Leva meu carinho com você hoje ❤️',
    'Eu te amo, minha princesa 💖',
    'Tem alguém aqui torcendo por você ❤️',
    'Você é muito especial pra mim ❤️',
  ],

  // Tipos de conflito
  conflict_types: {
    ciumes:           { risco: 'medio', abordagem: 'Validar sentimento + reafirmar escolha + passar segurança' },
    falta_atencao:    { risco: 'baixo', abordagem: 'Pedir atenção com carinho, sem acusar, propor momento juntos' },
    discussao:        { risco: 'medio', abordagem: 'Acalmar, não vencer. Separar emoção de fato. Buscar reconexão.' },
    frieza:           { risco: 'baixo', abordagem: 'Demonstrar presença, dar espaço, não cobrar afeto' },
    inseguranca:      { risco: 'baixo', abordagem: 'Acolher, reafirmar sentimento, ser transparente' },
    distancia:        { risco: 'medio', abordagem: 'Observar sem acusar, perguntar com cuidado, propor conversa' },
  },

  // Alertas de relacionamento
  alerts: {
    amarelo: ['Falta de conversa', 'Frieza constante', 'Ciúmes frequente', 'Discussões repetidas', 'Falta de tempo de qualidade'],
    vermelho: ['Controle', 'Humilhação', 'Ameaças', 'Medo constante', 'Isolamento', 'Manipulação emocional'],
  },

  // Ideias de encontros
  date_ideas: {
    simples:  ['Caminhada juntos', 'Filme em casa', 'Lanche juntos', 'Ver fotos antigas', 'Montar playlist'],
    corridos: ['Mensagem curta de carinho', 'Perguntar se já comeu', 'Mandar uma música', 'Fazer elogio específico'],
    surpresa: ['Bilhete', 'Flor', 'Playlist personalizada', 'Carta manuscrita', 'Pequeno presente simbólico'],
  },

  // Perguntas para conexão
  connection_questions: {
    leves:    ['Qual foi a melhor parte do seu dia?', 'Que música te lembra a gente?', 'O que te faria sorrir agora?'],
    romanticas: ['Em que momento você percebeu que eu era especial?', 'O que você mais gosta na nossa conexão?', 'O que eu faço que te faz se sentir amada?'],
    melhoria: ['Tem algo que eu posso fazer melhor por nós?', 'Como você prefere receber carinho?', 'Em que momentos você sente falta de mim?'],
  },

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
