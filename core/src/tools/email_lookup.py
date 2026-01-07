#!/usr/bin/env python3
"""Email address lookup and validation."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "email_lookup"

SIMULATED_EMAILS = {
    "john.smith@gmail.com": {
        "valid": True,
        "deliverable": True,
        "disposable": False,
        "domain_age_days": 9000,
        "mx_found": True,
        "breach_count": 2,
        "breaches": ["LinkedIn 2021", "Adobe 2013"],
        "social_profiles": ["linkedin", "twitter"],
    },
    "jane.doe@company.com": {
        "valid": True,
        "deliverable": True,
        "disposable": False,
        "domain_age_days": 3650,
        "mx_found": True,
        "breach_count": 0,
        "breaches": [],
        "corporate": True,
    },
    "fake@tempmail.com": {
        "valid": True,
        "deliverable": True,
        "disposable": True,
        "domain_age_days": 100,
        "mx_found": True,
        "breach_count": 0,
        "breaches": [],
        "risk_flag": "disposable_email",
    },
    "hacker@protonmail.com": {
        "valid": True,
        "deliverable": True,
        "disposable": False,
        "domain_age_days": 4000,
        "mx_found": True,
        "breach_count": 5,
        "breaches": ["DarkWeb Dump 2023", "Credential Leak 2022"],
        "risk_flag": "high_breach_exposure",
    },
}


def normalize(email: str) -> str:
    return email.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Email") -> dict[str, Any]:
    """Lookup email address details."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Looking up email: {entity}", file=sys.stderr)
    time.sleep(0.3)

    normalized = normalize(entity)
    email_data = SIMULATED_EMAILS.get(normalized)
    findings = [email_data] if email_data else []

    print(f"[{TOOL_ID}] Email lookup complete", file=sys.stderr)

    if not email_data:
        domain = entity.split("@")[-1] if "@" in entity else ""
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "unknown",
            "confidence": 40,
            "findings": [{"valid": True, "domain": domain, "breach_count": 0}],
            "sources": ["Email Validator (simulated)", "HaveIBeenPwned (simulated)"],
        }

    has_risk = email_data.get("risk_flag") is not None
    is_disposable = email_data.get("disposable", False)
    high_breach = email_data.get("breach_count", 0) >= 3

    if has_risk or is_disposable:
        status = "alert"
    elif high_breach:
        status = "warning"
    else:
        status = "valid"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 95,
        "findings": findings,
        "sources": ["Email Validator (simulated)", "HaveIBeenPwned (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.email_lookup 'email@example.com'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
