import type { Lead } from "../lib/api";
import { personaFor, type AgentPersona } from "../lib/agents";
import { money } from "../lib/format";

export function AgentAvatar({ persona, size = 28 }: { persona: AgentPersona; size?: number }) {
  return (
    <span
      title={`${persona.name} · ${persona.role}`}
      style={{
        width: size, height: size, borderRadius: "50%", background: persona.color,
        color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.42, fontWeight: 600, flexShrink: 0,
      }}
    >
      {persona.initial}
    </span>
  );
}

function messages(lead: Lead): { role: string; text: string }[] {
  const q = lead.quote ?? {};
  const ex = lead.extracted ?? {};
  const name = q.customer_name || lead.sender || "this customer";
  const first = name.split(/[\s(]/)[0];
  const summary = q.service_summary || (ex.service_summary as string) || "an inquiry";
  const urgency = q.urgency || (ex.urgency as string) || "standard";
  const items = q.line_items ?? [];
  const out: { role: string; text: string }[] = [];

  out.push({
    role: "Intake Qualifier",
    text: `I read ${first}'s message — ${summary}. I'm reading the urgency as ${urgency}.`,
  });

  if (items.length) {
    out.push({
      role: "Quote Specialist",
      text:
        `Priced it from our book — ${items.length} line item${items.length === 1 ? "" : "s"} ` +
        `totalling ${money(q.total)}.` +
        (q.recommended_slot ? ` I've penciled in ${q.recommended_slot}.` : ""),
    });
  }

  if (q.total != null) {
    const v = (lead.agent_trace ?? []).find((s) => s.agent === "Validator");
    out.push({
      role: "Validator",
      text:
        v?.verdict === "adjusted"
          ? `Heads up — the model's math had drifted, so I corrected it. ${money(q.total)} is now exact.`
          : `I re-added every line by hand — the math is exact at ${money(q.total)}.`,
    });
  }

  if (lead.risk?.label) {
    const reasons = (lead.risk.reasons ?? []).join("; ");
    out.push({
      role: "Risk Router",
      text:
        lead.risk.label === "high"
          ? `I'm flagging this high-risk — ${reasons}. Give it a close look before sending.`
          : `Low-risk — ${reasons}. Safe to fast-approve.`,
    });
  }

  out.push({
    role: "Confirmation Writer",
    text:
      lead.status === "confirmed"
        ? `Sent — ${first} has the confirmation and the slot is held.`
        : `I've got a warm note drafted for ${first} — I'll send it the second you approve.`,
  });

  return out;
}

export function TeamReadout({ lead }: { lead: Lead }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {messages(lead).map((m, i) => {
        const p = personaFor(m.role);
        return (
          <div key={i} className="fade-up" style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <AgentAvatar persona={p} />
            <div
              style={{
                background: "#fff", border: "1px solid #e7e2d6", borderRadius: 14,
                borderTopLeftRadius: 4, padding: "10px 14px", flex: 1,
                boxShadow: "0 1px 2px rgba(22,20,13,.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 3 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: p.color }}>{p.name}</span>
                <span className="muted" style={{ fontSize: 11 }}>{p.role}</span>
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "#2c281f" }}>{m.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
