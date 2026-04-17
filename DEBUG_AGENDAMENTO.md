# 🔍 Debug - Erro ao Confirmar Agendamento

## Possíveis Causas

### **1. Tabela não criada**
```sql
-- Verificar se tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'agendamentos'
);
```

### **2. Foreign Key inválida**
```sql
-- Verificar se cliente_id existe
SELECT * FROM clients WHERE id = 'seu-cliente-id';

-- Verificar se plano_pacote_id existe
SELECT * FROM planos_pacotes WHERE id = 'seu-pacote-id';
```

### **3. RLS Policy bloqueando INSERT**
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'agendamentos';

-- Desabilitar RLS temporariamente para teste
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;
```

### **4. Erro de Sintaxe no Trigger**
```sql
-- Verificar função
SELECT * FROM pg_proc WHERE proname = 'update_agendamentos_updated_at';

-- Recriar função
CREATE OR REPLACE FUNCTION update_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Passos para Debug

### **Passo 1: Verificar Console do Navegador**
1. Abra DevTools (F12)
2. Vá para a aba **Console**
3. Procure por mensagens de erro
4. Copie a mensagem completa

### **Passo 2: Verificar Logs do Supabase**
1. Abra Supabase Dashboard
2. Vá para **Logs** → **API**
3. Procure por erros recentes
4. Verifique o código de erro (ex: 23503, 42501)

### **Passo 3: Testar INSERT Manualmente**
```sql
-- Teste direto no Supabase SQL Editor
INSERT INTO agendamentos (
  cliente_id, 
  plano_pacote_id, 
  data, 
  horario_inicio, 
  horario_fim, 
  status, 
  valor
) VALUES (
  'seu-cliente-id-aqui',
  'seu-pacote-id-aqui',
  '2024-01-15',
  '14:00',
  '15:00',
  'Confirmado',
  408.00
);
```

---

## Códigos de Erro Comuns

| Código | Significado | Solução |
|--------|------------|---------|
| 23503 | Foreign Key Violation | Verificar se cliente_id e plano_pacote_id existem |
| 42501 | Permission Denied | Verificar RLS policies |
| 42P01 | Table Not Found | Executar SQL para criar tabela |
| 23514 | Check Constraint Violation | Verificar se status é válido |

---

## Checklist de Verificação

- [ ] Tabela `agendamentos` foi criada?
- [ ] Tabela `clients` tem dados?
- [ ] Tabela `planos_pacotes` tem dados?
- [ ] RLS policies estão corretas?
- [ ] Função trigger foi criada?
- [ ] Cliente_id é válido (UUID)?
- [ ] Plano_pacote_id é válido (UUID)?
- [ ] Data está no formato YYYY-MM-DD?
- [ ] Horário está no formato HH:mm?
- [ ] Status é 'Confirmado'?

---

## Solução Rápida

Se o erro persistir, execute este script completo:

```sql
-- 1. Desabilitar RLS temporariamente
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;

-- 2. Testar INSERT
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
  CURRENT_DATE,
  '14:00',
  '15:00',
  'Confirmado',
  100.00
);

-- 3. Verificar se foi inserido
SELECT * FROM agendamentos ORDER BY created_at DESC LIMIT 1;

-- 4. Reabilitar RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
```

---

## Próximos Passos

1. Abra o console do navegador (F12)
2. Tente confirmar agendamento novamente
3. Copie a mensagem de erro completa
4. Execute o script de teste acima no Supabase
5. Verifique qual erro aparece

**Mensagem de erro esperada no console:**
```
Dados do agendamento: { cliente_id: "...", plano_pacote_id: "...", ... }
Erro ao criar agendamento: { code: "...", message: "..." }
```

Compartilhe a mensagem de erro para que eu possa ajudar melhor!
