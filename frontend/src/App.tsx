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
import { LandingPage } from './pages/LandingPage';

const ConsoleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#FAF9F5] text-[#1B1B1B] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 bg-[#FAF9F5] overflow-y-auto">
          {children}
        </main>
      </div>
      <ShipmentModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Lumio Showcase Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Operational Console Routes */}
        <Route
          path="/dashboard"
          element={
            <ConsoleLayout>
              <DashboardPage />
            </ConsoleLayout>
          }
        />
        <Route
          path="/routes"
          element={
            <ConsoleLayout>
              <RoutesPage />
            </ConsoleLayout>
          }
        />
        <Route
          path="/shipments"
          element={
            <ConsoleLayout>
              <ShipmentsPage />
            </ConsoleLayout>
          }
        />
        <Route
          path="/savings"
          element={
            <ConsoleLayout>
              <SavingsPage />
            </ConsoleLayout>
          }
        />
        <Route
          path="/driver"
          element={
            <ConsoleLayout>
              <DriverPage />
            </ConsoleLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
