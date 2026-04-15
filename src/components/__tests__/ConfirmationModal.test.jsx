/**
 * Testes unitários para o componente ConfirmationModal
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationModal from '../ConfirmationModal';

describe('ConfirmationModal Component', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        title: 'Confirmar Ação',
        message: 'Tem certeza que deseja continuar?',
        loading: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Renderização', () => {
        it('deve renderizar modal básico', () => {
            render(<ConfirmationModal {...defaultProps} />);

            expect(screen.getByText('Confirmar Ação')).toBeInTheDocument();
            expect(screen.getByText('Tem certeza que deseja continuar?')).toBeInTheDocument();
            expect(screen.getByText('Confirmar')).toBeInTheDocument();
            expect(screen.getByText('Cancelar')).toBeInTheDocument();
        });

        it('não deve renderizar quando fechado', () => {
            render(<ConfirmationModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('Confirmar Ação')).not.toBeInTheDocument();
        });

        it('deve renderizar com tipo danger', () => {
            render(<ConfirmationModal {...defaultProps} type="danger" />);

            expect(screen.getByRole('generic', { name: /delete/i })).toBeInTheDocument();
        });

        it('deve renderizar com tipo warning', () => {
            render(<ConfirmationModal {...defaultProps} type="warning" />);

            expect(screen.getByRole('generic', { name: /warning/i })).toBeInTheDocument();
        });
    });

    describe('Detalhes do Serviço', () => {
        it('deve mostrar detalhes quando fornecidos', () => {
            const details = {
                name: 'Limpeza de Pele',
                category: 'Tratamentos Faciais',
                appointmentsCount: 3,
                status: true
            };

            render(
                <ConfirmationModal
                    {...defaultProps}
                    details={details}
                />
            );

            expect(screen.getByText('Limpeza de Pele')).toBeInTheDocument();
            expect(screen.getByText('Tratamentos Faciais')).toBeInTheDocument();
            expect(screen.getByText('3 agendamentos')).toBeInTheDocument();
            expect(screen.getByText('Ativo')).toBeInTheDocument();
        });

        it('deve mostrar aviso quando há agendamentos e tipo é danger', () => {
            const details = {
                name: 'Serviço com Agendamentos',
                appointmentsCount: 5
            };

            render(
                <ConfirmationModal
                    {...defaultProps}
                    type="danger"
                    details={details}
                />
            );

            expect(screen.getByText('Não é possível excluir este serviço')).toBeInTheDocument();
            expect(screen.getByText(/5 agendamentos vinculados/)).toBeInTheDocument();
        });

        it('deve desabilitar botão confirmar quando há agendamentos', () => {
            const details = {
                appointmentsCount: 2
            };

            render(
                <ConfirmationModal
                    {...defaultProps}
                    type="danger"
                    details={details}
                />
            );

            expect(screen.getByText('Confirmar')).toBeDisabled();
        });
    });

    describe('Interações', () => {
        it('deve chamar onConfirm ao clicar em confirmar', async () => {
            const user = userEvent.setup();
            const mockOnConfirm = jest.fn();

            render(
                <ConfirmationModal
                    {...defaultProps}
                    onConfirm={mockOnConfirm}
                />
            );

            await user.click(screen.getByText('Confirmar'));

            expect(mockOnConfirm).toHaveBeenCalled();
        });

        it('deve chamar onClose ao clicar em cancelar', async () => {
            const user = userEvent.setup();
            const mockOnClose = jest.fn();

            render(
                <ConfirmationModal
                    {...defaultProps}
                    onClose={mockOnClose}
                />
            );

            await user.click(screen.getByText('Cancelar'));

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('não deve permitir ações durante loading', async () => {
            const user = userEvent.setup();
            const mockOnConfirm = jest.fn();
            const mockOnClose = jest.fn();

            render(
                <ConfirmationModal
                    {...defaultProps}
                    onConfirm={mockOnConfirm}
                    onClose={mockOnClose}
                    loading={true}
                />
            );

            await user.click(screen.getByText('Confirmar'));
            await user.click(screen.getByText('Cancelar'));

            expect(mockOnConfirm).not.toHaveBeenCalled();
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Estados de Loading', () => {
        it('deve mostrar spinner durante loading', () => {
            render(<ConfirmationModal {...defaultProps} loading={true} />);

            expect(screen.getByRole('generic', { name: /sync/i })).toBeInTheDocument();
        });

        it('deve desabilitar botões durante loading', () => {
            render(<ConfirmationModal {...defaultProps} loading={true} />);

            expect(screen.getByText('Confirmar')).toBeDisabled();
            expect(screen.getByText('Cancelar')).toBeDisabled();
        });
    });

    describe('Sugestão de Desativação', () => {
        it('deve mostrar botão de desativar quando há agendamentos', () => {
            const details = {
                id: 'service-1',
                appointmentsCount: 3
            };

            render(
                <ConfirmationModal
                    {...defaultProps}
                    type="danger"
                    details={details}
                />
            );

            expect(screen.getByText('Desativar Serviço')).toBeInTheDocument();
        });

        it('deve emitir evento ao clicar em desativar', async () => {
            const user = userEvent.setup();
            const mockEventListener = jest.fn();

            window.addEventListener('suggest-deactivate-service', mockEventListener);

            const details = {
                id: 'service-1',
                appointmentsCount: 3
            };

            render(
                <ConfirmationModal
                    {...defaultProps}
                    type="danger"
                    details={details}
                />
            );

            await user.click(screen.getByText('Desativar Serviço'));

            expect(mockEventListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: { serviceId: 'service-1' }
                })
            );

            window.removeEventListener('suggest-deactivate-service', mockEventListener);
        });
    });

    describe('Textos Customizados', () => {
        it('deve usar textos customizados', () => {
            render(
                <ConfirmationModal
                    {...defaultProps}
                    title="Título Customizado"
                    message="Mensagem customizada"
                    confirmText="Sim"
                    cancelText="Não"
                />
            );

            expect(screen.getByText('Título Customizado')).toBeInTheDocument();
            expect(screen.getByText('Mensagem customizada')).toBeInTheDocument();
            expect(screen.getByText('Sim')).toBeInTheDocument();
            expect(screen.getByText('Não')).toBeInTheDocument();
        });
    });
});