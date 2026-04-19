import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function ProtectedRoute() {
  const { session, loading } = useAuth();

  // Aguardar verificação da sessão antes de redirecionar
  // Evita flash de redirect enquanto o Supabase confirma o token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f8]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#775841]/50">refresh</span>
          <p className="font-label text-[10px] tracking-[0.3em] uppercase text-[#4A3728]/40">
            Verificando acesso...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
