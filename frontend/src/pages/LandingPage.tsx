import React, { useState } from 'react';
import { FloatingNavbar } from '../components/landing/FloatingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { MarqueeSection } from '../components/landing/MarqueeSection';
import { BentoFeatures } from '../components/landing/BentoFeatures';
import { Footer } from '../components/landing/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ShieldCheck, Thermometer, Truck, MapPin } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pharma' | 'produce' | 'dairy'>('pharma');

  const tabContent = {
    pharma: {
      tempRange: '2°C to 8°C (Strict)',
      corridor: 'Boston Pharma Hub → Basel Express',
      tolerance: '±0.2°C Excursion Limit',
      status: 'Nominal / Zero Excursion',
      spoilRisk: '0.00%',
    },
    produce: {
      tempRange: '4°C to 7°C (Controlled Atm)',
      corridor: 'Salinas Valley → Chicago Cold Hub',
      tolerance: '±1.0°C Respiration Buffer',
      status: 'Optimal Ventilation Active',
      spoilRisk: '0.12%',
    },
    dairy: {
      tempRange: '-1°C to 3°C (Refrigerated)',
      corridor: 'Wisconsin Dairies → Atlanta Terminal',
      tolerance: '±0.5°C Chilled Hold',
      status: 'Continuous Monitoring Active',
      spoilRisk: '0.04%',
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1B1B1B] selection:bg-[#181818] selection:text-white font-sans">
      {/* 1. Floating Capsule Navbar */}
      <FloatingNavbar onOpenDemo={() => setDemoModalOpen(true)} />

      {/* 2. Main Hero Section (Matching Screenshot) */}
      <main>
        <HeroSection />

        {/* 3. Partner & Enterprise Marquee */}
        <MarqueeSection />

        {/* 4. Live Telemetry Interactive Showcase */}
        <section id="telemetry" className="py-20 px-4 md:px-10 max-w-[1600px] mx-auto">
          <div className="bg-[#F0EFEB] rounded-[32px] md:rounded-[40px] p-8 md:p-14 border border-[#D9D7D0]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#8C8880] block mb-2">
                  Interactive Telemetry Explorer
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1B1B1B]">
                  Live Reefer Tolerance Bands
                </h2>
              </div>

              {/* Segmented Controls */}
              <div className="flex items-center bg-[#E9E8E4] p-1.5 rounded-full border border-[#D9D7D0]">
                {(['pharma', 'produce', 'dairy'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-[#181818] text-white shadow-sm'
                        : 'text-[#615E58] hover:text-[#1B1B1B]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Telemetry Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-[#D9D7D0]/70 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  <Thermometer className="w-4 h-4 text-indigo-600" />
                  Target Temperature
                </div>
                <div className="text-2xl font-bold text-[#1B1B1B]">
                  {tabContent[activeTab].tempRange}
                </div>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Within safe envelope
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#D9D7D0]/70 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Active Corridor
                </div>
                <div className="text-sm font-bold text-[#1B1B1B] truncate">
                  {tabContent[activeTab].corridor}
                </div>
                <p className="text-xs text-[#8C8880] mt-2">
                  Telemetry updated 4s ago
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#D9D7D0]/70 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Fleet Tolerance
                </div>
                <div className="text-sm font-bold text-[#1B1B1B]">
                  {tabContent[activeTab].tolerance}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Adaptive PID controller active
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#D9D7D0]/70 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Predicted Spoilage
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {tabContent[activeTab].spoilRisk}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Neural model certainty 99.7%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Architectural Bento Grid Capabilities */}
        <BentoFeatures />

        {/* 6. Editorial Quote / High-Trust Testimonial */}
        <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto text-center">
          <blockquote className="font-display text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1B1B1B] leading-snug mb-8">
            “Lumio transformed our temperature-controlled logistics from a reactive insurance liability
            into our highest-performing competitive advantage.”
          </blockquote>
          <div className="space-y-1">
            <cite className="not-italic text-sm font-bold text-[#1B1B1B] uppercase tracking-wider block">
              Marcus Vance
            </cite>
            <span className="text-xs text-[#8C8880] tracking-wide">
              VP Global Cold Chain Operations, Meridian Logistics Group
            </span>
          </div>
        </section>

        {/* 7. Call To Action Banner */}
        <section className="py-20 px-4 md:px-10 max-w-[1600px] mx-auto mb-20">
          <div className="bg-[#181818] text-white rounded-[32px] md:rounded-[44px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto z-10 relative">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold block mb-4">
                Immediate Deployment
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
                Ready to bring your freight corridors into focus?
              </h2>
              <p className="text-base sm:text-lg text-white/70 mb-10 leading-relaxed font-normal">
                Join leading logistics operators protecting perishable cargo with automated thermal intelligence.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#181818] text-xs font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <span>Enter Operational Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setDemoModalOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/30 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors"
                >
                  Request Technical Demo
                </button>
              </div>
            </div>
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </section>
      </main>

      {/* 8. High Contrast Editorial Footer */}
      <Footer />

      {/* Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
              Schedule Lumio Demo
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Experience zero-spoilage freight intelligence live on your active corridors.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Active Fleet Size
                </label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option>1 - 25 Reefers</option>
                  <option>26 - 100 Reefers</option>
                  <option>100+ Commercial Fleet</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold uppercase text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <Link
                to="/dashboard"
                onClick={() => setDemoModalOpen(false)}
                className="px-5 py-2.5 bg-[#181818] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-black"
              >
                Launch Dashboard Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
