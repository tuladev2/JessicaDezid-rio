-- Tabela planos_pacotes - Fonte única de verdade para pacotes de 6 sessões
CREATE TABLE IF NOT EXISTS planos_pacotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_pacote VARCHAR(255) NOT NULL,
  procedimento VARCHAR(255) NOT NULL,
  quantidade_sessoes INTEGER NOT NULL DEFAULT 6,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  valor_total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO')),
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_planos_pacotes_status ON planos_pacotes(status);
CREATE INDEX IF NOT EXISTS idx_planos_pacotes_created_at ON planos_pacotes(created_at DESC);

-- RLS (Row Level Security) - Permitir leitura pública para clientes
ALTER TABLE planos_pacotes ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT (leitura pública)
CREATE POLICY "Permitir leitura pública de planos ativos" ON planos_pacotes
  FOR SELECT
  USING (status = 'ATIVO');

-- Policy para INSERT/UPDATE/DELETE (apenas admin)
CREATE POLICY "Permitir admin gerenciar planos" ON planos_pacotes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_planos_pacotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_planos_pacotes_updated_at ON planos_pacotes;
CREATE TRIGGER trigger_planos_pacotes_updated_at
  BEFORE UPDATE ON planos_pacotes
  FOR EACH ROW
  EXECUTE FUNCTION update_planos_pacotes_updated_at();

-- Dados de exemplo
INSERT INTO planos_pacotes (nome_pacote, procedimento, quantidade_sessoes, valor_unitario, desconto_percentual, valor_total, status)
VALUES
  ('Plano Buço', 'Buço ou Queixo', 6, 80.00, 15, 408.00, 'ATIVO'),
  ('Plano Axilas', 'Axilas', 6, 120.00, 15, 612.00, 'ATIVO'),
  ('Plano Virilha', 'Virilha Completa', 6, 220.00, 15, 1122.00, 'ATIVO'),
  ('Plano Meia Perna', 'Meia Perna', 6, 280.00, 15, 1428.00, 'ATIVO'),
  ('Plano Perna Inteira', 'Perna Inteira', 6, 450.00, 15, 2295.00, 'ATIVO'),
  ('Plano Rosto', 'Rosto Feminino', 6, 180.00, 15, 918.00, 'ATIVO')
ON CONFLICT DO NOTHING;
