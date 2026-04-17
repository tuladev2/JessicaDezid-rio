import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function ModalOverlay({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4A3728]/30 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FDFCFB] rounded-[2.5rem] p-12 max-w-xl w-full shadow-2xl shadow-[#4A3728]/10 border border-[#d3c3ba]/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#4A3728]/40 hover:text-[#4A3728] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ClientNavbar() {
  const location = useLocation();
  const isAgendamento = location.pathname.includes('/agendar');
  const [modal, setModal] = useState(null); // 'espaco' | 'sobre' | null

  return (
    <>
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
            <button
              onClick={() => setModal('espaco')}
              className="text-[#4A3728]/70 font-sans tracking-widest text-[11px] uppercase hover:text-[#4A3728] transition-colors duration-500"
            >
              O Espaço
            </button>
            <button
              onClick={() => setModal('sobre')}
              className="text-[#4A3728]/70 font-sans tracking-widest text-[11px] uppercase hover:text-[#4A3728] transition-colors duration-500"
            >
              Sobre
            </button>
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

      {/* Modal — O Espaço */}
      {modal === 'espaco' && (
        <ModalOverlay onClose={() => setModal(null)}>
          <span className="font-label text-[10px] tracking-[0.4em] uppercase text-[#775841] block mb-6">
            O Santuário
          </span>
          <h2 className="font-headline italic text-3xl text-[#4A3728] mb-8 leading-snug">
            Um ambiente projetado para o equilíbrio.
          </h2>
          <p className="font-body text-[#4A3728]/80 text-base leading-relaxed mb-6">
            O Santuário de Jessica Dezidério une tecnologia de ponta e conforto absoluto
            para que sua única preocupação seja relaxar. Cada detalhe — da iluminação
            suave às fragrâncias selecionadas — foi pensado para criar um espaço onde
            o tempo desacelera e o bem-estar é absoluto.
          </p>
          <p className="font-headline italic text-[#775841] text-lg">
            "Sua pele é o seu templo. Cuide dela com quem entende de excelência."
          </p>
        </ModalOverlay>
      )}

      {/* Modal — Sobre */}
      {modal === 'sobre' && (
        <ModalOverlay onClose={() => setModal(null)}>
          <span className="font-label text-[10px] tracking-[0.4em] uppercase text-[#775841] block mb-6">
            A Especialista
          </span>
          <h2 className="font-headline italic text-3xl text-[#4A3728] mb-8 leading-snug">
            Jessica Dezidério
          </h2>
          <p className="font-body text-[#4A3728]/80 text-base leading-relaxed mb-6">
            Jessica Dezidério é especialista em estética avançada, focada em realçar
            a beleza natural através de protocolos científicos e um olhar artístico único.
            Com anos de formação nas técnicas mais modernas do mercado, ela combina
            precisão clínica com sensibilidade estética para entregar resultados que
            respeitam e celebram a individualidade de cada cliente.
          </p>
          <p className="font-body text-[#4A3728]/80 text-base leading-relaxed">
            Cada atendimento é uma experiência personalizada — porque nenhuma pele
            é igual e nenhum cuidado deve ser genérico.
          </p>
        </ModalOverlay>
      )}
    </>
  );
}
