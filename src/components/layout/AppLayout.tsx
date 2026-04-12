import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProgressBar from './ProgressBar';
import AdminBar from './AdminBar';
import AIAdvisorPanel from '../ai-advisor/AIAdvisorPanel';
import { useAuth } from '../../lib/auth-context';
import { useSyncToSupabase } from '../../lib/use-sync-to-supabase';

const ADMIN_EMAIL = 'dlegrain@gmail.com';

export default function AppLayout() {
  const { participant } = useAuth();
  const isAdmin = participant?.email === ADMIN_EMAIL;

  // Auto-sync participant data to Supabase for plenary aggregation
  useSyncToSupabase();

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
