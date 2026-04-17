import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AdminBottomNav from './AdminBottomNav';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen pb-20 lg:pb-0">
        <TopBar />
        <Outlet />
      </main>
      <AdminBottomNav />
    </div>
  );
}
