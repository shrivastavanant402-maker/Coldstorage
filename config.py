import os
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# Cesium Ion Token loaded from environment
CESIUM_ION_TOKEN = os.getenv("CESIUM_ION_TOKEN")
if not CESIUM_ION_TOKEN:
    print("WARNING: CESIUM_ION_TOKEN not set in environment")

# Open-Meteo Weather API Base URL
OPEN_METEO_BASE_URL = os.getenv(
    "OPEN_METEO_BASE_URL",
    "https://api.open-meteo.com/v1/forecast"
)

# Server Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = ["*"]
