import React from 'react';

interface Props {
  level?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  score?: number;
}

export const RiskBadge: React.FC<Props> = ({ level = 'Low', score }) => {
  const norm = level.toLowerCase();

  let style = 'bg-teal-50 text-[#0D9488] border-teal-200';
  if (norm === 'medium') {
    style = 'bg-amber-50 text-[#D97706] border-amber-200';
  } else if (norm === 'high') {
    style = 'bg-red-50 text-[#DC2626] border-red-200';
  } else if (norm === 'critical') {
    style = 'bg-red-100 text-red-900 border-red-300 font-semibold';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border font-medium ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level} {score !== undefined ? `(${score}%)` : ''}
    </span>
  );
};
