-- ============================================================
-- MIGRAÇÃO FINAL — Execute no Supabase SQL Editor
-- Remove FK de servico_id (causa do erro 23503) e usa notas
-- como campo de texto para o nome do procedimento.
-- ============================================================

-- 1. Criar tabela SE ainda não existir
CREATE TABLE IF NOT EXISTS agendamentos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plano_pacote_id UUID REFERENCES planos_pacotes(id) ON DELETE SET NULL,
  -- servico_id sem FK — apenas referência informativa
  servico_id     UUID,
  data           DATE        NOT NULL,
  horario_inicio TIME        NOT NULL,
  horario_fim    TIME        NOT NULL,
  status         VARCHAR(50) DEFAULT 'Confirmado'
                   CHECK (status IN ('Confirmado', 'Cancelado', 'Realizado', 'Não Compareceu')),
  valor          DECIMAL(10, 2),
  -- notas armazena o nome do procedimento como texto seguro
  notas          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar servico_id SEM FK se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agendamentos' AND column_name = 'servico_id'
  ) THEN
    ALTER TABLE agendamentos ADD COLUMN servico_id UUID;
    RAISE NOTICE 'Coluna servico_id adicionada (sem FK).';
  END IF;
END;
$$;

-- 3. Remover FK de servico_id se existir (causa do erro 23503)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'agendamentos'
      AND constraint_name = 'agendamentos_servico_id_fkey'
  ) THEN
    ALTER TABLE agendamentos DROP CONSTRAINT agendamentos_servico_id_fkey;
    RAISE NOTICE 'FK agendamentos_servico_id_fkey removida.';
  END IF;
END;
$$;

-- 4. Tornar plano_pacote_id nullable se ainda for NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agendamentos'
      AND column_name = 'plano_pacote_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE agendamentos ALTER COLUMN plano_pacote_id DROP NOT NULL;
    RAISE NOTICE 'plano_pacote_id agora é nullable.';
  END IF;
END;
$$;

-- 5. Remover constraint CHECK que exige ao menos uma FK
--    (não faz mais sentido sem a FK de servico_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'agendamentos'
      AND constraint_name = 'agendamento_tem_servico_ou_pacote'
  ) THEN
    ALTER TABLE agendamentos DROP CONSTRAINT agendamento_tem_servico_ou_pacote;
    RAISE NOTICE 'Constraint agendamento_tem_servico_ou_pacote removida.';
  END IF;
END;
$$;

-- 6. Índices
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id      ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_plano_pacote_id ON agendamentos(plano_pacote_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico_id      ON agendamentos(servico_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data            ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status          ON agendamentos(status);

-- 7. Trigger updated_at (sintaxe correta com $$)
CREATE OR REPLACE FUNCTION update_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER trigger_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_agendamentos_updated_at();

-- 8. RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de agendamentos autenticados" ON agendamentos;
CREATE POLICY "Permitir leitura de agendamentos autenticados" ON agendamentos
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir insert público de agendamentos" ON agendamentos;
CREATE POLICY "Permitir insert público de agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir admin gerenciar agendamentos" ON agendamentos;
CREATE POLICY "Permitir admin gerenciar agendamentos" ON agendamentos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 9. RLS clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON clients;
CREATE POLICY "Permitir leitura de clientes autenticados" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir insert público de clientes" ON clients;
CREATE POLICY "Permitir insert público de clientes" ON clients
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir upsert público de clientes" ON clients;
CREATE POLICY "Permitir upsert público de clientes" ON clients
  FOR UPDATE USING (true) WITH CHECK (true);

-- 10. Recarregar cache do schema
NOTIFY pgrst, 'reload schema';
