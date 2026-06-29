import { useState } from "react";
import type { TraceStep } from "../lib/api";

const VERDICT_COLOR: Record<string, string> = {
  ok: "#5ec98a", pass: "#5ec98a", drafted: "#5ec98a", sent: "#5ec98a",
  ready: "#5ec98a", low_risk: "#5ec98a",
  adjusted: "#e0b765", retry: "#e0b765",
  high_risk: "#f08aa0", fail: "#f08aa0", empty: "#f08aa0", error: "#f08aa0",
};

function verdictColor(v?: string) {
  return (v && VERDICT_COLOR[v]) || "#8a8472";
}

function primaryLabel(s: TraceStep): string {
  if (s.agent) return s.agent;
  if (s.tool) return s.tool;
  if (s.type === "thought") return "reasoning";
  return s.type;
}

function body(s: TraceStep): string {
  if (s.content && s.type !== "tool_call") return s.content;
  const parts: string[] = [];
  if (s.content && s.type === "tool_call") parts.push(s.content);
  if (s.args && Object.keys(s.args).length) parts.push(JSON.stringify(s.args, null, 2));
  if (s.result !== undefined && s.tool !== "save_quote") {
    const r = typeof s.result === "string" ? s.result : JSON.stringify(s.result, null, 2);
    parts.push("→ " + (r.length > 420 ? r.slice(0, 420) + "…" : r));
  }
  return parts.join("\n") || "(no details)";
}

export function AgentTrace({ trace }: { trace: TraceStep[] }) {
  const steps = (trace ?? []).filter((s) => s.type !== "nudge");
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  const agents = new Set(steps.map((s) => s.agent).filter(Boolean));

  return (
    <div className="trace">
      <div className="thead">
        <span className="tdotr" style={{ background: "#e11d48" }} />
        <span className="tdotr" style={{ background: "#b45309" }} />
        <span className="tdotr" style={{ background: "#0f9d58" }} />
        <span className="mono" style={{ color: "#8a8472", fontSize: 11.5, marginLeft: 6 }}>
          {agents.size > 1 ? `${agents.size}-agent pipeline` : "reasoning + tools"}
        </span>
      </div>
      {steps.length === 0 && (
        <div className="tcl-body mono" style={{ padding: "13px 18px" }}>No trace recorded.</div>
      )}
      {steps.map((s, i) => {
        const isOpen = !!open[i];
        const vc = verdictColor(s.verdict);
        return (
          <div key={i} className="tcall" onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}>
            <div className="tcl-head mono" style={{ flexWrap: "wrap", rowGap: 4 }}>
              <span style={{ color: vc }}>●</span>
              <span style={{ color: "#e7e2d6", fontWeight: 500 }}>{primaryLabel(s)}</span>
              {s.tool && (
                <span style={{ color: "#a7b0f5" }}>· {s.tool}</span>
              )}
              {s.verdict && (
                <span style={{ color: vc, fontSize: 11 }}>{s.verdict.replace(/_/g, " ")}</span>
              )}
              <span style={{ color: "#6b6655", marginLeft: "auto", fontSize: 11 }}>
                {s.model || s.type}
                {s.duration_ms ? ` · ${s.duration_ms}ms` : ""}
              </span>
            </div>
            {isOpen && <div className="tcl-body mono">{body(s)}</div>}
          </div>
        );
      })}
    </div>
  );
}
