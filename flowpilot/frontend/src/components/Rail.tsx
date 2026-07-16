import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { ic: "▤", label: "Inbox", on: true },
  { ic: "◆", label: "Quotes", soon: true },
  { ic: "▦", label: "Calendar", soon: true },
  { ic: "$", label: "Pricing book", soon: true },
  { ic: "⚙", label: "Settings", soon: true },
];

function SoonPill() {
  return (
    <span
      style={{
        marginLeft: "auto",
        fontSize: 9,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "var(--muted)",
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "1px 7px",
        fontWeight: 600,
      }}
    >
      Soon
    </span>
  );
}

export function Rail({ awaiting }: { awaiting: number }) {
  return (
    <div className="rail">
      <Link
        to="/"
        className="logo"
        title="Back to the landing page"
        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
      >
        <span className="dot" />
        Re<span className="serif ital indigo" style={{ fontSize: 22 }}>lay</span>
      </Link>
      {NAV.map((n) => (
        <div key={n.label} className={`navi${n.on ? " on" : ""}${n.soon ? " soon" : ""}`}>
          <span className="ic">{n.ic}</span>
          {n.label}
          {n.on && awaiting > 0 && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                background: "var(--paper)",
                color: "var(--ink)",
                borderRadius: 999,
                padding: "1px 8px",
                fontWeight: 600,
              }}
            >
              {awaiting}
            </span>
          )}
          {n.soon && <SoonPill />}
        </div>
      ))}
      <div className="railb">
        <div className="av">DR</div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Dana Reyes</div>
          <div className="muted" style={{ fontSize: 12 }}>Northwind H&amp;C</div>
        </div>
        <ThemeToggle style={{ marginLeft: "auto" }} />
      </div>
    </div>
  );
}
