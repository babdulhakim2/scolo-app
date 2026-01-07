#!/usr/bin/env python3
"""Politically Exposed Person (PEP) screening."""

import json
import os
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "pep_check"

# TODO: Uncomment for real Wikidata API
# WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"

SIMULATED_PEPS = {
    "joe biden": {
        "name": "Joseph R. Biden Jr.",
        "position": "President of the United States",
        "country": "United States",
        "pep_level": "high",
    },
    "biden": {
        "name": "Joseph R. Biden Jr.",
        "position": "President of the United States",
        "country": "United States",
        "pep_level": "high",
    },
    "donald trump": {
        "name": "Donald J. Trump",
        "position": "Former President of the United States",
        "country": "United States",
        "pep_level": "high",
    },
    "vladimir putin": {
        "name": "Vladimir Putin",
        "position": "President of Russia",
        "country": "Russia",
        "pep_level": "high",
    },
    "rishi sunak": {
        "name": "Rishi Sunak",
        "position": "Prime Minister of the United Kingdom",
        "country": "United Kingdom",
        "pep_level": "high",
    },
    "emmanuel macron": {
        "name": "Emmanuel Macron",
        "position": "President of France",
        "country": "France",
        "pep_level": "high",
    },
}


@weave_op
def check(entity: str, **opts) -> dict[str, Any]:
    """Screen entity for PEP status."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Checking: {entity}", file=sys.stderr)

    # TODO: Uncomment for real API
    # findings = _search_wikidata(entity)

    # Simulated search
    findings = _search_simulated(entity)

    time.sleep(0.3)  # Simulate API latency
    print(f"[{TOOL_ID}] Found {len(findings)} results", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "clear",
            "confidence": 85,
            "findings": [],
            "sources": ["PEP Database (simulated)"],
        }

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": "match",
        "confidence": 95,
        "findings": findings,
        "sources": ["PEP Database (simulated)"],
    }


def _search_simulated(entity: str) -> list[dict]:
    """Simulated PEP search."""
    normalized = entity.lower().strip()
    for key, data in SIMULATED_PEPS.items():
        if key in normalized or normalized in key:
            return [data]
    return []


# TODO: Uncomment for real Wikidata API
# def _search_wikidata(entity: str) -> list[dict]:
#     ...


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.pep_check 'Person Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
