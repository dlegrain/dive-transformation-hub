import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProgressBar from './ProgressBar';
import AdminBar from './AdminBar';
import AIAdvisorPanel from '../ai-advisor/AIAdvisorPanel';
import { useAuth } from '../../lib/auth-context';

const ADMIN_EMAIL = 'dlegrain@gmail.com';

export default function AppLayout() {
  const { participant } = useAuth();
  const isAdmin = participant?.email === ADMIN_EMAIL;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {isAdmin && <AdminBar />}
        <ProgressBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <AIAdvisorPanel />
    </div>
  );
}
