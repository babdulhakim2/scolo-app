"""Claude Code SDK service using Skills for compliance tools."""

import json
import logging
import os
import re
import time
from dataclasses import asdict, is_dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, AsyncGenerator, Optional

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


def _to_dict(obj: Any) -> Any:
    if is_dataclass(obj):
        return asdict(obj)
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    if isinstance(obj, dict):
        return {k: _to_dict(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [_to_dict(item) for item in obj]
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    if hasattr(obj, "__dict__"):
        return {
            key: _to_dict(value)
            for key, value in vars(obj).items()
            if not callable(value) and not key.startswith("_")
        }
    return repr(obj)


def _detect_tool_from_command(command: str) -> Optional[str]:
    if not command.strip().startswith("python"):
        return None
    for tool_key, pattern in TOOL_PATTERNS.items():
        if pattern.search(command):
            return tool_key
    return None


def _parse_tool_result(content: str) -> Optional[dict]:
    try:
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    return None


def _emit(event_type: str, project_id: str, agent_id: str = None, payload: dict = None) -> str:
    event = {"type": event_type, "project_id": project_id}
    if agent_id:
        event["agent_id"] = agent_id
    if payload:
        event["payload"] = payload
    return f"data: {json.dumps(event)}\n\n"


class ClaudeService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self._log_files: dict[str, Path] = {}
        if self.api_key:
            os.environ["ANTHROPIC_API_KEY"] = self.api_key
            logger.info("ClaudeService initialized")
        else:
            logger.warning("ANTHROPIC_API_KEY not set - will check at runtime")

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
        if not self.api_key:
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            if self.api_key:
                os.environ["ANTHROPIC_API_KEY"] = self.api_key
            else:
                yield _emit("error", project_id, payload={"message": "ANTHROPIC_API_KEY not configured"})
                return

        cwd = Path(__file__).parent.parent
        tool_map = {t["key"]: t for t in tools}

        tool_commands = {
            "sanctions": f'python -m src.tools.sanctions "{entity_name}"',
            "pep_check": f'python -m src.tools.pep_check "{entity_name}"',
            "adverse_media": f'python -m src.tools.adverse_media "{entity_name}"',
            "geo_risk": f'python -m src.tools.geo_risk "{country or "US"}"',
            "business_registry": f'python -m src.tools.business_registry "{entity_name}"',
        }

        tool_instructions = []
        for t in tools:
            cmd = tool_commands.get(t["key"], "")
            if cmd:
                tool_instructions.append(f"- {t['name']} ({t['id']}): `{cmd}`")

        prompt = f"""Investigate "{entity_name}" ({entity_type}) for compliance risk.

Run these exact commands (do NOT modify them):
{chr(10).join(tool_instructions)}

Run all commands in parallel. Do NOT use TodoWrite or explore the codebase.
After all complete, provide a brief risk summary."""

        self._log(project_id, {"type": "prompt", "content": prompt})

        yield _emit("project_start", project_id, payload={
            "entity_name": entity_name,
            "entity_type": entity_type,
        })

        pending_tool_calls: dict[str, str] = {}
        started_tools: set[str] = set()
        results_summary = []

        try:
            options = ClaudeAgentOptions(
                max_turns=20,
                cwd=cwd,
                allowed_tools=["Skills","Bash", "Read"],
                # disallowed_tools=["TodoWrite"],
                # permission_mode="acceptEdits",
                setting_sources=["user", "project"],
                model="claude-sonnet-4-5",
            )

            async for message in query(prompt=prompt, options=options):
                msg_dict = _to_dict(message)
                self._log(project_id, {"type": "message", "content": msg_dict})
                print(msg_dict)

                content = msg_dict.get("content", [])
                if not isinstance(content, list):
                    continue

                yield _emit("trace", project_id, payload={"message": msg_dict})

                for item in content:
                    if not isinstance(item, dict):
                        continue

                    if item.get("name") == "Bash" and "input" in item:
                        command = item["input"].get("command", "")
                        tool_use_id = item.get("id", "")
                        detected_tool = _detect_tool_from_command(command)
                        print(f"[DEBUG] Bash cmd: {command[:50]}... detected={detected_tool}")

                        if detected_tool and detected_tool in tool_map:
                            tool_info = tool_map[detected_tool]
                            pending_tool_calls[tool_use_id] = detected_tool
                            if detected_tool not in started_tools:
                                started_tools.add(detected_tool)
                                task_msg = f"Running {tool_info['name']}..."
                                print(f"[DEBUG] Emitting agent_start for {tool_info['id']}")
                                yield _emit("agent_start", project_id, tool_info["id"], {"task": task_msg})

                    if "tool_use_id" in item:
                        print(f"[DEBUG] Tool result: {item.get('tool_use_id')} in pending: {item.get('tool_use_id') in pending_tool_calls}")

                    if "tool_use_id" in item and item.get("tool_use_id") in pending_tool_calls:
                        tool_use_id = item["tool_use_id"]
                        tool_key = pending_tool_calls.pop(tool_use_id)
                        tool_info = tool_map.get(tool_key)

                        if tool_info:
                            result_content = item.get("content", "")
                            parsed = _parse_tool_result(result_content)
                            print(f"[DEBUG] Parsed result for {tool_key}: {parsed is not None}")

                            is_error = item.get("is_error", False)
                            if is_error:
                                print(f"[DEBUG] Emitting agent_error for {tool_info['id']}")
                                yield _emit("agent_error", project_id, tool_info["id"], {
                                    "error": result_content[:500],
                                })
                            elif parsed:
                                status = parsed.get("status", "unknown")
                                findings = parsed.get("findings", [])
                                is_warning = status in ["match", "alert", "high", "critical"]
                                print(f"[DEBUG] Emitting agent_complete for {tool_info['id']}")

                                yield _emit("agent_complete", project_id, tool_info["id"], {
                                    "status": status,
                                    "resultType": "warning" if is_warning else "success",
                                    "findings": findings,
                                    "confidence": parsed.get("confidence", 80),
                                })

                                results_summary.append({
                                    "tool": tool_info["name"],
                                    "status": status,
                                    "findings": len(findings),
                                })

            total_findings = sum(r["findings"] for r in results_summary)
            has_match = any(r["status"] in ["match", "alert", "high", "critical"] for r in results_summary)
            risk_level = "high" if has_match else "medium" if total_findings > 0 else "low"

            yield _emit("project_complete", project_id, payload={
                "total_findings": total_findings,
                "tools_completed": len(results_summary),
                "risk_level": risk_level,
                "results": results_summary,
            })
            self._log(project_id, {"type": "complete", "results": results_summary})

        except Exception as e:
            logger.error(f"Stream error: {e}")
            self._log(project_id, {"type": "error", "error": str(e)})
            yield _emit("error", project_id, payload={"message": str(e)})


claude_service = ClaudeService()
