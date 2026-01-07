#!/usr/bin/env python3
"""Corporate filings search (SEC, state filings)."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "corporate_filings"

SIMULATED_FILINGS = {
    "global ventures": [
        {
            "type": "10-K",
            "filed": "2023-03-15",
            "source": "SEC EDGAR",
            "description": "Annual Report",
            "url": "https://sec.gov/...",
        },
        {
            "type": "8-K",
            "filed": "2023-06-01",
            "source": "SEC EDGAR",
            "description": "Material Event - CFO Resignation",
            "url": "https://sec.gov/...",
        },
        {
            "type": "DEF 14A",
            "filed": "2023-04-10",
            "source": "SEC EDGAR",
            "description": "Proxy Statement",
            "url": "https://sec.gov/...",
        },
    ],
    "techstart": [
        {
            "type": "Certificate of Incorporation",
            "filed": "2019-01-15",
            "source": "Delaware Division of Corporations",
            "description": "Initial incorporation",
            "state": "DE",
        },
        {
            "type": "Annual Report",
            "filed": "2023-02-28",
            "source": "Delaware Division of Corporations",
            "description": "2022 Annual Report",
            "state": "DE",
        },
    ],
    "shell corp": [
        {
            "type": "Certificate of Incorporation",
            "filed": "2022-12-01",
            "source": "Wyoming Secretary of State",
            "description": "Registered Agent only - no officers listed",
            "state": "WY",
            "flag": "minimal_disclosure",
        },
    ],
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Company") -> dict[str, Any]:
    """Search corporate filings for a company."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Searching corporate filings for: {entity}", file=sys.stderr)
    time.sleep(0.5)

    normalized = normalize(entity)
    findings = []

    for key, filings in SIMULATED_FILINGS.items():
        if key in normalized or normalized in key:
            findings = filings
            break

    print(f"[{TOOL_ID}] Found {len(findings)} filings", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 60,
            "findings": [],
            "sources": ["SEC EDGAR (simulated)", "State SOS (simulated)"],
        }

    has_flag = any(f.get("flag") for f in findings)
    has_material_event = any("8-K" in f.get("type", "") for f in findings)

    if has_flag:
        status = "alert"
    elif has_material_event:
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
        "sources": ["SEC EDGAR (simulated)", "State SOS (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.corporate_filings 'Company Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
