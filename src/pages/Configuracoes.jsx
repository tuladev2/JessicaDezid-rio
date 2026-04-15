import { useState } from 'react';

const weekDays = [
  { day: 'Segunda-feira', from: '09:00', to: '19:00', active: true },
  { day: 'Terça-feira', from: '09:00', to: '19:00', active: true },
  { day: 'Quarta-feira', from: '09:00', to: '19:00', active: true },
  { day: 'Quinta-feira', from: '09:00', to: '19:00', active: true },
  { day: 'Sexta-feira', from: '09:00', to: '18:00', active: true },
  { day: 'Sábado', from: '09:00', to: '14:00', active: true },
  { day: 'Domingo', from: '', to: '', active: false },
];

const blockedDates = [
  { date: '25 Dezembro, 2024', reason: 'Natal', type: 'Feriado' },
  { date: '31 Dezembro, 2024', reason: 'Réveillon', type: 'Feriado' },
  { date: '20 - 22 Nov, 2024', reason: 'Congresso de Estética', type: 'Evento' },
];

export default function Configuracoes() {
  const [schedule, setSchedule] = useState(weekDays);
  const [interval, setInterval_] = useState('30');
  const [advance, setAdvance] = useState('48');

  const toggleDay = (index) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, active: !d.active } : d))
    );
  };

  return (
    <div className="px-12 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Administração</p>
          <h2 className="font-serif text-3xl text-on-surface">Configurações de Agenda</h2>
        </div>
        <button className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300">
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Schedule */}
        <div className="col-span-3 space-y-6">
          {/* Weekly Schedule */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-6">Horário de Funcionamento</h3>

            <div className="space-y-4">
              {schedule.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    item.active ? 'bg-primary/5' : 'bg-surface-container-low opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4 w-40">
                    <button
                      onClick={() => toggleDay(i)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        item.active ? 'bg-primary' : 'bg-outline-variant'
                      }`}
                    >
                      <div
                        className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${
                          item.active ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <p className="text-sm text-on-surface font-medium">{item.day}</p>
                  </div>

                  {item.active ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        defaultValue={item.from}
                        className="bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 w-24"
                      />
                      <span className="text-xs text-secondary">até</span>
                      <input
                        type="time"
                        defaultValue={item.to}
                        className="bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 w-24"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-outline italic">Fechado</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Rules */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-6">Regras de Tempo</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Intervalo entre Sessões
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval_(e.target.value)}
                    className="w-20 bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 text-center"
                  />
                  <span className="text-xs text-secondary">minutos</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Antecedência Mínima
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={advance}
                    onChange={(e) => setAdvance(e.target.value)}
                    className="w-20 bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 text-center"
                  />
                  <span className="text-xs text-secondary">horas antes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Blocks & Info */}
        <div className="col-span-2 space-y-6">
          {/* Date Blocks */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg text-on-surface">Bloqueio de Datas</h3>
              <button className="text-primary text-xs font-medium hover:underline">+ Adicionar</button>
            </div>

            <div className="space-y-3">
              {blockedDates.map((block, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/10">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{block.reason}</p>
                    <p className="text-[10px] text-secondary mt-0.5">{block.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-error/10 text-error font-medium">
                      {block.type}
                    </span>
                    <button className="text-secondary hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-4">Resumo</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Dias ativos</span>
                <span className="text-on-surface font-medium">{schedule.filter((d) => d.active).length} dias</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Horas semanais</span>
                <span className="text-on-surface font-medium">~56h</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Bloqueios ativos</span>
                <span className="text-on-surface font-medium">{blockedDates.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Slots disponíveis/dia</span>
                <span className="text-on-surface font-medium">~20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
