import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
}
