// API client + types for the Relay backend.
// In dev, Vite proxies /api -> http://localhost:8000 (see vite.config.ts).
const BASE = import.meta.env.VITE_API_BASE ?? "/api";

export type LeadStatus =
  | "received"
  | "processing"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "confirmed"
  | "failed";

export interface LineItem {
  service_key?: string;
  label: string;
  qty?: number;
  unit_price?: number;
  amount: number;
}

export interface Quote {
  customer_name?: string;
  service_summary?: string;
  urgency?: string;
  line_items?: LineItem[];
  subtotal?: number;
  surcharge?: number;
  tax?: number;
  total?: number;
  recommended_slot?: string;
  confidence?: number;
  ambiguity_flags?: string[];
  customer_message?: string;
}

export interface TraceStep {
  step?: number;
  type: string;
  content?: string;
  tool?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  // Multi-agent enrichment
  agent?: string;
  model?: string;
  verdict?: string;
  duration_ms?: number;
}

export interface RiskInfo {
  label?: "low" | "high" | string;
  reasons?: string[];
}

export interface Confirmation {
  to?: string;
  subject?: string;
  body?: string;
  status?: string;
}

export interface Lead {
  id: number;
  created_at: string;
  updated_at: string;
  channel: string;
  raw_message: string;
  sender?: string | null;
  status: LeadStatus;
  extracted: Record<string, unknown>;
  quote: Quote;
  risk: RiskInfo;
  agent_trace: TraceStep[];
  confirmation: Confirmation;
  human_notes?: string | null;
}

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  listLeads: () => fetch(`${BASE}/leads`).then((r) => j<Lead[]>(r)),
  getLead: (id: number) => fetch(`${BASE}/leads/${id}`).then((r) => j<Lead>(r)),
  createLead: (body: { raw_message: string; sender?: string; channel?: string }) =>
    fetch(`${BASE}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => j<Lead>(r)),
  decide: (
    id: number,
    body: { decision: "approve" | "reject"; notes?: string; edited_quote?: Quote }
  ) =>
    fetch(`${BASE}/leads/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => j<Lead>(r)),
};
