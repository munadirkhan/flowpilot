const NAV = [
  { ic: "▤", label: "Inbox", on: true, badge: 0 },
  { ic: "◆", label: "Quotes" },
  { ic: "▦", label: "Calendar" },
  { ic: "$", label: "Pricing book" },
  { ic: "⚙", label: "Settings" },
];

export function Rail({ awaiting }: { awaiting: number }) {
  return (
    <div className="rail">
      <div className="logo">
        <span className="dot" />
        Flow<span className="serif ital indigo" style={{ fontSize: 22 }}>Pilot</span>
      </div>
      {NAV.map((n) => (
        <div key={n.label} className={`navi${n.on ? " on" : ""}`}>
          <span className="ic">{n.ic}</span>
          {n.label}
          {n.on && awaiting > 0 && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                background: "#f4f2ec",
                color: "#16140d",
                borderRadius: 999,
                padding: "1px 8px",
                fontWeight: 600,
              }}
            >
              {awaiting}
            </span>
          )}
        </div>
      ))}
      <div className="railb">
        <div className="av">DR</div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Dana Reyes</div>
          <div className="muted" style={{ fontSize: 12 }}>Northwind H&amp;C</div>
        </div>
      </div>
    </div>
  );
}
