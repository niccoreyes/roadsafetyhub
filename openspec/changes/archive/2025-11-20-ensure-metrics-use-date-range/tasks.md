## 1. Implementation Tasks

- [x] 1.1 Update `calculateMetrics()` signature in `src/utils/metricsCalculator.ts` to accept optional `dateRange` parameter
- [x] 1.2 Add date range validation logging within `calculateMetrics()` to confirm metrics are calculated with filtered data
- [x] 1.3 Update `calculateMetrics()` JSDoc comments to document the date range parameter and its purpose
- [x] 1.4 Modify `Index.tsx` to pass the `date` object to `calculateMetrics()` function call (line 165)
- [x] 1.5 Add console logging for key metric calculations (traffic deaths, injuries, accidents) to show date range context
- [x] 1.6 Update `groupByAgeGroup()` and `groupBySex()` function calls to ensure they receive encounters and date range
- [x] 1.7 Test the implementation by selecting different date ranges and verifying console logs show correct filtering

## 2. Validation Tasks

- [x] 2.1 Verify mortality rate changes when selecting different date ranges with known data
- [x] 2.2 Verify injury rate reflects only conditions within the date range
- [x] 2.3 Verify case fatality rate uses date-filtered encounters as denominator
- [x] 2.4 Verify transport accident count matches date range filter
- [x] 2.5 Verify age and sex breakdowns only include patients with encounters in the date range
- [x] 2.6 Verify mortality breakdown (expired/survived) uses date-filtered encounters

## 3. Documentation Tasks

- [x] 3.1 Update inline code comments in `metricsCalculator.ts` to document date range usage
- [x] 3.2 Update function documentation for `calculateMetrics()` to explain date filtering behavior
- [x] 3.3 Run `openspec validate ensure-metrics-use-date-range --strict` to validate the proposal
- [x] 3.4 Request review and approval before merging changes
