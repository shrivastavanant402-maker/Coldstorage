import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ShipmentModal } from './components/ShipmentModal';
import { DashboardPage } from './pages/DashboardPage';
import { RoutesPage } from './pages/RoutesPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { SavingsPage } from './pages/SavingsPage';
import { DriverPage } from './pages/DriverPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-white text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 bg-[#FFFFFF] overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/shipments" element={<ShipmentsPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/driver" element={<DriverPage />} />
            </Routes>
          </main>
        </div>
        <ShipmentModal />
      </div>
    </BrowserRouter>
  );
};

export default App;
