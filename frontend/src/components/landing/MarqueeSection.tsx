import React from 'react';

const partners = [
  'Northline',
  'Arcform Freight',
  'Velo Logistics',
  'Juniper Bio',
  'Meridian Cold',
  'Nordic Reefers',
  'Celcius Dynamics',
  'Kestrel Polar',
];

export const MarqueeSection: React.FC = () => {
  return (
    <section className="py-14 border-y border-[#D9D7D0]/60 max-w-[1600px] mx-auto bg-[#FAF9F5] overflow-hidden">
      <div className="px-6 mb-6 text-center">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#8C8880]">
          Powering mission-critical cold operations worldwide
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Subtle gradient edges for soft fading */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAF9F5] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAF9F5] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-infinite flex gap-16 md:gap-24 items-center">
          {partners.concat(partners).concat(partners).map((partner, index) => (
            <div
              key={`${partner}-${index}`}
              className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-[#8C8880] hover:text-[#181818] transition-colors duration-200 cursor-default select-none whitespace-nowrap"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
