import json
import time
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(prefix="/projects", tags=["projects"])

projects: dict[str, dict] = {}

TOOL_CONFIG = {
    "sanctions": {"name": "Sanctions Check", "icon": "shield"},
    "adverse_media": {"name": "Adverse Media", "icon": "newspaper"},
    "business_registry": {"name": "Business Registry", "icon": "building"},
    "pep_check": {"name": "PEP Screening", "icon": "user"},
    "geo_risk": {"name": "Geographic Risk", "icon": "globe"},
}


class StartRequest(BaseModel):
    entity_name: str
    entity_type: str = "company"
    country: str = ""
    tools: list[str] = ["sanctions", "pep_check", "adverse_media", "geo_risk"]


class ToolInfo(BaseModel):
    id: str
    key: str
    name: str


class StartResponse(BaseModel):
    project_id: str
    entity_name: str
    entity_type: str
    tools: list[ToolInfo]


@router.post("/start", response_model=StartResponse)
async def start_project(req: StartRequest):
    project_id = f"proj-{uuid.uuid4().hex[:8]}"

    tool_infos = []
    for tool_key in req.tools:
        if tool_key in TOOL_CONFIG:
            tool_id = f"{tool_key}-{uuid.uuid4().hex[:6]}"
            tool_infos.append({
                "id": tool_id,
                "key": tool_key,
                "name": TOOL_CONFIG[tool_key]["name"],
            })

    projects[project_id] = {
        "id": project_id,
        "entity_name": req.entity_name,
        "entity_type": req.entity_type,
        "country": req.country,
        "tools": tool_infos,
        "status": "pending",
        "started_at": time.time(),
    }

    return StartResponse(
        project_id=project_id,
        entity_name=req.entity_name,
        entity_type=req.entity_type,
        tools=[ToolInfo(**t) for t in tool_infos],
    )


@router.get("/{project_id}/stream")
async def stream(project_id: str):
    if project_id not in projects:
        raise HTTPException(404, "Not found")

    proj = projects[project_id]
    proj["status"] = "running"

    from src.claude_service import claude_service

    async def gen():
        async for chunk in claude_service.run_project(
            project_id=project_id,
            entity_name=proj["entity_name"],
            entity_type=proj["entity_type"],
            tools=proj["tools"],
            country=proj.get("country", ""),
        ):
            yield chunk
        proj["status"] = "completed"

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    }
    return StreamingResponse(gen(), media_type="text/event-stream", headers=headers)


@router.get("/{project_id}")
async def get(project_id: str):
    if project_id not in projects:
        raise HTTPException(404, "Not found")
    return projects[project_id]
