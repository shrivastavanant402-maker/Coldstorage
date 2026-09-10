import React, { useState, useRef } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { Camera, Upload, X, Loader2, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { FreshnessBadge } from './RiskBadge';

export const FreshnessModal: React.FC = () => {
  const {
    isFreshnessModalOpen,
    freshnessTargetShipment,
    isAnalyzingFreshness,
    freshnessResult,
    closeFreshnessModal,
    submitFreshnessCheck,
    startDriverTrip,
  } = useColdChainStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isFreshnessModalOpen || !freshnessTargetShipment) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSelectSample = async (samplePath: string, filename: string) => {
    try {
      const resp = await fetch(samplePath);
      const blob = await resp.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setSelectedFile(file);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Failed to load sample produce image:', err);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    await submitFreshnessCheck(freshnessTargetShipment.shipment_id, selectedFile);
  };

  const handleProceedTransit = () => {
    startDriverTrip(freshnessTargetShipment.shipment_id);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    closeFreshnessModal();
  };

  const handleResetImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCompleted = freshnessResult?.freshness_status === 'completed';
  const isFailed = freshnessResult?.freshness_status === 'failed';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFDF8] rounded-[28px] md:rounded-[36px] border border-[#D9D7D0] shadow-2xl w-full max-w-lg p-6 md:p-7 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#D9D7D0] pb-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Live Gemini Multimodal Vision AI
            </div>
            <h3 className="font-display text-lg font-bold text-[#1B1B1B]">
              Cargo Freshness Assessment
            </h3>
            <p className="text-xs text-[#8C8880]">
              Shipment <strong className="text-[#1B1B1B] font-mono">{freshnessTargetShipment.shipment_id}</strong> • {freshnessTargetShipment.goods_type}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#E9E8E4] hover:bg-[#D9D7D0] flex items-center justify-center text-[#1B1B1B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Initial Capture / Upload State */}
        {!freshnessResult && !isAnalyzingFreshness && (
          <div className="space-y-4">
            <p className="text-xs text-[#615E58] leading-relaxed">
              Capture or upload a photo of the produce pallet before dispatch. Google Gemini AI will inspect visual ripeness, color distribution, skin defects, and thermal condensation.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="produce-photo-input"
            />

            {!previewUrl ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 border-2 border-dashed border-[#D9D7D0] hover:border-indigo-500 bg-[#FAF9F5] hover:bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B1B1B] block">Camera Capture</span>
                      <span className="text-[11px] text-[#8C8880]">Take photo with device camera</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 border-2 border-dashed border-[#D9D7D0] hover:border-[#181818] bg-[#FAF9F5] hover:bg-[#E9E8E4]/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E9E8E4] flex items-center justify-center text-[#1B1B1B] group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B1B1B] block">Upload File</span>
                      <span className="text-[11px] text-[#8C8880]">Select JPG/PNG from storage</span>
                    </div>
                  </button>
                </div>

                {/* Instant Quick-Test Produce Samples */}
                <div className="pt-2 border-t border-[#E9E8E4]">
                  <span className="text-[11px] font-bold text-[#1B1B1B] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Or Quick-Test with Demo Cargo Photos:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectSample('/samples/fresh_tomatoes.jpg', 'vine_tomatoes.jpg')}
                      className="p-2 border border-[#D9D7D0] hover:border-indigo-500 hover:shadow-sm rounded-xl bg-white hover:bg-indigo-50/40 text-left transition-all group flex flex-col items-center text-center gap-1.5 cursor-pointer"
                    >
                      <img src="/samples/fresh_tomatoes.jpg" alt="Vine Tomatoes" className="w-full h-14 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                      <span className="text-[10px] font-bold text-[#1B1B1B] line-clamp-1">Vine Tomatoes</span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold">Fresh (95)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSample('/samples/spoiled_banana.jpg', 'spoiled_banana.jpg')}
                      className="p-2 border border-[#D9D7D0] hover:border-rose-500 hover:shadow-sm rounded-xl bg-white hover:bg-rose-50/40 text-left transition-all group flex flex-col items-center text-center gap-1.5 cursor-pointer"
                    >
                      <img src="/samples/spoiled_banana.jpg" alt="Overripe Banana" className="w-full h-14 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                      <span className="text-[10px] font-bold text-[#1B1B1B] line-clamp-1">Spoiled Banana</span>
                      <span className="text-[9px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full font-semibold">Decayed (05)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSample('/samples/fresh_peppers.jpg', 'fresh_peppers.jpg')}
                      className="p-2 border border-[#D9D7D0] hover:border-indigo-500 hover:shadow-sm rounded-xl bg-white hover:bg-indigo-50/40 text-left transition-all group flex flex-col items-center text-center gap-1.5 cursor-pointer"
                    >
                      <img src="/samples/fresh_peppers.jpg" alt="Bell Peppers" className="w-full h-14 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                      <span className="text-[10px] font-bold text-[#1B1B1B] line-clamp-1">Bell Peppers</span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold">Crisp Produce</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-[#D9D7D0] bg-black/5 aspect-video flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Produce preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 backdrop-blur-sm cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Retake
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="px-4 py-2 text-xs font-semibold text-[#615E58] hover:text-[#1B1B1B] cursor-pointer"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    className="px-5 py-2.5 bg-[#181818] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Run Gemini Freshness AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Analyzing Loading State */}
        {isAnalyzingFreshness && (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin absolute -inset-1" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[#1B1B1B]">
                Analyzing Cargo with Gemini Vision...
              </h4>
              <p className="text-xs text-[#8C8880] mt-1 max-w-xs">
                Inspecting color distribution, skin firmness, surface defects, and ambient moisture in real time.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Completed or Failed Result State */}
        {freshnessResult && !isAnalyzingFreshness && (
          <div className="space-y-4">
            {isCompleted ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {freshnessResult.identified_produce || 'Produce Verified'}
                  </span>
                  <FreshnessBadge
                    score={freshnessResult.freshness_score}
                    status={freshnessResult.freshness_status}
                  />
                </div>

                {/* Analyzed Image Thumbnail & Score Row */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  {(freshnessResult.freshness_image_url || previewUrl) && (
                    <div className="col-span-4 rounded-xl overflow-hidden border border-emerald-200 bg-black/5 aspect-square">
                      <img
                        src={freshnessResult.freshness_image_url || previewUrl!}
                        alt="Inspected produce"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className={`${(freshnessResult.freshness_image_url || previewUrl) ? 'col-span-8' : 'col-span-12'} grid grid-cols-2 gap-2 text-xs`}>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                      <span className="text-[#8C8880] text-[10px] block font-semibold uppercase">Freshness Score</span>
                      <span className="text-2xl font-bold font-display text-emerald-800">
                        {freshnessResult.freshness_score}<span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                      <span className="text-[#8C8880] text-[10px] block font-semibold uppercase">Spoilage Risk</span>
                      <span className={`text-xs font-bold uppercase ${
                        freshnessResult.spoilage_risk === 'low' ? 'text-emerald-700' :
                        freshnessResult.spoilage_risk === 'medium' ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {freshnessResult.spoilage_risk || 'Low'} Risk
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Summary Text */}
                <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 text-xs text-[#1B1B1B] leading-relaxed">
                  <span className="font-semibold text-emerald-900 block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Gemini Vision Inspector Analysis:
                  </span>
                  {freshnessResult.freshness_summary}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Freshness Assessment Inconclusive</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {freshnessResult.freshness_summary || 'The photo was too blurry or did not show clear produce cargo.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Photo Capture
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#D9D7D0]">
              <button
                type="button"
                onClick={handleResetImage}
                className="text-xs font-semibold text-[#8C8880] hover:text-[#1B1B1B] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Test Another Cargo Photo
              </button>

              <button
                type="button"
                onClick={handleProceedTransit}
                className="px-5 py-2.5 bg-[#181818] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>Confirm & Start Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

