import { useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para gerenciar ações dos clientes
 * Integra com Supabase para atualizar status de agendamentos
 */
export const useClientActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const markAsAttended = async (appointmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'Concluído',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      return { success: true, message: 'Cliente marcado como atendido!' };
    } catch (err) {
      console.error('Erro ao marcar como atendido:', err);
      setError('Erro ao atualizar status do agendamento');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          appointment_date: newDate,
          start_time: newTime,
          status: 'Remarcado',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      return { success: true, message: 'Agendamento remarcado com sucesso!' };
    } catch (err) {
      console.error('Erro ao remarcar agendamento:', err);
      setError('Erro ao remarcar agendamento');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getClientDetails = async (clientId) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          appointments (
            id,
            appointment_date,
            start_time,
            status,
            total_value_charged,
            services ( name, category )
          )
        `)
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      return { success: true, data: client };
    } catch (err) {
      console.error('Erro ao buscar detalhes do cliente:', err);
      setError('Erro ao carregar dados do cliente');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'Cancelado',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      return { success: true, message: 'Agendamento cancelado!' };
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      setError('Erro ao cancelar agendamento');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const addClientNote = async (clientId, note) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: insertError } = await supabase
        .from('client_notes')
        .insert({
          client_id: clientId,
          note: note,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      return { success: true, message: 'Nota adicionada com sucesso!' };
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
      setError('Erro ao adicionar nota');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    markAsAttended,
    rescheduleAppointment,
    getClientDetails,
    cancelAppointment,
    addClientNote
  };
};