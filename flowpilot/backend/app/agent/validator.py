"""Deterministic Validator — the guardrail on the LLM's arithmetic.

Recomputes subtotal/surcharge/tax/total from the line items using the real
business rules, overwrites the model's numbers if they drifted, and records what
changed. This is what makes the quote *defensible* rather than vibes.
"""
from typing import Any

from .business import EMERGENCY_SURCHARGE, TAX_RATE


def _f(x: Any) -> float:
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


def validate(quote: dict, urgency: str | None) -> tuple[dict, dict]:
    items = quote.get("line_items") or []
    subtotal = round(sum(_f(i.get("amount")) for i in items), 2)

    is_emergency = (urgency or quote.get("urgency") or "").lower() == "emergency"
    surcharge = round(subtotal * EMERGENCY_SURCHARGE, 2) if is_emergency else 0.0
    tax = round((subtotal + surcharge) * TAX_RATE, 2)
    total = round(subtotal + surcharge + tax, 2)

    before = {k: quote.get(k) for k in ("subtotal", "surcharge", "tax", "total")}
    after = {"subtotal": subtotal, "surcharge": surcharge, "tax": tax, "total": total}
    changed = any(abs(_f(before[k]) - after[k]) > 0.01 for k in after)

    quote.update(after)

    note = (
        f"Recomputed totals from line items — corrected model drift (was "
        f"${_f(before['total']):.2f}, now ${total:.2f})."
        if changed else
        "Model arithmetic verified against line items — no drift."
    )
    step = {
        "agent": "Validator",
        "model": "deterministic",
        "type": "validation",
        "verdict": "adjusted" if changed else "pass",
        "duration_ms": 0,
        "content": note,
        "result": {"before": before, "after": after, "emergency_surcharge": is_emergency},
    }
    return quote, step
