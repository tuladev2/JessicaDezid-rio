import { useState, useEffect, useCallback } from 'react';
import { CATEGORIAS_SERVICOS, debounce } from '../lib/servicosUtils';
import Input from './ui/Input';
import Select from './ui/Select';

/**
 * Componente de filtros e busca para serviços
 * Responsivo com debounced search e filtros combinados
 */
export default function ServicoFilters({ 
  filters, 
  onFiltersChange, 
  totalCount = 0, 
  loading = false 
}) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounced search para otimizar performance
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      onFiltersChange({ ...filters, search: searchTerm });
    }, 300),
    [filters, onFiltersChange]
  );

  // Effect para aplicar debounced search
  useEffect(() => {
    debouncedSearch(localSearch);
  }, [localSearch, debouncedSearch]);

  // Handlers para mudanças de filtro
  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleCategoryChange = (e) => {
    onFiltersChange({ ...filters, category: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFiltersChange({ ...filters, status: e.target.value });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onFiltersChange({ search: '', category: '', status: 'all' });
  };

  const handleClearSearch = () => {
    setLocalSearch('');
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = filters.search || filters.category || filters.status !== 'all';

  // Opções para o select de status
  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'active', label: 'Apenas ativos' },
    { value: 'inactive', label: 'Apenas inativos' }
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow mb-6">
      {/* Header com contador */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-lg text-on-surface mb-1">Filtros de Busca</h3>
          <p className="text-sm text-secondary">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                Carregando...
              </span>
            ) : (
              `${totalCount} ${totalCount === 1 ? 'serviço encontrado' : 'serviços encontrados'}`
            )}
          </p>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-sm">clear_all</span>
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Filtros - Layout Responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campo de Busca */}
        <Input
          id="search"
          label="Buscar por nome"
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="Digite o nome do serviço..."
          icon="search"
          rightIcon={localSearch ? "close" : null}
          onRightIconClick={handleClearSearch}
          containerClassName="lg:col-span-2"
        />

        {/* Filtro por Categoria */}
        <Select
          id="category"
          label="Categoria"
          value={filters.category}
          onChange={handleCategoryChange}
          options={CATEGORIAS_SERVICOS}
          placeholder="Todas as categorias"
        />

        {/* Filtro por Status */}
        <Select
          id="status"
          label="Status"
          value={filters.status}
          onChange={handleStatusChange}
          options={statusOptions}
        />
      </div>

      {/* Filtros Ativos - Tags */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-secondary font-medium">Filtros ativos:</span>
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                <span className="material-symbols-outlined text-xs">search</span>
                "{filters.search}"
                <button
                  onClick={() => {
                    setLocalSearch('');
                    onFiltersChange({ ...filters, search: '' });
                  }}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                <span className="material-symbols-outlined text-xs">category</span>
                {CATEGORIAS_SERVICOS.find(c => c.value === filters.category)?.label}
                <button
                  onClick={() => onFiltersChange({ ...filters, category: '' })}
                  className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-tertiary/10 text-tertiary text-xs rounded-full">
                <span className="material-symbols-outlined text-xs">
                  {filters.status === 'active' ? 'check_circle' : 'cancel'}
                </span>
                {filters.status === 'active' ? 'Ativos' : 'Inativos'}
                <button
                  onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                  className="ml-1 hover:bg-tertiary/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Estado Vazio - Nenhum resultado */}
      {!loading && totalCount === 0 && hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-outline-variant/20">
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">search_off</span>
            <h4 className="font-serif text-lg text-on-surface mb-2">Nenhum serviço encontrado</h4>
            <p className="text-sm text-secondary mb-4">
              Tente ajustar os filtros ou limpar a busca para ver mais resultados.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Limpar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}