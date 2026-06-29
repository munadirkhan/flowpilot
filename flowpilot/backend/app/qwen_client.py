"""Thin wrapper around the OpenAI-compatible Qwen (DashScope) endpoint."""
from openai import OpenAI

from .config import get_settings

_settings = get_settings()

client = OpenAI(
    api_key=_settings.qwen_api_key,
    base_url=_settings.qwen_base_url,
)

AGENT_MODEL = _settings.qwen_agent_model
DRAFT_MODEL = _settings.qwen_draft_model
