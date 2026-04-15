import { dashboardStats, nextClients, clinicInterior } from '../data/mockData';

export default function Dashboard() {
  return (
    <div className="px-12 py-10">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Painel de Controle</p>
          <h2 className="font-serif text-3xl text-on-surface">Visão Geral</h2>
        </div>
        <p className="text-xs text-outline font-body">
          Última atualização: <span className="text-on-surface">Hoje, 14:30</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">{stat.icon}</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-sm">arrow_outward</span>
            </div>
            <p className="text-3xl font-light text-on-surface mb-1 font-body">{stat.value}</p>
            <p className="text-xs text-secondary font-medium">{stat.label}</p>
            {stat.hasBar ? (
              <div className="mt-3 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: stat.barWidth }} />
              </div>
            ) : (
              <p className="text-[10px] text-outline mt-2">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Section: Two Columns */}
      <div className="grid grid-cols-5 gap-6 mt-2">
        {/* Left: Growth Chart */}
        <div className="col-span-3 bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-on-surface">Crescimento Semanal</h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                Agendamentos
              </span>
              <span className="flex items-center gap-1 text-[10px] text-secondary">
                <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span>
                Cancelados
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <svg viewBox="0 0 600 240" className="w-full">
            {/* Grid lines */}
            {[0, 60, 120, 180, 240].map((y) => (
              <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#e9e1dd" strokeWidth="0.5" />
            ))}

            {/* Main line */}
            <polyline
              points="0,200 100,170 200,130 300,90 400,120 500,70 600,40"
              fill="none"
              stroke="#775841"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Fill gradient */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#775841" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#775841" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points="0,200 100,170 200,130 300,90 400,120 500,70 600,40 600,240 0,240"
              fill="url(#chartGrad)"
            />

            {/* Secondary line */}
            <polyline
              points="0,220 100,210 200,200 300,190 400,200 500,195 600,185"
              fill="none"
              stroke="#48626c"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              strokeLinecap="round"
            />

            {/* Day labels */}
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => (
              <text
                key={d}
                x={i * 100}
                y={238}
                className="text-[10px] fill-outline"
                textAnchor="middle"
              >
                {d}
              </text>
            ))}
          </svg>
        </div>

        {/* Right: Next Clients */}
        <div className="col-span-2 bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-on-surface">Próximas Clientes</h3>
            <button className="text-xs text-primary font-medium hover:underline">Ver todas</button>
          </div>

          <div className="space-y-4">
            {nextClients.map((client, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-primary/5 ${
                  client.dimmed ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    alt={client.name}
                    className="w-10 h-10 rounded-full object-cover grayscale-[20%]"
                    src={client.avatar}
                  />
                  <div>
                    <p className="text-sm font-medium text-on-surface">{client.name}</p>
                    <p className="text-xs text-secondary">{client.procedure}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-xs text-outline">{client.time}</span>
                  {client.confirmed && (
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
