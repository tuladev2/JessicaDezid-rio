import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { services as mockServices } from '../data/mockData';

const categories = ['Todos', 'Facial', 'Corporal', 'LED'];

export default function Servicos() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          // Normalize DB data to local component shape
          const formatted = data.map(dbItem => ({
            id: dbItem.id,
            name: dbItem.name,
            category: dbItem.category,
            duration: `${dbItem.duration_minutes} min`,
            price: `R$ ${dbItem.price_single}`,
            active: dbItem.is_active,
            image: dbItem.image_url || mockServices[0].image, 
          }));
          setServices(formatted);
        } else {
          // Fallback to mockData if DB is totally empty (e.g., they haven't run the script)
            setServices(mockServices);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using fallback mock data:', err.message);
        setServices(mockServices);
        setErrorMsg('Mostrando dados locais (Banco de Dados não configurado/offline)');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const filtered = activeCategory === 'Todos'
    ? services
    : services.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="px-12 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Gestão de Portfólio</p>
          <h2 className="font-serif text-3xl text-on-surface">Serviços</h2>
        </div>
        <button className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300">
          <span className="material-symbols-outlined text-sm mr-1 align-middle">add</span>
          Novo Serviço
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-error-container text-error text-xs rounded border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          {errorMsg}
        </div>
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-medium tracking-wider transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-secondary hover:bg-primary/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Table */}
      <div className="bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
          </div>
        ) : null}

        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="text-left py-5 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Procedimento</th>
              <th className="text-left py-5 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Categoria</th>
              <th className="text-left py-5 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Duração</th>
              <th className="text-left py-5 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Valor</th>
              <th className="text-center py-5 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Status</th>
              <th className="text-right py-5 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((service, i) => (
              <tr
                key={service.id || i}
                className="border-b border-outline-variant/10 last:border-0 hover:bg-primary/5 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      alt={service.name}
                      className="w-12 h-12 rounded-lg object-cover grayscale-[20%]"
                      src={service.image}
                    />
                    <span className="text-sm font-medium text-on-surface">{service.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-[10px] tracking-wider uppercase px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {service.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-secondary">{service.duration}</td>
                <td className="py-4 px-6 text-sm text-on-surface font-medium">{service.price}</td>
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center">
                    <button
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        service.active ? 'bg-primary' : 'bg-outline-variant'
                      }`}
                    >
                      <div
                        className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${
                          service.active ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-secondary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
            
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="py-12 text-center text-secondary text-sm">
                  Nenhum serviço encontrado nesta categoria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
          <p className="text-3xl font-light text-on-surface mb-1">{services.length}</p>
          <p className="text-xs text-secondary">Serviços Listados</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
          <p className="text-3xl font-light text-on-surface mb-1">94%</p>
          <p className="text-xs text-secondary">Satisfação Média</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
          <p className="text-3xl font-light text-on-surface mb-1">R$ 190</p>
          <p className="text-xs text-secondary">Ticket Médio</p>
        </div>
      </div>
    </div>
  );
}
