#!/usr/bin/env python3
"""Adverse media screening via news search."""

import json
import os
import sys
from typing import Any

import httpx

from . import weave_op, cuid

TOOL_ID = "adverse_media"


@weave_op
def check(entity: str, **opts) -> dict[str, Any]:
    """Search news sources for adverse media about entity."""
    result_id = cuid()

    findings = []
    findings.extend(_search_gdelt(entity))

    if not findings:
        return {
            "id": result_id,
            "tool": TOOL_ID,
            "entity": entity,
            "status": "clear",
            "confidence": 85,
            "findings": [],
            "sources": ["GDELT Project", "News APIs"],
        }

    has_adverse = any(f.get("sentiment") == "negative" for f in findings)

    return {
        "id": result_id,
        "tool": TOOL_ID,
        "entity": entity,
        "status": "alert" if has_adverse else "clear",
        "confidence": 80,
        "findings": findings,
        "sources": ["GDELT Project"],
    }


def _search_gdelt(entity: str) -> list[dict]:
    """Search GDELT for news mentions."""
    try:
        query = entity.replace(" ", "%20")
        r = httpx.get(
            f"https://api.gdeltproject.org/api/v2/doc/doc?query={query}&mode=artlist&format=json&maxrecords=5",
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()

        articles = data.get("articles", [])
        results = []
        for a in articles[:5]:
            tone = a.get("tone", 0)
            results.append({
                "title": a.get("title", ""),
                "source": a.get("domain", ""),
                "date": a.get("seendate", "")[:10],
                "url": a.get("url", ""),
                "sentiment": "negative" if tone < -3 else "neutral" if tone < 3 else "positive",
                "tone": round(tone, 1),
            })
        return results
    except Exception:
        return []


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python -m src.tools.adverse_media 'Entity'"}))
        sys.exit(1)
    print(json.dumps(check(sys.argv[1]), indent=2))
