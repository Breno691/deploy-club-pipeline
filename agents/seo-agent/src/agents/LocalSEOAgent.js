// LocalSEOAgent.js — SEO Local: Google Meu Negócio, BH, Minas Gerais
require('dotenv').config({ path: require('path').join(__dirname, '../../../../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { CONFIG } = require('../config');

const client = new Anthropic();

// Keywords locais estratégicas para SmartOps
const LOCAL_KEYWORDS = [
  { kw: 'consultoria lean belo horizonte',         vol: 'medio', priority: 10 },
  { kw: 'consultoria lean BH',                    vol: 'medio', priority: 10 },
  { kw: 'lean six sigma belo horizonte',           vol: 'medio', priority: 9  },
  { kw: 'consultoria operacional BH',              vol: 'baixo', priority: 8  },
  { kw: 'automação de processos belo horizonte',   vol: 'baixo', priority: 9  },
  { kw: 'consultoria lean minas gerais',           vol: 'baixo', priority: 7  },
  { kw: 'melhoria contínua BH',                   vol: 'baixo', priority: 7  },
  { kw: 'consultoria IA para empresas BH',         vol: 'baixo', priority: 9  },
  { kw: 'implementar lean pequena empresa BH',     vol: 'baixo', priority: 8  },
  { kw: 'redução de desperdício indústria BH',     vol: 'baixo', priority: 7  },
];

// Checklist Google Meu Negócio
const GMB_CHECKLIST = [
  { item: 'Nome exato da empresa',                       critical: true  },
  { item: 'Categoria principal: Consultoria Empresarial',critical: true  },
  { item: 'Endereço correto ou área de atendimento BH',  critical: true  },
  { item: 'Telefone atualizado',                         critical: true  },
  { item: 'Site adicionado',                             critical: true  },
  { item: 'Horário de atendimento',                      critical: false },
  { item: '10+ fotos do profissional e trabalhos',       critical: false },
  { item: '5+ avaliações com resposta',                  critical: false },
  { item: 'Posts semanais no GMB',                       critical: false },
  { item: 'Serviços listados com descrição',             critical: false },
  { item: 'Q&A respondido',                              critical: false },
];

function auditLocalSEOLocally(gmbData = {}) {
  const issues = GMB_CHECKLIST.filter(item => !gmbData[item.item] && item.critical)
    .map(item => ({ item: item.item, priority: 'P1' }));
  const improvements = GMB_CHECKLIST.filter(item => !gmbData[item.item] && !item.critical)
    .map(item => ({ item: item.item, priority: 'P2' }));

  const local_score = Math.max(0, 100 - (issues.length * 15) - (improvements.length * 5));
  return { local_score, issues, improvements, keywords: LOCAL_KEYWORDS };
}

async function analyzeLocalSEOWithClaude(localData = {}) {
  const audit = auditLocalSEOLocally(localData.gmb || {});

  const response = await client.messages.create({
    model: CONFIG.claude.model,
    max_tokens: CONFIG.claude.maxTokens,
    messages: [{
      role: 'user',
      content: `Você é o Local SEO Agent da SmartOps IA.

Missão: Maximizar visibilidade orgânica local em Belo Horizonte e Minas Gerais para SmartOps IA.

Empresa: SmartOps IA — consultoria Lean + Automação IA
Localização: Belo Horizonte, MG
Consultor: Breno Luiz — Black Belt Lean Six Sigma

Score local atual: ${audit.local_score}/100
Issues críticos no GMB: ${audit.issues.map(i => i.item).join(', ') || 'nenhum'}

Keywords locais estratégicas:
${LOCAL_KEYWORDS.map(k => `"${k.kw}" — prioridade ${k.priority}`).join('\n')}

Checklist GMB completo:
${GMB_CHECKLIST.map(i => `${i.critical ? '🔴' : '🟡'} ${i.item}`).join('\n')}

Responda:

# LOCAL SEO REPORT — SmartOps IA / BH

## SCORE LOCAL
Nota: ${audit.local_score}/100

## GOOGLE MEU NEGÓCIO — AUDITORIA
[Para cada item do checklist: status + recomendação]

## ESTRATÉGIA DE KEYWORDS LOCAIS
[Quais priorizar, onde usar (GMB, site, conteúdo)]

## CONTEÚDO LOCAL A CRIAR
[5 conteúdos com foco geográfico — ex: "Lean para indústria em BH"]

## ESTRATÉGIA DE AVALIAÇÕES
[Como conseguir avaliações autênticas no Google]

## PÁGINAS DE LOCALIZAÇÃO A CRIAR
[Páginas como "/consultoria-lean-belo-horizonte" com estrutura sugerida]

## PLANO DE AÇÃO LOCAL (30 dias)
[Semana a semana com ações específicas]

## ESTIMATIVA DE RESULTADO
[+X impressões locais em 60 dias com o plano implementado]`,
    }],
  });

  return response.content[0].text;
}

module.exports = { analyzeLocalSEOWithClaude, auditLocalSEOLocally, LOCAL_KEYWORDS, GMB_CHECKLIST };
