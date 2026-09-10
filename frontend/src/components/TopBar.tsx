import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useColdChainStore } from '../store/useColdChainStore';
import { ShieldCheck, UserCheck } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Logistics & Risk Telemetry',
  '/dashboard': 'Logistics & Risk Telemetry',
  '/routes': '3D Corridor Intelligence',
  '/shipments': 'Active Reefers & Risk Manifest',
  '/savings': 'Carbon Offset & ESG Impact',
  '/driver': 'Driver Mobile Companion',
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, setUserRole } = useColdChainStore();
  const title = PAGE_TITLES[location.pathname] || 'Operational Console';

  const handleRoleSwitch = (role: 'owner' | 'driver') => {
    setUserRole(role);
    if (role === 'driver' && location.pathname !== '/driver') {
      navigate('/driver');
    } else if (role === 'owner' && location.pathname === '/driver') {
      navigate('/');
    }
  };

  return (
    <header className="h-16 border-b border-[#D9D7D0] bg-[#FAF9F5] px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-base font-bold text-[#1B1B1B] tracking-tight">{title}</h2>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E9E8E4] text-[#1B1B1B] font-semibold border border-[#D9D7D0] tracking-wider uppercase">
          Telemetry Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Switcher Capsule */}
        <div className="flex items-center bg-[#E9E8E4] p-1 rounded-full border border-[#D9D7D0]">
          <button
            onClick={() => handleRoleSwitch('owner')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all ${
              userRole === 'owner'
                ? 'bg-[#181818] text-white shadow-sm'
                : 'text-[#615E58] hover:text-[#181818]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            Fleet Owner
          </button>

          <button
            onClick={() => handleRoleSwitch('driver')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all ${
              userRole === 'driver'
                ? 'bg-[#181818] text-white shadow-sm'
                : 'text-[#615E58] hover:text-[#181818]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-white" />
            Driver View
          </button>
        </div>
      </div>
    </header>
  );
};
