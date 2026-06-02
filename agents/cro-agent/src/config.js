// CRO Agent — config
const CONFIG = {
  agent: {
    name:    'CRO Agent',
    version: '1.0.0',
    role:    'Especialista em Otimização de Conversão',
    mission: 'Transformar visitantes em leads e leads em clientes através de otimização sistemática',
    mantra:  'Teste tudo. Assuma nada. O dado decide.',
  },
  company: { name: 'SmartOps IA', owner: 'Breno Luiz', cert: 'Black Belt Lean Six Sigma', location: 'BH, MG' },

  // Benchmarks de conversão por etapa
  benchmarks: {
    landing_page_visitante_lead: { min: 1.0, ideal: 5.0, excelente: 10.0, unit: '%' },
    lead_reuniao:                { min: 10,  ideal: 30,  excelente: 50,   unit: '%' },
    reuniao_proposta:            { min: 50,  ideal: 70,  excelente: 90,   unit: '%' },
    proposta_cliente:            { min: 10,  ideal: 25,  excelente: 40,   unit: '%' },
    taxa_rejeicao_max:           { ideal: 60, alerta: 75, unit: '%' },
    tempo_sessao_min:            { ideal: 120, alerta: 60, unit: 'segundos' },
    paginas_por_sessao_min:      { ideal: 2.5, alerta: 1.5, unit: 'páginas' },
  },

  // Funil de vendas SmartOps
  funnel_stages: [
    { stage: 'Visitante', kpi: 'sessoes_mes', meta: 500,  desc: 'Pessoas que chegam ao site' },
    { stage: 'Engajado',  kpi: 'scroll_50pct', meta: 200, desc: 'Leram mais de 50% da página' },
    { stage: 'Lead',      kpi: 'form_submit',  meta: 15,  desc: 'Preencheram o formulário' },
    { stage: 'Qualificado', kpi: 'reuniao',   meta: 10,  desc: 'Reunião agendada e realizada' },
    { stage: 'Proposta',  kpi: 'proposta',     meta: 7,   desc: 'Proposta enviada' },
    { stage: 'Cliente',   kpi: 'fechamento',   meta: 2,   desc: 'Contrato assinado' },
  ],

  // Páginas críticas do site SmartOps
  key_pages: [
    { page: '/',                       nome: 'Home',               meta_conv: 3.0, tipo: 'awareness' },
    { page: '/diagnostico-gratuito',   nome: 'Diagnóstico Grátis', meta_conv: 10.0, tipo: 'lead_gen', prioridade: 'ALTA' },
    { page: '/servicos',               nome: 'Serviços',           meta_conv: 5.0, tipo: 'consideration' },
    { page: '/sobre',                  nome: 'Sobre',              meta_conv: 2.0, tipo: 'trust' },
    { page: '/blog',                   nome: 'Blog',               meta_conv: 1.0, tipo: 'seo' },
    { page: '/contato',                nome: 'Contato',            meta_conv: 15.0, tipo: 'decision' },
  ],

  // Elementos críticos de CRO
  cro_elements: {
    cta:       { desc: 'Call to Action', impacto: 'ALTO',   exemplos: ['Diagnóstico Grátis', 'Ver como funciona', 'Falar com especialista'] },
    headline:  { desc: 'Título principal', impacto: 'ALTO', exemplos: ['Resultado em X dias', 'R$ Y economizados', 'Seu processo sem desperdício'] },
    prova:     { desc: 'Prova social', impacto: 'ALTO',    exemplos: ['Cases com ROI', 'Depoimentos em vídeo', 'Número de clientes'] },
    urgencia:  { desc: 'Urgência/escassez', impacto: 'MEDIO', exemplos: ['Vagas limitadas', 'Prazo do diagnóstico', 'Desconto temporário'] },
    formulario: { desc: 'Formulário', impacto: 'ALTO',     exemplos: ['Máximo 3 campos', 'Placeholder claro', 'Botão de cor contrastante'] },
    velocidade: { desc: 'Velocidade da página', impacto: 'MEDIO', target: '< 3 segundos de carregamento' },
  },

  // Tipos de teste A/B
  ab_test_types: [
    { tipo: 'Headline',    impacto_tipico: '5-25%',  tempo_min: '7 dias',  prioridade: 1 },
    { tipo: 'CTA (texto)', impacto_tipico: '10-40%', tempo_min: '14 dias', prioridade: 1 },
    { tipo: 'CTA (cor)',   impacto_tipico: '3-15%',  tempo_min: '14 dias', prioridade: 2 },
    { tipo: 'Formulário',  impacto_tipico: '20-50%', tempo_min: '14 dias', prioridade: 1 },
    { tipo: 'Prova social', impacto_tipico: '10-30%', tempo_min: '14 dias', prioridade: 2 },
    { tipo: 'Layout',      impacto_tipico: '5-20%',  tempo_min: '21 dias', prioridade: 3 },
  ],

  claude: { model: 'claude-sonnet-4-6', maxTokens: 4096 },
};

module.exports = { CONFIG };
