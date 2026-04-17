# ⚡ Solução Rápida - Erro ao Confirmar Agendamento

## 🎯 Problema Identificado

O erro "Erro ao confirmar agendamento. Tente novamente." geralmente ocorre por:

1. **Tabela não criada** - SQL não foi executado
2. **RLS Policy bloqueando** - Permissões insuficientes
3. **Foreign Key inválida** - Cliente ou Pacote não existe
4. **Dados incompletos** - Cliente_id ou Pacote_id faltando

---

## ✅ Solução Passo a Passo

### **Passo 1: Executar SQL Corrigido**

Copie e execute NO Supabase SQL Editor:

```sql
-- 1. Criar tabela agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plano_pacote_id UUID NOT NULL REFERENCES planos_pacotes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'Confirmado' CHECK (status IN ('Confirmado', 'Cancelado', 'Realizado', 'Não Compareceu')),
  valor DECIMAL(10, 2),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_plano_pacote_id ON agendamentos(plano_pacote_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- 3. Habilitar RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- 4. Criar policies (PERMISSIVO - para teste)
DROP POLICY IF EXISTS "Permitir leitura de agendamentos autenticados" ON agendamentos;
DROP POLICY IF EXISTS "Permitir admin gerenciar agendamentos" ON agendamentos;

CREATE POLICY "Permitir leitura de agendamentos autenticados" ON agendamentos
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir admin gerenciar agendamentos" ON agendamentos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir admin atualizar agendamentos" ON agendamentos
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Criar função trigger
CREATE OR REPLACE FUNCTION update_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger
DROP TRIGGER IF EXISTS trigger_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER trigger_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_agendamentos_updated_at();

-- 7. Verificar tabela
SELECT * FROM agendamentos LIMIT 1;
```

---

### **Passo 2: Inserir Dados de Teste**

```sql
-- Verificar se existem clientes
SELECT id, full_name FROM clients LIMIT 5;

-- Verificar se existem planos
SELECT id, nome_pacote FROM planos_pacotes LIMIT 5;

-- Se não houver, inserir dados de teste
INSERT INTO clients (full_name, phone, cpf) 
VALUES ('Cliente Teste', '(11) 99999-9999', '12345678901')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO planos_pacotes (nome_pacote, procedimento, quantidade_sessoes, valor_unitario, desconto_percentual, valor_total, status)
VALUES ('Plano Teste', 'Procedimento Teste', 6, 100.00, 10, 540.00, 'ATIVO')
ON CONFLICT DO NOTHING;
```

---

### **Passo 3: Testar INSERT Manualmente**

```sql
-- Teste direto
INSERT INTO agendamentos (
  cliente_id, 
  plano_pacote_id, 
  data, 
  horario_inicio, 
  horario_fim, 
  status, 
  valor
) VALUES (
  (SELECT id FROM clients LIMIT 1),
  (SELECT id FROM planos_pacotes LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00',
  '15:00',
  'Confirmado',
  100.00
)
RETURNING *;
```

Se este INSERT funcionar, o problema está no frontend.

---

### **Passo 4: Verificar Frontend**

Abra DevTools (F12) e verifique:

1. **Console** - Procure por erros
2. **Network** - Verifique requisição ao Supabase
3. **Application** - Verifique localStorage

```javascript
// No console do navegador, execute:
console.log('Pacote:', localStorage.getItem('pacote_selecionado'));
console.log('Cliente:', localStorage.getItem('cliente_agendamento'));
```

---

## 🔧 Correção no Frontend

Se o SQL funciona mas o frontend não, o problema pode ser:

### **Problema 1: Cliente_id ou Pacote_id inválido**

Verifique em `AgendamentoHorario.jsx`:

```javascript
// Adicione este log ANTES de fazer INSERT
console.log('Cliente ID:', clienteAgendamento?.id);
console.log('Pacote ID:', pacoteSelecionado?.id);
console.log('Data:', dataFormatada);
console.log('Horário Início:', selectedTime);
console.log('Horário Fim:', horarioFim);

// Se algum for undefined, o problema está aí
```

### **Problema 2: Dados não estão no localStorage**

Verifique em `AgendamentoHorario.jsx`:

```javascript
useEffect(() => {
  const pacote = localStorage.getItem('pacote_selecionado');
  const cliente = localStorage.getItem('cliente_agendamento');

  console.log('Pacote do localStorage:', pacote);
  console.log('Cliente do localStorage:', cliente);

  if (!pacote || !cliente) {
    console.error('Dados faltando no localStorage!');
    navigate('/tratamentos');
  }
}, [navigate]);
```

---

## 🚨 Se Ainda Não Funcionar

Execute este script de diagnóstico no Supabase:

```sql
-- Verificar estrutura
\d agendamentos

-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'agendamentos';

-- Verificar função
SELECT * FROM pg_proc WHERE proname = 'update_agendamentos_updated_at';

-- Verificar dados
SELECT COUNT(*) as total_clientes FROM clients;
SELECT COUNT(*) as total_planos FROM planos_pacotes;
SELECT COUNT(*) as total_agendamentos FROM agendamentos;
```

---

## 📋 Checklist Final

- [ ] SQL foi executado no Supabase?
- [ ] Tabela `agendamentos` foi criada?
- [ ] Existem clientes na tabela `clients`?
- [ ] Existem planos na tabela `planos_pacotes`?
- [ ] INSERT manual funciona?
- [ ] localStorage tem dados válidos?
- [ ] Cliente_id é um UUID válido?
- [ ] Pacote_id é um UUID válido?

---

## 💡 Dica Final

Se tudo falhar, desabilite RLS temporariamente para teste:

```sql
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;
```

Depois tente confirmar agendamento novamente. Se funcionar, o problema é RLS.

Depois reabilite:

```sql
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
```

---

**Compartilhe a mensagem de erro do console para que eu possa ajudar melhor!**
