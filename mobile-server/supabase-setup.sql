-- ============================================================
-- SmartOps IA — Criar tabelas no Supabase
-- Cole este SQL no Supabase → SQL Editor → Run
-- ============================================================

-- Tabela de Leads
create table if not exists leads (
  id           bigserial primary key,
  nome         text,
  empresa      text,
  setor        text,
  cargo        text,
  origem       text,
  whatsapp     text,
  email        text,
  cidade       text default 'BH',
  problema_principal text,
  score        integer default 0,
  urgencia     text default 'media',
  status       text default 'novo',
  ultimo_contato date,
  notas        text,
  objection    text,
  created_at   timestamptz default now()
);

-- Tabela de Clientes
create table if not exists clients (
  id           bigserial primary key,
  nome         text not null,
  contato      text,
  whatsapp     text,
  projeto      text,
  tipo_projeto text,
  status       text default 'ativo',
  semana       integer default 1,
  total_semanas integer default 10,
  data_inicio  date,
  data_prevista_fim date,
  ticket       numeric default 0,
  ticket_pago  numeric default 0,
  nps_parcial  integer,
  resultado_parcial text,
  risco        text default 'baixo',
  ultimo_contato date,
  notas        text,
  created_at   timestamptz default now()
);

-- Tabela Financeiro (linha única — upsert no id=1)
create table if not exists financial (
  id                  integer primary key default 1,
  receita_projetos    numeric default 0,
  receita_fechamentos numeric default 0,
  receita_retainers   numeric default 0,
  receita_total       numeric default 0,
  custos_total        numeric default 600,
  margem_bruta        numeric default 0,
  leads_ativos        integer default 0,
  pipeline_valor      numeric default 0,
  reunioes            integer default 0,
  saude               text default 'pre-receita',
  updated_at          timestamptz default now()
);

-- Insert linha inicial do financeiro
insert into financial (id) values (1) on conflict (id) do nothing;

-- RLS desabilitado (acesso via service key no servidor)
alter table leads    disable row level security;
alter table clients  disable row level security;
alter table financial disable row level security;
