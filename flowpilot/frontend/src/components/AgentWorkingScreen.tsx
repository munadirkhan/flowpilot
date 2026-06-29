import { useEffect, useState } from "react";

const STEPS = [
  { title: "Intake Qualifier", sub: "Extracting intent, system, and urgency from the message" },
  { title: "Quote Specialist", sub: "Calling the pricing book + calendar, building line items" },
  { title: "Validator", sub: "Recomputing every total against the pricing rules" },
  { title: "Risk Router", sub: "Tiering the quote — low vs. high risk for your review" },
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

  // Reveal steps one at a time; the last one keeps pulsing until the backend finishes.
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
          <span className="eyebrow">FlowPilot agent · live run</span>
        </div>
        <h2 className="serif" style={{ fontSize: 34, textAlign: "center", margin: "8px 0 0" }}>
          Working on <span className="ital indigo">{name}'s</span> inquiry…
        </h2>
        {!done && (
          <div className="shimmer">
            <div className="bar" />
          </div>
        )}
        {done && <div style={{ height: 30 }} />}

        <div style={{ position: "relative", paddingLeft: 2 }}>
          <div className="aline" />
          {STEPS.map((s, i) => {
            const isDone = i < step || done;
            const isActive = i === step && !done;
            const rowCls = i > step && !done ? "pend" : "";
            const markCls = isDone ? "mk-done" : isActive ? "mk-active" : "mk-pend";
            const mark = isDone ? "✓" : isActive ? "•" : i + 1;
            const titleCls = isActive && i !== n - 1 ? "typing" : "";
            return (
              <div key={i} className={`astep ${rowCls}`}>
                <div className={`amark ${markCls}`}>{mark}</div>
                <div>
                  <div className={`atitle ${titleCls}`}>{s.title}</div>
                  <div className="asub">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {failed && (
          <div style={{ textAlign: "center", marginTop: 24 }} className="rose">
            The agent hit an error on this inquiry. Check the trace from the inbox.
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
