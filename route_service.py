import math
import random
from typing import List, Dict, Any, Optional
import httpx
from models import RouteOption
from ml_service import ColdChainRiskModel
from weather_service import fetch_weather_for_location

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
            waypoints.append({"lat": round(lat1, 5), "lng": round(lng1, 5)})
        elif i == num_points - 1:
            waypoints.append({"lat": round(lat2, 5), "lng": round(lng2, 5)})
        else:
            base_lat = lat1 + t * d_lat
            base_lng = lng1 + t * d_lng
            arch = math.sin(t * math.pi)
            offset = arch * curve_factor * chord
            wp_lat = round(base_lat + (offset * perp_lat), 5)
            wp_lng = round(base_lng + (offset * perp_lng), 5)
            waypoints.append({"lat": wp_lat, "lng": wp_lng})

    return waypoints

async def get_road_route(
    origin_coords: Dict[str, float],
    dest_coords: Dict[str, float]
) -> List[Dict[str, Any]]:
    """
    Calls OSRM public demo server to retrieve real road-snapped geometry.
    Note: OSRM takes {orig_lng},{orig_lat};{dest_lng},{dest_lat} order.
    Returns up to 3 alternative routes with {distance_km, transit_hours, waypoints}.
    """
    orig_lng = origin_coords.get("lng", 0.0)
    orig_lat = origin_coords.get("lat", 0.0)
    dest_lng = dest_coords.get("lng", 0.0)
    dest_lat = dest_coords.get("lat", 0.0)

    url = (
        f"http://router.project-osrm.org/route/v1/driving/"
        f"{orig_lng},{orig_lat};{dest_lng},{dest_lat}"
        f"?alternatives=true&geometries=geojson&overview=full"
    )

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    routes_out = []
                    for r in data["routes"][:3]:
                        dist_m = float(r.get("distance", 0.0))
                        dur_s = float(r.get("duration", 0.0))
                        coords_raw = r.get("geometry", {}).get("coordinates", [])
                        waypoints = [
                            {"lat": round(float(pt[1]), 5), "lng": round(float(pt[0]), 5)}
                            for pt in coords_raw
                        ]
                        routes_out.append({
                            "distance_km": round(dist_m / 1000.0, 1),
                            "transit_hours": round(dur_s / 3600.0, 1),
                            "waypoints": waypoints,
                            "raw_duration": dur_s,
                            "raw_distance": dist_m,
                        })
                    return routes_out
    except Exception as e:
        print(f"[OSRM] Notice: Road route lookup failed ({e}), falling back to synthetic curves.")

    return []

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

async def generate_route_options(
    origin: str,
    destination: str,
    goods_type: str,
    vehicle_type: str,
    ml_model: ColdChainRiskModel
) -> List[RouteOption]:
    """
    Generates 3 optimized cold-chain corridors using real OSRM road geometry,
    live weather severity, and ML-driven risk profiles.
    """
    orig_coords = resolve_coordinates(origin)
    dest_coords = resolve_coordinates(destination)
    v_params = VEHICLE_EMISSION_FACTORS.get(vehicle_type, DEFAULT_VEHICLE)

    # 1. Fetch live weather severity for origin & destination
    try:
        orig_w = await fetch_weather_for_location(origin)
        dest_w = await fetch_weather_for_location(destination)
        weather_severity = round(max(orig_w.weather_severity, dest_w.weather_severity), 1)
    except Exception:
        weather_severity = 2.0

    # 2. Goods-specific sensitivity profile
    GOODS_PROFILES = {
        "Vaccines": {"target_temp": 3.4, "base_variance": 0.8, "humidity": 55.0, "risk_mult": 1.25},
        "Biopharmaceuticals": {"target_temp": 3.0, "base_variance": 0.7, "humidity": 50.0, "risk_mult": 1.30},
        "Frozen Seafood": {"target_temp": -18.0, "base_variance": 1.5, "humidity": 70.0, "risk_mult": 1.15},
        "Prime Cut Meat": {"target_temp": 1.5, "base_variance": 1.2, "humidity": 65.0, "risk_mult": 1.10},
        "Dairy Products": {"target_temp": 3.8, "base_variance": 1.4, "humidity": 68.0, "risk_mult": 1.05},
        "Fresh Produce": {"target_temp": 5.2, "base_variance": 1.8, "humidity": 80.0, "risk_mult": 1.00},
    }
    goods_prof = GOODS_PROFILES.get(
        goods_type,
        {"target_temp": 4.0, "base_variance": 1.2, "humidity": 62.0, "risk_mult": 1.0}
    )

    # 3. Call OSRM public demo server for real road routes (timeout 4s)
    osrm_routes = await get_road_route(orig_coords, dest_coords)

    # 4. Assemble up to 3 candidate routes
    candidates: List[Dict[str, Any]] = []
    if osrm_routes:
        # Use available OSRM road routes
        for i, r in enumerate(osrm_routes):
            candidates.append({
                "distance_km": r["distance_km"],
                "transit_hours": r["transit_hours"],
                "waypoints": r["waypoints"],
                "is_osrm": True,
                "variant_index": i
            })

        primary = osrm_routes[0]
        # Synthesize remaining slots if OSRM returned fewer than 3 alternatives
        if len(candidates) == 1:
            candidates.append({
                "distance_km": round(primary["distance_km"] * 1.06, 1),
                "transit_hours": round(primary["transit_hours"] * 1.12, 1),
                "waypoints": generate_curved_waypoints(orig_coords, dest_coords, curve_factor=0.18, num_points=25),
                "is_osrm": False,
                "variant_index": 1
            })
            candidates.append({
                "distance_km": round(primary["distance_km"] * 1.02, 1),
                "transit_hours": round(primary["transit_hours"] * 1.05, 1),
                "waypoints": generate_curved_waypoints(orig_coords, dest_coords, curve_factor=-0.14, num_points=25),
                "is_osrm": False,
                "variant_index": 2
            })
        elif len(candidates) == 2:
            candidates.append({
                "distance_km": round(primary["distance_km"] * 1.04, 1),
                "transit_hours": round(primary["transit_hours"] * 1.08, 1),
                "waypoints": generate_curved_waypoints(orig_coords, dest_coords, curve_factor=-0.15, num_points=25),
                "is_osrm": False,
                "variant_index": 2
            })
    else:
        # Complete fallback to synthetic curves if OSRM failed completely
        base_dist = calculate_base_distance(origin, destination)
        candidates = [
            {
                "distance_km": round(base_dist * 0.98, 1),
                "transit_hours": round(base_dist * 0.98 / 85.0, 1),
                "waypoints": generate_curved_waypoints(orig_coords, dest_coords, curve_factor=0.06, num_points=5),
                "is_osrm": False,
                "variant_index": 0
            },
            {
                "distance_km": round(base_dist * 1.05, 1),
                "transit_hours": round(base_dist * 1.05 / 72.0, 1),
                "waypoints": generate_curved_waypoints(orig_coords, dest_coords, curve_factor=0.22, num_points=5),
                "is_osrm": False,
                "variant_index": 1
            },
            {
                "distance_km": round(base_dist * 1.01, 1),
                "transit_hours": round(base_dist * 1.01 / 78.0, 1),
                "waypoints": generate_curved_waypoints(orig_coords, dest_coords, curve_factor=-0.18, num_points=5),
                "is_osrm": False,
                "variant_index": 2
            }
        ]

    # 5. Evaluate ML risk score for each candidate factoring in weather and variance
    for c in candidates:
        idx = c.get("variant_index", 0)
        # Thermal variance modifier: eco detour avoids urban heat islands, express has open highway speeds
        var_factor = 0.75 if idx == 1 else (1.10 if idx == 0 else 0.92)
        variance = round(goods_prof["base_variance"] * var_factor, 2)

        feat = {
            'distance_km': c["distance_km"],
            'transit_hours': c["transit_hours"],
            'avg_temperature': round(goods_prof["target_temp"] + (weather_severity * 0.25), 1),
            'temp_variance': variance,
            'humidity': goods_prof["humidity"],
            'vehicle_age': v_params["age"],
            'weather_severity': weather_severity
        }
        r_score, r_level, _, _ = ml_model.predict_risk(feat)
        adjusted_score = round(min(98.0, max(5.0, r_score * goods_prof["risk_mult"])), 1)
        c["risk_score"] = adjusted_score
        c["risk_level"] = r_level

    # 6. Classification rule (Requirement 6):
    # - Shortest OSRM duration becomes Fastest Express
    # - Lowest weather-adjusted risk becomes Eco Corridor
    # - Remaining route becomes Balanced Commercial
    sorted_by_duration = sorted(candidates, key=lambda x: (x["transit_hours"], x["distance_km"]))
    fastest = sorted_by_duration[0]

    remaining_for_eco = [x for x in candidates if x != fastest]
    if remaining_for_eco:
        remaining_for_eco.sort(key=lambda x: (x["risk_score"], x["transit_hours"]))
        eco = remaining_for_eco[0]
        balanced = [x for x in candidates if x != fastest and x != eco][0]
    else:
        eco = fastest
        balanced = fastest

    # Build final RouteOptions
    route_fastest = RouteOption(
        route_name="National Highway Express (Fastest)",
        route_type="Fastest Express",
        distance_km=fastest["distance_km"],
        transit_hours=fastest["transit_hours"],
        carbon_kg=round(fastest["distance_km"] * v_params["co2_per_km"] * 1.02, 1),
        cost_usd=round((fastest["distance_km"] * v_params["base_cost_km"] * 1.05) + (fastest["transit_hours"] * 30.0), 2),
        risk_score=fastest["risk_score"],
        risk_level=fastest["risk_level"],
        waypoints=fastest["waypoints"],
        description="Fastest road routing via primary national expressways. Minimizes transit duration, ideal for time-critical deliveries."
    )

    route_eco = RouteOption(
        route_name="Greenway Cold-Chain Eco Spine",
        route_type="Cold-Chain Eco Corridor",
        distance_km=eco["distance_km"],
        transit_hours=eco["transit_hours"],
        carbon_kg=round(eco["distance_km"] * v_params["co2_per_km"] * 0.78, 1),
        cost_usd=round((eco["distance_km"] * v_params["base_cost_km"] * 0.88) + (eco["transit_hours"] * 24.0), 2),
        risk_score=eco["risk_score"],
        risk_level=eco["risk_level"],
        waypoints=eco["waypoints"],
        description="Lowest thermal risk corridor avoiding intense weather severity zones and heat islands to preserve cargo integrity."
    )

    route_balanced = RouteOption(
        route_name="Commercial Arterial Highway",
        route_type="Balanced Commercial",
        distance_km=balanced["distance_km"],
        transit_hours=balanced["transit_hours"],
        carbon_kg=round(balanced["distance_km"] * v_params["co2_per_km"] * 0.90, 1),
        cost_usd=round((balanced["distance_km"] * v_params["base_cost_km"] * 0.95) + (balanced["transit_hours"] * 26.0), 2),
        risk_score=balanced["risk_score"],
        risk_level=balanced["risk_level"],
        waypoints=balanced["waypoints"],
        description="Balanced logistics corridor optimizing freight cost, toll avoidance, and standard refrigeration margins."
    )

    return [route_fastest, route_eco, route_balanced]

