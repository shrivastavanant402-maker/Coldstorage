import React, { useState, useEffect } from 'react';
import { Globe, Layers, Navigation, Thermometer, ShieldCheck } from 'lucide-react';

export const GlobePlaceholder: React.FC = () => {
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  const routes = [
    { name: 'Western Corridor (Mumbai → Delhi)', color: '#3B82F6', dist: '1,420 km', temp: '3.4°C' },
    { name: 'Central Eco Spine (Bengaluru → Delhi)', color: '#10B981', dist: '2,140 km', temp: '2.8°C' },
    { name: 'Pharma Express (Chennai → Mumbai)', color: '#6366F1', dist: '1,340 km', temp: '4.1°C' },
  ];

  return (
    <div className="relative w-full h-[360px] bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-card border border-[#E5E7EB] overflow-hidden flex flex-col items-center justify-center text-white shadow-subtle select-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      {/* Center 3D Globe Animated Graphic */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-3 backdrop-blur-sm">
          <Globe className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: '30s' }} />
        </div>

        <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400 px-3 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800 mb-1.5">
          CesiumJS 3D Geospatial Corridor Engine
        </span>

        <h3 className="text-base font-semibold text-white tracking-tight mb-1">
          Cold-Chain Freight Corridors
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Visualizing active reefer vehicle telemetry, thermal heat layers, and waypoints across Indian logistics corridors.
        </p>

        {/* Live Route Selector Chips */}
        <div className="flex items-center gap-2 mb-4">
          {routes.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setActiveRouteIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                activeRouteIndex === idx
                  ? 'bg-white text-gray-900 border-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: r.color }} />
              {r.name.split(' (')[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300 bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-indigo-400" />
            {routes[activeRouteIndex].dist}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-teal-400" />
            {routes[activeRouteIndex].temp} (Safe)
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Telemetry OK
          </span>
        </div>
      </div>
    </div>
  );
};
