from typing import List
import random
import httpx
from models import WeatherResponse
from config import OPEN_METEO_BASE_URL

CITY_COORDINATES = {
    "mumbai": (19.0760, 72.8777),
    "delhi": (28.7041, 77.1025),
    "bengaluru": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "hyderabad": (17.3850, 78.4867),
    "chicago": (41.8781, -87.6298),
    "atlanta": (33.7490, -84.3880),
    "dallas": (32.7767, -96.7970),
    "denver": (39.7392, -104.9903),
    "seattle": (47.6062, -122.3321)
}

WMO_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    51: "Light drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    95: "Thunderstorm"
}

def check_weather_alerts(rain: float, wind_speed: float, visibility: float, temp: float) -> List[str]:
    """
    Returns a list of triggered alert strings based on cold-chain thresholds:
    - rain >= 10 (mm/hr): "Heavy rain — cold-chain route delay risk"
    - wind_speed >= 15 (m/s, converted from km/h): "High wind — vehicle stability risk"
    - visibility < 1000 (meters): "Low visibility — driving hazard"
    - temp >= 40 or temp <= 0: "Extreme temperature — cargo risk"
    """
    alerts: List[str] = []
    if rain >= 10.0:
        alerts.append("Heavy rain — cold-chain route delay risk")
    if wind_speed >= 15.0:
        alerts.append("High wind — vehicle stability risk")
    if visibility < 1000.0:
        alerts.append("Low visibility — driving hazard")
    if temp >= 40.0 or temp <= 0.0:
        alerts.append("Extreme temperature — cargo risk")
    return alerts

async def fetch_weather_for_location(location_name: str) -> WeatherResponse:
    cleaned = location_name.lower().split(",")[0].strip()
    coords = CITY_COORDINATES.get(cleaned)

    if coords:
        lat, lon = coords
        url = f"{OPEN_METEO_BASE_URL}?latitude={lat}&longitude={lon}&current_weather=true&hourly=relative_humidity_2m,rain,wind_speed_10m,visibility"
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    curr = data.get("current_weather", {})
                    temp = curr.get("temperature", 22.0)
                    wind = curr.get("windspeed", 12.0)
                    w_code = curr.get("weathercode", 1)
                    condition = WMO_CODE_MAP.get(w_code, "Partly cloudy")

                    hourly = data.get("hourly", {})

                    humidity = 65.0
                    if "relative_humidity_2m" in hourly and hourly["relative_humidity_2m"]:
                        humidity = float(hourly["relative_humidity_2m"][0])

                    rain = 0.0
                    if "rain" in hourly and hourly["rain"]:
                        rain = float(hourly["rain"][0])

                    wind_speed_kmh = wind
                    if "wind_speed_10m" in hourly and hourly["wind_speed_10m"]:
                        wind_speed_kmh = float(hourly["wind_speed_10m"][0])

                    visibility = 10000.0
                    if "visibility" in hourly and hourly["visibility"]:
                        visibility = float(hourly["visibility"][0])

                    wind_speed_ms = wind_speed_kmh / 3.6
                    alerts = check_weather_alerts(rain=rain, wind_speed=wind_speed_ms, visibility=visibility, temp=temp)

                    severity = round(min(5.0, max(1.0, 1.0 + (abs(temp - 4.0) / 12.0) + (wind_speed_kmh / 30.0))), 1)
                    return WeatherResponse(
                        location=location_name,
                        temperature=round(temp, 1),
                        humidity=round(humidity, 1),
                        condition=condition,
                        weather_severity=severity,
                        wind_speed=round(wind_speed_kmh, 1),
                        source="Open-Meteo Live API",
                        alerts=alerts
                    )
        except Exception:
            pass

    # Mock weather generator
    seed = sum(ord(c) for c in location_name)
    rng = random.Random(seed)

    is_severe = any(k in location_name.lower() for k in ["severe", "storm", "cyclone", "blizzard", "hazard", "extreme", "warning", "freeze", "heatwave", "danger"])

    if is_severe:
        temp = 43.5 if "heat" in location_name.lower() else -5.0 if any(k in location_name.lower() for k in ["freeze", "blizzard", "ice"]) else round(rng.uniform(40.5, 45.0), 1)
        humidity = round(rng.uniform(85.0, 98.0), 1)
        wind_kmh = round(rng.uniform(55.0, 75.0), 1)
        wind_ms = round(wind_kmh / 3.6, 1)
        rain = round(rng.uniform(12.0, 25.0), 1)
        visibility = round(rng.uniform(300.0, 750.0), 1)
        condition = "Severe Storm"
        severity = round(rng.uniform(4.5, 5.0), 1)
    else:
        temp = round(rng.uniform(16.0, 36.0), 1)
        humidity = round(rng.uniform(50.0, 88.0), 1)
        wind_kmh = round(rng.uniform(6.0, 24.0), 1)
        wind_ms = round(wind_kmh / 3.6, 1)
        conditions = ["Clear Sky", "Scattered Clouds", "Light Drizzle", "Dense Fog", "Warm & Humid"]
        condition = rng.choice(conditions)
        severity = round(rng.uniform(1.2, 3.8), 1)

        if condition == "Dense Fog":
            visibility = round(rng.uniform(400.0, 850.0), 1)
            rain = 0.0
        elif condition == "Light Drizzle":
            visibility = round(rng.uniform(4000.0, 8000.0), 1)
            rain = round(rng.uniform(1.0, 4.0), 1)
        else:
            visibility = round(rng.uniform(8000.0, 15000.0), 1)
            rain = 0.0

    alerts = check_weather_alerts(rain=rain, wind_speed=wind_ms, visibility=visibility, temp=temp)

    return WeatherResponse(
        location=location_name,
        temperature=temp,
        humidity=humidity,
        condition=condition,
        weather_severity=severity,
        wind_speed=wind_kmh,
        source="Mock Weather Generator",
        alerts=alerts
    )
