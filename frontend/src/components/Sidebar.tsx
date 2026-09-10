import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Package, PiggyBank, Truck, Snowflake } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Routes', path: '/routes', icon: Compass },
  { name: 'Shipments', path: '/shipments', icon: Package },
  { name: 'Savings', path: '/savings', icon: PiggyBank },
  { name: 'Driver View', path: '/driver', icon: Truck },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-[240px] bg-[#F9FAFB] border-r border-[#E5E7EB] min-h-screen flex flex-col justify-between select-none shrink-0">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB] gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white shadow-sm">
            <Snowflake className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-gray-900 tracking-tight">ColdChain AI</h1>
            <p className="text-[10px] text-gray-500 font-medium">Risk Intelligence</p>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-[#4F46E5] border border-[#E5E7EB] shadow-subtle'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 m-3 rounded-card bg-white border border-[#E5E7EB] text-[11px] text-gray-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-700">Model Engine</span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#0D9488]" />
        </div>
        <p className="text-[10px] text-gray-400">Random Forest v1.4 Active</p>
      </div>
    </aside>
  );
};
