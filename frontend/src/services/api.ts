import api from '../api/client';
<<<<<<< Updated upstream
import { Shipment, Driver, RouteOption, AnalyzeShipmentResponse, Business, SimulateCallResponse, SingleShipmentSpoilageResponse, AgentChatRequest, AgentChatResponse } from '../types';
=======
import { Shipment, Driver, RouteOption, AnalyzeShipmentResponse, Business, SimulateCallResponse, SingleShipmentSpoilageResponse, FreshnessCheckResponse } from '../types';
>>>>>>> Stashed changes

export const FALLBACK_SHIPMENTS: Shipment[] = [
  {
    shipment_id: 'SHP-1001',
    origin: 'Mumbai, India',
    destination: 'Delhi, India',
    distance_km: 1420.0,
    transit_hours: 21.4,
    avg_temperature: 3.8,
    temp_variance: 1.1,
    humidity: 62.0,
    goods_type: 'Vaccines',
    vehicle_age: 2.5,
    weather_severity: 1.8,
    delay_history: 0.5,
    risk_score: 14.2,
    risk_level: 'Low',
    status: 'In Transit',
    assigned_driver_id: 'DRV-001',
  },
  {
    shipment_id: 'SHP-1002',
    origin: 'Bengaluru, India',
    destination: 'Delhi, India',
    distance_km: 2140.0,
    transit_hours: 32.8,
    avg_temperature: 9.4,
    temp_variance: 4.2,
    humidity: 78.5,
    goods_type: 'Frozen Seafood',
    vehicle_age: 9.0,
    weather_severity: 4.1,
    delay_history: 4.2,
    risk_score: 82.5,
    risk_level: 'Critical',
    status: 'At Risk',
    assigned_driver_id: 'DRV-002',
  },
  {
    shipment_id: 'SHP-1003',
    origin: 'Chennai, India',
    destination: 'Mumbai, India',
    distance_km: 1340.5,
    transit_hours: 20.2,
    avg_temperature: 5.6,
    temp_variance: 2.4,
    humidity: 68.0,
    goods_type: 'Fresh Produce',
    vehicle_age: 4.5,
    weather_severity: 2.9,
    delay_history: 1.5,
    risk_score: 41.0,
    risk_level: 'Medium',
    status: 'In Transit',
    assigned_driver_id: 'DRV-003',
  }
];

export const FALLBACK_DRIVERS: Driver[] = [
  {
    driver_id: 'DRV-001',
    name: 'Marcus Vance',
    phone: '+1-555-0142',
    vehicle_type: 'Refrigerated Semi-Trailer',
    current_location: 'Mumbai',
    status: 'Available',
    assigned_shipments: ['SHP-1001'],
  },
  {
    driver_id: 'DRV-002',
    name: 'Elena Rostova',
    phone: '+1-555-0189',
    vehicle_type: 'Cryogenic Pharma Van',
    current_location: 'Delhi',
    status: 'On Route',
    assigned_shipments: ['SHP-1002'],
  }
];

export const FALLBACK_BUSINESSES: Business[] = [
  {
    business_id: 'BIZ-001',
    name: 'Apex Cold Hub Distributing',
    location: 'Delhi NCR',
    contact: 'intake@apexcold.com',
    accepts_goods_type: ['Vaccines', 'Biopharmaceuticals'],
    rating: 4.9,
  },
  {
    business_id: 'BIZ-002',
    name: 'FreshHarvest Secondary Food Hub',
    location: 'Mumbai Docks',
    contact: 'buyers@freshharvest.com',
    accepts_goods_type: ['Fresh Produce', 'Dairy Products'],
    rating: 4.7,
  }
];

export const coldChainApi = {
  async getShipments(): Promise<Shipment[]> {
    try {
      const res = await api.get<Shipment[]>('/api/shipments');
      return res.data;
    } catch {
      return FALLBACK_SHIPMENTS;
    }
  },

  async getDrivers(): Promise<Driver[]> {
    try {
      const res = await api.get<Driver[]>('/api/drivers');
      return res.data;
    } catch {
      return FALLBACK_DRIVERS;
    }
  },

  async optimizeRoute(payload: {
    origin: string;
    destination: string;
    goods_type: string;
    vehicle_type: string;
  }): Promise<RouteOption[]> {
    try {
      const res = await api.post<{ routes: RouteOption[] }>('/api/optimize-route', payload);
      return res.data.routes;
    } catch {
      return [
        {
          route_name: 'Express Corridor',
          route_type: 'Fastest Express',
          distance_km: 1120.0,
          transit_hours: 13.5,
          carbon_kg: 950.0,
          cost_usd: 3050.0,
          risk_score: 32.0,
          risk_level: 'Medium',
          waypoints: [
            { lat: 19.076, lng: 72.8777 },
            { lat: 23.6366, lng: 75.5678 },
            { lat: 28.7041, lng: 77.1025 },
          ],
          description: 'Priority freight speed optimization.',
        },
        {
          route_name: 'Greenway Cold Spine',
          route_type: 'Cold-Chain Eco Corridor',
          distance_km: 1180.0,
          transit_hours: 15.0,
          carbon_kg: 740.0,
          cost_usd: 2780.0,
          risk_score: 12.0,
          risk_level: 'Low',
          waypoints: [
            { lat: 19.076, lng: 72.8777 },
            { lat: 22.9606, lng: 77.1083 },
            { lat: 28.7041, lng: 77.1025 },
          ],
          description: '22% lower emissions, optimal thermal stability.',
        }
      ];
    }
  },

  async analyzeShipment(shipment: Partial<Shipment>): Promise<AnalyzeShipmentResponse> {
    try {
      const res = await api.post<AnalyzeShipmentResponse>('/api/analyze-shipment', shipment);
      return res.data;
    } catch {
      return {
        shipment_id: shipment.shipment_id || 'SHP-MOCK',
        risk_score: 42.0,
        risk_level: 'Medium',
        confidence: 0.94,
        explanation_breakdown: [],
        summary: 'Nominal cold-chain metrics observed.',
        eta_hours: shipment.transit_hours || 12.0,
        time_to_spoilage_hours: 10.0, // Mocked to show yellow/red risk depending on ETA
      };
    }
  },

  async assignShipment(shipmentId: string, driverId: string) {
    const res = await api.post('/api/assign-shipment', {
      shipment_id: shipmentId,
      driver_id: driverId,
    });
    return res.data;
  },

  async getNearbyBusinesses(location: string, goodsType: string): Promise<Business[]> {
    try {
      const res = await api.get<Business[]>('/api/nearby-businesses', {
        params: { location, goods_type: goodsType },
      });
      return res.data;
    } catch {
      return FALLBACK_BUSINESSES;
    }
  },

  async simulateCall(businessId: string, shipmentId: string, discountPercent: number): Promise<SimulateCallResponse> {
    try {
      const res = await api.post<SimulateCallResponse>('/api/simulate-call', {
        business_id: businessId,
        shipment_id: shipmentId,
        discount_percent: discountPercent,
      });
      return res.data;
    } catch {
      // Backend unreachable — return a realistic simulated call
      const now = () => new Date().toLocaleTimeString();
      const recovery = Math.round(45000 * (1 - discountPercent / 100));
      return {
        call_id: `CALL-${Date.now()}`,
        business_id: businessId,
        business_name: 'Salvage Warehouse',
        shipment_id: shipmentId,
        goods_type: 'Cold Cargo',
        discount_percent: discountPercent,
        deal_closed: true,
        estimated_recovery_usd: recovery,
        transcript: [
          {
            speaker: 'AI Agent',
            message: `Connecting to warehouse for emergency salvage negotiation. Offering ${discountPercent}% discount on at-risk cargo.`,
            timestamp: now(),
          },
          {
            speaker: 'Warehouse Manager',
            message: `We've reviewed the cargo details. Given the urgency and the ${discountPercent}% discount, we can accept the shipment immediately.`,
            timestamp: now(),
          },
          {
            speaker: 'AI Agent',
            message: `Excellent. Confirming diversion. Estimated recovery value: $${recovery.toLocaleString()}. Gate clearance initiated.`,
            timestamp: now(),
          },
          {
            speaker: 'Warehouse Manager',
            message: 'Confirmed. Our intake team is standing by at Gate 3. Please route the carrier immediately.',
            timestamp: now(),
          },
        ],
      };
    }
  },

  async predictSpoilage(shipmentId: string): Promise<SingleShipmentSpoilageResponse> {
    const res = await api.get<SingleShipmentSpoilageResponse>(`/api/predict-spoilage/${shipmentId}`);
    return res.data;
  },

<<<<<<< Updated upstream
  async agentChat(req: AgentChatRequest): Promise<AgentChatResponse> {
    // Let it throw so VoiceCallModal's local rule-based agent takes over
    const res = await api.post<AgentChatResponse>('/api/agent-chat', req);
=======
  async uploadFreshnessCheck(shipmentId: string, file: File): Promise<FreshnessCheckResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<FreshnessCheckResponse>(`/api/shipments/${shipmentId}/freshness-check`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async analyzeFreshnessDirect(file: File): Promise<FreshnessCheckResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<FreshnessCheckResponse>('/api/analyze-freshness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
>>>>>>> Stashed changes
    return res.data;
  },
};

export default coldChainApi;

