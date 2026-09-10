import math
import random
from typing import List, Dict
from models import RouteOption
from ml_service import ColdChainRiskModel

# Lookup table of approximate city center coordinates (lat, lng)
CITY_COORDINATES: Dict[str, Dict[str, float]] = {
    "mumbai": {"lat": 19.0760, "lng": 72.8777},
    "delhi": {"lat": 28.7041, "lng": 77.1025},
    "bengaluru": {"lat": 12.9716, "lng": 77.5946},
    "bangalore": {"lat": 12.9716, "lng": 77.5946},
    "chennai": {"lat": 13.0827, "lng": 80.2707},
    "hyderabad": {"lat": 17.3850, "lng": 78.4867},
    "nagpur": {"lat": 21.1458, "lng": 79.0882},
    "kolkata": {"lat": 22.5726, "lng": 88.3639},
    "patna": {"lat": 25.5941, "lng": 85.1376},
    "chicago": {"lat": 41.8781, "lng": -87.6298},
    "atlanta": {"lat": 33.7490, "lng": -84.3880},
    "dallas": {"lat": 32.7767, "lng": -96.7970},
    "denver": {"lat": 39.7392, "lng": -104.9903},
    "los angeles": {"lat": 34.0522, "lng": -118.2437},
    "seattle": {"lat": 47.6062, "lng": -122.3321},
    "miami": {"lat": 25.7617, "lng": -80.1918},
    "charlotte": {"lat": 35.2271, "lng": -80.8431},
    "new york": {"lat": 40.7128, "lng": -74.0060},
    "boston": {"lat": 42.3601, "lng": -71.0589},
}

def resolve_coordinates(city_name: str) -> Dict[str, float]:
    """
    Resolve city string to {lat, lng}.
    Falls back gracefully to a hash-based coordinate box if unknown. Never crashes.
    """
    clean = city_name.strip().lower()

    # 1. Exact match
    if clean in CITY_COORDINATES:
        return CITY_COORDINATES[clean]

    # 2. Substring matching (e.g. "mumbai, india" -> "mumbai", "new york, ny" -> "new york")
    for known_city, coords in CITY_COORDINATES.items():
        if known_city in clean:
            return coords

    # 3. Comma-separated token match
    parts = [p.strip() for p in clean.split(",") if p.strip()]
    for part in parts:
        if part in CITY_COORDINATES:
            return CITY_COORDINATES[part]

    # 4. Graceful fallback: generate plausible deterministic coordinates from hash
    h = abs(hash(clean))
    lat = round(15.0 + (h % 3000) / 100.0, 4)
    lng = round(-100.0 + ((h // 3000) % 20000) / 100.0, 4)
    return {"lat": lat, "lng": lng}

def generate_curved_waypoints(
    origin_coords: Dict[str, float],
    dest_coords: Dict[str, float],
    curve_factor: float,
    num_points: int = 5
) -> List[Dict[str, float]]:
    """
    Generates num_points waypoints starting at origin_coords and ending at dest_coords.
    Intermediate points are interpolated with a perpendicular sinusoidal offset
    governed by curve_factor so that alternate corridors render as distinct arcs.
    """
    lat1, lng1 = origin_coords["lat"], origin_coords["lng"]
    lat2, lng2 = dest_coords["lat"], dest_coords["lng"]

    d_lat = lat2 - lat1
    d_lng = lng2 - lng1
    chord = math.hypot(d_lat, d_lng)
    if chord < 1e-4:
        chord = 0.05

    # Perpendicular unit vector
    perp_lat = -d_lng / chord
    perp_lng = d_lat / chord

    waypoints: List[Dict[str, float]] = []

    for i in range(num_points):
        t = i / (num_points - 1)
        if i == 0:
            waypoints.append({"lat": round(lat1, 4), "lng": round(lng1, 4)})
        elif i == num_points - 1:
            waypoints.append({"lat": round(lat2, 4), "lng": round(lng2, 4)})
        else:
            base_lat = lat1 + t * d_lat
            base_lng = lng1 + t * d_lng
            # Sinusoidal displacement peaking around the midpoint
            arch = math.sin(t * math.pi)
            offset = arch * curve_factor * chord
            wp_lat = round(base_lat + (offset * perp_lat), 4)
            wp_lng = round(base_lng + (offset * perp_lng), 4)
            waypoints.append({"lat": wp_lat, "lng": wp_lng})

    return waypoints

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

    orig_coords = resolve_coordinates(origin)
    dest_coords = resolve_coordinates(destination)

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

    waypoints_1 = generate_curved_waypoints(orig_coords, dest_coords, curve_factor=0.06, num_points=5)

    route_1 = RouteOption(
        route_name="Interstate High-Speed Express",
        route_type="Fastest Express",
        distance_km=dist_1,
        transit_hours=time_1,
        carbon_kg=co2_1,
        cost_usd=cost_1,
        risk_score=risk_1,
        risk_level=level_1,
        waypoints=waypoints_1,
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
    waypoints_2 = generate_curved_waypoints(orig_coords, dest_coords, curve_factor=0.22, num_points=5)

    route_2 = RouteOption(
        route_name="Greenway Cold-Chain Eco Spine",
        route_type="Cold-Chain Eco Corridor",
        distance_km=dist_2,
        transit_hours=time_2,
        carbon_kg=co2_2,
        cost_usd=cost_2,
        risk_score=risk_2,
        risk_level=level_2,
        waypoints=waypoints_2,
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
    waypoints_3 = generate_curved_waypoints(orig_coords, dest_coords, curve_factor=-0.18, num_points=5)

    route_3 = RouteOption(
        route_name="Standard Commercial Highway",
        route_type="Balanced Commercial",
        distance_km=dist_3,
        transit_hours=time_3,
        carbon_kg=co2_3,
        cost_usd=cost_3,
        risk_score=risk_3,
        risk_level=level_3,
        waypoints=waypoints_3,
        description="Economical routing avoiding peak tolls while maintaining compliant refrigeration metrics."
    )

    return [route_1, route_2, route_3]
