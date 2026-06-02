-- ============================================================
-- SISTEMA OS — SmartOps IA
-- Schema Completo do Banco de Dados
-- PostgreSQL + pgvector
-- Versão: 2026-05-30
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca textual eficiente

-- ============================================================
-- CAMADA 1 — IDENTIDADE E CONFIGURAÇÃO
-- ============================================================

CREATE TABLE agents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        VARCHAR(60) UNIQUE NOT NULL,         -- 'ads-agent'
    name            VARCHAR(100) NOT NULL,
    cargo           VARCHAR(100),
    squad           VARCHAR(50),                          -- 'marketing', 'sales', etc.
    autonomy_level  SMALLINT NOT NULL DEFAULT 2,          -- 1-5
    kpi_master      VARCHAR(200),
    cadencia        VARCHAR(30) DEFAULT 'daily',          -- daily/weekly/triggered
    enabled         BOOLEAN DEFAULT TRUE,
    prompt_version  VARCHAR(20) DEFAULT '1.0',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_config (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id    VARCHAR(60) REFERENCES agents(agent_id),
    key         VARCHAR(100) NOT NULL,
    value       JSONB,
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, key)
);

-- ============================================================
-- CAMADA 2 — EXECUÇÃO E HISTÓRICO
-- ============================================================

CREATE TABLE agent_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(80) UNIQUE NOT NULL,
    agent_id        VARCHAR(60) REFERENCES agents(agent_id),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    finished_at     TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'running', -- running/completed/failed
    trigger_type    VARCHAR(30),                   -- schedule/webhook/agent/manual
    triggered_by    VARCHAR(60),                   -- outro agent_id ou 'schedule'
    duration_ms     INTEGER,
    tokens_used     INTEGER,
    summary         TEXT,
    next_action     TEXT,
    error_message   TEXT
);

CREATE TABLE agent_observations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  VARCHAR(80) REFERENCES agent_sessions(session_id),
    agent_id    VARCHAR(60),
    observed_at TIMESTAMPTZ DEFAULT NOW(),
    category    VARCHAR(50),       -- 'kpi', 'alert', 'market', 'client'
    data        JSONB NOT NULL,
    confidence  DECIMAL(3,2)       -- 0.00–1.00
);

CREATE TABLE agent_decisions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(80) REFERENCES agent_sessions(session_id),
    agent_id        VARCHAR(60),
    decided_at      TIMESTAMPTZ DEFAULT NOW(),
    decision_type   VARCHAR(50),   -- 'pause', 'scale', 'alert', 'ticket', 'report'
    description     TEXT NOT NULL,
    rationale       TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by     VARCHAR(60),
    approved_at     TIMESTAMPTZ,
    executed        BOOLEAN DEFAULT FALSE,
    executed_at     TIMESTAMPTZ
);

CREATE TABLE agent_actions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  VARCHAR(80) REFERENCES agent_sessions(session_id),
    agent_id    VARCHAR(60),
    action_at   TIMESTAMPTZ DEFAULT NOW(),
    action_type VARCHAR(50),       -- 'api_call', 'db_write', 'telegram', 'ticket'
    description TEXT NOT NULL,
    payload     JSONB,
    result      JSONB,
    success     BOOLEAN,
    duration_ms INTEGER
);

CREATE TABLE agent_alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        VARCHAR(60),
    session_id      VARCHAR(80),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    level           VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
    category        VARCHAR(50),
    message         TEXT NOT NULL,
    threshold_hit   VARCHAR(200),
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    resolved_by     VARCHAR(60),
    notified_via    VARCHAR(30)            -- 'telegram', 'dashboard', 'email'
);

-- ============================================================
-- CAMADA 3 — KPIs E MÉTRICAS
-- ============================================================

CREATE TABLE kpi_snapshots (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id    VARCHAR(60),
    snapshot_at TIMESTAMPTZ DEFAULT NOW(),
    period      VARCHAR(20),   -- 'daily', 'weekly', 'monthly'
    metrics     JSONB NOT NULL,-- {"cpa": 72, "ctr": 0.021, "leads": 3}
    vs_target   JSONB,         -- {"cpa": -20, "ctr": -16}  (% vs meta)
    trend       VARCHAR(10)    -- 'up', 'down', 'stable'
);

CREATE TABLE kpi_targets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id    VARCHAR(60),
    metric_name VARCHAR(80) NOT NULL,
    target_value DECIMAL(15,4),
    target_unit VARCHAR(30),
    period      VARCHAR(20) DEFAULT 'monthly',
    set_at      TIMESTAMPTZ DEFAULT NOW(),
    set_by      VARCHAR(60),
    UNIQUE(agent_id, metric_name, period)
);

-- ============================================================
-- CAMADA 4 — LEADS E CRM
-- ============================================================

CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    nome            VARCHAR(100),
    empresa         VARCHAR(100),
    cargo           VARCHAR(80),
    whatsapp        VARCHAR(20),
    email           VARCHAR(100),
    cidade          VARCHAR(80),
    estado          CHAR(2) DEFAULT 'MG',
    segmento        VARCHAR(80),
    funcionarios    INTEGER,
    origem          VARCHAR(60),   -- 'google_ads', 'instagram', 'indicacao', 'organico'
    campanha_id     VARCHAR(80),
    score           SMALLINT,      -- 0-100
    score_label     CHAR(2),       -- 'A+', 'A', 'B', 'C', 'D'
    score_updated   TIMESTAMPTZ,
    urgencia        VARCHAR(20),   -- 'alta', 'media', 'baixa'
    status          VARCHAR(30) DEFAULT 'novo', -- novo/contatado/reuniao/proposta/cliente/perdido
    assigned_at     TIMESTAMPTZ,
    first_contact   TIMESTAMPTZ,
    notes           TEXT,
    raw_data        JSONB
);

CREATE TABLE lead_interactions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id     UUID REFERENCES leads(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    type        VARCHAR(30), -- 'whatsapp', 'call', 'email', 'meeting', 'proposal'
    direction   CHAR(2),     -- 'in', 'out'
    content     TEXT,
    outcome     VARCHAR(50),
    by_agent    VARCHAR(60)
);

CREATE TABLE meetings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID REFERENCES leads(id),
    scheduled_at    TIMESTAMPTZ,
    duration_min    INTEGER DEFAULT 30,
    type            VARCHAR(30) DEFAULT 'diagnostico_gratuito',
    status          VARCHAR(20) DEFAULT 'agendada', -- agendada/realizada/cancelada/no_show
    dossier_ready   BOOLEAN DEFAULT FALSE,
    dossier_data    JSONB,
    outcome         VARCHAR(50),  -- 'proposta', 'sem_fit', 'nurture', 'reagendar'
    proposal_sent   BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    created_by      VARCHAR(60)
);

-- ============================================================
-- CAMADA 5 — PROPOSTAS E CONTRATOS
-- ============================================================

CREATE TABLE proposals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID REFERENCES leads(id),
    meeting_id      UUID REFERENCES meetings(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    sent_at         TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'draft', -- draft/sent/accepted/rejected/expired
    package_type    VARCHAR(50),  -- 'lean_six_sigma', 'automacao_ia', 'combo', 'sprint'
    valor_mensal    DECIMAL(10,2),
    valor_total     DECIMAL(10,2),
    prazo_meses     SMALLINT,
    roi_projetado   DECIMAL(10,2),
    economia_mensal DECIMAL(10,2),
    payback_meses   SMALLINT,
    escopo          JSONB,
    cronograma      JSONB,
    pdf_url         VARCHAR(500),
    decision_at     TIMESTAMPTZ,
    rejection_reason TEXT,
    generated_by    VARCHAR(60) DEFAULT 'proposal-agent'
);

CREATE TABLE contracts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID REFERENCES leads(id),
    proposal_id     UUID REFERENCES proposals(id),
    signed_at       TIMESTAMPTZ,
    start_date      DATE,
    end_date        DATE,
    status          VARCHAR(20) DEFAULT 'ativo', -- ativo/pausado/encerrado/renovado
    valor_mensal    DECIMAL(10,2),
    package_type    VARCHAR(50),
    prazo_meses     SMALLINT,
    auto_renew      BOOLEAN DEFAULT TRUE,
    nps_score       SMALLINT,
    nps_at          TIMESTAMPTZ
);

-- ============================================================
-- CAMADA 6 — FINANCEIRO
-- ============================================================

CREATE TABLE revenue_entries (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(id),
    date        DATE NOT NULL,
    type        VARCHAR(30),   -- 'mensalidade', 'setup', 'extra', 'reembolso'
    amount      DECIMAL(10,2) NOT NULL,
    status      VARCHAR(20) DEFAULT 'pendente', -- pendente/pago/atrasado/cancelado
    paid_at     TIMESTAMPTZ,
    notes       TEXT
);

CREATE TABLE expenses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date        DATE NOT NULL,
    category    VARCHAR(50),   -- 'ferramentas', 'ads', 'freelancer', 'infra', 'outros'
    description VARCHAR(200),
    amount      DECIMAL(10,2) NOT NULL,
    recurring   BOOLEAN DEFAULT FALSE,
    period      VARCHAR(20),
    notes       TEXT
);

CREATE TABLE mrr_snapshots (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_at TIMESTAMPTZ DEFAULT NOW(),
    date        DATE NOT NULL UNIQUE,
    mrr         DECIMAL(10,2),
    arr         DECIMAL(10,2),
    new_mrr     DECIMAL(10,2),
    churn_mrr   DECIMAL(10,2),
    expansion   DECIMAL(10,2),
    clients     INTEGER,
    avg_ticket  DECIMAL(10,2)
);

-- ============================================================
-- CAMADA 7 — MARKETING E CONTEÚDO
-- ============================================================

CREATE TABLE content_ideas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    agent_id    VARCHAR(60),
    topic       VARCHAR(200),
    hook        TEXT,
    format      VARCHAR(30),   -- 'reel', 'carrossel', 'post', 'story', 'linkedin'
    angle       VARCHAR(100),
    priority    SMALLINT DEFAULT 2,  -- 1-5
    status      VARCHAR(20) DEFAULT 'backlog',
    research_data JSONB
);

CREATE TABLE content_calendar (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id         UUID REFERENCES content_ideas(id),
    scheduled_for   TIMESTAMPTZ,
    channel         VARCHAR(30),   -- 'instagram', 'linkedin', 'youtube', 'threads'
    format          VARCHAR(30),
    status          VARCHAR(20) DEFAULT 'planejado',
    assigned_agent  VARCHAR(60)
);

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id     UUID REFERENCES content_calendar(id),
    published_at    TIMESTAMPTZ,
    channel         VARCHAR(30),
    type            VARCHAR(30),
    caption         TEXT,
    media_urls      JSONB,
    external_id     VARCHAR(100),  -- ID na plataforma (Instagram post ID, etc.)
    status          VARCHAR(20) DEFAULT 'rascunho',
    -- métricas (atualizar via jobs)
    reach           INTEGER DEFAULT 0,
    impressions     INTEGER DEFAULT 0,
    likes           INTEGER DEFAULT 0,
    comments        INTEGER DEFAULT 0,
    shares          INTEGER DEFAULT 0,
    saves           INTEGER DEFAULT 0,
    ctr             DECIMAL(5,4),
    engagement_rate DECIMAL(5,4),
    leads_gerados   INTEGER DEFAULT 0
);

-- ============================================================
-- CAMADA 8 — ADS E CAMPANHAS
-- ============================================================

CREATE TABLE ad_campaigns (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform        VARCHAR(20),   -- 'google', 'meta'
    external_id     VARCHAR(60),
    name            VARCHAR(200),
    objective       VARCHAR(50),
    status          VARCHAR(20),
    budget_daily    DECIMAL(8,2),
    start_date      DATE,
    end_date        DATE,
    target_audience JSONB,
    created_by      VARCHAR(60) DEFAULT 'ads-agent'
);

CREATE TABLE ad_performance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     UUID REFERENCES ad_campaigns(id),
    date            DATE NOT NULL,
    impressions     INTEGER DEFAULT 0,
    clicks          INTEGER DEFAULT 0,
    spend           DECIMAL(8,2) DEFAULT 0,
    conversions     INTEGER DEFAULT 0,
    ctr             DECIMAL(6,4),
    cpc             DECIMAL(8,2),
    cpa             DECIMAL(8,2),
    roas            DECIMAL(6,2),
    quality_score   SMALLINT,
    frequency       DECIMAL(4,2),
    UNIQUE(campaign_id, date)
);

-- ============================================================
-- CAMADA 9 — CLIENTES E SUCESSO
-- ============================================================

CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id     UUID REFERENCES contracts(id),
    lead_id         UUID REFERENCES leads(id),
    nome_empresa    VARCHAR(100),
    contato_nome    VARCHAR(100),
    contato_wp      VARCHAR(20),
    contato_email   VARCHAR(100),
    segmento        VARCHAR(80),
    status          VARCHAR(20) DEFAULT 'ativo',
    health_score    SMALLINT DEFAULT 100,  -- 0-100
    risk_level      VARCHAR(10) DEFAULT 'low', -- low/medium/high/critical
    last_contact    DATE,
    next_review     DATE,
    onboarded_at    DATE,
    kickoff_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_deliverables (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID REFERENCES clients(id),
    title           VARCHAR(200),
    type            VARCHAR(50),   -- 'diagnostico', 'vsm', 'kaizen', 'relatorio', 'treinamento'
    due_date        DATE,
    delivered_at    TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'pendente',
    result_metric   VARCHAR(200),  -- 'economizou R$12k/mês', etc.
    notes           TEXT
);

CREATE TABLE client_nps (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id   UUID REFERENCES clients(id),
    surveyed_at TIMESTAMPTZ DEFAULT NOW(),
    score       SMALLINT NOT NULL,  -- 0-10
    category    VARCHAR(20),        -- 'promotor', 'neutro', 'detrator'
    comment     TEXT,
    follow_up   BOOLEAN DEFAULT FALSE,
    follow_up_at TIMESTAMPTZ
);

-- ============================================================
-- CAMADA 10 — OPERAÇÕES E PROCESSOS
-- ============================================================

CREATE TABLE processes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID REFERENCES clients(id),
    name            VARCHAR(200),
    description     TEXT,
    owner           VARCHAR(100),
    lead_time_hours DECIMAL(8,2),
    cycle_time_hours DECIMAL(8,2),
    rework_rate     DECIMAL(5,4),
    sigma_level     DECIMAL(4,2),
    status          VARCHAR(20) DEFAULT 'mapeado',
    mapped_at       DATE,
    last_reviewed   DATE
);

CREATE TABLE kaizens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id      UUID REFERENCES processes(id),
    client_id       UUID REFERENCES clients(id),
    title           VARCHAR(200),
    problem         TEXT,
    solution        TEXT,
    type            WASTE_TYPE DEFAULT 'excesso_processo',
    status          VARCHAR(20) DEFAULT 'identificado',
    priority        SMALLINT DEFAULT 2,
    estimated_gain  DECIMAL(10,2),  -- R$/mês
    actual_gain     DECIMAL(10,2),
    implemented_at  DATE,
    verified_at     DATE
);

CREATE TYPE WASTE_TYPE AS ENUM (
    'defeitos', 'supoproducao', 'espera', 'nao_utilizacao',
    'transporte', 'inventario', 'movimento', 'excesso_processo'
);

-- ============================================================
-- CAMADA 11 — AUTOMAÇÕES
-- ============================================================

CREATE TABLE automations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200),
    description     TEXT,
    trigger_type    VARCHAR(50),   -- 'schedule', 'webhook', 'event', 'manual'
    trigger_config  JSONB,
    tool            VARCHAR(30),   -- 'n8n', 'zapier', 'make', 'custom'
    workflow_id     VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'ativo',
    success_rate    DECIMAL(5,4) DEFAULT 1.0,
    runs_total      INTEGER DEFAULT 0,
    runs_success    INTEGER DEFAULT 0,
    hours_saved_month DECIMAL(6,2),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    created_by      VARCHAR(60) DEFAULT 'automation-agent',
    last_run        TIMESTAMPTZ,
    last_error      TEXT
);

-- ============================================================
-- CAMADA 12 — MEMÓRIA VETORIAL (pgvector)
-- ============================================================

CREATE TABLE memory_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        VARCHAR(60),
    type            VARCHAR(50),   -- 'insight', 'case', 'sop', 'learning', 'pattern'
    content         TEXT NOT NULL,
    embedding       VECTOR(1536),  -- OpenAI text-embedding-ada-002
    metadata        JSONB,
    relevance_score DECIMAL(4,3),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,   -- NULL = permanente
    source_session  VARCHAR(80)
);

-- Índice para busca semântica eficiente
CREATE INDEX ON memory_documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE TABLE case_studies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID REFERENCES clients(id),
    title           VARCHAR(200),
    segmento        VARCHAR(80),
    problema        TEXT,
    solucao         TEXT,
    resultado       TEXT,
    roi             DECIMAL(10,2),
    economia_mensal DECIMAL(10,2),
    prazo_semanas   SMALLINT,
    published       BOOLEAN DEFAULT FALSE,
    published_at    DATE,
    url             VARCHAR(500),
    embedding       VECTOR(1536),
    created_by      VARCHAR(60) DEFAULT 'case-study-agent',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CAMADA 13 — CONHECIMENTO E SOPs
-- ============================================================

CREATE TABLE sops (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(200),
    process     VARCHAR(100),
    version     VARCHAR(20) DEFAULT '1.0',
    content     TEXT,
    owner       VARCHAR(60),
    status      VARCHAR(20) DEFAULT 'ativo',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    embedding   VECTOR(1536)
);

CREATE TABLE market_trends (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    category    VARCHAR(50),   -- 'instagram_design', 'reels_format', 'hook', 'audio'
    trend       TEXT,
    source      VARCHAR(200),
    confidence  DECIMAL(3,2),
    expires_at  TIMESTAMPTZ,
    used_in     JSONB          -- onde foi aplicado
);

-- ============================================================
-- CAMADA 14 — COLABORAÇÃO ENTRE AGENTES
-- ============================================================

CREATE TABLE agent_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sent_at     TIMESTAMPTZ DEFAULT NOW(),
    from_agent  VARCHAR(60),
    to_agent    VARCHAR(60),   -- 'broadcast' para todos
    type        VARCHAR(20),   -- 'request', 'alert', 'report', 'data', 'ack'
    priority    CHAR(2) DEFAULT 'P2',  -- P1/P2/P3
    subject     VARCHAR(200),
    payload     JSONB,
    requires_response BOOLEAN DEFAULT FALSE,
    response_deadline TIMESTAMPTZ,
    responded   BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMPTZ,
    response    JSONB
);

CREATE TABLE tickets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    created_by      VARCHAR(60),   -- agent_id
    assigned_to     VARCHAR(60),   -- agent_id
    title           VARCHAR(200),
    description     TEXT,
    type            VARCHAR(30),   -- 'cro', 'copy', 'design', 'automation', 'bug'
    priority        CHAR(2) DEFAULT 'P2',
    status          VARCHAR(20) DEFAULT 'aberto',
    resolved_at     TIMESTAMPTZ,
    resolution      TEXT,
    session_origin  VARCHAR(80)
);

-- ============================================================
-- CAMADA 15 — SEO E CONTEÚDO ORGÂNICO
-- ============================================================

CREATE TABLE seo_keywords (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword         VARCHAR(200),
    volume_monthly  INTEGER,
    difficulty      SMALLINT,
    intent          VARCHAR(20),   -- 'informacional', 'transacional', 'navegacional'
    position        SMALLINT,
    position_date   DATE,
    page_url        VARCHAR(500),
    target          BOOLEAN DEFAULT FALSE,  -- keyword priorizada
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- Funil de conversão atual
CREATE VIEW v_funnel AS
SELECT
    COUNT(*) FILTER (WHERE status = 'novo')       AS leads_novos,
    COUNT(*) FILTER (WHERE status = 'contatado')  AS leads_contatados,
    COUNT(*) FILTER (WHERE status = 'reuniao')    AS em_reuniao,
    COUNT(*) FILTER (WHERE status = 'proposta')   AS em_proposta,
    COUNT(*) FILTER (WHERE status = 'cliente')    AS clientes,
    COUNT(*) FILTER (WHERE status = 'perdido')    AS perdidos,
    ROUND(
        COUNT(*) FILTER (WHERE status IN ('cliente','proposta','reuniao','contatado'))::NUMERIC /
        NULLIF(COUNT(*), 0) * 100, 1
    ) AS taxa_engajamento_pct
FROM leads;

-- MRR atual
CREATE VIEW v_mrr_atual AS
SELECT
    SUM(c.valor_mensal) AS mrr,
    COUNT(*) AS clientes_ativos,
    AVG(c.valor_mensal) AS ticket_medio
FROM contracts c
WHERE c.status = 'ativo';

-- KPIs dos agentes hoje
CREATE VIEW v_agent_kpis_hoje AS
SELECT
    k.agent_id,
    a.cargo,
    k.metrics,
    k.vs_target,
    k.trend,
    k.snapshot_at
FROM kpi_snapshots k
JOIN agents a ON a.agent_id = k.agent_id
WHERE k.period = 'daily'
  AND k.snapshot_at::DATE = CURRENT_DATE;

-- Alertas críticos não resolvidos
CREATE VIEW v_alertas_criticos AS
SELECT
    al.*,
    a.cargo
FROM agent_alerts al
JOIN agents a ON a.agent_id = al.agent_id
WHERE al.level = 'critical'
  AND al.resolved = FALSE
ORDER BY al.created_at DESC;

-- Health dos clientes
CREATE VIEW v_client_health AS
SELECT
    c.nome_empresa,
    c.health_score,
    c.risk_level,
    c.last_contact,
    CURRENT_DATE - c.last_contact AS dias_sem_contato,
    n.score AS ultimo_nps
FROM clients c
LEFT JOIN LATERAL (
    SELECT score FROM client_nps WHERE client_id = c.id
    ORDER BY surveyed_at DESC LIMIT 1
) n ON TRUE
WHERE c.status = 'ativo'
ORDER BY c.health_score ASC;

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX idx_leads_score        ON leads(score DESC);
CREATE INDEX idx_leads_status       ON leads(status);
CREATE INDEX idx_leads_origem       ON leads(origem);
CREATE INDEX idx_sessions_agent     ON agent_sessions(agent_id, started_at DESC);
CREATE INDEX idx_sessions_status    ON agent_sessions(status);
CREATE INDEX idx_alerts_agent       ON agent_alerts(agent_id, resolved, level);
CREATE INDEX idx_alerts_unresolved  ON agent_alerts(resolved, level, created_at DESC)
    WHERE resolved = FALSE;
CREATE INDEX idx_kpi_agent_date     ON kpi_snapshots(agent_id, snapshot_at DESC);
CREATE INDEX idx_posts_channel      ON posts(channel, published_at DESC);
CREATE INDEX idx_messages_to        ON agent_messages(to_agent, responded, sent_at DESC);
CREATE INDEX idx_tickets_assignee   ON tickets(assigned_to, status);
CREATE INDEX idx_contracts_status   ON contracts(status);
CREATE INDEX idx_ad_perf_date       ON ad_performance(date DESC, campaign_id);

-- Busca textual em memory_documents
CREATE INDEX idx_memory_content     ON memory_documents USING gin(content gin_trgm_ops);

-- ============================================================
-- SEED — AGENTES INICIAIS
-- ============================================================

INSERT INTO agents (agent_id, name, cargo, squad, autonomy_level, kpi_master, cadencia) VALUES
-- SQUAD 1 — MARKETING
('copywriter-agent',        'Copywriter Agent',         'Diretor de Comunicação',           'marketing',  4, 'CTR ads ≥ 2.5%',              'daily'),
('design-agent',            'Design Agent',             'Diretor de Design',                'marketing',  3, 'Criativos aprovados < 24h',    'triggered'),
('distribution-agent',      'Distribution Agent',       'Diretor de Distribuição',          'marketing',  3, 'Publicação no horário ideal',  'daily'),
('marketing-research-agent','Marketing Research Agent', 'Diretor de Pesquisa',              'marketing',  2, 'Insights acionáveis/semana',   'daily'),
('seo-agent',               'SEO Agent',                'Diretor de SEO',                   'marketing',  3, '500+ visitas orgânicas/mês',   'daily'),
('video-ad-specialist-agent','Video Ad Specialist',     'Diretor de Vídeo',                 'marketing',  3, 'VTR + CPV + conversão',        'triggered'),
('content-performance-agent','Content Performance Agent','Diretor de Performance de Conteúdo','marketing',3, 'Formato/hook campeão semanal', 'daily'),
-- SQUAD 2 — GROWTH
('cro-agent',               'CRO Agent',                'Diretor de Conversão',             'growth',     4, 'Conversion Rate ≥ 5%',         'daily'),
('customer-journey-agent',  'Customer Journey Agent',   'Diretor de Jornada',               'growth',     2, 'Lead-to-client tempo',         'weekly'),
('revenue-agent',           'Revenue Agent',            'Chief Revenue Intelligence',       'growth',     3, 'MRR crescente',                'daily'),
('ads-agent',               'Ads Agent',                'Diretor de Mídia Paga',            'growth',     4, 'CPA ≤ R$60',                   'daily'),
('website-analytics-agent', 'Website Analytics Agent',  'Diretor de Analytics',             'growth',     3, 'Conversão ≥ 5%',               'daily'),
-- SQUAD 3 — OPERATIONS
('lean-agent',              'Lean Agent',               'Diretor Lean',                     'operations', 3, 'Economia gerada R$/mês',       'daily'),
('six-sigma-agent',         'Six Sigma Agent',          'Diretor de Qualidade',             'operations', 3, 'Sigma Level crescente',        'daily'),
('kaizen-agent',            'Kaizen Agent',             'Diretor de Melhoria Contínua',     'operations', 4, 'Kaizens implementados/semana', 'daily'),
('process-mining-agent',    'Process Mining Agent',     'Diretor de Descoberta de Processos','operations',2, 'Processos descobertos',        'daily'),
('automation-agent',        'Automation Agent',         'Diretor de Automação',             'operations', 4, 'Horas economizadas/mês',       'daily'),
-- SQUAD 4 — SALES
('sales-intelligence-agent','Sales Intelligence Agent', 'Diretor Comercial',                'sales',      3, 'Reunião→Proposta ≥ 40%',       'daily'),
('proposal-agent',          'Proposal Agent',           'Diretor de Propostas',             'sales',      3, 'Proposta→Contrato ≥ 60%',      'triggered'),
('offer-optimization-agent','Offer Optimization Agent', 'Diretor de Ofertas',               'sales',      2, 'Ticket médio +10%/mês',        'daily'),
('pricing-agent',           'Pricing Agent',            'Diretor de Precificação',          'sales',      2, 'Margem por contrato ≥ 60%',    'weekly'),
-- SQUAD 5 — EXECUTIVE
('executive-dashboard-agent','Executive Dashboard Agent','Diretor de Dashboards',           'executive',  3, 'Dashboards atualizados',       'daily'),
('competitor-intelligence-agent','Competitor Intelligence','Diretor de Inteligência Competitiva','executive',2,'Alertas de concorrentes',    'daily'),
('strategic-planning-agent','Strategic Planning Agent', 'Diretor de Planejamento',          'executive',  3, '% metas cumpridas ≥ 80%',      'daily'),
('ceo-advisor-agent',       'CEO Advisor Agent',        'CEO Virtual',                      'executive',  5, 'Receita mensal crescente',      'daily'),
('chief-of-staff-agent',    'Chief of Staff Agent',     'Chefe de Gabinete',                'executive',  4, 'Tarefas estratégicas/semana',  'daily'),
-- SQUAD 6 — KNOWLEDGE
('knowledge-management-agent','Knowledge Management Agent','Diretor de Conhecimento',       'knowledge',  3, 'SOPs documentados',            'weekly'),
('case-study-agent',        'Case Study Agent',         'Diretor de Casos',                 'knowledge',  3, '1 case publicado/mês',         'weekly'),
('productization-agent',    'Productization Agent',     'Diretor de Produtização',          'knowledge',  2, 'Receita de produtos',          'monthly'),
-- SQUAD 7 — CLIENT SUCCESS
('client-success-agent',    'Client Success Agent',     'Diretor de Sucesso do Cliente',    'client_success',3,'NPS ≥ 9 + Renovação ≥ 90%', 'daily'),
('risk-agent',              'Risk Agent',               'Diretor de Risco',                 'client_success',3,'Riscos críticos prevenidos',  'daily'),
-- SQUAD 8 — FINANCE
('financial-intelligence-agent','Financial Intelligence Agent','Diretor Financeiro',        'finance',    3, 'Margem ≥ 60%',                 'daily'),
-- SQUAD 9 — PERSONAL BRAND
('personal-brand-agent',    'Personal Brand Agent',     'Diretor de Marca Pessoal',         'personal_brand',3,'+500 seguidores/mês',        'daily'),
('authority-building-agent','Authority Building Agent', 'Diretor de Autoridade',            'personal_brand',2,'Convites/mês + DA',          'weekly'),
('partnership-agent',       'Partnership Agent',        'Diretor de Parcerias',             'personal_brand',2,'Parcerias ativas',           'weekly');
