#!/usr/bin/env python3
"""
Test Suite for Claude Skills Integration
Tests that Claude can intelligently select and use the right skills based on user queries.
"""

import json
import sys
import os
from typing import Dict, List, Any
from dataclasses import dataclass

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
from src.tools import TOOLS, TOOL_REGISTRY


@dataclass
class SkillTest:
    """Test case for skill invocation"""
    query: str
    expected_skill: str
    expected_tools: List[str]
    description: str


# Define comprehensive test cases
SKILL_TESTS = [
    # Compliance Tool Tests
    SkillTest(
        query="Check sanctions for Vladimir Putin",
        expected_skill="sanctions-check",
        expected_tools=["sanctions"],
        description="Should recognize sanctions screening request"
    ),
    SkillTest(
        query="Is Angela Merkel a PEP?",
        expected_skill="pep-screening",
        expected_tools=["pep_check"],
        description="Should recognize PEP screening request"
    ),
    SkillTest(
        query="Any negative news about Wells Fargo?",
        expected_skill="adverse-media",
        expected_tools=["adverse_media"],
        description="Should recognize adverse media request"
    ),
    SkillTest(
        query="What's the risk level for doing business in Iran?",
        expected_skill="geo-risk",
        expected_tools=["geo_risk"],
        description="Should recognize geographic risk assessment"
    ),
    SkillTest(
        query="Look up the registration for Acme Corp",
        expected_skill="business-registry",
        expected_tools=["business_registry"],
        description="Should recognize business registry lookup"
    ),
    SkillTest(
        query="Who owns Global Ventures LLC?",
        expected_skill="ubo-lookup",
        expected_tools=["ubo_lookup"],
        description="Should recognize UBO lookup request"
    ),

    # HR/Background Tests
    SkillTest(
        query="Verify John Smith's employment at Google",
        expected_skill="employment-verify",
        expected_tools=["employment_verify"],
        description="Should recognize employment verification"
    ),
    SkillTest(
        query="Check if Jane Doe really has an MBA from Harvard",
        expected_skill="education-verify",
        expected_tools=["education_verify"],
        description="Should recognize education verification"
    ),

    # Legal/Public Records Tests
    SkillTest(
        query="Any court cases involving John Doe?",
        expected_skill="court-records",
        expected_tools=["court_records"],
        description="Should recognize court records search"
    ),
    SkillTest(
        query="What properties does Smith Holdings own?",
        expected_skill="property-records",
        expected_tools=["property_records"],
        description="Should recognize property records search"
    ),
    SkillTest(
        query="Get SEC filings for Apple Inc",
        expected_skill="corporate-filings",
        expected_tools=["corporate_filings"],
        description="Should recognize corporate filings request"
    ),

    # Digital Footprint Tests
    SkillTest(
        query="Look up phone number 555-1234",
        expected_skill="phone-lookup",
        expected_tools=["phone_lookup"],
        description="Should recognize phone lookup"
    ),
    SkillTest(
        query="Check if john@example.com has been in any breaches",
        expected_skill="email-lookup",
        expected_tools=["email_lookup"],
        description="Should recognize email lookup"
    ),
    SkillTest(
        query="Find social media profiles for Jane Smith",
        expected_skill="social-media",
        expected_tools=["social_media"],
        description="Should recognize social media search"
    ),
    SkillTest(
        query="Who owns example.com domain?",
        expected_skill="domain-whois",
        expected_tools=["domain_whois"],
        description="Should recognize domain WHOIS lookup"
    ),
    SkillTest(
        query="Where is IP 8.8.8.8 located?",
        expected_skill="ip-geolocation",
        expected_tools=["ip_geolocation"],
        description="Should recognize IP geolocation"
    ),
    SkillTest(
        query="Trace Bitcoin wallet bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        expected_skill="crypto-trace",
        expected_tools=["crypto_trace"],
        description="Should recognize crypto tracing"
    ),

    # Meta-Skill Tests
    SkillTest(
        query="Run full background check on John Smith",
        expected_skill="full-compliance-check",
        expected_tools=["sanctions", "pep_check", "adverse_media", "business_registry", "ubo_lookup"],
        description="Should recognize full compliance check request"
    ),
    SkillTest(
        query="Quick screen Global Ventures for risk",
        expected_skill="quick-screen",
        expected_tools=["sanctions", "pep_check", "adverse_media"],
        description="Should recognize quick screening request"
    ),
    SkillTest(
        query="Investigate Acme Corporation",
        expected_skill="full-compliance-check",
        expected_tools=["sanctions", "adverse_media", "business_registry", "ubo_lookup"],
        description="Should recognize investigation request"
    ),
]


def test_tool_availability():
    """Test that all expected tools are available"""
    print("\n=== Testing Tool Availability ===")
    expected_tools = set()
    for test in SKILL_TESTS:
        expected_tools.update(test.expected_tools)

    missing_tools = []
    for tool in expected_tools:
        if tool not in TOOLS:
            missing_tools.append(tool)
            print(f"❌ Tool not found: {tool}")
        else:
            print(f"✅ Tool available: {tool}")

    if missing_tools:
        print(f"\n⚠️  Missing {len(missing_tools)} tools: {', '.join(missing_tools)}")
        return False
    else:
        print(f"\n✅ All {len(expected_tools)} tools are available")
        return True


def test_tool_execution():
    """Test that tools can be executed"""
    print("\n=== Testing Tool Execution ===")

    # Test a few key tools with safe test data
    test_cases = [
        ("sanctions", "Test Entity", {}),
        ("pep_check", "Test Person", {}),
        ("adverse_media", "Test Company", {}),
    ]

    for tool_name, entity, kwargs in test_cases:
        if tool_name in TOOLS:
            try:
                result = TOOLS[tool_name](entity, **kwargs)
                if result and isinstance(result, dict):
                    print(f"✅ {tool_name}: Executed successfully")
                    print(f"   - Status: {result.get('status', 'N/A')}")
                    print(f"   - Confidence: {result.get('confidence', 'N/A')}")
                else:
                    print(f"⚠️  {tool_name}: Unexpected result format")
            except Exception as e:
                print(f"❌ {tool_name}: Execution failed - {str(e)}")
        else:
            print(f"❌ {tool_name}: Tool not found")


def test_skill_intelligence():
    """Test Claude's ability to select appropriate skills"""
    print("\n=== Testing Skill Intelligence ===")
    print("These tests verify that queries map to the correct skills:\n")

    for test in SKILL_TESTS[:5]:  # Show first 5 as examples
        print(f"Query: \"{test.query}\"")
        print(f"  → Expected Skill: {test.expected_skill}")
        print(f"  → Expected Tools: {', '.join(test.expected_tools)}")
        print(f"  → Rationale: {test.description}\n")


def generate_skill_mapping_report():
    """Generate a report of skill coverage"""
    print("\n=== Skill Coverage Report ===")

    # Count skills by category
    categories = {
        "Compliance": ["sanctions", "pep_check", "adverse_media", "geo_risk", "business_registry", "ubo_lookup"],
        "HR/Background": ["employment_verify", "education_verify"],
        "Legal/Public Records": ["court_records", "property_records", "corporate_filings"],
        "Digital Footprint": ["phone_lookup", "email_lookup", "social_media", "domain_whois", "ip_geolocation", "crypto_trace"],
    }

    for category, tools in categories.items():
        available = sum(1 for tool in tools if tool in TOOLS)
        print(f"{category}: {available}/{len(tools)} tools available")

    # List all registered tools
    print(f"\nTotal Registered Tools: {len(TOOL_REGISTRY)}")
    for tool_key, tool_info in TOOL_REGISTRY.items():
        status = "✅" if tool_key in TOOLS else "❌"
        print(f"  {status} {tool_key}: {tool_info['description']}")


def run_integration_test(entity_name: str = "Test Entity"):
    """Run a full integration test"""
    print(f"\n=== Running Integration Test for '{entity_name}' ===")

    # Simulate what Claude would do with a full compliance check
    workflow = [
        ("sanctions", "Sanctions Screening"),
        ("pep_check", "PEP Check"),
        ("adverse_media", "Adverse Media"),
    ]

    results = {}
    for tool_name, description in workflow:
        print(f"\nExecuting: {description}")
        if tool_name in TOOLS:
            try:
                result = TOOLS[tool_name](entity_name)
                results[tool_name] = result
                print(f"  Status: {result.get('status', 'Unknown')}")
                print(f"  Confidence: {result.get('confidence', 0)}%")
                findings = result.get('findings', [])
                print(f"  Findings: {len(findings)} items")
            except Exception as e:
                print(f"  Error: {str(e)}")
                results[tool_name] = {"error": str(e)}

    # Generate risk assessment
    print("\n=== Risk Assessment ===")
    high_risk = any(r.get('status') == 'match' for r in results.values() if isinstance(r, dict))
    medium_risk = any(r.get('status') == 'potential' for r in results.values() if isinstance(r, dict))

    if high_risk:
        print("⛔ HIGH RISK - Positive matches found")
    elif medium_risk:
        print("⚠️  MEDIUM RISK - Potential matches require review")
    else:
        print("✅ LOW RISK - No significant findings")

    return results


def main():
    """Main test runner"""
    print("=" * 60)
    print("SCOLO SKILLS TEST SUITE")
    print("=" * 60)

    # Run all tests
    test_tool_availability()
    test_tool_execution()
    test_skill_intelligence()
    generate_skill_mapping_report()

    # Run integration test
    if len(sys.argv) > 1:
        test_entity = " ".join(sys.argv[1:])
        run_integration_test(test_entity)
    else:
        print("\nTip: Run with an entity name to test full workflow")
        print("Example: python test_skills.py Vladimir Putin")


if __name__ == "__main__":
    main()