from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# --- Core Entities ---

class Shipment(BaseModel):
    shipment_id: str
    origin: str
    destination: str
    distance_km: float
    transit_hours: float
    avg_temperature: float
    temp_variance: float
    humidity: float
    goods_type: str
    vehicle_age: float
    weather_severity: float
    delay_history: float
    spoilage_flag: Optional[int] = 0
    assigned_driver_id: Optional[str] = None
    status: Optional[str] = "Pending"

class Driver(BaseModel):
    driver_id: str
    name: str
    phone: str
    vehicle_type: str
    current_location: str
    status: str
    assigned_shipments: List[str] = []

class Business(BaseModel):
    business_id: str
    name: str
    location: str
    contact: str
    accepts_goods_type: List[str]
    rating: float

# --- Request / Response Schemas ---

class FeatureContribution(BaseModel):
    feature: str
    value: float
    contribution_score: float
    direction: str
    explanation: str

class AnalyzeShipmentRequest(BaseModel):
    shipment_id: Optional[str] = "SHP-TEMP"
    origin: Optional[str] = "Chicago, IL"
    destination: Optional[str] = "Atlanta, GA"
    distance_km: float
    transit_hours: float
    avg_temperature: float
    temp_variance: float
    humidity: float
    goods_type: str
    vehicle_age: float
    weather_severity: float
    delay_history: Optional[float] = 0.0

class AnalyzeShipmentResponse(BaseModel):
    shipment_id: str
    risk_score: float
    risk_level: str
    confidence: float
    explanation_breakdown: List[FeatureContribution]
    summary: str
    eta_hours: float = 0.0
    time_to_spoilage_hours: float = 0.0

class OptimizeRouteRequest(BaseModel):
    origin: str
    destination: str
    goods_type: str
    vehicle_type: str

class RouteOption(BaseModel):
    route_name: str
    route_type: str
    distance_km: float
    transit_hours: float
    carbon_kg: float
    cost_usd: float
    risk_score: float
    risk_level: str
    waypoints: List[Dict[str, float]]
    description: str

class OptimizeRouteResponse(BaseModel):
    origin: str
    destination: str
    goods_type: str
    vehicle_type: str
    routes: List[RouteOption]

class PredictSpoilageResponse(BaseModel):
    total_records: int
    train_records: int
    test_records: int
    model_metrics: Dict[str, Any]
    feature_importance: Dict[str, float]
    sample_predictions: List[Dict[str, Any]]

class SingleShipmentSpoilageResponse(BaseModel):
    shipment_id: str
    spoilage_probability: float
    time_to_spoilage_hrs: float
    estimated_loss_usd: float
    risk_level: str

class AssignShipmentRequest(BaseModel):
    shipment_id: str
    driver_id: str

class AssignShipmentResponse(BaseModel):
    success: bool
    message: str
    shipment_id: str
    driver_id: str
    driver_name: str
    driver_status: str

class SimulateCallRequest(BaseModel):
    business_id: str
    shipment_id: str
    discount_percent: float

class DialogueTurn(BaseModel):
    speaker: str
    timestamp: str
    message: str
    tone: str

class SimulateCallResponse(BaseModel):
    call_id: str
    business_id: str
    business_name: str
    shipment_id: str
    goods_type: str
    discount_percent: float
    deal_closed: bool
    estimated_recovery_usd: float
    transcript: List[DialogueTurn]

class WeatherResponse(BaseModel):
    location: str
    temperature: float
    humidity: float
    condition: str
    weather_severity: float
    wind_speed: float
    source: str
    alerts: List[str] = []
