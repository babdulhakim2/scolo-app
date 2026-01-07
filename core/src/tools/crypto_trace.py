#!/usr/bin/env python3
"""Cryptocurrency wallet tracing."""

import json
import sys
import time
from typing import Any

from . import weave_op, cuid

TOOL_ID = "crypto_trace"

SIMULATED_WALLETS = {
    "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2": {
        "blockchain": "Bitcoin",
        "balance": 0.5,
        "balance_usd": 21500,
        "tx_count": 45,
        "first_seen": "2020-03-15",
        "last_seen": "2024-01-10",
        "labels": ["exchange_deposit"],
        "risk_score": 15,
        "cluster": "Coinbase",
    },
    "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy": {
        "blockchain": "Bitcoin",
        "balance": 125.5,
        "balance_usd": 5412500,
        "tx_count": 1250,
        "first_seen": "2018-06-20",
        "last_seen": "2024-01-15",
        "labels": ["mixer_output", "darknet_market"],
        "risk_score": 92,
        "cluster": "Unknown",
        "risk_flags": ["mixing_service", "darknet_association", "high_value"],
    },
    "0x742d35Cc6634C0532925a3b844Bc9e7595f": {
        "blockchain": "Ethereum",
        "balance": 1500,
        "balance_usd": 3150000,
        "tx_count": 350,
        "first_seen": "2021-05-10",
        "last_seen": "2024-01-12",
        "labels": ["defi_user"],
        "risk_score": 25,
        "cluster": "DeFi Power User",
    },
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh": {
        "blockchain": "Bitcoin",
        "balance": 0,
        "balance_usd": 0,
        "tx_count": 5,
        "first_seen": "2023-12-01",
        "last_seen": "2023-12-15",
        "labels": ["ransomware_payment"],
        "risk_score": 100,
        "cluster": "Ransomware Gang X",
        "risk_flags": ["ransomware", "sanctioned_entity", "stolen_funds"],
    },
}


def normalize(address: str) -> str:
    return address.strip()


@weave_op
def check(entity: str, entity_type: str = "Crypto") -> dict[str, Any]:
    """Trace cryptocurrency wallet activity."""
    result_id = cuid()
    normalized = normalize(entity)
    print(f"[{TOOL_ID}] Tracing wallet: {normalized[:20]}...", file=sys.stderr)
    time.sleep(0.5)

    wallet_data = SIMULATED_WALLETS.get(normalized)
    findings = [wallet_data] if wallet_data else []

    print(f"[{TOOL_ID}] Wallet trace complete", file=sys.stderr)

    if not wallet_data:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "not_found",
            "confidence": 40,
            "findings": [],
            "sources": ["Blockchain Explorer (simulated)", "Chainalysis (simulated)"],
        }

    risk_score = wallet_data.get("risk_score", 0)
    risk_flags = wallet_data.get("risk_flags", [])

    if risk_score >= 80:
        status = "alert"
    elif risk_score >= 50:
        status = "warning"
    elif risk_score >= 25:
        status = "review"
    else:
        status = "clear"

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": status,
        "confidence": 90,
        "risk_score": risk_score,
        "findings": findings,
        "sources": ["Blockchain Explorer (simulated)", "Chainalysis (simulated)"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.crypto_trace 'wallet_address'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
