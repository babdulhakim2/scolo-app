#!/usr/bin/env python3
"""Phone number lookup and enrichment."""

import json
import re
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "phone_lookup"

SIMULATED_PHONES = {
    "+1-555-123-4567": {
        "carrier": "Verizon Wireless",
        "line_type": "mobile",
        "country": "US",
        "state": "New York",
        "city": "New York",
        "valid": True,
        "registered_name": "John Smith",
    },
    "+1-555-987-6543": {
        "carrier": "AT&T",
        "line_type": "mobile",
        "country": "US",
        "state": "California",
        "city": "Los Angeles",
        "valid": True,
        "registered_name": "Jane Doe",
    },
    "+44-20-7946-0958": {
        "carrier": "BT",
        "line_type": "landline",
        "country": "UK",
        "city": "London",
        "valid": True,
    },
    "+7-495-123-4567": {
        "carrier": "MTS",
        "line_type": "mobile",
        "country": "RU",
        "city": "Moscow",
        "valid": True,
        "risk_flag": "high_risk_jurisdiction",
    },
}


def normalize_phone(phone: str) -> str:
    return re.sub(r"[^\d+]", "", phone)


@weave_op
def check(entity: str, entity_type: str = "Phone") -> dict[str, Any]:
    """Lookup phone number details."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Looking up phone: {entity}", file=sys.stderr)
    time.sleep(0.3)

    normalized = normalize_phone(entity)
    findings = []
    phone_data = None

    for phone, data in SIMULATED_PHONES.items():
        if normalize_phone(phone) == normalized or normalized in normalize_phone(phone):
            phone_data = data
            findings = [data]
            break

    print(f"[{TOOL_ID}] Phone lookup complete", file=sys.stderr)

    if not phone_data:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 50,
            "findings": [],
            "sources": ["Carrier Database (simulated)"],
        }

    has_risk = phone_data.get("risk_flag") is not None
    status = "alert" if has_risk else ("valid" if phone_data.get("valid") else "invalid")

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 95,
        "findings": findings,
        "sources": ["Carrier Database (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.phone_lookup '+1-555-123-4567'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
