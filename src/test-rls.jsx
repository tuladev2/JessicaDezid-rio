import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

export function TestRLS() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const handleTestInsert = async () => {
    setLoading(true);
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Gerar CPF único
      const cpfUnico = `${Math.floor(Math.random() * 90000000000) + 10000000000}`;

      const { data, error } = await supabase
        .from('clients')
        .insert([{
          full_name: 'Teste Cliente ' + new Date().getTime(),
          cpf: cpfUnico,
          phone: '11999999999',
          email: `teste${Date.now()}@example.com`
        }]);

      if (error) {
        console.error('❌ Erro INSERT:', error.code, error.message);
        setResults(prev => ({ ...prev, insert: `❌ Erro: ${error.code} - ${error.message}` }));
      } else {
        console.log('✅ Sucesso INSERT:', data);
        setResults(prev => ({ ...prev, insert: '✅ INSERT funcionou!' }));
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setResults(prev => ({ ...prev, insert: `❌ Erro: ${err.message}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleTestUpsert = async () => {
    setLoading(true);
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Usar CPF fixo para UPSERT (para testar atualização)
      const cpfFixo = '99999999999';

      const { data, error } = await supabase
        .from('clients')
        .upsert([{
          cpf: cpfFixo,
          full_name: 'Cliente Atualizado ' + new Date().getTime(),
          phone: '11988888888',
          email: `upsert${Date.now()}@example.com`
        }], { onConflict: 'cpf' });

      if (error) {
        console.error('❌ Erro UPSERT:', error.code, error.message);
        setResults(prev => ({ ...prev, upsert: `❌ Erro: ${error.code} - ${error.message}` }));
      } else {
        console.log('✅ Sucesso UPSERT:', data);
        setResults(prev => ({ ...prev, upsert: '✅ UPSERT funcionou!' }));
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setResults(prev => ({ ...prev, upsert: `❌ Erro: ${err.message}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleTestGroq = async () => {
    setLoading(true);
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
        setResults(prev => ({ ...prev, groq: `❌ Erro: ${data.error}` }));
      } else {
        console.log('✅ Sucesso Groq:', data.text);
        setResults(prev => ({ ...prev, groq: `✅ Groq respondeu: ${data.text.substring(0, 100)}...` }));
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setResults(prev => ({ ...prev, groq: `❌ Erro: ${err.message}` }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #FF6B6B', 
      borderRadius: '8px',
      backgroundColor: '#FFF5F5',
      margin: '20px 0'
    }}>
      <h2>🧪 Testes RLS e Groq</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleTestInsert}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          ✅ Testar INSERT
        </button>

        <button 
          onClick={handleTestUpsert}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          ✅ Testar UPSERT
        </button>

        <button 
          onClick={handleTestGroq}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          ✅ Testar Groq
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <h3>Resultados:</h3>
          {results.insert && <p><strong>INSERT:</strong> {results.insert}</p>}
          {results.upsert && <p><strong>UPSERT:</strong> {results.upsert}</p>}
          {results.groq && <p><strong>Groq:</strong> {results.groq}</p>}
        </div>
      )}

      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Clique nos botões para testar as operações. Verifique o console (F12) para detalhes.
      </p>
    </div>
  );
}
