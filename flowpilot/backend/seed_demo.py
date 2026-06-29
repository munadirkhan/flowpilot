"""Seed the inbox with realistic demo leads in mixed states.

Canned (not live) so the demo inbox is instant and deterministic for the video.
Each lead carries a full enriched multi-agent trace + risk tier, exactly like a
real pipeline run. Run:  python seed_demo.py
"""
from datetime import timedelta

from sqlmodel import Session, delete

from app.agent.business import EMERGENCY_SURCHARGE, TAX_RATE
from app.db import engine, init_db
from app.models import Lead, LeadStatus, utcnow


def totals(items, urgency):
    subtotal = round(sum(i["amount"] for i in items), 2)
    surcharge = round(subtotal * EMERGENCY_SURCHARGE, 2) if urgency == "emergency" else 0.0
    tax = round((subtotal + surcharge) * TAX_RATE, 2)
    total = round(subtotal + surcharge + tax, 2)
    return subtotal, surcharge, tax, total


def quote(customer, summary, items, urgency, confidence, flags):
    subtotal, surcharge, tax, total = totals(items, urgency)
    return {
        "customer_name": customer, "service_summary": summary, "urgency": urgency,
        "line_items": items, "subtotal": subtotal, "surcharge": surcharge, "tax": tax,
        "total": total, "confidence": confidence, "ambiguity_flags": flags,
        "recommended_slot": "Thu, Jul 02, 2026 at 09:00 AM UTC",
        "customer_message": f"Hi {customer.split()[0]}, here's your quote from Northwind Heating & Cooling.",
    }


def risk_of(q):
    reasons, flags = [], q.get("ambiguity_flags") or []
    if q["confidence"] < 0.6:
        reasons.append(f"Low model confidence ({int(q['confidence']*100)}%)")
    if q["total"] >= 3000:
        reasons.append(f"High-value quote (${q['total']:,.0f})")
    if len(flags) >= 3:
        reasons.append(f"{len(flags)} unverified assumptions")
    if q["urgency"] == "emergency":
        reasons.append("Emergency job — time pressure")
    label = "high" if reasons else "low"
    return {"label": label, "reasons": reasons or ["Confident quote, routine job, modest value"]}


def trace(summary, urgency, q, model="qwen3.7-max"):
    r = risk_of(q)
    adjusted = q.get("_adjusted", False)
    steps = [
        {"agent": "Intake Qualifier", "model": "qwen3.5-flash", "type": "extraction", "verdict": "ok",
         "duration_ms": 1180, "content": summary},
        {"agent": "Quote Specialist", "model": model, "type": "tool_call", "tool": "get_pricing_book",
         "verdict": "ok", "duration_ms": 940, "args": {}, "result": {"items": len(q["line_items"])}},
        {"agent": "Quote Specialist", "model": model, "type": "tool_call", "tool": "check_calendar_availability",
         "verdict": "ok", "duration_ms": 720, "args": {"urgency": urgency}},
        {"agent": "Quote Specialist", "model": model, "type": "tool_call", "tool": "save_quote",
         "verdict": "drafted", "duration_ms": 1610},
        {"agent": "Validator", "model": "deterministic", "type": "validation",
         "verdict": "adjusted" if adjusted else "pass", "duration_ms": 0,
         "content": "Recomputed totals from line items — corrected model drift." if adjusted
                    else "Model arithmetic verified against line items — no drift."},
        {"agent": "Risk Router", "model": "deterministic", "type": "risk",
         "verdict": f"{r['label']}_risk", "duration_ms": 0,
         "content": "High-risk — recommend careful review." if r["label"] == "high"
                    else "Low-risk — safe to fast-approve.", "result": r},
        {"agent": "FlowPilot", "model": "—", "type": "handoff", "verdict": "ready",
         "duration_ms": 0, "content": "Draft routed to a human for approval."},
    ]
    for i, s in enumerate(steps):
        s["step"] = i
    return steps, r


def confirmation_email(customer, q):
    first = customer.split()[0]
    return {
        "to": customer,
        "subject": f"Your Northwind Heating & Cooling quote — ${q['total']}",
        "body": (
            f"Hi {first},\n\nThanks for reaching out to Northwind Heating & Cooling! "
            f"We've put together a quote for you — the total comes to ${q['total']:,.2f}, "
            f"tax included.\n\nWe can have a technician out on the recommended slot; just reply "
            f"'book it' and we'll lock it in.\n\nWarm regards,\nDana\nNorthwind Heating & Cooling"
        ),
        "status": "sent",
    }


def build():
    leads = []

    # 1 — Marcus Whitfield: emergency AC blower, high-value, HIGH risk, pending
    q1 = quote("Marcus Whitfield", "Emergency AC blower-motor failure on a Carrier system",
               [{"label": "Diagnostic visit & inspection", "amount": 129},
                {"label": "Blower motor replacement — labor", "amount": 340},
                {"label": "OEM blower motor (Carrier)", "amount": 485},
                {"label": "Refrigerant top-off & leak check", "amount": 165}],
               "emergency", 0.82,
               ["System age (~2015) may mean other worn parts", "Refrigerant type assumed R-410A"])
    t1, r1 = trace("AC blowing warm + rattling noise, Carrier ~2015 — emergency repair.", "emergency", q1)
    leads.append(("email", "Marcus Whitfield",
                  "AC has been blowing warm air since yesterday + making a weird rattling noise upstairs. its a carrier from like 2015 i think?? can someone come out this week",
                  LeadStatus.pending_approval, q1, r1, t1, None, 2))

    # 2 — Lena Okafor: AC tune-up, LOW risk, pending
    q2 = quote("Lena Okafor", "Pre-summer AC tune-up with filter replacement",
               [{"label": "AC performance tune-up", "amount": 129},
                {"label": "MERV-11 filter replacement", "amount": 38},
                {"label": "Condenser coil rinse", "amount": 22}],
               "standard", 0.85, ["Single AC unit assumed (not multi-zone)"])
    t2, r2 = trace("AC tune-up before summer, also wants filter changed — routine.", "standard", q2)
    leads.append(("sms", "Lena Okafor",
                  "hey do you guys do AC tune ups? mine is just running kinda weak before summer. also the filter probably needs changing lol",
                  LeadStatus.pending_approval, q2, r2, t2, None, 6))

    # 3 — Priya Delgado: commercial, still processing (no quote yet)
    leads.append(("email", "Priya Delgado",
                  "Our office thermostat died over the weekend and the lobby is freezing. Need a replacement + install ASAP, commercial building, 3rd floor.",
                  LeadStatus.processing, {}, {}, [
                      {"agent": "Intake Qualifier", "model": "qwen3.5-flash", "type": "extraction",
                       "verdict": "ok", "duration_ms": 1100, "content": "Commercial thermostat failure — urgent install.", "step": 0},
                      {"agent": "Quote Specialist", "model": "qwen3.7-max", "type": "thought",
                       "verdict": "ok", "duration_ms": 800, "content": "Pricing commercial thermostat + install…", "step": 1},
                  ], None, 12))

    # 4 — Gary Holloway: "how much for ac", diagnostic, LOW risk, pending
    q4 = quote("Gary Holloway", "AC diagnostic/service call to assess system condition",
               [{"label": "Diagnostic / service call", "amount": 129}],
               "standard", 0.85,
               ["Customer did not specify repair vs install vs maintenance",
                "Parts cost unknown until inspected", "System age/brand not provided"])
    t4, r4 = trace("Vague 'how much for ac' — defaulted to diagnostic visit as entry point.", "standard", q4)
    leads.append(("web_form", "Gary Holloway", "how much for ac",
                  LeadStatus.pending_approval, q4, r4, t4, None, 28))

    # 5 — The Brennan Group: commercial maintenance plan, CONFIRMED
    q5 = quote("The Brennan Group", "Annual maintenance plan — four rooftop units",
               [{"label": "Rooftop unit tune-up × 4", "amount": 596},
                {"label": "Annual maintenance plan (2 visits/unit)", "amount": 996},
                {"label": "Priority commercial service tier", "amount": 449}],
               "standard", 0.88, ["Unit tonnage assumed standard commercial RTU"])
    t5, r5 = trace("Commercial follow-up — annual plan for 4 rooftop units.", "standard", q5)
    leads.append(("email", "The Brennan Group",
                  "Following up on the annual maintenance plan for our four rooftop units. Can you send updated pricing for the year?",
                  LeadStatus.confirmed, q5, r5, t5, confirmation_email("The Brennan Group", q5), 64))

    # 6 — Sofia Mendez: furnace clicking, CONFIRMED
    q6 = quote("Sofia Mendez", "Furnace diagnostic — intermittent clicking on ignition",
               [{"label": "Diagnostic / service call", "amount": 129},
                {"label": "Furnace repair (labor, 1.5 hr)", "amount": 165},
                {"label": "Ignitor replacement (part)", "amount": 95}],
               "standard", 0.79, ["Clicking suggests ignitor; confirm on site"])
    t6, r6 = trace("Older furnace clicking on ignition — likely ignitor.", "standard", q6)
    leads.append(("sms", "Sofia Mendez",
                  "furnace making a clicking sound when it kicks on, not sure if its normal. its an older unit. wondering if i should be worried",
                  LeadStatus.confirmed, q6, r6, t6, confirmation_email("Sofia Mendez", q6), 120))

    return leads


def main():
    init_db()
    rows = build()
    now = utcnow()
    with Session(engine) as s:
        s.exec(delete(Lead))
        s.commit()
        for channel, sender, msg, status, q, risk, tr, conf, mins_ago in rows:
            lead = Lead(
                channel=channel, sender=sender, raw_message=msg, status=status,
                quote=q, risk=risk, agent_trace=tr,
                confirmation=conf or {},
                extracted={"customer_name": sender, "service_summary": q.get("service_summary"),
                           "urgency": q.get("urgency")},
                created_at=now - timedelta(minutes=mins_ago),
                updated_at=now - timedelta(minutes=mins_ago),
            )
            s.add(lead)
        s.commit()
    print(f"Seeded {len(rows)} demo leads.")


if __name__ == "__main__":
    main()
