import io
import base64
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
<<<<<<< Updated upstream
    AgentChatRequest, AgentChatResponse, AgentChatMessage,
    WeatherResponse
=======
    WeatherResponse, FreshnessCheckResponse
>>>>>>> Stashed changes
)
from mock_data import generate_mock_shipments, generate_mock_drivers, generate_mock_businesses
from ml_service import ColdChainRiskModel, FEATURE_COLS
from route_service import generate_route_options
from weather_service import fetch_weather_for_location
from freshness_service import analyze_freshness

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

    # ETA prediction needs delay_history in addition to standard features
    eta_features = {**features, 'delay_history': req.delay_history or 0.0}
    eta_hours = ml_model.predict_eta_hours(eta_features)

    # Time-to-spoilage prediction uses goods_type for temperature tolerance lookup
    spoilage_hours = ml_model.predict_time_to_spoilage_hours(features, goods_type=req.goods_type)

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
        summary=summary,
        eta_hours=eta_hours,
        time_to_spoilage_hours=spoilage_hours
    )

# 2. POST /api/optimize-route
@app.post("/api/optimize-route", response_model=OptimizeRouteResponse, tags=["Route Optimization"])
async def optimize_route(req: OptimizeRouteRequest):
    routes = await generate_route_options(
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


# 10. POST /api/agent-chat  — Interactive voice negotiation agent
@app.post("/api/agent-chat", response_model=AgentChatResponse, tags=["Emergency Liquidation"])
def agent_chat(req: AgentChatRequest):
    """Stateless LLM-free conversational agent that acts as a Warehouse Intake Manager.
    Replies are generated via deterministic rule-based logic seeded on shipment telemetry,
    so no external API key or model is needed.
    """
    import random, re

    BASE_VALUE = 45_000.0
    msg_lower = req.user_message.lower()
    discount = req.discount_offered
    turns = len(req.history)
    spoilage_h = req.time_to_spoilage_hours
    eta_h = req.eta_hours
    temp = req.avg_temperature
    goods = req.goods_type
    biz_name = req.business_name

    # ── Helper ───────────────────────────────────────────────────────────
    def recovery(d: float) -> float:
        return round(BASE_VALUE * (1.0 - d / 100.0), 2)

    # Detect numbers the user mentioned (for discount extraction)
    def extract_discount(text: str) -> Optional[float]:
        nums = re.findall(r'(\d+(?:\.\d+)?)', text)
        candidates = [float(n) for n in nums if 5 <= float(n) <= 80]
        return candidates[0] if candidates else None

    user_offered = extract_discount(req.user_message) or discount

    # ── Acceptance / Rejection Logic ──────────────────────────────────────
    threshold = 25.0  # minimum discount % the warehouse accepts
    urgency_bonus = max(0, (12 - spoilage_h) * 1.2)  # higher urgency → lower threshold needed
    effective_threshold = max(15.0, threshold - urgency_bonus)

    # Check if user is agreeing / closing
    agree_keywords = ['accept', 'deal', 'agreed', 'yes', 'sure', 'okay', 'ok', 'done', 'finalize', 'go ahead', 'confirm', 'proceed']
    decline_keywords = ['no deal', 'not interested', 'too much', 'cancel', 'forget it', 'nevermind', 'walk away']

    user_is_agreeing = any(k in msg_lower for k in agree_keywords)
    user_is_declining = any(k in msg_lower for k in decline_keywords)

    # ── Generate Reply ────────────────────────────────────────────────────
    deal_status = "open"
    counter = None
    agent_reply = ""

    if user_is_declining:
        deal_status = "declined"
        agent_reply = (
            f"Understood. We'll pass on this one. If the situation changes, {biz_name} "
            f"is reachable 24/7. Good luck with the cargo."
        )

    elif user_is_agreeing and turns >= 1:
        # User is closing the deal — accept if discount is reasonable
        if user_offered >= effective_threshold:
            deal_status = "accepted"
            agent_reply = (
                f"Excellent! A {user_offered:.0f}% concession is accepted by {biz_name}. "
                f"Gate 3 is cleared for priority unloading. Divert the carrier now — "
                f"estimated recovery value is ${recovery(user_offered):,.0f}. "
                f"Our intake team will be ready for the {goods} shipment."
            )
        else:
            counter = round(effective_threshold + 3, 1)
            deal_status = "counter"
            agent_reply = (
                f"I appreciate the offer, but {user_offered:.0f}% isn't enough given our "
                f"emergency intake costs. We need at least {counter:.0f}% to proceed. "
                f"Can you authorise that?"
            )

    elif turns == 0:
        # Opening line from agent
        urgency_note = (
            f" I see your cargo has only {spoilage_h:.1f} hours before spoilage — "
            f"that's a narrow window."
        ) if spoilage_h < 10 else ""
        agent_reply = (
            f"Good day! {biz_name} Intake Manager speaking. I understand you have {goods} "
            f"running at {temp:.1f}°C in transit.{urgency_note} "
            f"What discount are you authorising for an emergency cross-dock today?"
        )

    elif user_offered >= effective_threshold:
        deal_status = "accepted"
        agent_reply = (
            f"That works for us. {user_offered:.0f}% discount on {goods} — accepted. "
            f"Gate 3 is cleared. Estimated recovery: ${recovery(user_offered):,.0f}. "
            f"Please divert the carrier immediately."
        )

    elif user_offered < 10:
        counter = round(effective_threshold, 1)
        deal_status = "counter"
        agent_reply = (
            f"{user_offered:.0f}% is far below our emergency intake cost floor. "
            f"We handle {goods} with specialized cold-dock equipment — "
            f"our minimum for unscheduled intake is {counter:.0f}%. "
            f"Can you meet that?"
        )

    elif 10 <= user_offered < effective_threshold:
        counter = round((user_offered + effective_threshold) / 2 + random.uniform(-1, 2), 1)
        deal_status = "counter"
        agent_reply = (
            f"I hear you on the {user_offered:.0f}%, but our dock team has overtime costs tonight. "
            f"Meet us at {counter:.0f}% and we can have the gates ready within the hour. "
            f"The {goods} will be refrigerated within 30 minutes of arrival."
        )

    else:
        # Generic follow-up
        agent_reply = (
            f"Tell me more about the cargo condition — is the temperature stable at {temp:.1f}°C? "
            f"And what's the current ETA to our depot from the carrier's position?"
        )

    rec_usd = recovery(user_offered) if deal_status == "accepted" else 0.0

    return AgentChatResponse(
        agent_reply=agent_reply,
        deal_status=deal_status,
        counter_discount=counter,
        recovery_usd=rec_usd
    )

@app.get("/api/shipments", response_model=List[Shipment], tags=["Logistics Analytics"])
def list_shipments(limit: int = 50, status: Optional[str] = None):
    results = db_shipments
    if status:
        results = [s for s in results if s.status.lower() == status.lower()]
    return results[:limit]

# 10. POST /api/shipments/{shipment_id}/freshness-check
@app.post("/api/shipments/{shipment_id}/freshness-check", response_model=FreshnessCheckResponse, tags=["Freshness Inspection"])
async def check_shipment_freshness(shipment_id: str, file: UploadFile = File(...)):
    shipment = next((s for s in db_shipments if s.shipment_id.upper() == shipment_id.upper()), None)
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment '{shipment_id}' not found.")

    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    # Analyze freshness via isolated Gemini module
    analysis = await analyze_freshness(image_bytes=image_bytes, mime_type=mime_type)

    # Convert image to data URI for immediate persistent thumbnail display
    data_uri = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"

    # Update shipment in-memory state
    shipment.freshness_score = analysis.get("freshness_score")
    shipment.freshness_summary = analysis.get("summary")
    shipment.freshness_status = analysis.get("freshness_status")
    shipment.freshness_checked_at = analysis.get("freshness_checked_at")
    shipment.freshness_identified_produce = analysis.get("identified_produce")
    shipment.freshness_spoilage_risk = analysis.get("spoilage_risk")
    shipment.freshness_image_url = data_uri

    return FreshnessCheckResponse(
        shipment_id=shipment.shipment_id,
        freshness_score=shipment.freshness_score,
        freshness_summary=shipment.freshness_summary or "",
        freshness_status=shipment.freshness_status or "failed",
        freshness_checked_at=shipment.freshness_checked_at or datetime.datetime.utcnow().isoformat(),
        freshness_image_url=data_uri,
        identified_produce=shipment.freshness_identified_produce,
        spoilage_risk=shipment.freshness_spoilage_risk,
        raw_response=analysis.get("raw_response")
    )

# 11. POST /api/analyze-freshness (Direct ad-hoc image inspection)
@app.post("/api/analyze-freshness", response_model=FreshnessCheckResponse, tags=["Freshness Inspection"])
async def analyze_freshness_direct(file: UploadFile = File(...)):
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    analysis = await analyze_freshness(image_bytes=image_bytes, mime_type=mime_type)
    data_uri = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"

    return FreshnessCheckResponse(
        shipment_id=None,
        freshness_score=analysis.get("freshness_score"),
        freshness_summary=analysis.get("summary", ""),
        freshness_status=analysis.get("freshness_status", "failed"),
        freshness_checked_at=analysis.get("freshness_checked_at", datetime.datetime.utcnow().isoformat()),
        freshness_image_url=data_uri,
        identified_produce=analysis.get("identified_produce"),
        spoilage_risk=analysis.get("spoilage_risk"),
        raw_response=analysis.get("raw_response")
    )

