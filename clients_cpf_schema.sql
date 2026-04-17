-- Adicionar coluna CPF à tabela clients (se não existir)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf VARCHAR(11) UNIQUE;

-- Criar índice para melhor performance nas buscas por CPF
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);

-- Atualizar RLS para permitir leitura de clientes (se necessário)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT (leitura autenticada)
CREATE POLICY IF NOT EXISTS "Permitir leitura de clientes autenticados" ON clients
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy para INSERT/UPDATE/DELETE (apenas admin ou próprio usuário)
CREATE POLICY IF NOT EXISTS "Permitir gerenciar próprio cliente" ON clients
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
