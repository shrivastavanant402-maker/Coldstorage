import React, { useState, useEffect } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { Business, DialogueTurn } from '../types';
import { AlertTriangle, PhoneCall, X, CheckCircle, Sparkles, MessageSquare } from 'lucide-react';
import { VoiceCallModal } from './VoiceCallModal';

export const EmergencySalvageModal: React.FC = () => {
  const {
    isEmergencyModalOpen,
    emergencyShipment,
    nearbyBusinesses,
    isCalling,
    currentCallTranscript,
    dealClosed,
    recoveryAmount,
    closeEmergencyModal,
    triggerAutoCall,
    approveDeal,
  } = useColdChainStore();

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [discountPercent, setDiscountPercent] = useState(35);
  const [visibleTurns, setVisibleTurns] = useState<DialogueTurn[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);

  useEffect(() => {
    if (nearbyBusinesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(nearbyBusinesses[0]);
    }
  }, [nearbyBusinesses, selectedBusiness]);

  useEffect(() => {
    if (currentCallTranscript.length > 0) {
      setVisibleTurns([]);
      let i = 0;
      setIsTyping(true);

      const interval = setInterval(() => {
        if (i < currentCallTranscript.length) {
          setVisibleTurns((prev) => [...prev, currentCallTranscript[i]]);
          i++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentCallTranscript]);

  if (!isEmergencyModalOpen || !emergencyShipment) return null;

  // Derive spoilage & eta from the shipment if available (fall back to sensible defaults)
  const spoilageHours = (emergencyShipment as any).time_to_spoilage_hours ?? 8;
  const etaHours = (emergencyShipment as any).eta_hours ?? 18;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-card border border-[#E5E7EB] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
              <div>
                <h3 className="text-sm font-bold">High Spoilage Risk: {emergencyShipment.shipment_id}</h3>
                <p className="text-[11px] text-white/80">Cargo: {emergencyShipment.goods_type} • Risk {emergencyShipment.risk_score}%</p>
              </div>
            </div>
            <button onClick={closeEmergencyModal} className="text-white/80 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {visibleTurns.length === 0 && !isCalling && (
              <div>
                <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider block mb-2">
                  Nearby Salvage Cold-Storage Buyers
                </span>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {nearbyBusinesses.map((biz) => (
                    <div
                      key={biz.business_id}
                      onClick={() => setSelectedBusiness(biz)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer ${
                        selectedBusiness?.business_id === biz.business_id
                          ? 'border-[#4F46E5] bg-indigo-50/50 ring-1 ring-[#4F46E5]'
                          : 'border-[#E5E7EB] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 truncate">{biz.name}</span>
                        <span className="text-amber-500 font-bold text-[10px]">★ {biz.rating}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{biz.location}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-xs space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Salvage Discount Offered:</span>
                    <span className="font-bold text-[#4F46E5]">{discountPercent}% OFF</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full accent-[#4F46E5]"
                  />
                </div>

                {/* Two call options */}
                <div className="grid grid-cols-2 gap-2">
                  {/* AI Auto-Call (original) */}
                  <button
                    onClick={() => selectedBusiness && triggerAutoCall(selectedBusiness, discountPercent)}
                    disabled={!selectedBusiness}
                    className="py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    AI Auto-Call
                  </button>

                  {/* ── NEW: Interactive Voice Agent ── */}
                  <button
                    onClick={() => selectedBusiness && setIsVoiceCallOpen(true)}
                    disabled={!selectedBusiness}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Talk to Agent
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  "Talk to Agent" opens a live voice negotiation — speak directly with the warehouse intake manager.
                </p>
              </div>
            )}

            {(isCalling || visibleTurns.length > 0) && (
              <div className="space-y-3">
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 min-h-[180px] max-h-[260px] overflow-y-auto space-y-2.5">
                  {visibleTurns.map((turn, idx) => {
                    const isAI = turn.speaker.includes('AI');
                    return (
                      <div key={idx} className={`flex gap-2 text-xs ${isAI ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-2.5 rounded-xl shadow-subtle ${isAI ? 'bg-white border text-gray-900' : 'bg-[#0D9488] text-white'}`}>
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-0.5">
                            <span>{turn.speaker}</span>
                            <span>{turn.timestamp}</span>
                          </div>
                          <p>{turn.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 italic">
                      <Sparkles className="w-3 h-3 text-[#4F46E5] animate-spin" />
                      Transcribing audio transmission...
                    </div>
                  )}
                </div>

                {!isTyping && dealClosed && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Terms Accepted!
                    </span>
                    <span className="font-bold text-emerald-700">Value Saved: ${recoveryAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
            <button onClick={closeEmergencyModal} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-[#E5E7EB] rounded-lg">
              Cancel
            </button>
            {dealClosed && (
              <button onClick={approveDeal} className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Approve Diversion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Voice Agent overlay (z-[60] sits above the salvage modal at z-50) ── */}
      {selectedBusiness && (
        <VoiceCallModal
          isOpen={isVoiceCallOpen}
          onClose={() => setIsVoiceCallOpen(false)}
          shipmentId={emergencyShipment.shipment_id}
          businessId={selectedBusiness.business_id}
          businessName={selectedBusiness.name}
          businessLocation={selectedBusiness.location}
          goodsType={emergencyShipment.goods_type || 'Cold Cargo'}
          avgTemperature={emergencyShipment.avg_temperature ?? 4.5}
          timeToSpoilageHours={spoilageHours}
          etaHours={etaHours}
          discountOffered={discountPercent}
          autoStart={true}
        />
      )}
    </>
  );
};
