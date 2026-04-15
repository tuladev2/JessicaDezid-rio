import { packages, clinicInterior } from '../data/mockData';

export default function Pacotes() {
  return (
    <div className="px-12 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Gestão de Planos</p>
          <h2 className="font-serif text-3xl text-on-surface">Pacotes 6x</h2>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Form + Image */}
        <div className="col-span-2 space-y-6">
          {/* Quick Create Form */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-6">Cadastro Rápido</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Procedimento
                </label>
                <select className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface focus:border-primary focus:ring-0">
                  <option>Limpeza de Pele Profunda</option>
                  <option>Drenagem Linfática</option>
                  <option>Fototerapia LED Pro</option>
                  <option>Peeling Orgânico</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Cliente
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                    Valor Unitário
                  </label>
                  <input
                    type="text"
                    value="R$ 150,00"
                    readOnly
                    className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                    Desconto (6x)
                  </label>
                  <input
                    type="text"
                    value="15%"
                    readOnly
                    className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-primary font-semibold focus:ring-0"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs text-secondary">Valor Total (6 sessões)</span>
                <span className="text-lg font-serif text-primary">R$ 765,00</span>
              </div>

              <button className="w-full py-4 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 active:scale-[0.98]">
                Criar Pacote
              </button>
            </div>
          </div>

          {/* Clinic Image */}
          <div className="rounded-2xl overflow-hidden editorial-shadow">
            <img
              src={clinicInterior}
              alt="Interior da clínica"
              className="w-full h-48 object-cover grayscale-[30%]"
            />
          </div>
        </div>

        {/* Right: Active Packages Table */}
        <div className="col-span-3 bg-surface-container-lowest rounded-2xl editorial-shadow">
          <div className="p-6 border-b border-outline-variant/20">
            <h3 className="font-serif text-lg text-on-surface">Planos Ativos</h3>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="text-left py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Cliente</th>
                <th className="text-left py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Procedimento</th>
                <th className="text-center py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Sessões</th>
                <th className="text-left py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Valor</th>
                <th className="text-center py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {packages && packages.length > 0 ? (
                packages.map((pkg, i) => (
                  <tr key={i} className="border-b border-outline-variant/10 last:border-0 hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6 text-sm text-on-surface font-medium">{pkg.client}</td>
                    <td className="py-4 px-6 text-sm text-secondary">{pkg.procedure}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-on-surface font-medium">{pkg.sessions}</span>
                        <div className="w-16 h-1.5 bg-primary/10 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pkg.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface">{pkg.price}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] tracking-wider uppercase px-3 py-1 rounded-full font-medium ${
                        pkg.status === 'Concluído'
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center opacity-60">
                      <span className="material-symbols-outlined text-4xl mb-4 text-outline">inventory_2</span>
                      <p className="text-sm text-secondary">Ainda não há pacotes ou planos de longo prazo cadastrados na clínica.</p>
                      <button className="mt-4 px-6 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-primary/20 transition-colors">
                        Saber Mais
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
