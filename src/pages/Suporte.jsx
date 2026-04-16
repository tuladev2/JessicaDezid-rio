import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { sendMessageToAI as sendMessageToGemini } from '../lib/openai';

export default function Suporte() {
  // Estados principais
  const [tickets, setTickets] = useState([]);
  const [ticketAtivo, setTicketAtivo] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Estados de UI
  const [novaMensagem, setNovaMensagem] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Ref para scroll automático
  const messagesEndRef = useRef(null);

  const statusFilters = ['Todos', 'Ativo', 'Pendente', 'Em Atendimento', 'Resolvido'];

  // Função para mostrar notificações
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Scroll automático para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Buscar tickets
  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('suporte_tickets')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Erro ao buscar tickets:', err);
      showNotification('Erro ao carregar tickets', 'error');
    }
  };

  // Buscar mensagens do ticket ativo
  const fetchMensagens = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from('suporte_mensagens')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMensagens(data || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      showNotification('Erro ao carregar mensagens', 'error');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTickets();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Criar novo ticket
  const criarNovoTicket = async () => {
    try {
      const { data, error } = await supabase
        .from('suporte_tickets')
        .insert([{
          titulo: 'Nova Conversa com IA',
          status: 'Ativo',
          categoria: 'Geral'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchTickets();
      setTicketAtivo(data);
      setMensagens([]);
      setSidebarOpen(false); // Fechar sidebar no mobile
      
      showNotification('Nova conversa iniciada!', 'success');
    } catch (err) {
      console.error('Erro ao criar ticket:', err);
      showNotification('Erro ao criar nova conversa', 'error');
    }
  };

  // Selecionar ticket
  const selecionarTicket = async (ticket) => {
    setTicketAtivo(ticket);
    await fetchMensagens(ticket.id);
    setSidebarOpen(false); // Fechar sidebar no mobile
  };

  // Enviar mensagem
  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !ticketAtivo || enviando) return;

    try {
      setEnviando(true);
      
      // Salvar mensagem do usuário
      const { error: userMsgError } = await supabase
        .from('suporte_mensagens')
        .insert([{
          ticket_id: ticketAtivo.id,
          conteudo: novaMensagem,
          tipo: 'user'
        }]);
      
      if (userMsgError) throw userMsgError;

      // Buscar histórico para contexto
      const historicoConversa = mensagens.map(msg => ({
        tipo: msg.tipo,
        conteudo: msg.conteudo
      }));

      // Chamar API do Gemini diretamente
      const { response: aiResponse, metadata } = await sendMessageToGemini(
        novaMensagem, 
        historicoConversa
      );

      // Salvar resposta da IA
      const { error: aiMsgError } = await supabase
        .from('suporte_mensagens')
        .insert([{
          ticket_id: ticketAtivo.id,
          conteudo: aiResponse,
          tipo: 'assistant',
          modelo_usado: metadata.model,
          tokens_usados: metadata.tokensUsed,
          tempo_resposta_ms: metadata.responseTime
        }]);
      
      if (aiMsgError) throw aiMsgError;

      // Recarregar mensagens
      await fetchMensagens(ticketAtivo.id);
      setNovaMensagem('');
      
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      showNotification('Erro ao enviar mensagem: ' + err.message, 'error');
    } finally {
      setEnviando(false);
    }
  };

  // Filtrar tickets
  const ticketsFiltrados = tickets.filter(ticket => 
    activeFilter === 'Todos' || ticket.status === activeFilter
  );

  // Função para lidar com Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="px-4 lg:px-12 py-6 lg:py-10">
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

        {/* Header */}
        <div className="flex items-end justify-between mb-6 lg:mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Central de Ajuda</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">Suporte NexVision</h2>
          </div>
          <button 
            onClick={criarNovoTicket}
            className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-sm mr-1 align-middle">add</span>
            Novo Chamado
          </button>
        </div>

        {/* Layout Mobile-First */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 240px)' }}>
          {/* Sidebar - Lista de Tickets */}
          <div className={`
            ${sidebarOpen ? 'block' : 'hidden'} lg:block lg:col-span-1 
            bg-[#FDF8F3] lg:bg-surface-container-lowest rounded-2xl editorial-shadow flex flex-col overflow-hidden
            fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
          `}>
            {/* Header Mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-outline-variant/20">
              <h3 className="font-serif text-lg text-on-surface">Tickets</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm text-secondary">close</span>
              </button>
            </div>

            {/* Filtros */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {statusFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider whitespace-nowrap transition-all ${
                    activeFilter === f
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-secondary hover:bg-primary/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Lista de Tickets */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border-b border-outline-variant/10">
                    <div className="animate-pulse">
                      <div className="h-4 bg-surface-container rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-surface-container rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : ticketsFiltrados.length > 0 ? (
                ticketsFiltrados.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => selecionarTicket(ticket)}
                    className={`p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-primary/5 transition-all ${
                      ticketAtivo?.id === ticket.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-on-surface truncate">{ticket.titulo}</p>
                      <span className="text-[10px] text-outline">
                        {new Date(ticket.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-secondary truncate">
                      {ticket.total_mensagens} mensagens
                    </p>
                    <div className="mt-2">
                      <span className={`text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full font-medium ${
                        ticket.status === 'Pendente'
                          ? 'bg-amber-100 text-amber-700'
                          : ticket.status === 'Em Atendimento'
                          ? 'bg-primary/10 text-primary'
                          : ticket.status === 'Ativo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-tertiary/10 text-tertiary'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-60">
                  <span className="material-symbols-outlined text-4xl mb-4 text-outline">inbox</span>
                  <p className="text-sm text-secondary">A caixa está limpa. Nenhum chamado aberto.</p>
                </div>
              )}
            </div>
          </div>

          {/* Área Principal - Chat */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl editorial-shadow flex flex-col overflow-hidden relative">
            
            {/* Estado vazio quando nenhum ticket está selecionado */}
            {!ticketAtivo && (
              <div className="absolute inset-0 z-10 bg-surface-container-lowest flex flex-col items-center justify-center text-center opacity-70 p-8">
                <span className="material-symbols-outlined text-4xl mb-4 text-outline">forum</span>
                <p className="text-sm text-secondary mb-4">Selecione um chamado na lateral para ver o bate-papo.</p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold uppercase"
                >
                  Ver Tickets
                </button>
              </div>
            )}

            {/* Header do Chat */}
            {ticketAtivo && (
              <>
                <div className="p-4 lg:p-6 border-b border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm text-secondary">arrow_back</span>
                    </button>
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Suporte Inteligente NexVision</h3>
                      <p className="text-[10px] text-secondary mt-0.5">Ticket #{ticketAtivo.id.slice(-8)}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] tracking-wider uppercase px-3 py-1 rounded-full font-medium ${
                    ticketAtivo.status === 'Ativo'
                      ? 'bg-green-100 text-green-700'
                      : ticketAtivo.status === 'Pendente'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {ticketAtivo.status}
                  </span>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
                  {mensagens.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-2xl text-primary">smart_toy</span>
                      </div>
                      <p className="text-sm text-secondary mb-2">Olá! Sou sua assistente técnica da NexVision.</p>
                      <p className="text-xs text-outline">Como posso ajudá-la hoje?</p>
                    </div>
                  )}
                  
                  {mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.tipo === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 ${
                          msg.tipo === 'user'
                            ? 'bg-primary text-on-primary rounded-br-sm'
                            : 'bg-surface-container rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.conteudo}</p>
                        <p className={`text-[10px] mt-2 ${
                          msg.tipo === 'user' ? 'text-on-primary/60' : 'text-outline'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {enviando && (
                    <div className="flex justify-start">
                      <div className="bg-surface-container rounded-2xl rounded-bl-sm p-4">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <p className="text-sm text-secondary">Digitando...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 border-t border-outline-variant/20 pb-safe">
                  <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-2">
                    <input
                      type="text"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Escreva sua mensagem..."
                      disabled={enviando}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline focus:outline-none disabled:opacity-50"
                    />
                    <button 
                      onClick={enviarMensagem}
                      disabled={!novaMensagem.trim() || enviando}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enviando ? (
                        <div className="animate-spin w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full"></div>
                      ) : (
                        <span className="material-symbols-outlined text-on-primary text-sm">send</span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
