import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook para gerenciamento completo de serviços
 * Fornece operações CRUD com cache local e tratamento de erro
 */
export const useServicos = (filters = {}) => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Cache local para evitar refetch desnecessário
  const [lastFetch, setLastFetch] = useState(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Busca serviços com filtros aplicados
   */
  const fetchServicos = useCallback(async (forceRefresh = false) => {
    try {
      // Verificar cache se não for refresh forçado
      if (!forceRefresh && lastFetch && (Date.now() - lastFetch < CACHE_DURATION)) {
        return;
      }

      setLoading(true);
      setError(null);

      let query = supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.search && filters.search.trim()) {
        query = query.ilike('name', `%${filters.search.trim()}%`);
      }

      if (filters.category && filters.category !== '') {
        query = query.eq('category', filters.category);
      }

      if (filters.status && filters.status !== 'all') {
        const isActive = filters.status === 'active';
        query = query.eq('is_active', isActive);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Erro ao carregar serviços: ${fetchError.message}`);
      }

      setServicos(data || []);
      setLastFetch(Date.now());
    } catch (err) {
      console.error('Erro no fetchServicos:', err);
      setError(err.message || 'Erro inesperado ao carregar serviços');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.status, lastFetch]);

  /**
   * Cria um novo serviço
   */
  const createServico = useCallback(async (servicoData) => {
    try {
      setOperationLoading(true);
      setError(null);

      // Validações básicas
      if (!servicoData.name?.trim()) {
        throw new Error('Nome do serviço é obrigatório');
      }
      if (!servicoData.category?.trim()) {
        throw new Error('Categoria é obrigatória');
      }
      if (!servicoData.duration_minutes || servicoData.duration_minutes <= 0) {
        throw new Error('Duração deve ser maior que zero');
      }
      if (!servicoData.price_single || servicoData.price_single <= 0) {
        throw new Error('Preço individual deve ser maior que zero');
      }

      // Preparar dados para inserção
      const dataToInsert = {
        name: servicoData.name.trim(),
        description: servicoData.description?.trim() || null,
        category: servicoData.category.trim(),
        duration_minutes: parseInt(servicoData.duration_minutes),
        price_single: parseFloat(servicoData.price_single),
        price_package: servicoData.price_package ? parseFloat(servicoData.price_package) : null,
        image_url: servicoData.image_url?.trim() || null,
        is_active: true // Novos serviços são ativos por padrão
      };

      // Verificar se já existe serviço com mesmo nome
      const { data: existingService } = await supabase
        .from('services')
        .select('id')
        .ilike('name', dataToInsert.name)
        .single();

      if (existingService) {
        throw new Error('Já existe um serviço com este nome');
      }

      const { data, error: insertError } = await supabase
        .from('services')
        .insert([dataToInsert])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao criar serviço: ${insertError.message}`);
      }

      // Atualizar lista local
      setServicos(prev => [data, ...prev]);
      
      return { success: true, data };
    } catch (err) {
      console.error('Erro no createServico:', err);
      const errorMessage = err.message || 'Erro inesperado ao criar serviço';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  }, []);

  /**
   * Atualiza um serviço existente
   */
  const updateServico = useCallback(async (id, servicoData) => {
    try {
      setOperationLoading(true);
      setError(null);

      if (!id) {
        throw new Error('ID do serviço é obrigatório');
      }

      // Validações básicas
      if (servicoData.name !== undefined && !servicoData.name?.trim()) {
        throw new Error('Nome do serviço não pode estar vazio');
      }
      if (servicoData.category !== undefined && !servicoData.category?.trim()) {
        throw new Error('Categoria não pode estar vazia');
      }
      if (servicoData.duration_minutes !== undefined && servicoData.duration_minutes <= 0) {
        throw new Error('Duração deve ser maior que zero');
      }
      if (servicoData.price_single !== undefined && servicoData.price_single <= 0) {
        throw new Error('Preço individual deve ser maior que zero');
      }

      // Preparar dados para atualização (apenas campos modificados)
      const dataToUpdate = {};
      
      if (servicoData.name !== undefined) {
        dataToUpdate.name = servicoData.name.trim();
      }
      if (servicoData.description !== undefined) {
        dataToUpdate.description = servicoData.description?.trim() || null;
      }
      if (servicoData.category !== undefined) {
        dataToUpdate.category = servicoData.category.trim();
      }
      if (servicoData.duration_minutes !== undefined) {
        dataToUpdate.duration_minutes = parseInt(servicoData.duration_minutes);
      }
      if (servicoData.price_single !== undefined) {
        dataToUpdate.price_single = parseFloat(servicoData.price_single);
      }
      if (servicoData.price_package !== undefined) {
        dataToUpdate.price_package = servicoData.price_package ? parseFloat(servicoData.price_package) : null;
      }
      if (servicoData.image_url !== undefined) {
        dataToUpdate.image_url = servicoData.image_url?.trim() || null;
      }

      // Verificar duplicação de nome se o nome foi alterado
      if (dataToUpdate.name) {
        const { data: existingService } = await supabase
          .from('services')
          .select('id')
          .ilike('name', dataToUpdate.name)
          .neq('id', id)
          .single();

        if (existingService) {
          throw new Error('Já existe outro serviço com este nome');
        }
      }

      const { data, error: updateError } = await supabase
        .from('services')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao atualizar serviço: ${updateError.message}`);
      }

      // Atualizar lista local
      setServicos(prev => prev.map(servico => 
        servico.id === id ? { ...servico, ...data } : servico
      ));

      return { success: true, data };
    } catch (err) {
      console.error('Erro no updateServico:', err);
      const errorMessage = err.message || 'Erro inesperado ao atualizar serviço';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  }, []);

  /**
   * Exclui um serviço (com verificação de agendamentos)
   */
  const deleteServico = useCallback(async (id) => {
    try {
      setOperationLoading(true);
      setError(null);

      if (!id) {
        throw new Error('ID do serviço é obrigatório');
      }

      // Verificar se existem agendamentos vinculados
      const { count: appointmentsCount, error: countError } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('servico_id', id)
        .neq('status', 'Cancelado');

      if (countError) {
        throw new Error(`Erro ao verificar agendamentos: ${countError.message}`);
      }

      if (appointmentsCount > 0) {
        throw new Error(`Não é possível excluir este serviço pois existem ${appointmentsCount} ${appointmentsCount === 1 ? 'agendamento vinculado' : 'agendamentos vinculados'}. Considere desativá-lo.`);
      }

      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Erro ao excluir serviço: ${deleteError.message}`);
      }

      // Remover da lista local
      setServicos(prev => prev.filter(servico => servico.id !== id));

      return { success: true };
    } catch (err) {
      console.error('Erro no deleteServico:', err);
      const errorMessage = err.message || 'Erro inesperado ao excluir serviço';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  }, []);

  /**
   * Alterna o status ativo/inativo de um serviço
   */
  const toggleStatus = useCallback(async (id) => {
    try {
      setOperationLoading(true);
      setError(null);

      if (!id) {
        throw new Error('ID do serviço é obrigatório');
      }

      // Buscar status atual
      const servicoAtual = servicos.find(s => s.id === id);
      if (!servicoAtual) {
        throw new Error('Serviço não encontrado');
      }

      const novoStatus = !servicoAtual.is_active;

      const { data, error: updateError } = await supabase
        .from('services')
        .update({ is_active: novoStatus })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao alterar status: ${updateError.message}`);
      }

      // Atualizar lista local
      setServicos(prev => prev.map(servico => 
        servico.id === id ? { ...servico, is_active: novoStatus } : servico
      ));

      return { success: true, data };
    } catch (err) {
      console.error('Erro no toggleStatus:', err);
      const errorMessage = err.message || 'Erro inesperado ao alterar status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  }, [servicos]);

  /**
   * Força um refresh dos dados
   */
  const refetch = useCallback(() => {
    fetchServicos(true);
  }, [fetchServicos]);

  /**
   * Limpa erros
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect para carregar dados iniciais e quando filtros mudam
  useEffect(() => {
    fetchServicos();
  }, [fetchServicos]);

  return {
    // Estado
    servicos,
    loading,
    error,
    operationLoading,
    
    // Operações CRUD
    createServico,
    updateServico,
    deleteServico,
    toggleStatus,
    
    // Utilitários
    refetch,
    clearError
  };
};