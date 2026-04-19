-- ============================================================
-- PERFIL DA CLÍNICA — Execute no Supabase SQL Editor
-- ============================================================

-- 1. Tabela de configurações da clínica (linha única, id=1)
CREATE TABLE IF NOT EXISTS configuracoes_clinica (
  id                INTEGER PRIMARY KEY DEFAULT 1,
  nome_clinica      TEXT,
  endereco          TEXT,
  whatsapp          TEXT,
  bio               TEXT,
  foto_perfil_url   TEXT,
  imagem_home_url   TEXT,
  imagem_login_url  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Garante que só existe uma linha
ALTER TABLE configuracoes_clinica ADD CONSTRAINT configuracoes_clinica_single_row
  CHECK (id = 1);

-- 2. RLS — leitura pública, escrita apenas autenticado
ALTER TABLE configuracoes_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinica_select_public"
  ON configuracoes_clinica FOR SELECT
  USING (true);

CREATE POLICY "clinica_insert_auth"
  ON configuracoes_clinica FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "clinica_update_auth"
  ON configuracoes_clinica FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 3. Inserir linha inicial (evita erro no primeiro upsert)
INSERT INTO configuracoes_clinica (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BUCKET DE STORAGE — Execute separadamente no SQL Editor
-- ============================================================
-- Crie o bucket "clinica-assets" no painel:
-- Storage → New Bucket → Nome: clinica-assets → Public: ON
--
-- Ou via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinica-assets', 'clinica-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy de leitura pública
CREATE POLICY "clinica_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clinica-assets');

-- Policy de upload para autenticados
CREATE POLICY "clinica_assets_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'clinica-assets' AND auth.role() = 'authenticated');

-- Policy de update para autenticados
CREATE POLICY "clinica_assets_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'clinica-assets' AND auth.role() = 'authenticated');

-- Policy de delete para autenticados
CREATE POLICY "clinica_assets_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'clinica-assets' AND auth.role() = 'authenticated');
