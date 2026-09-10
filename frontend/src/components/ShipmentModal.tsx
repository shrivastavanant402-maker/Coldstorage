import React from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { X } from 'lucide-react';
import { RiskBadge, TimeRemainingBadge } from './RiskBadge';

export const ShipmentModal: React.FC = () => {
  const { isModalOpen, selectedModalShipment, modalAnalysis, closeShipmentModal } = useColdChainStore();

  if (!isModalOpen || !selectedModalShipment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFDF8] rounded-[28px] md:rounded-[36px] border border-[#D9D7D0] shadow-2xl w-full max-w-xl p-7 relative">
        <div className="flex items-start justify-between border-b border-[#D9D7D0] pb-4 mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h3 className="font-display text-lg font-bold text-[#1B1B1B]">
                Diagnostic: {selectedModalShipment.shipment_id}
              </h3>
              <RiskBadge
                level={modalAnalysis?.risk_level || selectedModalShipment.risk_level || 'Low'}
                score={modalAnalysis?.risk_score}
              />
              {modalAnalysis?.eta_hours !== undefined && modalAnalysis?.time_to_spoilage_hours !== undefined && (
                <TimeRemainingBadge
                  etaHours={modalAnalysis.eta_hours}
                  spoilageHours={modalAnalysis.time_to_spoilage_hours}
                />
              )}
            </div>
            <p className="text-xs text-[#8C8880] font-medium">
              {selectedModalShipment.goods_type} • {selectedModalShipment.origin} → {selectedModalShipment.destination}
            </p>
          </div>
          <button
            onClick={closeShipmentModal}
            className="w-8 h-8 rounded-full bg-[#E9E8E4] hover:bg-[#D9D7D0] flex items-center justify-center text-[#1B1B1B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5 text-xs">
          <div className="p-3 bg-[#F0EFEB] rounded-2xl border border-[#D9D7D0]">
            <span className="text-[#8C8880] block text-[10px] font-semibold uppercase tracking-wider mb-1">Cargo Temp</span>
            <span className="font-bold text-base text-[#1B1B1B]">{selectedModalShipment.avg_temperature}°C</span>
          </div>
          <div className="p-3 bg-[#F0EFEB] rounded-2xl border border-[#D9D7D0]">
            <span className="text-[#8C8880] block text-[10px] font-semibold uppercase tracking-wider mb-1">Transit Time</span>
            <span className="font-bold text-base text-[#1B1B1B]">{selectedModalShipment.transit_hours} hrs</span>
          </div>
          <div className="p-3 bg-[#F0EFEB] rounded-2xl border border-[#D9D7D0]">
            <span className="text-[#8C8880] block text-[10px] font-semibold uppercase tracking-wider mb-1">Variance</span>
            <span className="font-bold text-base text-rose-600">±{selectedModalShipment.temp_variance}°C</span>
          </div>
        </div>

        <div className="mb-5">
          <h4 className="text-xs font-semibold text-[#1B1B1B] uppercase tracking-wider mb-2.5">
            AI Risk Factor Contributions
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {modalAnalysis?.explanation_breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[#D9D7D0] bg-[#FAF9F5] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#1B1B1B] capitalize">{item.feature.replace('_', ' ')}</span>
                  <p className="text-[11px] text-[#8C8880] mt-0.5">{item.explanation}</p>
                </div>
                <span
                  className={`font-mono font-bold ml-3 text-xs ${
                    item.direction === 'increases_risk' ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {item.contribution_score > 0 ? `+${item.contribution_score}%` : `${item.contribution_score}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {modalAnalysis?.summary && (
          <div className="p-3.5 rounded-2xl bg-[#E9E8E4] border border-[#D9D7D0] text-xs text-[#1B1B1B] mb-5 leading-relaxed font-medium">
            {modalAnalysis.summary}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#D9D7D0]">
          <button
            onClick={closeShipmentModal}
            className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#181818] hover:bg-black rounded-full transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
