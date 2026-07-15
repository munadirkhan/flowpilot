"""Voice intake — transcribes customer voicemails / mic recordings with Qwen ASR.

This mimics the front half of an AI phone receptionist (Twilio/Vapi style): a
customer's spoken message arrives as audio, qwen3-asr-flash turns it into text,
and the text flows into the same multi-agent pipeline as any typed inquiry.
"""
import base64
import time

from ..qwen_client import client

ASR_MODEL = "qwen3-asr-flash"

# MIME types Qwen ASR accepts via base64 data URIs.
_MIME_BY_EXT = {
    "wav": "audio/wav",
    "mp3": "audio/mpeg",
    "m4a": "audio/mp4",
    "mp4": "audio/mp4",
    "webm": "audio/webm",
    "ogg": "audio/ogg",
}


def transcribe(audio_bytes: bytes, filename: str = "audio.wav") -> dict:
    """Send audio to qwen3-asr-flash and return {text, model, duration_ms}."""
    ext = (filename.rsplit(".", 1)[-1] or "wav").lower()
    mime = _MIME_BY_EXT.get(ext, "audio/wav")
    data_uri = f"data:{mime};base64,{base64.b64encode(audio_bytes).decode()}"

    t0 = time.time()
    resp = client.chat.completions.create(
        model=ASR_MODEL,
        messages=[{
            "role": "user",
            "content": [{"type": "input_audio", "input_audio": {"data": data_uri}}],
        }],
    )
    text = (resp.choices[0].message.content or "").strip()
    return {
        "text": text,
        "model": ASR_MODEL,
        "duration_ms": int((time.time() - t0) * 1000),
    }
