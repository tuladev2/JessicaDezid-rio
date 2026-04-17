-- ============================================================
-- 1. Adicionar coluna image_url na tabela services (se não existir)
-- ============================================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- 2. Criar bucket de storage para imagens dos serviços
--    (execute via Supabase Dashboard > Storage > New Bucket
--     OU via SQL abaixo se sua versão suportar storage functions)
-- ============================================================

-- Criar bucket público "imagens-servicos"
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagens-servicos', 'imagens-servicos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Policies do bucket — permitir leitura pública e upload por admin
-- ============================================================

-- Leitura pública (clientes veem as imagens sem autenticação)
DROP POLICY IF EXISTS "Leitura pública imagens-servicos" ON storage.objects;
CREATE POLICY "Leitura pública imagens-servicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagens-servicos');

-- Upload apenas por usuários autenticados (admin)
DROP POLICY IF EXISTS "Upload autenticado imagens-servicos" ON storage.objects;
CREATE POLICY "Upload autenticado imagens-servicos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagens-servicos'
  AND auth.role() = 'authenticated'
);

-- Update/delete apenas por usuários autenticados
DROP POLICY IF EXISTS "Update/Delete autenticado imagens-servicos" ON storage.objects;
CREATE POLICY "Update/Delete autenticado imagens-servicos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'imagens-servicos'
  AND auth.role() = 'authenticated'
);
