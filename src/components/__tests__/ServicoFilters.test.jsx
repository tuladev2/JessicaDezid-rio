/**
 * Testes unitários para o componente ServicoFilters
 * 
 * Para executar os testes:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
 * npm test ServicoFilters.test.jsx
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServicoFilters from '../ServicoFilters';

// Mock do debounce para testes síncronos
jest.mock('../../lib/servicosUtils', () => ({
  ...jest.requireActual('../../lib/servicosUtils'),
  debounce: (fn) => fn // Remove o delay para testes
}));

describe('ServicoFilters Component', () => {
  const defaultProps = {
    filters: { search: '', category: '', status: 'all' },
    onFiltersChange: jest.fn(),
    totalCount: 5,
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar todos os elementos básicos', () => {
      render(<ServicoFilters {...defaultProps} />);

      expect(screen.getByText('Filtros de Busca')).toBeInTheDocument();
      expect(screen.getByText('5 serviços encontrados')).toBeInTheDocument();
      expect(screen.getByLabelText('Buscar por nome')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('deve mostrar estado de carregamento', () => {
      render(<ServicoFilters {...defaultProps} loading={true} />);

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
      expect(screen.getByRole('generic', { name: /sync/i })).toBeInTheDocument();
    });

    it('deve mostrar contador singular corretamente', () => {
      render(<ServicoFilters {...defaultProps} totalCount={1} />);

      expect(screen.getByText('1 serviço encontrado')).toBeInTheDocument();
    });

    it('deve mostrar contador plural corretamente', () => {
      render(<ServicoFilters {...defaultProps} totalCount={10} />);

      expect(screen.getByText('10 serviços encontrados')).toBeInTheDocument();
    });
  });

  describe('Funcionalidade de Busca', () => {
    it('deve atualizar o campo de busca localmente', async () => {
      const user = userEvent.setup();
      render(<ServicoFilters {...defaultProps} />);

      const searchInput = screen.getByLabelText('Buscar por nome');
      await user.type(searchInput, 'limpeza');

      expect(searchInput).toHaveValue('limpeza');
    });

    it('deve chamar onFiltersChange com debounce na busca', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      
      render(
        <ServicoFilters 
          {...defaultProps} 
          onFiltersChange={mockOnFiltersChange} 
        />
      );

      const searchInput = screen.getByLabelText('Buscar por nome');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          search: 'test',
          category: '',
          status: 'all'
        });
      });
    });

    it('deve mostrar botão de limpar busca quando há texto', async () => {
      const user = userEvent.setup();
      render(<ServicoFilters {...defaultProps} />);

      const searchInput = screen.getByLabelText('Buscar por nome');
      await user.type(searchInput, 'test');

      // O botão de limpar deve aparecer (ícone close)
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('deve limpar a busca ao clicar no botão close', async () => {
      const user = userEvent.setup();
      render(
        <ServicoFilters 
          {...defaultProps} 
          filters={{ search: 'test', category: '', status: 'all' }}
        />
      );

      const searchInput = screen.getByLabelText('Buscar por nome');
      expect(searchInput).toHaveValue('test');

      // Encontrar e clicar no botão de limpar
      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Filtros de Categoria e Status', () => {
    it('deve atualizar filtro de categoria', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      
      render(
        <ServicoFilters 
          {...defaultProps} 
          onFiltersChange={mockOnFiltersChange} 
        />
      );

      const categorySelect = screen.getByLabelText('Categoria');
      await user.selectOptions(categorySelect, 'Tratamentos Faciais');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category: 'Tratamentos Faciais',
        status: 'all'
      });
    });

    it('deve atualizar filtro de status', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      
      render(
        <ServicoFilters 
          {...defaultProps} 
          onFiltersChange={mockOnFiltersChange} 
        />
      );

      const statusSelect = screen.getByLabelText('Status');
      await user.selectOptions(statusSelect, 'active');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category: '',
        status: 'active'
      });
    });
  });

  describe('Filtros Ativos (Tags)', () => {
    it('deve mostrar tags de filtros ativos', () => {
      const activeFilters = {
        search: 'limpeza',
        category: 'Tratamentos Faciais',
        status: 'active'
      };

      render(
        <ServicoFilters 
          {...defaultProps} 
          filters={activeFilters}
        />
      );

      expect(screen.getByText('Filtros ativos:')).toBeInTheDocument();
      expect(screen.getByText('"limpeza"')).toBeInTheDocument();
      expect(screen.getByText('Tratamentos Faciais')).toBeInTheDocument();
      expect(screen.getByText('Ativos')).toBeInTheDocument();
    });

    it('deve mostrar botão "Limpar Filtros" quando há filtros ativos', () => {
      const activeFilters = {
        search: 'test',
        category: '',
        status: 'all'
      };

      render(
        <ServicoFilters 
          {...defaultProps} 
          filters={activeFilters}
        />
      );

      expect(screen.getByText('Limpar Filtros')).toBeInTheDocument();
    });

    it('deve limpar todos os filtros ao clicar em "Limpar Filtros"', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      const activeFilters = {
        search: 'test',
        category: 'Tratamentos Faciais',
        status: 'active'
      };

      render(
        <ServicoFilters 
          {...defaultProps} 
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const clearButton = screen.getByText('Limpar Filtros');
      await user.click(clearButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category: '',
        status: 'all'
      });
    });

    it('deve remover filtro individual ao clicar no X da tag', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      const activeFilters = {
        search: 'test',
        category: 'Tratamentos Faciais',
        status: 'all'
      };

      render(
        <ServicoFilters 
          {...defaultProps} 
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Encontrar o botão X da tag de categoria
      const categoryTag = screen.getByText('Tratamentos Faciais').closest('span');
      const removeButton = categoryTag.querySelector('button');
      
      await user.click(removeButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: 'test',
        category: '',
        status: 'all'
      });
    });
  });

  describe('Estado Vazio', () => {
    it('deve mostrar mensagem de nenhum resultado quando não há serviços e há filtros', () => {
      const activeFilters = {
        search: 'inexistente',
        category: '',
        status: 'all'
      };

      render(
        <ServicoFilters 
          {...defaultProps} 
          filters={activeFilters}
          totalCount={0}
        />
      );

      expect(screen.getByText('Nenhum serviço encontrado')).toBeInTheDocument();
      expect(screen.getByText(/Tente ajustar os filtros/)).toBeInTheDocument();
    });

    it('não deve mostrar mensagem de vazio quando não há filtros ativos', () => {
      render(
        <ServicoFilters 
          {...defaultProps} 
          totalCount={0}
        />
      );

      expect(screen.queryByText('Nenhum serviço encontrado')).not.toBeInTheDocument();
    });

    it('deve limpar filtros ao clicar no botão da mensagem de vazio', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      const activeFilters = {
        search: 'inexistente',
        category: '',
        status: 'all'
      };

      render(
        <ServicoFilters 
          {...defaultProps} 
          filters={activeFilters}
          totalCount={0}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const clearButton = screen.getAllByText('Limpar Filtros')[1]; // Segundo botão (da mensagem de vazio)
      await user.click(clearButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category: '',
        status: 'all'
      });
    });
  });

  describe('Responsividade', () => {
    it('deve aplicar classes responsivas corretas', () => {
      const { container } = render(<ServicoFilters {...defaultProps} />);

      // Verificar se o grid responsivo está aplicado
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('deve aplicar span correto para o campo de busca', () => {
      render(<ServicoFilters {...defaultProps} />);

      const searchContainer = screen.getByLabelText('Buscar por nome').closest('div');
      expect(searchContainer).toHaveClass('lg:col-span-2');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      render(<ServicoFilters {...defaultProps} />);

      expect(screen.getByLabelText('Buscar por nome')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('deve ter IDs únicos para os campos', () => {
      render(<ServicoFilters {...defaultProps} />);

      expect(screen.getByLabelText('Buscar por nome')).toHaveAttribute('id', 'search');
      expect(screen.getByLabelText('Categoria')).toHaveAttribute('id', 'category');
      expect(screen.getByLabelText('Status')).toHaveAttribute('id', 'status');
    });
  });
});