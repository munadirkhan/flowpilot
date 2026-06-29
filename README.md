# FlowPilot 🛩️

**An autopilot agent that turns chaotic home-service inquiries into approved quotes in under a minute — multi-agent reasoning, real tools, human sign-off.**

Built for the **Global AI Hackathon Series with Qwen Cloud** · Track 4: Autopilot Agent.
Runs on **Qwen Cloud** (`qwen3.7-max` + `qwen3.5-flash`).

---

A messy customer message comes in — *"AC blowing warm + rattling, can someone come this week?"* or just *"how much for ac"*. FlowPilot reads it, figures out the job and urgency, looks up real pricing and calendar availability, and drafts a defensible quote — flagging every assumption it had to make and tiering it by risk. A human dispatcher reviews, edits if needed, and approves. Only then does FlowPilot send the customer a polished confirmation. Every decision is recorded in a transparent, step-by-step agent trace.

It's not a chatbot. It's a worker that completes a real back-office workflow.

## The problem
Home-service businesses (HVAC, plumbing, cleaning) lose jobs to slow quotes. Pricing one inquiry by hand takes **15–30 minutes** of a skilled tech's or owner's time, and homeowners hire **whoever replies first**. The inquiries that go cold are the ones that arrive nights and weekends. FlowPilot collapses that to ~30 seconds while keeping a human in control.

## Architecture — a multi-agent pipeline

![FlowPilot architecture](docs/architecture.svg)

```
inquiry
  1. Gwen   · Intake Qualifier    (qwen3.5-flash) → structured profile: intent, urgency, missing info
  2. Max    · Quote Specialist    (qwen3.7-max)   → autonomous tool-calling loop builds the quote
  3. Ledger · Validator           (deterministic) → recomputes every total; the LLM can't ship bad math
  4. Sentry · Risk Router         (deterministic) → tiers the quote low / high risk
  ─────────────── pending_approval · HUMAN GATE ───────────────
     dispatcher approves / edits / rejects (nothing reaches the customer first)
  5. Quill  · Confirmation Writer (qwen3.5-flash) → writes + sends the customer email
confirmed ✅
```

Three specialized LLM roles (each its own prompt + job), two deterministic guardrails, and one human checkpoint. Work is split so each call is simpler and more reliable, a cheap model handles the easy jobs while the strong model does the tool-using reasoning, and **non-AI safety checks sit between the AI steps** — the Validator catches arithmetic drift before it ever reaches a customer.

### Meet the team
The pipeline is presented as a named crew so the dispatcher can follow exactly who did what. On the approval screen, each agent **briefs you in first person about that specific client's quote** ("*I re-added every line by hand — the math is exact at $1,580.59*"), and the live trace + working screen show each agent with its own avatar.

| | Agent | Job |
|---|---|---|
| 📥 **Gwen** | Intake Qualifier | Reads the messy message, pulls out the job, system & urgency |
| 🛠️ **Max** | Quote Specialist | Calls the pricing book + calendar, builds the itemized quote |
| 🧮 **Ledger** | Validator | Re-checks every number — deterministic, no LLM math |
| 🛡️ **Sentry** | Risk Router | Tiers the quote low/high and says *why* |
| ✍️ **Quill** | Confirmation Writer | Writes the customer's confirmation once you approve |

### Why this maps to Track 4
| Rubric criterion | How FlowPilot delivers |
|---|---|
| **Ambiguous inputs** | Infers intent from vague text; surfaces assumptions instead of silently guessing |
| **External tool use** | `get_pricing_book` → `check_calendar_availability` → `save_quote`, chosen autonomously |
| **Human-in-the-loop** | Real `pending_approval` gate; risk-tiered so attention goes where it matters |
| **End-to-end workflow** | Intake → quote → confirm, a complete business process |
| **Production-readiness** | Typed state machine, deterministic validator, full agent trace, one-container deploy |
| **Qwen Cloud** | All reasoning on Qwen via the OpenAI-compatible DashScope endpoint, with model routing |

## Tech stack
- **Backend:** Python · FastAPI · SQLModel/SQLite · OpenAI SDK → Qwen Cloud (DashScope intl)
- **Frontend:** React · Vite · TypeScript (light-editorial design, named agent team + first-person "team readout", animated agent trace, risk banners)
- **Models:** `qwen3.7-max` (reasoning/tools), `qwen3.5-flash` (extraction + drafting)
- **Deploy:** single Docker container (API serves the built SPA) on Alibaba Cloud ECS

## Run it locally
Requires Python 3.12+, Node 20+, and a Qwen Cloud API key.

```bash
# 1. Backend
cd flowpilot/backend
python -m venv .venv && .venv\Scripts\activate      # Windows; use source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
copy .env.example .env                               # then put your QWEN_API_KEY in .env
python seed_demo.py                                  # optional: 6 demo leads
python -m uvicorn app.main:app --port 8000

# 2. Frontend (second terminal)
cd flowpilot/frontend
npm install
npm run dev
```

Open <http://localhost:5173>. (A local **Ollama** fallback is preconfigured in `.env` if you'd rather run offline — see the commented block.)

## Deploy to Alibaba Cloud
See **[deploy/alibaba/DEPLOY.md](flowpilot/deploy/alibaba/DEPLOY.md)** — one container, one public URL.

## Repo layout
```
flowpilot/
  backend/   FastAPI app, the multi-agent pipeline (app/agent/), tools, seed + tests
  frontend/  React/Vite SPA (landing + 5-screen app flow)
  Dockerfile, docker-compose.yml   single-container build
  deploy/alibaba/DEPLOY.md         deployment runbook
docs/        architecture diagram, Devpost copy
```

## Get a Qwen Cloud API key
1. Sign up at [home.qwencloud.com](https://home.qwencloud.com/) — free, no card. 1M free tokens/model, 90 days. (Quota can take 1–3 days to activate.)
2. Model Studio → **API Keys** → **Create API key**.
3. Put it in `flowpilot/backend/.env` as `QWEN_API_KEY`.

## License
MIT — see [LICENSE](LICENSE).
