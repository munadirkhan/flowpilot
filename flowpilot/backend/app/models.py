"""Database models and API schemas for Relay."""
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class LeadStatus(str, Enum):
    received = "received"          # raw inquiry stored
    processing = "processing"     # agent is running
    pending_approval = "pending_approval"  # quote drafted, awaiting human (HITL)
    approved = "approved"         # human approved
    rejected = "rejected"         # human rejected
    confirmed = "confirmed"       # confirmation dispatched to customer
    failed = "failed"             # agent error


class Lead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    # Raw, ambiguous inbound message — the agent's job is to make sense of it.
    channel: str = "email"
    raw_message: str
    sender: Optional[str] = None

    status: LeadStatus = Field(default=LeadStatus.received)

    # Structured + generated artifacts (JSON blobs).
    extracted: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    quote: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    risk: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    agent_trace: list[dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    confirmation: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    # Human-in-the-loop feedback.
    human_notes: Optional[str] = None


# ---------- API request/response schemas ----------

class LeadCreate(SQLModel):
    raw_message: str
    sender: Optional[str] = None
    channel: str = "email"


class ApprovalDecision(SQLModel):
    decision: str  # "approve" | "reject"
    notes: Optional[str] = None
    # Optional human edits to the quote before approving.
    edited_quote: Optional[dict[str, Any]] = None
