import { clientProfile } from '../data/mockData';

export default function Clientes() {
  return (
    <div className="px-12 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Prontuário Digital</p>
          <h2 className="font-serif text-3xl text-on-surface">Cuidados com Cliente</h2>
        </div>
        <button className="px-6 py-3 border border-primary text-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-all duration-300">
          Editar Prontuário
        </button>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-surface-container-lowest rounded-2xl p-8 editorial-shadow flex flex-col items-center text-center">
          <img
            alt={clientProfile.name}
            src={clientProfile.avatar}
            className="w-28 h-28 rounded-full object-cover grayscale-[20%] mb-4 border-4 border-primary-container"
          />
          <h3 className="font-serif text-xl text-on-surface mb-1">{clientProfile.name}</h3>
          <span className="text-[10px] tracking-widest uppercase text-primary font-medium bg-primary/10 px-4 py-1 rounded-full mb-4">
            {clientProfile.tier}
          </span>
          <div className="w-full space-y-3 text-left mt-4 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">calendar_today</span>
              <span className="text-secondary">Última visita:</span>
              <span className="text-on-surface font-medium ml-auto">{clientProfile.lastVisit}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">loyalty</span>
              <span className="text-secondary">Desde:</span>
              <span className="text-on-surface font-medium ml-auto">{clientProfile.memberSince}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">cake</span>
              <span className="text-secondary">Aniversário:</span>
              <span className="text-on-surface font-medium ml-auto">{clientProfile.birthday}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-light text-primary">{clientProfile.sessions}</p>
              <p className="text-[10px] text-secondary mt-1">Sessões</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-light text-primary">{clientProfile.loyaltyPercent}%</p>
              <p className="text-[10px] text-secondary mt-1">Fidelidade</p>
            </div>
          </div>
        </div>

        {/* Anamnese + Preferences */}
        <div className="col-span-2 space-y-6">
          {/* Allergies & Preferences */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-error text-sm">warning</span>
                <p className="text-xs tracking-widest uppercase text-secondary font-semibold">Alergias & Sensibilidades</p>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">{clientProfile.allergies}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-sm">spa</span>
                <p className="text-xs tracking-widest uppercase text-secondary font-semibold">Preferências da Cliente</p>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">{clientProfile.preferences}</p>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-sm">edit_note</span>
              <p className="text-xs tracking-widest uppercase text-secondary font-semibold">Notas Clínicas</p>
            </div>
            <p className="text-sm text-on-surface leading-relaxed italic serif-italic">{clientProfile.notes}</p>
          </div>

          {/* Favorite Treatments */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
            <p className="text-xs tracking-widest uppercase text-secondary font-semibold mb-4">Tratamentos Favoritos</p>
            <div className="grid grid-cols-2 gap-4">
              {clientProfile.favoriteTreatments.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">{t.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{t.name}</p>
                    <p className="text-[10px] text-secondary">{t.sessions} sessões realizadas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
        <p className="text-xs tracking-widest uppercase text-secondary font-semibold mb-6">Histórico de Procedimentos</p>
        <div className="space-y-0">
          {clientProfile.history.map((item, i) => (
            <div key={i} className="flex gap-6 group">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${item.recent ? 'border-primary bg-primary/20' : 'border-outline-variant bg-surface-container'}`} />
                {i !== clientProfile.history.length - 1 && (
                  <div className="w-px flex-1 bg-outline-variant/30 my-1" />
                )}
              </div>
              {/* Content */}
              <div className="pb-6">
                <p className="text-[10px] text-outline mb-1">{item.date}</p>
                <p className="text-sm font-semibold text-on-surface">{item.procedure}</p>
                <p className="text-[10px] text-primary mb-1">{item.doctor}</p>
                <p className="text-xs text-secondary leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
