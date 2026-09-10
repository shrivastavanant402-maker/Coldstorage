import React, { useEffect } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { Package, AlertTriangle, ShieldCheck, Leaf, ArrowRight } from 'lucide-react';
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
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Active Shipments</span>
            <Package className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeShipments.length}</div>
          <p className="text-xs text-gray-500 mt-0.5">Across active reefer corridors</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Thermal Risk Flagged</span>
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="text-2xl font-bold text-[#DC2626]">{highRiskCount}</div>
          <p className="text-xs text-gray-500 mt-0.5">Mitigation available via Auto-Call</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Temp Compliance</span>
            <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div className="text-2xl font-bold text-[#0D9488]">98.4%</div>
          <p className="text-xs text-gray-500 mt-0.5">Within cold tolerance bands</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Carbon Offset</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">14.2 t</div>
          <p className="text-xs text-gray-500 mt-0.5">Saved via Cold-Chain Eco Spines</p>
        </div>
      </div>

      {/* Interactive CesiumJS 3D Globe */}
      <Globe3D height="460px" />

      <div className="bg-white border border-[#E5E7EB] rounded-card p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Monitored Freight Shipments</h3>
            <p className="text-xs text-gray-500">Live telemetry of active cold cargo</p>
          </div>
          <Link
            to="/shipments"
            className="text-xs font-medium text-[#4F46E5] hover:text-indigo-700 flex items-center gap-1"
          >
            View all manifests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {shipments.slice(0, 5).map((shp) => (
            <div
              key={shp.shipment_id}
              onClick={() => openShipmentModal(shp)}
              className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-mono text-xs font-semibold text-gray-700">
                  {shp.shipment_id.replace('SHP-', '')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{shp.goods_type}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">
                      {shp.origin} → {shp.destination}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Cargo Temp: {shp.avg_temperature}°C (±{shp.temp_variance}°C)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RiskBadge level={shp.risk_level} score={shp.risk_score} />
                <span className="text-xs text-gray-400">{shp.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
