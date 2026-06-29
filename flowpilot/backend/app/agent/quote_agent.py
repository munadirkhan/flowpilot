"""Agent 2 — Quote Specialist.

Autonomous tool-calling loop that turns the qualified profile into a structured
draft quote. Refactored out of the old single-agent orchestrator; every trace
step is tagged with agent/model/duration/verdict for the multi-agent timeline.
"""
import json
import time
from typing import Any

from ..qwen_client import client, AGENT_MODEL
from .prompts import AGENT_SYSTEM_PROMPT
from .tools import TOOL_SCHEMAS, run_tool

MAX_STEPS = 8


def _tag(step_idx: int, **kw) -> dict:
    base = {"agent": "Quote Specialist", "model": AGENT_MODEL, "step": step_idx,
            "duration_ms": 0, "verdict": "ok"}
    base.update(kw)
    return base


def build_quote(raw_message: str, qualified: dict, sender: str | None = None) -> tuple[dict, list]:
    context = json.dumps(qualified) if qualified else "{}"
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": AGENT_SYSTEM_PROMPT},
        {"role": "user", "content": (
            f"Inbound inquiry from {sender or 'unknown'}:\n\n{raw_message}\n\n"
            f"The Intake Qualifier already extracted this profile — use it:\n{context}"
        )},
    ]
    trace: list[dict[str, Any]] = []
    quote: dict[str, Any] = {}
    force_save = False

    for step in range(MAX_STEPS):
        tool_choice: Any = (
            {"type": "function", "function": {"name": "save_quote"}} if force_save else "auto"
        )
        t0 = time.time()
        resp = client.chat.completions.create(
            model=AGENT_MODEL, messages=messages, tools=TOOL_SCHEMAS,
            tool_choice=tool_choice, temperature=0.3,
        )
        dur = int((time.time() - t0) * 1000)
        msg = resp.choices[0].message

        if msg.content:
            trace.append(_tag(step, type="thought", content=msg.content, duration_ms=dur))

        if not msg.tool_calls:
            if not force_save:
                force_save = True
                trace.append(_tag(step, type="nudge", verdict="retry",
                                  content="Specialist paused — forcing it to finalize the quote."))
                messages.append({"role": "user", "content": (
                    "You now have pricing and availability. Call save_quote now with the "
                    "complete structured quote. /no_think")})
                continue
            trace.append(_tag(step, type="no_tool_stop", verdict="fail", content=msg.content or ""))
            break

        messages.append({
            "role": "assistant", "content": msg.content or "",
            "tool_calls": [
                {"id": tc.id, "type": "function",
                 "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in msg.tool_calls
            ],
        })

        finalized = False
        for tc in msg.tool_calls:
            name = tc.function.name
            raw_args = tc.function.arguments or "{}"

            if name == "save_quote":
                try:
                    quote = json.loads(raw_args)
                except json.JSONDecodeError:
                    quote = {"error": "could not parse quote", "raw": raw_args}
                trace.append(_tag(step, type="tool_call", tool=name, args=quote,
                                  verdict="drafted", duration_ms=dur))
                messages.append({"role": "tool", "tool_call_id": tc.id, "name": name,
                                 "content": "Quote saved and routed to a human for approval."})
                finalized = True
            else:
                result = run_tool(name, raw_args)
                trace.append(_tag(step, type="tool_call", tool=name,
                                  args=json.loads(raw_args) if raw_args.strip() else {},
                                  result=result, duration_ms=dur))
                messages.append({"role": "tool", "tool_call_id": tc.id, "name": name,
                                 "content": json.dumps(result)})

        if finalized:
            break

    return quote, trace
