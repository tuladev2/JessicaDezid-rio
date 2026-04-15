/**
 * Testes unitários para o componente ServicoCard
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServicoCard, { ServicoCardSkeleton } from '../ServicoCard';

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

describe('ServicoCard Component', () => {
  const mockServico = {
    id: '1',
    name: 'Limpeza de Pele Profunda',
    category: 'Tratamentos Faciais',
    duration_minutes: 90,
    price_single: 280,
    price_package: 1200,
    description: 'Tratamento completo para limpeza profunda da pele facial.',
    image_url: 'https://example.com/image.jpg',
    is_active: true
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

  describe('Renderização Básica', () => {
    it('deve renderizar informações básicas do serviço', () => {
      render(<ServicoCard {...defaultProps} />);

      expect(screen.getByText('Limpeza de Pele Profunda')).toBeInTheDocument();
      expect(screen.getByText('Tratamentos Faciais')).toBeInTheDocument();
      expect(screen.getByText('R$ 280,00')).toBeInTheDocument();
      expect(screen.getByText('90 min')).toBeInTheDocument();
    });

    it('deve mostrar status ativo corretamente', () => {
      render(<ServicoCard {...defaultProps} />);

      expect(screen.getByText('Ativo')).toBeInTheDocument();
      expect(screen.getByText('Ativo')).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('deve mostrar status inativo corretamente', () => {
      const servicoInativo = { ...mockServico, is_active: false };
      
      render(
        <ServicoCard 
          {...defaultProps} 
          servico={servicoInativo}
        />
      );

      expect(screen.getByText('Inativo')).toBeInTheDocument();
      expect(screen.getByText('Inativo')).toHaveClass('bg-gray-100', 'text-gray-600');
    });

    it('deve renderizar imagem quando disponível', () => {
      render(<ServicoCard {...defaultProps} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Limpeza de Pele Profunda');
    });

    it('deve mostrar ícone fallback quando não há imagem', () => {
      const servicoSemImagem = { ...mockServico, image_url: null };
      
      render(
        <ServicoCard 
          {...defaultProps} 
          servico={servicoSemImagem}
        />
      );

      expect(screen.getByText('spa')).toBeInTheDocument();
    });
  });

  describe('Variantes do Card', () => {
    it('deve aplicar estilo padrão por default', () => {
      const { container } = render(<ServicoCard {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass('p-4');
    });

    it('deve aplicar estilo compact quando especificado', () => {
      const { container } = render(
        <ServicoCard {...defaultProps} variant="compact" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('p-3');
    });

    it('deve aplicar estilo detailed quando especificado', () => {
      const { container } = render(
        <ServicoCard {...defaultProps} variant="detailed" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('p-6');
    });

    it('deve mostrar descrição apenas em variant detailed', () => {
      // Variant default - não deve mostrar descrição
      const { rerender } = render(<ServicoCard {...defaultProps} />);
      expect(screen.getByText(/Tratamento completo/)).toBeInTheDocument();

      // Variant compact - não deve mostrar descrição
      rerender(<ServicoCard {...defaultProps} variant="compact" />);
      expect(screen.queryByText(/Tratamento completo/)).not.toBeInTheDocument();

      // Variant detailed - deve mostrar descrição
      rerender(<ServicoCard {...defaultProps} variant="detailed" />);
      expect(screen.getByText(/Tratamento completo/)).toBeInTheDocument();
    });
  });

  describe('Detalhes do Preço', () => {
    it('deve mostrar detalhes de preço em variant default', () => {
      render(<ServicoCard {...defaultProps} />);

      expect(screen.getByText('Individual')).toBeInTheDocument();
      expect(screen.getByText('Pacote')).toBeInTheDocument();
      expect(screen.getByText('Economia')).toBeInTheDocument();
      expect(screen.getByText('R$ 1200,00')).toBeInTheDocument();
    });

    it('deve calcular economia corretamente', () => {
      render(<ServicoCard {...defaultProps} />);

      // (280 * 6) - 1200 = 480
      expect(screen.getByText('R$ 480,00')).toBeInTheDocument();
    });

    it('não deve mostrar preço de pacote quando não disponível', () => {
      const servicoSemPacote = { ...mockServico, price_package: null };
      
      render(
        <ServicoCard 
          {...defaultProps} 
          servico={servicoSemPacote}
        />
      );

      expect(screen.queryByText('Pacote')).not.toBeInTheDocument();
      expect(screen.queryByText('Economia')).not.toBeInTheDocument();
    });

    it('não deve mostrar detalhes expandidos em variant compact', () => {
      render(<ServicoCard {...defaultProps} variant="compact" />);

      expect(screen.queryByText('Individual')).not.toBeInTheDocument();
      expect(screen.queryByText('Pacote')).not.toBeInTheDocument();
    });
  });

  describe('Estados de Loading', () => {
    it('deve aplicar estilo de loading quando loading=true', () => {
      const { container } = render(
        <ServicoCard {...defaultProps} loading={true} />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('opacity-50', 'pointer-events-none');
    });

    it('deve passar loading para ServicoActions', () => {
      render(<ServicoCard {...defaultProps} loading={true} />);

      // Verifica se o componente de ações recebeu a prop loading
      expect(screen.getByTestId('actions-1')).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onEdit ao clicar em editar', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();

      render(
        <ServicoCard 
          {...defaultProps} 
          onEdit={mockOnEdit}
        />
      );

      await user.click(screen.getByText('Editar'));

      expect(mockOnEdit).toHaveBeenCalledWith(mockServico);
    });

    it('deve chamar onToggleStatus ao clicar em toggle', async () => {
      const user = userEvent.setup();
      const mockOnToggleStatus = jest.fn();

      render(
        <ServicoCard 
          {...defaultProps} 
          onToggleStatus={mockOnToggleStatus}
        />
      );

      await user.click(screen.getByText('Toggle'));

      expect(mockOnToggleStatus).toHaveBeenCalledWith('1');
    });

    it('deve chamar onDelete ao clicar em excluir', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn();

      render(
        <ServicoCard 
          {...defaultProps} 
          onDelete={mockOnDelete}
        />
      );

      await user.click(screen.getByText('Excluir'));

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Tratamento de Erros de Imagem', () => {
    it('deve mostrar fallback quando imagem falha ao carregar', () => {
      render(<ServicoCard {...defaultProps} />);

      const image = screen.getByRole('img');
      
      // Simular erro de carregamento
      const errorEvent = new Event('error');
      image.dispatchEvent(errorEvent);

      // Deve mostrar ícone de fallback
      expect(screen.getByText('spa')).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('deve aplicar classes de hover', () => {
      const { container } = render(<ServicoCard {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass('hover:bg-surface-container/20');
    });
  });
});

describe('ServicoCardSkeleton Component', () => {
  describe('Renderização', () => {
    it('deve renderizar skeleton básico', () => {
      const { container } = render(<ServicoCardSkeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('deve aplicar variant default por padrão', () => {
      const { container } = render(<ServicoCardSkeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('p-4');
    });

    it('deve aplicar variant compact quando especificado', () => {
      const { container } = render(<ServicoCardSkeleton variant="compact" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('p-3');
    });

    it('deve aplicar variant detailed quando especificado', () => {
      const { container } = render(<ServicoCardSkeleton variant="detailed" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('p-6');
    });

    it('deve mostrar detalhes skeleton apenas em variants maiores', () => {
      // Variant compact - não deve mostrar grid de detalhes
      const { container: compactContainer } = render(
        <ServicoCardSkeleton variant="compact" />
      );
      expect(compactContainer.querySelector('.grid')).not.toBeInTheDocument();

      // Variant default - deve mostrar grid de detalhes
      const { container: defaultContainer } = render(
        <ServicoCardSkeleton variant="default" />
      );
      expect(defaultContainer.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('Elementos Skeleton', () => {
    it('deve ter elementos de skeleton para imagem e texto', () => {
      const { container } = render(<ServicoCardSkeleton />);

      // Deve ter elementos com background de skeleton
      const skeletonElements = container.querySelectorAll('.bg-surface-container');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('deve ter estrutura similar ao card real', () => {
      const { container } = render(<ServicoCardSkeleton />);

      // Deve ter seção de header
      expect(container.querySelector('.flex.items-start')).toBeInTheDocument();
      
      // Deve ter seção de ações
      expect(container.querySelector('.border-t')).toBeInTheDocument();
    });
  });
});