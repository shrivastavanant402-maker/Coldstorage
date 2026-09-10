import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useColdChainStore } from '../store/useColdChainStore';
import { ShieldCheck, UserCheck } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Logistics Overview',
  '/routes': 'Route Intelligence & Optimization',
  '/shipments': 'Cargo Fleet & Risk Monitoring',
  '/savings': 'ESG & Financial Impact Metrics',
  '/driver': 'Driver Mobile Console',
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, setUserRole } = useColdChainStore();
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  const handleRoleSwitch = (role: 'owner' | 'driver') => {
    setUserRole(role);
    if (role === 'driver' && location.pathname !== '/driver') {
      navigate('/driver');
    } else if (role === 'owner' && location.pathname === '/driver') {
      navigate('/');
    }
  };

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
          Backend Online
        </span>
      </div>

      <div className="flex items-center bg-[#F9FAFB] p-1 rounded-lg border border-[#E5E7EB]">
        <button
          onClick={() => handleRoleSwitch('owner')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            userRole === 'owner'
              ? 'bg-white text-gray-900 shadow-subtle border border-[#E5E7EB]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
          Fleet Owner
        </button>

        <button
          onClick={() => handleRoleSwitch('driver')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            userRole === 'driver'
              ? 'bg-white text-gray-900 shadow-subtle border border-[#E5E7EB]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[#0D9488]" />
          Driver View
        </button>
      </div>
    </header>
  );
};
