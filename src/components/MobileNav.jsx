import { NavLink } from 'react-router-dom';

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#FDFCFB]/80 backdrop-blur-xl px-8 py-4 rounded-full border border-[#4A3728]/10 shadow-lg flex gap-10 items-center z-50">
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
    </nav>
  );
}
