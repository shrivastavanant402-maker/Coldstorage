import React from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { Truck, MapPin, Phone, AlertCircle, CheckCircle2, Play, Thermometer, Camera, Sparkles, Eye } from 'lucide-react';
import { RiskBadge, FreshnessBadge } from '../components/RiskBadge';
import { FreshnessModal } from '../components/FreshnessModal';

export const DriverPage: React.FC = () => {
  const {
    drivers,
    selectedDriverId,
    setSelectedDriverId,
    shipments,
    startDriverTrip,
    openFreshnessModal,
  } = useColdChainStore();

  const currentDriver = drivers.find((d) => d.driver_id === selectedDriverId) || drivers[0];
  const driverShipments = shipments.filter((s) => s.assigned_driver_id === currentDriver?.driver_id);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Driver Console</h3>
          <p className="text-xs text-gray-500">Select active driver identity to view assigned reefer runs</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-700">Driver Identity:</label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="px-2.5 py-1 text-xs border border-[#E5E7EB] rounded-lg bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            {drivers.map((d) => (
              <option key={d.driver_id} value={d.driver_id}>
                {d.name} ({d.driver_id}) — {d.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentDriver && (
        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px]">Assigned Rig</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
              <Truck className="w-3.5 h-3.5 text-[#4F46E5]" />
              {currentDriver.vehicle_type}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Current Terminal</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
              {currentDriver.current_location}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Hotline</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-gray-500" />
              {currentDriver.phone}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Status</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#0D9488] mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
              {currentDriver.status}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-card p-5 shadow-subtle">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">
          Assigned Freight Manifests
        </h4>

        {driverShipments.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No active freight assigned. Ready for dispatch assignment.
          </p>
        ) : (
          <div className="space-y-3">
            {driverShipments.map((shp) => (
              <div
                key={shp.shipment_id}
                className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900">{shp.shipment_id}</span>
                    <span className="text-gray-500 font-medium">({shp.goods_type})</span>
                    <RiskBadge level={shp.risk_level} score={shp.risk_score} />
                    {shp.freshness_status && (
                      <FreshnessBadge
                        score={shp.freshness_score}
                        status={shp.freshness_status}
                      />
                    )}
                  </div>
                  <p className="text-gray-600">
                    {shp.origin} → {shp.destination} • {shp.distance_km} km
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-gray-500 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-[#0D9488]" />
                      Reefer: {shp.avg_temperature}°C
                    </span>
                    <span>ETA: {shp.transit_hours} hrs</span>
                    {shp.freshness_identified_produce && (
                      <span className="text-indigo-600 font-semibold">
                        Produce: {shp.freshness_identified_produce}
                      </span>
                    )}
                  </div>

                  {/* Freshness summary preview */}
                  {shp.freshness_summary && (
                    <p className="text-[11px] text-gray-600 italic bg-white p-2 rounded-lg border border-gray-200 mt-1 max-w-xl">
                      "{shp.freshness_summary}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  {/* Photo Capture / Freshness Check Action */}
                  <button
                    type="button"
                    onClick={() => openFreshnessModal(shp)}
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{shp.freshness_status === 'completed' ? 'Re-inspect Produce' : 'AI Freshness Check'}</span>
                  </button>

                  {/* Start Trip Action */}
                  {shp.status !== 'In Transit' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!shp.freshness_status) {
                          // Prompt freshness check first on starting shipment
                          openFreshnessModal(shp);
                        } else {
                          startDriverTrip(shp.shipment_id);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Trip</span>
                    </button>
                  )}

                  {shp.status === 'In Transit' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Transit
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
          In-Cab Telemetry Feed
        </h4>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Thermal Gradient Alert:</span> External temperature rising near highway junction. Reefer unit set to active cooling.
            </div>
          </div>
          <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Eco Corridor Assigned:</span> Avoided 40min urban traffic congestion.
            </div>
          </div>
        </div>
      </div>

      {/* Freshness Inspection Modal */}
      <FreshnessModal />
    </div>
  );
};

