-- ============================================================
-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR AGORA
-- Remove TODAS as políticas da tabela clients e recria
-- ============================================================

-- 1. Ver políticas atuais (para diagnóstico)
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'clients';

-- 2. Remover TODAS as políticas existentes na tabela clients
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'clients'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON clients', pol.policyname);
    RAISE NOTICE 'Removida política: %', pol.policyname;
  END LOOP;
END;
$$;

-- 3. Garantir RLS ativo
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. Recriar políticas limpas
-- Leitura: apenas admin autenticado
CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT: qualquer pessoa (anon) — necessário para o fluxo de agendamento
CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (true);

-- UPDATE: qualquer pessoa — necessário para upsert por CPF
CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE: apenas admin
CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Confirmar políticas criadas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'clients';

-- 6. Recarregar cache
NOTIFY pgrst, 'reload schema';
