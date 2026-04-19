-- ============================================================
-- Corrigir RLS da tabela clients para permitir
-- que clientes anônimos (não logados) se cadastrem
-- ============================================================

-- Garantir RLS ativo
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas que possam estar conflitando
DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON clients;
DROP POLICY IF EXISTS "Permitir insert público de clientes" ON clients;
DROP POLICY IF EXISTS "Permitir upsert público de clientes" ON clients;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes" ON clients;

-- Remover políticas existentes se já estiverem criadas
DROP POLICY IF EXISTS "clients_select_admin" ON clients;
DROP POLICY IF EXISTS "clients_insert_public" ON clients;
DROP POLICY IF EXISTS "clients_update_public" ON clients;
DROP POLICY IF EXISTS "clients_delete_admin" ON clients;

-- SELECT: apenas admin autenticado
CREATE POLICY "clients_select_admin" ON clients
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: qualquer pessoa (anon) pode se cadastrar
CREATE POLICY "clients_insert_public" ON clients
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: qualquer pessoa pode atualizar (necessário para upsert por CPF)
CREATE POLICY "clients_update_public" ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: apenas admin
CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';
