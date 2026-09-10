import React from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Fuel, Leaf, ShieldAlert, TrendingUp } from 'lucide-react';

const MONTHLY_SAVINGS_DATA = [
  { month: 'Jan', fuel_saved_gal: 1800, co2_reduced_ton: 19.5, spoilage_avoided_k: 42 },
  { month: 'Feb', fuel_saved_gal: 2100, co2_reduced_ton: 22.8, spoilage_avoided_k: 58 },
  { month: 'Mar', fuel_saved_gal: 2450, co2_reduced_ton: 26.2, spoilage_avoided_k: 71 },
  { month: 'Apr', fuel_saved_gal: 2900, co2_reduced_ton: 31.0, spoilage_avoided_k: 86 },
  { month: 'May', fuel_saved_gal: 3400, co2_reduced_ton: 37.4, spoilage_avoided_k: 110 },
  { month: 'Jun', fuel_saved_gal: 3850, co2_reduced_ton: 41.5, spoilage_avoided_k: 135 },
];

export const SavingsPage: React.FC = () => {
  const { savings } = useColdChainStore();

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Fuel Saved</span>
            <Fuel className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{savings.fuelSavedGal.toLocaleString()} gal</div>
          <p className="text-xs text-gray-500 mt-0.5">Via thermal bypass corridors</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Carbon Reduced</span>
            <Leaf className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div className="text-2xl font-bold text-[#0D9488]">{savings.co2ReducedTon} t CO2e</div>
          <p className="text-xs text-gray-500 mt-0.5">Verified Scope 3 reduction</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-card p-4 shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Spoilage Avoided</span>
            <ShieldAlert className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${savings.spoilageAvoidedUsd.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-0.5">Salvaged via AI Auto-Call & diversions</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-card p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Monthly Sustainability & Loss Prevention
            </h3>
            <p className="text-xs text-gray-500">
              Comparative trends across Fuel, Carbon Offset, and Avoided Spoilage ($K).
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#0D9488] font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            +24.8% YoY
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_SAVINGS_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="co2_reduced_ton" name="CO2 Reduced (Tons)" fill="#0D9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spoilage_avoided_k" name="Spoilage Avoided ($K)" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
