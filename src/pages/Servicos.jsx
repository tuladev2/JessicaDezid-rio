import { useState, useMemo } from 'react';
import { useServicos } from '../hooks/useServicos';
import ServicosTable from '../components/ServicosTable';
import ServicoModal from '../components/ServicoModal';

export default function Servicos() {
  // Estados locais da página
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Hook customizado para gerenciar dados dos serviços
  const {
    servicos,
    loading,
    error,
    createServico,
    updateServico,
    deleteServico,
    toggleStatus,
    refetch
  } = useServicos({});

  // Filtrar serviços baseado na categoria e busca
  const filteredServicos = useMemo(() => {
    let filtered = servicos || [];
    
    // Filtro por categoria
    if (activeCategory !== 'Todos') {
      filtered = filtered.filter(servico => 
        servico.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    // Filtro por busca
    if (searchQuery.trim()) {
      filtered = filtered.filter(servico =>
        servico.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [servicos, activeCategory, searchQuery]);

  // Calcular ticket médio
  const ticketMedio = useMemo(() => {
    if (!servicos || servicos.length === 0) return 0;
    const total = servicos.reduce((sum, servico) => sum + (servico.price_single || 0), 0);
    return total / servicos.length;
  }, [servicos]);

  // Categorias disponíveis
  const categories = ['Todos', 'Tratamentos Faciais', 'Tratamentos Corporais', 'Depilação', 'Massagens'];

  // Função para mostrar notificações
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handlers para operações CRUD
  const handleCreateServico = () => {
    setEditingServico(null);
    setModalOpen(true);
  };

  const handleEditServico = (servico) => {
    setEditingServico(servico);
    setModalOpen(true);
  };

  const handleToggleStatus = async (servicoId) => {
    try {
      setOperationLoading(true);
      await toggleStatus(servicoId);
      showNotification('Status do serviço atualizado com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao atualizar status do serviço', 'error');
      console.error('Erro ao toggle status:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteServico = async (servicoId) => {
    try {
      setOperationLoading(true);
      await deleteServico(servicoId);
      showNotification('Serviço excluído com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao excluir serviço', 'error');
      console.error('Erro ao excluir:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSubmitModal = async (formData) => {
    try {
      setOperationLoading(true);
      
      if (editingServico) {
        await updateServico(editingServico.id, formData);
        showNotification('Serviço atualizado com sucesso!', 'success');
      } else {
        await createServico(formData);
        showNotification('Serviço criado com sucesso!', 'success');
      }
      
      setModalOpen(false);
      setEditingServico(null);
    } catch (error) {
      showNotification(editingServico ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço', 'error');
      console.error('Erro ao salvar:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="px-4 lg:px-12 py-6 lg:py-10">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">
            Gestão de Portfólio
          </p>
          <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">
            Serviços
          </h2>
        </div>
        <button 
          onClick={handleCreateServico}
          disabled={operationLoading}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 shadow-md disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Serviço
        </button>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="mb-6 p-4 bg-error-container text-error text-sm rounded-xl border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">warning</span>
          <span>{error}</span>
        </div>
      )}

      {/* Notificações Toast */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2 min-w-80 max-w-md
          ${notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
          }
        `}>
          <span className="material-symbols-outlined text-lg">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Campo de Busca */}
      <div className="mb-6">
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-3 rounded-xl max-w-md">
          <span className="material-symbols-outlined text-secondary text-lg">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline focus:outline-none"
            placeholder="Buscar serviços por nome..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-medium tracking-wider transition-all duration-300 whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-secondary hover:bg-primary/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Componente de Tabela/Cards */}
      <ServicosTable
        servicos={filteredServicos}
        loading={loading}
        onEdit={handleEditServico}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteServico}
        operationLoading={operationLoading}
      />

      {/* Estatísticas com Ticket Médio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-6 lg:mt-8">
        <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
          <p className="text-2xl lg:text-3xl font-light text-on-surface mb-1">
            {servicos.length}
          </p>
          <p className="text-xs text-secondary">Serviços Listados</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
          <p className="text-2xl lg:text-3xl font-light text-on-surface mb-1">
            R$ {ticketMedio.toFixed(0)}
          </p>
          <p className="text-xs text-secondary">Ticket Médio</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
          <p className="text-2xl lg:text-3xl font-light text-on-surface mb-1">
            {servicos.length > 0 
              ? Math.round((servicos.filter(s => s.is_active).length / servicos.length) * 100)
              : 0
            }%
          </p>
          <p className="text-xs text-secondary">Taxa de Ativação</p>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      <ServicoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingServico(null);
        }}
        onSubmit={handleSubmitModal}
        editingServico={editingServico}
        loading={operationLoading}
      />
    </div>
  );
}
