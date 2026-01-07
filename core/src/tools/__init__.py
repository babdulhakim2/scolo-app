import os
from typing import TypedDict

from cuid2 import cuid_wrapper

try:
    import weave
    if os.getenv("WEAVE_PROJECT"):
        weave.init(os.getenv("WEAVE_PROJECT"))
        WEAVE_ENABLED = True
    else:
        WEAVE_ENABLED = False
except ImportError:
    WEAVE_ENABLED = False
    weave = None

cuid = cuid_wrapper()


def weave_op(func):
    """Decorator that applies weave.op() if Weave is enabled."""
    if WEAVE_ENABLED and weave:
        return weave.op()(func)
    return func


class ToolInfo(TypedDict):
    name: str
    category: str
    icon: str
    description: str


TOOL_REGISTRY: dict[str, ToolInfo] = {
    "sanctions": {
        "name": "Sanctions Check",
        "category": "compliance",
        "icon": "shield",
        "description": "Screen against OFAC SDN, UN, EU sanctions lists",
    },
    "pep_check": {
        "name": "PEP Screening",
        "category": "compliance",
        "icon": "user-check",
        "description": "Check for politically exposed persons",
    },
    "adverse_media": {
        "name": "Adverse Media",
        "category": "compliance",
        "icon": "newspaper",
        "description": "Search for negative news coverage",
    },
    "geo_risk": {
        "name": "Geographic Risk",
        "category": "compliance",
        "icon": "globe",
        "description": "Assess country/jurisdiction risk levels",
    },
    "business_registry": {
        "name": "Business Registry",
        "category": "compliance",
        "icon": "building",
        "description": "Lookup company registration records",
    },
    "ubo_lookup": {
        "name": "UBO Lookup",
        "category": "compliance",
        "icon": "users",
        "description": "Identify ultimate beneficial owners",
    },
    "employment_verify": {
        "name": "Employment Verification",
        "category": "hr",
        "icon": "briefcase",
        "description": "Verify employment history",
    },
    "education_verify": {
        "name": "Education Verification",
        "category": "hr",
        "icon": "graduation-cap",
        "description": "Verify educational credentials",
    },
    "court_records": {
        "name": "Court Records",
        "category": "legal",
        "icon": "gavel",
        "description": "Search federal and state court records",
    },
    "property_records": {
        "name": "Property Records",
        "category": "legal",
        "icon": "home",
        "description": "Search property ownership records",
    },
    "corporate_filings": {
        "name": "Corporate Filings",
        "category": "legal",
        "icon": "file-text",
        "description": "Search SEC and state corporate filings",
    },
    "phone_lookup": {
        "name": "Phone Lookup",
        "category": "digital",
        "icon": "phone",
        "description": "Carrier, location, and line type lookup",
    },
    "email_lookup": {
        "name": "Email Lookup",
        "category": "digital",
        "icon": "mail",
        "description": "Email validation and breach check",
    },
    "social_media": {
        "name": "Social Media",
        "category": "digital",
        "icon": "at-sign",
        "description": "Find social media profiles",
    },
    "domain_whois": {
        "name": "Domain WHOIS",
        "category": "digital",
        "icon": "globe",
        "description": "Domain registration lookup",
    },
    "ip_geolocation": {
        "name": "IP Geolocation",
        "category": "digital",
        "icon": "map-pin",
        "description": "Geolocate IP addresses",
    },
    "crypto_trace": {
        "name": "Crypto Trace",
        "category": "digital",
        "icon": "wallet",
        "description": "Trace cryptocurrency wallet activity",
    },
}

from . import (
    adverse_media,
    business_registry,
    court_records,
    corporate_filings,
    crypto_trace,
    domain_whois,
    education_verify,
    email_lookup,
    employment_verify,
    geo_risk,
    ip_geolocation,
    pep_check,
    phone_lookup,
    property_records,
    sanctions,
    social_media,
    ubo_lookup,
)

TOOLS = {
    "sanctions": sanctions.check,
    "adverse_media": adverse_media.check,
    "business_registry": business_registry.check,
    "pep_check": pep_check.check,
    "geo_risk": geo_risk.check,
    "ubo_lookup": ubo_lookup.check,
    "employment_verify": employment_verify.check,
    "education_verify": education_verify.check,
    "court_records": court_records.check,
    "property_records": property_records.check,
    "corporate_filings": corporate_filings.check,
    "phone_lookup": phone_lookup.check,
    "email_lookup": email_lookup.check,
    "social_media": social_media.check,
    "domain_whois": domain_whois.check,
    "ip_geolocation": ip_geolocation.check,
    "crypto_trace": crypto_trace.check,
}

__all__ = [
    "TOOLS",
    "TOOL_REGISTRY",
    "sanctions",
    "adverse_media",
    "business_registry",
    "pep_check",
    "geo_risk",
    "ubo_lookup",
    "employment_verify",
    "education_verify",
    "court_records",
    "property_records",
    "corporate_filings",
    "phone_lookup",
    "email_lookup",
    "social_media",
    "domain_whois",
    "ip_geolocation",
    "crypto_trace",
]
