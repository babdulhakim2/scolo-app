#!/usr/bin/env python3
"""Sanctions screening against OFAC SDN and UN lists."""

import json
import os
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "sanctions"

# TODO: Uncomment when ready to use real API (50 req/month limit)
# OPENSANCTIONS_API = "https://api.opensanctions.org/search/default"
# OPENSANCTIONS_KEY = os.getenv("OPENSANCTIONS_API_KEY")

SIMULATED_SANCTIONS = {
    "vladimir putin": {
        "name": "Vladimir Vladimirovich PUTIN",
        "schema": "Person",
        "datasets": ["us_ofac_sdn", "eu_fsf", "un_sc_sanctions"],
        "score": 100,
    },
    "putin": {
        "name": "Vladimir Vladimirovich PUTIN",
        "schema": "Person",
        "datasets": ["us_ofac_sdn", "eu_fsf"],
        "score": 100,
    },
    "kim jong un": {
        "name": "KIM Jong Un",
        "schema": "Person",
        "datasets": ["us_ofac_sdn", "un_sc_sanctions"],
        "score": 100,
    },
    "sergei lavrov": {
        "name": "Sergei Viktorovich LAVROV",
        "schema": "Person",
        "datasets": ["us_ofac_sdn", "eu_fsf"],
        "score": 100,
    },
    "ali khamenei": {
        "name": "Ali Hosseini KHAMENEI",
        "schema": "Person",
        "datasets": ["us_ofac_sdn", "un_sc_sanctions"],
        "score": 100,
    },
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Person") -> dict[str, Any]:
    """Check entity against sanctions databases."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Checking: {entity}", file=sys.stderr)

    # TODO: Uncomment for real API
    # findings = _search_opensanctions(entity)

    # Simulated search
    findings = _search_simulated(entity)

    time.sleep(0.5)  # Simulate API latency
    print(f"[{TOOL_ID}] Found {len(findings)} results", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "clear",
            "confidence": 90,
            "findings": [],
            "sources": ["OpenSanctions (simulated)"],
        }

    max_score = max(f.get("score", 0) for f in findings)
    status = "match" if max_score >= 80 else "potential" if max_score >= 50 else "clear"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": max_score,
        "findings": findings,
        "sources": ["OpenSanctions (simulated)"],
    }


def _search_simulated(entity: str) -> list[dict]:
    """Simulated sanctions search."""
    normalized = normalize(entity)
    for key, data in SIMULATED_SANCTIONS.items():
        if key in normalized or normalized in key:
            return [data]
    return []


# TODO: Uncomment for real OpenSanctions API
# def _search_opensanctions(entity: str) -> list[dict]:
#     """Search OpenSanctions API."""
#     if not OPENSANCTIONS_KEY:
#         return []
#     try:
#         r = httpx.get(
#             OPENSANCTIONS_API,
#             params={"q": entity, "limit": 5},
#             headers={"Authorization": f"ApiKey {OPENSANCTIONS_KEY}"},
#             timeout=30,
#         )
#         r.raise_for_status()
#         data = r.json()
#         results = []
#         for res in data.get("results", []):
#             results.append({
#                 "name": res.get("caption", ""),
#                 "schema": res.get("schema", ""),
#                 "datasets": res.get("datasets", []),
#                 "score": int(res.get("score", 0) * 100),
#             })
#         return results
#     except Exception:
#         return []


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.sanctions 'Entity'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
