# Change: Ensure Dashboard Metrics Use Date Range Filtering

## Why
Currently, the dashboard's key metrics (mortality rate, injury rate, case fatality rate, transport accident counts, sex/age/mortality breakdowns) are calculated from encounters and conditions that are filtered by date range at the fetch level. However, the metrics calculation logic in `calculateMetrics()` does not explicitly validate or document that it's working with date-filtered data. This creates ambiguity about whether the metrics reliably reflect the selected date range, especially for aggregated metrics like mortality rate that depend on accurate counting of traffic accidents and deaths within the specified period.

## What Changes
- **MODIFIED**: The `calculateMetrics()` function in `metricsCalculator.ts` will explicitly accept and document a `dateRange` parameter
- **MODIFIED**: The mortality rate, injury rate, and case fatality rate calculations will validate that input data is filtered by date range
- **MODIFIED**: The `Index.tsx` component will pass the selected `date` object to `calculateMetrics()` to ensure explicit date awareness
- **ADDED**: Console logging and documentation to confirm metrics are calculated based on the date-filtered dataset
- **ADDED**: Explicit validation that transport accident counts, sex breakdown, age breakdown, and mortality breakdown all use date-filtered data

**Breaking Changes**: None - this is a clarification and validation enhancement to existing functionality.

## Impact
- **Affected specs**: `ui-metrics`, `date-filter`
- **Affected code**: `src/utils/metricsCalculator.ts`, `src/pages/Index.tsx`
- **Affected metrics**: mortality rate, injury rate, case fatality rate, transport accident counts, sex breakdown by date, age breakdown by date, mortality breakdown (expired/survived counts)
- **Backwards compatibility**: Fully maintained - no changes to metric calculation formulas, only enhanced validation and documentation
