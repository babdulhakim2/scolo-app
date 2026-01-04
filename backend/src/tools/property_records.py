#!/usr/bin/env python3
"""Property records search."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "property_records"

SIMULATED_PROPERTIES = {
    "john smith": [
        {
            "address": "123 Main St, New York, NY 10001",
            "type": "residential",
            "value": 1500000,
            "acquired": "2019-05-15",
            "mortgage": True,
        },
        {
            "address": "456 Beach Rd, Miami, FL 33139",
            "type": "residential",
            "value": 850000,
            "acquired": "2021-08-20",
            "mortgage": False,
        },
    ],
    "global ventures": [
        {
            "address": "100 Corporate Plaza, Wilmington, DE 19801",
            "type": "commercial",
            "value": 12000000,
            "acquired": "2018-01-10",
            "mortgage": True,
        },
    ],
    "hidden assets": [
        {
            "address": "Private Island, Bahamas",
            "type": "land",
            "value": 25000000,
            "acquired": "2020-03-01",
            "mortgage": False,
            "shell_company": "Sunset Holdings LLC",
        },
    ],
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Person") -> dict[str, Any]:
    """Search property records for an entity."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Searching property records for: {entity}", file=sys.stderr)
    time.sleep(0.5)

    normalized = normalize(entity)
    findings = []

    for key, properties in SIMULATED_PROPERTIES.items():
        if key in normalized or normalized in key:
            findings = properties
            break

    print(f"[{TOOL_ID}] Found {len(findings)} properties", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "clear",
            "confidence": 75,
            "findings": [],
            "sources": ["County Assessor (simulated)"],
        }

    total_value = sum(f.get("value", 0) for f in findings)
    has_shell = any(f.get("shell_company") for f in findings)

    status = "alert" if has_shell else "clear"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 80,
        "findings": findings,
        "total_value": total_value,
        "sources": ["County Assessor (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.property_records 'Entity Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
