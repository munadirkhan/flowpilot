"""Relay API — autonomous HVAC intake-to-quote agent with human-in-the-loop."""
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .agent.orchestrator import draft_confirmation, run_pipeline
from .agent.transcriber import transcribe
from .config import get_settings
from .db import engine, get_session, init_db
from .models import ApprovalDecision, Lead, LeadCreate, LeadStatus, utcnow

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Relay", version="0.1.0",
              description="Autonomous HVAC intake-to-quote agent with human-in-the-loop.",
              lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _process_lead(lead_id: int) -> None:
    """Background: run the agent on a lead and persist results."""
    with Session(engine) as session:
        lead = session.get(Lead, lead_id)
        if not lead:
            return
        lead.status = LeadStatus.processing
        lead.updated_at = utcnow()
        session.add(lead)
        session.commit()

        try:
            extracted, quote, risk, trace = run_pipeline(lead.raw_message, lead.sender)
            lead.extracted = extracted
            lead.quote = quote
            lead.risk = risk
            lead.agent_trace = trace
            lead.status = (LeadStatus.pending_approval if quote and "error" not in quote
                           else LeadStatus.failed)
        except Exception as exc:  # noqa: BLE001 — surface any agent failure to the UI
            lead.agent_trace = (lead.agent_trace or []) + [
                {"type": "error", "content": str(exc)}
            ]
            lead.status = LeadStatus.failed
        lead.updated_at = utcnow()
        session.add(lead)
        session.commit()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": settings.qwen_agent_model}


@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)) -> dict:
    """Voice intake: turn a customer's spoken message into inquiry text (qwen3-asr-flash)."""
    data = await audio.read()
    if not data:
        raise HTTPException(400, "empty audio upload")
    if len(data) > 8 * 1024 * 1024:  # keep base64 payload under Qwen's 10 MB cap
        raise HTTPException(413, "audio too large (8 MB max)")
    try:
        return transcribe(data, audio.filename or "audio.wav")
    except Exception as exc:  # noqa: BLE001 — surface ASR errors to the UI
        raise HTTPException(502, f"transcription failed: {exc}") from exc


@app.post("/leads", response_model=Lead, status_code=201)
def create_lead(payload: LeadCreate, background: BackgroundTasks,
                session: Session = Depends(get_session)) -> Lead:
    lead = Lead(raw_message=payload.raw_message, sender=payload.sender,
                channel=payload.channel)
    session.add(lead)
    session.commit()
    session.refresh(lead)
    background.add_task(_process_lead, lead.id)
    return lead


@app.get("/leads", response_model=list[Lead])
def list_leads(session: Session = Depends(get_session)) -> list[Lead]:
    return session.exec(select(Lead).order_by(Lead.created_at.desc())).all()


@app.get("/leads/{lead_id}", response_model=Lead)
def get_lead(lead_id: int, session: Session = Depends(get_session)) -> Lead:
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "lead not found")
    return lead


@app.post("/leads/{lead_id}/decision", response_model=Lead)
def decide(lead_id: int, decision: ApprovalDecision,
           session: Session = Depends(get_session)) -> Lead:
    """The human-in-the-loop checkpoint: approve (optionally edited) or reject."""
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "lead not found")
    if lead.status != LeadStatus.pending_approval:
        raise HTTPException(409, f"lead is {lead.status}, not awaiting approval")

    lead.human_notes = decision.notes
    if decision.edited_quote:
        lead.quote = decision.edited_quote

    if decision.decision == "approve":
        lead.status = LeadStatus.approved
        confirmation, conf_step = draft_confirmation(lead.quote, decision.notes)
        lead.confirmation = confirmation
        lead.agent_trace = (lead.agent_trace or []) + [conf_step]
        lead.status = LeadStatus.confirmed
    elif decision.decision == "reject":
        lead.status = LeadStatus.rejected
    else:
        raise HTTPException(400, "decision must be 'approve' or 'reject'")

    lead.updated_at = utcnow()
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return lead


# --- Serve the built frontend (production single-container). No-op in dev. ---
import os  # noqa: E402

from fastapi.responses import FileResponse  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402

_STATIC = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_STATIC):
    app.mount("/assets", StaticFiles(directory=os.path.join(_STATIC, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        """SPA fallback — serve real files if present, else index.html for client routing."""
        candidate = os.path.join(_STATIC, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(_STATIC, "index.html"))
