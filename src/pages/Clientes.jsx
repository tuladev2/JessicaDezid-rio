import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { clientProfile as mockClientProfile } from '../data/mockData';
import Modal from '../components/Modal';

export default function Clientes() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth: '',
    notes: ''
  });

  const fetchClient = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          id: data.id,
          name: data.full_name,
          phone: data.phone || '(00) 00000-0000',
          avatar: 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png',
          tier: 'Membro Ativo',
          lastVisit: 'Recente',
          memberSince: new Date(data.created_at).toLocaleDateString(),
          birthday: data.birth_date ? new Date(data.birth_date).toLocaleDateString() : 'Não informado',
          birthdayRaw: data.birth_date || '',
          sessions: '?',
          loyaltyPercent: 50,
          notes: data.notes || '',
          favoriteTreatments: [],
          history: [],
        });
      } else {
        setProfile({ ...mockClientProfile, id: null });
      }
    } catch (err) {
      console.warn('Usando mockData para Prontuário:', err.message);
      setProfile({ ...mockClientProfile, id: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  const handleEditClick = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone?.replace('Telefone: ', '') || '',
      birth: profile?.birthdayRaw || '',
      notes: profile?.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (profile.id) {
        // Atualiza real no supabase
        await supabase.from('clients').update({
          full_name: formData.name,
          phone: formData.phone,
          birth_date: formData.birth || null,
          notes: formData.notes
        }).eq('id', profile.id);
      } else {
        console.warn('Somente em modo leitura Mock, sem ID de Categoria.');
      }
      setIsModalOpen(false);
      fetchClient();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="px-12 py-10 flex items-center justify-center min-h-[500px]">
         <span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="px-12 py-10 relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Prontuário Digital</p>
          <h2 className="font-serif text-3xl text-on-surface">Cuidados com Cliente</h2>
        </div>
        <button 
          onClick={handleEditClick}
          className="px-6 py-3 border border-primary text-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-all duration-300"
        >
          Editar Prontuário
        </button>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-surface-container-lowest rounded-2xl p-8 editorial-shadow flex flex-col items-center text-center relative">
          <img
            alt={profile.name}
            src={profile.avatar}
            className="w-28 h-28 rounded-full object-cover grayscale-[20%] mb-4 border-4 border-primary-container"
          />
          <h3 className="font-serif text-xl text-on-surface mb-1 truncate w-full">{profile.name}</h3>
          <span className="text-[10px] tracking-widest uppercase text-primary font-medium bg-primary/10 px-4 py-1 rounded-full mb-4">
            {profile.tier}
          </span>
          <div className="w-full space-y-3 text-left mt-4 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">calendar_today</span>
              <span className="text-secondary">Última visita:</span>
              <span className="text-on-surface font-medium ml-auto">{profile.lastVisit}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">loyalty</span>
              <span className="text-secondary">Desde:</span>
              <span className="text-on-surface font-medium ml-auto">{profile.memberSince}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">cake</span>
              <span className="text-secondary">Aniversário:</span>
              <span className="text-on-surface font-medium ml-auto">{profile.birthday}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-light text-primary">{profile.sessions}</p>
              <p className="text-[10px] text-secondary mt-1">Sessões</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-light text-primary">{profile.loyaltyPercent}%</p>
              <p className="text-[10px] text-secondary mt-1">Fidelidade</p>
            </div>
          </div>
        </div>

        {/* Anamnese + Preferences */}
        <div className="col-span-2 space-y-6">
          {/* Clinical Notes */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">edit_note</span>
                <p className="text-xs tracking-widest uppercase text-secondary font-semibold">Notas Clínicas e Preferências</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 h-[calc(100%-40px)] border border-outline-variant/20">
              {profile.notes ? (
                <p className="text-sm text-on-surface leading-loose italic serif-italic whitespace-pre-wrap">{profile.notes}</p>
              ) : (
                <p className="text-sm text-secondary italic">Nenhuma nota clínica cadastrada para esta paciente. Clique em "Editar Prontuário" para adicionar o acompanhamento ou bioimpedância.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
        <p className="text-xs tracking-widest uppercase text-secondary font-semibold mb-6">Histórico de Procedimentos</p>
        <div className="space-y-0">
          {profile.history?.length > 0 ? (
            profile.history.map((item, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${item.recent ? 'border-primary bg-primary/20' : 'border-outline-variant bg-surface-container'}`} />
                  {i !== profile.history.length - 1 && (
                    <div className="w-px flex-1 bg-outline-variant/30 my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-[10px] text-outline mb-1">{item.date}</p>
                  <p className="text-sm font-semibold text-on-surface">{item.procedure}</p>
                  <p className="text-[10px] text-primary mb-1">{item.doctor}</p>
                  <p className="text-xs text-secondary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-secondary italic">Sem registros anteriores mapeados da tabela de appointments local.</p>
          )}
        </div>
      </div>

      {/* MODAL EDITAR PRONTUÁRIO */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Editar Ficha Clínica"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Nome */}
            <div className="relative group col-span-2 md:col-span-1">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">NOME DA PACIENTE</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all placeholder:text-outline-variant text-on-surface outline-none"
              />
            </div>
            
            {/* Telefone */}
            <div className="relative group col-span-2 md:col-span-1">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">CONTATO (WHATSAPP)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all placeholder:text-outline-variant text-on-surface outline-none"
              />
            </div>

            {/* Nascimento */}
            <div className="relative group col-span-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">DATA DE NASCIMENTO</label>
              <input
                type="date"
                value={formData.birth}
                onChange={(e) => setFormData({...formData, birth: e.target.value})}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/50 focus:ring-0 focus:border-primary py-2 transition-all placeholder:text-outline-variant text-on-surface outline-none"
              />
            </div>

            {/* Notas / Anamnese */}
            <div className="relative group col-span-2">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">NOTAS E ANAMNESE CLINICA</label>
              <textarea
                rows="5"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-xl p-4 transition-all placeholder:text-outline-variant text-on-surface outline-none resize-y"
                placeholder="Ex: Cliente tem sensibilidade à vitamina C. Preferência por massagem mais suave."
              />
            </div>
          </div>

          <div className="flex items-center justify-end mt-4 pt-6 border-t border-outline-variant/20 gap-4">
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
              {saving ? 'SALVANDO...' : 'SALVAR FICHA'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
