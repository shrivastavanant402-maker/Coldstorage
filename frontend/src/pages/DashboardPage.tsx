import React, { useEffect, useState } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { Package, AlertTriangle, ShieldCheck, Leaf, ArrowRight, Activity, Search, MapPin, Navigation, Loader2, Sparkles, Clock } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import Globe3D from '../components/globe/Globe3D';
import { RoutePathData } from '../components/globe/RouteLayer';
import { Link } from 'react-router-dom';
import { EmergencySalvageModal } from '../components/EmergencySalvageModal';

export const DashboardPage: React.FC = () => {
  const { shipments, fetchInitialData, openShipmentModal, routeOptions, findOptimalRoutes, isLoading } = useColdChainStore();

  const [origin, setOrigin] = useState('Mumbai, India');
  const [destination, setDestination] = useState('Delhi, India');
  const [goodsType, setGoodsType] = useState('Vaccines');
  const [vehicleType, setVehicleType] = useState('Refrigerated Semi-Trailer');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
    findOptimalRoutes(origin, destination, goodsType, vehicleType);
  }, [fetchInitialData]);

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    findOptimalRoutes(origin, destination, goodsType, vehicleType);
  };

  const handlePresetClick = (presetOrigin: string, presetDest: string) => {
    setOrigin(presetOrigin);
    setDestination(presetDest);
    findOptimalRoutes(presetOrigin, presetDest, goodsType, vehicleType);
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B'];
  const activeGlobeRoutes: RoutePathData[] = routeOptions.map((opt, i) => ({
    id: `dash-route-${i}`,
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
  }));

  const presets = [
    { label: 'Mumbai → Delhi', origin: 'Mumbai, India', destination: 'Delhi, India', dist: '1,415 km' },
    { label: 'Bengaluru → Chennai', origin: 'Bengaluru, India', destination: 'Chennai, India', dist: '346 km' },
    { label: 'Hyderabad → Delhi', origin: 'Hyderabad, India', destination: 'Delhi, India', dist: '1,570 km' },
    { label: 'Mumbai → Kolkata', origin: 'Mumbai, India', destination: 'Kolkata, India', dist: '1,950 km' },
    { label: 'Ahmedabad → Mumbai', origin: 'Ahmedabad, India', destination: 'Mumbai, India', dist: '524 km' },
  ];

  const activeShipments = shipments.filter((s) => s.status === 'In Transit');
  const highRiskCount = shipments.filter(
    (s) => s.risk_level === 'High' || s.risk_level === 'Critical'
  ).length;

  return (
    <>
      <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto bg-[#FAF9F5]">
      {/* Top Welcome & Mission Control Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D9D7D0] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9E8E4] border border-[#D9D7D0] text-[10px] font-semibold uppercase tracking-wider text-[#1B1B1B] mb-2">
            <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            Live Freight Telemetry Stream
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1B1B1B]">
            Fleet Operations & Thermal Risk
          </h1>
          <p className="text-sm text-[#8C8880] mt-1">
            Real-time thermal monitoring across perishable freight corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/shipments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181818] text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors shadow-sm"
          >
            <span>All Shipments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Lumio Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Active Shipments */}
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8C8880] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Reefers</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#D9D7D0] flex items-center justify-center">
              <Package className="w-4 h-4 text-[#181818]" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-[#1B1B1B]">
              {activeShipments.length}
            </div>
            <p className="text-xs text-[#8C8880] mt-1.5">Across active reefer corridors</p>
          </div>
        </div>

        {/* Metric 2: Thermal Risk Flagged */}
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8C8880] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Thermal Risk</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-rose-600">
              {highRiskCount}
            </div>
            <p className="text-xs text-[#8C8880] mt-1.5">Auto-Call mitigation armed</p>
          </div>
        </div>

        {/* Metric 3: Temp Compliance */}
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8C8880] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Temp Compliance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-emerald-700">
              98.4%
            </div>
            <p className="text-xs text-[#8C8880] mt-1.5">Within cold tolerance bands</p>
          </div>
        </div>

        {/* Metric 4: Carbon Offset */}
        <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8C8880] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Offset</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-[#1B1B1B]">
              14.2 t
            </div>
            <p className="text-xs text-[#8C8880] mt-1.5">Saved via Cold-Chain Eco Spines</p>
          </div>
        </div>
      </div>

      {/* 3D Geospatial Globe Section with Route Entering Search Bar in Lumio Container */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl md:rounded-[36px] p-6 shadow-sm overflow-hidden space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9D7D0]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="font-display text-base font-bold text-[#1B1B1B]">
                Geospatial Corridor Simulator & 3D Truck Chase
              </h3>
            </div>
            <p className="text-xs text-[#8C8880] mt-0.5">
              Enter any route to compute real OSRM road geometry with Cesium terrain height snapping and animated delivery truck.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] font-semibold text-[#8C8880] uppercase tracking-wider bg-[#E9E8E4] px-2.5 py-1 rounded-full border border-[#D9D7D0]">
              Cesium World Terrain
            </span>
            <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              OSRM Snapped
            </span>
          </div>
        </div>

        {/* Route Entering Search Bar */}
        <div className="bg-[#FAF9F5] border border-[#D9D7D0] rounded-2xl p-4 shadow-sm space-y-3">
          <form onSubmit={handleRouteSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Origin Input */}
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#615E58] mb-1">
                Origin Hub
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai, India"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9D7D0] rounded-xl text-xs font-medium text-[#1B1B1B] placeholder-[#8C8880] focus:outline-none focus:ring-2 focus:ring-[#181818]"
                />
              </div>
            </div>

            {/* Destination Input */}
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#615E58] mb-1">
                Destination Hub
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Delhi, India"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9D7D0] rounded-xl text-xs font-medium text-[#1B1B1B] placeholder-[#8C8880] focus:outline-none focus:ring-2 focus:ring-[#181818]"
                />
              </div>
            </div>

            {/* Cargo Type Select */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#615E58] mb-1">
                Cargo Profile
              </label>
              <select
                value={goodsType}
                onChange={(e) => setGoodsType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D9D7D0] rounded-xl text-xs font-medium text-[#1B1B1B] focus:outline-none focus:ring-2 focus:ring-[#181818]"
              >
                <option>Vaccines</option>
                <option>Fresh Produce</option>
                <option>Frozen Seafood</option>
                <option>Dairy Products</option>
                <option>Biopharmaceuticals</option>
                <option>Prime Cut Meat</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[38px] bg-[#181818] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Route</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Route Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D9D7D0]/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Presets:
            </span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset.origin, preset.destination)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                  origin === preset.origin && destination === preset.destination
                    ? 'bg-[#181818] text-white border-[#181818] shadow-xs'
                    : 'bg-white hover:bg-[#E9E8E4] text-[#615E58] border-[#D9D7D0]'
                }`}
              >
                <span>{preset.label}</span>
                <span className="text-[10px] opacity-70 ml-1">({preset.dist})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optimized Corridors Strip */}
        {routeOptions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {routeOptions.map((route, idx) => {
              const routeId = `dash-route-${idx}`;
              const isSelected = selectedRouteId === routeId;
              const simDurationSec = Math.round(
                Math.min(Math.max(route.distance_km / 8, 45), 120)
              );
              const cardBorder = isSelected
                ? 'border-[#181818] ring-2 ring-[#181818]/20 bg-white'
                : 'border-[#D9D7D0] bg-[#FAF9F5] hover:border-[#8C8880]';

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRouteId(isSelected ? null : routeId)}
                  className={`border rounded-2xl p-3 cursor-pointer transition-all ${cardBorder}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: idx === 0 ? '#EFF6FF' : idx === 1 ? '#ECFDF5' : '#FFFBEB',
                        color: idx === 0 ? '#1D4ED8' : idx === 1 ? '#047857' : '#B45309',
                      }}
                    >
                      {route.route_type}
                    </span>
                    <RiskBadge level={route.risk_level} score={route.risk_score} />
                  </div>
                  <div className="text-xs font-bold text-[#1B1B1B] truncate">{route.route_name}</div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#615E58]">
                    <span>{route.distance_km} km • {route.transit_hours}h</span>
                    <span className="font-semibold text-indigo-600">⚡ Sim: {simDurationSec}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3D Cesium Globe */}
        <div className="rounded-2xl overflow-hidden border border-[#D9D7D0]/70">
          <Globe3D
            routes={activeGlobeRoutes.length > 0 ? activeGlobeRoutes : undefined}
            selectedRouteId={selectedRouteId}
            onRouteSelected={(r) => setSelectedRouteId(r ? r.id : null)}
            height="480px"
          />
        </div>
      </div>

      {/* Monitored Freight Shipments Manifest Card */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl md:rounded-[36px] p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-[#D9D7D0]">
          <div>
            <h3 className="font-display text-lg font-bold text-[#1B1B1B]">
              Monitored Freight Shipments
            </h3>
            <p className="text-xs text-[#8C8880] mt-0.5">
              Live telemetry of active cold cargo and predicted risk indices
            </p>
          </div>
          <Link
            to="/shipments"
            className="text-xs font-semibold uppercase tracking-wider text-[#181818] hover:text-black flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Manifests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#D9D7D0]/60">
          {shipments.slice(0, 5).map((shp) => (
            <div
              key={shp.shipment_id}
              onClick={() => openShipmentModal(shp)}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0EFEB]/70 px-3 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#E9E8E4] border border-[#D9D7D0] flex items-center justify-center font-mono text-xs font-bold text-[#1B1B1B]">
                  {shp.shipment_id.replace('SHP-', '')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1B1B1B]">{shp.goods_type}</span>
                    <span className="text-xs text-[#8C8880]">•</span>
                    <span className="text-xs text-[#615E58] font-medium">
                      {shp.origin} → {shp.destination}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C8880] mt-0.5">
                    Cargo Temp: <strong className="text-[#1B1B1B]">{shp.avg_temperature}°C</strong> (±{shp.temp_variance}°C variance)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <RiskBadge level={shp.risk_level} score={shp.risk_score} />
                <span className="text-xs font-semibold text-[#8C8880] uppercase tracking-wider">
                  {shp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* Emergency Salvage Modal — mounted here so it can be triggered from ShipmentModal on the dashboard */}
    <EmergencySalvageModal />
    </>
  );
};
