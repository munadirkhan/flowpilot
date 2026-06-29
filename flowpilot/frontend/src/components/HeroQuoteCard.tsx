import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Animated hero quote card (ported from FlowPilot Hero.dc.html).
// Floats gently, reveals each row in sequence, and counts the total up to $4,746
// on a ~9.2s loop. Pure requestAnimationFrame; the buttons launch the demo.

const ACCENT = "#3a48d6";
const TARGET = 4746;
const SPEED = 1.1;
const LOOP = 9.2;

const ITEMS: [string, string][] = [
  ["Diagnostic visit & inspection", "$129.00"],
  ["Blower motor replacement, labor", "$340.00"],
  ["OEM blower motor (Carrier)", "$485.00"],
  ["Refrigerant top-off & leak check", "$165.00"],
  ["Condenser coil clean & tune", "$210.00"],
];

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const eOut = (x: number) => 1 - Math.pow(1 - x, 3);
const eExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const eInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function HeroQuoteCard() {
  const [t, setT] = useState(0);
  const start = useRef<number>(performance.now());

  useEffect(() => {
    const id = setInterval(() => {
      setT((((performance.now() - start.current) / 1000) * SPEED) % LOOP);
    }, 33);
    return () => clearInterval(id);
  }, []);

  const live = t < 8.0 ? 1 : 1 - eInOut(clamp((t - 8.0) / 1.0));
  const appear = (startAt: number, dur: number, dist = 12) => {
    const p = eOut(clamp((t - startAt) / dur));
    return { opacity: +(p * live).toFixed(3), transform: `translateY(${((1 - p) * dist).toFixed(2)}px)` };
  };
  const cp = eExpo(clamp((t - 2.4) / 2.4));
  const total = "$" + (TARGET * cp).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const float = (Math.sin(t * 0.7) * 3).toFixed(2);

  const dotGreen = { width: 8, height: 8, borderRadius: "50%", background: "#0f9d58", display: "inline-block", flex: "none" } as const;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(22,20,13,.06)",
        borderRadius: 18,
        padding: "26px 30px 28px",
        boxShadow: "0 30px 70px -28px rgba(22,20,13,.28), 0 6px 18px -10px rgba(22,20,13,.12)",
        transform: `translateY(${float}px)`,
        willChange: "transform",
      }}
    >
      {/* Drafted-in pill */}
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(15,157,88,.09)", color: "#0f9d58", fontSize: 13, fontWeight: 600,
          padding: "6px 12px 6px 11px", borderRadius: 999, marginBottom: 20, ...appear(0.4, 0.6, 8),
        }}
      >
        <span style={dotGreen} />Drafted in 31s
      </div>

      {/* head */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, ...appear(0.75, 0.55) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: ACCENT, display: "inline-block" }} />
          <span style={{ fontWeight: 600, color: "#16140d", fontSize: 15 }}>Draft quote</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={dotGreen} />
          <span style={{ color: "#0f9d58", fontWeight: 600, fontSize: 13 }}>85% confidence</span>
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: "#9a9081", margin: "0 0 20px", ...appear(1.0, 0.55) }}>
        Whitfield residence · AC blower fault · Maple Grove
      </p>

      {/* line items */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {ITEMS.map(([label, price], i) => (
          <div
            key={label}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 0", borderBottom: "1px solid rgba(22,20,13,.05)", ...appear(1.5 + i * 0.42, 0.6, 14),
            }}
          >
            <span style={{ color: "#16140d", fontSize: 15 }}>{label}</span>
            <span style={{ color: "#16140d", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>{price}</span>
          </div>
        ))}
      </div>

      {/* total */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, ...appear(1.7, 0.55) }}>
        <span style={{ color: "#9a9081", fontSize: 13, marginTop: "auto", paddingBottom: 8 }}>Estimated total</span>
        <span className="serif" style={{ color: "#0f9d58", fontSize: 60, lineHeight: 0.9, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
          {total}
        </span>
      </div>

      {/* tools used */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 8, ...appear(4.5, 0.6) }}>
        <span style={{ color: ACCENT, fontSize: 9, lineHeight: 1 }}>◆</span>
        <span style={{ color: "#9a9081", fontSize: 12 }}>5 tools used</span>
      </div>

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 22, ...appear(4.8, 0.7) }}>
        <Link
          to="/app"
          className="pill"
          style={{ flex: 1, justifyContent: "center", textAlign: "center" }}
        >
          Approve &amp; send
        </Link>
        <Link to="/app" className="ghost" style={{ border: "none", textDecoration: "underline", textUnderlineOffset: 3 }}>
          Edit
        </Link>
      </div>
    </div>
  );
}
