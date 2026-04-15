import { NavLink } from 'react-router-dom';
import { sidebarNav } from '../data/mockData';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col py-12 px-8 w-72 bg-[#faf9f8] z-50">
      {/* Brand */}
      <div className="mb-12">
        <h1 className="text-2xl font-serif italic text-[#1a1c1c] font-headline">
          Jessica Dezidério
        </h1>
        <p className="font-label text-xs tracking-[0.2em] uppercase text-secondary mt-1 opacity-80">
          Estética Premium
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-y-6">
        {sidebarNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 pl-4 transition-all duration-300 group ${
                isActive
                  ? 'text-[#7b5455] font-semibold border-l-2 border-[#7b5455]'
                  : 'text-[#705a49] hover:text-[#7b5455]'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="text-sm tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* CTA Button */}
      <div className="mt-12 pt-8">
        <button className="w-full py-4 px-6 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 active:scale-[0.98]">
          Agendar Consulta
        </button>
      </div>
    </aside>
  );
}
