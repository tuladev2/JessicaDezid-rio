import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spaInterior } from '../data/mockData';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imagemLogin, setImagemLogin] = useState(null);

  // Carregar imagem de login personalizada da clínica
  useEffect(() => {
    supabase
      .from('configuracoes_clinica')
      .select('imagem_login_url, nome_clinica')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.imagem_login_url) setImagemLogin(data.imagem_login_url);
      })
      .catch(() => {}); // silencioso — usa fallback
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Editorial Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imagemLogin || spaInterior})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1c1c]/60 to-[#1a1c1c]/20" />
        </div>
        <div className="relative z-10 flex flex-col justify-end h-full p-16 text-white">
          <p className="text-sm tracking-[0.3em] uppercase opacity-70 mb-4">
            The Sanctuary
          </p>
          <h2 className="font-serif italic text-5xl leading-tight mb-6">
            Onde a ciência<br />encontra a arte.
          </h2>
          <p className="text-sm opacity-60 max-w-sm leading-relaxed">
            Cada detalhe foi pensado para proporcionar uma experiência de
            excelência e sofisticação.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-24">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-16">
            <h1 className="text-3xl font-serif italic text-[#1a1c1c] mb-2">
              Jessica Dezidério
            </h1>
            <p className="text-xs tracking-[0.25em] uppercase text-secondary">
              Estética Premium
            </p>
          </div>

          {/* Welcome */}
          <div className="mb-10">
            <h2 className="font-serif text-2xl text-on-surface mb-2">
              Bem-vinda de volta
            </h2>
            <p className="text-sm text-secondary">
              Acesse o painel restrito de gestão da sua clínica.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-secondary mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@estewtica.com.br"
                required
                className="w-full bg-transparent border-0 border-b border-outline-variant pb-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-0 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-secondary mb-3">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent border-0 border-b border-outline-variant pb-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-error text-xs font-medium bg-error-container p-3 rounded">{errorMsg}</p>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded-sm border-outline-variant text-primary focus:ring-primary/30 w-4 h-4"
                />
                Lembrar-me
              </label>
              <button type="button" className="text-primary hover:underline font-medium">
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-300 editorial-shadow ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}`}
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <p className="text-center text-xs text-outline mt-12">
            © 2024 Jessica Dezidério Estética Premium
          </p>
        </div>
      </div>
    </div>
  );
}
