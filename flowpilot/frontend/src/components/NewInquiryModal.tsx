import { useRef, useState } from "react";

const PRESETS: { name: string; sender: string; text: string; channel: string }[] = [
  {
    name: "Emergency AC",
    sender: "Marcus Whitfield",
    channel: "sms",
    text: "HELP our AC totally died and its 95 degrees in here, we have a baby. need someone out today if at all possible!! carrier unit maybe 8 yrs old",
  },
  {
    name: "Furnace replacement",
    sender: "Jordan Porter",
    channel: "email",
    text: "hi, our furnace is super old and finally giving out. heard it might be cheaper to just replace the whole thing? wondering what a new one runs. 2-story house",
  },
  {
    name: "Commercial plan",
    sender: "Priya Delgado",
    channel: "email",
    text: "We manage a 12-unit commercial property and want to set up an annual HVAC maintenance plan across all rooftop units. Can you put together pricing?",
  },
  { name: "how much for ac", sender: "Gary Holloway", channel: "web_form", text: "how much for ac" },
];

export function NewInquiryModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (body: { raw_message: string; sender?: string; channel: string }) => Promise<void>;
}) {
  const [sender, setSender] = useState("");
  const [channel, setChannel] = useState("sms");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onSubmit({ raw_message: text.trim(), sender: sender.trim() || undefined, channel });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="eyebrow">New inquiry</div>
            <div className="serif" style={{ fontSize: 24, marginTop: 2 }}>Paste a customer message</div>
          </div>
          <button className="ghost" onClick={onClose} style={{ padding: "8px 14px" }}>✕</button>
        </div>
        <div className="mbody">
          <div className="frow">
            <div className="fld">
              <span className="flab">From</span>
              <input
                className="inp"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Customer name or number"
              />
            </div>
            <div className="fld">
              <span className="flab">Channel</span>
              <select className="inp" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="web_form">Web form</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>
          <div className="fld">
            <span className="flab">Raw message</span>
            <textarea
              className="inp"
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste exactly what the customer wrote — typos and all. Relay handles the mess."
            />
          </div>
          <div className="fld">
            <span className="flab">Quick-load a preset</span>
            <div className="chips">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  className="chipx"
                  onClick={() => {
                    setText(p.text);
                    setChannel(p.channel);
                    setSender(p.sender);
                    taRef.current?.focus();
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <button
            className="pill"
            style={{ width: "100%", marginTop: 6, padding: 14 }}
            onClick={submit}
            disabled={busy || !text.trim()}
          >
            {busy ? "Submitting…" : "Submit to Relay →"}
          </button>
        </div>
      </div>
    </div>
  );
}
