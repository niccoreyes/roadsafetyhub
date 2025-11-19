# Change: Fix Transport Accident Counting

## Why
Transport accident counting is only matching observations with the specific SNOMED CT versioned URI (`http://snomed.info/sct/900000000000207008/version/20241001`) instead of using the canonical SNOMED CT system URI (`http://snomed.info/sct`). Additionally, conditions with the same SNOMED code are not being counted, leading to undercounting of transport accidents in the dashboard metrics.

**Note**: Injury classification chips appear to be working because they use condition codes from the data, not the SNOMED 274215009 filter.

## What Changes
- **Fix SNOMED system matching**: Update transport accident filtering logic to match both:
  - `http://snomed.info/sct` (canonical)
  - `http://snomed.info/sct/900000000000207008/version/20241001` (version-specific)
- **Include conditions**: Extend transport accident counting to also check conditions with SNOMED CT code 274215009
- **Update display**: Modify the transport accident metrics card to reflect that it counts both observations and conditions
- **Update metric calculations**: Ensure `totalTrafficAccidents` metric includes both observation and condition counts

**Affected specs**: observation-metrics

**Affected code**:
- `src/pages/Index.tsx:90-100` (transport accident observation filtering)
- `src/utils/metricsCalculator.ts:253-270` (countTransportAccidents function)
- `src/utils/metricsCalculator.ts:94-166` (calculateMetrics function to include conditions)
