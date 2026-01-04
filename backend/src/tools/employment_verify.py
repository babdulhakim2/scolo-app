#!/usr/bin/env python3
"""Employment history verification."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "employment_verify"

SIMULATED_EMPLOYMENT = {
    "john smith": [
        {"company": "Acme Corp", "title": "Senior Manager", "start": "2018-03", "end": "2023-06", "verified": True},
        {"company": "Tech Industries", "title": "Analyst", "start": "2015-01", "end": "2018-02", "verified": True},
    ],
    "jane doe": [
        {"company": "Global Finance", "title": "VP Operations", "start": "2020-01", "end": "present", "verified": True},
        {"company": "StartupXYZ", "title": "Director", "start": "2017-06", "end": "2019-12", "verified": False},
    ],
    "michael chen": [
        {"company": "TechStart Inc", "title": "CEO", "start": "2019-01", "end": "present", "verified": True},
    ],
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Person") -> dict[str, Any]:
    """Verify employment history for an individual."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Verifying employment for: {entity}", file=sys.stderr)
    time.sleep(0.5)

    normalized = normalize(entity)
    findings = []

    for key, history in SIMULATED_EMPLOYMENT.items():
        if key in normalized or normalized in key:
            findings = history
            break

    print(f"[{TOOL_ID}] Found {len(findings)} employment records", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 50,
            "findings": [],
            "sources": ["Employment Database (simulated)"],
        }

    all_verified = all(f.get("verified", False) for f in findings)
    status = "verified" if all_verified else "partial"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 90 if all_verified else 70,
        "findings": findings,
        "sources": ["Employment Database (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.employment_verify 'Person Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
