import { useState } from 'react';

export default function FichaCliente({ 
  cliente, 
  prontuario, 
  evolucoes, 
  onSalvarProntuario, 
  onNovaEvolucao 
}) {
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    allergies: prontuario?.allergies || '',
    skin_type: prontuario?.skin_type || '',
    medical_history: prontuario?.medical_history || '',
    current_treatments: prontuario?.current_treatments || '',
    observations: prontuario?.observations || ''
  });

  const handleSave = async () => {
    await onSalvarProntuario(formData);
    setEditando(false);
  };

  const handleCancel = () => {
    setFormData({
      allergies: prontuario?.allergies || '',
      skin_type: prontuario?.skin_type || '',
      medical_history: prontuario?.medical_history || '',
      current_treatments: prontuario?.current_treatments || '',
      observations: prontuario?.observations || ''
    });
    setEditando(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Prontuário Digital</p>
          <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">Ficha de Cuidados</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button 
            onClick={() => setEditando(!editando)}
            className={`px-6 py-3 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
              editando 
                ? 'bg-surface-container text-secondary hover:bg-surface-container-high' 
                : 'bg-primary text-on-primary hover:opacity-90 shadow-md'
            }`}
          >
            {editando ? 'Cancelar' : 'Editar Prontuário'}
          </button>
          {editando && (
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-tertiary text-on-tertiary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 shadow-md"
            >
              Salvar Alterações
            </button>
          )}
        </div>
      </div>

      {/* Perfil do Cliente */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-8 editorial-shadow">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
          <img
            alt={cliente.full_name}
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover grayscale-[20%] border-2 border-primary-container"
            src={cliente.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png'}
          />
          <div className="flex-1">
            <h3 className="font-serif text-xl lg:text-2xl text-on-surface mb-2">{cliente.full_name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 text-sm">
              <div>
                <p className="text-xs text-secondary mb-1">Idade</p>
                <p className="text-on-surface font-medium">
                  {cliente.birth_date 
                    ? `${new Date().getFullYear() - new Date(cliente.birth_date).getFullYear()} anos`
                    : 'Não informado'
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Telefone</p>
                <p className="text-on-surface font-medium">{cliente.phone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">E-mail</p>
                <p className="text-on-surface font-medium">{cliente.email || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Cliente desde</p>
                <p className="text-on-surface font-medium">
                  {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Clínicas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Alergias e Tipo de Pele */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
          <h4 className="font-serif text-lg text-on-surface mb-4 lg:mb-6">Informações Clínicas</h4>
          <div className="space-y-4 lg:space-y-6">
            <div>
              <label className="block text-xs tracking-widest uppercase text-secondary mb-2">Alergias Conhecidas</label>
              {editando ? (
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                  rows={3}
                  placeholder="Descreva alergias conhecidas..."
                />
              ) : (
                <p className="text-sm text-on-surface bg-surface-container/30 p-3 rounded-xl min-h-[80px]">
                  {formData.allergies || 'Nenhuma alergia conhecida'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-secondary mb-2">Tipo de Pele</label>
              {editando ? (
                <select
                  value={formData.skin_type}
                  onChange={(e) => setFormData({...formData, skin_type: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface"
                >
                  <option value="">Selecione o tipo de pele</option>
                  <option value="Oleosa">Oleosa</option>
                  <option value="Seca">Seca</option>
                  <option value="Mista">Mista</option>
                  <option value="Sensível">Sensível</option>
                  <option value="Normal">Normal</option>
                </select>
              ) : (
                <p className="text-sm text-on-surface bg-surface-container/30 p-3 rounded-xl">
                  {formData.skin_type || 'Não informado'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Histórico Médico */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
          <h4 className="font-serif text-lg text-on-surface mb-4 lg:mb-6">Histórico Médico</h4>
          <div className="space-y-4 lg:space-y-6">
            <div>
              <label className="block text-xs tracking-widest uppercase text-secondary mb-2">Histórico Médico</label>
              {editando ? (
                <textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                  className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                  rows={3}
                  placeholder="Histórico médico relevante..."
                />
              ) : (
                <p className="text-sm text-on-surface bg-surface-container/30 p-3 rounded-xl min-h-[80px]">
                  {formData.medical_history || 'Nenhum histórico médico informado'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tratamentos Atuais */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
        <h4 className="font-serif text-lg text-on-surface mb-4 lg:mb-6">Tratamentos e Observações</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs tracking-widest uppercase text-secondary mb-2">Tratamentos Atuais</label>
            {editando ? (
              <textarea
                value={formData.current_treatments}
                onChange={(e) => setFormData({...formData, current_treatments: e.target.value})}
                className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                rows={4}
                placeholder="Tratamentos em andamento..."
              />
            ) : (
              <p className="text-sm text-on-surface bg-surface-container/30 p-3 rounded-xl min-h-[100px]">
                {formData.current_treatments || 'Nenhum tratamento em andamento'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-secondary mb-2">Observações Gerais</label>
            {editando ? (
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                className="w-full p-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                rows={4}
                placeholder="Observações importantes..."
              />
            ) : (
              <p className="text-sm text-on-surface bg-surface-container/30 p-3 rounded-xl min-h-[100px]">
                {formData.observations || 'Nenhuma observação registrada'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Evoluções */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
          <h4 className="font-serif text-lg text-on-surface">Evoluções do Tratamento</h4>
          <button
            onClick={onNovaEvolucao}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nova Evolução
          </button>
        </div>
        
        {evolucoes.length > 0 ? (
          <div className="space-y-4">
            {evolucoes.map((evolucao, index) => (
              <div key={evolucao.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-primary rounded-full -ml-5"></span>
                  <p className="text-xs text-secondary">
                    {new Date(evolucao.created_at).toLocaleDateString('pt-BR')} às {new Date(evolucao.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {evolucao.treatment_type && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {evolucao.treatment_type}
                    </span>
                  )}
                </div>
                <p className="text-sm text-on-surface mb-2">{evolucao.notes}</p>
                {evolucao.observations && (
                  <p className="text-xs text-secondary italic">{evolucao.observations}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-primary">timeline</span>
            </div>
            <p className="text-sm text-secondary mb-4">Nenhuma evolução registrada ainda</p>
            <button
              onClick={onNovaEvolucao}
              className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all"
            >
              Registrar Primeira Evolução
            </button>
          </div>
        )}
      </div>
    </div>
  );
}