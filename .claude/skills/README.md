# Scolo Claude Skills Documentation

## Overview
This directory contains Claude Skills that enable intelligent use of Scolo's compliance and investigation tools. Skills help Claude understand when and how to use specific tools based on natural language requests.

## Available Skills

### Compliance Tools
- **sanctions-check** - Screen entities against global sanctions lists (OFAC, UN, EU)
- **pep-screening** - Identify politically exposed persons and their associates
- **adverse-media** - Search for negative news and reputational risks
- **geo-risk** - Assess country and jurisdiction risk levels
- **business-registry** - Look up company registration and incorporation details
- **ubo-lookup** - Identify ultimate beneficial owners of companies

### HR/Background Tools
- **employment-verify** - Verify employment history and work experience
- **education-verify** - Verify educational credentials and degrees

### Legal/Public Records Tools
- **court-records** - Search federal and state court cases
- **property-records** - Search property ownership and real estate records
- **corporate-filings** - Access SEC filings and corporate disclosures

### Digital Footprint Tools
- **phone-lookup** - Get carrier, location, and line type information
- **email-lookup** - Validate emails and check breach databases
- **social-media** - Find social media profiles across platforms
- **domain-whois** - Look up domain registration information
- **ip-geolocation** - Geolocate IP addresses
- **crypto-trace** - Trace cryptocurrency wallet transactions

### Meta-Skills (Combined Operations)
- **full-compliance-check** - Comprehensive screening using all compliance tools
- **quick-screen** - Rapid risk assessment using core compliance tools

## How Skills Work

Each skill contains:
1. **YAML Frontmatter** - Metadata including name, description, and allowed tools
2. **Instructions** - Clear guidance for Claude on when and how to use the skill
3. **Examples** - Concrete use cases showing proper usage
4. **Python Integration** - Direct calls to backend tools via `src.tools.*`

## Usage Examples

### Simple Query
```
User: "Check if Vladimir Putin is sanctioned"
Claude: [Activates sanctions-check skill] → Runs sanctions.check("Vladimir Putin")
```

### Complex Query
```
User: "Run full background check on Global Ventures LLC"
Claude: [Activates full-compliance-check skill] → Runs multiple tools in sequence
```

### Ambiguous Query
```
User: "Investigate John Smith"
Claude: [Recognizes investigation intent] → Suggests appropriate skills or asks for clarification
```

## Testing Skills

Run the test suite to verify skill functionality:

```bash
cd /Users/superfunguy/wsp/scolo
python test_skills.py

# Test with specific entity
python test_skills.py "Vladimir Putin"
```

## Adding New Skills

To create a new skill:

1. Create directory: `.claude/skills/your-skill-name/`
2. Create `SKILL.md` with:
   ```markdown
   ---
   name: your-skill-name
   description: Brief description of what this skill does
   allowed-tools: ["Bash", "Read", "Write"]
   ---

   # Skill Name

   ## When to Use
   [Activation criteria]

   ## Instructions
   [Step-by-step usage]

   ## Examples
   [Concrete examples]
   ```

3. Restart Claude for changes to take effect

## Troubleshooting

### Skill Not Activating
- Check that skill name in YAML matches directory name
- Verify description clearly states when to use the skill
- Ensure settings.json includes `"allowed_tools": ["Skills"]`

### Tool Execution Fails
- Verify Python path and imports are correct
- Check that backend tools are properly installed
- Review error messages in tool output

### Multiple Skills Activate
- Make skill descriptions more specific
- Use unique trigger keywords
- Consider creating meta-skills for combined operations

## Best Practices

1. **Clear Descriptions** - Write descriptions that clearly indicate when to use each skill
2. **Specific Examples** - Provide concrete examples in each skill
3. **Error Handling** - Include guidance for handling errors and edge cases
4. **Audit Trail** - Document all compliance checks for regulatory requirements
5. **Regular Updates** - Keep skills updated as new tools are added

## Integration with Backend

Skills integrate with Python tools in `/backend/src/tools/`:
```python
from src.tools import [tool_name]
result = [tool_name].check(entity_name)
```

Each tool returns structured data:
```json
{
  "id": "unique_id",
  "tool": "tool_name",
  "entity": "entity_name",
  "status": "clear|potential|match",
  "confidence": 0-100,
  "findings": [...],
  "sources": [...]
}
```

## Compliance Considerations

- **Regulatory Requirements** - Ensure all checks meet AML/KYC regulations
- **Data Privacy** - Handle personal data according to GDPR/privacy laws
- **Audit Logging** - Maintain records of all compliance checks
- **Professional Review** - Results should be reviewed by compliance professionals

## Support

For issues or questions:
- Review individual skill documentation in SKILL.md files
- Check test results with `python test_skills.py`
- Consult backend tool documentation in `/backend/src/tools/`