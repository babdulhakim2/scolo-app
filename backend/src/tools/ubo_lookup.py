#!/usr/bin/env python3
"""Ultimate Beneficial Owner (UBO) lookup."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "ubo_lookup"

SIMULATED_UBOS = {
    "global ventures": [
        {"name": "John Smith", "ownership": 45, "country": "US", "role": "Director"},
        {"name": "Jane Doe", "ownership": 30, "country": "UK", "role": "Shareholder"},
        {"name": "Acme Holdings Ltd", "ownership": 25, "country": "Cayman Islands", "role": "Corporate Shareholder"},
    ],
    "techstart": [
        {"name": "Michael Chen", "ownership": 60, "country": "US", "role": "Founder/CEO"},
        {"name": "Sarah Johnson", "ownership": 40, "country": "US", "role": "Co-Founder"},
    ],
    "shell corp": [
        {"name": "Unknown", "ownership": 100, "country": "Panama", "role": "Nominee Director"},
    ],
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Company") -> dict[str, Any]:
    """Lookup ultimate beneficial owners of a company."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Looking up UBOs for: {entity}", file=sys.stderr)
    time.sleep(0.4)

    normalized = normalize(entity)
    findings = []

    for key, ubos in SIMULATED_UBOS.items():
        if key in normalized or normalized in key:
            findings = ubos
            break

    print(f"[{TOOL_ID}] Found {len(findings)} beneficial owners", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "clear",
            "confidence": 70,
            "findings": [],
            "sources": ["Corporate Registry (simulated)"],
        }

    has_offshore = any(f.get("country") in ["Cayman Islands", "Panama", "BVI"] for f in findings)
    has_nominee = any("nominee" in f.get("role", "").lower() for f in findings)

    status = "alert" if (has_offshore or has_nominee) else "clear"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 85,
        "findings": findings,
        "sources": ["Corporate Registry (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.ubo_lookup 'Company Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
