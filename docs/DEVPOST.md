# FlowPilot — Devpost submission copy

Paste-ready. Edit the bracketed bits (`[demo video]`, `[public URL]`, `[repo]`) before submitting.

---

## Project name (60 char max)
`FlowPilot — autopilot agent for home-service quoting`

## Elevator pitch (200 char max)
`FlowPilot turns chaotic customer inquiries into approved quotes in under a minute — a multi-agent pipeline on Qwen Cloud with real tools, math guardrails, and human sign-off.`

## Track
Track 4 — Autopilot Agent

---

## Inspiration
Home-service businesses — HVAC, plumbing, cleaning — live and die on speed-to-quote. Pricing a single inquiry by hand eats 15–30 minutes of a skilled tech's or owner's time, and homeowners hire whoever replies first. The leads that go cold are the ones that arrive at night and on weekends, when no one's at the desk. We wanted an agent that does the whole intake-to-quote chain in seconds — but that a real business owner could actually trust, because nothing reaches a customer without a human's say-so.

## What it does
FlowPilot ingests a raw, messy inquiry (*"AC blowing warm + rattling, can someone come this week?"* or just *"how much for ac"*), figures out the job and urgency, looks up real pricing and calendar availability, and drafts a defensible quote — itemized, taxed, with a confidence score and an explicit list of the assumptions it had to make. It tiers each quote low- or high-risk so the human knows where to look. The dispatcher approves, edits, or rejects in a web dashboard; only on approval does FlowPilot write and send the customer confirmation. Every reasoning step and tool call is recorded in a transparent agent trace.

## How we built it
FlowPilot is a **multi-agent pipeline**, not one big prompt:

1. **Intake Qualifier** (`qwen3.5-flash`) — extracts a structured profile from the messy text.
2. **Quote Specialist** (`qwen3.7-max`) — an autonomous tool-calling loop that chooses when to call the pricing book, the calendar, and the quote builder.
3. **Validator** (deterministic Python) — recomputes every total from the line items, so the LLM can never ship bad math to a customer.
4. **Risk Router** (deterministic Python) — tiers the quote by confidence, value, assumptions, and urgency.
5. **Human-in-the-loop gate** — the quote waits in `pending_approval`.
6. **Confirmation Writer** (`qwen3.5-flash`) — drafts the final customer email after approval.

All reasoning runs on **Qwen Cloud** via the OpenAI-compatible DashScope endpoint, with deliberate model routing (a fast model for extraction and drafting, the flagship for tool-using reasoning). Backend: Python + FastAPI + SQLModel/SQLite. Frontend: React + Vite + TypeScript with an animated agent-trace timeline and risk banners. Shipped as a single Docker container (the API serves the built SPA) deployed on Alibaba Cloud ECS.

## Challenges we ran into
- **Qwen3 "thinking" mode** would sometimes eat a turn and skip finalizing the quote — fixed with a `/no_think` directive plus a forced `tool_choice` fallback to guarantee the agent produces a structured quote.
- **LLM arithmetic drift** on totals — solved by making the Validator a deterministic step, not a model call.
- **Free-tier quota activation** took a few days to clear `403 AccessDenied`; we built a local Ollama-Qwen fallback so development never blocked, then flipped to Qwen Cloud with a two-line env change.

## Accomplishments we're proud of
A genuinely production-shaped agent: specialized roles, a non-AI guardrail between AI steps, risk-tiered human oversight, full observability, and a one-command deploy — all on Qwen.

## What we learned
Splitting one monolithic prompt into small, single-purpose agents made each step more reliable, let us route cheap vs. flagship models per task, and — most importantly — created clean seams to insert deterministic safety checks the model can't override.

## What's next
Real integrations (Google Calendar, Stripe, email/SMS), a learning loop from dispatcher edits, and expansion beyond HVAC to plumbing and cleaning.

## Built with
Qwen Cloud (qwen3.7-max, qwen3.5-flash) · Python · FastAPI · SQLModel · OpenAI SDK · React · Vite · TypeScript · Docker · Alibaba Cloud ECS

## Links
- Demo video: `[demo video]`
- Live app: `[public URL]`
- Repo: `[repo]`
