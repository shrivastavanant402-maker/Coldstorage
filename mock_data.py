import random
from typing import List
from models import Shipment, Driver, Business

GOODS_SPECIFICATIONS = {
    "Vaccines": {"target_temp": 4.0, "temp_tolerance": 1.5, "base_risk": 15},
    "Biopharmaceuticals": {"target_temp": 5.0, "temp_tolerance": 2.0, "base_risk": 18},
    "Frozen Seafood": {"target_temp": -20.0, "temp_tolerance": 3.0, "base_risk": 12},
    "Dairy Products": {"target_temp": 3.0, "temp_tolerance": 2.5, "base_risk": 10},
    "Fresh Produce": {"target_temp": 7.0, "temp_tolerance": 3.5, "base_risk": 8},
    "Prime Cut Meat": {"target_temp": 1.0, "temp_tolerance": 2.0, "base_risk": 14}
}

ROUTE_PAIRS = [
    ("Mumbai, India", "Delhi, India", 1420.0),
    ("Bengaluru, India", "Delhi, India", 2140.0),
    ("Chennai, India", "Mumbai, India", 1340.0),
    ("Chicago, IL", "Atlanta, GA", 1150.0),
    ("Dallas, TX", "Denver, CO", 1280.0),
    ("Los Angeles, CA", "Seattle, WA", 1820.0),
    ("Miami, FL", "Charlotte, NC", 1180.0),
    ("New York, NY", "Boston, MA", 350.0),
    ("Hyderabad, India", "Nagpur, India", 500.0),
    ("Kolkata, India", "Patna, India", 580.0)
]

def generate_mock_shipments(n: int = 200) -> List[Shipment]:
    random.seed(42)
    shipments = []
    goods_list = list(GOODS_SPECIFICATIONS.keys())

    for i in range(1, n + 1):
        shp_id = f"SHP-{1000 + i}"
        origin, destination, base_dist = random.choice(ROUTE_PAIRS)
        distance_km = round(base_dist * random.uniform(0.9, 1.15), 1)
        transit_hours = round((distance_km / 75.0) + random.uniform(0.5, 6.0), 1)
        goods_type = random.choice(goods_list)
        spec = GOODS_SPECIFICATIONS[goods_type]

        is_thermal_abuse = random.random() < 0.22

        if is_thermal_abuse:
            avg_temperature = round(spec["target_temp"] + random.uniform(3.5, 9.0), 2)
            temp_variance = round(random.uniform(2.5, 6.5), 2)
            weather_severity = round(random.uniform(3.0, 5.0), 1)
            vehicle_age = round(random.uniform(6.0, 14.0), 1)
            delay_history = round(random.uniform(3.0, 10.0), 1)
            spoilage_flag = 1 if (temp_variance > 3.0 or transit_hours > 24) else 0
        else:
            avg_temperature = round(spec["target_temp"] + random.uniform(-1.0, 1.2), 2)
            temp_variance = round(random.uniform(0.2, 1.8), 2)
            weather_severity = round(random.uniform(1.0, 2.8), 1)
            vehicle_age = round(random.uniform(1.0, 5.5), 1)
            delay_history = round(random.uniform(0.0, 2.0), 1)
            spoilage_flag = 0

        humidity = round(random.uniform(50.0, 88.0), 1)

        shipments.append(Shipment(
            shipment_id=shp_id,
            origin=origin,
            destination=destination,
            distance_km=distance_km,
            transit_hours=transit_hours,
            avg_temperature=avg_temperature,
            temp_variance=temp_variance,
            humidity=humidity,
            goods_type=goods_type,
            vehicle_age=vehicle_age,
            weather_severity=weather_severity,
            delay_history=delay_history,
            spoilage_flag=spoilage_flag,
            status="In Transit" if i <= 20 else "Delivered"
        ))

    return shipments

def generate_mock_drivers() -> List[Driver]:
    return [
        Driver(
            driver_id="DRV-001",
            name="Marcus Vance",
            phone="+1-555-0142",
            vehicle_type="Refrigerated Semi-Trailer",
            current_location="Mumbai, India",
            status="Available",
            assigned_shipments=[]
        ),
        Driver(
            driver_id="DRV-002",
            name="Elena Rostova",
            phone="+1-555-0189",
            vehicle_type="Cryogenic Pharma Van",
            current_location="Delhi, India",
            status="On Route",
            assigned_shipments=["SHP-1002"]
        ),
        Driver(
            driver_id="DRV-003",
            name="David Kim",
            phone="+1-555-0231",
            vehicle_type="Multi-Temperature Reefer",
            current_location="Bengaluru, India",
            status="Available",
            assigned_shipments=[]
        ),
        Driver(
            driver_id="DRV-004",
            name="Sarah Jenkins",
            phone="+1-555-0377",
            vehicle_type="Refrigerated Sprinter Van",
            current_location="Chennai, India",
            status="Available",
            assigned_shipments=[]
        ),
        Driver(
            driver_id="DRV-005",
            name="Carlos Mendoza",
            phone="+1-555-0419",
            vehicle_type="Heavy-Duty Cold Hauler",
            current_location="Nagpur, India",
            status="On Route",
            assigned_shipments=["SHP-1005"]
        )
    ]

def generate_mock_businesses() -> List[Business]:
    return [
        Business(
            business_id="BIZ-001",
            name="Apex Cold Hub Distributing",
            location="Delhi NCR, India",
            contact="intake@apexcold.com | +91-11-555-8901",
            accepts_goods_type=["Vaccines", "Biopharmaceuticals"],
            rating=4.9
        ),
        Business(
            business_id="BIZ-002",
            name="FreshHarvest Secondary Food Hub",
            location="Mumbai Docks, India",
            contact="buyers@freshharvest.com | +91-22-555-4421",
            accepts_goods_type=["Fresh Produce", "Dairy Products"],
            rating=4.7
        ),
        Business(
            business_id="BIZ-003",
            name="Oceanic Flash Freeze Liquidation",
            location="Chennai Harbor, India",
            contact="ops@oceanicflash.com | +91-44-555-7733",
            accepts_goods_type=["Frozen Seafood", "Prime Cut Meat"],
            rating=4.8
        ),
        Business(
            business_id="BIZ-004",
            name="Metro Grocery Liquidation Center",
            location="Bengaluru, India",
            contact="procurement@metrogrocery.com | +91-80-555-9012",
            accepts_goods_type=["Dairy Products", "Prime Cut Meat", "Fresh Produce"],
            rating=4.6
        ),
        Business(
            business_id="BIZ-005",
            name="BioPharma Rapid Thermal Depot",
            location="Hyderabad, India",
            contact="reception@biopharmacold.com | +91-40-555-1100",
            accepts_goods_type=["Vaccines", "Biopharmaceuticals"],
            rating=4.95
        ),
        Business(
            business_id="BIZ-006",
            name="Central Logistics Cold Warehouse",
            location="Nagpur, India",
            contact="intake@centrallogistics.com | +91-712-555-3298",
            accepts_goods_type=["Fresh Produce", "Dairy Products", "Frozen Seafood"],
            rating=4.5
        )
    ]
