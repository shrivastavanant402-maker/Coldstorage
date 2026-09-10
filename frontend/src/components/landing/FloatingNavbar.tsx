import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface FloatingNavbarProps {
  onOpenDemo?: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenDemo }) => {
  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex items-center justify-center px-4 w-full pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[720px] flex items-center justify-between bg-[#000000] backdrop-blur-xl rounded-full px-2.5 py-1.5 shadow-2xl border border-white/15 h-[56px] transition-all duration-300 hover:border-white/25">
        {/* Left: Brand mark & Nav links */}
        <div className="flex items-center gap-6 pl-1.5">
          <Link
            to="/"
            className="w-[34px] h-[34px] rounded-full border border-[#FAF9F5]/80 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
            title="Lumio ColdChain"
          >
            <span className="text-[#FAF9F5] font-bold text-sm leading-none">L</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#product"
              className="text-[12px] font-semibold tracking-wider uppercase text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors duration-200"
            >
              Product
            </a>
            <a
              href="#solutions"
              className="text-[12px] font-semibold tracking-wider uppercase text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors duration-200"
            >
              Solutions
            </a>
            <a
              href="#about"
              className="text-[12px] font-semibold tracking-wider uppercase text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#telemetry"
              className="text-[12px] font-semibold tracking-wider uppercase text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors duration-200"
            >
              Telemetry
            </a>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 pr-1">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-medium tracking-wide uppercase px-3 py-1.5 transition-colors"
          >
            Live Console
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </Link>

          <Link
            to="/dashboard"
            onClick={onOpenDemo}
            className="border border-[#FAF9F5]/40 text-[#FAF9F5] rounded-full hover:bg-[#FAF9F5] hover:text-[#181818] transition-all duration-300 shrink-0 flex items-center px-4 text-[10px] h-[34px] font-semibold uppercase tracking-wider shadow-sm"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </header>
  );
};
