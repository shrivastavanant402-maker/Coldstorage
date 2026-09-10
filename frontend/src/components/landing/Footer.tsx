import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#151515] text-[#FAF9F5] pt-20 pb-12 px-6 md:px-12 border-t border-white/10">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full border border-white/80 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm leading-none">L</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">Lumio ColdChain</span>
            </div>
            <p className="text-sm text-[#8C8880] max-w-sm leading-relaxed">
              The operating system for modern perishable freight and high-value cold chain logistics.
              Precision telemetry meets autonomous risk mitigation.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-white/90 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-all"
              >
                <span>Launch Operational Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Nav Columns */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8C8880] mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link to="/routes" className="hover:text-white transition-colors">3D Spines & Routing</Link></li>
              <li><Link to="/shipments" className="hover:text-white transition-colors">Thermal Telemetry</Link></li>
              <li><Link to="/savings" className="hover:text-white transition-colors">Eco Spines & Carbon</Link></li>
              <li><Link to="/driver" className="hover:text-white transition-colors">Driver Companion</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8C8880] mb-4">Corridors</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><span className="text-white/60">I-80 Midwest Express</span></li>
              <li><span className="text-white/60">Pacific Coastal Reefer</span></li>
              <li><span className="text-white/60">Gulf Super-Corridor</span></li>
              <li><span className="text-white/60">Cross-Continent Pharma</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8C8880] mb-4">Enterprise</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><a href="#about" className="hover:text-white transition-colors">Security & SLA</a></li>
              <li><a href="#product" className="hover:text-white transition-colors">Compliance Standards</a></li>
              <li><a href="#telemetry" className="hover:text-white transition-colors">API & Webhooks</a></li>
              <li><a href="mailto:support@lumio.coldchain" className="hover:text-white transition-colors">Contact Engineering</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8880]">
          <div>
            © {new Date().getFullYear()} Lumio ColdChain AI Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Telemetry Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
