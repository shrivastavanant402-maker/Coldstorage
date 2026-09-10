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

async def fetch_weather_for_location(location_name: str) -> WeatherResponse:
    cleaned = location_name.lower().split(",")[0].strip()
    coords = CITY_COORDINATES.get(cleaned)

    if coords:
        lat, lon = coords
        url = f"{OPEN_METEO_BASE_URL}?latitude={lat}&longitude={lon}&current_weather=true&hourly=relative_humidity_2m"
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
                    humidity = 65.0
                    if "hourly" in data and "relative_humidity_2m" in data["hourly"]:
                        h_arr = data["hourly"]["relative_humidity_2m"]
                        humidity = float(h_arr[0]) if h_arr else 65.0

                    severity = round(min(5.0, max(1.0, 1.0 + (abs(temp - 4.0) / 12.0) + (wind / 30.0))), 1)
                    return WeatherResponse(
                        location=location_name,
                        temperature=round(temp, 1),
                        humidity=round(humidity, 1),
                        condition=condition,
                        weather_severity=severity,
                        wind_speed=round(wind, 1),
                        source="Open-Meteo Live API"
                    )
        except Exception:
            pass

    # Mock weather generator
    seed = sum(ord(c) for c in location_name)
    rng = random.Random(seed)
    temp = round(rng.uniform(16.0, 36.0), 1)
    humidity = round(rng.uniform(50.0, 88.0), 1)
    wind = round(rng.uniform(6.0, 24.0), 1)
    conditions = ["Clear Sky", "Scattered Clouds", "Light Drizzle", "Dense Fog", "Warm & Humid"]
    condition = rng.choice(conditions)
    severity = round(rng.uniform(1.2, 3.8), 1)

    return WeatherResponse(
        location=location_name,
        temperature=temp,
        humidity=humidity,
        condition=condition,
        weather_severity=severity,
        wind_speed=wind,
        source="Mock Weather Generator"
    )
