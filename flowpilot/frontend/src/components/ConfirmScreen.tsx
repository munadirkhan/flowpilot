import { useMemo } from "react";
import type { Lead } from "../lib/api";
import { humanizeEmail } from "../lib/format";

const PALETTE = ["var(--indigo)", "var(--emerald)", "var(--amber)", "var(--rose)", "var(--indigo-2)"];

export function ConfirmScreen({ lead, onBack }: { lead: Lead; onBack: () => void }) {
  const conf = lead.confirmation ?? {};
  const name = lead.quote?.customer_name || lead.sender || "the customer";
  const firstName = name.split(/[\s(]/)[0];

  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const ang = (i / 18) * Math.PI * 2;
        const dist = 120 + (i % 3) * 50;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist - 40;
        return {
          background: PALETTE[i % PALETTE.length],
          animation: `cf 1.1s ${0.05 * i}s ease-out forwards`,
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
        } as React.CSSProperties;
      }),
    []
  );

  return (
    <div className="center" style={{ position: "relative" }}>
      {confetti.map((style, i) => (
        <div key={i} className="confetti" style={style} />
      ))}
      <div className="cwrap">
        <div className="checkc">✓</div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Sent · just now</div>
        <h2 className="serif" style={{ fontSize: 42, margin: 0, lineHeight: 1.05 }}>
          Quote sent to <span className="ital indigo">{firstName}.</span>
        </h2>
        <p className="muted" style={{ fontSize: 16, margin: "14px auto 0", maxWidth: 420 }}>
          Relay delivered a polished quote and is holding the recommended slot. You'll get a ping
          the moment they reply.
        </p>

        <div className="email">
          <div className="emh">
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
              To: {lead.sender || conf.to || name} · From: Northwind Heating &amp; Cooling
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {conf.subject || "Your Northwind Heating & Cooling quote"}
            </div>
          </div>
          <div className="emb">{humanizeEmail(conf.body) || "Your quote is on its way."}</div>
        </div>

        <div style={{ marginTop: 26 }}>
          <button className="pill" onClick={onBack}>← Back to inbox</button>
        </div>
      </div>
    </div>
  );
}
