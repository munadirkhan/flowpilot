import { useState } from "react";
import type { Lead } from "../lib/api";
import { AgentTrace } from "./AgentTrace";
import { QuoteCard } from "./QuoteCard";
import { StatusPill } from "./StatusPill";

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  web_form: "Web form",
  phone: "Phone",
};

export function ReviewScreen({
  lead,
  busy,
  onApprove,
  onReject,
}: {
  lead: Lead;
  busy: boolean;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const q = lead.quote ?? {};
  const name = q.customer_name || lead.sender || "Customer";
  const toolCalls = (lead.agent_trace ?? []).filter((s) => s.tool).length;
  const pending = lead.status === "pending_approval";

  // Quick, human note starters — lightly tailored to the inquiry.
  const notePresets = (() => {
    const base = [
      "Anything specific you'd like us to take a look at?",
      "How long has this been going on?",
      "What time of day works best for you?",
    ];
    const urgency = (q.urgency || "").toLowerCase();
    if (urgency === "emergency" || urgency === "high")
      base.unshift("We'll prioritise getting a tech out to you quickly.");
    else base.push("Happy to answer any questions before we come out.");
    return base;
  })();

  const addNote = (preset: string) =>
    setNotes((n) => (n.trim() ? `${n.trim()} ${preset}` : preset));

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Human-in-the-loop · review #{lead.id}</div>
          <div className="serif" style={{ fontSize: 26, marginTop: 3 }}>
            {name}{q.service_summary ? ` — ${q.service_summary}` : ""}
          </div>
        </div>
        <StatusPill status={lead.status} />
      </div>

      <div className="rev">
        <div className="revL">
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Original inquiry · {CHANNEL_LABEL[lead.channel] ?? lead.channel}
          </div>
          <div className="msgbox">“{lead.raw_message}”</div>

          <div className="eyebrow" style={{ margin: "24px 0 10px" }}>
            Agent trace · {toolCalls} tool call{toolCalls === 1 ? "" : "s"}
          </div>
          <AgentTrace trace={lead.agent_trace} />
        </div>

        <div className="revR">
          {lead.risk?.label && (
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: "13px 16px",
                marginBottom: 18,
                borderRadius: 14,
                border: `1px solid ${lead.risk.label === "high" ? "#f0c6cf" : "#bfe6cf"}`,
                background: lead.risk.label === "high" ? "#fdecef" : "#eaf7f0",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1.3 }}>
                {lead.risk.label === "high" ? "⚑" : "✓"}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: lead.risk.label === "high" ? "#c01f3c" : "#0f7a45",
                  }}
                >
                  {lead.risk.label === "high" ? "High-risk quote — review carefully" : "Low-risk quote — safe to fast-approve"}
                </div>
                {lead.risk.reasons?.length ? (
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                    {lead.risk.reasons.join(" · ")}
                  </div>
                ) : null}
              </div>
            </div>
          )}
          <QuoteCard quote={q} />

          <div className="revpanel">
            {pending ? (
              <>
                <span className="flab">Notes for the customer (optional)</span>
                <div className="chips" style={{ marginBottom: 10 }}>
                  {notePresets.map((p) => (
                    <button key={p} className="chipx" onClick={() => addNote(p)}>
                      + {p}
                    </button>
                  ))}
                </div>
                <textarea
                  className="inp"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a personal note before sending…"
                  style={{ minHeight: 88 }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button className="pill green" style={{ flex: 1 }} disabled={busy} onClick={() => onApprove(notes)}>
                    {busy ? "Sending…" : "✓ Approve & send"}
                  </button>
                  <button
                    className="ghost"
                    style={{ color: "#e11d48", borderColor: "#f0c6cf" }}
                    disabled={busy}
                    onClick={() => onReject(notes)}
                  >
                    Reject
                  </button>
                </div>
                <div className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 10 }}>
                  Nothing reaches the customer until you approve
                </div>
              </>
            ) : (
              <div className="muted" style={{ fontSize: 13, textAlign: "center", padding: "6px 0" }}>
                This quote is <strong>{lead.status}</strong>.
                {lead.human_notes ? ` Note: ${lead.human_notes}` : ""}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
