import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { startRecording, type Recorder } from "../lib/recorder";

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

type VoiceState =
  | { kind: "idle" }
  | { kind: "playing" }
  | { kind: "recording" }
  | { kind: "transcribing"; source: "voicemail" | "mic" }
  | { kind: "done"; ms: number }
  | { kind: "error"; message: string };

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
  const [voice, setVoice] = useState<VoiceState>({ kind: "idle" });
  const taRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<Recorder | null>(null);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      if (typeTimer.current) clearInterval(typeTimer.current);
    },
    []
  );

  // Reveal the transcript with a quick typing effect — it reads as "live".
  const typeIn = (full: string) => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    let i = 0;
    setText("");
    typeTimer.current = setInterval(() => {
      i = Math.min(full.length, i + 7);
      setText(full.slice(0, i));
      if (i >= full.length && typeTimer.current) clearInterval(typeTimer.current);
    }, 24);
  };

  const runTranscription = async (blob: Blob, filename: string, source: "voicemail" | "mic") => {
    setVoice({ kind: "transcribing", source });
    try {
      const r = await api.transcribe(blob, filename);
      typeIn(r.text);
      setChannel("phone");
      if (source === "voicemail" && !sender) setSender("Munadir Khan");
      setVoice({ kind: "done", ms: r.duration_ms });
    } catch (e) {
      setVoice({ kind: "error", message: (e as Error).message });
    }
  };

  // Demo voicemail: play the bundled call recording and transcribe it.
  const playVoicemail = async () => {
    if (voice.kind === "playing" || voice.kind === "transcribing") return;
    try {
      const resp = await fetch("/demo-voicemail.wav");
      if (!resp.ok) throw new Error("demo-voicemail.wav not found");
      const blob = await resp.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      setVoice({ kind: "playing" });
      audio.onended = () => runTranscription(blob, "demo-voicemail.wav", "voicemail");
      await audio.play();
    } catch (e) {
      setVoice({ kind: "error", message: (e as Error).message });
    }
  };

  // Live mic: record → stop → transcribe.
  const toggleMic = async () => {
    if (voice.kind === "recording") {
      const rec = recRef.current;
      recRef.current = null;
      if (rec) {
        const blob = await rec.stop();
        await runTranscription(blob, "mic-recording.wav", "mic");
      }
      return;
    }
    try {
      recRef.current = await startRecording();
      setVoice({ kind: "recording" });
    } catch (e) {
      setVoice({ kind: "error", message: "Mic access denied — " + (e as Error).message });
    }
  };

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onSubmit({ raw_message: text.trim(), sender: sender.trim() || undefined, channel });
    } finally {
      setBusy(false);
    }
  };

  const voiceStatus = () => {
    switch (voice.kind) {
      case "playing":
        return <span className="muted">Playing the customer's call…</span>;
      case "recording":
        return <span style={{ color: "var(--rose)", fontWeight: 600 }}>● Recording — click Stop when done</span>;
      case "transcribing":
        return <span className="indigo" style={{ fontWeight: 500 }}>Transcribing with qwen3-asr-flash…</span>;
      case "done":
        return <span className="emerald" style={{ fontWeight: 500 }}>✓ Transcribed by qwen3-asr-flash in {(voice.ms / 1000).toFixed(1)}s</span>;
      case "error":
        return <span className="rose">{voice.message}</span>;
      default:
        return (
          <span className="muted">
            In production this is your phone line (Twilio/Vapi) — here, play a sample call or speak.
          </span>
        );
    }
  };

  const transcribing = voice.kind === "transcribing";

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="eyebrow">New inquiry</div>
            <div className="serif" style={{ fontSize: 24, marginTop: 2 }}>Paste it, say it, or take the call</div>
          </div>
          <button className="ghost" onClick={onClose} style={{ padding: "8px 14px" }}>✕</button>
        </div>
        <div className="mbody">
          {/* Voice intake — the AI receptionist moment */}
          <div className="fld">
            <span className="flab">Voice intake · AI receptionist (simulated)</span>
            <div
              style={{
                border: "1px solid var(--indigo-line)",
                background: "var(--indigo-soft)",
                borderRadius: 14,
                padding: "13px 15px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                <button
                  className="chipx"
                  style={{ background: "var(--card)" }}
                  onClick={playVoicemail}
                  disabled={voice.kind === "playing" || transcribing}
                >
                  {voice.kind === "playing" ? "▶ Playing…" : "▶ Incoming call — play voicemail"}
                </button>
                <button
                  className="chipx"
                  style={
                    voice.kind === "recording"
                      ? { background: "var(--rose)", color: "#fff", borderColor: "var(--rose)" }
                      : { background: "var(--card)" }
                  }
                  onClick={toggleMic}
                  disabled={voice.kind === "playing" || transcribing}
                >
                  {voice.kind === "recording" ? "■ Stop & transcribe" : "🎙 Speak the inquiry"}
                </button>
              </div>
              <div style={{ fontSize: 12.5 }}>{voiceStatus()}</div>
            </div>
          </div>

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
            disabled={busy || transcribing || !text.trim()}
          >
            {busy ? "Submitting…" : "Submit to Relay →"}
          </button>
        </div>
      </div>
    </div>
  );
}
