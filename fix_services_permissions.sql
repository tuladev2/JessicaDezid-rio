-- ============================================================================
-- 🔧 FIX: Corrigir Permissões da Tabela Services
-- ============================================================================
-- Execute este script se estiver com erro ao adicionar procedimentos
-- ============================================================================

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar serviços" ON services;
DROP POLICY IF EXISTS "Enable read access for all users" ON services;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON services;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON services;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON services;

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- 3. Reabilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 4. Criar política PERMISSIVA para usuários autenticados
CREATE POLICY "Permitir tudo para usuários autenticados" 
ON services 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Criar política para usuários anônimos (apenas leitura)
CREATE POLICY "Permitir leitura para anônimos" 
ON services 
FOR SELECT 
TO anon 
USING (is_active = true);

-- 6. Verificar se a tabela existe e tem as colunas corretas
DO $$ 
BEGIN
    -- Verificar se a coluna is_active existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE services ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Verificar se a coluna category existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE services ADD COLUMN category TEXT DEFAULT 'Facial';
    END IF;
    
    -- Verificar se a coluna duration existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE services ADD COLUMN duration INTEGER DEFAULT 60;
    END IF;
END $$;

-- 7. Garantir que updated_at existe e tem trigger
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE services ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 8. Criar função de updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger de updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ✅ PERMISSÕES CORRIGIDAS
-- ============================================================================
-- Agora tente adicionar um procedimento novamente
-- Se ainda der erro, abra o Console do navegador (F12) e veja a mensagem
-- ============================================================================
