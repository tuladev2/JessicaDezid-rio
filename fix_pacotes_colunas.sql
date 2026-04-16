-- ============================================================================
-- 🔧 FIX: Adicionar Colunas Faltantes na Tabela pacotes_vendidos
-- ============================================================================
-- Execute este script para adicionar as colunas necessárias
-- ============================================================================

-- 1. Adicionar coluna tipo_desconto (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'tipo_desconto'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN tipo_desconto TEXT DEFAULT 'porcentagem' 
        CHECK (tipo_desconto IN ('porcentagem', 'valor_fixo'));
    END IF;
END $$;

-- 2. Adicionar coluna desconto_valor (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'desconto_valor'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN desconto_valor NUMERIC(10, 2) DEFAULT 0;
    END IF;
END $$;

-- 3. Adicionar coluna valor_unitario (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'valor_unitario'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN valor_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 4. Adicionar coluna valor_total (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'valor_total'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 5. Adicionar coluna quantidade_sessoes (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'quantidade_sessoes'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN quantidade_sessoes INTEGER NOT NULL DEFAULT 6;
    END IF;
END $$;

-- 6. Adicionar coluna sessoes_utilizadas (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'sessoes_utilizadas'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN sessoes_utilizadas INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 7. Adicionar coluna status (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'Ativo' 
        CHECK (status IN ('Ativo', 'Concluído', 'Cancelado', 'Pausado'));
    END IF;
END $$;

-- 8. Adicionar coluna observacoes (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE pacotes_vendidos 
        ADD COLUMN observacoes TEXT;
    END IF;
END $$;

-- 9. Tornar client_id opcional (pode ser NULL)
ALTER TABLE pacotes_vendidos 
ALTER COLUMN client_id DROP NOT NULL;

-- 10. Adicionar coluna sessoes_restantes (computed column)
DO $$ 
BEGIN
    -- Remover se já existir
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacotes_vendidos' 
        AND column_name = 'sessoes_restantes'
    ) THEN
        ALTER TABLE pacotes_vendidos DROP COLUMN sessoes_restantes;
    END IF;
    
    -- Adicionar como coluna computada
    ALTER TABLE pacotes_vendidos 
    ADD COLUMN sessoes_restantes INTEGER 
    GENERATED ALWAYS AS (quantidade_sessoes - sessoes_utilizadas) STORED;
END $$;

-- 11. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pacotes_vendidos'
ORDER BY ordinal_position;

-- ============================================================================
-- ✅ COLUNAS ADICIONADAS COM SUCESSO
-- ============================================================================
-- Agora tente criar um pacote novamente!
-- ============================================================================
