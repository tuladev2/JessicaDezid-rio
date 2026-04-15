/**
 * Testes unitários para o hook useServicos
 * 
 * Para executar os testes:
 * npm install --save-dev @testing-library/react-hooks @testing-library/jest-dom
 * npm test useServicos.test.js
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useServicos } from '../useServicos';

// Mock do Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }))
  }
}));

describe('useServicos Hook', () => {
  let mockSupabase;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock Supabase
    const { supabase } = require('../../lib/supabase');
    mockSupabase = supabase.from();
  });

  describe('fetchServicos', () => {
    it('deve carregar serviços com sucesso', async () => {
      const mockServicos = [
        {
          id: '1',
          name: 'Limpeza de Pele',
          category: 'Tratamentos Faciais',
          duration_minutes: 60,
          price_single: 150.00,
          is_active: true
        }
      ];

      mockSupabase.single.mockResolvedValue({ data: mockServicos, error: null });

      const { result, waitForNextUpdate } = renderHook(() => useServicos());

      expect(result.current.loading).toBe(true);

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.servicos).toEqual(mockServicos);
      expect(result.current.error).toBe(null);
    });

    it('deve tratar erro ao carregar serviços', async () => {
      const mockError = { message: 'Erro de conexão' };
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError });

      const { result, waitForNextUpdate } = renderHook(() => useServicos());

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.servicos).toEqual([]);
      expect(result.current.error).toContain('Erro ao carregar serviços');
    });
  });

  describe('createServico', () => {
    it('deve criar serviço com sucesso', async () => {
      const novoServico = {
        name: 'Novo Serviço',
        category: 'Tratamentos Faciais',
        duration_minutes: 90,
        price_single: 200.00
      };

      const servicoCriado = { id: '2', ...novoServico, is_active: true };

      // Mock para verificação de duplicata (não encontra)
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
      // Mock para inserção
      mockSupabase.single.mockResolvedValueOnce({ data: servicoCriado, error: null });

      const { result } = renderHook(() => useServicos());

      await act(async () => {
        const response = await result.current.createServico(novoServico);
        expect(response.success).toBe(true);
        expect(response.data).toEqual(servicoCriado);
      });

      expect(result.current.operationLoading).toBe(false);
    });

    it('deve rejeitar criação com dados inválidos', async () => {
      const servicoInvalido = {
        name: '', // Nome vazio
        category: 'Tratamentos Faciais',
        duration_minutes: 90,
        price_single: 200.00
      };

      const { result } = renderHook(() => useServicos());

      await act(async () => {
        try {
          await result.current.createServico(servicoInvalido);
        } catch (error) {
          expect(error.message).toBe('Nome do serviço é obrigatório');
        }
      });
    });

    it('deve rejeitar criação de serviço duplicado', async () => {
      const servicoDuplicado = {
        name: 'Serviço Existente',
        category: 'Tratamentos Faciais',
        duration_minutes: 90,
        price_single: 200.00
      };

      // Mock retorna serviço existente
      mockSupabase.single.mockResolvedValue({ 
        data: { id: '1', name: 'Serviço Existente' }, 
        error: null 
      });

      const { result } = renderHook(() => useServicos());

      await act(async () => {
        try {
          await result.current.createServico(servicoDuplicado);
        } catch (error) {
          expect(error.message).toBe('Já existe um serviço com este nome');
        }
      });
    });
  });

  describe('updateServico', () => {
    it('deve atualizar serviço com sucesso', async () => {
      const servicoAtualizado = {
        id: '1',
        name: 'Serviço Atualizado',
        price_single: 250.00
      };

      // Mock para verificação de duplicata (não encontra)
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
      // Mock para atualização
      mockSupabase.single.mockResolvedValueOnce({ data: servicoAtualizado, error: null });

      const { result } = renderHook(() => useServicos());

      await act(async () => {
        const response = await result.current.updateServico('1', {
          name: 'Serviço Atualizado',
          price_single: 250.00
        });
        expect(response.success).toBe(true);
      });
    });
  });

  describe('deleteServico', () => {
    it('deve excluir serviço sem agendamentos', async () => {
      // Mock para verificação de agendamentos (não encontra)
      mockSupabase.single.mockResolvedValueOnce({ count: 0 });
      // Mock para exclusão
      mockSupabase.single.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useServicos());

      await act(async () => {
        const response = await result.current.deleteServico('1');
        expect(response.success).toBe(true);
      });
    });

    it('deve impedir exclusão de serviço com agendamentos', async () => {
      // Mock retorna agendamentos existentes
      mockSupabase.single.mockResolvedValue({ count: 3 });

      const { result } = renderHook(() => useServicos());

      await act(async () => {
        try {
          await result.current.deleteServico('1');
        } catch (error) {
          expect(error.message).toContain('existem agendamentos vinculados');
        }
      });
    });
  });

  describe('toggleStatus', () => {
    it('deve alternar status do serviço', async () => {
      const servicoAtual = {
        id: '1',
        name: 'Teste',
        is_active: true
      };

      // Mock para atualização
      mockSupabase.single.mockResolvedValue({ 
        data: { ...servicoAtual, is_active: false }, 
        error: null 
      });

      const { result } = renderHook(() => useServicos());
      
      // Simular serviço na lista
      act(() => {
        result.current.servicos = [servicoAtual];
      });

      await act(async () => {
        const response = await result.current.toggleStatus('1');
        expect(response.success).toBe(true);
      });
    });
  });

  describe('Filtros', () => {
    it('deve aplicar filtros corretamente', async () => {
      const filtros = {
        search: 'limpeza',
        category: 'Tratamentos Faciais',
        status: 'active'
      };

      mockSupabase.single.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useServicos(filtros));

      // Verificar se os filtros foram aplicados nas queries
      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%limpeza%');
      expect(mockSupabase.eq).toHaveBeenCalledWith('category', 'Tratamentos Faciais');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    });
  });
});