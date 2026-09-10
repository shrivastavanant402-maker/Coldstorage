import { create } from 'zustand';
import { Shipment, Driver, Business, DialogueTurn, SavingsState, RouteOption, AnalyzeShipmentResponse } from '../types';
import coldChainApi, { FALLBACK_SHIPMENTS, FALLBACK_DRIVERS, FALLBACK_BUSINESSES } from '../services/api';

interface ColdChainState {
  userRole: 'owner' | 'driver';
  setUserRole: (role: 'owner' | 'driver') => void;
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;

  shipments: Shipment[];
  drivers: Driver[];
  savings: SavingsState;
  routeOptions: RouteOption[];
  isLoading: boolean;

  selectedModalShipment: Shipment | null;
  modalAnalysis: AnalyzeShipmentResponse | null;
  isModalOpen: boolean;

  isAssignModalOpen: boolean;
  shipmentToAssign: Shipment | null;

  isEmergencyModalOpen: boolean;
  emergencyShipment: Shipment | null;
  nearbyBusinesses: Business[];
  isCalling: boolean;
  currentCallTranscript: DialogueTurn[];
  dealClosed: boolean | null;
  recoveryAmount: number;

  fetchInitialData: () => Promise<void>;
  findOptimalRoutes: (origin: string, destination: string, goods: string, vehicle: string) => Promise<void>;
  openShipmentModal: (shipment: Shipment) => Promise<void>;
  closeShipmentModal: () => void;

  openAssignModal: (shipment: Shipment) => void;
  closeAssignModal: () => void;
  assignDriver: (shipmentId: string, driverId: string) => Promise<void>;

  openEmergencyModal: (shipment?: Shipment) => Promise<void>;
  closeEmergencyModal: () => void;
  triggerAutoCall: (business: Business, discount: number) => Promise<void>;
  approveDeal: () => void;
  denyDeal: () => void;
  startDriverTrip: (shipmentId: string) => void;
}

export const useColdChainStore = create<ColdChainState>((set, get) => ({
  userRole: 'owner',
  setUserRole: (role) => set({ userRole: role }),
  selectedDriverId: 'DRV-001',
  setSelectedDriverId: (id) => set({ selectedDriverId: id }),

  shipments: FALLBACK_SHIPMENTS,
  drivers: FALLBACK_DRIVERS,
  routeOptions: [],
  isLoading: false,
  savings: {
    fuelSavedGal: 16500,
    co2ReducedTon: 178.4,
    spoilageAvoidedUsd: 502000,
  },

  selectedModalShipment: null,
  modalAnalysis: null,
  isModalOpen: false,

  isAssignModalOpen: false,
  shipmentToAssign: null,

  isEmergencyModalOpen: false,
  emergencyShipment: null,
  nearbyBusinesses: FALLBACK_BUSINESSES,
  isCalling: false,
  currentCallTranscript: [],
  dealClosed: null,
  recoveryAmount: 0,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [shipments, drivers] = await Promise.all([
        coldChainApi.getShipments(),
        coldChainApi.getDrivers(),
      ]);
      set({ shipments, drivers, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  findOptimalRoutes: async (origin, destination, goods, vehicle) => {
    set({ isLoading: true });
    try {
      const routes = await coldChainApi.optimizeRoute({
        origin,
        destination,
        goods_type: goods,
        vehicle_type: vehicle,
      });
      set({ routeOptions: routes, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  openShipmentModal: async (shipment) => {
    set({ selectedModalShipment: shipment, isModalOpen: true, modalAnalysis: null });
    try {
      const analysis = await coldChainApi.analyzeShipment(shipment);
      set({ modalAnalysis: analysis });
    } catch (err) {
      console.error(err);
    }
  },

  closeShipmentModal: () => {
    set({ isModalOpen: false, selectedModalShipment: null, modalAnalysis: null });
  },

  openAssignModal: (shipment) => set({ isAssignModalOpen: true, shipmentToAssign: shipment }),
  closeAssignModal: () => set({ isAssignModalOpen: false, shipmentToAssign: null }),

  assignDriver: async (shipmentId, driverId) => {
    await coldChainApi.assignShipment(shipmentId, driverId);
    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.shipment_id === shipmentId ? { ...s, assigned_driver_id: driverId, status: 'Assigned' } : s
      ),
      isAssignModalOpen: false,
      shipmentToAssign: null,
    }));
  },

  openEmergencyModal: async (targetShipment) => {
    const criticalShipment =
      targetShipment ||
      get().shipments.find((s) => (s.risk_score || 0) >= 70) ||
      get().shipments[0];

    set({
      isEmergencyModalOpen: true,
      emergencyShipment: {
        ...criticalShipment,
        risk_score: 88.5,
        risk_level: 'Critical',
        status: 'At Risk',
      },
      currentCallTranscript: [],
      dealClosed: null,
      isCalling: false,
    });

    try {
      const biz = await coldChainApi.getNearbyBusinesses(
        criticalShipment.destination,
        criticalShipment.goods_type
      );
      set({ nearbyBusinesses: biz });
    } catch {
      set({ nearbyBusinesses: FALLBACK_BUSINESSES });
    }
  },

  closeEmergencyModal: () =>
    set({
      isEmergencyModalOpen: false,
      emergencyShipment: null,
      currentCallTranscript: [],
      dealClosed: null,
      isCalling: false,
    }),

  triggerAutoCall: async (business, discount) => {
    const shp = get().emergencyShipment;
    if (!shp) return;

    set({ isCalling: true, currentCallTranscript: [], dealClosed: null });

    const callResult = await coldChainApi.simulateCall(
      business.business_id,
      shp.shipment_id,
      discount
    );

    set({
      isCalling: false,
      currentCallTranscript: callResult.transcript,
      dealClosed: callResult.deal_closed,
      recoveryAmount: callResult.estimated_recovery_usd,
    });
  },

  approveDeal: () => {
    const { emergencyShipment, recoveryAmount } = get();
    if (!emergencyShipment) return;

    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.shipment_id === emergencyShipment.shipment_id
          ? { ...s, status: 'Salvaged', risk_level: 'Low', risk_score: 15.0 }
          : s
      ),
      savings: {
        ...state.savings,
        spoilageAvoidedUsd: state.savings.spoilageAvoidedUsd + (recoveryAmount || 36000),
      },
      isEmergencyModalOpen: false,
      emergencyShipment: null,
    }));
  },

  denyDeal: () => set({ isEmergencyModalOpen: false, emergencyShipment: null }),

  startDriverTrip: (shipmentId: string) => {
    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.shipment_id === shipmentId ? { ...s, status: 'In Transit' } : s
      ),
    }));
  },
}));
