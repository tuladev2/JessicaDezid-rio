import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { adminUser } from '../data/mockData';

// Hook para buscar foto de perfil da clínica
function useFotoPerfil() {
  const [foto, setFoto] = useState(null);
  useEffect(() => {
    supabase
      .from('configuracoes_clinica')
      .select('foto_perfil_url, nome_clinica')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.foto_perfil_url) setFoto(data);
      });
  }, []);
  return foto;
}

// Hook para notificações de novos agendamentos
function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    // Buscar agendamentos recentes (últimas 24h) ao montar
    const buscarRecentes = async () => {
      const ontemISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('agendamentos')
        .select('id, data, horario_inicio, status, clients(full_name)')
        .gte('created_at', ontemISO)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const notifs = data.map(a => ({
          id: a.id,
          nome: a.clients?.full_name || 'Cliente',
          data: a.data,
          horario: a.horario_inicio?.slice(0, 5),
          lida: true, // já existentes marcadas como lidas
        }));
        setNotificacoes(notifs);
      }
    };

    buscarRecentes();

    // Escutar novos agendamentos em tempo real
    const channel = supabase
      .channel('novos-agendamentos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agendamentos' },
        async (payload) => {
          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('full_name')
            .eq('id', payload.new.cliente_id)
            .maybeSingle();

          const novaNotif = {
            id: payload.new.id,
            nome: cliente?.full_name || 'Cliente',
            data: payload.new.data,
            horario: payload.new.horario_inicio?.slice(0, 5),
            lida: false,
          };

          setNotificacoes(prev => [novaNotif, ...prev].slice(0, 10));
          setNaoLidas(prev => prev + 1);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const marcarTodasLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    setNaoLidas(0);
  };

  return { notificacoes, naoLidas, marcarTodasLidas };
}

export default function TopBar({ placeholder = 'Buscar clientes ou procedimentos...' }) {
  const { session } = useAuth();
  const perfilClinica = useFotoPerfil();
  const { notificacoes, naoLidas, marcarTodasLidas } = useNotificacoes();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Função de busca
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      // Buscar clientes
      const { data: clients } = await supabase
        .from('clients')
        .select('id, full_name, phone')
        .ilike('full_name', `%${query}%`)
        .limit(5);

      // Buscar serviços
      const { data: services } = await supabase
        .from('services')
        .select('id, name, category')
        .ilike('name', `%${query}%`)
        .limit(5);

      const results = [
        ...(clients || []).map(client => ({
          id: client.id,
          type: 'client',
          title: client.full_name,
          subtitle: client.phone,
          icon: 'person'
        })),
        ...(services || []).map(service => ({
          id: service.id,
          type: 'service',
          title: service.name,
          subtitle: service.category,
          icon: 'spa'
        }))
      ];

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handler para mudança na busca
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce da busca
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Handler para Enter na busca
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      handleSearch(searchQuery);
    }
  };

  // Handler para logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Handler para clicar em resultado da busca
  const handleSearchResultClick = (result) => {
    if (result.type === 'client') {
      // Navegar para página de clientes com filtro
      window.location.href = `/admin/clientes?search=${encodeURIComponent(result.title)}`;
    } else if (result.type === 'service') {
      // Navegar para página de serviços com filtro
      window.location.href = `/admin/servicos?search=${encodeURIComponent(result.title)}`;
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Handler para ações do perfil
  const handleProfileAction = (action) => {
    setProfileDropdownOpen(false);
    switch (action) {
      case 'perfil':
        window.location.href = '/admin/perfil';
        break;
      case 'configuracoes':
        window.location.href = '/admin/configuracoes';
        break;
      case 'sair':
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <header className="flex items-center h-14 lg:h-20 px-4 lg:px-12 sticky top-0 z-40 bg-[#faf9f8]/90 backdrop-blur-xl border-b border-[#4A3728]/5">

      {/* Busca — visível apenas tablet+ */}
      <div className="hidden sm:flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full flex-1 max-w-md lg:max-w-96 mr-4 lg:mr-0 relative" ref={searchRef}>
        <span className="material-symbols-outlined text-secondary text-base">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline focus:outline-none"
          placeholder={placeholder}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyPress}
        />
        {searchLoading && (
          <span className="material-symbols-outlined text-secondary text-sm animate-spin">sync</span>
        )}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg z-50 max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container/50 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-primary text-sm">{result.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-on-surface truncate">{result.title}</p>
                      <p className="text-xs text-secondary">{result.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-secondary text-sm">Nenhum resultado encontrado</div>
            )}
          </div>
        )}
      </div>

      {/* Ícone de busca — mobile only */}
      <button className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-container transition-colors">
        <span className="material-symbols-outlined text-secondary text-xl">search</span>
      </button>

      {/* Spacer mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Direita: notificações + perfil */}
      <div className="flex items-center gap-2 lg:gap-5">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              if (!notifDropdownOpen) marcarTodasLidas();
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-secondary text-xl">notifications</span>
            {naoLidas > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-primary rounded-full border border-[#faf9f8] flex items-center justify-center px-0.5">
                <span className="text-[8px] text-white font-bold leading-none">{naoLidas > 9 ? '9+' : naoLidas}</span>
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg z-50 overflow-hidden">
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-outline-variant/10 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-on-surface tracking-widest uppercase">Notificações</p>
                {naoLidas > 0 && (
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{naoLidas} nova{naoLidas > 1 ? 's' : ''}</span>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-56 overflow-y-auto divide-y divide-outline-variant/10">
                {notificacoes.length === 0 ? (
                  <div className="py-6 text-center">
                    <span className="material-symbols-outlined text-outline/40 text-2xl block mb-1">notifications_none</span>
                    <p className="text-[11px] text-secondary">Sem notificações</p>
                  </div>
                ) : (
                  notificacoes.map(notif => (
                    <div key={notif.id} className={`flex items-center gap-2.5 px-3 py-2.5 ${!notif.lida ? 'bg-primary/5' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.lida ? 'bg-primary/20' : 'bg-surface-container'}`}>
                        <span className="material-symbols-outlined text-primary" style={{fontSize:'13px'}}>calendar_month</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-on-surface truncate">{notif.nome}</p>
                        <p className="text-[10px] text-outline">{notif.data}{notif.horario ? ` · ${notif.horario}` : ''}</p>
                      </div>
                      {!notif.lida && <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <button
                onClick={() => { window.location.href = '/admin/agendas'; setNotifDropdownOpen(false); }}
                className="w-full py-2 text-[10px] text-primary tracking-widest uppercase font-medium hover:bg-primary/5 transition-colors border-t border-outline-variant/10"
              >
                Ver agenda
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-4 border-l border-outline-variant/20 pl-2 lg:pl-5 relative" ref={profileRef}>
          <div className="hidden lg:flex flex-col items-end">
            <p className="text-xs font-semibold text-on-surface leading-tight">
              {perfilClinica?.nome_clinica || 'Administrador'}
            </p>
            <p className="text-[10px] text-secondary leading-tight truncate max-w-[140px]">
              {session?.user?.email || 'Sem login'}
            </p>
          </div>

          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-1.5 hover:bg-surface-container/50 rounded-xl p-1 transition-colors active:scale-95"
          >
            <img
              alt="Perfil"
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border-2 border-primary/20"
              src={perfilClinica?.foto_perfil_url || adminUser.avatar}
            />
            <span className="material-symbols-outlined text-outline text-sm hidden lg:block">
              {profileDropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {profileDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-44 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg z-50">
              <div className="p-1.5">
                <button onClick={() => handleProfileAction('perfil')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container/50 transition-colors text-left">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                  <span className="text-sm text-on-surface">Meu Perfil</span>
                </button>
                <button onClick={() => handleProfileAction('configuracoes')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container/50 transition-colors text-left">
                  <span className="material-symbols-outlined text-primary text-sm">settings</span>
                  <span className="text-sm text-on-surface">Configurações</span>
                </button>
                <hr className="my-1 border-outline-variant/20" />
                <button onClick={() => handleProfileAction('sair')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left">
                  <span className="material-symbols-outlined text-red-500 text-sm">logout</span>
                  <span className="text-sm text-red-500">Sair</span>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sair"
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-error-container text-error transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}