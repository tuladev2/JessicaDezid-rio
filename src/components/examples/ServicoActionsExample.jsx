/**
 * Exemplo de uso do componente ServicoActions
 * Demonstra integração com hooks e sistema de notificações
 */

import { useState } from 'react';
import ServicoActions from '../ServicoActions';
import ServicoModal from '../ServicoModal';
import { useServicos } from '../../hooks/useServicos';
import { useToast } from '../../hooks/useToast';

export default function ServicoActionsExample() {
  const [editingServico, setEditingServico] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Hooks para gerenciar dados e notificações
  const { 
    servicos, 
    loading, 
    updateServico, 
    deleteServico, 
    toggleStatus, 
    operationLoading 
  } = useServicos();
  
  const { showSuccess, showError, toasts } = useToast();

  // Handler para edição
  const handleEdit = (servico) => {
    setEditingServico(servico);
    setModalOpen(true);
  };

  // Handler para toggle de status
  const handleToggleStatus = async (servicoId) => {
    try {
      const servico = servicos.find(s => s.id === servicoId);
      const novoStatus = !servico.is_active;
      
      await toggleStatus(servicoId);
      
      showSuccess(
        `Serviço ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`
      );
    } catch (error) {
      showError(error.message || 'Erro ao alterar status do serviço');
    }
  };

  // Handler para exclusão
  const handleDelete = async (servicoId) => {
    try {
      await deleteServico(servicoId);
      showSuccess('Serviço excluído com sucesso!');
    } catch (error) {
      showError(error.message || 'Erro ao excluir serviço');
    }
  };

  // Handler para submissão do modal de edição
  const handleSubmitEdit = async (formData) => {
    try {
      await updateServico(editingServico.id, formData);
      showSuccess('Serviço atualizado com sucesso!');
      setModalOpen(false);
      setEditingServico(null);
    } catch (error) {
      showError(error.message || 'Erro ao atualizar serviço');
    }
  };

  // Handler para fechar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingServico(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo: Ações de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração dos componentes ServicoActions com operações CRUD
        </p>
      </div>

      {/* Lista de Serviços com Ações */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
        <h2 className="font-serif text-xl text-on-surface mb-6">
          Serviços com Ações Completas
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border border-outline-variant/20 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-container rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-surface-container rounded w-32 mb-2"></div>
                      <div className="h-3 bg-surface-container rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-32 h-8 bg-surface-container rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : servicos.length > 0 ? (
          <div className="space-y-4">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="flex items-center justify-between p-4 border border-outline-variant/20 rounded-xl hover:bg-surface-container/30 transition-colors"
              >
                {/* Informações do Serviço */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                    {servico.image_url ? (
                      <img
                        src={servico.image_url}
                        alt={servico.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-lg">spa</span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-on-surface truncate mb-1">
                      {servico.name}
                    </h3>
                    <p className="text-sm text-secondary mb-1">
                      {servico.category} • {servico.duration_minutes} min
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      R$ {servico.price_single.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {/* Componente de Ações */}
                <ServicoActions
                  servico={servico}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  loading={operationLoading}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
              spa
            </span>
            <h3 className="font-serif text-lg text-on-surface mb-2">
              Nenhum serviço cadastrado
            </h3>
            <p className="text-secondary">
              Cadastre serviços para testar as funcionalidades de ação.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <ServicoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEdit}
        editingServico={editingServico}
        loading={operationLoading}
      />

      {/* Sistema de Notificações Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-xl shadow-lg max-w-sm transform transition-all duration-300
              ${toast.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Demonstração de Estados */}
      <div className="mt-8 bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
        <h3 className="font-serif text-lg text-on-surface mb-4">
          Estados Demonstrados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-on-surface mb-2">Funcionalidades:</h4>
            <ul className="space-y-1 text-secondary">
              <li>• Toggle de status (ativo/inativo)</li>
              <li>• Edição com modal pré-preenchido</li>
              <li>• Exclusão com verificação de agendamentos</li>
              <li>• Confirmações para ações destrutivas</li>
              <li>• Estados de loading por ação</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-on-surface mb-2">Validações:</h4>
            <ul className="space-y-1 text-secondary">
              <li>• Impede exclusão com agendamentos</li>
              <li>• Sugere desativação como alternativa</li>
              <li>• Confirmação para desativar serviços ativos</li>
              <li>• Ativação direta de serviços inativos</li>
              <li>• Feedback visual para todas as ações</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Debug Info (apenas para desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 bg-surface-container-low rounded-xl p-4">
          <h3 className="font-medium text-on-surface mb-2">Debug Info</h3>
          <div className="text-xs text-secondary space-y-1">
            <p><strong>Total de Serviços:</strong> {servicos.length}</p>
            <p><strong>Serviços Ativos:</strong> {servicos.filter(s => s.is_active).length}</p>
            <p><strong>Serviços Inativos:</strong> {servicos.filter(s => !s.is_active).length}</p>
            <p><strong>Loading Operação:</strong> {operationLoading ? 'Sim' : 'Não'}</p>
            <p><strong>Modal Aberto:</strong> {modalOpen ? 'Sim' : 'Não'}</p>
            <p><strong>Editando:</strong> {editingServico?.name || 'Nenhum'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo básico sem integração com hooks
 */
export function BasicServicoActionsExample() {
  const [servicos, setServicos] = useState([
    {
      id: '1',
      name: 'Limpeza de Pele Profunda',
      category: 'Tratamentos Faciais',
      duration_minutes: 90,
      price_single: 280,
      is_active: true,
      appointments_count: 0
    },
    {
      id: '2',
      name: 'Drenagem Linfática',
      category: 'Tratamentos Corporais',
      duration_minutes: 60,
      price_single: 150,
      is_active: false,
      appointments_count: 3
    }
  ]);

  const handleEdit = (servico) => {
    alert(`Editando: ${servico.name}`);
  };

  const handleToggleStatus = async (servicoId) => {
    setServicos(prev => prev.map(s => 
      s.id === servicoId ? { ...s, is_active: !s.is_active } : s
    ));
    
    const servico = servicos.find(s => s.id === servicoId);
    alert(`Status alterado: ${servico.name} agora está ${!servico.is_active ? 'ativo' : 'inativo'}`);
  };

  const handleDelete = async (servicoId) => {
    const servico = servicos.find(s => s.id === servicoId);
    
    if (servico.appointments_count > 0) {
      alert(`Não é possível excluir: ${servico.appointments_count} agendamentos vinculados`);
      return;
    }
    
    setServicos(prev => prev.filter(s => s.id !== servicoId));
    alert(`Serviço excluído: ${servico.name}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo Básico: Ações de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração com dados mockados (sem integração com Supabase)
        </p>
      </div>

      <div className="space-y-4">
        {servicos.map((servico) => (
          <div
            key={servico.id}
            className="flex items-center justify-between p-4 border border-outline-variant/20 rounded-xl"
          >
            <div>
              <h3 className="font-medium text-on-surface">{servico.name}</h3>
              <p className="text-sm text-secondary">{servico.category}</p>
              {servico.appointments_count > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {servico.appointments_count} agendamentos vinculados
                </p>
              )}
            </div>

            <ServicoActions
              servico={servico}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              loading={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}