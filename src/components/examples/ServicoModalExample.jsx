/**
 * Exemplo de uso do componente ServicoModal
 * Demonstra integração com o hook useServicos e useToast
 */

import { useState } from 'react';
import ServicoModal from '../ServicoModal';
import { useServicos } from '../../hooks/useServicos';
import { useToast } from '../../hooks/useToast';

export default function ServicoModalExample() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState(null);
  
  // Hooks para gerenciar dados e notificações
  const { servicos, loading, createServico, updateServico, operationLoading } = useServicos();
  const { showSuccess, showError, toasts } = useToast();

  // Handler para abrir modal de criação
  const handleCreateServico = () => {
    setEditingServico(null);
    setModalOpen(true);
  };

  // Handler para abrir modal de edição
  const handleEditServico = (servico) => {
    setEditingServico(servico);
    setModalOpen(true);
  };

  // Handler para fechar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingServico(null);
  };

  // Handler para submissão do formulário
  const handleSubmitServico = async (formData) => {
    try {
      if (editingServico) {
        // Edição
        await updateServico(editingServico.id, formData);
        showSuccess('Serviço atualizado com sucesso!');
      } else {
        // Criação
        await createServico(formData);
        showSuccess('Serviço criado com sucesso!');
      }
      
      handleCloseModal();
    } catch (error) {
      showError(error.message || 'Erro ao salvar serviço');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo: Modal de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração do componente ServicoModal integrado com hooks
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="mb-6">
        <button
          onClick={handleCreateServico}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Serviço
        </button>
      </div>

      {/* Lista de Serviços */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
        <h2 className="font-serif text-xl text-on-surface mb-4">
          Serviços Cadastrados
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 p-4 border border-outline-variant/20 rounded-xl">
                  <div className="w-16 h-16 bg-surface-container rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-surface-container rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-surface-container rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-surface-container rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : servicos.length > 0 ? (
          <div className="space-y-4">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="flex items-center gap-4 p-4 border border-outline-variant/20 rounded-xl hover:bg-surface-container/30 transition-colors"
              >
                {/* Imagem do Serviço */}
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

                {/* Informações do Serviço */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-on-surface truncate">
                      {servico.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        servico.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {servico.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-secondary mb-1">
                    {servico.category} • {servico.duration_minutes} min
                  </p>
                  {servico.description && (
                    <p className="text-xs text-outline truncate">
                      {servico.description}
                    </p>
                  )}
                </div>

                {/* Preços e Ações */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-on-surface mb-2">
                    R$ {servico.price_single.toFixed(2).replace('.', ',')}
                  </p>
                  <button
                    onClick={() => handleEditServico(servico)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">edit</span>
                    Editar
                  </button>
                </div>
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
            <p className="text-secondary mb-4">
              Comece criando seu primeiro serviço para a clínica.
            </p>
            <button
              onClick={handleCreateServico}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Criar Primeiro Serviço
            </button>
          </div>
        )}
      </div>

      {/* Modal de Serviço */}
      <ServicoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitServico}
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

      {/* Debug Info (apenas para desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 bg-surface-container-low rounded-xl p-4">
          <h3 className="font-medium text-on-surface mb-2">Debug Info</h3>
          <div className="text-xs text-secondary space-y-1">
            <p><strong>Modal Aberto:</strong> {modalOpen ? 'Sim' : 'Não'}</p>
            <p><strong>Modo:</strong> {editingServico ? 'Edição' : 'Criação'}</p>
            <p><strong>Serviço Editando:</strong> {editingServico?.name || 'Nenhum'}</p>
            <p><strong>Loading Operação:</strong> {operationLoading ? 'Sim' : 'Não'}</p>
            <p><strong>Total de Serviços:</strong> {servicos.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo básico sem integração com hooks
 */
export function BasicServicoModalExample() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState(null);

  const mockServico = {
    id: '1',
    name: 'Limpeza de Pele Profunda',
    category: 'Tratamentos Faciais',
    duration_minutes: 90,
    price_single: 280,
    price_package: 1200,
    description: 'Tratamento completo para limpeza profunda da pele facial.',
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
    is_active: true
  };

  const handleSubmit = async (formData) => {
    console.log('Dados do formulário:', formData);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`${editingServico ? 'Serviço atualizado' : 'Serviço criado'} com sucesso!`);
    setModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo Básico: Modal de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração sem integração com hooks (dados mockados)
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => {
            setEditingServico(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Serviço
        </button>

        <button
          onClick={() => {
            setEditingServico(mockServico);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-xl hover:bg-secondary/90 transition-colors font-medium ml-4"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Editar Serviço Exemplo
        </button>
      </div>

      <ServicoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editingServico={editingServico}
        loading={false}
      />
    </div>
  );
}