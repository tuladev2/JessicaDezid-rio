/**
 * Testes unitários para o componente ServicoModal
 * 
 * Para executar os testes:
 * npm test ServicoModal.test.jsx
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServicoModal from '../ServicoModal';

// Mock dos utilitários
jest.mock('../../lib/servicosUtils', () => ({
  CATEGORIAS_SERVICOS: [
    { value: 'Tratamentos Faciais', label: 'Tratamentos Faciais' },
    { value: 'Tratamentos Corporais', label: 'Tratamentos Corporais' }
  ],
  validateServicoForm: jest.fn(),
  sanitizeServicoData: jest.fn(),
  formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2).replace('.', ',')}`),
  parseCurrency: jest.fn((str) => parseFloat(str.replace(',', '.'))),
  formatDuration: jest.fn((minutes) => `${minutes} min`)
}));

describe('ServicoModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    editingServico: null,
    loading: false
  };

  const mockValidateServicoForm = require('../../lib/servicosUtils').validateServicoForm;
  const mockSanitizeServicoData = require('../../lib/servicosUtils').sanitizeServicoData;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default validation mock
    mockValidateServicoForm.mockReturnValue({
      isValid: true,
      errors: {}
    });
    
    mockSanitizeServicoData.mockImplementation((data) => data);
  });

  describe('Renderização', () => {
    it('deve renderizar modal de criação quando não há serviço para editar', () => {
      render(<ServicoModal {...defaultProps} />);

      expect(screen.getByText('Novo Serviço')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome do Serviço *')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria *')).toBeInTheDocument();
      expect(screen.getByLabelText('Duração (minutos) *')).toBeInTheDocument();
      expect(screen.getByLabelText('Preço Individual *')).toBeInTheDocument();
      expect(screen.getByText('Criar Serviço')).toBeInTheDocument();
    });

    it('deve renderizar modal de edição quando há serviço para editar', () => {
      const editingServico = {
        id: '1',
        name: 'Limpeza de Pele',
        category: 'Tratamentos Faciais',
        duration_minutes: 90,
        price_single: 280,
        description: 'Descrição teste'
      };

      render(
        <ServicoModal 
          {...defaultProps} 
          editingServico={editingServico}
        />
      );

      expect(screen.getByText('Editar Serviço')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Limpeza de Pele')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tratamentos Faciais')).toBeInTheDocument();
      expect(screen.getByDisplayValue('90')).toBeInTheDocument();
      expect(screen.getByDisplayValue('280')).toBeInTheDocument();
      expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
    });

    it('não deve renderizar quando modal está fechado', () => {
      render(<ServicoModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Novo Serviço')).not.toBeInTheDocument();
    });
  });

  describe('Validação de Formulário', () => {
    it('deve mostrar erros de validação em tempo real', async () => {
      const user = userEvent.setup();
      
      mockValidateServicoForm.mockReturnValue({
        isValid: false,
        errors: { name: 'Nome é obrigatório' }
      });

      render(<ServicoModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Nome do Serviço *');
      await user.type(nameInput, 'a');
      await user.clear(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve validar preços com formatação correta', async () => {
      const user = userEvent.setup();
      render(<ServicoModal {...defaultProps} />);

      const priceInput = screen.getByLabelText('Preço Individual *');
      await user.type(priceInput, '280,50');

      expect(priceInput).toHaveValue('280,50');
    });

    it('deve limitar caracteres na descrição', async () => {
      const user = userEvent.setup();
      render(<ServicoModal {...defaultProps} />);

      const descriptionTextarea = screen.getByLabelText('Descrição');
      const longText = 'a'.repeat(600); // Mais que o limite de 500

      await user.type(descriptionTextarea, longText);

      expect(descriptionTextarea.value.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Submissão do Formulário', () => {
    it('deve submeter formulário válido para criação', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue();

      render(
        <ServicoModal 
          {...defaultProps} 
          onSubmit={mockOnSubmit}
        />
      );

      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText('Nome do Serviço *'), 'Novo Serviço');
      await user.selectOptions(screen.getByLabelText('Categoria *'), 'Tratamentos Faciais');
      await user.type(screen.getByLabelText('Duração (minutos) *'), '60');
      await user.type(screen.getByLabelText('Preço Individual *'), '150,00');

      // Submeter formulário
      await user.click(screen.getByText('Criar Serviço'));

      await waitFor(() => {
        expect(mockSanitizeServicoData).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('deve submeter formulário válido para edição', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue();
      
      const editingServico = {
        id: '1',
        name: 'Serviço Original',
        category: 'Tratamentos Faciais',
        duration_minutes: 60,
        price_single: 150
      };

      render(
        <ServicoModal 
          {...defaultProps} 
          editingServico={editingServico}
          onSubmit={mockOnSubmit}
        />
      );

      // Modificar nome
      const nameInput = screen.getByDisplayValue('Serviço Original');
      await user.clear(nameInput);
      await user.type(nameInput, 'Serviço Modificado');

      // Submeter formulário
      await user.click(screen.getByText('Salvar Alterações'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('não deve submeter formulário inválido', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();

      mockValidateServicoForm.mockReturnValue({
        isValid: false,
        errors: { name: 'Nome é obrigatório' }
      });

      render(
        <ServicoModal 
          {...defaultProps} 
          onSubmit={mockOnSubmit}
        />
      );

      // Tentar submeter sem preencher campos
      await user.click(screen.getByText('Criar Serviço'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });
  });

  describe('Preview de Dados', () => {
    it('deve mostrar preview da duração', async () => {
      const user = userEvent.setup();
      render(<ServicoModal {...defaultProps} />);

      const durationInput = screen.getByLabelText('Duração (minutos) *');
      await user.type(durationInput, '90');

      await waitFor(() => {
        expect(screen.getByText('Duração: 90 min')).toBeInTheDocument();
      });
    });

    it('deve mostrar preview dos preços', async () => {
      const user = userEvent.setup();
      render(<ServicoModal {...defaultProps} />);

      const priceInput = screen.getByLabelText('Preço Individual *');
      await user.type(priceInput, '280,00');

      await waitFor(() => {
        expect(screen.getByText('Preview de Preços:')).toBeInTheDocument();
      });
    });

    it('deve mostrar preview da imagem quando URL é válida', async () => {
      const user = userEvent.setup();
      render(<ServicoModal {...defaultProps} />);

      const imageInput = screen.getByLabelText('URL da Imagem (opcional)');
      await user.type(imageInput, 'https://exemplo.com/imagem.jpg');

      await waitFor(() => {
        expect(screen.getByText('Preview da Imagem:')).toBeInTheDocument();
        expect(screen.getByAltText('Preview do serviço')).toBeInTheDocument();
      });
    });
  });

  describe('Estados de Loading', () => {
    it('deve desabilitar botões durante loading', () => {
      render(<ServicoModal {...defaultProps} loading={true} />);

      expect(screen.getByText('Cancelar')).toBeDisabled();
      expect(screen.getByRole('button', { name: /Criar Serviço/ })).toBeDisabled();
    });

    it('deve mostrar spinner durante loading', () => {
      render(<ServicoModal {...defaultProps} loading={true} />);

      expect(screen.getByRole('generic', { name: /sync/ })).toBeInTheDocument();
    });
  });

  describe('Interações do Modal', () => {
    it('deve fechar modal ao clicar em cancelar', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <ServicoModal 
          {...defaultProps} 
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Cancelar'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('não deve fechar modal durante loading', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <ServicoModal 
          {...defaultProps} 
          onClose={mockOnClose}
          loading={true}
        />
      );

      await user.click(screen.getByText('Cancelar'));

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Formatação de Preços', () => {
    it('deve formatar preços corretamente durante digitação', async () => {
      const user = userEvent.setup();
      render(<ServicoModal {...defaultProps} />);

      const priceInput = screen.getByLabelText('Preço Individual *');
      
      // Digitar caracteres inválidos
      await user.type(priceInput, 'abc123,45def');

      // Deve manter apenas números e vírgula
      expect(priceInput.value).toBe('123,45');
    });

    it('deve limitar casas decimais', async () => {
      const user = userEvent.setup();
      render(<ServicoModal {...defaultProps} />);

      const priceInput = screen.getByLabelText('Preço Individual *');
      await user.type(priceInput, '123,456789');

      // Deve limitar a 2 casas decimais
      expect(priceInput.value).toBe('123,45');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associados a todos os campos', () => {
      render(<ServicoModal {...defaultProps} />);

      expect(screen.getByLabelText('Nome do Serviço *')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria *')).toBeInTheDocument();
      expect(screen.getByLabelText('Duração (minutos) *')).toBeInTheDocument();
      expect(screen.getByLabelText('Preço Individual *')).toBeInTheDocument();
      expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    });

    it('deve focar no primeiro campo com erro ao submeter', async () => {
      const user = userEvent.setup();
      
      mockValidateServicoForm.mockReturnValue({
        isValid: false,
        errors: { name: 'Nome é obrigatório' }
      });

      render(<ServicoModal {...defaultProps} />);

      await user.click(screen.getByText('Criar Serviço'));

      await waitFor(() => {
        expect(screen.getByLabelText('Nome do Serviço *')).toHaveFocus();
      });
    });
  });