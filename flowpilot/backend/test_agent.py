"""End-to-end test of the intake agent on one messy inquiry (no server needed)."""
import json
import time

from app.agent.orchestrator import run_intake_agent

MSG = ("Hi, my AC just totally died and it's like 90 degrees in here with my two "
       "kids. Started making a grinding noise yesterday then quit. Can someone "
       "come out TODAY?? It's a 3 bedroom house. Please help!!")

t0 = time.time()
extracted, quote, trace = run_intake_agent(MSG, sender="linda.m@gmail.com")
dt = time.time() - t0

print(f"\n=== took {dt:.1f}s, {len(trace)} trace steps ===")
for s in trace:
    if s["type"] == "tool_call":
        print(f"  [tool] {s.get('tool')}  args={json.dumps(s.get('args'))[:120]}")
    elif s["type"] == "thought":
        print(f"  [thought] {s.get('content','')[:100]}")
    else:
        print(f"  [{s['type']}] {str(s.get('content',''))[:100]}")

print("\n=== EXTRACTED ===")
print(json.dumps(extracted, indent=2))
print("\n=== QUOTE ===")
print(json.dumps(quote, indent=2)[:1500])
