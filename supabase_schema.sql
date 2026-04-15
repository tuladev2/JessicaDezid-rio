-- ==============================================================================
-- 🚀 SCRIPT SQL DE INICIALIZAÇÃO - JESSICA ESTÉTICA (SUPABASE)
-- ==============================================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Entre no painel do Supabase do seu projeto.
-- 2. Vá no menu lateral na aba "SQL Editor".
-- 3. Clique em "New Query".
-- 4. Cole todo o conteúdo deste arquivo e pressione "Run" (Rodar).
-- ==============================================================================

-- 1. TABELA DE SERVIÇOS (Tratamentos Oferecidos)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price_single NUMERIC(10, 2) NOT NULL,
    price_package NUMERIC(10, 2),
    category TEXT NOT NULL DEFAULT 'Tratamentos Corporais',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- RLS (Row Level Security): Todos podem ler os serviços (clientes), mas apenas admin altera.
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Serviços são visíveis para todo mundo publicamente" ON services FOR SELECT USING (true);
CREATE POLICY "Somente admin pode editar e criar serviços" ON services FOR ALL USING (auth.role() = 'authenticated');

-- 2. TABELA DE CLIENTES (CRM - Histórico)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    cpf TEXT UNIQUE,
    birth_date DATE,
    allergies TEXT,
    notes TEXT
);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode ver gerenciar lista de clientes" ON clients FOR ALL USING (auth.role() = 'authenticated');
-- Quando um cliente anônimo agenda online, deixamos o sistema criar um perfil na primeira vez.
CREATE POLICY "Sistema insere cliente via formulário" ON clients FOR INSERT WITH CHECK (true); 

-- 3. TABELA DE AGENDAMENTOS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status TEXT NOT NULL DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Confirmado', 'Concluído', 'Cancelado', 'Remarcado')),
    total_value_charged NUMERIC(10, 2),
    notes TEXT
);

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode ver marcações todas" ON appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Apenas admin pode atualizar ou deletar agendas" ON appointments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Apenas admin pode atualizar ou deletar agendas 2" ON appointments FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Cliente anônimo agenda horario via site" ON appointments FOR INSERT WITH CHECK (true); 

-- 4. INSERÇÃO DE DADOS MOCK (OPCIONAL) - Injeta o Catálogo Padrão Automaticamente
INSERT INTO services (name, description, price_single, price_package, image_url) VALUES 
('Depilação a Led Corpora', 'Tecnologia de remoção definitiva para axilas e virilha.', 120.00, 540.00, 'https://lh3.googleusercontent.com/abXisA9E'),
('Massagem Relaxante', 'Óleos essenciais para desestressar a musculatura.', 180.00, 700.00, 'https://lh3.googleusercontent.com/abXisA9F'),
('Limpeza de Pele Diamond', 'Revitalização facial usando máscaras purificadoras de luxo.', 200.00, 850.00, 'https://lh3.googleusercontent.com/abXisA9G');

-- ==============================================================================
-- ✅ SCRIPT COMPLETO
-- O Seu backend estará modelado assim que isso for concluído.
-- ==============================================================================
