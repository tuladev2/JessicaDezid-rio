import { createContext, useState, useCallback } from 'react';

export const ClientContext = createContext();

export function ClientProvider({ children }) {
  const [clienteData, setClienteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const setCliente = useCallback((data) => {
    setClienteData(data);
    if (data) {
      localStorage.setItem('cliente_sessao', JSON.stringify(data));
    } else {
      localStorage.removeItem('cliente_sessao');
    }
  }, []);

  const getCliente = useCallback(() => {
    if (clienteData) return clienteData;
    
    const stored = localStorage.getItem('cliente_sessao');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setClienteData(parsed);
        return parsed;
      } catch (err) {
        console.warn('Erro ao recuperar cliente do localStorage:', err);
        return null;
      }
    }
    return null;
  }, [clienteData]);

  const clearCliente = useCallback(() => {
    setClienteData(null);
    localStorage.removeItem('cliente_sessao');
  }, []);

  return (
    <ClientContext.Provider value={{
      clienteData,
      setCliente,
      getCliente,
      clearCliente,
      isLoading,
      setIsLoading
    }}>
      {children}
    </ClientContext.Provider>
  );
}
