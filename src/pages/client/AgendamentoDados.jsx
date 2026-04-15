import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AgendamentoDados() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth: '',
    cpf: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Inserir ou recuperar o Cliente
      // Parse rough da data de nascimento DD/MM/AAAA para AAAA-MM-DD
      let birthDate = null;
      if (formData.birth && formData.birth.length === 10) {
        const [d, m, y] = formData.birth.split('/');
        birthDate = `${y}-${m}-${d}`;
      }

      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .insert([{
          full_name: formData.name || 'Cliente Sem Nome',
          phone: formData.phone || '',
          birth_date: birthDate,
          notes: `CPF Info: ${formData.cpf}`
        }])
        .select()
        .single();

      // Toleramos o erro se o schema não bater ou estiver sem chaves.
      if (clientErr) throw clientErr;

      // 2. Inserir um agendamento fictício pro futuro para este cliente recém criado
      const today = new Date();
      today.setDate(today.getDate() + 2); // daqui a 2 dias

      await supabase
        .from('appointments')
        .insert([{
          client_id: clientData.id,
          appointment_date: today.toISOString().split('T')[0],
          start_time: '14:30',
          status: 'scheduled'
        }]);

    } catch (err) {
      console.warn('Backend Supabase falhou ou não configurado. Navegando via MockFlow.', err.message);
    } finally {
      setLoading(false);
      navigate('/agendar/confirmado');
    }
  };

  return (
    <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
      {/* Navigation / Context */}
      <div className="mb-12 flex items-center gap-4 opacity-60">
        <span className="text-[10px] tracking-[0.2em] font-label uppercase">01 Procedimento</span>
        <span className="w-8 h-[1px] bg-[#d3c3ba]"></span>
        <span className="text-[10px] tracking-[0.2em] font-label uppercase">02 Horário</span>
        <span className="w-8 h-[1px] bg-[#4A3728]"></span>
        <span className="text-[10px] tracking-[0.2em] font-label uppercase text-[#4A3728] font-bold">03 Seus Dados</span>
      </div>

      {/* Section Title */}
      <div className="mb-16">
        <h2 className="serif-italic text-4xl md:text-5xl text-[#4A3728] mb-4 leading-tight">Finalize seu agendamento</h2>
        <p className="font-body text-[#4A3728]/80 text-lg max-w-lg leading-relaxed">
          Por favor, preencha os campos abaixo com suas informações pessoais para garantirmos o melhor atendimento.
        </p>
      </div>

      {/* Form Layout: Asymmetrical & Spaced */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-16">
        {/* Left Column: Primary Data */}
        <div className="md:col-span-7 flex flex-col gap-12">
          {/* NOME COMPLETO */}
          <div className="relative group">
            <label htmlFor="name" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">NOME COMPLETO</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Maria Oliveira Santos"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
          </div>

          {/* TELEFONE */}
          <div className="relative group">
            <label htmlFor="phone" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">TELEFONE</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
          </div>
        </div>

        {/* Right Column: Verification Data */}
        <div className="md:col-span-5 flex flex-col gap-12">
          {/* DATA DE NASCIMENTO */}
          <div className="relative group">
            <label htmlFor="birth" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">DATA DE NASCIMENTO</label>
            <input
              type="text"
              id="birth"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
              placeholder="DD/MM/AAAA"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
          </div>

          {/* CPF */}
          <div className="relative group">
            <label htmlFor="cpf" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
          </div>
        </div>

        {/* Summary & Footer Action */}
        <div className="md:col-span-12 mt-12 pt-12 border-t border-[#d3c3ba]/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTAQQhuOt1vpvIMbtWmUU9tyCzerHYFYIXq8cq0L_txvVfXXkb-H257DZ7TWsYCP69J8N7Y80S0KhHVo_AZzsHdTQf0I-pxfTK9EbUxXP2jUBlitkRr4QNJKi8WNfm8MK3Gndi1gymoKcYyHi_9lUtk41-QWKY8UwK1DigH5AT_4X1Qz82OZ4fqAfaWiWyy3_t4GoCV1vE3tSK9hjUFhClVwKEscEn6OcipvmJ3zvD0qBeRz6aCXPYyXYrx_jaoxOTepQeS_5KIZI"
                alt="Clinic Environment"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60">Resumo da sessão</p>
              <p className="serif-regular text-[#4A3728]">Limpeza de Pele Diamond • 14:30 • {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group relative px-12 py-5 bg-[#4A3728] text-[#FDFCFB] rounded-full overflow-hidden transition-all duration-500 flex items-center gap-4 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
            ) : (
              <>
                <span className="font-label text-[11px] tracking-[0.3em] uppercase font-bold">Confirmar Agendamento</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Terms & Privacy Quiet Note */}
      <p className="mt-12 text-center text-[10px] tracking-[0.1em] text-[#4A3728]/40 uppercase max-w-md mx-auto leading-loose">
        Ao confirmar, você concorda com nossas políticas de cancelamento e processamento de dados pessoais.
      </p>
    </main>
  );
}
