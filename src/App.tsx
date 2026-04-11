import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import AppLayout from './components/layout/AppLayout';
import Module1Page from './components/modules/module1/Module1Page';
import Module2Page from './components/modules/module2/Module2Page';
import Module3Page from './components/modules/module3/Module3Page';
import Module4Page from './components/modules/module4/Module4Page';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/module1" replace />} />
            <Route path="/module1" element={<Module1Page />} />
            <Route path="/module2" element={<Module2Page />} />
            <Route path="/module3" element={<Module3Page />} />
            <Route path="/module4" element={<Module4Page />} />
            <Route path="/export" element={<div className="text-center py-20 text-gray-400">PDF Export — coming soon</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
