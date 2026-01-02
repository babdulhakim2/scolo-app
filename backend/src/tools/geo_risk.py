#!/usr/bin/env python3
"""Geographic risk assessment."""

import json
import os
import sys
import uuid
from typing import Any

from . import weave_op

TOOL_ID = "geo_risk"

COUNTRY_RISK = {
    "af": {"name": "Afghanistan", "fatf": "black", "cpi": 16, "risk": "critical"},
    "ir": {"name": "Iran", "fatf": "black", "cpi": 24, "risk": "critical"},
    "kp": {"name": "North Korea", "fatf": "black", "cpi": 17, "risk": "critical"},
    "mm": {"name": "Myanmar", "fatf": "grey", "cpi": 23, "risk": "high"},
    "sy": {"name": "Syria", "fatf": "black", "cpi": 13, "risk": "critical"},
    "ru": {"name": "Russia", "fatf": "grey", "cpi": 26, "risk": "high"},
    "by": {"name": "Belarus", "fatf": "grey", "cpi": 39, "risk": "high"},
    "pa": {"name": "Panama", "fatf": "grey", "cpi": 36, "risk": "medium"},
    "ky": {"name": "Cayman Islands", "fatf": "monitored", "cpi": None, "risk": "medium"},
    "vg": {"name": "British Virgin Islands", "fatf": "monitored", "cpi": None, "risk": "medium"},
    "us": {"name": "United States", "fatf": "compliant", "cpi": 69, "risk": "low"},
    "gb": {"name": "United Kingdom", "fatf": "compliant", "cpi": 71, "risk": "low"},
    "de": {"name": "Germany", "fatf": "compliant", "cpi": 78, "risk": "low"},
    "ch": {"name": "Switzerland", "fatf": "compliant", "cpi": 82, "risk": "low"},
    "sg": {"name": "Singapore", "fatf": "compliant", "cpi": 83, "risk": "low"},
}

COUNTRY_ALIASES = {
    "russia": "ru", "russian federation": "ru",
    "united states": "us", "usa": "us", "america": "us",
    "united kingdom": "gb", "uk": "gb", "britain": "gb", "england": "gb",
    "germany": "de", "deutschland": "de",
    "north korea": "kp", "dprk": "kp",
    "iran": "ir",
    "syria": "sy",
    "panama": "pa",
    "cayman islands": "ky", "caymans": "ky",
    "switzerland": "ch",
    "singapore": "sg",
    "afghanistan": "af",
    "myanmar": "mm", "burma": "mm",
    "belarus": "by",
}


@weave_op
def check(country: str, **opts) -> dict[str, Any]:
    """Assess geographic risk for a country."""
    result_id = f"{TOOL_ID}-{uuid.uuid4().hex[:8]}"

    code = country.lower().strip()
    if code in COUNTRY_ALIASES:
        code = COUNTRY_ALIASES[code]

    if code not in COUNTRY_RISK:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": country,
            "status": "unknown",
            "confidence": 50,
            "findings": [],
            "sources": ["FATF", "Transparency International"],
        }

    data = COUNTRY_RISK[code]
    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": country,
        "status": data["risk"],
        "confidence": 95,
        "findings": [{
            "country": data["name"],
            "fatf_status": data["fatf"],
            "corruption_index": data["cpi"],
            "risk_level": data["risk"],
        }],
        "sources": ["FATF", "Transparency International CPI"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.geo_risk 'Country'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
