-- ==============================================================================
-- 🚀 ATUALIZAÇÃO DO SCHEMA - FICHÁRIO MULTI-CLIENTES
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase para adicionar as tabelas
-- necessárias para o sistema de fichário multi-clientes
-- ==============================================================================

-- Atualizar tabela de clientes para incluir campos adicionais
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Remover constraint NOT NULL do phone se existir
ALTER TABLE clients ALTER COLUMN phone DROP NOT NULL;

-- 1. TABELA DE PRONTUÁRIOS (Fichas de Cuidados)
CREATE TABLE IF NOT EXISTS prontuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    allergies TEXT,
    skin_type TEXT,
    medical_history TEXT,
    current_treatments TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para prontuários
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode gerenciar prontuários" ON prontuarios FOR ALL USING (auth.role() = 'authenticated');

-- 2. TABELA DE EVOLUÇÕES (Histórico de Tratamentos)
CREATE TABLE IF NOT EXISTS evolucoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    treatment_type TEXT,
    observations TEXT,
    photos_before TEXT[],
    photos_after TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para evoluções
ALTER TABLE evolucoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode gerenciar evoluções" ON evolucoes FOR ALL USING (auth.role() = 'authenticated');

-- 3. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. TRIGGER PARA ATUALIZAR updated_at NA TABELA PRONTUARIOS
CREATE TRIGGER update_prontuarios_updated_at 
    BEFORE UPDATE ON prontuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. TRIGGER PARA ATUALIZAR updated_at NA TABELA CLIENTS
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ✅ ATUALIZAÇÃO COMPLETA
-- Execute este script no Supabase para habilitar o fichário multi-clientes
-- ==============================================================================