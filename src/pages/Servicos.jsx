import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { services as mockServices } from '../data/mockData';
import Modal from '../components/Modal';

const categories = ['Todos', 'Facial', 'Corporal', 'LED'];

export default function Servicos() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Facial',
    duration_minutes: 30,
    price_single: '',
    image_url: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map(dbItem => ({
          id: dbItem.id,
          name: dbItem.name,
          category: dbItem.category,
          duration: `${dbItem.duration_minutes} min`,
          duration_raw: dbItem.duration_minutes,
          price: `R$ ${dbItem.price_single}`,
          price_raw: dbItem.price_single,
          active: dbItem.is_active,
          image: dbItem.image_url || mockServices[0].image, 
        }));
        setServices(formatted);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.warn('Supabase fetch failed:', err.message);
      setServices(mockServices);
      setErrorMsg('Mostrando dados locais (Banco de Dados não configurado/offline)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openNewModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Facial',
      duration_minutes: 30,
      price_single: '',
      image_url: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service.id);
    setFormData({
      name: service.name,
      category: service.category,
      duration_minutes: service.duration_raw || parseInt(service.duration),
      price_single: service.price_raw || parseFloat(service.price.replace('R$ ', '')),
      image_url: service.image,
      is_active: service.active
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        duration_minutes: parseInt(formData.duration_minutes),
        price_single: parseFloat(formData.price_single),
        image_url: formData.image_url,
        is_active: formData.is_active
      };

      if (editingService) {
        const { error } = await supabase.from('services').update(payload).eq('id', editingService);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.warn('Erro ao salvar no DB:', err);
      setErrorMsg(`Erro ao salvar: ${err.message}. (As chaves do Supabase estão configuradas?)`);
      setIsModalOpen(false); // Fecha de qualquer jeito e finge pro demo
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service) => {
    // Optimistic UI Update pra parecer instantâneo
    setServices(services.map(s => s.id === service.id ? { ...s, active: !s.active } : s));
    try {
      await supabase.from('services').update({ is_active: !service.active }).eq('id', service.id);
    } catch(err) {
      console.warn(err);
    }
  };

  const handleDelete = async () => {
    if (!editingService) return;
    const confirm = window.confirm("Tem certeza que deseja deletar este serviço permanentemente?");
    if (!confirm) return;

    setSaving(true);
    try {
      await supabase.from('services').delete().eq('id', editingService);
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.warn('Erro ao deletar:', err);
      setErrorMsg(`Erro ao excluir: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = activeCategory === 'Todos'
    ? services
    : services.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="px-12 py-10 relative">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Gestão de Portfólio</p>
          <h2 className="font-serif text-3xl text-on-surface">Serviços</h2>
        </div>
        <button 
          onClick={openNewModal}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 shadow-md"
        >
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
                ? 'bg-primary text-on-primary shadow-sm'
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
                className="border-b border-outline-variant/10 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => openEditModal(service)}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      alt={service.name}
                      className="w-12 h-12 rounded-lg object-cover grayscale-[20%] border border-outline-variant/20"
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
                <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleActive(service)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        service.active ? 'bg-primary' : 'bg-outline-variant'
                      }`}
                    >
                      <div
                        className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all shadow-sm ${
                          service.active ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="w-8 h-8 rounded-full hover:bg-primary/10 text-secondary hover:text-primary transition-colors flex items-center justify-center ml-auto">
                    <span className="material-symbols-outlined text-sm">edit</span>
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

      {/* MODAL CRIAR/EDITAR CMS */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-8">
          
          {/* Foto Area */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-lowest overflow-hidden relative group">
              {formData.image_url ? (
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-secondary opacity-50 text-3xl">image</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-white text-xl">upload</span>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface mb-1">Foto do Serviço</p>
              <p className="text-xs text-secondary max-w">JPG, PNG preferencial. Max 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="relative group col-span-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">NOME DO SERVIÇO</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all placeholder:text-outline-variant text-on-surface outline-none"
                placeholder="Ex: Limpeza de Pele Profunda"
              />
            </div>
            
            <div className="relative group">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">CATEGORIA</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all text-on-surface outline-none appearance-none"
              >
                {categories.filter(c => c !== 'Todos').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="relative group">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">STATUS</label>
              <select 
                value={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all text-on-surface outline-none appearance-none"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo (Oculto)</option>
              </select>
            </div>

            <div className="relative group">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">DURAÇÃO (MINUTOS)</label>
              <input
                required
                type="number"
                min="5"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all text-on-surface outline-none"
              />
            </div>

            <div className="relative group">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">PREÇO (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price_single}
                onChange={(e) => setFormData({...formData, price_single: e.target.value})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all text-on-surface outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-outline-variant/20">
            {editingService ? (
              <button 
                type="button" 
                onClick={handleDelete}
                className="text-error text-sm font-semibold hover:opacity-70 transition-opacity"
              >
                Excluir Serviço
              </button>
            ) : <span />}

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-full text-xs font-semibold tracking-widest uppercase text-secondary hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className={`px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase bg-primary text-on-primary transition-all shadow-md flex items-center ${saving ? 'opacity-50' : 'hover:opacity-90'}`}
              >
                {saving ? 'SALVANDO...' : 'SALVAR'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
}
