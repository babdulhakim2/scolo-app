# Sanctions Check

Run sanctions screening against OFAC SDN and international sanctions lists.

## Usage

When asked to check an entity for sanctions, run:

```bash
python src/tools/sanctions.py "ENTITY_NAME"
```

Returns JSON with:
- `status`: "match", "potential", or "clear"
- `confidence`: 0-100 score
- `findings`: array of matched records
- `sources`: list of databases checked

## When to use

Use this skill when:
- User asks to check sanctions for a person or company
- Running compliance screening
- Investigating entities for OFAC/SDN matches
