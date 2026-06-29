"""Risk Router — deterministic risk tiering for the human-in-the-loop UI.

Low-risk quotes are safe to fast-approve; high-risk ones get a banner telling the
dispatcher exactly why they should look closely. Risk-tiered HITL is the
innovation hook: the human's attention is spent where it actually matters.
"""
from typing import Any

HIGH_VALUE_THRESHOLD = 3000.0


def assess(quote: dict) -> tuple[dict, dict]:
    conf = quote.get("confidence")
    flags = quote.get("ambiguity_flags") or []
    total = float(quote.get("total") or 0)
    urgency = (quote.get("urgency") or "").lower()

    reasons: list[str] = []
    if conf is not None and conf < 0.6:
        reasons.append(f"Low model confidence ({int(conf * 100)}%)")
    if total >= HIGH_VALUE_THRESHOLD:
        reasons.append(f"High-value quote (${total:,.0f})")
    if len(flags) >= 3:
        reasons.append(f"{len(flags)} unverified assumptions")
    if urgency == "emergency":
        reasons.append("Emergency job — time pressure")

    label = "high" if reasons else "low"
    if label == "low":
        reasons = ["Confident quote, routine job, modest value"]

    note = (
        "High-risk — recommend a careful human review before sending."
        if label == "high"
        else "Low-risk — safe to fast-approve."
    )
    risk: dict[str, Any] = {"label": label, "reasons": reasons}
    step = {
        "agent": "Risk Router",
        "model": "deterministic",
        "type": "risk",
        "verdict": f"{label}_risk",
        "duration_ms": 0,
        "content": note,
        "result": risk,
    }
    return risk, step
