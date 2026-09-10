from typing import List
from models import RouteOption
from ml_service import ColdChainRiskModel

VEHICLE_EMISSION_FACTORS = {
    "Refrigerated Semi-Trailer": {"co2_per_km": 0.95, "base_cost_km": 2.40, "age": 3.0},
    "Cryogenic Pharma Van": {"co2_per_km": 0.65, "base_cost_km": 3.10, "age": 1.5},
    "Multi-Temperature Reefer": {"co2_per_km": 0.88, "base_cost_km": 2.65, "age": 4.0},
    "Refrigerated Sprinter Van": {"co2_per_km": 0.45, "base_cost_km": 1.80, "age": 2.0},
    "Heavy-Duty Cold Hauler": {"co2_per_km": 1.10, "base_cost_km": 2.85, "age": 5.0}
}

DEFAULT_VEHICLE = {"co2_per_km": 0.85, "base_cost_km": 2.50, "age": 3.5}

def calculate_base_distance(origin: str, dest: str) -> float:
    hash_val = abs(hash(f"{origin}->{dest}")) % 1200
    return round(600.0 + hash_val, 1)

def generate_route_options(
    origin: str,
    destination: str,
    goods_type: str,
    vehicle_type: str,
    ml_model: ColdChainRiskModel
) -> List[RouteOption]:
    base_dist = calculate_base_distance(origin, destination)
    v_params = VEHICLE_EMISSION_FACTORS.get(vehicle_type, DEFAULT_VEHICLE)

    # Route 1: Express Highway Route
    dist_1 = round(base_dist * 0.98, 1)
    time_1 = round(dist_1 / 85.0, 1)
    co2_1 = round(dist_1 * v_params["co2_per_km"], 1)
    cost_1 = round((dist_1 * v_params["base_cost_km"]) + (time_1 * 28.0), 2)
    features_1 = {
        'distance_km': dist_1,
        'transit_hours': time_1,
        'avg_temperature': 4.8,
        'temp_variance': 2.1,
        'humidity': 62.0,
        'vehicle_age': v_params["age"],
        'weather_severity': 2.6
    }
    risk_1, level_1, _, _ = ml_model.predict_risk(features_1)

    route_1 = RouteOption(
        route_name="Interstate High-Speed Express",
        route_type="Fastest Express",
        distance_km=dist_1,
        transit_hours=time_1,
        carbon_kg=co2_1,
        cost_usd=cost_1,
        risk_score=risk_1,
        risk_level=level_1,
        waypoints=[origin, "High-Speed Logistics Bypass", destination],
        description="Priority freight lanes. Shortest transit duration, ideal for immediate deliveries with active telemetry."
    )

    # Route 2: Cold-Chain Eco Corridor
    dist_2 = round(base_dist * 1.05, 1)
    time_2 = round(dist_2 / 72.0, 1)
    co2_2 = round(dist_2 * (v_params["co2_per_km"] * 0.78), 1)
    cost_2 = round((dist_2 * (v_params["base_cost_km"] * 0.90)) + (time_2 * 24.0), 2)
    features_2 = {
        'distance_km': dist_2,
        'transit_hours': time_2,
        'avg_temperature': 3.6,
        'temp_variance': 0.8,
        'humidity': 60.0,
        'vehicle_age': v_params["age"],
        'weather_severity': 1.4
    }
    risk_2, level_2, _, _ = ml_model.predict_risk(features_2)

    route_2 = RouteOption(
        route_name="Greenway Cold-Chain Eco Spine",
        route_type="Cold-Chain Eco Corridor",
        distance_km=dist_2,
        transit_hours=time_2,
        carbon_kg=co2_2,
        cost_usd=cost_2,
        risk_score=risk_2,
        risk_level=level_2,
        waypoints=[origin, "Low-Thermal Valley Corridor", "Cold Storage Rest Node", destination],
        description="Low ambient temperature corridor avoiding heat-island zones and urban traffic delays."
    )

    # Route 3: Balanced Commercial Route
    dist_3 = round(base_dist * 1.01, 1)
    time_3 = round(dist_3 / 78.0, 1)
    co2_3 = round(dist_3 * (v_params["co2_per_km"] * 0.91), 1)
    cost_3 = round((dist_3 * (v_params["base_cost_km"] * 0.82)) + (time_3 * 22.0), 2)
    features_3 = {
        'distance_km': dist_3,
        'transit_hours': time_3,
        'avg_temperature': 4.1,
        'temp_variance': 1.4,
        'humidity': 65.0,
        'vehicle_age': v_params["age"],
        'weather_severity': 2.0
    }
    risk_3, level_3, _, _ = ml_model.predict_risk(features_3)

    route_3 = RouteOption(
        route_name="Standard Commercial Highway",
        route_type="Balanced Commercial",
        distance_km=dist_3,
        transit_hours=time_3,
        carbon_kg=co2_3,
        cost_usd=cost_3,
        risk_score=risk_3,
        risk_level=level_3,
        waypoints=[origin, "State Central Freight Depot", destination],
        description="Economical routing avoiding peak tolls while maintaining compliant refrigeration metrics."
    )

    return [route_1, route_2, route_3]
