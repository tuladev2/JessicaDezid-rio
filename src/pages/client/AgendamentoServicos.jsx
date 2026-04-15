import { Link } from 'react-router-dom';

const serviceCards = [
  {
    title: 'Depilação a Led',
    description: 'Tecnologia de ponta para uma remoção definitiva, indolor e extremamente segura para todos os tons de pele.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIWf7N7yUT-TgUMRCuV2jw8tkh-EfGuyJEXKCQW5yeWHN-8nGQOVGPmTVA_clFGJgYPflbLO8PV800iXDhTSqUrXjytYnMXoTM--g45uDRSvEuIfDZTbC1Wg-syyWxOD5k8oNWYOHHBKR06onSZH8Dfoxo5rBgIsxXDT26iFyfZxRsb9R6E2asASZDcGbsxdsqRjwLXOd_tv3t7eskBhgFDmgmUvlhJNnJH2VRit8wqqqOmlhrtuc9ZarCcHYfWYzOnKPcnR_3tTw',
    offset: false,
  },
  {
    title: 'Massagem Relaxante',
    description: 'Um ritual de desaceleração que utiliza óleos essenciais e toques precisos para restaurar o seu equilíbrio.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdeqIhoE6iW7MbC1dwrnH5kA-UWxYouFZyEHKjOPz-rRreGnWI2hc3-NuioGY0qv2FLqermYvUyTks8Tcbv8r1IuDl4wt5es4AbUdQ94L4snZla42tONS3KX-WcxfY1bzK6Dqm7vPJjs60uD4zUp34j6KpXrjfRitJCbJR_2e_chJm-35cENu9MubDl4_odYtO4IOAcG8SOWHqxg99piqk9YJlwm9wB5rLhqSnXLCvx50cG-KZ7J7jO7IJz36R1UpT_WQbiBt9JiE',
    offset: true,
  },
  {
    title: 'Limpeza de Pele',
    description: 'Renovação profunda com ativos de alta performance que devolvem o viço natural e a saúde da sua face.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSQ6ca2Ppwx9d-_pE3RGyTxykBfAWrInSYQEJw8dj5NebXS4RPNJo3TobxgBxk_BZfHvWMwEFjEGry2TKRl83v_REfnowat9ePUqKLsS0e1fohOAUOQUJa18R1OPc_Bo0MsUKKRYByhmlsFfIPG6KM6VPvTZ5YncFBzvklnFYCChAFfH-miVL9JQ_n7lm2uibkFEJtsd7MvlZLvPyNAh6yBXWixLla8i8-uMxQQ_I0Uq-gxrPjacqhQQPScaTGK-UZoXU5RV_wDgo',
    offset: false,
  },
];

export default function AgendamentoServicos() {
  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
      {/* Header Section */}
      <section className="text-center mb-20">
        <span className="font-label tracking-[0.3em] text-[10px] uppercase text-[#4A3728] mb-4 block">Passo 01 — Seleção</span>
        <h1 className="font-headline italic text-4xl md:text-5xl lg:text-6xl text-[#4A3728] mb-6">Escolha o seu cuidado</h1>
        <div className="w-12 h-[1px] bg-[#d3c3ba]/30 mx-auto"></div>
      </section>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 items-start">
        {serviceCards.map((card, i) => (
          <Link
            key={i}
            to="/agendar/horario"
            className={`group cursor-pointer ${card.offset ? 'md:mt-12' : ''}`}
          >
            <div className="aspect-[4/5] overflow-hidden rounded-3 mb-6 bg-[#faf2ee] transition-transform duration-700 group-hover:scale-[1.02]">
              <img
                alt={card.title}
                className="w-full h-full object-cover"
                src={card.image}
              />
            </div>
            <h3 className="font-headline italic text-2xl text-[#4A3728] mb-3">{card.title}</h3>
            <p className="font-body text-sm text-[#4f453e] leading-relaxed opacity-80 mb-6">
              {card.description}
            </p>
            <span className="font-label tracking-widest text-[10px] uppercase text-[#4A3728] border-b border-[#4A3728]/20 group-hover:border-[#4A3728]/60 transition-all">
              Selecionar
            </span>
          </Link>
        ))}
      </div>

      {/* Packages CTA */}
      <div className="mt-32 text-center">
        <Link
          to="/tratamentos"
          className="group relative inline-block px-12 py-6 rounded-full border-2 border-dashed border-[#4A3728]/30 hover:border-[#4A3728] transition-all duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#4A3728]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative font-label tracking-[0.2em] text-[11px] uppercase text-[#4A3728] font-bold">
            Ver Todos os Pacotes de 6 Sessões
          </span>
        </Link>
        <p className="mt-8 font-body text-[11px] text-[#4A3728] tracking-widest uppercase opacity-60">
          Resultados duradouros requerem constância.
        </p>
      </div>
    </main>
  );
}
