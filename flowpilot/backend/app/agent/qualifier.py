"""Agent 1 — Intake Qualifier.

Turns a raw, messy inquiry into a structured profile the Quote Specialist can act
on. Pure extraction (no tools). Emits one enriched trace step.
"""
import json
import re
import time
from typing import Any

from ..qwen_client import client, DRAFT_MODEL  # fast model for extraction (routing: max for reasoning, flash for extraction)

QUALIFIER_PROMPT = """\
You are the Intake Qualifier for an HVAC company (Northwind Heating & Cooling).
Read a raw, messy customer inquiry and extract a structured profile.

Respond with ONLY a JSON object — no prose, no markdown fences — with these keys:
  customer_name   string  (infer from sender/message; "Unknown" if absent)
  service_type    string  one of: repair | install | maintenance | diagnostic | inquiry
  system          string  e.g. "central AC", "furnace", "heat pump", "unknown"
  urgency         string  one of: standard | high | emergency
  summary         string  one plain sentence describing the job
  missing_fields  array   info the dispatcher should clarify (e.g. "system age", "square footage")
  signals         array   short notable cues (e.g. "infant in home", "after-hours", "commercial")
/no_think"""


def _extract_json(text: str) -> dict[str, Any]:
    """Best-effort JSON parse — tolerates code fences and surrounding prose."""
    if not text:
        return {}
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                return {}
    return {}


def qualify(raw_message: str, sender: str | None = None) -> tuple[dict, dict]:
    t0 = time.time()
    messages = [
        {"role": "system", "content": QUALIFIER_PROMPT},
        {"role": "user", "content": f"Inquiry from {sender or 'unknown'}:\n\n{raw_message}"},
    ]
    # Same model as the Quote Specialist so Ollama keeps one model resident (no VRAM
    # swap). We rely on the prompt + robust _extract_json rather than slow constrained
    # JSON decoding. On Qwen Cloud you can route this to qwen3.6-flash via config.
    resp = client.chat.completions.create(
        model=DRAFT_MODEL, messages=messages, temperature=0.2,
    )
    data = _extract_json(resp.choices[0].message.content or "")
    if sender and (not data.get("customer_name") or data.get("customer_name") == "Unknown"):
        data["customer_name"] = sender

    dur = int((time.time() - t0) * 1000)
    step = {
        "agent": "Intake Qualifier",
        "model": DRAFT_MODEL,
        "type": "extraction",
        "verdict": "ok" if data else "empty",
        "duration_ms": dur,
        "content": data.get("summary", "Parsed the inquiry into a structured profile."),
        "result": data,
    }
    return data, step
