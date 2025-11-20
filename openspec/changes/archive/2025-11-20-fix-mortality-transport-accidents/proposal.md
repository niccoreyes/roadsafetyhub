# Change: Fix Mortality Rate and Transport Accident Counting Logic

## Why
The current implementation has two critical issues:
1. **Mortality Rate & Case Fatality Rate**: Uses broad keyword-based traffic accident detection instead of specific SNOMED CT codes 274215009 (Transport accident) and 127348004 (Motor vehicle accident victim), potentially including non-traffic accidents
2. **Transport Accidents Chip**: Only counts SNOMED CT code 274215009 and excludes 127348004, undercounting transport accidents
3. **Counting Method**: Mortality calculations should de-duplicate patients who have multiple encounters with both codes to avoid overcounting the same patient

## What Changes
- **Update mortality rate calculation**: Base traffic accidents on BOTH SNOMED CT codes (274215009 and 127348004) instead of keyword-based matching
- **Update case fatality rate**: Use the same SNOMED-based traffic accident criteria as mortality rate
- **Update transport accidents chip**: Include BOTH SNOMED CT codes 274215009 and 127348004 in the counting logic
- **Change counting logic**: Mortality calculations count per unique patient; transport accidents chip counts per encounter
- **Add patient deduplication**: For mortality rate, ensure patients with codes pointing to the same patient are not counted as duplicates

**Affected specs**: ui-metrics, observation-metrics

**Affected code**:
- `src/utils/metricsCalculator.ts:88-166` (calculateMetrics function to use specific SNOMED codes)
- `src/utils/metricsCalculator.ts:320-374` (countTransportAccidents and related functions)
- `src/utils/snomedMapping.ts:38-48` (isTrafficRelatedCondition to use SNOMED codes)
- `src/pages/Index.tsx:96-100` (transport accident observation filtering)
