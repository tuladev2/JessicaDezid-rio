import { NavLink } from 'react-router-dom';

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FDFCFB]/95 backdrop-blur-xl border-t border-[#4A3728]/10 shadow-lg z-[9999] safe-area-inset-bottom">
      <div className="flex justify-center items-center px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="bg-[#FDFCFB]/90 backdrop-blur-xl px-8 py-4 rounded-full border border-[#4A3728]/10 shadow-lg flex gap-10 items-center">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-[#4A3728]' : 'text-[#4A3728]/60 hover:text-[#4A3728] transition-colors'}>
            <span className="material-symbols-outlined">home</span>
          </NavLink>
          <NavLink to="/agendar" className={({ isActive }) => isActive ? 'text-[#4A3728]' : 'text-[#4A3728]/60 hover:text-[#4A3728] transition-colors'}>
            <span className="material-symbols-outlined" style={{'fontVariationSettings': '"FILL" 1'}}>calendar_today</span>
          </NavLink>
          <NavLink to="/tratamentos" className={({ isActive }) => isActive ? 'text-[#4A3728]' : 'text-[#4A3728]/60 hover:text-[#4A3728] transition-colors'}>
            <span className="material-symbols-outlined">spa</span>
          </NavLink>
          <a href="#" className="text-[#4A3728]/60 hover:text-[#4A3728] transition-colors">
            <span className="material-symbols-outlined">person</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
