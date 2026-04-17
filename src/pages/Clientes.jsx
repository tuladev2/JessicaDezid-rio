import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import FichaCliente from '../components/FichaCliente';

export default function Clientes() {
  // Estados principais de dados
  const [clientes, setClientes] = useState([]);
  const [fichasRecentes, setFichasRecentes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [prontuario, setProntuario] = useState(null);
  const [evolucoes, setEvolucoes] = useState([]);
  
  // Estados de UI e loading
  const [loading, setLoading] = useState(true);
  const [loadingProntuario, setLoadingProntuario] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Estados de modais
  const [modalNovaFicha, setModalNovaFicha] = useState(false);
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalEvolucao, setModalEvolucao] = useState(false);
  
  // Estados de formulários
  const [novoClienteForm, setNovoClienteForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: ''
  });
  
  const [novaEvolucaoForm, setNovaEvolucaoForm] = useState({
    notes: '',
    treatment_type: '',
    observations: ''
  });

  // Função para mostrar notificações
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Buscar clientes
  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      setClientes(data || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      showNotification('Erro ao carregar clientes', 'error');
    }
  };

  // Buscar fichas recentes
  const fetchFichasRecentes = async () => {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select(`*, clients(id, full_name, avatar_url)`)
        .order('updated_at', { ascending: false })
        .limit(10);

      // Ignorar se tabela ainda não existe
      if (error) {
        const ignorar = error.message?.includes('relation') ||
                        error.message?.includes('does not exist') ||
                        error.message?.includes('406');
        if (!ignorar) throw error;
      }

      setFichasRecentes(data || []);
    } catch (err) {
      console.warn('[Clientes] Fichas recentes indisponíveis:', err.message);
      setFichasRecentes([]);
    }
  };

  // Buscar prontuário do cliente
  const fetchProntuario = async (clienteId) => {
    try {
      setLoadingProntuario(true);

      const { data: prontuarioData, error: prontuarioError } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('client_id', clienteId)
        .single();

      // PGRST116 = nenhum registro encontrado (normal para cliente novo)
      // 406 / PGRST200 = tabela não existe ainda — tratar silenciosamente
      if (prontuarioError) {
        const ignorar = ['PGRST116', 'PGRST200'].includes(prontuarioError.code) ||
                        prontuarioError.message?.includes('406') ||
                        prontuarioError.message?.includes('relation') ||
                        prontuarioError.message?.includes('does not exist');
        if (!ignorar) throw prontuarioError;
      }

      setProntuario(prontuarioData || null);

      // Buscar evoluções
      const { data: evolucoesData, error: evolucoesError } = await supabase
        .from('evolucoes')
        .select('*')
        .eq('client_id', clienteId)
        .order('created_at', { ascending: false });

      if (evolucoesError) {
        const ignorar = evolucoesError.message?.includes('relation') ||
                        evolucoesError.message?.includes('does not exist');
        if (!ignorar) throw evolucoesError;
      }

      setEvolucoes(evolucoesData || []);

    } catch (err) {
      console.warn('[Clientes] Erro ao buscar prontuário:', err.message);
      // Não exibir notificação de erro — tabela pode ainda não existir
      setProntuario(null);
      setEvolucoes([]);
    } finally {
      setLoadingProntuario(false);
    }
  };

  // Selecionar cliente
  const selecionarCliente = async (cliente) => {
    setClienteSelecionado(cliente);
    await fetchProntuario(cliente.id);
    setSidebarOpen(false); // Fechar sidebar no mobile
    
    // Salvar no localStorage para persistência
    localStorage.setItem('clienteSelecionado', JSON.stringify(cliente));
  };

  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return clientes;
    return clientes.filter(cliente => 
      cliente.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.phone?.includes(searchQuery)
    );
  }, [clientes, searchQuery]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchClientes(),
        fetchFichasRecentes()
      ]);
      
      // Restaurar cliente selecionado do localStorage
      const savedCliente = localStorage.getItem('clienteSelecionado');
      if (savedCliente) {
        try {
          const cliente = JSON.parse(savedCliente);
          await selecionarCliente(cliente);
        } catch (err) {
          console.error('Erro ao restaurar cliente:', err);
        }
      }
      
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Criar novo cliente
  const criarNovoCliente = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([novoClienteForm])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchClientes();
      await selecionarCliente(data);
      
      setModalNovoCliente(false);
      setNovoClienteForm({
        full_name: '',
        email: '',
        phone: '',
        birth_date: '',
        address: ''
      });
      
      showNotification('Cliente criado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      showNotification('Erro ao criar cliente', 'error');
    }
  };

  // Salvar/atualizar prontuário
  const salvarProntuario = async (dadosProntuario) => {
    try {
      if (!clienteSelecionado) return;
      
      const prontuarioData = {
        client_id: clienteSelecionado.id,
        ...dadosProntuario,
        updated_at: new Date().toISOString()
      };
      
      if (prontuario) {
        // Atualizar existente
        const { error } = await supabase
          .from('prontuarios')
          .update(prontuarioData)
          .eq('id', prontuario.id);
        
        if (error) throw error;
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('prontuarios')
          .insert([prontuarioData])
          .select()
          .single();
        
        if (error) throw error;
        setProntuario(data);
      }
      
      await fetchProntuario(clienteSelecionado.id);
      await fetchFichasRecentes();
      showNotification('Prontuário salvo com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao salvar prontuário:', err);
      showNotification('Erro ao salvar prontuário', 'error');
    }
  };

  // Adicionar nova evolução
  const adicionarEvolucao = async () => {
    try {
      if (!clienteSelecionado) return;
      
      const { error } = await supabase
        .from('evolucoes')
        .insert([{
          client_id: clienteSelecionado.id,
          ...novaEvolucaoForm,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      await fetchProntuario(clienteSelecionado.id);
      setModalEvolucao(false);
      setNovaEvolucaoForm({
        notes: '',
        treatment_type: '',
        observations: ''
      });
      
      showNotification('Evolução adicionada com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao adicionar evolução:', err);
      showNotification('Erro ao adicionar evolução', 'error');
    }
  };

  // Componente para estado vazio
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-primary">folder_open</span>
      </div>
      <h3 className="font-serif text-xl text-on-surface mb-2">Nenhuma ficha selecionada</h3>
      <p className="text-sm text-secondary mb-6 max-w-md">
        Selecione uma ficha existente na lista lateral ou crie uma nova ficha de cuidados para começar o atendimento.
      </p>
      <button 
        className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all"
        onClick={() => setModalNovaFicha(true)}
      >
        + Nova Ficha de Cuidados
      </button>
    </div>
  );

  // Componente para skeleton de loading
  const FichaSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-surface-container rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-surface-container rounded w-48 mb-2"></div>
          <div className="h-3 bg-surface-container rounded w-32"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-4 bg-surface-container rounded w-32"></div>
          <div className="h-32 bg-surface-container rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-surface-container rounded w-32"></div>
          <div className="h-32 bg-surface-container rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-container-low/30">
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

      {/* Sidebar - Lista de Fichas */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:relative z-40 w-80 h-full bg-surface-container-lowest border-r border-outline-variant/20 transition-transform duration-300
      `}>
        <div className="p-4 lg:p-6 h-full flex flex-col">
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Fichário de Clientes</p>
              <h3 className="font-serif text-lg text-on-surface">Fichas de Cuidados</h3>
            </div>
            <button
              className="lg:hidden w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-sm text-secondary">close</span>
            </button>
          </div>

          {/* Busca */}
          <div className="mb-6">
            <div className="flex items-center gap-3 bg-surface-container px-4 py-3 rounded-xl">
              <span className="material-symbols-outlined text-secondary text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline focus:outline-none"
                placeholder="Buscar cliente..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Botão Nova Ficha */}
          <button
            onClick={() => setModalNovaFicha(true)}
            className="w-full py-4 px-6 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 shadow-md mb-6 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nova Ficha de Cuidados
          </button>

          {/* Lista de Fichas Recentes */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs tracking-widest uppercase text-secondary mb-4">Fichas Recentes</p>
            <div className="space-y-2">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl">
                    <div className="w-10 h-10 bg-surface-container rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-surface-container rounded w-24 mb-1"></div>
                      <div className="h-2 bg-surface-container rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : (
                fichasRecentes.map((ficha) => (
                  <button
                    key={ficha.id}
                    onClick={() => selecionarCliente(ficha.clients)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                      clienteSelecionado?.id === ficha.clients?.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-surface-container'
                    }`}
                  >
                    <img
                      src={ficha.clients?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png'}
                      alt={ficha.clients?.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {ficha.clients?.full_name}
                      </p>
                      <p className="text-xs text-secondary truncate">
                        Atualizado {new Date(ficha.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Lista de Todos os Clientes */}
            {searchQuery && (
              <div className="mt-6">
                <p className="text-xs tracking-widest uppercase text-secondary mb-4">Resultados da Busca</p>
                <div className="space-y-2">
                  {clientesFiltrados.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => selecionarCliente(cliente)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        clienteSelecionado?.id === cliente.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-surface-container'
                      }`}
                    >
                      <img
                        src={cliente.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png'}
                        alt={cliente.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {cliente.full_name}
                        </p>
                        <p className="text-xs text-secondary truncate">
                          {cliente.email || cliente.phone}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Área Principal - Ficha de Cuidados */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface-container-lowest border-b border-outline-variant/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg text-secondary">menu</span>
          </button>
          <h2 className="font-serif text-lg text-on-surface">
            {clienteSelecionado ? clienteSelecionado.full_name : 'Ficha de Cuidados'}
          </h2>
          <div className="w-10"></div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto">
          {!clienteSelecionado ? (
            <EmptyState />
          ) : loadingProntuario ? (
            <div className="p-4 lg:p-12">
              <FichaSkeleton />
            </div>
          ) : (
            <div className="p-4 lg:p-12">
              <FichaCliente 
                cliente={clienteSelecionado}
                prontuario={prontuario}
                evolucoes={evolucoes}
                onSalvarProntuario={salvarProntuario}
                onNovaEvolucao={() => setModalEvolucao(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      
      {/* Modal Nova Ficha de Cuidados */}
      {modalNovaFicha && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-on-surface">Nova Ficha de Cuidados</h3>
              <button
                onClick={() => setModalNovaFicha(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm text-secondary">close</span>
              </button>
            </div>
            
            <p className="text-sm text-secondary mb-6">
              Selecione uma cliente existente ou cadastre uma nova para criar a ficha de cuidados.
            </p>

            {/* Busca de Cliente */}
            <div className="mb-6">
              <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                Buscar Cliente Existente
              </label>
              <div className="flex items-center gap-3 bg-surface-container px-4 py-3 rounded-xl mb-4">
                <span className="material-symbols-outlined text-secondary text-lg">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline focus:outline-none"
                  placeholder="Digite o nome da cliente..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Lista de Clientes Filtrados */}
              {searchQuery && (
                <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
                  {clientesFiltrados.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => {
                        selecionarCliente(cliente);
                        setModalNovaFicha(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors text-left"
                    >
                      <img
                        src={cliente.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png'}
                        alt={cliente.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {cliente.full_name}
                        </p>
                        <p className="text-xs text-secondary truncate">
                          {cliente.email || cliente.phone}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-outline-variant/30"></div>
              <span className="text-xs text-secondary uppercase tracking-widest">ou</span>
              <div className="flex-1 h-px bg-outline-variant/30"></div>
            </div>

            {/* Botão Cadastrar Nova Cliente */}
            <button
              onClick={() => {
                setModalNovaFicha(false);
                setModalNovoCliente(true);
              }}
              className="w-full py-4 px-6 bg-tertiary text-on-tertiary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Cadastrar Nova Cliente
            </button>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {modalNovoCliente && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-on-surface">Cadastrar Nova Cliente</h3>
              <button
                onClick={() => setModalNovoCliente(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm text-secondary">close</span>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); criarNovoCliente(); }} className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                  Nome Completo *
                </label>
                <input
                  required
                  type="text"
                  value={novoClienteForm.full_name}
                  onChange={(e) => setNovoClienteForm({...novoClienteForm, full_name: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={novoClienteForm.email}
                    onChange={(e) => setNovoClienteForm({...novoClienteForm, email: e.target.value})}
                    className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={novoClienteForm.phone}
                    onChange={(e) => setNovoClienteForm({...novoClienteForm, phone: e.target.value})}
                    className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={novoClienteForm.birth_date}
                  onChange={(e) => setNovoClienteForm({...novoClienteForm, birth_date: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                  Endereço
                </label>
                <textarea
                  value={novoClienteForm.address}
                  onChange={(e) => setNovoClienteForm({...novoClienteForm, address: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                  rows={3}
                  placeholder="Endereço completo (opcional)"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setModalNovoCliente(false)}
                  className="px-6 py-3 rounded-xl text-xs font-semibold tracking-widest uppercase text-secondary hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all shadow-md"
                >
                  Criar Cliente e Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Evolução */}
      {modalEvolucao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-on-surface">Nova Evolução</h3>
              <button
                onClick={() => setModalEvolucao(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm text-secondary">close</span>
              </button>
            </div>

            <p className="text-sm text-secondary mb-6">
              Registre uma nova evolução do tratamento para {clienteSelecionado?.full_name}.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); adicionarEvolucao(); }} className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                  Tipo de Tratamento
                </label>
                <select
                  value={novaEvolucaoForm.treatment_type}
                  onChange={(e) => setNovaEvolucaoForm({...novaEvolucaoForm, treatment_type: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface"
                >
                  <option value="">Selecione o tipo de tratamento</option>
                  <option value="Limpeza de Pele">Limpeza de Pele</option>
                  <option value="Hidratação">Hidratação</option>
                  <option value="Peeling">Peeling</option>
                  <option value="Massagem Facial">Massagem Facial</option>
                  <option value="Tratamento Anti-idade">Tratamento Anti-idade</option>
                  <option value="Tratamento de Acne">Tratamento de Acne</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                  Notas do Atendimento *
                </label>
                <textarea
                  required
                  value={novaEvolucaoForm.notes}
                  onChange={(e) => setNovaEvolucaoForm({...novaEvolucaoForm, notes: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                  rows={4}
                  placeholder="Descreva o procedimento realizado, reações da pele, produtos utilizados..."
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-secondary mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  value={novaEvolucaoForm.observations}
                  onChange={(e) => setNovaEvolucaoForm({...novaEvolucaoForm, observations: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                  rows={3}
                  placeholder="Recomendações, cuidados pós-tratamento, próximos passos..."
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setModalEvolucao(false)}
                  className="px-6 py-3 rounded-xl text-xs font-semibold tracking-widest uppercase text-secondary hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all shadow-md"
                >
                  Salvar Evolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
