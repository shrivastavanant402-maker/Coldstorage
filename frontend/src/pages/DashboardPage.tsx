import React, { useEffect } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { Package, AlertTriangle, ShieldCheck, Leaf, ArrowRight, Activity } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import Globe3D from '../components/globe/Globe3D';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { shipments, fetchInitialData, openShipmentModal } = useColdChainStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const activeShipments = shipments.filter((s) => s.status === 'In Transit');
  const highRiskCount = shipments.filter(
    (s) => s.risk_level === 'High' || s.risk_level === 'Critical'
  ).length;

  return (
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

      {/* 3D Geospatial Globe Section in Lumio Container */}
      <div className="bg-[#FFFDF8] border border-[#D9D7D0] rounded-3xl md:rounded-[36px] p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="font-display text-base font-bold text-[#1B1B1B]">
              Geospatial Corridor Simulator
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#8C8880] uppercase tracking-wider">
            CesiumJS 3D Global Spine
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-[#D9D7D0]/70">
          <Globe3D height="460px" />
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
  );
};
