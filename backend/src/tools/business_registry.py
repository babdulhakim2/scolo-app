#!/usr/bin/env python3
"""Business registry search via OpenCorporates."""

import json
import os
import sys
import uuid
from typing import Any

import httpx

from . import weave_op

TOOL_ID = "business_registry"


@weave_op
def check(entity: str, jurisdiction: str = "") -> dict[str, Any]:
    """Search business registries for company information."""
    result_id = f"{TOOL_ID}-{uuid.uuid4().hex[:8]}"

    findings = _search_opencorporates(entity, jurisdiction)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 70,
            "findings": [],
            "sources": ["OpenCorporates"],
        }

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": "found",
        "confidence": 90,
        "findings": findings,
        "sources": ["OpenCorporates"],
    }


def _search_opencorporates(entity: str, jurisdiction: str = "") -> list[dict]:
    """Search OpenCorporates API."""
    try:
        params = {"q": entity, "format": "json"}
        if jurisdiction:
            params["jurisdiction_code"] = jurisdiction

        r = httpx.get(
            "https://api.opencorporates.com/v0.4/companies/search",
            params=params,
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()

        companies = data.get("results", {}).get("companies", [])
        results = []
        for c in companies[:5]:
            co = c.get("company", {})
            results.append({
                "name": co.get("name", ""),
                "jurisdiction": co.get("jurisdiction_code", ""),
                "company_number": co.get("company_number", ""),
                "status": co.get("current_status", ""),
                "incorporation_date": co.get("incorporation_date", ""),
                "address": co.get("registered_address_in_full", ""),
                "opencorporates_url": co.get("opencorporates_url", ""),
            })
        return results
    except Exception:
        return []


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.business_registry 'Company Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else ""), indent=2))
