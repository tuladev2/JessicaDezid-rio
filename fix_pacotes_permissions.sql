-- ============================================================================
-- 🔧 FIX: Corrigir Permissões da Tabela pacotes_vendidos
-- ============================================================================
-- Execute este script se estiver com erro ao criar pacotes
-- ============================================================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar pacotes" ON pacotes_vendidos;
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON pacotes_vendidos;

-- 2. Desabilitar e reabilitar RLS
ALTER TABLE pacotes_vendidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pacotes_vendidos ENABLE ROW LEVEL SECURITY;

-- 3. Criar política PERMISSIVA
CREATE POLICY "Permitir tudo para usuários autenticados" 
ON pacotes_vendidos 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Verificar se client_id pode ser NULL
ALTER TABLE pacotes_vendidos 
ALTER COLUMN client_id DROP NOT NULL;

-- ============================================================================
-- ✅ PERMISSÕES CORRIGIDAS
-- ============================================================================
-- Tente criar um pacote novamente
-- Abra o Console (F12) e veja o erro detalhado se ainda falhar
-- ============================================================================
