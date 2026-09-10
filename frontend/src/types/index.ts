export interface Shipment {
  shipment_id: string;
  origin: string;
  destination: string;
  distance_km: number;
  transit_hours: number;
  avg_temperature: number;
  temp_variance: number;
  humidity: number;
  goods_type: string;
  vehicle_age: number;
  weather_severity: number;
  delay_history: number;
  spoilage_flag?: number;
  risk_score?: number;
  risk_level?: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'In Transit' | 'Pending' | 'Delivered' | 'At Risk' | 'Assigned' | 'Salvaged';
  assigned_driver_id?: string | null;
}

export interface Driver {
  driver_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  current_location: string;
  status: 'Available' | 'On Route' | 'Maintenance' | 'Off Duty';
  assigned_shipments: string[];
}

export interface Business {
  business_id: string;
  name: string;
  location: string;
  contact: string;
  accepts_goods_type: string[];
  rating: number;
}

export interface DialogueTurn {
  speaker: string;
  timestamp: string;
  message: string;
  tone?: string;
}

export interface SimulateCallResponse {
  call_id: string;
  business_id: string;
  business_name: string;
  shipment_id: string;
  goods_type: string;
  discount_percent: number;
  deal_closed: boolean;
  estimated_recovery_usd: number;
  transcript: DialogueTurn[];
}

export interface RouteOption {
  route_name: string;
  route_type: string;
  distance_km: number;
  transit_hours: number;
  carbon_kg: number;
  cost_usd: number;
  risk_score: number;
  risk_level: string;
  waypoints: string[];
  description: string;
}

export interface FeatureContribution {
  feature: string;
  value: number;
  contribution_score: number;
  direction: 'increases_risk' | 'decreases_risk';
  explanation: string;
}

export interface AnalyzeShipmentResponse {
  shipment_id: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  explanation_breakdown: FeatureContribution[];
  summary: string;
}

export interface SavingsState {
  fuelSavedGal: number;
  co2ReducedTon: number;
  spoilageAvoidedUsd: number;
}
