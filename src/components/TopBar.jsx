import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { adminUser } from '../data/mockData';

export default function TopBar({ placeholder = 'Buscar clientes ou procedimentos...' }) {
  const { session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
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
        window.location.href = '/admin/configuracoes';
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
    <header className="flex justify-between items-center h-16 lg:h-20 px-4 lg:px-12 sticky top-0 z-40 bg-[#faf9f8]/80 backdrop-blur-xl shadow-sm shadow-[#4A3728]/5">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span className="material-symbols-outlined text-secondary">
          {mobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Search - Hidden on small mobile, visible on tablet+ */}
      <div className="hidden sm:flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full flex-1 max-w-md lg:max-w-96 mx-4 lg:mx-0 relative" ref={searchRef}>
        <span className="material-symbols-outlined text-secondary text-lg">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline focus:outline-none"
          placeholder={placeholder}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
        {searchLoading && (
          <span className="material-symbols-outlined text-secondary text-sm animate-spin">
            sync
          </span>
        )}

        {/* Search Results Dropdown */}
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
                    <span className="material-symbols-outlined text-primary text-sm">
                      {result.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{result.title}</p>
                      <p className="text-xs text-secondary">{result.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-secondary text-sm">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        )}
      </div>

      {/* Brand - Mobile only */}
      <div className="lg:hidden flex-1 text-center">
        <h1 className="text-lg font-serif italic text-[#1a1c1c]">
          Jessica Dezidério
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Search Icon - Mobile only */}
        <button className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-secondary">search</span>
        </button>

        {/* Notifications */}
        <button className="relative hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-secondary">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 lg:gap-4 border-l border-outline-variant/30 pl-3 lg:pl-6 relative" ref={profileRef}>
          {/* User Info - Hidden on mobile */}
          <div className="hidden lg:block text-right">
            <p className="text-xs font-semibold text-on-surface">Administrador</p>
            <p className="text-[10px] text-secondary">{session?.user?.email || 'Sem login'}</p>
          </div>

          {/* Avatar - Clickable */}
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 hover:bg-surface-container/50 rounded-lg p-1 transition-colors"
          >
            <img
              alt="User Profile"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-primary-container grayscale-[30%]"
              src={adminUser.avatar}
            />
            <span className="material-symbols-outlined text-outline text-sm lg:block hidden">
              {profileDropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg z-50">
              <div className="p-2">
                <button
                  onClick={() => handleProfileAction('perfil')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container/50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                  <span className="text-sm text-on-surface">Meu Perfil</span>
                </button>
                <button
                  onClick={() => handleProfileAction('configuracoes')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container/50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-primary text-sm">settings</span>
                  <span className="text-sm text-on-surface">Configurações</span>
                </button>
                <hr className="my-2 border-outline-variant/20" />
                <button
                  onClick={() => handleProfileAction('sair')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-red-600 text-sm">logout</span>
                  <span className="text-sm text-red-600">Sair</span>
                </button>
              </div>
            </div>
          )}

          {/* Logout - Hidden on mobile, shown in dropdown */}
          <button
            onClick={handleLogout}
            title="Sair do sistema"
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-error-container text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#FDF8F3] z-50 opacity-100">
          <div className="p-4 h-full overflow-y-auto">
            {/* Mobile Search */}
            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-3 rounded-xl mb-6 relative" ref={searchRef}>
              <span className="material-symbols-outlined text-secondary text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline focus:outline-none"
                placeholder={placeholder}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyPress}
              />
              {searchLoading && (
                <span className="material-symbols-outlined text-secondary text-sm animate-spin">
                  sync
                </span>
              )}

              {/* Mobile Search Results */}
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
                          <span className="material-symbols-outlined text-primary text-sm">
                            {result.icon}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-on-surface leading-tight">{result.title}</p>
                            <p className="text-xs text-secondary leading-tight">{result.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-secondary text-sm">
                      Nenhum resultado encontrado
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {[
                { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
                { icon: 'spa', label: 'Serviços', path: '/admin/servicos' },
                { icon: 'calendar_today', label: 'Agendas', path: '/admin/agendas' },
                { icon: 'favorite', label: 'Clientes', path: '/admin/clientes' },
                { icon: 'inventory_2', label: 'Pacotes', path: '/admin/pacotes' },
                { icon: 'confirmation_number', label: 'Suporte', path: '/admin/suporte' },
                { icon: 'settings', label: 'Configurações', path: '/admin/configuracoes' },
              ].map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-surface-container transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-xl text-secondary">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-on-surface leading-tight">{item.label}</span>
                </a>
              ))}
            </nav>

            {/* Mobile User Actions */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-3 mb-4">
                <img
                  alt="User Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-container"
                  src={adminUser.avatar}
                />
                <div>
                  <p className="text-sm font-semibold text-on-surface leading-tight">Administrador</p>
                  <p className="text-xs text-secondary leading-tight">{session?.user?.email || 'Sem login'}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-error-container text-error transition-colors"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span className="text-sm font-medium leading-tight">Sair do Sistema</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}