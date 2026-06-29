import { useEffect, useMemo, useState } from "react";
import { api, type Lead } from "./lib/api";
import { Rail } from "./components/Rail";
import { Topbar } from "./components/Topbar";
import { InboxScreen } from "./components/InboxScreen";
import { NewInquiryModal } from "./components/NewInquiryModal";
import { AgentWorkingScreen } from "./components/AgentWorkingScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { ConfirmScreen } from "./components/ConfirmScreen";

type Screen = "inbox" | "agent" | "review" | "confirm";

const DONE_STATES = new Set(["pending_approval", "approved", "confirmed", "rejected", "failed"]);

export default function FlowPilotApp() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [screen, setScreen] = useState<Screen>("inbox");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  // Poll the backend — fast while anything is mid-flight or we're watching the agent.
  const statusKey = leads.map((l) => l.status).join(",");
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const d = await api.listLeads();
        if (alive) {
          setLeads(d);
          setErr(null);
        }
      } catch (e) {
        if (alive) setErr((e as Error).message);
      }
    };
    tick();
    const fast =
      screen === "agent" || leads.some((l) => l.status === "processing" || l.status === "received");
    const iv = setInterval(tick, fast ? 1500 : 4000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [screen, statusKey]);

  const stats = useMemo(() => {
    const awaiting = leads.filter((l) => l.status === "pending_approval").length;
    const pipeline = leads
      .filter((l) => l.status === "confirmed")
      .reduce((s, l) => s + (l.quote?.total ?? 0), 0);
    return { leadsToday: leads.length, awaiting, pipeline };
  }, [leads]);

  const submit = async (body: { raw_message: string; sender?: string; channel: string }) => {
    const lead = await api.createLead(body);
    setLeads((prev) => [lead, ...prev.filter((l) => l.id !== lead.id)]);
    setActiveId(lead.id);
    setShowNew(false);
    setScreen("agent");
  };

  const openLead = (l: Lead) => {
    setActiveId(l.id);
    if (l.status === "processing" || l.status === "received") setScreen("agent");
    else if (l.status === "confirmed" || l.status === "approved") setScreen("confirm");
    else setScreen("review"); // pending_approval, rejected, failed
  };

  const approve = async (notes: string) => {
    if (!activeId) return;
    setBusy(true);
    try {
      const updated = await api.decide(activeId, { decision: "approve", notes: notes || undefined });
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setScreen("confirm");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reject = async (notes: string) => {
    if (!activeId) return;
    setBusy(true);
    try {
      const updated = await api.decide(activeId, { decision: "reject", notes: notes || undefined });
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setScreen("inbox");
      setActiveId(null);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const backToInbox = () => {
    setScreen("inbox");
    setActiveId(null);
  };

  const agentName =
    activeLead?.quote?.customer_name || activeLead?.sender || "this customer";

  return (
    <div className="app">
      <div className="grain" />
      {screen === "inbox" && <Rail awaiting={stats.awaiting} />}

      <div className="main">
        {err && <div className="errbar">Can't reach the agent backend ({err}). Is the API running on :8000?</div>}

        {screen === "inbox" && (
          <>
            <Topbar
              leadsToday={stats.leadsToday}
              awaiting={stats.awaiting}
              pipeline={stats.pipeline}
              onNew={() => setShowNew(true)}
            />
            <InboxScreen leads={leads} onOpen={openLead} />
          </>
        )}

        {screen === "agent" && activeLead && (
          <AgentWorkingScreen
            name={agentName}
            done={DONE_STATES.has(activeLead.status)}
            failed={activeLead.status === "failed"}
            onReview={() => setScreen("review")}
          />
        )}

        {screen === "review" && activeLead && (
          <ReviewScreen lead={activeLead} busy={busy} onApprove={approve} onReject={reject} />
        )}

        {screen === "confirm" && activeLead && (
          <ConfirmScreen lead={activeLead} onBack={backToInbox} />
        )}
      </div>

      {showNew && <NewInquiryModal onClose={() => setShowNew(false)} onSubmit={submit} />}
    </div>
  );
}
