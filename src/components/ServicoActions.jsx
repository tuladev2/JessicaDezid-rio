import { useState } from 'react';
import Toggle from './ui/Toggle';
import ConfirmationModal from './ConfirmationModal';

/**
 * Componente de ações para cada serviço na lista
 * Inclui toggle de status, edição e exclusão
 */
export default function ServicoActions({
  servico,
  onEdit,
  onToggleStatus,
  onDelete,
  loading = false
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'toggle', 'delete'

  // Handler para toggle de status
  const handleToggleStatus = async () => {
    if (loading || actionLoading) return;

    // Se está ativando um serviço inativo, fazer direto
    if (!servico.is_active) {
      try {
        setActionLoading('toggle');
        await onToggleStatus(servico.id);
      } catch (error) {
        console.error('Erro ao ativar serviço:', error);
      } finally {
        setActionLoading(null);
      }
      return;
    }

    // Se está desativando um serviço ativo, mostrar confirmação
    setShowToggleModal(true);
  };

  // Confirmar desativação
  const handleConfirmToggle = async () => {
    try {
      setActionLoading('toggle');
      await onToggleStatus(servico.id);
      setShowToggleModal(false);
    } catch (error) {
      console.error('Erro ao desativar serviço:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handler para exclusão
  const handleDelete = () => {
    if (loading || actionLoading) return;
    setShowDeleteModal(true);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    try {
      setActionLoading('delete');
      await onDelete(servico.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      // Modal permanece aberto para mostrar erro
    } finally {
      setActionLoading(null);
    }
  };

  // Handler para edição
  const handleEdit = () => {
    if (loading || actionLoading) return;
    onEdit(servico);
  };

  // Escutar evento de sugestão de desativação
  useState(() => {
    const handleSuggestDeactivate = (event) => {
      if (event.detail.serviceId === servico.id) {
        setShowDeleteModal(false);
        setShowToggleModal(true);
      }
    };

    window.addEventListener('suggest-deactivate-service', handleSuggestDeactivate);
    return () => window.removeEventListener('suggest-deactivate-service', handleSuggestDeactivate);
  }, [servico.id]);

  const isLoading = loading || actionLoading;

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Toggle de Status */}
        <div className="flex items-center gap-2">
          <Toggle
            checked={servico.is_active}
            onChange={handleToggleStatus}
            disabled={isLoading}
            loading={actionLoading === 'toggle'}
            size="sm"
          />
          <span className={`text-xs font-medium ${servico.is_active ? 'text-green-600' : 'text-gray-500'}`}>
            {servico.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-1">
          {/* Botão Editar */}
          <button
            onClick={handleEdit}
            disabled={isLoading}
            className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Editar serviço"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>

          {/* Botão Excluir */}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 text-outline hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Excluir serviço"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmação de Desativação */}
      <ConfirmationModal
        isOpen={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={handleConfirmToggle}
        title="Desativar Serviço"
        message="Tem certeza que deseja desativar este serviço?"
        confirmText="Desativar"
        cancelText="Cancelar"
        type="warning"
        loading={actionLoading === 'toggle'}
        details={{
          name: servico.name,
          category: servico.category,
          status: servico.is_active
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Serviço"
        message="Tem certeza que deseja excluir este serviço permanentemente?"
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={actionLoading === 'delete'}
        details={{
          id: servico.id,
          name: servico.name,
          category: servico.category,
          appointmentsCount: servico.appointments_count || 0 // Será calculado pelo hook
        }}
      />
    </>
  );
}