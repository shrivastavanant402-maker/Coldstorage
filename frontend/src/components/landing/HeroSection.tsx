import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-36 md:pt-44 pb-20 px-4 md:px-10 max-w-[1600px] mx-auto flex flex-col items-center text-center relative overflow-visible bg-[#FAF9F5]">
      {/* Top Eyebrow Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EFEB] border border-[#D9D7D0] mb-8 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#181818]" />
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#1B1B1B]">
          Lumio 2.0 · Autonomous Cold Chain Intelligence
        </span>
      </div>

      {/* Main Architectural Headline */}
      <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[86px] leading-[1.02] tracking-tight font-bold text-[#1B1B1B] max-w-5xl mb-7">
        Bring every team into focus
      </h1>

      {/* Subtitle */}
      <p className="font-sans text-base sm:text-lg md:text-xl text-[#8C8880] max-w-2xl mb-10 leading-relaxed font-normal">
        Unify perishable freight operations with continuous telemetry, predictive thermal drift modeling,
        and instant corridor mitigation in one calm, editorial interface.
      </p>

      {/* Hero Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 mb-16 z-20">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2.5 bg-[#181818] hover:bg-black text-white px-7 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <span>Launch Live Console</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/routes"
          className="inline-flex items-center gap-2 border border-[#D9D7D0] hover:border-[#181818] bg-white text-[#1B1B1B] px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow"
        >
          <span>Inspect 3D Corridors</span>
        </Link>
      </div>

      {/* Large Featured Visual Container */}
      <div className="w-full max-w-[1440px] bg-[#F0EFEB] overflow-hidden shadow-2xl relative z-10 rounded-[32px] md:rounded-[44px] h-[480px] sm:h-[600px] md:h-[720px] lg:h-[800px] border border-[#D9D7D0]/60 group">
        <img
          alt="Culinary chef and precision team in focused kitchen operation under heat lamps"
          className="w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
          src="https://images.unsplash.com/photo-1776009009253-759b31cd3908?q=80&w=2664&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Floating Telemetry Indicator Overlay */}
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/60 px-5 py-3.5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-[#1B1B1B] tracking-tight">Active Cold Chain Integrity</span>
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-gray-300" />
          <div className="flex items-center gap-3 text-[11px] text-[#615e58]">
            <span className="inline-flex items-center gap-1 font-medium">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              14 Active Reefers
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              98.4% Compliant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
