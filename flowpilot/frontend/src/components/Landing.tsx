import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../landing.css";

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal + sticky-nav border (ported from the design's componentDidMount).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach((n) => {
      if (n.getBoundingClientRect().top < (window.innerHeight || 800)) n.classList.add("in");
      else io.observe(n);
    });
    const failsafe = setTimeout(() => nodes.forEach((n) => n.classList.add("in")), 600);

    const nav = root.querySelector(".nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      clearTimeout(failsafe);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="lp" ref={rootRef}>
      <div className="grain" />

      {/* NAV */}
      <div className="nav">
        <div className="cont navrow">
          <div className="logo">
            <span className="dot" />Flow
            <span className="serif ital indigo" style={{ fontSize: 23 }}>Pilot</span>
          </div>
          <div className="navlinks">
            <a href="#how">How it works</a>
            <a href="#agent">The agent</a>
            <a href="#cta">Demo</a>
          </div>
          <Link className="pill" to="/app">Launch demo</Link>
        </div>
      </div>

      {/* HERO */}
      <div className="cont hero">
        <div>
          <div className="reveal" style={{ marginBottom: 26 }}>
            <span className="tag"><span className="tagdot" />Autonomous agent · human sign-off</span>
          </div>
          <h1 className="h1 serif reveal d1">
            Your front desk,<br />
            <span className="ital indigo">on autopilot.</span>
          </h1>
          <p className="lede reveal d2" style={{ marginTop: 26 }}>
            FlowPilot turns chaotic customer inquiries into approved quotes in 30 seconds —
            autonomous reasoning, real tools, human sign-off.
          </p>
          <div className="reveal d3" style={{ display: "flex", gap: 13, marginTop: 32, flexWrap: "wrap" }}>
            <a className="pill" href="#agent">See it work</a>
            <a className="ghost" href="#how">How it works</a>
          </div>
          <div className="reveal d4 muted" style={{ marginTop: 18, fontSize: 13 }}>
            Demo company · Northwind Heating &amp; Cooling
          </div>
        </div>

        <div className="reveal d2" style={{ position: "relative" }}>
          <div className="card qcard">
            <div className="qtop">
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span className="dot" style={{ margin: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Draft quote</span>
              </div>
              <span className="conf">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0f9d58", display: "inline-block" }} />
                85% confidence
              </span>
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
              Whitfield residence · AC blower fault · Maple Grove
            </div>
            {[
              ["Diagnostic visit & inspection", "$129.00"],
              ["Blower motor replacement — labor", "$340.00"],
              ["OEM blower motor (Carrier)", "$485.00"],
              ["Refrigerant top-off & leak check", "$165.00"],
            ].map(([l, a]) => (
              <div className="li" key={l}>
                <span className="lbl">{l}</span>
                <span className="amt">{a}</span>
              </div>
            ))}
            <div className="li" style={{ border: "none" }}>
              <span className="lbl">Condenser coil clean &amp; tune</span>
              <span className="amt">$210.00</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16 }}>
              <span className="muted" style={{ fontSize: 13, paddingBottom: 8 }}>Estimated total</span>
              <span className="bigtot serif emerald">$4,746.00</span>
            </div>
            <div className="appbar">
              <Link className="pill" to="/app" style={{ flex: 1, justifyContent: "center" }}>Approve &amp; send</Link>
              <Link className="ghost" to="/app">Edit</Link>
            </div>
          </div>
          <div className="float" style={{ top: -18, left: -26 }}><span className="tagdot" />Drafted in 31s</div>
          <div className="float" style={{ bottom: 64, right: -30 }}><span style={{ color: "#3a48d6" }}>◆</span>5 tools used</div>
        </div>
      </div>

      {/* PROBLEM */}
      <div className="cont problem reveal" id="problem">
        <h2 className="pline serif">Slow quotes <span className="ital rose">lose jobs.</span></h2>
        <div className="pgrid">
          <div className="pcard">
            <div className="pnum serif">15–30<span className="muted" style={{ fontSize: ".4em", fontFamily: "Inter" }}> min</span></div>
            <div style={{ fontWeight: 600, margin: "14px 0 4px" }}>Per quote, by hand</div>
            <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}>
              Pricing a single job ties up your best tech or office manager.
            </p>
          </div>
          <div className="pcard">
            <div className="pnum serif rose">78<span style={{ fontSize: ".4em", fontFamily: "Inter" }} className="muted">%</span></div>
            <div style={{ fontWeight: 600, margin: "14px 0 4px" }}>Lost to faster bids</div>
            <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}>
              Homeowners hire whoever replies first. Speed wins the job.
            </p>
          </div>
          <div className="pcard">
            <div className="pnum serif">24/7</div>
            <div style={{ fontWeight: 600, margin: "14px 0 4px" }}>Nights &amp; weekends</div>
            <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}>
              The inquiries that go cold are the ones that arrive after hours.
            </p>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="cont" id="how" style={{ padding: "96px 0 20px" }}>
        <div className="sectlabel reveal">
          <span className="eyebrow">How it works</span>
          <span className="ln" />
          <span className="muted" style={{ fontSize: 13.5 }}>Inquiry to confirmed, on autopilot</span>
        </div>
        <h2 className="fbig serif reveal d1" style={{ maxWidth: 720 }}>
          From a messy text to a <span className="ital indigo">confirmed job</span> — four steps.
        </h2>
        <div className="flow reveal d2">
          <div className="flowline" />
          {[
            ["✉", "STEP 01", "Inquiry arrives", "A text, email or voicemail lands. FlowPilot reads it instantly."],
            ["◆", "STEP 02", "Agent qualifies & prices", "It reasons through the job and builds itemized pricing from your book."],
            ["✓", "STEP 03", "You approve", "The draft hits your queue. Send, edit, or reject in one tap."],
            ["★", "STEP 04", "Customer confirmed", "The quote goes out, books a slot, and the lead is won."],
          ].map(([ic, num, h, p]) => (
            <div className="fstep" key={num}>
              <div className="ficon">{ic}</div>
              <div className="num">{num}</div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AGENT */}
      <div className="cont" id="agent" style={{ padding: "96px 0 20px" }}>
        <div className="sectlabel reveal">
          <span className="eyebrow">Watch the agent think</span>
          <span className="ln" />
          <span className="muted" style={{ fontSize: 13.5 }}>Autonomous · transparent · tool-using</span>
        </div>
        <div className="agentgrid" style={{ display: "grid", gridTemplateColumns: ".82fr 1.18fr", gap: 50, alignItems: "center" }}>
          <div className="reveal">
            <h2 className="fbig serif">
              No black box.<br /><span className="ital indigo">Every move, in the open.</span>
            </h2>
            <p className="lede" style={{ marginTop: 20 }}>
              FlowPilot doesn't just spit out an answer. It reasons step by step and calls real tools —
              your pricing book, your calendar — then shows its work. You see exactly how it reached the number.
            </p>
          </div>
          <div className="reveal d2">
            <div className="trace">
              <div className="thead">
                <span className="tdotr" style={{ background: "#e11d48" }} />
                <span className="tdotr" style={{ background: "#b45309" }} />
                <span className="tdotr" style={{ background: "#0f9d58" }} />
                <span className="mono" style={{ color: "#8a8472", fontSize: 12, marginLeft: 8 }}>flowpilot · agent run #4817</span>
              </div>
              <div className="tbody mono">
                <div className="trow">
                  <span className="gut">1</span>
                  <span>
                    <span className="tcmt"># read the inquiry</span><br />
                    parse_message<span className="tk">(</span>"AC blowing warm + rattle, Carrier ~2015"<span className="tk">)</span> <span className="tok">✓</span>
                  </span>
                </div>
                <div className="trow" style={{ marginTop: 8 }}>
                  <span className="gut">2</span>
                  <span>get_pricing_book<span className="tk">(</span>service=<span className="tok">"hvac"</span>, parts=<span className="tok">"blower_motor"</span><span className="tk">)</span> <span className="tok">✓ 5 line items</span></span>
                </div>
                <div className="trow" style={{ marginTop: 8 }}>
                  <span className="gut">3</span>
                  <span>check_calendar<span className="tk">(</span>zone=<span className="tok">"maple_grove"</span><span className="tk">)</span> <span className="tok">✓ Thu 9am open</span></span>
                </div>
                <div className="trow" style={{ marginTop: 8 }}>
                  <span className="gut">4</span>
                  <span>save_quote<span className="tk">(</span>total=<span className="tok">$4,746.00</span>, confidence=<span className="tok">0.85</span><span className="tk">)</span> <span className="tok">✓</span></span>
                </div>
                <div className="trow" style={{ marginTop: 12 }}>
                  <span className="gut">→</span>
                  <span style={{ color: "#f4f2ec" }}>Draft ready for human approval <span className="cur" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST */}
      <div className="cont trust">
        <div className="reveal">
          <span className="eyebrow">Built for trust</span>
          <div className="qwen" style={{ margin: "18px 0 22px" }}>
            <span className="dot" style={{ margin: 0 }} />Built on <span className="serif ital" style={{ fontSize: 20 }}>Qwen</span>
          </div>
          <p className="lede">
            Reasoning runs on Qwen. But the agent never acts alone —{" "}
            <span style={{ color: "#16140d", fontWeight: 600 }}>a human approves every quote before a customer ever sees it.</span>{" "}
            Autonomous where it's safe, supervised where it counts.
          </p>
        </div>
        <div
          className="reveal d2"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#e7e2d6", border: "1px solid #e7e2d6", borderRadius: 18, overflow: "hidden" }}
        >
          {[
            ["100", "%", "", "Human-approved before send"],
            ["30s", "", "indigo", "Inquiry to drafted quote"],
            ["5", "", "emerald", "Real tools per run"],
            ["0", "", "", "Quotes sent without you"],
          ].map(([n, unit, color, label], i) => (
            <div key={i} style={{ background: "#f4f2ec", padding: "28px 24px" }}>
              <div className={`serif ${color}`} style={{ fontSize: 44, lineHeight: 1 }}>
                {n}{unit && <span className="muted" style={{ fontSize: ".4em" }}>{unit}</span>}
              </div>
              <div className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cont" id="cta">
        <div className="cta reveal">
          <span className="eyebrow" style={{ color: "#b8b2a0" }}>Track · autonomous agents</span>
          <h2 className="serif" style={{ fontSize: "clamp(40px,6.5vw,80px)", lineHeight: 1.02, margin: "16px 0 14px", letterSpacing: "-.02em" }}>
            Put your front desk <span className="ital" style={{ color: "#a7b0f5" }}>on autopilot.</span>
          </h2>
          <p style={{ color: "#cfc9ba", maxWidth: 500, margin: "0 auto 30px", fontSize: 18, lineHeight: 1.55 }}>
            Watch FlowPilot draft a real quote from a live inquiry — start to approved in under a minute.
          </p>
          <div style={{ display: "flex", gap: 13, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="pill" to="/app">Launch demo</Link>
            <a
              className="ghost"
              href="https://github.com/munadirkhan/flowpilot"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#f4f2ec", borderColor: "#3a382f" }}
            >
              View the code →
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="cont">
        <div className="footer">
          <div className="logo">
            <span className="dot" />Flow<span className="serif ital indigo" style={{ fontSize: 21 }}>Pilot</span>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>© 2026 FlowPilot · Built on Qwen · Autonomous Agents track</span>
        </div>
      </div>
    </div>
  );
}
