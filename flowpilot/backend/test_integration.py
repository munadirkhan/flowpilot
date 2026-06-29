"""Full-stack integration test against the running API: submit -> agent -> approve."""
import time
import httpx

API = "http://127.0.0.1:8000"
MSG = ("looking to get a quote on replacing my old furnace, it's from like 2005 "
       "and not heating well. house is around 1800 sqft. no rush, just planning "
       "ahead for winter")

with httpx.Client(timeout=120) as c:
    lead = c.post(f"{API}/leads", json={"sender": "j_porter88", "channel": "web_form",
                                        "raw_message": MSG}).json()
    lid = lead["id"]
    print(f"submitted lead #{lid}, status={lead['status']}")

    # Poll until the multi-agent pipeline finishes (qualifier + specialist run sequentially).
    for _ in range(120):
        time.sleep(2)
        lead = c.get(f"{API}/leads/{lid}").json()
        print(f"  ... status={lead['status']}")
        if lead["status"] in ("pending_approval", "failed"):
            break

    if lead["status"] == "pending_approval":
        q = lead["quote"]
        print("\n=== MULTI-AGENT TRACE ===")
        for s in lead["agent_trace"]:
            print(f"  [{s.get('agent','?'):<18}] {s.get('type','?'):<11} "
                  f"{s.get('tool') or '':<28} model={s.get('model','-'):<16} "
                  f"verdict={s.get('verdict','-')} ({s.get('duration_ms',0)}ms)")
        print(f"\nQUOTE: {q.get('service_summary')}")
        print(f"  total={q.get('total')} confidence={q.get('confidence')}")
        print(f"  flags={q.get('ambiguity_flags')}")
        print(f"RISK: {lead.get('risk')}")

        # Human approves (HITL).
        lead = c.post(f"{API}/leads/{lid}/decision",
                      json={"decision": "approve", "notes": "Looks good, proceed."}).json()
        print(f"\nafter approval: status={lead['status']}")
        print(f"confirmation subject: {lead['confirmation'].get('subject')}")
        print(f"confirmation writer step present: "
              f"{any(s.get('agent') == 'Confirmation Writer' for s in lead['agent_trace'])}")
    else:
        print("AGENT FAILED — trace:")
        for s in lead["agent_trace"]:
            print(" ", s)
