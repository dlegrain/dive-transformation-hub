import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProgressBar from './ProgressBar';
import AIAdvisorPanel from '../ai-advisor/AIAdvisorPanel';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <AIAdvisorPanel />
    </div>
  );
}
