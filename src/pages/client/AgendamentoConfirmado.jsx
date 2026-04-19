import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AgendamentoConfirmado() {
  const [confirmado, setConfirmado] = useState(null);

  // Scroll para o topo ao entrar na página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const dados = sessionStorage.getItem('agendamento_confirmado');
    if (dados) {
      try {
        setConfirmado(JSON.parse(dados));
      } catch {
        // fallback com dados vazios
      }
    }
  }, []);

  const nomeCliente = confirmado?.cliente_nome || 'Cliente';
  const procedimento = confirmado?.procedimento || 'Procedimento Selecionado';

  const dataFormatada = confirmado?.data
    ? new Date(confirmado.data + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long'
      })
    : 'Data a confirmar';

  const horario = confirmado?.horario || '--:--';

  return (
    <main className="flex-grow flex items-center justify-center px-6 py-20 relative bg-background overflow-hidden min-h-[calc(100vh-200px)]">
      {/* Abstract Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#f2f0ee] opacity-30 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffd4b7]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <section className="max-w-2xl w-full text-center relative z-10">
        {/* Icon Anchor */}
        <div className="mb-12 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-[#ffffff] flex items-center justify-center quiet-shadow border border-[#d3c3ba]/10">
            <span className="material-symbols-outlined text-[#4A3728] text-5xl" style={{ fontVariationSettings: '"wght" 200' }}>
              check_circle
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-headline serif-italic tracking-tighter text-[#4A3728] leading-tight">
            Agendamento Confirmado!
          </h1>
          <p className="text-lg md:text-xl font-body text-[#4A3728]/80 leading-relaxed max-w-lg mx-auto font-light">
            Tudo pronto, <span className="font-semibold text-[#4A3728]">{nomeCliente}</span>! Estamos ansiosas para cuidar de você em nosso santuário de beleza.
          </p>
        </div>

        {/* Appointment Summary Card */}
        <div className="mt-16 bg-[#ffffff] rounded-3xl md:rounded-full p-6 md:p-2 md:pl-8 quiet-shadow border border-[#d3c3ba]/10 flex flex-col md:flex-row items-center justify-between gap-6 max-w-xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4 py-2 text-center md:text-left">
            <span className="material-symbols-outlined text-[#4A3728]/60">calendar_today</span>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#82756d] font-bold">Data & Horário</p>
              <p className="text-sm font-body font-semibold text-[#4A3728]">{dataFormatada} às {horario}</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#d3c3ba]/20"></div>
          <div className="w-full md:w-auto h-px md:h-8 bg-[#d3c3ba]/20 md:hidden"></div>
          <div className="flex flex-col md:flex-row items-center gap-4 py-2 text-center md:text-left">
            <span className="material-symbols-outlined text-[#4A3728]/60">spa</span>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#82756d] font-bold">Tratamento</p>
              <p className="text-sm font-body font-semibold text-[#4A3728]">{procedimento}</p>
            </div>
          </div>
          <button className="w-full md:w-auto bg-[#4A3728] text-[#FDFCFB] px-8 py-4 rounded-full text-[11px] tracking-widest uppercase font-bold hover:opacity-90 transition-all duration-500 shadow-lg shadow-[#4A3728]/10 whitespace-nowrap">
            Detalhes
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <a href="#" className="text-[11px] tracking-[0.2em] uppercase text-[#4A3728] font-bold border-b border-[#4A3728]/20 pb-1 hover:border-[#4A3728] transition-all">
            Adicionar ao Calendário
          </a>
          <p className="text-[10px] tracking-[0.1em] uppercase text-[#82756d]/60 mt-4">
            Um lembrete foi enviado para seu e-mail e WhatsApp.
          </p>
        </div>
      </section>

      {/* Aesthetic Imagery Block (Asymmetric) */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 w-48 aspect-[3/4] rounded-full overflow-hidden quiet-shadow opacity-90">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLbbWv9OgyVcc7Cn3z5MBAQ0Nj4bJXPvg8TGGU31xNuArwjwEIb9IZ9xJ-OdidEnMHsvgpr-fkoc-xj8ZJfWyUs59bDXIxMyS4MmZYeWBtYSukexsRuUB0TVzehbg6s67MzdHpfet8QiKbdwrQVZkIqUxfaLguy1VpQKF8d9Sxdv-QYqMJzNuctA1R3nauupdl93sEhBIQ9TKXjIVWg_NEI8Bp5rYclAQMWtaBkXkarrO6-iTxUxGgBrIEsyAyOtH81EEn59z55H4"
          alt="Luxury spa environment"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="hidden lg:block absolute right-12 bottom-12 w-64 aspect-square rounded-full overflow-hidden quiet-shadow opacity-70">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD90dUL49HHiFqhEtI5OWI1kxbC1xRIZJ6v1kfcoB6wN8D-MuclzpC6Jye5dODexkLQjPdoK3mA1wL0LUlPdiBryhRRbW01Xrs7ZG6so1hNIPeZk4JXbNEcduah1m-P46RlTla37Yom80E9UqxPtfgwLzxPtsqQafx8b-EMtaMFOYnyiuTbWA7ZD6loMNyv53RsjNWV1XJ-cpOnOnrOYoAHVC9P4THVNG-vVBUaCJ7OjmbOOQ0uYsQ4ktTZ0Cvr7MppEDidyg2GWnk"
          alt="Skincare products"
          className="w-full h-full object-cover"
        />
      </div>
    </main>
  );
}
