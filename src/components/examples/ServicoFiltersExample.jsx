/**
 * Exemplo de uso do componente ServicoFilters
 * Demonstra integração com o hook useServicos
 */

import { useState } from 'react';
import ServicoFilters from '../ServicoFilters';
import { useServicos } from '../../hooks/useServicos';

export default function ServicoFiltersExample() {
  // Estado dos filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'all'
  });

  // Hook para gerenciar serviços com filtros aplicados
  const { servicos, loading, error } = useServicos(filters);

  // Handler para mudanças nos filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo: Filtros de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração do componente ServicoFilters integrado com o hook useServicos
        </p>
      </div>

      {/* Componente de Filtros */}
      <ServicoFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalCount={servicos.length}
        loading={loading}
      />

      {/* Exibição dos Resultados */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
        <h2 className="font-serif text-xl text-on-surface mb-4">
          Resultados da Busca
        </h2>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-sm">error</span>
              <span className="text-sm font-medium">Erro ao carregar serviços</span>
            </div>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 p-4 border border-outline-variant/20 rounded-xl">
                  <div className="w-16 h-16 bg-surface-container rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-surface-container rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-surface-container rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-surface-container rounded w-1/4"></div>
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

                {/* Preços */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-on-surface">
                    R$ {servico.price_single.toFixed(2).replace('.', ',')}
                  </p>
                  {servico.price_package && (
                    <p className="text-xs text-secondary">
                      Pacote: R$ {servico.price_package.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
              search_off
            </span>
            <h3 className="font-serif text-lg text-on-surface mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-secondary">
              {filters.search || filters.category || filters.status !== 'all'
                ? 'Tente ajustar os filtros para ver mais resultados.'
                : 'Nenhum serviço cadastrado no sistema.'}
            </p>
          </div>
        )}
      </div>

      {/* Debug Info (apenas para desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 bg-surface-container-low rounded-xl p-4">
          <h3 className="font-medium text-on-surface mb-2">Debug Info</h3>
          <div className="text-xs text-secondary space-y-1">
            <p><strong>Filtros Ativos:</strong> {JSON.stringify(filters, null, 2)}</p>
            <p><strong>Total de Serviços:</strong> {servicos.length}</p>
            <p><strong>Estado de Loading:</strong> {loading ? 'Carregando' : 'Carregado'}</p>
            <p><strong>Erro:</strong> {error || 'Nenhum'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo de uso básico (sem hook):
 */
export function BasicServicoFiltersExample() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'all'
  });

  const mockServicos = [
    {
      id: '1',
      name: 'Limpeza de Pele Profunda',
      category: 'Tratamentos Faciais',
      duration_minutes: 90,
      price_single: 280,
      is_active: true
    },
    {
      id: '2',
      name: 'Drenagem Linfática',
      category: 'Tratamentos Corporais',
      duration_minutes: 60,
      price_single: 150,
      is_active: true
    }
  ];

  // Simular filtragem local
  const filteredServicos = mockServicos.filter(servico => {
    const matchesSearch = !filters.search || 
      servico.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || 
      servico.category === filters.category;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && servico.is_active) ||
      (filters.status === 'inactive' && !servico.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-on-surface mb-2">
          Exemplo Básico: Filtros de Serviços
        </h1>
        <p className="text-secondary">
          Demonstração com dados mockados (sem integração com Supabase)
        </p>
      </div>

      <ServicoFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={filteredServicos.length}
        loading={false}
      />

      <div className="mt-6 bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="font-serif text-xl text-on-surface mb-4">
          Serviços Filtrados ({filteredServicos.length})
        </h2>
        
        {filteredServicos.length > 0 ? (
          <div className="space-y-3">
            {filteredServicos.map(servico => (
              <div key={servico.id} className="p-3 border border-outline-variant/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-on-surface">{servico.name}</h3>
                    <p className="text-sm text-secondary">{servico.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    R$ {servico.price_single.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary py-8">
            Nenhum serviço corresponde aos filtros aplicados.
          </p>
        )}
      </div>
    </div>
  );
}