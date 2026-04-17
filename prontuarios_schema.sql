-- ============================================================
-- Tabela prontuarios — ficha clínica do cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS prontuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  anamnese    TEXT,
  alergias    TEXT,
  observacoes TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (client_id)  -- um prontuário por cliente
);

CREATE INDEX IF NOT EXISTS idx_prontuarios_client_id ON prontuarios(client_id);

-- ============================================================
-- Tabela evolucoes — histórico de atendimentos
-- ============================================================
CREATE TABLE IF NOT EXISTS evolucoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  descricao   TEXT NOT NULL,
  procedimento TEXT,
  profissional TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evolucoes_client_id ON evolucoes(client_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucoes   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin gerencia prontuarios" ON prontuarios;
CREATE POLICY "Admin gerencia prontuarios" ON prontuarios
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia evolucoes" ON evolucoes;
CREATE POLICY "Admin gerencia evolucoes" ON evolucoes
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_prontuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prontuarios_updated_at ON prontuarios;
CREATE TRIGGER trg_prontuarios_updated_at
  BEFORE UPDATE ON prontuarios
  FOR EACH ROW EXECUTE FUNCTION update_prontuarios_updated_at();

NOTIFY pgrst, 'reload schema';
