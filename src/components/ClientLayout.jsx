import { Outlet } from 'react-router-dom';
import ClientNavbar from './ClientNavbar';
import ClientFooter from './ClientFooter';
import MobileNav from './MobileNav';
import InstallPrompt from './InstallPrompt';

export default function ClientLayout() {
  return (
    <div className="client-page min-h-screen flex flex-col selection:bg-primary-container">
      <ClientNavbar />
      <Outlet />
      <ClientFooter />
      <MobileNav />
      <InstallPrompt />
    </div>
  );
}
