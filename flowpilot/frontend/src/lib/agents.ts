// The FlowPilot agent cast — personas layered over the backend's agent roles so the
// pipeline reads like a team, not a list of functions.

export interface AgentPersona {
  name: string;
  role: string;
  initial: string;
  emoji: string;
  color: string;
  blurb: string; // what they do, one line
}

export const AGENTS: Record<string, AgentPersona> = {
  "Intake Qualifier": {
    name: "Gwen", role: "Intake Qualifier", initial: "G", emoji: "📥", color: "#3a48d6",
    blurb: "reads the message and figures out the job",
  },
  "Quote Specialist": {
    name: "Max", role: "Quote Specialist", initial: "M", emoji: "🛠️", color: "#0f9d58",
    blurb: "prices the job from the book and tools",
  },
  "Validator": {
    name: "Ledger", role: "Validator", initial: "L", emoji: "🧮", color: "#b45309",
    blurb: "re-checks every number",
  },
  "Risk Router": {
    name: "Sentry", role: "Risk Router", initial: "S", emoji: "🛡️", color: "#c01f6c",
    blurb: "flags what needs a closer look",
  },
  "Confirmation Writer": {
    name: "Quill", role: "Confirmation Writer", initial: "Q", emoji: "✍️", color: "#7a5cd0",
    blurb: "writes the customer's confirmation",
  },
  "FlowPilot": {
    name: "FlowPilot", role: "Orchestrator", initial: "✦", emoji: "✦", color: "#16140d",
    blurb: "hands off to you",
  },
};

export function personaFor(role?: string): AgentPersona {
  return (
    AGENTS[role ?? ""] ?? {
      name: role || "Agent", role: role || "", initial: "•", emoji: "•",
      color: "#777163", blurb: "",
    }
  );
}
