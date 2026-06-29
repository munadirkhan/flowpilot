"""Diagnose Ollama OpenAI-compatible tool-calling across local Qwen models."""
import json
from openai import OpenAI

c = OpenAI(api_key="ollama", base_url="http://localhost:11434/v1")

TOOLS = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {"type": "object",
                       "properties": {"city": {"type": "string"}},
                       "required": ["city"]},
    },
}]

MODELS = ["qwen3.5:latest", "qwen2.5-coder:7b", "qwen3:4b", "qwen3.5:4b"]


def test(model: str) -> None:
    print(f"\n===== {model} =====")
    # 1) plain generation
    try:
        r = c.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say exactly: hello"}],
            max_tokens=50,
        )
        print("plain content:", repr((r.choices[0].message.content or "")[:120]))
    except Exception as e:
        print("plain ERROR:", e)

    # 2) tool call, nudge out of thinking with /no_think
    try:
        r = c.chat.completions.create(
            model=model,
            messages=[{"role": "user",
                       "content": "What's the weather in Toronto? Call the tool. /no_think"}],
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=300,
        )
        m = r.choices[0].message
        tcs = [(t.function.name, t.function.arguments) for t in (m.tool_calls or [])]
        print("tool_calls:", tcs)
        print("content:", repr((m.content or "")[:120]))
    except Exception as e:
        print("tool ERROR:", e)


if __name__ == "__main__":
    for mdl in MODELS:
        test(mdl)
