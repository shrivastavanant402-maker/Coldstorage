import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Package, PiggyBank, Truck, Globe } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Routes', path: '/routes', icon: Compass },
  { name: 'Shipments', path: '/shipments', icon: Package },
  { name: 'Savings', path: '/savings', icon: PiggyBank },
  { name: 'Driver View', path: '/driver', icon: Truck },
  { name: 'Lumio Showcase', path: '/', icon: Globe },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-[250px] bg-[#F0EFEB] border-r border-[#D9D7D0] min-h-screen flex flex-col justify-between select-none shrink-0 transition-all">
      <div>
        {/* Brand header */}
        <div className="h-18 flex items-center px-5 py-4 border-b border-[#D9D7D0] gap-3">
          <div className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-white shadow-sm shrink-0">
            <span className="font-bold text-sm leading-none font-display">L</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-[#1B1B1B] tracking-tight">
              Lumio ColdChain
            </h1>
            <p className="text-[10px] text-[#8C8880] uppercase tracking-wider font-semibold">
              Risk Intelligence
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#181818] text-white shadow-sm'
                      : 'text-[#615E58] hover:text-[#181818] hover:bg-[#E9E8E4]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Model Engine Footer Card */}
      <div className="p-3.5 m-3.5 rounded-2xl bg-[#FFFDF8] border border-[#D9D7D0] text-[11px] text-[#8C8880] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-xs text-[#1B1B1B]">Model Engine</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <p className="text-[10px] text-[#8C8880]">Random Forest v1.4 Active</p>
      </div>
    </aside>
  );
};
