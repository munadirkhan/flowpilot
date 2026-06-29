import type { Lead } from "../lib/api";
import { channelIcon, moneyWhole, timeAgo } from "../lib/format";
import { StatusPill } from "./StatusPill";

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  web_form: "Web form",
  phone: "Phone",
};

function customerName(l: Lead) {
  return l.quote?.customer_name || l.sender || "Unknown sender";
}

export function InboxScreen({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <div className="scroll">
      <div className="listhead">
        <div>
          <div className="eyebrow">Inquiries</div>
          <div className="serif" style={{ fontSize: 30, marginTop: 4 }}>Inbox</div>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>Sorted by status · live</div>
      </div>

      {leads.length === 0 && (
        <div className="muted" style={{ fontSize: 14, padding: "60px 0", textAlign: "center" }}>
          No inquiries yet. Hit <strong>+ New inquiry</strong> to watch FlowPilot work.
        </div>
      )}

      {leads.map((l) => {
        const hasAmt = l.quote?.total != null;
        return (
          <div key={l.id} className="row" onClick={() => onOpen(l)}>
            <div className="chan">{channelIcon(l.channel)}</div>
            <div>
              <div className="cname">{customerName(l)}</div>
              <div className="cmeta">
                {(CHANNEL_LABEL[l.channel] ?? l.channel)} · {timeAgo(l.created_at)}
              </div>
            </div>
            <div className="prev">“{l.raw_message}”</div>
            <StatusPill status={l.status} />
            <div className={`amt serif ${hasAmt ? "emerald" : "muted"}`} style={hasAmt ? undefined : { opacity: 0.5 }}>
              {hasAmt ? moneyWhole(l.quote.total) : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
