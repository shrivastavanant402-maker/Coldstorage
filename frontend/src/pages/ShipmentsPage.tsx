import React, { useState } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { RiskBadge, FreshnessBadge } from '../components/RiskBadge';
import { Search, Filter, Thermometer, UserPlus, Zap, Sparkles } from 'lucide-react';
import { AssignDriverModal } from '../components/AssignDriverModal';
import { EmergencySalvageModal } from '../components/EmergencySalvageModal';

export const ShipmentsPage: React.FC = () => {
  const { shipments, openShipmentModal, openAssignModal, openEmergencyModal } =
    useColdChainStore();
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const filtered = shipments.filter((shp) => {
    const matchesSearch =
      shp.shipment_id.toLowerCase().includes(search.toLowerCase()) ||
      shp.origin.toLowerCase().includes(search.toLowerCase()) ||
      shp.destination.toLowerCase().includes(search.toLowerCase()) ||
      shp.goods_type.toLowerCase().includes(search.toLowerCase());

    const matchesRisk =
      filterRisk === 'ALL' || (shp.risk_level || 'Low').toUpperCase() === filterRisk;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Cargo Fleet Manifest</h3>
          <p className="text-xs text-gray-500">
            Real-time IoT telemetry, AI visual produce inspection, and automated mitigation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openEmergencyModal()}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Simulate High Risk Alarm
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shipment..."
              className="pl-8 pr-2.5 py-1 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-48"
            />
          </div>

          <div className="flex items-center gap-1 text-xs border border-[#E5E7EB] rounded-lg px-2 py-1">
            <Filter className="w-3 h-3 text-gray-400" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-gray-700 text-xs"
            >
              <option value="ALL">All Risks</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-card shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">Shipment ID</th>
                <th className="px-4 py-2.5">Origin / Destination</th>
                <th className="px-4 py-2.5">Cargo</th>
                <th className="px-4 py-2.5">Cargo Temp</th>
                <th className="px-4 py-2.5">Thermal Risk</th>
                <th className="px-4 py-2.5">AI Freshness (Pickup)</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
              {filtered.map((s) => (
                <tr key={s.shipment_id} className="hover:bg-gray-50 transition-colors">
                  <td onClick={() => openShipmentModal(s)} className="px-4 py-2.5 font-mono font-medium text-gray-900 cursor-pointer">
                    {s.shipment_id}
                  </td>
                  <td onClick={() => openShipmentModal(s)} className="px-4 py-2.5 cursor-pointer">
                    {s.origin} → {s.destination}
                  </td>
                  <td onClick={() => openShipmentModal(s)} className="px-4 py-2.5 font-medium cursor-pointer">
                    {s.goods_type}
                  </td>
                  <td onClick={() => openShipmentModal(s)} className="px-4 py-2.5 cursor-pointer">
                    <span className="flex items-center gap-1 font-mono">
                      <Thermometer className="w-3 h-3 text-[#0D9488]" />
                      {s.avg_temperature}°C
                    </span>
                  </td>
                  <td onClick={() => openShipmentModal(s)} className="px-4 py-2.5 cursor-pointer">
                    <RiskBadge level={s.risk_level} score={s.risk_score} />
                  </td>
                  <td onClick={() => openShipmentModal(s)} className="px-4 py-2.5 cursor-pointer">
                    <FreshnessBadge score={s.freshness_score} status={s.freshness_status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                      s.status === 'Salvaged' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      s.status === 'Assigned' ? 'bg-purple-50 text-purple-700' :
                      s.status === 'At Risk' ? 'bg-red-50 text-red-700 font-semibold' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!s.assigned_driver_id && s.status !== 'Delivered' && s.status !== 'Salvaged' ? (
                      <button
                        onClick={() => openAssignModal(s)}
                        className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-800 border border-[#E5E7EB] rounded text-[10px] font-medium inline-flex items-center gap-1 shadow-xs"
                      >
                        <UserPlus className="w-3 h-3 text-[#4F46E5]" /> Assign
                      </button>
                    ) : (s.risk_score || 0) > 70 ? (
                      <button
                        onClick={() => openEmergencyModal(s)}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-medium inline-flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Auto-Call
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400">Assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignDriverModal />
      <EmergencySalvageModal />
    </div>
  );
};

