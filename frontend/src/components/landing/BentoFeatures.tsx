import React from 'react';
import { Link } from 'react-router-dom';
import {
  ThermometerSnowflake,
  Compass,
  BellRing,
  Leaf,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const BentoFeatures: React.FC = () => {
  return (
    <section id="product" className="py-24 px-4 md:px-10 max-w-[1600px] mx-auto bg-[#FAF9F5]">
      {/* Section Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#8C8880] block mb-3">
          Architecture & Capabilities
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1B1B1B] mb-5 leading-tight">
          Precision telemetry crafted for zero-spoilage freight.
        </h2>
        <p className="text-base sm:text-lg text-[#8C8880] leading-relaxed">
          From deep freeze pharmaceuticals to fragile horticultural produce, Lumio continuously computes
          ambient heat infiltration, traffic congestion, and reefer load dynamics.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Card: 3D Corridor Simulation & Tracking */}
        <div className="md:col-span-2 bg-[#E9E8E4] rounded-3xl md:rounded-[36px] p-8 md:p-12 flex flex-col justify-between border border-[#D9D7D0] relative overflow-hidden group">
          <div className="max-w-xl z-10 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
              <Compass className="w-6 h-6 text-[#181818]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8880] block mb-1">
              Active Routing
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B] mb-3">
              Dynamic 3D Spines & Reefer Navigation
            </h3>
            <p className="text-sm sm:text-base text-[#615E58] leading-relaxed">
              Real-time route recalculation across terrain altitudes and ambient temperature gradients to keep cargo inside strict tolerance bands.
            </p>
          </div>

          {/* Interactive Graphic Simulation */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#D9D7D0]/60 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Corridor: Salinas Valley → Chicago Hub
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-gray-900">2,140 Miles</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  Zero Drift
                </span>
              </div>
            </div>
            <Link
              to="/routes"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#181818] text-white text-xs font-semibold tracking-wider uppercase hover:bg-black transition-colors"
            >
              <span>Explore Corridors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Card: Thermal Risk Mitigation */}
        <div className="bg-[#FFFDF8] rounded-3xl md:rounded-[36px] p-8 md:p-10 flex flex-col justify-between border border-[#D9D7D0] shadow-sm">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#D9D7D0] flex items-center justify-center mb-6">
              <ThermometerSnowflake className="w-6 h-6 text-[#181818]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8880] block mb-1">
              Thermal Guard
            </span>
            <h3 className="font-display text-2xl font-bold text-[#1B1B1B] mb-3">
              Predictive Spoilage Defense
            </h3>
            <p className="text-sm text-[#8C8880] leading-relaxed mb-6">
              Neural sensors flag thermal insulation anomalies hours before critical thresholds are breached.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#D9D7D0]/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-600">Reefer Integrity</span>
              <span className="font-bold text-emerald-600">99.8%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[99.8%]" />
            </div>
          </div>
        </div>

        {/* Card: Automated Driver Dispatch & Alerting */}
        <div className="bg-[#FFFDF8] rounded-3xl md:rounded-[36px] p-8 md:p-10 flex flex-col justify-between border border-[#D9D7D0] shadow-sm">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#D9D7D0] flex items-center justify-center mb-6">
              <BellRing className="w-6 h-6 text-[#181818]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8880] block mb-1">
              Mitigation Protocol
            </span>
            <h3 className="font-display text-2xl font-bold text-[#1B1B1B] mb-3">
              Automated Voice Dispatch
            </h3>
            <p className="text-sm text-[#8C8880] leading-relaxed">
              When reefer compressors trip, automated voice agents contact freight operators with emergency pre-cooling instructions.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#D9D7D0]/60 flex items-center gap-2 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Average incident resolution: 4.2 mins</span>
          </div>
        </div>

        {/* Card: Carbon Offset & Sustainability */}
        <div className="bg-[#F0EFEB] rounded-3xl md:rounded-[36px] p-8 md:p-10 flex flex-col justify-between border border-[#D9D7D0]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
              <Leaf className="w-6 h-6 text-emerald-700" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8880] block mb-1">
              Sustainability
            </span>
            <h3 className="font-display text-2xl font-bold text-[#1B1B1B] mb-3">
              Eco Spines & Carbon Savings
            </h3>
            <p className="text-sm text-[#615E58] leading-relaxed">
              Optimized velocity corridors reduce auxiliary diesel refrigeration consumption by up to 22%.
            </p>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1B1B1B]">14.2 t</span>
            <span className="text-xs text-[#8C8880]">CO₂ saved this quarter</span>
          </div>
        </div>

        {/* Card: Live Telemetry Preview CTA */}
        <div className="bg-[#181818] text-white rounded-3xl md:rounded-[36px] p-8 md:p-10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 block mb-1">
              Interactive Telemetry
            </span>
            <h3 className="font-display text-2xl font-bold text-white mb-3">
              Explore Live Sensor Telemetry
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Step into the mission control dashboard to monitor reefer temperatures, humidity, and location in real-time.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-white text-[#181818] font-semibold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-md"
          >
            <span>Open Operational Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
