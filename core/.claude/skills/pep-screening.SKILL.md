# PEP Screening

Check if an entity is a Politically Exposed Person (PEP).

## Usage

```bash
python src/tools/pep_check.py "ENTITY_NAME"
```

Returns JSON with:
- `status`: "match", "potential", or "clear"
- `confidence`: 0-100 score
- `findings`: array of PEP records
- `sources`: databases checked

## When to use

Use this skill when:
- Checking if someone is a PEP
- Running KYC/AML screening
- Investigating political connections
