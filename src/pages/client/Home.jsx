import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Busca a imagem da home no banco — com cache-buster para forçar reload
async function buscarImagemHome() {
  try {
    const { data } = await supabase
      .from('configuracoes_clinica')
      .select('imagem_home_url')
      .maybeSingle();
    return data?.imagem_home_url || null;
  } catch {
    return null;
  }
}

const IMAGEM_FALLBACK = '/Jessica.jpg.jpeg';

export default function Home() {
  const [imagemHome, setImagemHome] = useState(null);

  useEffect(() => {
    buscarImagemHome().then((url) => {
      if (url) {
        // Garante cache-buster mesmo que o banco já tenha um ?t= antigo
        const base = url.split('?')[0];
        setImagemHome(`${base}?t=${Date.now()}`);
      }
    });

    // Escuta evento disparado pelo Perfil após upload bem-sucedido
    const handleImagemAtualizada = (e) => {
      const novaUrl = e.detail?.url;
      if (novaUrl) {
        const base = novaUrl.split('?')[0];
        setImagemHome(`${base}?t=${Date.now()}`);
      }
    };
    window.addEventListener('imagem-home-atualizada', handleImagemAtualizada);
    return () => window.removeEventListener('imagem-home-atualizada', handleImagemAtualizada);
  }, []);

  return (
    <main className="pt-48 md:pt-64">
      {/* Hero Section */}
      <section className="min-h-[700px] flex flex-col md:flex-row items-center max-w-7xl mx-auto px-6 md:px-12 gap-12 md:gap-24 mb-24">
        {/* Left: Text */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left order-2 md:order-1">
          <h1 className="font-headline italic text-4xl md:text-6xl text-[#4A3728] leading-tight mb-8">
            Bem-vinda ao seu refúgio de beleza
          </h1>
          <p className="font-body text-lg text-[#4A3728] leading-relaxed mb-12 max-w-lg">
            Somos uma clínica de estética dedicada a realçar sua beleza natural com cuidado, qualidade e atenção aos detalhes. Um espaço pensado para o seu bem-estar.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-8 w-full">
            <Link
              to="/agendar"
              className="bg-[#775841] text-white font-label uppercase tracking-widest text-xs px-12 py-5 rounded-full hover:scale-[1.02] transition-transform duration-300"
            >
              Agendar sua consulta
            </Link>
            <div className="flex items-center gap-6">
              <a
                className="text-[#4A3728] hover:text-[#775841] transition-colors duration-300 flex items-center gap-2"
                href="https://www.instagram.com/dezideriojessica_estetica?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                <span className="font-label text-[10px] tracking-widest uppercase">Instagram</span>
              </a>
              <a className="text-[#4A3728] hover:text-[#775841] transition-colors duration-300 flex items-center gap-2" href="#">
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span className="font-label text-[10px] tracking-widest uppercase">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
        {/* Right: Image */}
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <div className="relative w-full aspect-[2/3] max-h-[800px] overflow-hidden rounded-3xl md:rounded-[4rem] shadow-2xl shadow-[#4A3728]/5 bg-[#FDFCFB]">
            <img
              alt="Jessica Dezidério"
              className="w-full h-full object-cover object-top"
              src={imagemHome || IMAGEM_FALLBACK}
              onError={(e) => {
                // Se a imagem do banco falhar, usa o fallback local
                if (e.target.src !== window.location.origin + IMAGEM_FALLBACK) {
                  e.target.src = IMAGEM_FALLBACK;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB]/10 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Frase de Impacto */}
      <section className="py-16 px-6 max-w-3xl mx-auto text-center">
        <p className="font-headline italic text-xl md:text-2xl text-[#775841] leading-relaxed tracking-wide">
          "Sua pele é o seu templo.<br className="hidden md:block" /> Cuide dela com quem entende de excelência."
        </p>
      </section>

      {/* Filosofia Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center border-t border-[#4A3728]/10">
        <span className="font-label text-[10px] tracking-[0.4em] uppercase text-[#4A3728] block mb-6">Filosofia JD</span>
        <p className="font-headline text-2xl md:text-3xl italic text-[#4A3728] leading-relaxed">
          "A verdadeira estética não transforma, ela revela o que há de mais sofisticado em você através do autocuidado."
        </p>
      </section>
    </main>
  );
}
