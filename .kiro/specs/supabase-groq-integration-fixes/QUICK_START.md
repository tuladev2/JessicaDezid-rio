# ⚡ Quick Start - Aplicar Correções

## 🎯 Objetivo
Corrigir erro 42501 (Permission Denied) e migrar para Groq API

---

## 📋 Checklist Rápido

### ✅ Já Feito (Código)
- [x] Migração de `src/api/chat.js` para Groq
- [x] Implementação de segurança (env vars)
- [x] Tratamento de erro robusto
- [x] Testes exploratórios criados
- [x] Testes de preservação criados

### ⏳ Falta Fazer (Supabase)
- [ ] Aplicar `fix_clients_rls.sql` no Supabase
- [ ] Testar operações de cliente
- [ ] Verificar API do Groq

---

## 🚀 Passo 1: Aplicar Correções RLS (5 minutos)

### Via Supabase Dashboard:

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Clique em **New Query**
5. Copie o conteúdo de `fix_clients_rls.sql`
6. Cole no editor
7. Clique em **Run**

**Pronto!** As políticas RLS foram atualizadas.

---

## 🧪 Passo 2: Testar Operações (5 minutos)

### Teste 1: INSERT de Cliente

Abra o console do navegador e execute:

```javascript
// Importar Supabase
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

### Teste 2: UPSERT por CPF

```javascript
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

## 💬 Passo 3: Testar API do Groq (5 minutos)

### Teste 1: Verificar Configuração

```javascript
// Verificar se chave está configurada
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
console.log('Chave configurada?', !!apiKey && apiKey !== 'COLE_SUA_CHAVE_AQUI');
```

**Resultado esperado**: `true`

### Teste 2: Chamar API

```javascript
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

## 📊 Resumo das Mudanças

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `fix_clients_rls.sql` | Políticas RLS atualizadas | ⏳ Aplicar |
| `src/api/chat.js` | Migrado para Groq | ✅ Pronto |
| `.env.local` | Verificar `VITE_GROQ_API_KEY` | ✅ Pronto |

---

## ✅ Verificação Final

Após aplicar as correções, verifique:

- [ ] Erro 42501 não aparece mais
- [ ] Clientes podem se cadastrar
- [ ] Agendamentos funcionam
- [ ] Chat responde com Groq
- [ ] Admin ainda pode deletar clientes
- [ ] Sem erros no console

---

## 🆘 Troubleshooting

### Erro 42501 persiste?
- Verifique se o SQL foi executado no Supabase
- Recarregue a página (F5)
- Verifique se RLS está ativo: `ALTER TABLE clients ENABLE ROW LEVEL SECURITY;`

### API do Groq não funciona?
- Verifique `VITE_GROQ_API_KEY` em `.env.local`
- Verifique se a chave é válida
- Verifique console do navegador para erros

### Testes falhando?
```bash
npm run test
```

---

## 📞 Próximos Passos

1. ✅ Aplicar `fix_clients_rls.sql`
2. ✅ Testar operações de cliente
3. ✅ Testar API do Groq
4. ✅ Executar `npm run test`
5. ✅ Deploy em produção

---

**Tempo estimado**: 15 minutos
**Dificuldade**: Fácil
**Status**: Pronto para aplicação

🎉 Tudo pronto! Comece pelo Passo 1.
