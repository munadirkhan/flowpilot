import { useEffect, useState } from "react";
import { personaFor } from "../lib/agents";

const STEPS = [
  { role: "Intake Qualifier", action: "is reading the inquiry", sub: "Pulling out the job, system & urgency" },
  { role: "Quote Specialist", action: "is pricing the job", sub: "Calling the pricing book & the calendar" },
  { role: "Validator", action: "is checking the math", sub: "Re-adding every line item by hand" },
  { role: "Risk Router", action: "is weighing the risk", sub: "Low vs. high — where you should look" },
];

export function AgentWorkingScreen({
  name,
  done,
  failed,
  onReview,
}: {
  name: string;
  done: boolean;
  failed: boolean;
  onReview: () => void;
}) {
  const n = STEPS.length;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < n; i++) timers.push(setTimeout(() => setStep(i), i * 1150));
    return () => timers.forEach(clearTimeout);
  }, [n]);

  useEffect(() => {
    if (done) setStep(n);
  }, [done, n]);

  return (
    <div className="center">
      <div className="agentwrap">
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <span className="eyebrow">Relay agent team · live run</span>
        </div>
        <h2 className="serif" style={{ fontSize: 34, textAlign: "center", margin: "8px 0 0" }}>
          The team is on <span className="ital indigo">{name}'s</span> inquiry…
        </h2>
        {!done ? (
          <div className="shimmer"><div className="bar" /></div>
        ) : (
          <div style={{ height: 30 }} />
        )}

        <div style={{ position: "relative", paddingLeft: 2 }}>
          <div className="aline" />
          {STEPS.map((s, i) => {
            const p = personaFor(s.role);
            const isDone = i < step || done;
            const isActive = i === step && !done;
            const rowCls = i > step && !done ? "pend" : "";
            const titleCls = isActive && i !== n - 1 ? "typing" : "";
            return (
              <div key={i} className={`astep ${rowCls}`}>
                <div
                  className={`amark ${isActive ? "mk-active" : ""}`}
                  style={
                    isDone
                      ? { background: "var(--emerald-soft)", color: "var(--emerald)" }
                      : isActive
                      ? { background: p.color, color: "#fff" }
                      : { background: "var(--chip)", color: "var(--faint)" }
                  }
                >
                  {isDone ? "✓" : p.initial}
                </div>
                <div>
                  <div className={`atitle ${titleCls}`}>
                    <span style={{ color: p.color }}>{p.name}</span> {s.action}
                  </div>
                  <div className="asub">{s.sub} · <span className="muted">{p.role}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {failed && (
          <div style={{ textAlign: "center", marginTop: 24 }} className="rose">
            The team hit an error on this inquiry. Check the trace from the inbox.
          </div>
        )}
        {done && !failed && (
          <div style={{ textAlign: "center", marginTop: 24 }} className="fade-up">
            <button className="pill" onClick={onReview}>Review the draft quote →</button>
          </div>
        )}
      </div>
    </div>
  );
}
