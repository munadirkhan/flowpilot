"""Realistic, messy demo inquiries — feed these to the agent to show it off.

Run the API, then:  python demo_inquiries.py
"""
import httpx

API = "http://localhost:8000"

INQUIRIES = [
    {
        "sender": "linda.m@gmail.com",
        "channel": "email",
        "raw_message": (
            "Hi, my AC just totally died and it's like 90 degrees in here with my "
            "two kids. Started making a grinding noise yesterday then quit. Can "
            "someone come out TODAY?? It's a 3 bedroom house. Please help!!"
        ),
    },
    {
        "sender": "j_porter88",
        "channel": "web_form",
        "raw_message": (
            "looking to get a quote on replacing my old furnace, it's from like 2005 "
            "and not heating well. house is around 1800 sqft. no rush, just planning "
            "ahead for winter"
        ),
    },
    {
        "sender": "frontdesk@maplecafe.com",
        "channel": "email",
        "raw_message": (
            "We run a small cafe and want to set up a regular maintenance plan for "
            "our two rooftop units. What do you offer? Also one of them has a weird "
            "smell when it turns on."
        ),
    },
    {
        "sender": "anon",
        "channel": "sms",
        "raw_message": "how much for ac",  # deliberately under-specified
    },
]


def main() -> None:
    with httpx.Client(timeout=120) as c:
        for inq in INQUIRIES:
            r = c.post(f"{API}/leads", json=inq)
            r.raise_for_status()
            lead = r.json()
            print(f"Submitted lead #{lead['id']} from {inq['sender']!r} -> {lead['status']}")
    print("\nDone. Open the dashboard (or GET /leads) to watch the agent work.")


if __name__ == "__main__":
    main()
