"""Claude Agent SDK service for compliance screening."""

import json
import logging
import os
import re
from dataclasses import asdict, is_dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, AsyncGenerator

from claude_agent_sdk import query, ClaudeAgentOptions

logger = logging.getLogger(__name__)

LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

TOOL_PATTERNS = {
    "sanctions": re.compile(r"(?:sanctions\.py|src\.tools\.sanctions|tools/sanctions)"),
    "pep_check": re.compile(r"(?:pep_check\.py|src\.tools\.pep_check|tools/pep_check)"),
    "adverse_media": re.compile(r"(?:adverse_media\.py|src\.tools\.adverse_media|tools/adverse_media)"),
    "geo_risk": re.compile(r"(?:geo_risk\.py|src\.tools\.geo_risk|tools/geo_risk)"),
    "business_registry": re.compile(r"(?:business_registry\.py|src\.tools\.business_registry|tools/business_registry)"),
}

WARNING_STATUSES = frozenset({"match", "alert", "high", "critical"})


def to_dict(obj: Any) -> Any:
    """Recursively convert objects to dictionaries."""
    if is_dataclass(obj):
        return asdict(obj)
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    if isinstance(obj, dict):
        return {k: to_dict(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [to_dict(item) for item in obj]
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    if hasattr(obj, "__dict__"):
        return {
            key: to_dict(value)
            for key, value in vars(obj).items()
            if not callable(value) and not key.startswith("_")
        }
    return repr(obj)


def detect_tool_from_command(command: str) -> str | None:
    """Detect which compliance tool a command invokes."""
    if not command.strip().startswith("python"):
        return None
    for tool_key, pattern in TOOL_PATTERNS.items():
        if pattern.search(command):
            return tool_key
    return None


def parse_tool_result(content: str) -> dict | None:
    """Extract JSON result from tool output."""
    try:
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json.loads(json_match.group())
    except (json.JSONDecodeError, AttributeError):
        pass
    return None


def format_sse_event(
    event_type: str,
    project_id: str,
    agent_id: str | None = None,
    payload: dict | None = None
) -> str:
    """Format a Server-Sent Event message."""
    event = {"type": event_type, "project_id": project_id}
    if agent_id:
        event["agent_id"] = agent_id
    if payload:
        event["payload"] = payload
    return f"data: {json.dumps(event)}\n\n"


def build_tool_commands(entity_name: str, country: str) -> dict[str, str]:
    """Build shell commands for each compliance tool."""
    return {
        "sanctions": f'python -m src.tools.sanctions "{entity_name}"',
        "pep_check": f'python -m src.tools.pep_check "{entity_name}"',
        "adverse_media": f'python -m src.tools.adverse_media "{entity_name}"',
        "geo_risk": f'python -m src.tools.geo_risk "{country or "US"}"',
        "business_registry": f'python -m src.tools.business_registry "{entity_name}"',
    }


class ClaudeService:
    """Service for running compliance investigations via Claude Agent SDK."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self._log_files: dict[str, Path] = {}
        if self.api_key:
            os.environ["ANTHROPIC_API_KEY"] = self.api_key
            logger.info("ClaudeService initialized")
        else:
            logger.warning("ANTHROPIC_API_KEY not set")

    def _get_log_file(self, project_id: str) -> Path:
        if project_id not in self._log_files:
            self._log_files[project_id] = LOG_DIR / f"{project_id}.jsonl"
        return self._log_files[project_id]

    def _log(self, project_id: str, data: dict) -> None:
        log_file = self._get_log_file(project_id)
        entry = {"timestamp": datetime.now().isoformat(), "project_id": project_id, **data}
        with open(log_file, "a") as f:
            f.write(json.dumps(entry, default=str) + "\n")

    async def run_project(
        self,
        project_id: str,
        entity_name: str,
        entity_type: str,
        tools: list[dict],
        country: str = "",
    ) -> AsyncGenerator[str, None]:
        """Run a compliance investigation project with SSE streaming."""
        if not self._ensure_api_key():
            yield format_sse_event("error", project_id, payload={"message": "ANTHROPIC_API_KEY not configured"})
            return

        yield format_sse_event("project_start", project_id, payload={
            "entity_name": entity_name,
            "entity_type": entity_type,
        })

        prompt = self._build_prompt(entity_name, entity_type, tools, country)
        self._log(project_id, {"type": "prompt", "content": prompt})

        tool_map = {t["key"]: t for t in tools}
        pending_calls: dict[str, str] = {}
        started_tools: set[str] = set()
        results: list[dict] = []

        try:
            async for event in self._stream_agent(prompt, project_id, tool_map, pending_calls, started_tools, results):
                yield event

            yield self._build_completion_event(project_id, results)

        except Exception as e:
            logger.exception("Stream error")
            self._log(project_id, {"type": "error", "error": str(e)})
            yield format_sse_event("error", project_id, payload={"message": str(e)})

    def _ensure_api_key(self) -> bool:
        if not self.api_key:
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            if self.api_key:
                os.environ["ANTHROPIC_API_KEY"] = self.api_key
        return bool(self.api_key)

    def _build_prompt(self, entity_name: str, entity_type: str, tools: list[dict], country: str) -> str:
        tool_commands = build_tool_commands(entity_name, country)
        instructions = [
            f"- {t['name']} ({t['id']}): `{tool_commands.get(t['key'], '')}`"
            for t in tools if t['key'] in tool_commands
        ]
        return f"""Investigate "{entity_name}" ({entity_type}) for compliance risk.

Run these exact commands (do NOT modify them):
{chr(10).join(instructions)}

Run all commands in parallel. Do NOT use TodoWrite or explore the codebase.
After all complete, provide a brief risk summary."""

    async def _stream_agent(
        self,
        prompt: str,
        project_id: str,
        tool_map: dict,
        pending_calls: dict,
        started_tools: set,
        results: list
    ) -> AsyncGenerator[str, None]:
        cwd = Path(__file__).parent.parent
        options = ClaudeAgentOptions(
            max_turns=20,
            cwd=cwd,
            allowed_tools=["Skills", "Bash", "Read"],
            setting_sources=["user", "project"],
            model="claude-sonnet-4-5",
        )

        async for message in query(prompt=prompt, options=options):
            msg_dict = to_dict(message)
            self._log(project_id, {"type": "message", "content": msg_dict})
            logger.debug("Message: %s", msg_dict)

            content = msg_dict.get("content", [])
            if not isinstance(content, list):
                continue

            yield format_sse_event("trace", project_id, payload={"message": msg_dict})

            for item in content:
                if not isinstance(item, dict):
                    continue

                event = self._process_content_item(
                    item, project_id, tool_map, pending_calls, started_tools, results
                )
                if event:
                    yield event

    def _process_content_item(
        self,
        item: dict,
        project_id: str,
        tool_map: dict,
        pending_calls: dict,
        started_tools: set,
        results: list
    ) -> str | None:
        if item.get("name") == "Bash" and "input" in item:
            return self._handle_bash_call(item, project_id, tool_map, pending_calls, started_tools)

        if "tool_use_id" in item and item.get("tool_use_id") in pending_calls:
            return self._handle_tool_result(item, project_id, tool_map, pending_calls, results)

        return None

    def _handle_bash_call(
        self,
        item: dict,
        project_id: str,
        tool_map: dict,
        pending_calls: dict,
        started_tools: set
    ) -> str | None:
        command = item["input"].get("command", "")
        tool_use_id = item.get("id", "")
        detected_tool = detect_tool_from_command(command)

        if not detected_tool or detected_tool not in tool_map:
            return None

        tool_info = tool_map[detected_tool]
        pending_calls[tool_use_id] = detected_tool

        if detected_tool not in started_tools:
            started_tools.add(detected_tool)
            return format_sse_event(
                "agent_start", project_id, tool_info["id"],
                {"task": f"Running {tool_info['name']}..."}
            )
        return None

    def _handle_tool_result(
        self,
        item: dict,
        project_id: str,
        tool_map: dict,
        pending_calls: dict,
        results: list
    ) -> str | None:
        tool_use_id = item["tool_use_id"]
        tool_key = pending_calls.pop(tool_use_id)
        tool_info = tool_map.get(tool_key)

        if not tool_info:
            return None

        result_content = item.get("content", "")
        is_error = item.get("is_error", False)

        if is_error:
            return format_sse_event(
                "agent_error", project_id, tool_info["id"],
                {"error": result_content[:500]}
            )

        parsed = parse_tool_result(result_content)
        if not parsed:
            return None

        status = parsed.get("status", "unknown")
        findings = parsed.get("findings", [])
        is_warning = status in WARNING_STATUSES

        results.append({
            "tool": tool_info["name"],
            "status": status,
            "findings": len(findings),
        })

        return format_sse_event(
            "agent_complete", project_id, tool_info["id"],
            {
                "status": status,
                "resultType": "warning" if is_warning else "success",
                "findings": findings,
                "confidence": parsed.get("confidence", 80),
            }
        )

    def _build_completion_event(self, project_id: str, results: list) -> str:
        total_findings = sum(r["findings"] for r in results)
        has_match = any(r["status"] in WARNING_STATUSES for r in results)
        risk_level = "high" if has_match else "medium" if total_findings > 0 else "low"

        self._log(project_id, {"type": "complete", "results": results})

        return format_sse_event("project_complete", project_id, payload={
            "total_findings": total_findings,
            "tools_completed": len(results),
            "risk_level": risk_level,
            "results": results,
        })


claude_service = ClaudeService()
