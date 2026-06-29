# FlowPilot — 3-Minute Demo Script

Goal: in 3 minutes, a judge should see the problem, watch named agents work with a
live trace, see a math guardrail + risk tiering, approve with one click, and learn it
runs on Qwen Cloud + Alibaba Cloud.

**Before recording:** reset the inbox → `python seed_demo.py` (clean 6 leads). Have the
app open at the **landing page** (`/`). Record at 1440px wide, browser maximized.

---

### 0:00–0:25 · The hook (landing page)
> "Home-service businesses — HVAC, plumbing — lose jobs to slow quotes. Pricing one
> inquiry by hand takes 15 to 30 minutes, and customers hire whoever replies first.
> This is **FlowPilot** — it turns a messy inquiry into an approved quote in under a
> minute."

- Scroll the landing slowly: hero → "Slow quotes lose jobs" → the 4-step how-it-works → the agent-trace section.
- Click **Launch demo**.

### 0:25–0:45 · The inbox
> "This is the dispatcher's inbox — real inquiries, each tiered by status: needs
> approval, agent working, confirmed. Let's bring in a brand-new one."

- Click **+ New inquiry** → click the **"Emergency AC"** preset (shows a messy, panicked text) → **Submit to FlowPilot**.

### 0:45–1:30 · Watch the agents work (the centerpiece)
> "FlowPilot isn't one prompt — it's a pipeline of specialized agents. The **Intake
> Qualifier** reads the mess and pulls out intent and urgency. The **Quote Specialist**
> then calls real tools — the pricing book, the calendar — and builds an itemized quote.
> A deterministic **Validator** re-checks every number, and a **Risk Router** flags how
> closely a human should look."

- Let the animated timeline play through the four stages.
- Click **Review the draft quote →**.

### 1:30–2:20 · The review screen (production-readiness + HITL)
> "Here's the human-in-the-loop checkpoint — nothing reaches the customer without me.
> On the left, the **full agent trace**: every model call and tool, with the model used
> and how long it took."

- Open one trace row (e.g. `get_pricing_book`) to show the real tool output.

> "On the right, the quote — and notice the **risk banner**. This one's high-risk because
> it's high-value with several assumptions, so it's telling me to look closely. It even
> lists the exact assumptions it made instead of hiding them."

- Point at the risk banner + the "Assumptions to verify" list.
- Click a note preset (e.g. *"How long has this been going on?"*) → **Approve & send**.

### 2:20–2:40 · Confirmation
> "On approval, the **Confirmation Writer** drafts the customer email — warm, human, ready
> to go. The whole loop, intake to confirmed, in under a minute."

- Show the confirmation email + the green success state.

### 2:40–3:00 · The close
> "Every agent runs on **Qwen Cloud** — qwen3.7-max for the reasoning and tool use,
> qwen3.5-flash for extraction and drafting — deployed on **Alibaba Cloud**. Autonomous
> where it's safe, supervised where it counts. That's FlowPilot."

- (Optional) cut to the public Alibaba URL in the address bar, or the GitHub repo.

---

## Talking points to hit (rubric coverage)
- **Multi-agent pipeline** + **model routing** (max vs flash) → Technical Depth (30%)
- **Deterministic Validator guardrail** between AI steps → production-readiness
- **Risk-tiered human-in-the-loop** → Innovation (30%)
- **Quantified pain** "15–30 min → under a minute" → Problem Value (25%)
- **Landing + guided flow + this video** → Presentation (15%)

## If recording the live agent feels slow (~45s)
Either (a) talk through the trace section of the landing page while it runs, or
(b) click an already-**seeded** lead (Marcus Whitfield = high-risk, Lena Okafor =
low-risk) to show a finished quote + trace instantly, then do one live run to prove
it's real.
