import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const fallbackTreatments = [
  { area: 'Buço ou Queixo', avulso: 'R$ 80,00', pacote: 'R$ 390,00' },
  { area: 'Axilas', avulso: 'R$ 120,00', pacote: 'R$ 540,00' },
  { area: 'Virilha Completa', avulso: 'R$ 220,00', pacote: 'R$ 990,00' },
  { area: 'Meia Perna', avulso: 'R$ 280,00', pacote: 'R$ 1.250,00' },
  { area: 'Perna Inteira', avulso: 'R$ 450,00', pacote: 'R$ 1.980,00' },
  { area: 'Rosto Feminino', avulso: 'R$ 180,00', pacote: 'R$ 780,00' },
];

export default function Tratamentos() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTreatments() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('name, price_single, price_package')
          .eq('is_active', true)
          .order('price_single', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map(item => ({
            id: item.id || item.name,
            area: item.name,
            avulso: `R$ ${Number(item.price_single).toFixed(2).replace('.', ',')}`,
            pacote: item.price_package 
              ? `R$ ${Number(item.price_package).toFixed(2).replace('.', ',')}` 
              : 'Sob Consulta'
          }));
          setTreatments(formatted);
        } else {
          setTreatments(fallbackTreatments);
        }
      } catch (err) {
        console.warn('Using fallback data due to Supabase error in catalog:', err.message);
        setTreatments(fallbackTreatments);
      } finally {
        setLoading(false);
      }
    }

    fetchTreatments();
  }, []);

  return (
    <main className="pt-48 pb-20 px-6 max-w-screen-xl mx-auto">
      {/* Hero Section */}
      <header className="mb-24 flex flex-col items-center text-center">
        <span className="font-label text-[10px] tracking-[0.4em] uppercase text-[#775841] mb-6">Inovação em Estética</span>
        <h1 className="font-headline italic text-5xl md:text-7xl text-[#4A3728] mb-8 max-w-3xl leading-tight">Catálogo de Procedimentos</h1>
        <p className="font-body text-lg text-[#4A3728]/80 max-w-xl leading-relaxed">
          A tecnologia mais avançada do mercado para uma pele impecável. Menos sessões, maior conforto e resultados definitivos para todos os tipos de pele.
        </p>
      </header>

      {/* Main Content: Asymmetric Layout */}
      <div className="asymmetric-grid items-start mb-32">
        {/* Left: Editorial Image */}
        <div className="relative group overflow-hidden rounded-full aspect-[3/4] shadow-2xl">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Close up of smooth skin with soft morning light"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxKhSFEWxKJuIdaKdWpCdm5LGgZgQ5M6TDOBDmfrI8U-c-am7OGgldpym8PRXZZNJd4m7Kbo7A9UChyPIDdgnl-3Q4VRWH0COf_hveIPL31lMT-b5L-hvy3wOcAQE4QoS-r5keERoDM5Rb2lXQKCzuLCFH5MDJQcGUlmQ79jxKu-DYlfO2yEdPd3qwW7KkGr3vD4xgTvNHbcKmdbOykKK3DBacH1HFnOf_X0_3BXTvlgwFx5FCxcQsNGFzcy-k9ZuGbEA_YQzPK_w"
          />
          <div className="absolute inset-0 bg-[#775841]/10 mix-blend-multiply"></div>
        </div>

        {/* Right: The Table */}
        <div className="flex flex-col gap-12 relative">
          <div className="bg-[#F8F6F4] rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F8F6F4]/80 backdrop-blur-sm">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#4A3728]/50">refresh</span>
              </div>
            )}
            
            <h2 className="font-headline text-3xl mb-12 text-[#4A3728] border-b border-[#4A3728]/10 pb-4 italic">Tabela de Valores</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#4A3728]/10">
                    <th className="pb-6 font-label text-[10px] tracking-widest uppercase text-[#4A3728]/60">Área / Procedimento</th>
                    <th className="pb-6 px-4 font-label text-[10px] tracking-widest uppercase text-[#4A3728]/60">Valor Avulso</th>
                    <th className="pb-6 text-right font-label text-[10px] tracking-widest uppercase text-[#4A3728]">Pacote (6x)</th>
                  </tr>
                </thead>
                <tbody className="font-body text-[#4A3728]">
                  {treatments.map((row, i) => (
                    <tr key={row.id || i} className={`group ${i > 0 ? 'border-t border-[#4A3728]/10' : ''}`}>
                      <td className="py-8 font-medium">{row.area}</td>
                      <td className="py-8 px-4 opacity-70 italic">{row.avulso}</td>
                      <td className="py-8 text-right font-extrabold tracking-tight text-xl">{row.pacote}</td>
                    </tr>
                  ))}
                  
                  {!loading && treatments.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-12 text-center opacity-60 text-sm">
                        Catálogo em atualização.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-[#4A3728]/10">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#4A3728]">info</span>
                <p className="text-xs text-[#4A3728]/60 italic">Valores promocionais sujeitos à disponibilidade.</p>
              </div>
              <Link
                to="/agendar"
                className="bg-[#4A3728] text-[#FDFCFB] px-10 py-5 rounded-full font-label text-[10px] tracking-[0.2em] uppercase hover:scale-105 transition-transform duration-300 whitespace-nowrap"
              >
                Reservar Agora
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section (Bento Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
        <div className="bg-[#F8F6F4] p-10 rounded-[2rem] flex flex-col justify-between aspect-square md:aspect-auto h-[300px]">
          <span className="material-symbols-outlined text-4xl text-[#4A3728]">flare</span>
          <div>
            <h3 className="font-headline italic text-2xl mb-4 text-[#4A3728]">Conforto Térmico</h3>
            <p className="text-sm text-[#4A3728]/70 leading-relaxed">Ponteira resfriada que garante uma experiência praticamente indolor.</p>
          </div>
        </div>
        <div className="bg-[#4A3728] text-[#FDFCFB] p-10 rounded-[2rem] flex flex-col justify-between aspect-square md:aspect-auto h-[300px]">
          <span className="material-symbols-outlined text-4xl">timer</span>
          <div>
            <h3 className="font-headline italic text-2xl mb-4">Sessões Rápidas</h3>
            <p className="text-sm opacity-80 leading-relaxed">Tecnologia permite agilidade sem perder a eficácia.</p>
          </div>
        </div>
        <div className="bg-[#F8F6F4] p-10 rounded-[2rem] flex flex-col justify-between aspect-square md:aspect-auto h-[300px]">
          <span className="material-symbols-outlined text-4xl text-[#4A3728]">verified</span>
          <div>
            <h3 className="font-headline italic text-2xl mb-4 text-[#4A3728]">Para Todos</h3>
            <p className="text-sm text-[#4A3728]/70 leading-relaxed">Eficaz em todos os fototipos, inclusive peles negras e bronzeadas.</p>
          </div>
        </div>
      </section>

      {/* CTA Floating Image Section */}
      <section className="relative h-[500px] rounded-[3rem] overflow-hidden mb-20">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          alt="Luxury spa treatment room"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxqol0oqAXvQXNG3DFfG0FUbLArjm4MTvL9qKQc-DAJDZCPFziFa1-PTYBYxz23vWP3c1eSaWA2fwNxBICjKtEACGttNwMQQmqTnJu-Nt0pGZroA2_iWX5Etwgt5pyag5HDtt5ZT_oKSgRfeB_4zYOqGWVXJ8A9y4d3j7y8-KBmMpqQ1kSIxKR9mckR0hnipqZF_Of-y3_2cZtJ3AhMw-lpoTRwXUyDbiQUOcInZmF57IKFQ3TRWLjGkTrovZG_YtlSemw-Cn9fW0"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h2 className="font-headline italic text-4xl md:text-6xl text-white mb-8">Sua pele merece esse cuidado</h2>
          <Link
            to="/agendar"
            className="inline-block border border-white/50 text-white backdrop-blur-md px-12 py-6 rounded-full font-label text-[11px] tracking-[0.3em] uppercase hover:bg-white hover:text-[#4A3728] transition-all duration-500"
          >
            Agende sua avaliação gratuita
          </Link>
        </div>
      </section>
    </main>
  );
}
