import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook customizado para funcionalidade de busca
 * Implementa debounce e busca em múltiplas tabelas
 */
export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef(null);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    
    try {
      // Buscar clientes
      const { data: clients } = await supabase
        .from('clients')
        .select('id, full_name, phone, email')
        .or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      // Buscar serviços
      const { data: services } = await supabase
        .from('services')
        .select('id, name, category, description')
        .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(5);

      // Buscar agendamentos por nome do cliente
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          status,
          clients ( full_name ),
          services ( name )
        `)
        .eq('clients.full_name', searchQuery)
        .limit(3);

      const searchResults = [
        ...(clients || []).map(client => ({
          id: client.id,
          type: 'client',
          title: client.full_name,
          subtitle: client.phone || client.email,
          icon: 'person',
          category: 'Cliente'
        })),
        ...(services || []).map(service => ({
          id: service.id,
          type: 'service',
          title: service.name,
          subtitle: service.category,
          icon: 'spa',
          category: 'Serviço'
        })),
        ...(appointments || []).map(appointment => ({
          id: appointment.id,
          type: 'appointment',
          title: `${appointment.clients?.full_name} - ${appointment.services?.name}`,
          subtitle: `${appointment.appointment_date} às ${appointment.start_time}`,
          icon: 'calendar_today',
          category: 'Agendamento'
        }))
      ];

      setResults(searchResults);
      setShowResults(true);
      
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((value) => {
    setQuery(value);
    
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce de 300ms
    timeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  }, [performSearch]);

  const handleSearchSubmit = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSearch(query);
  }, [query, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const hideResults = useCallback(() => {
    setShowResults(false);
  }, []);

  return {
    query,
    results,
    loading,
    showResults,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
    hideResults,
    setQuery
  };
};