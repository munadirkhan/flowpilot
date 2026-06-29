"""Tool definitions (OpenAI function-calling schema) + local dispatch."""
import json
from typing import Any

from . import business

# Schemas advertised to the model.
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_pricing_book",
            "description": "Retrieve Northwind's real HVAC service catalog with rates, "
                           "surcharges, and tax. Always call before quoting.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_calendar_availability",
            "description": "Get the next available appointment slots and SLA for a "
                           "given urgency level.",
            "parameters": {
                "type": "object",
                "properties": {
                    "urgency": {
                        "type": "string",
                        "enum": ["standard", "high", "emergency"],
                        "description": "Assessed urgency of the customer's need.",
                    }
                },
                "required": ["urgency"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "save_quote",
            "description": "Finalize the structured draft quote for human review. "
                           "Call exactly once, at the end.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {"type": "string"},
                    "service_summary": {
                        "type": "string",
                        "description": "One-line plain-English summary of what the job is.",
                    },
                    "urgency": {"type": "string", "enum": ["standard", "high", "emergency"]},
                    "line_items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "service_key": {"type": "string"},
                                "label": {"type": "string"},
                                "qty": {"type": "number"},
                                "unit_price": {"type": "number"},
                                "amount": {"type": "number"},
                            },
                            "required": ["label", "amount"],
                        },
                    },
                    "subtotal": {"type": "number"},
                    "surcharge": {"type": "number", "description": "Emergency surcharge $, 0 if none."},
                    "tax": {"type": "number"},
                    "total": {"type": "number"},
                    "recommended_slot": {"type": "string"},
                    "confidence": {
                        "type": "number",
                        "description": "0.0-1.0 confidence in this quote given the info available.",
                    },
                    "ambiguity_flags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Assumptions made / info the human should verify.",
                    },
                    "customer_message": {
                        "type": "string",
                        "description": "Draft message to send the customer once approved.",
                    },
                },
                "required": ["customer_name", "service_summary", "urgency",
                             "line_items", "subtotal", "total", "confidence",
                             "ambiguity_flags", "customer_message"],
            },
        },
    },
]

# Tools the agent can actually execute (save_quote is handled by the orchestrator).
EXECUTORS = {
    "get_pricing_book": lambda args: business.get_pricing_book(),
    "check_calendar_availability": lambda args: business.check_calendar_availability(
        args.get("urgency", "standard")
    ),
}


def run_tool(name: str, raw_args: str) -> Any:
    try:
        args = json.loads(raw_args) if raw_args else {}
    except json.JSONDecodeError:
        args = {}
    fn = EXECUTORS.get(name)
    if fn is None:
        return {"error": f"unknown tool {name}"}
    return fn(args)
