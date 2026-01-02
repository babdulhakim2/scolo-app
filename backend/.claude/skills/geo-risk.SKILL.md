# Geographic Risk Assessment

Assess country-level risk based on FATF and corruption indices.

## Usage

```bash
python src/tools/geo_risk.py "COUNTRY_CODE_OR_NAME"
```

Returns JSON with:
- `status`: "high", "medium", or "low"
- `confidence`: 0-100 score
- `findings`: country risk data (FATF status, CPI score)
- `sources`: FATF, Transparency International

## When to use

Use this skill when:
- Assessing country risk
- Checking FATF compliance status
- Evaluating geographic exposure
