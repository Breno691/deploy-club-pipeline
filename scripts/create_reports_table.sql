-- SmartOps IA — Tabela de Relatórios dos Agentes
-- Executar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agent_daily_reports (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date            DATE NOT NULL,
  agent_key       TEXT NOT NULL,
  agent_name      TEXT NOT NULL,
  squad           TEXT NOT NULL,
  mode            TEXT,
  status          TEXT CHECK (status IN ('ok', 'partial', 'error')),
  content         TEXT,
  content_clean   TEXT,
  elapsed_seconds FLOAT DEFAULT 0,
  telegram_sent   BOOLEAN DEFAULT false,
  telegram_chunks INT DEFAULT 0,
  daily_tasks     JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_reports_date  ON agent_daily_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_reports_squad ON agent_daily_reports(squad);
CREATE INDEX IF NOT EXISTS idx_reports_key   ON agent_daily_reports(agent_key);

-- View de resumo diário
CREATE OR REPLACE VIEW daily_summary AS
SELECT
  date,
  COUNT(*)                                      AS total_agents,
  COUNT(*) FILTER (WHERE status = 'ok')         AS ok,
  COUNT(*) FILTER (WHERE status = 'partial')    AS partial,
  COUNT(*) FILTER (WHERE status = 'error')      AS errors,
  ROUND(AVG(elapsed_seconds)::numeric, 1)       AS avg_elapsed_s,
  COUNT(*) FILTER (WHERE telegram_sent = true)  AS telegram_sent
FROM agent_daily_reports
GROUP BY date
ORDER BY date DESC;

-- Habilitar RLS mas permitir leitura pública dos relatórios
ALTER TABLE agent_daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_read_all" ON agent_daily_reports
  FOR SELECT USING (true);

CREATE POLICY "reports_insert_service" ON agent_daily_reports
  FOR INSERT WITH CHECK (true);
