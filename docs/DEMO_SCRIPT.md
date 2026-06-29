# FlowPilot — 3-Minute Demo Script

Goal: in 3 minutes a judge should see the problem, meet a named team of agents working a
live trace, see a math guardrail and risk tiering, approve with one click, and learn it
runs on Qwen Cloud and Alibaba Cloud.

**Before recording:** reset the inbox with `python seed_demo.py` (clean 6 leads). Open the
app at the **landing page** (`/`). Record at 1440px wide, browser maximized. Give the
landing a second to load so the hero animation is mid-loop when you start.

---

### 0:00–0:25 · The hook (landing page)
> "Home-service businesses, HVAC and plumbing, lose jobs to slow quotes. Pricing one
> inquiry by hand takes 15 to 30 minutes, and customers hire whoever replies first.
> This is **FlowPilot**. It turns a messy inquiry into an approved quote in under a minute."

- Open on the **animated hero**: the quote card builds itself and the total counts up to **$4,746**. Let that play for a beat, it sells the whole idea instantly.
- Scroll slowly: "Slow quotes lose jobs" → the four-step how-it-works → the agent-trace section.
- Click **Launch demo**.

### 0:25–0:45 · The inbox
> "This is the dispatcher's inbox. Real inquiries, each tiered by status: needs approval,
> agent working, confirmed. Let's bring in a brand-new one."

- Click **+ New inquiry** → click the **"Emergency AC"** preset (a messy, panicked text) → **Submit to FlowPilot**.

### 0:45–1:30 · Meet the team (the centerpiece)
> "FlowPilot isn't one prompt, it's a small team of agents, each with one job. **Gwen**
> reads the mess and works out the job and urgency. **Max** then calls real tools, the
> pricing book and the calendar, and builds the itemized quote. **Ledger** re-checks every
> number, and **Sentry** decides how closely a human should look."

- Let the animated timeline play through Gwen → Max → Ledger → Sentry (each with its avatar).
- Click **Review the draft quote →**.

### 1:30–2:25 · The review screen (the magic moment)
> "This is the human-in-the-loop checkpoint, nothing reaches the customer without me. And
> instead of a wall of logs, the team just briefs me in plain language."

- Read 2 of the **"What the team found"** bubbles out loud, e.g.
  Ledger: *"I re-added every line by hand, the math is exact at $1,580.59."*
  Sentry: *"I'm flagging this high-risk, emergency job, time pressure. Give it a close look."*

> "Notice the **risk banner**. High-risk because it's high-value with several assumptions,
> so it's telling me where to focus. And it lists the exact assumptions it made instead of
> hiding them."

- Point at the risk banner + the "Assumptions to verify" list.
- Expand the **full agent trace** underneath to show the real tool calls, model, and timing (`Gwen · qwen3.5-flash · 1180ms`, `Max · qwen3.7-max`).
- Click a note preset (e.g. *"We'll prioritise getting a tech out to you quickly."*) → **Approve & send**.

### 2:25–2:40 · Confirmation
> "On approval, **Quill** writes the customer email, warm and human, and holds the slot.
> The whole loop, intake to confirmed, in under a minute."

- Show the confirmation email + the green success state.

### 2:40–3:00 · The close
> "The team runs on **Qwen Cloud**, qwen3.7-max for the reasoning and tool use, qwen3.5-flash
> for extraction and drafting, deployed on **Alibaba Cloud**. Autonomous where it's safe,
> supervised where it counts. That's FlowPilot."

- (Optional) cut to the public Alibaba URL in the address bar, or the GitHub repo.

---

## The cast (say the names, it sticks)
| | Agent | Job | Model |
|---|---|---|---|
| Gwen | Intake Qualifier | reads the message | qwen3.5-flash |
| Max | Quote Specialist | prices it with real tools | qwen3.7-max |
| Ledger | Validator | re-checks every number | deterministic |
| Sentry | Risk Router | flags what to look at | deterministic |
| Quill | Confirmation Writer | writes the customer email | qwen3.5-flash |

## Talking points to hit (rubric coverage)
- **Named multi-agent team** + **model routing** (max vs flash) → Technical Depth (30%)
- **Deterministic Validator guardrail** between AI steps → production-readiness
- **Risk-tiered human-in-the-loop** + first-person team readout → Innovation (30%)
- **Quantified pain** "15–30 min to under a minute" → Problem Value (25%)
- **Animated landing + guided flow + this video** → Presentation (15%)

## If the live agent run feels slow (~45s)
Either (a) talk through the team narrative while it runs, or (b) click an already-**seeded**
lead (Marcus Whitfield = high-risk, Lena Okafor = low-risk) to show a finished quote, team
readout, and trace instantly, then do one live run to prove it's real.
