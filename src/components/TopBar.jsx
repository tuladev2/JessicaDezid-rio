import { adminUser } from '../data/mockData';

export default function TopBar({ placeholder = 'Buscar clientes ou procedimentos...' }) {
  return (
    <header className="flex justify-between items-center h-20 px-12 sticky top-0 z-40 bg-[#faf9f8]/80 backdrop-blur-xl shadow-sm shadow-[#4A3728]/5">
      {/* Search */}
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96">
        <span className="material-symbols-outlined text-secondary text-lg">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline focus:outline-none"
          placeholder={placeholder}
          type="text"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <button className="relative hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-secondary">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-6">
          <div className="text-right">
            <p className="text-xs font-semibold text-on-surface">{adminUser.name}</p>
            <p className="text-[10px] text-secondary">{adminUser.role}</p>
          </div>
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-primary-container grayscale-[30%]"
            src={adminUser.avatar}
          />
        </div>
      </div>
    </header>
  );
}
