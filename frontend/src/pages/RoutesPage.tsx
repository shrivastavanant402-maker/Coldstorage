import React, { useState } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { Search, Clock, Leaf, DollarSign, ShieldCheck, ArrowRight } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { Globe3D } from '../components/globe/Globe3D';
import { RoutePathData } from '../components/globe/RouteLayer';

export const RoutesPage: React.FC = () => {
  const { routeOptions, findOptimalRoutes, isLoading } = useColdChainStore();

  const [origin, setOrigin] = useState('Mumbai, India');
  const [destination, setDestination] = useState('Delhi, India');
  const [goodsType, setGoodsType] = useState('Vaccines');
  const [vehicleType, setVehicleType] = useState('Refrigerated Semi-Trailer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findOptimalRoutes(origin, destination, goodsType, vehicleType);
  };

  const globeRoutes: RoutePathData[] = routeOptions.map((opt, i) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B'];
    return {
      id: `route-opt-${i}`,
      name: opt.route_name,
      type: opt.route_type,
      color: colors[i % colors.length],
      coordinates: (opt.waypoints || []).map((wp, idx) => ({
        lon: typeof wp === 'object' ? wp.lng : 0,
        lat: typeof wp === 'object' ? wp.lat : 0,
        name: idx === 0 ? origin : idx === opt.waypoints.length - 1 ? destination : `WP-${idx}`,
      })),
      distanceKm: opt.distance_km,
      transitHours: opt.transit_hours,
      riskScore: opt.risk_score,
      riskLevel: (opt.risk_level as 'Low' | 'Medium' | 'High') || 'Medium',
      carbonKg: opt.carbon_kg,
    };
  });

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="bg-white border border-[#E5E7EB] rounded-card p-5 shadow-subtle">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">Cold-Chain Route Intelligence</h3>
          <p className="text-xs text-gray-500">
            Multi-objective optimization balancing thermal exposure, carbon output, and transit time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Origin Hub</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Destination Hub</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Cargo Type</label>
            <select
              value={goodsType}
              onChange={(e) => setGoodsType(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option>Vaccines</option>
              <option>Fresh Produce</option>
              <option>Frozen Seafood</option>
              <option>Dairy Products</option>
              <option>Biopharmaceuticals</option>
              <option>Prime Cut Meat</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4F46E5] hover:bg-indigo-700 text-white font-medium text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {isLoading ? 'Optimizing...' : 'Find Optimal Route'}
            </button>
          </div>
        </form>
      </div>

      {routeOptions.length > 0 && (
        <div className="space-y-4">
          <Globe3D routes={globeRoutes} height="400px" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {routeOptions.map((route, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E7EB] rounded-card p-5 shadow-subtle flex flex-col justify-between hover:border-[#4F46E5] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {route.route_type}
                    </span>
                    <RiskBadge level={route.risk_level} score={route.risk_score} />
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 mb-1">{route.route_name}</h4>
                  <p className="text-[11px] text-gray-500 mb-3">{route.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="p-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <span className="text-gray-400 block text-[10px]">Transit Duration</span>
                      <span className="font-semibold text-gray-900">{route.transit_hours} hrs ({route.distance_km} km)</span>
                    </div>
                    <div className="p-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <span className="text-gray-400 block text-[10px]">Carbon Emission</span>
                      <span className="font-semibold text-[#0D9488]">{route.carbon_kg} kg CO2</span>
                    </div>
                    <div className="p-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <span className="text-gray-400 block text-[10px]">Estimated Cost</span>
                      <span className="font-semibold text-gray-900">${route.cost_usd}</span>
                    </div>
                    <div className="p-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <span className="text-gray-400 block text-[10px]">Risk Score</span>
                      <span className="font-semibold text-[#4F46E5]">{route.risk_score} / 100</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 mb-3">
                    <span className="font-medium text-gray-700 block mb-1">Waypoints:</span>
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {route.waypoints.map((wp, wIdx) => {
                        const isStart = wIdx === 0;
                        const isEnd = wIdx === route.waypoints.length - 1;
                        const label = typeof wp === 'string'
                          ? wp
                          : isStart
                          ? `Start (${wp.lat.toFixed(2)}°, ${wp.lng.toFixed(2)}°)`
                          : isEnd
                          ? `End (${wp.lat.toFixed(2)}°, ${wp.lng.toFixed(2)}°)`
                          : `WP${wIdx} (${wp.lat.toFixed(2)}°, ${wp.lng.toFixed(2)}°)`;

                        return (
                          <React.Fragment key={wIdx}>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono text-[9px]">
                              {label}
                            </span>
                            {wIdx < route.waypoints.length - 1 && (
                              <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button className="w-full py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors">
                  Select Corridor
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
