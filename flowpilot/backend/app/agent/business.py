"""Relay's 'company knowledge' — the HVAC pricing book and calendar.

In production these would be a database / Google Calendar / CRM. For the demo
they're deterministic functions so quotes are reproducible and defensible.
"""
from datetime import datetime, timedelta, timezone

# Northwind Heating & Cooling — service catalog (USD).
PRICING_BOOK = {
    "diagnostic_visit": {
        "label": "Diagnostic / service call",
        "base": 129.0,
        "unit": "flat",
        "notes": "Waived if customer proceeds with repair.",
    },
    "ac_repair": {
        "label": "AC repair (labor)",
        "base": 95.0,
        "unit": "per_hour",
        "notes": "Parts billed separately at cost + 20%.",
    },
    "furnace_repair": {
        "label": "Furnace repair (labor)",
        "base": 110.0,
        "unit": "per_hour",
        "notes": "Parts billed separately at cost + 20%.",
    },
    "ac_install": {
        "label": "Central AC system install",
        "base": 5800.0,
        "unit": "flat",
        "notes": "Mid-tier 16-SEER unit, up to 2,000 sq ft. ±$1,500 by tonnage.",
    },
    "furnace_install": {
        "label": "High-efficiency furnace install",
        "base": 4200.0,
        "unit": "flat",
        "notes": "96% AFUE gas furnace, standard ductwork.",
    },
    "heat_pump_install": {
        "label": "Heat pump system install",
        "base": 8900.0,
        "unit": "flat",
        "notes": "Cold-climate inverter heat pump, up to 2,000 sq ft.",
    },
    "maintenance_tuneup": {
        "label": "Seasonal maintenance tune-up",
        "base": 149.0,
        "unit": "flat",
        "notes": "Per system. Annual plan available at $249/yr for two visits.",
    },
    "duct_cleaning": {
        "label": "Duct cleaning",
        "base": 399.0,
        "unit": "flat",
        "notes": "Whole home, up to 10 vents.",
    },
}

EMERGENCY_SURCHARGE = 0.25  # 25% after-hours / same-day premium
TAX_RATE = 0.13


def get_pricing_book() -> dict:
    """Return the full service catalog with rates."""
    return {"currency": "USD", "services": PRICING_BOOK,
            "emergency_surcharge_pct": EMERGENCY_SURCHARGE * 100,
            "tax_rate_pct": TAX_RATE * 100}


def check_calendar_availability(urgency: str = "standard") -> dict:
    """Return next available appointment slots based on urgency."""
    now = datetime.now(timezone.utc)
    urgency = (urgency or "standard").lower()

    if urgency in ("emergency", "urgent", "same_day"):
        first = now + timedelta(hours=3)
        windows = [first, now + timedelta(hours=6)]
        sla = "Same-day emergency dispatch (within business hours)."
    elif urgency == "high":
        first = now + timedelta(days=1)
        windows = [first.replace(hour=9), first.replace(hour=13)]
        sla = "Next-day priority scheduling."
    else:
        first = now + timedelta(days=3)
        windows = [first.replace(hour=9), first.replace(hour=13),
                   (first + timedelta(days=1)).replace(hour=9)]
        sla = "Standard scheduling, 3-5 business days."

    return {
        "urgency": urgency,
        "sla": sla,
        "slots": [w.strftime("%a %b %d, %Y at %I:%M %p UTC") for w in windows],
    }
