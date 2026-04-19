import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AdminBottomNav from './AdminBottomNav';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen pb-20 lg:pb-0 overflow-x-hidden">
        <TopBar />
        <div className="px-4 lg:px-0">
          <Outlet />
        </div>
      </main>
      <AdminBottomNav />
    </div>
  );
}
