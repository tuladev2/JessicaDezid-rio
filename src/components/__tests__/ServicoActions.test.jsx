/**
 * Testes unitários para o componente ServicoActions
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServicoActions from '../ServicoActions';

describe('ServicoActions Component', () => {
  const mockServico = {
    id: 'service-1',
    name: 'Limpeza de Pele',
    category: 'Tratamentos Faciais',
    is_active: true,
    appointments_count: 0
  };

  const defaultProps = {
    servico: mockServico,
    onEdit: jest.fn(),
    onToggleStatus: jest.fn(),
    onDelete: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar todos os elementos de ação', () => {
      render(<ServicoActions {...defaultProps} />);

      expect(screen.getByText('Ativo')).toBeInTheDocument();
      expect(screen.getByTitle('Editar serviço')).toBeInTheDocument();
      expect(screen.getByTitle('Excluir serviço')).toBeInTheDocument();
    });

    it('deve mostrar status inativo corretamente', () => {
      const servicoInativo = { ...mockServico, is_active: false };
      
      render(
        <ServicoActions 
          {...defaultProps} 
          servico={servicoInativo}
        />
      );

      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('deve desabilitar ações durante loading', () => {
      render(<ServicoActions {...defaultProps} loading={true} />);

      expect(screen.getByTitle('Editar serviço')).toBeDisabled();
      expect(screen.getByTitle('Excluir serviço')).toBeDisabled();
    });
  });

  describe('Toggle de Status', () => {
    it('deve ativar serviço inativo diretamente', async () => {
      const user = userEvent.setup();
      const mockOnToggleStatus = jest.fn().mockResolvedValue();
      const servicoInativo = { ...mockServico, is_active: false };

      render(
        <ServicoActions 
          {...defaultProps} 
          servico={servicoInativo}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(mockOnToggleStatus).toHaveBeenCalledWith('service-1');
    });

    it('deve mostrar modal de confirmação ao desativar serviço ativo', async () => {
      const user = userEvent.setup();
      
      render(<ServicoActions {...defaultProps} />);

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(screen.getByText('Desativar Serviço')).toBeInTheDocument();
      expect(screen.getByText('Tem certeza que deseja desativar este serviço?')).toBeInTheDocument();
    });

    it('deve confirmar desativação', async () => {
      const user = userEvent.setup();
      const mockOnToggleStatus = jest.fn().mockResolvedValue();

      render(
        <ServicoActions 
          {...defaultProps} 
          onToggleStatus={mockOnToggleStatus}
        />
      );

      // Abrir modal de desativação
      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      // Confirmar desativação
      await user.click(screen.getByText('Desativar'));

      expect(mockOnToggleStatus).toHaveBeenCalledWith('service-1');
    });
  });

  describe('Edição', () => {
    it('deve chamar onEdit ao clicar no botão editar', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();

      render(
        <ServicoActions 
          {...defaultProps} 
          onEdit={mockOnEdit}
        />
      );

      await user.click(screen.getByTitle('Editar serviço'));

      expect(mockOnEdit).toHaveBeenCalledWith(mockServico);
    });

    it('não deve permitir edição durante loading', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();

      render(
        <ServicoActions 
          {...defaultProps} 
          onEdit={mockOnEdit}
          loading={true}
        />
      );

      await user.click(screen.getByTitle('Editar serviço'));

      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe('Exclusão', () => {
    it('deve mostrar modal de confirmação ao clicar em excluir', async () => {
      const user = userEvent.setup();

      render(<ServicoActions {...defaultProps} />);

      await user.click(screen.getByTitle('Excluir serviço'));

      expect(screen.getByText('Excluir Serviço')).toBeInTheDocument();
      expect(screen.getByText('Tem certeza que deseja excluir este serviço permanentemente?')).toBeInTheDocument();
    });

    it('deve confirmar exclusão', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn().mockResolvedValue();

      render(
        <ServicoActions 
          {...defaultProps} 
          onDelete={mockOnDelete}
        />
      );

      // Abrir modal de exclusão
      await user.click(screen.getByTitle('Excluir serviço'));

      // Confirmar exclusão
      await user.click(screen.getByText('Excluir'));

      expect(mockOnDelete).toHaveBeenCalledWith('service-1');
    });

    it('deve bloquear exclusão quando há agendamentos', async () => {
      const user = userEvent.setup();
      const servicoComAgendamentos = { 
        ...mockServico, 
        appointments_count: 5 
      };

      render(
        <ServicoActions 
          {...defaultProps} 
          servico={servicoComAgendamentos}
        />
      );

      await user.click(screen.getByTitle('Excluir serviço'));

      expect(screen.getByText('Não é possível excluir este serviço')).toBeInTheDocument();
      expect(screen.getByText('Excluir')).toBeDisabled();
    });
  });

  describe('Sugestão de Desativação', () => {
    it('deve responder ao evento de sugestão de desativação', async () => {
      render(<ServicoActions {...defaultProps} />);

      // Simular evento de sugestão
      window.dispatchEvent(new CustomEvent('suggest-deactivate-service', {
        detail: { serviceId: 'service-1' }
      }));

      await waitFor(() => {
        expect(screen.getByText('Desativar Serviço')).toBeInTheDocument();
      });
    });

    it('não deve responder a eventos de outros serviços', async () => {
      render(<ServicoActions {...defaultProps} />);

      // Simular evento para outro serviço
      window.dispatchEvent(new CustomEvent('suggest-deactivate-service', {
        detail: { serviceId: 'other-service' }
      }));

      expect(screen.queryByText('Desativar Serviço')).not.toBeInTheDocument();
    });
  });

  describe('Estados de Loading por Ação', () => {
    it('deve mostrar loading específico para toggle', async () => {
      const user = userEvent.setup();
      const mockOnToggleStatus = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <ServicoActions 
          {...defaultProps} 
          onToggleStatus={mockOnToggleStatus}
        />
      );

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      // Durante o loading, outros botões devem estar desabilitados
      expect(screen.getByTitle('Editar serviço')).toBeDisabled();
      expect(screen.getByTitle('Excluir serviço')).toBeDisabled();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve manter modal aberto em caso de erro na exclusão', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn().mockRejectedValue(new Error('Erro de rede'));

      render(
        <ServicoActions 
          {...defaultProps} 
          onDelete={mockOnDelete}
        />
      );

      // Abrir modal e confirmar exclusão
      await user.click(screen.getByTitle('Excluir serviço'));
      await user.click(screen.getByText('Excluir'));

      // Modal deve permanecer aberto
      await waitFor(() => {
        expect(screen.getByText('Excluir Serviço')).toBeInTheDocument();
      });
    });
  });
});