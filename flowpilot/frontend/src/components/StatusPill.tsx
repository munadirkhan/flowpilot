import type { LeadStatus } from "../lib/api";
import { STATUS_META } from "../lib/format";

export function StatusPill({ status }: { status: LeadStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`spill ${m.pill}`}>
      <span className={`sdotp${m.pulse ? " pulse" : ""}`} style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}
