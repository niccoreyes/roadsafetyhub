# Change: Deduplicate Patients by Identifier

## Why

The current implementation counts patients by FHIR Patient resource ID, but there can be duplicate patients with different FHIR IDs sharing the same identifier (e.g., PSO/Philippine Statistics Authority ID). This leads to overcounting patients in metrics calculations and wrong Key Performance Indicators (KPIs).

## What Changes

- Modify `groupByAgeGroup()` function in metricsCalculator.ts to deduplicate patients by identifier ID instead of patient FHIR ID
- Modify `groupBySex()` function in metricsCalculator.ts to deduplicate patients by identifier ID
- Add helper function to extract unique identifier values from patient resources based on system URL
- Update patient counting logic across all metrics calculations to use identifier-based deduplication
- Remove duplicate patients from tracked patient lists and counting logic
- **BREAKING**: Patient counts may decrease significantly if duplicate patients exist in the dataset

## Impact

- Affected specs: ui-metrics, observation-metrics, date-filter
- Affected code: src/utils/metricsCalculator.ts (groupByAgeGroup, groupBySex, calculateMetrics)
- Affected code: src/pages/Index.tsx (metrics calculation and display)
- Test coverage: src/utils/metricsCalculator.test.ts will need updates for new deduplication logic
