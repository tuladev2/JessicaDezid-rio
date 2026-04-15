import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agendas from './pages/Agendas';
import Servicos from './pages/Servicos';
import Clientes from './pages/Clientes';
import Pacotes from './pages/Pacotes';
import Suporte from './pages/Suporte';
import Configuracoes from './pages/Configuracoes';

// Client Pages
import ClientLayout from './components/ClientLayout';
import Home from './pages/client/Home';
import Tratamentos from './pages/client/Tratamentos';
import AgendamentoServicos from './pages/client/AgendamentoServicos';
import AgendamentoHorario from './pages/client/AgendamentoHorario';
import AgendamentoDados from './pages/client/AgendamentoDados';
import AgendamentoConfirmado from './pages/client/AgendamentoConfirmado';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Client routes with client layout */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="tratamentos" element={<Tratamentos />} />
            <Route path="agendar" element={<AgendamentoServicos />} />
            <Route path="agendar/horario" element={<AgendamentoHorario />} />
            <Route path="agendar/dados" element={<AgendamentoDados />} />
            <Route path="agendar/confirmado" element={<AgendamentoConfirmado />} />
          </Route>

          {/* Login (no sidebar) */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="agendas" element={<Agendas />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="pacotes" element={<Pacotes />} />
              <Route path="suporte" element={<Suporte />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>

          {/* Default redirect to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
