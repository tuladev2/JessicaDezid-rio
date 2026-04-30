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
      {/* Padding bottom para mobile nav: 120px (nav height + safe area) */}
      <div className="flex-1 w-full max-w-[500px] sm:max-w-none mx-auto pb-[120px] md:pb-0">
        <Outlet />
      </div>

      <ClientFooter />
      <MobileNav />
      <InstallPrompt />
    </div>
  );
}
