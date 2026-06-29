"""FlowPilot multi-agent pipeline coordinator.

    inquiry
      → Agent 1: Intake Qualifier   (LLM, structured extraction)
      → Agent 2: Quote Specialist   (LLM, tool-calling loop)
      → Validator                   (deterministic math/total guardrail)
      → Risk Router                 (deterministic low/high tiering)
      → pending_approval (HITL)
      → Agent 3: Confirmation Writer (LLM, after human approval)

Returns (extracted, quote, risk, trace). The trace is one ordered list of
enriched steps (agent, model, duration_ms, verdict) for the UI timeline.
"""
import json
import time

from ..qwen_client import client, DRAFT_MODEL
from .qualifier import qualify
from .quote_agent import build_quote
from .risk import assess
from .validator import validate


def run_pipeline(raw_message: str, sender: str | None = None) -> tuple[dict, dict, dict, list]:
    trace: list[dict] = []

    # Agent 1 — Intake Qualifier
    qualified, qstep = qualify(raw_message, sender)
    trace.append(qstep)

    # Agent 2 — Quote Specialist
    quote, qsteps = build_quote(raw_message, qualified, sender)
    trace.extend(qsteps)

    # Carry urgency forward (qualifier is authoritative if the specialist omitted it)
    urgency = quote.get("urgency") or qualified.get("urgency") or "standard"
    quote["urgency"] = urgency
    if not quote.get("customer_name"):
        quote["customer_name"] = qualified.get("customer_name") or sender

    # Validator — deterministic guardrail
    quote, vstep = validate(quote, urgency)
    trace.append(vstep)

    # Risk Router — deterministic tiering
    risk, rstep = assess(quote)
    trace.append(rstep)

    # Final handoff marker
    trace.append({
        "agent": "FlowPilot", "model": "—", "type": "handoff", "verdict": "ready",
        "duration_ms": 0, "content": "Draft routed to a human for approval.",
    })

    for i, s in enumerate(trace):
        s["step"] = i

    extracted = {
        "customer_name": quote.get("customer_name"),
        "service_summary": quote.get("service_summary") or qualified.get("summary"),
        "urgency": urgency,
        "confidence": quote.get("confidence"),
        "qualifier": qualified,
        "sender": sender,
    }
    return extracted, quote, risk, trace


def draft_confirmation(quote: dict, human_notes: str | None = None) -> tuple[dict, dict]:
    """Agent 3 — Confirmation Writer. Runs after human approval. Returns (confirmation, trace_step)."""
    t0 = time.time()
    base_msg = quote.get("customer_message", "")
    prompt = (
        "You are FlowPilot finalizing an approved HVAC quote confirmation for the "
        "customer. Polish this into a friendly, professional confirmation email. "
        "Keep it concise. Include the total and the recommended appointment. "
        "Write it as a warm, human email with normal paragraph breaks. Do NOT use "
        "any markdown formatting (no **bold**, no asterisk bullets, no '#'). "
        "Reply with ONLY the email body as plain text.\n\n"
        f"Approved quote: {json.dumps(quote)}\n"
        f"Dispatcher notes: {human_notes or 'none'}\n"
        f"Draft to refine: {base_msg}\n/no_think"
    )
    resp = client.chat.completions.create(
        model=DRAFT_MODEL, messages=[{"role": "user", "content": prompt}],
        temperature=0.5, max_tokens=800,
    )
    body = (resp.choices[0].message.content or "").strip() or base_msg
    confirmation = {
        "to": quote.get("customer_name"),
        "subject": f"Your Northwind Heating & Cooling quote — ${quote.get('total', 'TBD')}",
        "body": body,
        "status": "sent",
    }
    step = {
        "agent": "Confirmation Writer", "model": DRAFT_MODEL, "type": "confirmation",
        "verdict": "sent", "duration_ms": int((time.time() - t0) * 1000),
        "content": "Generated and sent the customer confirmation email.",
    }
    return confirmation, step
