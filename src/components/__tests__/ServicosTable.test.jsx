/**
 * Testes unitários para o componente ServicosTable
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServicosTable from '../ServicosTable';

// Mock dos utilitários
jest.mock('../../lib/servicosUtils', () => ({
  formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2).replace('.', ',')}`),
  formatDuration: jest.fn((minutes) => `${minutes} min`)
}));

// Mock do componente ServicoActions
jest.mock('../ServicoActions', () => {
  return function MockServicoActions({ servico, onEdit, onToggleStatus, onDelete }) {
    return (
      <div data-testid={`actions-${servico.id}`}>
        <button onClick={() => onEdit(servico)}>Editar</button>
        <button onClick={() => onToggleStatus(servico.id)}>Toggle</button>
        <button onClick={() => onDelete(servico.id)}>Excluir</button>
      </div>
    );
  };
});

describe('ServicosTable Component', () => {
  const mockServicos = [
    {
      id: '1',
      name: 'Limpeza de Pele',
      category: 'Tratamentos Faciais',
      duration_minutes: 90,
      price_single: 280,
      price_package: 1200,
      description: 'Limpeza profunda da pele',
      image_url: 'https://example.com/image.jpg',
      is_active: true
    },
    {
      id: '2',
      name: 'Drenagem Linfática',
      category: 'Tratamentos Corporais',
      duration_minutes: 60,
      price_single: 150,
      price_package: null,
      description: null,
      image_url: null,
      is_active: false
    }
  ];

  const defaultProps = {
    servicos: mockServicos,
    loading: false,
    onEdit: jest.fn(),
    onToggleStatus: jest.fn(),
    onDelete: jest.fn(),
    operationLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Desktop', () => {
    beforeEach(() => {
      // Mock window.innerWidth para simular desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('deve renderizar tabela com dados', () => {
      render(<ServicosTable {...defaultProps} />);

      // Headers da tabela
      expect(screen.getByText('Serviço')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Duração')).toBeInTheDocument();
      expect(screen.getByText('Preço Individual')).toBeInTheDocument();
      expect(screen.getByText('Preço Pacote')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();

      // Dados dos serviços
      expect(screen.getByText('Limpeza de Pele')).toBeInTheDocument();
      expect(screen.getByText('Drenagem Linfática')).toBeInTheDocument();
      expect(screen.getByText('Tratamentos Faciais')).toBeInTheDocument();
      expect(screen.getByText('Tratamentos Corporais')).toBeInTheDocument();
    });

    it('deve mostrar status ativo/inativo corretamente', () => {
      render(<ServicosTable {...defaultProps} />);

      expect(screen.getByText('Ativo')).toBeInTheDocument();
      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('deve mostrar preço do pacote quando disponível', () => {
      render(<ServicosTable {...defaultProps} />);

      expect(screen.getByText('R$ 1200,00')).toBeInTheDocument();
      expect(screen.getByText('Economia: R$ 480,00')).toBeInTheDocument();
    });

    it('deve mostrar traço quando não há preço de pacote', () => {
      render(<ServicosTable {...defaultProps} />);

      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('deve renderizar imagens com fallback', () => {
      render(<ServicosTable {...defaultProps} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1); // Apenas o primeiro serviço tem imagem
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar skeleton durante carregamento', () => {
      render(<ServicosTable {...defaultProps} loading={true} />);

      // Deve ter elementos com animação de pulse
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('não deve mostrar dados reais durante loading', () => {
      render(<ServicosTable {...defaultProps} loading={true} />);

      expect(screen.queryByText('Limpeza de Pele')).not.toBeInTheDocument();
      expect(screen.queryByText('Drenagem Linfática')).not.toBeInTheDocument();
    });
  });

  describe('Estado Vazio', () => {
    it('deve mostrar mensagem quando não há serviços', () => {
      render(<ServicosTable {...defaultProps} servicos={[]} />);

      expect(screen.getByText('Nenhum serviço encontrado')).toBeInTheDocument();
      expect(screen.getByText(/Os serviços aparecerão aqui/)).toBeInTheDocument();
    });

    it('não deve mostrar tabela quando vazia', () => {
      render(<ServicosTable {...defaultProps} servicos={[]} />);

      expect(screen.queryByText('Serviço')).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onEdit ao clicar em editar', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();

      render(
        <ServicosTable 
          {...defaultProps} 
          onEdit={mockOnEdit}
        />
      );

      await user.click(screen.getAllByText('Editar')[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockServicos[0]);
    });

    it('deve chamar onToggleStatus ao clicar em toggle', async () => {
      const user = userEvent.setup();
      const mockOnToggleStatus = jest.fn();

      render(
        <ServicosTable 
          {...defaultProps} 
          onToggleStatus={mockOnToggleStatus}
        />
      );

      await user.click(screen.getAllByText('Toggle')[0]);

      expect(mockOnToggleStatus).toHaveBeenCalledWith('1');
    });

    it('deve chamar onDelete ao clicar em excluir', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn();

      render(
        <ServicosTable 
          {...defaultProps} 
          onDelete={mockOnDelete}
        />
      );

      await user.click(screen.getAllByText('Excluir')[0]);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Responsividade', () => {
    it('deve mostrar cards em telas pequenas', () => {
      // Mock para simular mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<ServicosTable {...defaultProps} />);

      // Em mobile, não deve mostrar headers de tabela
      expect(screen.queryByText('Serviço')).not.toBeInTheDocument();
      
      // Mas deve mostrar os nomes dos serviços nos cards
      expect(screen.getByText('Limpeza de Pele')).toBeInTheDocument();
      expect(screen.getByText('Drenagem Linfática')).toBeInTheDocument();
    });

    it('deve mostrar skeleton cards durante loading em mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<ServicosTable {...defaultProps} loading={true} />);

      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Formatação de Dados', () => {
    it('deve formatar preços corretamente', () => {
      render(<ServicosTable {...defaultProps} />);

      expect(screen.getByText('R$ 280,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    });

    it('deve formatar duração corretamente', () => {
      render(<ServicosTable {...defaultProps} />);

      expect(screen.getByText('90 min')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
    });

    it('deve calcular economia do pacote corretamente', () => {
      render(<ServicosTable {...defaultProps} />);

      // (280 * 6) - 1200 = 1680 - 1200 = 480
      expect(screen.getByText('Economia: R$ 480,00')).toBeInTheDocument();
    });
  });

  describe('Tratamento de Erros de Imagem', () => {
    it('deve mostrar fallback quando imagem falha ao carregar', () => {
      render(<ServicosTable {...defaultProps} />);

      const image = screen.getByRole('img');
      
      // Simular erro de carregamento
      const errorEvent = new Event('error');
      image.dispatchEvent(errorEvent);

      // Deve mostrar ícone de fallback
      expect(screen.getByText('spa')).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('deve aplicar classes de hover nas linhas da tabela', () => {
      render(<ServicosTable {...defaultProps} />);

      const rows = document.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('hover:bg-surface-container/20');
      });
    });

    it('deve aplicar classes de hover nos cards mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<ServicosTable {...defaultProps} />);

      const cards = document.querySelectorAll('.lg\\:hidden > div > div');
      cards.forEach(card => {
        expect(card).toHaveClass('hover:bg-surface-container/20');
      });
    });
  });
});