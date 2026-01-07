#!/usr/bin/env python3
"""Education credentials verification."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "education_verify"

SIMULATED_EDUCATION = {
    "john smith": [
        {"institution": "Harvard University", "degree": "MBA", "year": 2015, "verified": True},
        {"institution": "MIT", "degree": "BS Computer Science", "year": 2010, "verified": True},
    ],
    "jane doe": [
        {"institution": "Stanford University", "degree": "MBA", "year": 2017, "verified": True},
        {"institution": "UCLA", "degree": "BA Economics", "year": 2012, "verified": True},
    ],
    "fake credentials": [
        {"institution": "Diploma Mill University", "degree": "PhD", "year": 2020, "verified": False},
    ],
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Person") -> dict[str, Any]:
    """Verify education credentials for an individual."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Verifying education for: {entity}", file=sys.stderr)
    time.sleep(0.4)

    normalized = normalize(entity)
    findings = []

    for key, education in SIMULATED_EDUCATION.items():
        if key in normalized or normalized in key:
            findings = education
            break

    print(f"[{TOOL_ID}] Found {len(findings)} education records", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 50,
            "findings": [],
            "sources": ["National Student Clearinghouse (simulated)"],
        }

    all_verified = all(f.get("verified", False) for f in findings)
    has_fake = any(not f.get("verified", True) for f in findings)
    status = "alert" if has_fake else ("verified" if all_verified else "partial")

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 95 if all_verified else 60,
        "findings": findings,
        "sources": ["National Student Clearinghouse (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.education_verify 'Person Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
