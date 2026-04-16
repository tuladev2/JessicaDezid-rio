-- ==============================================================================
-- 🚀 SCHEMA PARA SISTEMA DE PACOTES - JESSICA ESTÉTICA
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase para criar as tabelas de pacotes
-- ==============================================================================

-- 1. TABELA DE PACOTES VENDIDOS
CREATE TABLE IF NOT EXISTS pacotes_vendidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Informações do Pacote
    nome_pacote TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    
    -- Configuração do Pacote
    quantidade_sessoes INTEGER NOT NULL DEFAULT 6,
    valor_unitario NUMERIC(10, 2) NOT NULL,
    tipo_desconto TEXT NOT NULL DEFAULT 'porcentagem' CHECK (tipo_desconto IN ('porcentagem', 'valor_fixo')),
    desconto_valor NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_total NUMERIC(10, 2) NOT NULL,
    
    -- Controle de Sessões
    sessoes_utilizadas INTEGER NOT NULL DEFAULT 0,
    sessoes_restantes INTEGER GENERATED ALWAYS AS (quantidade_sessoes - sessoes_utilizadas) STORED,
    
    -- Status do Pacote
    status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Concluído', 'Cancelado', 'Pausado')),
    
    -- Observações
    observacoes TEXT
);

-- 2. TABELA DE SESSÕES UTILIZADAS (Histórico)
CREATE TABLE IF NOT EXISTS sessoes_pacote (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    pacote_id UUID REFERENCES pacotes_vendidos(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    data_utilizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT
);

-- 3. RLS (Row Level Security)
ALTER TABLE pacotes_vendidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode gerenciar pacotes" ON pacotes_vendidos FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE sessoes_pacote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode gerenciar sessões de pacotes" ON sessoes_pacote FOR ALL USING (auth.role() = 'authenticated');

-- 4. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. TRIGGER PARA ATUALIZAR updated_at
CREATE TRIGGER update_pacotes_vendidos_updated_at 
    BEFORE UPDATE ON pacotes_vendidos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. FUNÇÃO PARA ATUALIZAR SESSÕES UTILIZADAS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_sessoes_utilizadas()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de sessões utilizadas
    UPDATE pacotes_vendidos 
    SET sessoes_utilizadas = (
        SELECT COUNT(*) 
        FROM sessoes_pacote 
        WHERE pacote_id = NEW.pacote_id
    )
    WHERE id = NEW.pacote_id;
    
    -- Atualizar status se pacote foi concluído
    UPDATE pacotes_vendidos 
    SET status = 'Concluído'
    WHERE id = NEW.pacote_id 
    AND sessoes_utilizadas >= quantidade_sessoes
    AND status = 'Ativo';
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. TRIGGER PARA ATUALIZAR SESSÕES QUANDO NOVA SESSÃO É ADICIONADA
CREATE TRIGGER update_sessoes_count_trigger
    AFTER INSERT ON sessoes_pacote
    FOR EACH ROW
    EXECUTE FUNCTION update_sessoes_utilizadas();

-- 8. DADOS DE EXEMPLO (OPCIONAL)
-- Inserir alguns pacotes de exemplo para teste
INSERT INTO pacotes_vendidos (
    nome_pacote, 
    client_id, 
    service_id, 
    quantidade_sessoes, 
    valor_unitario, 
    tipo_desconto, 
    desconto_valor, 
    valor_total,
    sessoes_utilizadas
) 
SELECT 
    'Pacote Limpeza Premium',
    c.id,
    s.id,
    6,
    200.00,
    'porcentagem',
    15.00,
    1020.00,
    2
FROM clients c, services s 
WHERE c.full_name LIKE '%Maria%' 
AND s.name LIKE '%Limpeza%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- ✅ SCHEMA DE PACOTES COMPLETO
-- Agora você pode gerenciar pacotes com sessões e histórico completo
-- ==============================================================================