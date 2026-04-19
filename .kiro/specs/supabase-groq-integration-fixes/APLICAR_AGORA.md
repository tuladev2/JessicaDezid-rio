# 🚀 APLICAR AGORA - Instruções Passo a Passo

## ⏱️ Tempo: 5 minutos

---

## 📋 Passo 1: Copiar o Script SQL

**IMPORTANTE**: Se você receber erro `policy already exists`, use o script alternativo abaixo.

### Script Principal (Recomendado)

```sql
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
```

### Script Alternativo (Se receber erro)

Se receber erro `policy already exists`, use este script:

```sql
-- ============================================================
-- Script Alternativo: Remover e Recriar Todas as Políticas
-- ============================================================

-- Garantir RLS ativo
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON clients;
DROP POLICY IF EXISTS "Permitir insert público de clientes" ON clients;
DROP POLICY IF EXISTS "Permitir upsert público de clientes" ON clients;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes" ON clients;
DROP POLICY IF EXISTS "clients_select_admin" ON clients;
DROP POLICY IF EXISTS "clients_insert_public" ON clients;
DROP POLICY IF EXISTS "clients_update_public" ON clients;
DROP POLICY IF EXISTS "clients_delete_admin" ON clients;

-- RECRIAR TODAS AS POLÍTICAS DO ZERO

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
```

---

## 🌐 Passo 2: Abrir Supabase Dashboard

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Clique em **SQL Editor** (no menu esquerdo)

---

## ✏️ Passo 3: Executar o Script

1. Clique em **New Query**
2. Cole o script (principal ou alternativo)
3. Clique em **Run** (botão azul)

**Resultado esperado**: ✅ Sem erros

---

## ✅ Passo 4: Verificar Aplicação

Após executar, verifique se as políticas foram criadas:

1. Vá para **Authentication** → **Policies**
2. Selecione tabela **clients**
3. Você deve ver 4 políticas:
   - ✅ `clients_select_admin`
   - ✅ `clients_insert_public`
   - ✅ `clients_update_public`
   - ✅ `clients_delete_admin`

---

## 🧪 Passo 5: Testar INSERT

Abra o console do navegador (F12) e execute:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Testar INSERT
const { data, error } = await supabase
  .from('clients')
  .insert([{
    nome: 'Teste Cliente',
    cpf: '12345678901',
    telefone: '11999999999',
    email: 'teste@example.com'
  }]);

if (error) {
  console.error('❌ Erro:', error.code, error.message);
} else {
  console.log('✅ Sucesso! Cliente inserido:', data);
}
```

**Resultado esperado**: ✅ Sucesso (sem erro 42501)

---

## 🧪 Passo 6: Testar UPSERT

```javascript
// Testar UPSERT
const { data, error } = await supabase
  .from('clients')
  .upsert([{
    cpf: '12345678901',
    nome: 'Cliente Atualizado',
    telefone: '11988888888'
  }], { onConflict: 'cpf' });

if (error) {
  console.error('❌ Erro:', error.code, error.message);
} else {
  console.log('✅ Sucesso! Cliente atualizado:', data);
}
```

**Resultado esperado**: ✅ Sucesso (sem erro 42501)

---

## 💬 Passo 7: Testar API do Groq

```javascript
// Testar API do Groq
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Olá! Como você pode me ajudar?' }
    ]
  })
});

const data = await response.json();

if (data.error) {
  console.error('❌ Erro:', data.error);
} else {
  console.log('✅ Resposta do Groq:', data.text);
}
```

**Resultado esperado**: ✅ Resposta do Groq

---

## 🧪 Passo 8: Executar Testes

```bash
npm run test
```

**Resultado esperado**: ✅ Todos os testes passam

---

## ✨ Pronto!

Se tudo passou, você está pronto para:

1. ✅ Usuários se cadastram sem erro 42501
2. ✅ Agendamentos funcionam
3. ✅ Chat usa Groq com segurança
4. ✅ Sem regressões

---

## 🆘 Troubleshooting

### Erro: "policy already exists"
- Use o **Script Alternativo** acima
- Ele remove todas as políticas antes de recriar

### Erro 42501 persiste?
- Verifique se o SQL foi executado sem erros
- Recarregue a página (F5)
- Verifique se RLS está ativo

### API do Groq não funciona?
- Verifique `VITE_GROQ_API_KEY` em `.env.local`
- Verifique se a chave é válida
- Verifique console para erros

### Testes falhando?
- Execute `npm run test` para detalhes
- Verifique se todas as correções foram aplicadas

---

## 📞 Próximos Passos

1. ✅ Aplicar script SQL
2. ✅ Testar operações
3. ✅ Executar testes
4. ✅ Deploy em produção

---

**Tempo total**: ~15 minutos
**Dificuldade**: Fácil
**Status**: Pronto para aplicação

🎉 Comece agora!
