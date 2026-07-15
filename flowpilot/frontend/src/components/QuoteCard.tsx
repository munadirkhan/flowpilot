import type { Quote } from "../lib/api";
import { money } from "../lib/format";

function confClass(c?: number) {
  if (c == null) return { pill: "s-rec", dot: "var(--indigo)" };
  if (c >= 0.8) return { pill: "s-conf", dot: "var(--emerald)" };
  if (c >= 0.55) return { pill: "s-need", dot: "var(--amber)" };
  return { pill: "s-rej", dot: "var(--rose)" };
}

export function QuoteCard({ quote }: { quote: Quote }) {
  const items = quote.line_items ?? [];
  const conf = quote.confidence;
  const cc = confClass(conf);
  const flags = quote.ambiguity_flags ?? [];

  return (
    <div className="qcard">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="dot" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Draft quote</span>
        </div>
        {conf != null && (
          <span className={`spill ${cc.pill}`}>
            <span className="sdotp" style={{ background: cc.dot }} />
            {Math.round(conf * 100)}% confidence
          </span>
        )}
      </div>
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
        Northwind Heating &amp; Cooling · valid 14 days
      </div>

      {items.map((it, i) => (
        <div className="li" key={i}>
          <span className="lbl">
            {it.label}
            {it.qty && it.qty !== 1 ? ` × ${it.qty}` : ""}
          </span>
          <span className="amt2">{money(it.amount)}</span>
        </div>
      ))}

      <div className="srow" style={{ marginTop: 12 }}>
        <span>Subtotal</span>
        <span>{money(quote.subtotal)}</span>
      </div>
      {quote.surcharge != null && (
        <div className="srow">
          <span>{quote.surcharge > 0 ? "Emergency surcharge" : "Surcharge"}</span>
          <span>{money(quote.surcharge)}</span>
        </div>
      )}
      {quote.tax != null && (
        <div className="srow">
          <span>Tax</span>
          <span>{money(quote.tax)}</span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginTop: 14,
          borderTop: "1px solid var(--line)",
          paddingTop: 14,
        }}
      >
        <span className="muted" style={{ fontSize: 13, paddingBottom: 8 }}>Total due</span>
        <span className="bigtot serif emerald">{money(quote.total)}</span>
      </div>

      {flags.length > 0 && (
        <div className="assume">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--amber)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 8,
            }}
          >
            ⚑ Assumptions to verify
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
