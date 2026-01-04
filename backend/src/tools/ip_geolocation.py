#!/usr/bin/env python3
"""IP address geolocation and risk assessment."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "ip_geolocation"

SIMULATED_IPS = {
    "8.8.8.8": {
        "ip": "8.8.8.8",
        "country": "US",
        "city": "Mountain View",
        "region": "California",
        "isp": "Google LLC",
        "org": "Google Public DNS",
        "is_vpn": False,
        "is_proxy": False,
        "is_tor": False,
        "is_datacenter": True,
        "threat_score": 0,
    },
    "185.220.101.1": {
        "ip": "185.220.101.1",
        "country": "DE",
        "city": "Frankfurt",
        "region": "Hesse",
        "isp": "Tor Exit Node",
        "org": "Tor Project",
        "is_vpn": False,
        "is_proxy": False,
        "is_tor": True,
        "is_datacenter": True,
        "threat_score": 85,
        "risk_flags": ["tor_exit_node", "anonymous_network"],
    },
    "103.224.182.250": {
        "ip": "103.224.182.250",
        "country": "CN",
        "city": "Beijing",
        "region": "Beijing",
        "isp": "China Telecom",
        "org": "Unknown",
        "is_vpn": True,
        "is_proxy": True,
        "is_tor": False,
        "is_datacenter": True,
        "threat_score": 70,
        "risk_flags": ["vpn_detected", "high_risk_country"],
    },
    "192.168.1.1": {
        "ip": "192.168.1.1",
        "country": "Private",
        "city": "Private Network",
        "region": "N/A",
        "isp": "Private",
        "org": "Private Network",
        "is_vpn": False,
        "is_proxy": False,
        "is_tor": False,
        "is_datacenter": False,
        "threat_score": 0,
        "private": True,
    },
}


def normalize(ip: str) -> str:
    return ip.strip()


@weave_op
def check(entity: str, entity_type: str = "IP") -> dict[str, Any]:
    """Geolocate an IP address and assess risk."""
    result_id = cuid()
    normalized = normalize(entity)
    print(f"[{TOOL_ID}] Geolocating IP: {normalized}", file=sys.stderr)
    time.sleep(0.3)

    ip_data = SIMULATED_IPS.get(normalized)
    findings = [ip_data] if ip_data else []

    print(f"[{TOOL_ID}] IP lookup complete", file=sys.stderr)

    if not ip_data:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "unknown",
            "confidence": 40,
            "findings": [{"ip": entity, "country": "Unknown", "threat_score": 50}],
            "sources": ["IP Geolocation (simulated)"],
        }

    threat_score = ip_data.get("threat_score", 0)
    risk_flags = ip_data.get("risk_flags", [])

    if threat_score >= 70:
        status = "alert"
    elif threat_score >= 40 or ip_data.get("is_vpn") or ip_data.get("is_tor"):
        status = "warning"
    else:
        status = "clear"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 95,
        "findings": findings,
        "sources": ["IP Geolocation (simulated)", "Threat Intelligence (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.ip_geolocation '8.8.8.8'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
