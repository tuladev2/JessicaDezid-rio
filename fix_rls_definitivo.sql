-- ============================================================
-- RLS DEFINITIVO — Execute no Supabase SQL Editor
-- Regra geral:
--   • Clientes anônimos (anon): podem INSERT em clients e agendamentos
--   • Admin autenticado: acesso total a tudo
--   • Tabelas sensíveis (services, planos_pacotes): apenas admin
-- ============================================================

-- ── CLIENTS ──────────────────────────────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_select_admin"   ON clients;
DROP POLICY IF EXISTS "clients_insert_public"  ON clients;
DROP POLICY IF EXISTS "clients_update_public"  ON clients;
DROP POLICY IF EXISTS "clients_delete_admin"   ON clients;

-- Leitura: apenas admin
CREATE POLICY "clients_select_admin" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cadastro: público (cliente se cadastra no fluxo de agendamento)
CREATE POLICY "clients_insert_public" ON clients
  FOR INSERT WITH CHECK (true);

-- Atualização: público (upsert por CPF no fluxo de agendamento)
CREATE POLICY "clients_update_public" ON clients
  FOR UPDATE USING (true) WITH CHECK (true);

-- Exclusão: apenas admin
CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── AGENDAMENTOS ──────────────────────────────────────────────────────────
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agendamentos_select_admin"  ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_insert_public" ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_manage_admin"  ON agendamentos;

-- Leitura: apenas admin
CREATE POLICY "agendamentos_select_admin" ON agendamentos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Criação: público (cliente confirma agendamento sem login)
CREATE POLICY "agendamentos_insert_public" ON agendamentos
  FOR INSERT WITH CHECK (true);

-- Atualizar/cancelar: apenas admin
CREATE POLICY "agendamentos_manage_admin" ON agendamentos
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "agendamentos_delete_admin" ON agendamentos
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── SERVICES (tabela de serviços) ─────────────────────────────────────────
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_public" ON services;
DROP POLICY IF EXISTS "services_manage_admin"  ON services;

-- Leitura: público (clientes veem os serviços disponíveis)
CREATE POLICY "services_select_public" ON services
  FOR SELECT USING (true);

-- Criar/editar/excluir: apenas admin
CREATE POLICY "services_manage_admin" ON services
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── PLANOS_PACOTES ────────────────────────────────────────────────────────
ALTER TABLE planos_pacotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "planos_select_public" ON planos_pacotes;
DROP POLICY IF EXISTS "planos_manage_admin"  ON planos_pacotes;

-- Leitura: público (clientes veem os pacotes)
CREATE POLICY "planos_select_public" ON planos_pacotes
  FOR SELECT USING (true);

-- Criar/editar/excluir: apenas admin
CREATE POLICY "planos_manage_admin" ON planos_pacotes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── CONFIG_AGENDA ─────────────────────────────────────────────────────────
ALTER TABLE config_agenda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config_select_public" ON config_agenda;
DROP POLICY IF EXISTS "config_manage_admin"  ON config_agenda;

-- Leitura: público (clientes precisam ver horários disponíveis)
CREATE POLICY "config_select_public" ON config_agenda
  FOR SELECT USING (true);

-- Editar: apenas admin
CREATE POLICY "config_manage_admin" ON config_agenda
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── BLOQUEIOS_DATAS ───────────────────────────────────────────────────────
ALTER TABLE bloqueios_datas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bloqueios_select_public" ON bloqueios_datas;
DROP POLICY IF EXISTS "bloqueios_manage_admin"  ON bloqueios_datas;

CREATE POLICY "bloqueios_select_public" ON bloqueios_datas
  FOR SELECT USING (true);

CREATE POLICY "bloqueios_manage_admin" ON bloqueios_datas
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── Recarregar cache ──────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
