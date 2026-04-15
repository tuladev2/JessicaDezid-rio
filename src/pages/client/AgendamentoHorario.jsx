import { useState } from 'react';
import { Link } from 'react-router-dom';

const calendarDays = [
  { num: 29, faded: true }, { num: 30, faded: true }, { num: 31, faded: true },
  { num: 1 }, { num: 2 }, { num: 3 }, { num: 4 },
  { num: 5 }, { num: 6 }, { num: 7 }, { num: 8 },
  { num: 9 }, { num: 10 }, { num: 11, selected: true },
  { num: 12 }, { num: 13 }, { num: 14 }, { num: 15 }, { num: 16 },
];

const timeSlots = ['09:00', '10:30', '11:00', '13:30', '14:00', '15:30', '16:00', '17:30', '18:00'];

export default function AgendamentoHorario() {
  const [selectedTime, setSelectedTime] = useState('11:00');

  return (
    <>
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto">
        {/* Header Title Section */}
        <section className="mb-16">
          <h1 className="font-headline text-5xl md:text-7xl text-[#4A3728] tracking-tight leading-tight max-w-3xl">
            Escolha o Momento Ideal
          </h1>
          <p className="font-body text-[#4A3728]/80 mt-6 text-lg max-w-xl">
            Sua jornada de renovação começa aqui. Selecione a data e o horário que melhor se adaptam ao seu ritmo.
          </p>
        </section>

        {/* Booking Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Calendar */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div className="bg-[#faf2ee] p-8 rounded-[3rem] w-full aspect-square flex flex-col luxury-shadow">
              <div className="flex justify-between items-center mb-8 w-full px-4">
                <span className="material-symbols-outlined text-[#4A3728] cursor-pointer">chevron_left</span>
                <h3 className="font-headline text-xl text-[#4A3728]">Janeiro 2024</h3>
                <span className="material-symbols-outlined text-[#4A3728] cursor-pointer">chevron_right</span>
              </div>
              <div className="grid grid-cols-7 gap-2 w-full flex-grow text-center">
                {/* Days of week */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                  <span key={d} className="text-[10px] uppercase tracking-widest text-[#4A3728]/60 font-label">{d}</span>
                ))}
                {/* Dates */}
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`py-3 text-sm ${
                      day.faded
                        ? 'opacity-20'
                        : day.selected
                          ? 'bg-[#775841] text-white rounded-full luxury-shadow font-semibold'
                          : 'hover:bg-[#efe6e3] rounded-full cursor-pointer transition-colors'
                    }`}
                  >
                    {day.num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Available Times */}
          <div className="lg:col-span-5">
            <h2 className="font-headline text-2xl mb-8 text-[#4A3728]">Horários Disponíveis</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-4 px-6 rounded-full font-label text-sm transition-all ${
                    selectedTime === time
                      ? 'bg-[#4A3728] text-white shadow-xl'
                      : 'border border-[#d3c3ba]/30 text-[#4A3728] hover:border-[#775841] hover:text-[#775841]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <div className="mt-12 p-8 bg-[#faf2ee] rounded-[2rem] border border-[#d3c3ba]/10">
              <div className="flex gap-4 items-center mb-4">
                <span className="material-symbols-outlined text-[#775841]">info</span>
                <p className="font-label text-sm text-[#4A3728]/60 uppercase tracking-widest">Informações Importantes</p>
              </div>
              <p className="font-body text-sm text-[#4f453e] leading-relaxed">
                Recomendamos chegar com 15 minutos de antecedência para desfrutar de nosso ritual de boas-vindas com chás orgânicos e aromaterapia.
              </p>
            </div>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="lg:col-span-3">
            <div className="sticky top-32 bg-white p-8 rounded-[2.5rem] luxury-shadow border border-[#e9e1dd]">
              <h3 className="font-headline text-xl mb-8 text-[#4A3728]">Resumo da Reserva</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Tratamento</span>
                  <span className="font-body text-[#4A3728] font-semibold text-lg">Massagem Aura Signature</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Data Escolhida</span>
                  <span className="font-body text-[#4A3728]">Quinta-feira, 11 de Janeiro</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Horário</span>
                  <span className="font-body text-[#4A3728]">{selectedTime} AM</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Duração</span>
                  <span className="font-body text-[#4A3728]">90 minutos</span>
                </div>
                <div className="pt-8 border-t border-[#d3c3ba]/20 flex justify-between items-center mb-8">
                  <span className="font-label text-sm uppercase tracking-widest text-[#4A3728]/60">Investimento</span>
                  <span className="font-headline text-[#4A3728] text-xl">R$ 480</span>
                </div>
                <Link
                  to="/agendar/dados"
                  className="block w-full bg-[#775841] text-white py-5 rounded-full font-label uppercase tracking-[0.15em] text-xs text-center hover:bg-[#5d412b] transition-colors luxury-shadow"
                >
                  Confirmar Agendamento
                </Link>
                <p className="text-center text-[10px] text-[#82756d] font-label uppercase tracking-widest mt-4">
                  Cancelamento gratuito até 24h antes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Aesthetic Section */}
      <section className="relative w-full h-[600px] overflow-hidden mt-20">
        <div className="organic-curve absolute inset-0 w-full h-full bg-[#efe6e3] overflow-hidden">
          <img
            alt="Spa interior"
            className="w-full h-full object-cover opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRp_qrg7f47tYhLqIH-OiAiaU_Ssbi6k9ZK_IU5KCq_auz3CoJp5icnchFaW-vTV3-bYkEvo_gisZqSiOpr0LxjvLxUUO3mcHSTZUzDy4LhkTym4R4NUe0jZ-YSsV3FFxorACDAFAh_QfXMvuP_2ZbYCChz9Z1yKUiLuF2doWN8E4Snov-bHUBNSCORzwvtkuFxXmBoTF8lgwHimQHMFrSzWSI0LRpCMNVFx4wEeqFklgdq6PxyXZNxW_uiDEWDysRMH0jNLEHO_s"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-transparent"></div>
        </div>
        <div className="absolute bottom-24 left-0 w-full text-center px-6">
          <h2 className="font-headline text-4xl text-[#4A3728] max-w-2xl mx-auto mb-4">Um refúgio para os seus sentidos.</h2>
          <p className="font-body text-[#4A3728]/60 uppercase tracking-[0.3em] text-xs">Exclusividade & Serenidade</p>
        </div>
      </section>
    </>
  );
}
