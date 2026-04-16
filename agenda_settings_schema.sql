-- ============================================================================
-- SCHEMA SQL: Configurações de Agenda - Jessica Estética
-- ============================================================================
-- Este script cria as tabelas necessárias para o módulo de Configurações de Agenda
-- Inclui: horários de funcionamento, bloqueios de datas e regras de tempo
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- TABELA: config_agenda
-- ────────────────────────────────────────────────────────────────────────────
-- Armazena horários de funcionamento por dia da semana E regras de tempo
-- Usa 'dia' como chave única para horários e 'tipo' para linha de regras
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS config_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campos para horários de funcionamento (7 registros, um por dia)
  dia TEXT UNIQUE,                    -- 'Segunda-feira', 'Terça-feira', etc.
  inicio TIME,                        -- Horário de abertura (ex: '09:00')
  fim TIME,                           -- Horário de fechamento (ex: '19:00')
  ativo BOOLEAN DEFAULT true,         -- Se o dia está ativo para agendamentos
  
  -- Campos para regras de tempo (1 registro com tipo='regras')
  tipo TEXT UNIQUE,                   -- 'regras' para identificar linha de configurações
  intervalo INTEGER,                  -- Intervalo entre sessões em minutos (ex: 30)
  antecedencia INTEGER,               -- Antecedência mínima em horas (ex: 48)
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_config_agenda_dia ON config_agenda(dia);
CREATE INDEX IF NOT EXISTS idx_config_agenda_tipo ON config_agenda(tipo);

-- Constraint: horário de fim deve ser maior que horário de início
ALTER TABLE config_agenda 
ADD CONSTRAINT check_horario_valido 
CHECK (
  (dia IS NOT NULL AND (inicio IS NULL OR fim IS NULL OR fim > inicio)) 
  OR 
  (tipo IS NOT NULL)
);

-- ────────────────────────────────────────────────────────────────────────────
-- TABELA: bloqueios_datas
-- ────────────────────────────────────────────────────────────────────────────
-- Armazena datas bloqueadas (feriados, férias, eventos especiais)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bloqueios_datas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  data_inicio DATE NOT NULL,          -- Data de início do bloqueio
  data_fim DATE,                      -- Data de fim (opcional, para períodos)
  motivo TEXT NOT NULL,               -- Descrição do bloqueio (ex: 'Natal', 'Férias')
  tipo TEXT NOT NULL DEFAULT 'Feriado', -- 'Feriado', 'Férias', 'Outro'
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para ordenação e busca por data
CREATE INDEX IF NOT EXISTS idx_bloqueios_data_inicio ON bloqueios_datas(data_inicio);

-- Constraint: data_fim deve ser maior ou igual a data_inicio (se existir)
ALTER TABLE bloqueios_datas 
ADD CONSTRAINT check_periodo_valido 
CHECK (data_fim IS NULL OR data_fim >= data_inicio);

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────────────────
-- Garante que apenas usuários autenticados possam acessar/modificar dados
-- ────────────────────────────────────────────────────────────────────────────

-- Habilitar RLS nas tabelas
ALTER TABLE config_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueios_datas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem fazer tudo (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Usuários autenticados podem gerenciar config_agenda"
ON config_agenda
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar bloqueios_datas"
ON bloqueios_datas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- DADOS INICIAIS (SEED)
-- ────────────────────────────────────────────────────────────────────────────
-- Insere configurações padrão para facilitar o primeiro uso
-- ────────────────────────────────────────────────────────────────────────────

-- Horários padrão (Segunda a Sábado ativos, Domingo fechado)
INSERT INTO config_agenda (dia, inicio, fim, ativo) VALUES
  ('Segunda-feira', '09:00', '19:00', true),
  ('Terça-feira', '09:00', '19:00', true),
  ('Quarta-feira', '09:00', '19:00', true),
  ('Quinta-feira', '09:00', '19:00', true),
  ('Sexta-feira', '09:00', '18:00', true),
  ('Sábado', '09:00', '14:00', true),
  ('Domingo', NULL, NULL, false)
ON CONFLICT (dia) DO NOTHING;

-- Regras de tempo padrão (30 min entre sessões, 48h de antecedência)
INSERT INTO config_agenda (tipo, intervalo, antecedencia) VALUES
  ('regras', 30, 48)
ON CONFLICT (tipo) DO NOTHING;

-- Bloqueios de exemplo (feriados nacionais de 2026)
INSERT INTO bloqueios_datas (data_inicio, data_fim, motivo, tipo) VALUES
  ('2026-01-01', NULL, 'Ano Novo', 'Feriado'),
  ('2026-02-16', '2026-02-17', 'Carnaval', 'Feriado'),
  ('2026-04-03', NULL, 'Sexta-feira Santa', 'Feriado'),
  ('2026-04-21', NULL, 'Tiradentes', 'Feriado'),
  ('2026-05-01', NULL, 'Dia do Trabalho', 'Feriado'),
  ('2026-06-04', NULL, 'Corpus Christi', 'Feriado'),
  ('2026-09-07', NULL, 'Independência do Brasil', 'Feriado'),
  ('2026-10-12', NULL, 'Nossa Senhora Aparecida', 'Feriado'),
  ('2026-11-02', NULL, 'Finados', 'Feriado'),
  ('2026-11-15', NULL, 'Proclamação da República', 'Feriado'),
  ('2026-12-25', NULL, 'Natal', 'Feriado')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- FUNÇÕES AUXILIARES
-- ────────────────────────────────────────────────────────────────────────────

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_config_agenda_updated_at ON config_agenda;
CREATE TRIGGER update_config_agenda_updated_at
  BEFORE UPDATE ON config_agenda
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- VIEWS ÚTEIS (OPCIONAL)
-- ────────────────────────────────────────────────────────────────────────────

-- View para facilitar consulta de horários de funcionamento
CREATE OR REPLACE VIEW v_horarios_funcionamento AS
SELECT 
  dia,
  inicio,
  fim,
  ativo,
  CASE 
    WHEN ativo AND inicio IS NOT NULL AND fim IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (fim - inicio)) / 3600 
    ELSE 0 
  END AS horas_dia
FROM config_agenda
WHERE dia IS NOT NULL
ORDER BY 
  CASE dia
    WHEN 'Segunda-feira' THEN 1
    WHEN 'Terça-feira' THEN 2
    WHEN 'Quarta-feira' THEN 3
    WHEN 'Quinta-feira' THEN 4
    WHEN 'Sexta-feira' THEN 5
    WHEN 'Sábado' THEN 6
    WHEN 'Domingo' THEN 7
  END;

-- View para bloqueios ativos (futuros ou atuais)
CREATE OR REPLACE VIEW v_bloqueios_ativos AS
SELECT 
  id,
  data_inicio,
  data_fim,
  motivo,
  tipo,
  created_at
FROM bloqueios_datas
WHERE data_inicio >= CURRENT_DATE 
   OR (data_fim IS NOT NULL AND data_fim >= CURRENT_DATE)
ORDER BY data_inicio ASC;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
-- Para executar: Copie todo este código e cole no SQL Editor do Supabase
-- ============================================================================
