#!/usr/bin/env python3
"""Court records search."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "court_records"

SIMULATED_CASES = {
    "john smith": [
        {
            "case_number": "2021-CV-12345",
            "court": "US District Court, Southern District of NY",
            "type": "civil",
            "role": "defendant",
            "status": "closed",
            "year": 2021,
            "description": "Contract dispute",
        },
    ],
    "global ventures": [
        {
            "case_number": "2022-CV-98765",
            "court": "Delaware Chancery Court",
            "type": "civil",
            "role": "plaintiff",
            "status": "active",
            "year": 2022,
            "description": "Shareholder derivative action",
        },
        {
            "case_number": "2020-CR-55555",
            "court": "US District Court, District of Columbia",
            "type": "criminal",
            "role": "defendant",
            "status": "closed",
            "year": 2020,
            "description": "FCPA violation - settled",
        },
    ],
    "fraud case": [
        {
            "case_number": "2023-CR-11111",
            "court": "US District Court, Central District of CA",
            "type": "criminal",
            "role": "defendant",
            "status": "active",
            "year": 2023,
            "description": "Wire fraud and money laundering",
        },
    ],
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Person") -> dict[str, Any]:
    """Search court records for an entity."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Searching court records for: {entity}", file=sys.stderr)
    time.sleep(0.6)

    normalized = normalize(entity)
    findings = []

    for key, cases in SIMULATED_CASES.items():
        if key in normalized or normalized in key:
            findings = cases
            break

    print(f"[{TOOL_ID}] Found {len(findings)} court cases", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "clear",
            "confidence": 85,
            "findings": [],
            "sources": ["PACER (simulated)", "State Courts (simulated)"],
        }

    has_criminal = any(f.get("type") == "criminal" for f in findings)
    has_active = any(f.get("status") == "active" for f in findings)

    if has_criminal:
        status = "alert"
    elif has_active:
        status = "review"
    else:
        status = "clear"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 90,
        "findings": findings,
        "sources": ["PACER (simulated)", "State Courts (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.court_records 'Entity Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
