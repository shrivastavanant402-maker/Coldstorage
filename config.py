import os

# Provided Cesium Ion Token
CESIUM_ION_TOKEN = os.getenv(
    "CESIUM_ION_TOKEN",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlZtVUVMNGVZQW1KVzd2NXkiLCJqdGkiOiI0NjZkNzg2NC1kYTJmLTQzNzUtOGI4Yi1lYjJhZmI0ODdkNzkiLCJpZCI6NDg2MTY1LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODkwMDQxNTJ9.m26bOjh6TQIoNobSNjpRWYpWLNw2XKmbbxXj3riwNug"
)

# Open-Meteo Weather API Base URL
OPEN_METEO_BASE_URL = os.getenv(
    "OPEN_METEO_BASE_URL",
    "https://api.open-meteo.com/v1/forecast"
)

# Routing & Geo Service Key
GEO_ROUTING_KEY = os.getenv(
    "GEO_ROUTING_KEY",
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVlZmNlMjExODYwMzRiMjk4NjdjMjE0ODRhYjRiMjFiIiwiaCI6Im11cm11cjY0In0="
)

# Server Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = ["*"]
