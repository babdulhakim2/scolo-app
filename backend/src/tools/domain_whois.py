#!/usr/bin/env python3
"""Domain WHOIS lookup."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "domain_whois"

SIMULATED_DOMAINS = {
    "example.com": {
        "registrar": "GoDaddy",
        "created": "1995-08-14",
        "expires": "2025-08-13",
        "registrant": "Example Inc",
        "registrant_country": "US",
        "nameservers": ["ns1.example.com", "ns2.example.com"],
        "status": "active",
    },
    "suspicious-site.xyz": {
        "registrar": "Namecheap",
        "created": "2023-11-01",
        "expires": "2024-11-01",
        "registrant": "REDACTED FOR PRIVACY",
        "registrant_country": "Unknown",
        "nameservers": ["dns1.registrar-servers.com"],
        "status": "active",
        "risk_flags": ["new_domain", "privacy_protected", "suspicious_tld"],
    },
    "globalventures.com": {
        "registrar": "MarkMonitor",
        "created": "2005-03-15",
        "expires": "2030-03-15",
        "registrant": "Global Ventures LLC",
        "registrant_country": "US",
        "nameservers": ["ns1.cloudflare.com", "ns2.cloudflare.com"],
        "status": "active",
    },
    "phishing-bank.com": {
        "registrar": "NameSilo",
        "created": "2024-01-05",
        "expires": "2025-01-05",
        "registrant": "REDACTED",
        "registrant_country": "RU",
        "nameservers": ["ns1.bulletproof-host.ru"],
        "status": "active",
        "risk_flags": ["very_new_domain", "suspicious_registrant", "bulletproof_hosting"],
    },
}


def normalize(domain: str) -> str:
    return domain.lower().strip().replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]


@weave_op
def check(entity: str, entity_type: str = "Domain") -> dict[str, Any]:
    """Lookup domain WHOIS information."""
    result_id = cuid()
    normalized = normalize(entity)
    print(f"[{TOOL_ID}] Looking up WHOIS for: {normalized}", file=sys.stderr)
    time.sleep(0.4)

    domain_data = SIMULATED_DOMAINS.get(normalized)
    findings = [domain_data] if domain_data else []

    print(f"[{TOOL_ID}] WHOIS lookup complete", file=sys.stderr)

    if not domain_data:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 50,
            "findings": [],
            "sources": ["WHOIS Database (simulated)"],
        }

    risk_flags = domain_data.get("risk_flags", [])
    has_risk = len(risk_flags) > 0

    if has_risk and len(risk_flags) >= 2:
        status = "alert"
    elif has_risk:
        status = "warning"
    else:
        status = "clear"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 90,
        "findings": findings,
        "sources": ["WHOIS Database (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.domain_whois 'example.com'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
