import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { AuthProvider, useAuth } from './lib/auth-context';
import AppLayout from './components/layout/AppLayout';
import WelcomePage from './components/onboarding/WelcomePage';
import Module1Page from './components/modules/module1/Module1Page';
import Module2Page from './components/modules/module2/Module2Page';
import Module3Page from './components/modules/module3/Module3Page';
import Module4Page from './components/modules/module4/Module4Page';
import ExportPage from './components/export/ExportPage';
import DocsPage from './components/docs/DocsPage';
import PlenaryDashboard from './components/plenary/PlenaryDashboard';

function ProtectedRoutes() {
  const { participant, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!participant) return <Navigate to="/welcome" replace />;

  return <AppLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Navigate to="/module1" replace />} />
              <Route path="/module1" element={<Module1Page />} />
              <Route path="/module2" element={<Module2Page />} />
              <Route path="/module3" element={<Module3Page />} />
              <Route path="/module4" element={<Module4Page />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/plenary" element={<PlenaryDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
