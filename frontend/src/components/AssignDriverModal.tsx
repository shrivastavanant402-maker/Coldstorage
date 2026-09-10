import React, { useState } from 'react';
import { useColdChainStore } from '../store/useColdChainStore';
import { X, Truck, MapPin, CheckCircle2 } from 'lucide-react';

export const AssignDriverModal: React.FC = () => {
  const { isAssignModalOpen, shipmentToAssign, closeAssignModal, drivers, assignDriver } =
    useColdChainStore();
  const [selectedDriver, setSelectedDriver] = useState<string>('DRV-001');
  const [submitting, setSubmitting] = useState(false);

  if (!isAssignModalOpen || !shipmentToAssign) return null;

  const handleAssign = async () => {
    setSubmitting(true);
    await assignDriver(shipmentToAssign.shipment_id, selectedDriver);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card border border-[#E5E7EB] shadow-xl w-full max-w-md p-6 relative">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Assign Driver</h3>
            <p className="text-xs text-gray-500">Manifest: {shipmentToAssign.shipment_id} ({shipmentToAssign.goods_type})</p>
          </div>
          <button onClick={closeAssignModal} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 mb-5 max-h-60 overflow-y-auto">
          {drivers.map((driver) => (
            <label
              key={driver.driver_id}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs ${
                selectedDriver === driver.driver_id
                  ? 'border-[#4F46E5] bg-indigo-50/50'
                  : 'border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="driver"
                  checked={selectedDriver === driver.driver_id}
                  onChange={() => setSelectedDriver(driver.driver_id)}
                  className="accent-[#4F46E5]"
                />
                <div>
                  <span className="font-semibold text-gray-900 block">{driver.name}</span>
                  <span className="text-[11px] text-gray-500">{driver.vehicle_type} • {driver.current_location}</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                {driver.status}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button onClick={closeAssignModal} className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting}
            className="px-4 py-1.5 text-xs font-medium text-white bg-[#4F46E5] hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
