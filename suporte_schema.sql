-- ==============================================================================
-- 🚀 SCHEMA PARA SISTEMA DE SUPORTE INTELIGENTE - JESSICA ESTÉTICA
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase para criar as tabelas de suporte
-- ==============================================================================

-- 1. TABELA DE TICKETS DE SUPORTE
CREATE TABLE IF NOT EXISTS suporte_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Informações do Ticket
    titulo TEXT NOT NULL DEFAULT 'Conversa com IA',
    status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Pendente', 'Em Atendimento', 'Resolvido', 'Fechado')),
    prioridade TEXT NOT NULL DEFAULT 'Normal' CHECK (prioridade IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
    categoria TEXT NOT NULL DEFAULT 'Geral' CHECK (categoria IN ('Geral', 'Técnico', 'Pacotes', 'Serviços', 'Agenda', 'Clientes')),
    
    -- Dados da Conversa
    conversa_ativa BOOLEAN DEFAULT TRUE,
    total_mensagens INTEGER DEFAULT 0,
    
    -- Metadados
    user_agent TEXT,
    ip_address INET,
    observacoes TEXT
);

-- 2. TABELA DE MENSAGENS DO CHAT
CREATE TABLE IF NOT EXISTS suporte_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    ticket_id UUID REFERENCES suporte_tickets(id) ON DELETE CASCADE,
    
    -- Conteúdo da Mensagem
    conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'user' CHECK (tipo IN ('user', 'assistant', 'system')),
    
    -- Metadados da IA
    modelo_usado TEXT DEFAULT 'gemini-1.5-flash',
    tokens_usados INTEGER,
    tempo_resposta_ms INTEGER,
    
    -- Contexto
    contexto_dados JSONB, -- Para armazenar dados consultados (ex: número de pacotes)
    prompt_usado TEXT
);

-- 3. RLS (Row Level Security)
ALTER TABLE suporte_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode gerenciar tickets" ON suporte_tickets FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE suporte_mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas admin pode gerenciar mensagens" ON suporte_mensagens FOR ALL USING (auth.role() = 'authenticated');

-- 4. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. TRIGGER PARA ATUALIZAR updated_at
CREATE TRIGGER update_suporte_tickets_updated_at 
    BEFORE UPDATE ON suporte_tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. FUNÇÃO PARA ATUALIZAR CONTADOR DE MENSAGENS
CREATE OR REPLACE FUNCTION update_total_mensagens()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de mensagens no ticket
    UPDATE suporte_tickets 
    SET total_mensagens = (
        SELECT COUNT(*) 
        FROM suporte_mensagens 
        WHERE ticket_id = NEW.ticket_id
    )
    WHERE id = NEW.ticket_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. TRIGGER PARA ATUALIZAR CONTADOR QUANDO NOVA MENSAGEM É ADICIONADA
CREATE TRIGGER update_mensagens_count_trigger
    AFTER INSERT ON suporte_mensagens
    FOR EACH ROW
    EXECUTE FUNCTION update_total_mensagens();

-- 8. DADOS DE EXEMPLO (OPCIONAL)
-- Inserir um ticket de exemplo para teste
INSERT INTO suporte_tickets (
    titulo, 
    status, 
    categoria,
    observacoes
) VALUES (
    'Conversa Inicial com IA',
    'Ativo',
    'Geral',
    'Ticket criado automaticamente para teste do sistema'
) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- ✅ SCHEMA DE SUPORTE COMPLETO
-- Agora você pode usar o chat inteligente com histórico persistente
-- ==============================================================================