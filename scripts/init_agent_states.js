const fs = require('fs');
const path = require('path');
const today = new Date().toISOString().split('T')[0];

const agents = [
  { id: 'content-performance-agent', cargo: 'Diretor de Performance de Conteúdo', kpi: 'Formato/hook campeão identificado semanalmente', cadencia: 'Diária' },
  { id: 'automation-agent', cargo: 'Diretor de Automação', kpi: 'Horas economizadas por automação', cadencia: 'Diária' },
  { id: 'seo-agent', cargo: 'Diretor de SEO', kpi: '500+ visitas orgânicas/mês crescente', cadencia: 'Diária' },
  { id: 'customer-journey-agent', cargo: 'Diretor de Jornada', kpi: 'Tempo lead-to-client decrescente', cadencia: 'Semanal' },
  { id: 'knowledge-management-agent', cargo: 'Diretor de Conhecimento', kpi: 'SOPs documentados', cadencia: 'Semanal' },
  { id: 'case-study-agent', cargo: 'Diretor de Casos', kpi: '1 case publicado/mês', cadencia: 'Semanal' },
  { id: 'productization-agent', cargo: 'Diretor de Produtização', kpi: 'Receita de produtos crescente', cadencia: 'Mensal' },
  { id: 'competitor-intelligence-agent', cargo: 'Diretor de Inteligência Competitiva', kpi: 'Alertas de concorrentes em tempo real', cadencia: 'Diária' },
  { id: 'strategic-planning-agent', cargo: 'Diretor de Planejamento', kpi: '% metas cumpridas no prazo', cadencia: 'Diária' },
  { id: 'chief-of-staff-agent', cargo: 'Chefe de Gabinete', kpi: 'Tarefas estratégicas entregues/semana', cadencia: 'Diária' },
  { id: 'risk-agent', cargo: 'Diretor de Risco', kpi: 'Riscos críticos identificados antes de virarem problemas', cadencia: 'Diária' },
  { id: 'partnership-agent', cargo: 'Diretor de Parcerias', kpi: 'Parcerias ativas + leads por parceiros', cadencia: 'Semanal' },
  { id: 'authority-building-agent', cargo: 'Diretor de Autoridade', kpi: 'Convites/mês + DA do site', cadencia: 'Semanal' },
  { id: 'ai-lab-agent', cargo: 'Diretor de Inovação em IA', kpi: 'Ferramentas testadas/mês', cadencia: 'Semanal' },
  { id: 'marketing-research-agent', cargo: 'Diretor de Pesquisa', kpi: 'Insights acionáveis/semana', cadencia: 'Diária' },
  { id: 'design-agent', cargo: 'Diretor de Design', kpi: 'Criativos aprovados < 24h', cadencia: 'Por demanda' },
  { id: 'video-ad-specialist-agent', cargo: 'Diretor de Vídeo', kpi: 'VTR + CPV + conversão de vídeo', cadencia: 'Por demanda' },
  { id: 'distribution-agent', cargo: 'Diretor de Distribuição', kpi: 'Publicação no horário ideal + alcance', cadencia: 'Diária' },
  { id: 'process-mining-agent', cargo: 'Diretor de Descoberta de Processos', kpi: 'Processos descobertos e mapeados', cadencia: 'Diária' },
  { id: 'kaizen-agent', cargo: 'Diretor de Melhoria Contínua', kpi: 'Kaizens implementados/semana', cadencia: 'Diária' },
  { id: 'pricing-agent', cargo: 'Diretor de Precificação', kpi: 'Margem por contrato + valor percebido', cadencia: 'Semanal' },
  { id: 'executive-dashboard-agent', cargo: 'Diretor de Dashboards', kpi: 'Dashboards atualizados + dados corretos', cadencia: 'Diária' },
  { id: 'growth-intelligence-agent', cargo: 'Diretor de Growth', kpi: 'Novos canais validados/mês', cadencia: 'Semanal' },
  { id: 'orchestrator-agent', cargo: 'Maestro do Pipeline', kpi: 'Pipeline completo sem erros 3x/semana', cadencia: 'Ter/Qui/Sáb' },
  { id: 'ad-creative-designer-agent', cargo: 'Diretor de Criativos', kpi: 'Criativos/semana + CTR', cadencia: 'Por demanda' },
];

for (const a of agents) {
  const dir = path.join('agents', a.id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.join(dir, 'history'))) fs.mkdirSync(path.join(dir, 'history'), { recursive: true });

  const state = {
    agent: a.id,
    cargo: a.cargo,
    kpi_mestre: a.kpi,
    cadencia: a.cadencia,
    last_run: null,
    status: 'never_run',
    last_kpis: {},
    last_alerts: [],
    last_summary: '',
    last_next_action: '',
    sessions_today: 0,
    created_at: today,
  };
  fs.writeFileSync(path.join(dir, 'current_state.json'), JSON.stringify(state, null, 2));
  console.log(`✓ ${a.id}`);
}
console.log('\nTodos os estados inicializados.');
