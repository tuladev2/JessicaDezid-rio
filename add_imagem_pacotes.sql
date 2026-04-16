-- ============================================================================
-- 📸 ADICIONAR COLUNA DE IMAGEM NA TABELA pacotes_vendidos
-- ============================================================================

-- 1. Adicionar coluna imagem_url
ALTER TABLE pacotes_vendidos 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- 2. Criar bucket de storage para imagens de pacotes (se não existir)
-- IMPORTANTE: Execute isso no SQL Editor do Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('pacotes-imagens', 'pacotes-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Criar política de storage para permitir upload
CREATE POLICY "Permitir upload de imagens para usuários autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pacotes-imagens');

-- 4. Criar política de storage para permitir leitura pública
CREATE POLICY "Permitir leitura pública de imagens"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pacotes-imagens');

-- 5. Criar política de storage para permitir delete
CREATE POLICY "Permitir delete de imagens para usuários autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pacotes-imagens');

-- ============================================================================
-- ✅ COLUNA E BUCKET CRIADOS
-- ============================================================================
-- Agora você pode fazer upload de imagens para os pacotes!
-- ============================================================================
