import { Outlet } from 'react-router-dom';
import ClientNavbar from './ClientNavbar';
import ClientFooter from './ClientFooter';
import MobileNav from './MobileNav';
import InstallPrompt from './InstallPrompt';

export default function ClientLayout() {
  return (
    <div className="client-page min-h-screen flex flex-col selection:bg-primary-container">
      <ClientNavbar />

      {/* Conteúdo principal — max 500px no mobile, sem limite no desktop */}
      <div className="flex-1 w-full max-w-[500px] sm:max-w-none mx-auto">
        <Outlet />
      </div>

      <ClientFooter />
      <MobileNav />
      <InstallPrompt />
    </div>
  );
}
