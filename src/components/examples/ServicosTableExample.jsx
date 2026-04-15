/**
 * Exemplo de uso dos componentes ServicosTable e ServicoCard
 * Demonstra responsividade e diferentes estados
 */

import { useState } from 'react';
import ServicosTable from '../ServicosTable';
import ServicoCard, { ServicoCardSkeleton } from '../ServicoCard';
import ServicoModal from '../ServicoModal';
import { useServicos } from '../../hooks/useServicos';
import { useToast } from '../../hooks/useToast';

export default function ServicosTableExample() {
  const [editingServico, setEditingServico] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'table', 'cards'

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

  // Handlers para ações
  const handleEdit = (servico) => {
    setEditingServico(servico);
    setModalOpen(true);
  };

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

  const handleDelete = async (servicoId) => {
    try {
      await deleteServico(servicoId);
      showSuccess('Serviço excluído com sucesso!');
    } catch (error) {
      showError(error.message || 'Erro ao excluir serviço');
    }
  };

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

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingServico(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo: Tabela e Cards de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração dos componentes ServicosTable e ServicoCard com responsividade
        </p>
      </div>

      {/* Controles de Visualização */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Modo de visualização:</span>
          <div className="flex items-center gap-1 bg-surface-container/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode('auto')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'auto' 
                  ? 'bg-primary text-on-primary' 
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-primary text-on-primary' 
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Tabela
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-primary text-on-primary' 
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Cards
            </button>
          </div>
        </div>

        <div className="text-sm text-secondary">
          {servicos.length} {servicos.length === 1 ? 'serviço' : 'serviços'}
        </div>
      </div>

      {/* Visualização Automática (Responsiva) */}
      {viewMode === 'auto' && (
        <ServicosTable
          servicos={servicos}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          operationLoading={operationLoading}
        />
      )}

      {/* Visualização Forçada - Tabela */}
      {viewMode === 'table' && (
        <div className="bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container/30 border-b border-outline-variant/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-surface-container rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-surface-container rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-surface-container rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-surface-container rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 bg-surface-container rounded w-24"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  servicos.map((servico) => (
                    <tr key={servico.id} className="hover:bg-surface-container/20">
                      <td className="px-6 py-4">
                        <div className="font-medium text-on-surface">{servico.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary">{servico.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          servico.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {servico.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-primary">
                          R$ {servico.price_single.toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(servico)}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visualização Forçada - Cards */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {/* Cards em diferentes variantes */}
          <div>
            <h3 className="font-serif text-lg text-on-surface mb-4">Cards Padrão</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <ServicoCardSkeleton key={i} />
                ))
              ) : (
                servicos.map((servico) => (
                  <ServicoCard
                    key={servico.id}
                    servico={servico}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    loading={operationLoading}
                  />
                ))
              )}
            </div>
          </div>

          {/* Cards Compactos */}
          <div>
            <h3 className="font-serif text-lg text-on-surface mb-4">Cards Compactos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <ServicoCardSkeleton key={i} variant="compact" />
                ))
              ) : (
                servicos.map((servico) => (
                  <ServicoCard
                    key={servico.id}
                    servico={servico}
                    variant="compact"
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    loading={operationLoading}
                  />
                ))
              )}
            </div>
          </div>

          {/* Cards Detalhados */}
          <div>
            <h3 className="font-serif text-lg text-on-surface mb-4">Cards Detalhados</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <ServicoCardSkeleton key={i} variant="detailed" />
                ))
              ) : (
                servicos.slice(0, 4).map((servico) => (
                  <ServicoCard
                    key={servico.id}
                    servico={servico}
                    variant="detailed"
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    loading={operationLoading}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Informações de Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-surface-container-low rounded-xl p-4">
          <h3 className="font-medium text-on-surface mb-2">Debug Info</h3>
          <div className="text-xs text-secondary space-y-1">
            <p><strong>Modo de Visualização:</strong> {viewMode}</p>
            <p><strong>Total de Serviços:</strong> {servicos.length}</p>
            <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
            <p><strong>Operation Loading:</strong> {operationLoading ? 'Sim' : 'Não'}</p>
            <p><strong>Modal Aberto:</strong> {modalOpen ? 'Sim' : 'Não'}</p>
            <p><strong>Largura da Tela:</strong> {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo básico com dados mockados
 */
export function BasicServicosTableExample() {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('auto');

  const mockServicos = [
    {
      id: '1',
      name: 'Limpeza de Pele Profunda',
      category: 'Tratamentos Faciais',
      duration_minutes: 90,
      price_single: 280,
      price_package: 1200,
      description: 'Tratamento completo para limpeza profunda da pele facial.',
      image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
      is_active: true
    },
    {
      id: '2',
      name: 'Drenagem Linfática',
      category: 'Tratamentos Corporais',
      duration_minutes: 60,
      price_single: 150,
      price_package: null,
      description: 'Massagem terapêutica para redução de inchaço.',
      image_url: null,
      is_active: false
    },
    {
      id: '3',
      name: 'Peeling Químico',
      category: 'Tratamentos Faciais',
      duration_minutes: 45,
      price_single: 220,
      price_package: 950,
      description: 'Renovação celular com ácidos específicos.',
      image_url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=300&fit=crop',
      is_active: true
    }
  ];

  const handleEdit = (servico) => {
    alert(`Editando: ${servico.name}`);
  };

  const handleToggleStatus = async (servicoId) => {
    alert(`Toggle status do serviço: ${servicoId}`);
  };

  const handleDelete = async (servicoId) => {
    alert(`Excluindo serviço: ${servicoId}`);
  };

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo Básico: Tabela de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração com dados mockados e controles de teste
        </p>
      </div>

      {/* Controles de Teste */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={toggleLoading}
          className="px-4 py-2 bg-secondary text-on-secondary rounded-xl hover:bg-secondary/90 transition-colors text-sm"
        >
          {loading ? 'Parar Loading' : 'Simular Loading'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Visualização:</span>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1 border border-outline-variant rounded-lg text-sm"
          >
            <option value="auto">Automática</option>
            <option value="table">Tabela</option>
            <option value="cards">Cards</option>
          </select>
        </div>
      </div>

      {/* Componente Principal */}
      {viewMode === 'auto' ? (
        <ServicosTable
          servicos={mockServicos}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          operationLoading={false}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <ServicoCardSkeleton key={i} />
            ))
          ) : (
            mockServicos.map((servico) => (
              <ServicoCard
                key={servico.id}
                servico={servico}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                loading={false}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl editorial-shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase">
                  Serviço
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase">
                  Preço
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-surface-container rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 bg-surface-container rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 bg-surface-container rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-surface-container rounded w-16"></div>
                    </td>
                  </tr>
                ))
              ) : (
                mockServicos.map((servico) => (
                  <tr key={servico.id} className="hover:bg-surface-container/20">
                    <td className="px-6 py-4 font-medium">{servico.name}</td>
                    <td className="px-6 py-4 text-secondary">{servico.category}</td>
                    <td className="px-6 py-4 text-primary font-semibold">
                      R$ {servico.price_single.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        servico.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {servico.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}