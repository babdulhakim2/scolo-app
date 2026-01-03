"""Project management API routes."""

import time
from typing import ClassVar

from cuid2 import cuid_wrapper

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.claude_service import claude_service

router = APIRouter(prefix="/projects", tags=["projects"])


TOOL_CONFIG: dict[str, dict[str, str]] = {
    "sanctions": {"name": "Sanctions Check", "icon": "shield"},
    "adverse_media": {"name": "Adverse Media", "icon": "newspaper"},
    "business_registry": {"name": "Business Registry", "icon": "building"},
    "pep_check": {"name": "PEP Screening", "icon": "user"},
    "geo_risk": {"name": "Geographic Risk", "icon": "globe"},
}

DEFAULT_TOOLS = ["sanctions", "pep_check", "adverse_media", "geo_risk"]


class ProjectStore:
    """In-memory project storage (replace with database in production)."""

    _projects: ClassVar[dict[str, dict]] = {}

    @classmethod
    def create(cls, project_id: str, data: dict) -> dict:
        cls._projects[project_id] = data
        return data

    @classmethod
    def get(cls, project_id: str) -> dict | None:
        return cls._projects.get(project_id)

    @classmethod
    def update(cls, project_id: str, updates: dict) -> dict | None:
        if project_id in cls._projects:
            cls._projects[project_id].update(updates)
            return cls._projects[project_id]
        return None

    @classmethod
    def exists(cls, project_id: str) -> bool:
        return project_id in cls._projects


class ToolInfo(BaseModel):
    id: str
    key: str
    name: str


class StartRequest(BaseModel):
    entity_name: str
    entity_type: str = "company"
    country: str = ""
    tools: list[str] = DEFAULT_TOOLS


class StartResponse(BaseModel):
    project_id: str
    entity_name: str
    entity_type: str
    tools: list[ToolInfo]


cuid = cuid_wrapper()


def generate_project_id() -> str:
    return cuid()


def generate_tool_id(tool_key: str) -> str:
    return cuid()


def build_tool_infos(tool_keys: list[str]) -> list[dict]:
    return [
        {"id": generate_tool_id(key), "key": key, "name": TOOL_CONFIG[key]["name"]}
        for key in tool_keys
        if key in TOOL_CONFIG
    ]


@router.post("/start", response_model=StartResponse)
async def start_project(req: StartRequest) -> StartResponse:
    """Start a new compliance investigation project."""
    project_id = generate_project_id()
    tool_infos = build_tool_infos(req.tools)

    ProjectStore.create(project_id, {
        "id": project_id,
        "entity_name": req.entity_name,
        "entity_type": req.entity_type,
        "country": req.country,
        "tools": tool_infos,
        "status": "pending",
        "started_at": time.time(),
    })

    return StartResponse(
        project_id=project_id,
        entity_name=req.entity_name,
        entity_type=req.entity_type,
        tools=[ToolInfo(**t) for t in tool_infos],
    )


@router.get("/{project_id}/stream")
async def stream_project(project_id: str) -> StreamingResponse:
    """Stream SSE events for a running project."""
    project = ProjectStore.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ProjectStore.update(project_id, {"status": "running"})

    async def event_generator():
        async for chunk in claude_service.run_project(
            project_id=project_id,
            entity_name=project["entity_name"],
            entity_type=project["entity_type"],
            tools=project["tools"],
            country=project.get("country", ""),
        ):
            yield chunk
        ProjectStore.update(project_id, {"status": "completed"})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.get("/{project_id}")
async def get_project(project_id: str) -> dict:
    """Get project details."""
    project = ProjectStore.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
