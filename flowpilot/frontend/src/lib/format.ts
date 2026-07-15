import type { LeadStatus } from "./api";

/** Currency with cents — for quote line items & totals. */
export const money = (n?: number) =>
  n == null ? "—" : n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Whole-dollar currency — for inbox amounts & header stats. */
export const moneyWhole = (n?: number) =>
  n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US");

export const timeAgo = (iso: string) => {
  const d = new Date(iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z");
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/** Status → design pill class + label + dot color (matches Relay App.dc.html). */
export const STATUS_META: Record<
  LeadStatus,
  { label: string; pill: string; dot: string; pulse?: boolean }
> = {
  received:         { label: "Received",       pill: "s-rec",  dot: "#3a48d6" },
  processing:       { label: "Agent working",  pill: "s-work", dot: "#b45309", pulse: true },
  pending_approval: { label: "Needs approval", pill: "s-need", dot: "#b45309" },
  approved:         { label: "Approved",       pill: "s-conf", dot: "#0f9d58" },
  confirmed:        { label: "Confirmed",      pill: "s-conf", dot: "#0f9d58" },
  rejected:         { label: "Rejected",       pill: "s-rej",  dot: "#e11d48" },
  failed:           { label: "Failed",         pill: "s-rej",  dot: "#e11d48" },
};

/** Single-glyph channel icon for the inbox row (matches the design's monochrome marks). */
export const channelIcon = (channel: string) =>
  ({ email: "✉", web_form: "⌨", sms: "✆", phone: "✆" } as Record<string, string>)[channel] ?? "✉";

/**
 * Make a model-drafted email read like a human wrote it:
 * turn literal "\n" sequences into real breaks, strip markdown bold/bullets,
 * and collapse excess blank lines. Renders inside a white-space:pre-wrap block.
 */
export const humanizeEmail = (raw?: string): string => {
  if (!raw) return "";
  return raw
    .replace(/\\n/g, "\n") // literal backslash-n → real newline
    .replace(/\r\n/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1") // **bold** → bold
    .replace(/^\s*[-*]\s+/gm, "• ") // markdown bullets → clean bullet
    .replace(/\n{3,}/g, "\n\n") // collapse runs of blank lines
    .trim();
};
