import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para escutar atualizações em tempo real do Supabase
 * @param {string} tableName - Nome da tabela para escutar
 * @param {function} callback - Função chamada quando há mudanças
 */
export const useRealTimeUpdates = (tableName, callback) => {
  const handleChange = useCallback((payload) => {
    console.log(`Mudança detectada na tabela ${tableName}:`, payload);
    callback(payload);
  }, [tableName, callback]);

  useEffect(() => {
    if (!tableName || !callback) return;

    const subscription = supabase
      .channel(`realtime:${tableName}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        },
        handleChange
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, handleChange]);
};

/**
 * Hook específico para atualizações do dashboard
 * Escuta mudanças em appointments e clients com throttling
 */
export const useDashboardRealTime = (onUpdate) => {
  const throttledUpdate = useCallback(() => {
    // Throttle para evitar muitas atualizações seguidas
    if (window.dashboardUpdateTimeout) {
      clearTimeout(window.dashboardUpdateTimeout);
    }
    
    window.dashboardUpdateTimeout = setTimeout(() => {
      onUpdate();
    }, 1000); // Aguarda 1 segundo antes de atualizar
  }, [onUpdate]);

  useRealTimeUpdates('appointments', throttledUpdate);
  useRealTimeUpdates('clients', throttledUpdate);
  
  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (window.dashboardUpdateTimeout) {
        clearTimeout(window.dashboardUpdateTimeout);
      }
    };
  }, []);
};