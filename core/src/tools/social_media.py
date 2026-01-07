#!/usr/bin/env python3
"""Social media profile discovery."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "social_media"

SIMULATED_PROFILES = {
    "john smith": [
        {"platform": "LinkedIn", "handle": "johnsmith", "url": "https://linkedin.com/in/johnsmith", "followers": 500, "verified": False},
        {"platform": "Twitter", "handle": "@jsmith", "url": "https://twitter.com/jsmith", "followers": 1200, "verified": False},
        {"platform": "Facebook", "handle": "john.smith.123", "url": "https://facebook.com/john.smith.123", "followers": 350, "verified": False},
    ],
    "jane doe": [
        {"platform": "LinkedIn", "handle": "janedoe", "url": "https://linkedin.com/in/janedoe", "followers": 2500, "verified": True},
        {"platform": "Twitter", "handle": "@janedoe_official", "url": "https://twitter.com/janedoe_official", "followers": 15000, "verified": True},
    ],
    "vladimir putin": [
        {"platform": "VK", "handle": "kremlin", "url": "https://vk.com/kremlin", "followers": 1500000, "verified": True, "official": True},
        {"platform": "Telegram", "handle": "@kremlin_official", "url": "https://t.me/kremlin_official", "followers": 800000, "verified": True},
    ],
    "anonymous user": [
        {"platform": "Reddit", "handle": "u/throwaway12345", "url": "https://reddit.com/u/throwaway12345", "followers": 0, "verified": False, "risk_flag": "anonymous_account"},
        {"platform": "4chan", "handle": "Anonymous", "url": None, "followers": 0, "verified": False, "risk_flag": "anonymous_platform"},
    ],
}


def normalize(name: str) -> str:
    return name.lower().strip()


@weave_op
def check(entity: str, entity_type: str = "Person") -> dict[str, Any]:
    """Discover social media profiles for an entity."""
    result_id = cuid()
    print(f"[{TOOL_ID}] Searching social media for: {entity}", file=sys.stderr)
    time.sleep(0.4)

    normalized = normalize(entity)
    findings = []

    for key, profiles in SIMULATED_PROFILES.items():
        if key in normalized or normalized in key:
            findings = profiles
            break

    print(f"[{TOOL_ID}] Found {len(findings)} social profiles", file=sys.stderr)

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 60,
            "findings": [],
            "sources": ["Social Media Search (simulated)"],
        }

    has_risk = any(f.get("risk_flag") for f in findings)
    has_verified = any(f.get("verified") for f in findings)

    if has_risk:
        status = "review"
    elif has_verified:
        status = "verified"
    else:
        status = "found"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 75,
        "findings": findings,
        "sources": ["Social Media Search (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.social_media 'Person Name'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
