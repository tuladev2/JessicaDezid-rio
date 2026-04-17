import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'dashboard',           label: 'Dashboard', path: '/admin',               end: true },
  { icon: 'spa',                 label: 'Serviços',  path: '/admin/servicos' },
  { icon: 'calendar_today',      label: 'Agenda',    path: '/admin/agendas' },
  { icon: 'favorite',            label: 'Clientes',  path: '/admin/clientes' },
  { icon: 'inventory_2',         label: 'Pacotes',   path: '/admin/pacotes' },
  { icon: 'confirmation_number', label: 'Suporte',   path: '/admin/suporte' },
  { icon: 'settings',            label: 'Config',    path: '/admin/configuracoes' },
];

export default function AdminBottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                 bg-[#faf9f8]/95 backdrop-blur-md
                 border-t border-[#4A3728]/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 min-w-[44px] flex flex-col items-center justify-center gap-1
               py-2 px-0.5 transition-all duration-200 active:scale-90 select-none
               ${isActive ? 'text-[#7b5455]' : 'text-[#705a49]/40'}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined leading-none transition-all duration-200"
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: isActive
                      ? '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 20'
                      : '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 20',
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[9px] font-medium leading-none whitespace-nowrap
                             overflow-hidden text-ellipsis max-w-[44px] text-center"
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
