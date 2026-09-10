import React from 'react';

interface Props {
  level?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  score?: number;
}

export const RiskBadge: React.FC<Props> = ({ level = 'Low', score }) => {
  const norm = level.toLowerCase();

  let style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (norm === 'medium') {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (norm === 'high') {
    style = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (norm === 'critical') {
    style = 'bg-[#181818] text-white border-black font-semibold shadow-sm';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border font-semibold uppercase tracking-wider ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {level} {score !== undefined ? `(${score}%)` : ''}
    </span>
  );
};

interface TimeRemainingProps {
  etaHours?: number;
  spoilageHours?: number;
}

export const TimeRemainingBadge: React.FC<TimeRemainingProps> = ({ etaHours, spoilageHours }) => {
  if (etaHours === undefined || spoilageHours === undefined) return null;

  const diff = spoilageHours - etaHours;
  let style = 'bg-emerald-50 text-emerald-800 border-emerald-200'; // Green if safe
  
  if (diff < 0) {
    style = 'bg-rose-50 text-rose-800 border-rose-200'; // Red if spoilage before delivery
  } else if (diff <= 12) {
    style = 'bg-amber-50 text-amber-800 border-amber-200'; // Yellow if close
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border font-semibold uppercase tracking-wider ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {spoilageHours}h to spoilage — {etaHours}h to delivery
    </span>
  );
};
