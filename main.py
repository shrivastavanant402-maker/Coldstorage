import io
import datetime
from typing import List, Optional
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, CESIUM_ION_TOKEN
from models import (
    Shipment, Driver, Business,
    AnalyzeShipmentRequest, AnalyzeShipmentResponse,
    OptimizeRouteRequest, OptimizeRouteResponse,
    PredictSpoilageResponse, SingleShipmentSpoilageResponse,
    AssignShipmentRequest, AssignShipmentResponse,
    SimulateCallRequest, SimulateCallResponse, DialogueTurn,
    WeatherResponse
)
from mock_data import generate_mock_shipments, generate_mock_drivers, generate_mock_businesses
from ml_service import ColdChainRiskModel, FEATURE_COLS
from route_service import generate_route_options
from weather_service import fetch_weather_for_location

# Initialize FastAPI application
app = FastAPI(
    title="ColdChain AI Platform API",
    description="High-fidelity cold-chain logistics risk prediction and route optimization platform.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory State & Model Registry
db_shipments: List[Shipment] = []
db_drivers: List[Driver] = []
db_businesses: List[Business] = []
ml_model = ColdChainRiskModel()

@app.on_event("startup")
def startup_event():
    global db_shipments, db_drivers, db_businesses, ml_model
    db_shipments = generate_mock_shipments(200)
    db_drivers = generate_mock_drivers()
    db_businesses = generate_mock_businesses()

    # Pre-train the Random Forest model on startup
    df = pd.DataFrame([s.dict() for s in db_shipments])
    ml_model.train_on_dataframe(df)
    print("ColdChain AI Platform Backend online.")
    print(f"Loaded {len(db_shipments)} shipments, {len(db_drivers)} drivers, {len(db_businesses)} businesses.")

# --- Endpoints ---

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "ColdChain AI Platform API",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "total_shipments": len(db_shipments),
        "cesium_configured": bool(CESIUM_ION_TOKEN)
    }

# 1. POST /api/analyze-shipment
@app.post("/api/analyze-shipment", response_model=AnalyzeShipmentResponse, tags=["Logistics Analytics"])
def analyze_shipment(req: AnalyzeShipmentRequest):
    features = {
        'distance_km': req.distance_km,
        'transit_hours': req.transit_hours,
        'avg_temperature': req.avg_temperature,
        'temp_variance': req.temp_variance,
        'humidity': req.humidity,
        'vehicle_age': req.vehicle_age,
        'weather_severity': req.weather_severity
    }
    risk_score, risk_level, confidence, explanation = ml_model.predict_risk(features)

    summary = (
        f"Shipment {req.shipment_id} ({req.goods_type}) has a {risk_level.upper()} spoilage risk of {risk_score}%. "
        f"Primary risk driver is {explanation[0].feature if explanation else 'ambient temperature'}."
    )

    return AnalyzeShipmentResponse(
        shipment_id=req.shipment_id or "SHP-PREDICT",
        risk_score=risk_score,
        risk_level=risk_level,
        confidence=confidence,
        explanation_breakdown=explanation,
        summary=summary
    )

# 2. POST /api/optimize-route
@app.post("/api/optimize-route", response_model=OptimizeRouteResponse, tags=["Route Optimization"])
def optimize_route(req: OptimizeRouteRequest):
    routes = generate_route_options(
        origin=req.origin,
        destination=req.destination,
        goods_type=req.goods_type,
        vehicle_type=req.vehicle_type,
        ml_model=ml_model
    )
    return OptimizeRouteResponse(
        origin=req.origin,
        destination=req.destination,
        goods_type=req.goods_type,
        vehicle_type=req.vehicle_type,
        routes=routes
    )

# 3. POST /api/predict-spoilage (CSV upload, trains RF, returns predictions)
@app.post("/api/predict-spoilage", response_model=PredictSpoilageResponse, tags=["ML Training"])
async def predict_spoilage(file: UploadFile = File(...)):
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    missing = [col for col in FEATURE_COLS if col not in df.columns]
    if missing:
        raise HTTPException(status_code=422, detail=f"CSV missing columns: {missing}")

    if 'spoilage_flag' not in df.columns:
        df['spoilage_flag'] = ((df['temp_variance'] > 2.5) | (df['transit_hours'] > 24)).astype(int)

    metrics = ml_model.train_on_dataframe(df)

    sample_preds = []
    for idx, row in df.head(10).iterrows():
        f_dict = {col: float(row[col]) for col in FEATURE_COLS}
        r_score, r_level, conf, _ = ml_model.predict_risk(f_dict)
        sample_preds.append({
            "row_index": idx,
            "shipment_id": str(row.get('shipment_id', f"CSV-{idx+1}")),
            "predicted_spoilage": int(r_score >= 50.0),
            "risk_score": r_score,
            "risk_level": r_level,
            "confidence": conf
        })

    return PredictSpoilageResponse(
        total_records=len(df),
        train_records=metrics["train_samples"],
        test_records=metrics["test_samples"],
        model_metrics=metrics,
        feature_importance=ml_model.feature_importance_,
        sample_predictions=sample_preds
    )

# 3b. GET /api/predict-spoilage/{shipment_id} (Instant live-demo per-shipment spoilage check)
GOODS_BASE_VALUES = {
    "Vaccines": 50000.0,
    "Biopharmaceuticals": 65000.0,
    "Frozen Seafood": 22000.0,
    "Prime Cut Meat": 18000.0,
    "Dairy Products": 12000.0,
    "Fresh Produce": 8000.0
}
DEFAULT_BASE_VALUE = 15000.0

@app.get("/api/predict-spoilage/{shipment_id}", response_model=SingleShipmentSpoilageResponse, tags=["Logistics Analytics"])
def predict_shipment_spoilage(shipment_id: str):
    shipment = next((s for s in db_shipments if s.shipment_id.upper() == shipment_id.upper()), None)
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment '{shipment_id}' not found.")

    features = {
        'distance_km': shipment.distance_km,
        'transit_hours': shipment.transit_hours,
        'avg_temperature': shipment.avg_temperature,
        'temp_variance': shipment.temp_variance,
        'humidity': shipment.humidity,
        'vehicle_age': shipment.vehicle_age,
        'weather_severity': shipment.weather_severity
    }
    risk_score, risk_level, confidence, _ = ml_model.predict_risk(features)

    # Spoilage probability (0.0 to 1.0)
    spoilage_prob = round(risk_score / 100.0, 3)

    # Time to spoilage in hours (higher risk = shorter buffer before spoilage)
    time_to_spoilage = max(1.5, round(48.0 * (1.0 - (risk_score / 100.0) ** 0.8), 1))

    # Estimated monetary loss based on cargo commodity base valuation
    base_val = GOODS_BASE_VALUES.get(shipment.goods_type, DEFAULT_BASE_VALUE)
    estimated_loss = round(base_val * (risk_score / 100.0), 2)

    return SingleShipmentSpoilageResponse(
        shipment_id=shipment.shipment_id,
        spoilage_probability=spoilage_prob,
        time_to_spoilage_hrs=time_to_spoilage,
        estimated_loss_usd=estimated_loss,
        risk_level=risk_level
    )

# 4. GET /api/weather/{location}
@app.get("/api/weather/{location}", response_model=WeatherResponse, tags=["Weather Service"])
async def get_weather(location: str):
    return await fetch_weather_for_location(location)

# 5. POST /api/assign-shipment
@app.post("/api/assign-shipment", response_model=AssignShipmentResponse, tags=["Fleet Operations"])
def assign_shipment(req: AssignShipmentRequest):
    shipment = next((s for s in db_shipments if s.shipment_id == req.shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment '{req.shipment_id}' not found.")

    driver = next((d for d in db_drivers if d.driver_id == req.driver_id), None)
    if not driver:
        raise HTTPException(status_code=404, detail=f"Driver '{req.driver_id}' not found.")

    shipment.assigned_driver_id = req.driver_id
    shipment.status = "Assigned"

    if req.shipment_id not in driver.assigned_shipments:
        driver.assigned_shipments.append(req.shipment_id)
    driver.status = "On Route"

    return AssignShipmentResponse(
        success=True,
        message=f"Shipment {req.shipment_id} successfully assigned to driver {driver.name}.",
        shipment_id=req.shipment_id,
        driver_id=driver.driver_id,
        driver_name=driver.name,
        driver_status=driver.status
    )

# 6. GET /api/drivers
@app.get("/api/drivers", response_model=List[Driver], tags=["Fleet Operations"])
def list_drivers():
    return db_drivers

# 7. GET /api/driver/{id}
@app.get("/api/driver/{id}", tags=["Fleet Operations"])
def get_driver_details(id: str):
    driver = next((d for d in db_drivers if d.driver_id == id), None)
    if not driver:
        raise HTTPException(status_code=404, detail=f"Driver '{id}' not found.")

    assigned = [s for s in db_shipments if s.shipment_id in driver.assigned_shipments]
    return {
        "driver": driver,
        "assigned_shipments_count": len(assigned),
        "shipments": assigned
    }

# 8. GET /api/nearby-businesses
@app.get("/api/nearby-businesses", response_model=List[Business], tags=["Emergency Liquidation"])
def get_nearby_businesses(
    location: str = Query(..., description="Location"),
    goods_type: str = Query(..., description="Goods type")
):
    matches = [b for b in db_businesses if goods_type in b.accepts_goods_type]
    if len(matches) < 3:
        for b in sorted(db_businesses, key=lambda x: x.rating, reverse=True):
            if b not in matches:
                matches.append(b)
            if len(matches) >= 3:
                break
    return matches[:3]

# 9. POST /api/simulate-call
@app.post("/api/simulate-call", response_model=SimulateCallResponse, tags=["Emergency Liquidation"])
def simulate_call(req: SimulateCallRequest):
    biz = next((b for b in db_businesses if b.business_id == req.business_id), db_businesses[0])
    shp = next((s for s in db_shipments if s.shipment_id == req.shipment_id), db_shipments[0])

    discount = max(5.0, min(80.0, req.discount_percent))
    deal_closed = discount >= 20.0
    estimated_base_value = 45000.0
    recovery_value = round(estimated_base_value * (1.0 - (discount / 100.0)), 2)

    now = datetime.datetime.now()
    t0 = now.strftime("%H:%M:%S")
    t1 = (now + datetime.timedelta(seconds=15)).strftime("%H:%M:%S")
    t2 = (now + datetime.timedelta(seconds=35)).strftime("%H:%M:%S")
    t3 = (now + datetime.timedelta(seconds=55)).strftime("%H:%M:%S")

    transcript = [
        DialogueTurn(
            speaker="ColdChain AI Dispatcher",
            timestamp=t0,
            message=f"Hello, this is ColdChain AI Emergency Desk calling {biz.name}. We have an active reefer carrier transporting certified {shp.goods_type} near your intake depot.",
            tone="Professional & Urgent"
        ),
        DialogueTurn(
            speaker=f"{biz.name} Intake Manager",
            timestamp=t1,
            message=f"Yes, our dock can receive cold pallet intake. What is the cargo condition and authorized discount for immediate cross-docking?",
            tone="Inquisitive"
        ),
        DialogueTurn(
            speaker="ColdChain AI Dispatcher",
            timestamp=t2,
            message=f"Cargo temperature is currently {shp.avg_temperature}°C with active telemetry. To expedite immediate unloading within 90 minutes, we offer an immediate {discount}% discount on manifest value.",
            tone="Negotiating"
        )
    ]

    if deal_closed:
        transcript.append(DialogueTurn(
            speaker=f"{biz.name} Intake Manager",
            timestamp=t3,
            message=f"A {discount}% price concession is accepted. Gate 3 is cleared for priority unloading. Divert carrier immediately.",
            tone="Agreed & Confirmed"
        ))
    else:
        transcript.append(DialogueTurn(
            speaker=f"{biz.name} Intake Manager",
            timestamp=t3,
            message=f"A {discount}% discount is insufficient to offset emergency intake costs. We would need at least 25% discount.",
            tone="Declined"
        ))

    return SimulateCallResponse(
        call_id=f"CALL-{abs(hash(req.shipment_id + req.business_id)) % 10000:04d}",
        business_id=biz.business_id,
        business_name=biz.name,
        shipment_id=shp.shipment_id,
        goods_type=shp.goods_type,
        discount_percent=discount,
        deal_closed=deal_closed,
        estimated_recovery_usd=recovery_value if deal_closed else 0.0,
        transcript=transcript
    )

@app.get("/api/shipments", response_model=List[Shipment], tags=["Logistics Analytics"])
def list_shipments(limit: int = 50, status: Optional[str] = None):
    results = db_shipments
    if status:
        results = [s for s in results if s.status.lower() == status.lower()]
    return results[:limit]
