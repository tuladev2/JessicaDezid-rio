import { useState } from 'react';
import { appointments, nextAppointment } from '../data/mockData';

const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const daysDatesShort = ['14', '15', '16', '17', '18', '19', '20'];
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function Agendas() {
  const [weekLabel] = useState('14 - 20 Outubro, 2024');

  return (
    <div className="px-12 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Controle de Agenda</p>
          <h2 className="font-serif text-3xl text-on-surface">Agenda Semanal</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined text-sm text-secondary">chevron_left</span>
          </button>
          <p className="text-sm text-on-surface font-medium">{weekLabel}</p>
          <button className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined text-sm text-secondary">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Calendar - 4 cols */}
        <div className="col-span-4 bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden">
          {/* Day Headers */}
          <div className="calendar-grid border-b border-outline-variant/20">
            <div className="py-4 px-3"></div>
            {days.map((day, i) => (
              <div key={day} className="py-4 px-3 text-center">
                <p className="text-[10px] tracking-widest uppercase text-secondary">{day.slice(0, 3)}</p>
                <p className={`text-lg font-light mt-1 ${i === 0 ? 'text-primary font-medium' : 'text-on-surface'}`}>
                  {daysDatesShort[i]}
                </p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="calendar-grid">
                <div className="time-slot flex items-start justify-end pr-3 pt-2">
                  <span className="text-[10px] text-outline">{hour}</span>
                </div>
                {days.map((_, di) => (
                  <div key={di} className="time-slot border-l border-outline-variant/10" />
                ))}
              </div>
            ))}

            {/* Appointment Cards */}
            {appointments.map((apt, i) => (
              <div
                key={i}
                className={`absolute rounded-xl p-3 bg-primary/5 border-l-2 ${apt.borderColor} hover:bg-primary/10 transition-colors cursor-pointer`}
                style={{
                  top: `${apt.top}px`,
                  left: `calc(80px + ${apt.day} * ((100% - 80px) / 7) + 4px)`,
                  width: `calc((100% - 80px) / 7 - 8px)`,
                  height: `${apt.height}px`,
                }}
              >
                <p className="text-[10px] text-primary font-semibold">{apt.name}</p>
                <p className="text-[9px] text-secondary mt-0.5">{apt.procedure}</p>
                <p className="text-[9px] text-outline mt-1">{apt.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Info Panel - 1 col */}
        <div className="col-span-1 space-y-6">
          {/* Capacity */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
            <p className="text-xs tracking-widest uppercase text-secondary mb-4">Capacidade</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">Sala 01</span>
                <span className="text-secondary">4/8</span>
              </div>
              <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '50%' }} />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-on-surface font-medium">Sala 02</span>
                <span className="text-secondary">7/8</span>
              </div>
              <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '87%' }} />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-on-surface font-medium">Sala 03</span>
                <span className="text-secondary">2/8</span>
              </div>
              <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>

          {/* Next Client */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow">
            <p className="text-xs tracking-widest uppercase text-secondary mb-4">Próximo Atendimento</p>
            <div className="flex items-center gap-3 mb-4">
              <img
                alt={nextAppointment.name}
                className="w-12 h-12 rounded-full object-cover grayscale-[20%]"
                src={nextAppointment.avatar}
              />
              <div>
                <p className="text-sm font-semibold text-on-surface">{nextAppointment.name}</p>
                <p className="text-[10px] text-secondary mt-0.5">{nextAppointment.procedure}</p>
              </div>
            </div>
            <button className="w-full py-3 border border-primary text-primary rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-primary hover:text-on-primary transition-all duration-300">
              Iniciar Atendimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
