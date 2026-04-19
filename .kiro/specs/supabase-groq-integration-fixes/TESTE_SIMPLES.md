# 🧪 Teste Simples - Sem Console

## ❌ Problema

O console do navegador não suporta `import.meta` diretamente. Vamos testar de forma mais simples.

---

## ✅ Solução: Testar na Aplicação

### Passo 1: Criar um Arquivo de Teste

Crie um arquivo `src/test-rls.jsx`:

```jsx
import { createClient } from '@supabase/supabase-js';

export function TestRLS() {
  const handleTestInsert = async () => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase
        .from('clients')
        .insert([{
          nome: 'Teste Cliente',
          cpf: '12345678901',
          telefone: '11999999999',
          email: 'teste@example.com'
        }]);

      if (error) {
        console.error('❌ Erro INSERT:', error.code, error.message);
        alert(`❌ Erro: ${error.code} - ${error.message}`);
      } else {
        console.log('✅ Sucesso INSERT:', data);
        alert('✅ INSERT funcionou!');
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      alert(`❌ Erro: ${err.message}`);
    }
  };

  const handleTestUpsert = async () => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase
        .from('clients')
        .upsert([{
          cpf: '12345678901',
          nome: 'Cliente Atualizado',
          telefone: '11988888888'
        }], { onConflict: 'cpf' });

      if (error) {
        console.error('❌ Erro UPSERT:', error.code, error.message);
        alert(`❌ Erro: ${error.code} - ${error.message}`);
      } else {
        console.log('✅ Sucesso UPSERT:', data);
        alert('✅ UPSERT funcionou!');
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      alert(`❌ Erro: ${err.message}`);
    }
  };

  const handleTestGroq = async () => {
    try {
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
        console.error('❌ Erro Groq:', data.error);
        alert(`❌ Erro: ${data.error}`);
      } else {
        console.log('✅ Sucesso Groq:', data.text);
        alert(`✅ Groq respondeu: ${data.text.substring(0, 100)}...`);
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      alert(`❌ Erro: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🧪 Testes RLS e Groq</h2>
      
      <button 
        onClick={handleTestInsert}
        style={{ 
          padding: '10px 20px', 
          margin: '5px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ✅ Testar INSERT
      </button>

      <button 
        onClick={handleTestUpsert}
        style={{ 
          padding: '10px 20px', 
          margin: '5px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ✅ Testar UPSERT
      </button>

      <button 
        onClick={handleTestGroq}
        style={{ 
          padding: '10px 20px', 
          margin: '5px',
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ✅ Testar Groq
      </button>

      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Clique nos botões para testar as operações. Verifique o console (F12) para detalhes.
      </p>
    </div>
  );
}
```

### Passo 2: Adicionar ao App

Abra `src/App.jsx` e adicione:

```jsx
import { TestRLS } from './test-rls';

export default function App() {
  return (
    <div>
      {/* Seu código existente */}
      
      {/* Adicione isto para testes */}
      <TestRLS />
    </div>
  );
}
```

### Passo 3: Testar

1. Abra a aplicação no navegador
2. Clique em **✅ Testar INSERT**
3. Verifique o resultado (alert ou console)
4. Clique em **✅ Testar UPSERT**
5. Clique em **✅ Testar Groq**

---

## 📊 Resultados Esperados

### ✅ INSERT
- **Sucesso**: Sem erro 42501
- **Mensagem**: "✅ INSERT funcionou!"

### ✅ UPSERT
- **Sucesso**: Sem erro 42501
- **Mensagem**: "✅ UPSERT funcionou!"

### ✅ Groq
- **Sucesso**: Resposta do Groq
- **Mensagem**: "✅ Groq respondeu: ..."

---

## 🧪 Executar Testes Finais

```bash
npm run test
```

---

## 🎉 Pronto!

Se tudo passou, o erro 42501 foi resolvido! ✅

---

**Status**: ✅ PRONTO PARA TESTAR
**Próximo**: Adicione o componente e teste

🎉 Vamos lá!
