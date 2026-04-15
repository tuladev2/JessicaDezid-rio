import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para buscar contagem de agendamentos de um serviço específico
 * Usado para verificar se um serviço pode ser excluído
 */
export const useServicoAppointments = (servicoId) => {
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!servicoId) {
      setAppointmentsCount(0);
      return;
    }

    const fetchAppointmentsCount = async () => {
      try {
        setLoading(true);
        setError(null);

        const { count, error: countError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('service_id', servicoId);

        if (countError) {
          throw new Error(`Erro ao buscar agendamentos: ${countError.message}`);
        }

        setAppointmentsCount(count || 0);
      } catch (err) {
        console.error('Erro ao buscar contagem de agendamentos:', err);
        setError(err.message);
        setAppointmentsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsCount();
  }, [servicoId]);

  return {
    appointmentsCount,
    loading,
    error,
    canDelete: appointmentsCount === 0
  };
};