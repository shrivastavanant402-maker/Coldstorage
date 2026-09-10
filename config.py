import os
from dotenv import load_dotenv

# Load environment variables from .env file (with override=True so local .env takes precedence)
load_dotenv(override=True)

# Cesium Ion Token loaded from environment
CESIUM_ION_TOKEN = os.getenv("CESIUM_ION_TOKEN")
if not CESIUM_ION_TOKEN:
    print("WARNING: CESIUM_ION_TOKEN not set in environment")

# Open-Meteo Weather API Base URL
OPEN_METEO_BASE_URL = os.getenv(
    "OPEN_METEO_BASE_URL",
    "https://api.open-meteo.com/v1/forecast"
)

# Gemini API Configuration (Default to gemini-3.5-flash-lite for fast multimodal analysis)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
if not GEMINI_API_KEY:
    print("INFO: GEMINI_API_KEY not set in environment (using intelligent fallback evaluator for freshness)")

# Server Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = ["*"]

