# Adverse Media Check

Screen for negative news coverage about an entity.

## Usage

```bash
python src/tools/adverse_media.py "ENTITY_NAME"
```

Returns JSON with:
- `status`: "alert", "warning", or "clear"
- `confidence`: 0-100 score
- `findings`: news articles with sentiment
- `sources`: news databases checked

## When to use

Use this skill when:
- Checking for negative press
- Screening for reputational risk
- Investigating media coverage
