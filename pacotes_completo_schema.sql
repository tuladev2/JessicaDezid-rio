-- ============================================================================
-- 🚀 SCHEMA COMPLETO: PACOTES + PROCEDIMENTOS - JESSICA ESTÉTICA
-- ============================================================================
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. TABELA DE SERVIÇOS/PROCEDIMENTOS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Informações do Serviço
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Facial',
    
    -- Preços
    price_single NUMERIC(10, 2) NOT NULL,
    price_package NUMERIC(10, 2),
    
    -- Configurações
    duration INTEGER NOT NULL DEFAULT 60, -- Duração em minutos
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadados
    image_url TEXT,
    color TEXT DEFAULT '#8B7355'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. TABELA DE CLIENTES (se não existir)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    cpf TEXT,
    
    -- Endereço
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    
    -- Observações
    notes TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. TABELA DE AGENDAMENTOS (se não existir)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    
    status TEXT NOT NULL DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Confirmado', 'Concluído', 'Cancelado', 'Faltou')),
    
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. TABELA DE PACOTES VENDIDOS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacotes_vendidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
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

CREATE INDEX IF NOT EXISTS idx_pacotes_client ON pacotes_vendidos(client_id);
CREATE INDEX IF NOT EXISTS idx_pacotes_service ON pacotes_vendidos(service_id);
CREATE INDEX IF NOT EXISTS idx_pacotes_status ON pacotes_vendidos(status);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. TABELA DE SESSÕES UTILIZADAS (Histórico)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessoes_pacote (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    pacote_id UUID REFERENCES pacotes_vendidos(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    data_utilizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessoes_pacote ON sessoes_pacote(pacote_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────────────────

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar serviços" ON services;
CREATE POLICY "Usuários autenticados podem gerenciar serviços" 
ON services FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes" ON clients;
CREATE POLICY "Usuários autenticados podem gerenciar clientes" 
ON clients FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar agendamentos" ON appointments;
CREATE POLICY "Usuários autenticados podem gerenciar agendamentos" 
ON appointments FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Pacotes Vendidos
ALTER TABLE pacotes_vendidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar pacotes" ON pacotes_vendidos;
CREATE POLICY "Usuários autenticados podem gerenciar pacotes" 
ON pacotes_vendidos FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Sessões de Pacote
ALTER TABLE sessoes_pacote ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar sessões" ON sessoes_pacote;
CREATE POLICY "Usuários autenticados podem gerenciar sessões" 
ON sessoes_pacote FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. FUNÇÕES E TRIGGERS
-- ────────────────────────────────────────────────────────────────────────────

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pacotes_vendidos_updated_at ON pacotes_vendidos;
CREATE TRIGGER update_pacotes_vendidos_updated_at 
    BEFORE UPDATE ON pacotes_vendidos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar sessões utilizadas automaticamente
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
$$ LANGUAGE plpgsql;

-- Trigger para atualizar sessões quando nova sessão é adicionada
DROP TRIGGER IF EXISTS update_sessoes_count_trigger ON sessoes_pacote;
CREATE TRIGGER update_sessoes_count_trigger
    AFTER INSERT ON sessoes_pacote
    FOR EACH ROW
    EXECUTE FUNCTION update_sessoes_utilizadas();

-- ────────────────────────────────────────────────────────────────────────────
-- 8. DADOS INICIAIS (SEED)
-- ────────────────────────────────────────────────────────────────────────────

-- Inserir serviços/procedimentos padrão
INSERT INTO services (name, description, category, price_single, duration, is_active) VALUES
    ('Limpeza de Pele Profunda', 'Limpeza facial completa com extração e máscara', 'Facial', 150.00, 60, true),
    ('Massagem Relaxante', 'Massagem corporal para relaxamento muscular', 'Massagem', 180.00, 90, true),
    ('Drenagem Linfática', 'Drenagem para redução de inchaço e retenção', 'Corporal', 120.00, 60, true),
    ('Peeling Químico', 'Renovação celular com ácidos', 'Facial', 200.00, 45, true),
    ('Hidratação Facial', 'Hidratação profunda com ativos premium', 'Facial', 130.00, 50, true),
    ('Depilação Completa', 'Depilação corporal completa', 'Depilação', 250.00, 120, true),
    ('Microagulhamento', 'Tratamento de rejuvenescimento com microagulhas', 'Estética Avançada', 350.00, 90, true),
    ('Radiofrequência', 'Tratamento de flacidez com radiofrequência', 'Estética Avançada', 300.00, 60, true)
ON CONFLICT DO NOTHING;

-- Inserir cliente de exemplo (opcional)
INSERT INTO clients (full_name, email, phone, is_active) VALUES
    ('Maria Silva', 'maria.silva@email.com', '(11) 98765-4321', true),
    ('Ana Costa', 'ana.costa@email.com', '(11) 91234-5678', true),
    ('Juliana Santos', 'juliana.santos@email.com', '(11) 99876-5432', true)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 9. VIEWS ÚTEIS
-- ────────────────────────────────────────────────────────────────────────────

-- View para pacotes com informações completas
CREATE OR REPLACE VIEW v_pacotes_completos AS
SELECT 
    p.id,
    p.nome_pacote,
    p.quantidade_sessoes,
    p.sessoes_utilizadas,
    p.sessoes_restantes,
    p.valor_total,
    p.status,
    p.created_at,
    c.full_name as cliente_nome,
    c.phone as cliente_telefone,
    s.name as servico_nome,
    s.category as servico_categoria
FROM pacotes_vendidos p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN services s ON p.service_id = s.id
ORDER BY p.created_at DESC;

-- View para serviços ativos
CREATE OR REPLACE VIEW v_servicos_ativos AS
SELECT 
    id,
    name,
    category,
    price_single,
    duration,
    is_active
FROM services
WHERE is_active = true
ORDER BY category, name;

-- ============================================================================
-- ✅ SCHEMA COMPLETO INSTALADO
-- ============================================================================
-- Agora você pode:
-- 1. Adicionar novos procedimentos pela interface
-- 2. Criar pacotes vinculados aos procedimentos
-- 3. Gerenciar sessões e histórico completo
-- ============================================================================
