import Modal from './Modal';

/**
 * Modal de confirmação reutilizável para ações destrutivas
 * Usado para confirmar exclusões e outras operações críticas
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger', // 'danger', 'warning', 'info'
  loading = false,
  details = null // Objeto com detalhes adicionais para exibir
}) {
  
  // Configurações visuais baseadas no tipo
  const typeConfig = {
    danger: {
      icon: 'delete',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmText: 'text-white'
    },
    warning: {
      icon: 'warning',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      confirmText: 'text-white'
    },
    info: {
      icon: 'info',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmBg: 'bg-primary hover:bg-primary/90',
      confirmText: 'text-on-primary'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  const handleConfirm = async () => {
    if (!loading) {
      await onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      width="max-w-md"
    >
      <div className="text-center">
        {/* Ícone */}
        <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full ${config.iconBg} mb-4`}>
          <span className={`material-symbols-outlined ${config.iconColor} text-2xl`}>
            {config.icon}
          </span>
        </div>

        {/* Mensagem Principal */}
        <p className="text-lg font-medium text-on-surface mb-2">
          {message}
        </p>

        {/* Detalhes Adicionais */}
        {details && (
          <div className="bg-surface-container/30 rounded-xl p-4 mb-6 text-left">
            {details.name && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-secondary">Nome:</span>
                <span className="text-sm font-medium text-on-surface">{details.name}</span>
              </div>
            )}
            {details.category && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-secondary">Categoria:</span>
                <span className="text-sm text-on-surface">{details.category}</span>
              </div>
            )}
            {details.appointmentsCount !== undefined && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-secondary">Agendamentos:</span>
                <span className={`text-sm font-medium ${details.appointmentsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {details.appointmentsCount} {details.appointmentsCount === 1 ? 'agendamento' : 'agendamentos'}
                </span>
              </div>
            )}
            {details.status !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Status atual:</span>
                <span className={`text-sm font-medium ${details.status ? 'text-green-600' : 'text-gray-600'}`}>
                  {details.status ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Aviso para exclusão com agendamentos */}
        {details?.appointmentsCount > 0 && type === 'danger' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 text-lg mt-0.5">error</span>
              <div className="text-left">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Não é possível excluir este serviço
                </p>
                <p className="text-xs text-red-700">
                  Existem {details.appointmentsCount} {details.appointmentsCount === 1 ? 'agendamento vinculado' : 'agendamentos vinculados'} a este serviço. 
                  Considere desativá-lo em vez de excluí-lo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || (details?.appointmentsCount > 0 && type === 'danger')}
            className={`
              px-6 py-2 text-sm font-medium rounded-xl transition-colors 
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
              ${config.confirmBg} ${config.confirmText}
            `}
          >
            {loading && (
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            )}
            {confirmText}
          </button>
        </div>

        {/* Sugestão alternativa para exclusão bloqueada */}
        {details?.appointmentsCount > 0 && type === 'danger' && (
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <p className="text-xs text-secondary mb-2">Alternativa recomendada:</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                // Emitir evento customizado para sugerir desativação
                window.dispatchEvent(new CustomEvent('suggest-deactivate-service', { 
                  detail: { serviceId: details.id } 
                }));
              }}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-xs">toggle_off</span>
              Desativar Serviço
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}