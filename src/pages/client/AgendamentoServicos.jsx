import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Placeholder visual puro CSS — sem fotos externas
function ImagePlaceholder({ title }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#f0e9e5] to-[#e8ddd8]">
      <span
        className="material-symbols-outlined text-[#b8a99f]"
        style={{ fontSize: '3rem', fontVariationSettings: '"wght" 100' }}
      >
        spa
      </span>
      <p className="font-label text-[10px] tracking-[0.2em] uppercase text-[#b8a99f] text-center px-4">
        {title}
      </p>
    </div>
  );
}

export default function AgendamentoServicos() {
  const navigate = useNavigate();
  const [serviceCards, setServiceCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Scroll para o topo ao entrar na página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setFetchError(false);

        const { data, error } = await supabase
          .from('services')
          .select('id, name, description, image_url, price_single, price_package, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formatted = (data || []).map((item, index) => ({
          id: item.id,
          title: item.name,
          description: item.description || '',
          image_url: item.image_url || null,
          offset: index % 2 !== 0,
          price_single: item.price_single,
          price_package: item.price_package,
        }));

        setServiceCards(formatted);
      } catch (err) {
        console.error('[AgendamentoServicos] Erro ao buscar serviços:', err.message);
        setFetchError(true);
        setServiceCards([]);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const handleSelecionarServico = (servico) => {
    localStorage.removeItem('cliente_agendamento');
    localStorage.removeItem('pacote_selecionado');

    const servicoData = {
      id: servico.id,
      nome: servico.title,
      preco: servico.price_single || 0,
      tipo: 'servico_avulso',
      isMock: false
    };

    console.log('[Agendamento] Serviço selecionado:', servicoData);
    localStorage.setItem('servico_selecionado', JSON.stringify(servicoData));
    navigate('/agendar/dados?origem=servico');
  };

  return (
    <main className="pt-40 pb-24 px-6 md:px-12 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <section className="text-center mb-20">
        <span className="font-label tracking-[0.3em] text-[10px] uppercase text-[#4A3728] mb-4 block">
          Passo 01 — Seleção
        </span>
        <h1 className="font-headline italic text-4xl md:text-5xl lg:text-6xl text-[#4A3728] mb-6">
          Escolha o seu cuidado
        </h1>
        <div className="w-12 h-[1px] bg-[#d3c3ba]/30 mx-auto"></div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-32">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#4A3728]/40">refresh</span>
        </div>
      )}

      {/* Erro de conexão */}
      {!loading && fetchError && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-4xl text-[#d3c3ba] mb-4 block">wifi_off</span>
          <p className="font-body text-[#4A3728]/60 text-sm">
            Não foi possível carregar os serviços. Tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 font-label tracking-widest text-[10px] uppercase text-[#4A3728] border-b border-[#4A3728]/20 hover:border-[#4A3728] transition-all"
          >
            Recarregar
          </button>
        </div>
      )}

      {/* Estado vazio — nenhum serviço cadastrado */}
      {!loading && !fetchError && serviceCards.length === 0 && (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-full bg-[#faf2ee] flex items-center justify-center mx-auto mb-8">
            <span
              className="material-symbols-outlined text-[#c8b8b0]"
              style={{ fontSize: '2.5rem', fontVariationSettings: '"wght" 100' }}
            >
              spa
            </span>
          </div>
          <h2 className="font-headline italic text-2xl text-[#4A3728] mb-3">
            Em breve
          </h2>
          <p className="font-body text-sm text-[#4A3728]/60 max-w-sm mx-auto leading-relaxed">
            Nossos serviços estão sendo preparados com muito cuidado.
            Em breve você poderá escolher e agendar.
          </p>
        </div>
      )}

      {/* Grid de serviços */}
      {!loading && !fetchError && serviceCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 items-start">
          {serviceCards.map((card, i) => (
            <div
              key={card.id}
              onClick={() => handleSelecionarServico(card)}
              className={`group cursor-pointer ${card.offset ? 'md:mt-12' : ''}`}
            >
              {/* Imagem ou placeholder visual */}
              <div className="aspect-[4/5] overflow-hidden rounded-3 mb-6 bg-[#faf2ee] transition-transform duration-700 group-hover:scale-[1.02]">
                {card.image_url ? (
                  <img
                    alt={card.title}
                    className="w-full h-full object-cover"
                    src={card.image_url}
                    onError={(e) => {
                      // Se imagem quebrar, esconde e mostra placeholder via estado
                      e.target.style.display = 'none';
                      e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                    }}
                  />
                ) : (
                  <ImagePlaceholder title={card.title} />
                )}
              </div>

              <h3 className="font-headline italic text-2xl text-[#4A3728] mb-3">{card.title}</h3>

              {card.description && (
                <p className="font-body text-sm text-[#4f453e] leading-relaxed opacity-80 mb-6 min-h-[60px]">
                  {card.description}
                </p>
              )}

              {card.price_single > 0 && (
                <p className="font-body text-sm text-[#775841] mb-4">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.price_single)}
                </p>
              )}

              <span className="font-label tracking-widest text-[10px] uppercase text-[#4A3728] border-b border-[#4A3728]/20 group-hover:border-[#4A3728]/60 transition-all">
                Selecionar
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA Pacotes */}
      {!loading && (
        <div className="mt-32 text-center">
          <Link
            to="/tratamentos"
            className="group relative inline-block px-12 py-6 rounded-full border-2 border-dashed border-[#4A3728]/30 hover:border-[#4A3728] transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#4A3728]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative font-label tracking-[0.2em] text-[11px] uppercase text-[#4A3728] font-bold">
              Ver Todos os Pacotes de Sessões
            </span>
          </Link>
          <p className="mt-8 font-body text-[11px] text-[#4A3728] tracking-widest uppercase opacity-60">
            Resultados duradouros requerem constância.
          </p>
        </div>
      )}
    </main>
  );
}
