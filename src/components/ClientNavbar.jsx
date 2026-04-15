import { NavLink, useLocation } from 'react-router-dom';

export default function ClientNavbar() {
  const location = useLocation();
  const isAgendamento = location.pathname.includes('/agendar');

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FDFCFB]">
      <nav className="flex flex-col items-center justify-center w-full py-8 px-12 max-w-screen-2xl mx-auto">
        <div className="w-full flex justify-between items-center mb-6">
          <NavLink to="/" className="font-serif text-2xl tracking-tighter text-[#4A3728]">
            <h1 className="text-2xl font-serif italic text-[#4A3728] font-headline cursor-text">
              Jessica Dezidério
            </h1>
          </NavLink>
          <div className="flex gap-6">
            <NavLink to="/agendar" className="scale-up transition-transform duration-300">
              <span className="material-symbols-outlined text-[#4A3728] cursor-pointer">calendar_today</span>
            </NavLink>
          </div>
        </div>
        <div className="hidden md:flex gap-12 items-center">
          <NavLink
            to="/tratamentos"
            className={({ isActive }) =>
              `font-sans tracking-widest text-[11px] uppercase transition-colors duration-500 ${
                isActive ? 'text-[#4A3728] border-b border-[#4A3728]/30 pb-1' : 'text-[#4A3728]/70 hover:text-[#4A3728]'
              }`
            }
          >
            Tratamentos
          </NavLink>
          <a className="text-[#4A3728]/70 font-sans tracking-widest text-[11px] uppercase hover:text-[#4A3728] transition-colors duration-500" href="#">
            O Espaço
          </a>
          <a className="text-[#4A3728]/70 font-sans tracking-widest text-[11px] uppercase hover:text-[#4A3728] transition-colors duration-500" href="#">
            Sobre
          </a>
          <NavLink
            to="/agendar"
            className={({ isActive }) =>
              `font-sans tracking-widest text-[11px] uppercase transition-colors duration-500 ${
                isActive || isAgendamento ? 'text-[#4A3728] border-b border-[#4A3728]/30 pb-1' : 'text-[#4A3728]/70 hover:text-[#4A3728]'
              }`
            }
          >
            Agendamento
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
