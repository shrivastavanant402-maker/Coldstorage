import React from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { X, Thermometer, Clock, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const ShipmentModal: React.FC = () => {
  const { isModalOpen, selectedModalShipment, modalAnalysis, closeShipmentModal } = useColdChainStore();

  if (!isModalOpen || !selectedModalShipment) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card border border-[#E5E7EB] shadow-xl w-full max-w-xl p-6 relative">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900">
                Diagnostic: {selectedModalShipment.shipment_id}
              </h3>
              <RiskBadge
                level={modalAnalysis?.risk_level || selectedModalShipment.risk_level || 'Low'}
                score={modalAnalysis?.risk_score}
              />
            </div>
            <p className="text-xs text-gray-500">
              {selectedModalShipment.goods_type} • {selectedModalShipment.origin} → {selectedModalShipment.destination}
            </p>
          </div>
          <button onClick={closeShipmentModal} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
          <div className="p-2.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <span className="text-gray-500 block mb-0.5">Cargo Temp</span>
            <span className="font-semibold text-gray-900">{selectedModalShipment.avg_temperature}°C</span>
          </div>
          <div className="p-2.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <span className="text-gray-500 block mb-0.5">Transit Duration</span>
            <span className="font-semibold text-gray-900">{selectedModalShipment.transit_hours} hrs</span>
          </div>
          <div className="p-2.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <span className="text-gray-500 block mb-0.5">Variance</span>
            <span className="font-semibold text-[#DC2626]">±{selectedModalShipment.temp_variance}°C</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            AI Risk Factor Contributions
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {modalAnalysis?.explanation_breakdown.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-gray-900 capitalize">{item.feature.replace('_', ' ')}</span>
                  <p className="text-[11px] text-gray-500">{item.explanation}</p>
                </div>
                <span className={`font-semibold ml-2 ${item.direction === 'increases_risk' ? 'text-[#DC2626]' : 'text-[#0D9488]'}`}>
                  {item.contribution_score > 0 ? `+${item.contribution_score}%` : `${item.contribution_score}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {modalAnalysis?.summary && (
          <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 mb-4">
            {modalAnalysis.summary}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={closeShipmentModal} className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
