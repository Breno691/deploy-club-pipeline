// Copywriter Agent — config
const CONFIG = {
  agent: {
    name: 'Copywriter Agent',
    version: '1.0.0',
    role: 'Copywriter Especialista em Conversão, Storytelling e Marketing Digital',
    mission: 'Criar copy que converte — hooks que param o scroll, CTAs que fazem clicar, scripts que fecham vendas',
    mantra: 'Bom copy não vende produto. Vende a transformação que o produto entrega.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', niche: 'Lean + Automação + IA para PMEs em BH/MG' },

  frameworks: {
    AIDA:  ['Atenção', 'Interesse', 'Desejo', 'Ação'],
    PAS:   ['Problema', 'Agitação', 'Solução'],
    BAB:   ['Before (antes)', 'After (depois)', 'Bridge (como chegar lá)'],
    STAR:  ['Situação', 'Tarefa', 'Ação', 'Resultado'],
    PASTOR: ['Problema', 'Amplificação', 'Story', 'Transformação', 'Oferta', 'Resposta'],
  },

  hooks: {
    curiosidade: ['Você sabe por que...', 'Ninguém te conta que...', 'A verdade sobre...', 'O erro que 90% das empresas cometem com...'],
    dor:         ['Cansado de...', 'Ainda perdendo tempo com...', 'Seu processo está te custando R$...', 'Enquanto você...'],
    prova:       ['De R$X para R$Y em Z dias', 'Como [cliente] reduziu em X% com...', 'O método que gerou...'],
    numero:      ['5 sinais de que...', '3 erros fatais em...', 'Os 8 desperdícios que...', '1 mudança que...'],
    urgencia:    ['Só até sexta', 'Últimas vagas', 'Sem isso, seu negócio vai...'],
  },

  ctas: {
    diagnostico: ['Quero meu diagnóstico gratuito', 'Descubra onde seu processo está falhando', 'Analise minha operação agora'],
    reuniao:     ['Agendar reunião rápida', 'Falar com especialista', 'Ver como funciona'],
    conteudo:    ['Ver o método completo', 'Baixar guia gratuito', 'Assistir ao vídeo'],
  },

  audiences: {
    dono_pme:     { dores: ['retrabalho', 'dependência de pessoas-chave', 'processo no improviso', 'crescimento travado'], linguagem: 'direto, sem jargão técnico' },
    gestor_ops:   { dores: ['indicadores deficientes', 'times sobrecarregados', 'processos não documentados'], linguagem: 'técnico mas prático' },
    diretor:      { dores: ['margem caindo', 'escala impossível', 'decisão sem dado'], linguagem: 'estratégico e baseado em ROI' },
  },

  platforms: {
    instagram: { max_caption: 2200, ideal_chars: 1000, hashtags: 15, hook_lines: 2 },
    threads:   { max_chars: 500, tone: 'conversacional e direto' },
    linkedin:  { max_chars: 3000, tone: 'profissional e baseado em dados' },
    youtube:   { title_max: 100, desc_max: 5000, hook_seconds: 30 },
    whatsapp:  { max_msg: 1000, tone: 'pessoal, direto, sem formatação excessiva' },
    email:     { subject_max: 60, preview_max: 90 },
  },

  services: [
    { nome: 'Diagnóstico Express', preco: 'R$997–R$2.500', promessa: 'Mapa completo de gargalos em 7 dias' },
    { nome: 'Organização de Processos', preco: 'R$3.000–R$8.000', promessa: 'Processos documentados e equipe treinada em 60 dias' },
    { nome: 'Lean + Melhoria Contínua', preco: 'R$5.000–R$15.000', promessa: 'Redução de 30% em retrabalho em 90 dias' },
    { nome: 'Automação de Processos', preco: 'R$4.000–R$10.000', promessa: 'Até 40 horas/mês liberadas com automação' },
    { nome: 'Transformação Operacional', preco: 'R$15.000–R$50.000', promessa: 'Operação profissional e escalável em 6 meses' },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
