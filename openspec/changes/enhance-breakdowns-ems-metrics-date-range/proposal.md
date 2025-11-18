# Change: Enhance Breakdowns and EMS Metrics with Date Range Filtering

## Why
The dashboard currently displays sex, age, and mortality breakdowns using all-time data regardless of the selected date range. Additionally, EMS Response Metrics do not respect date filtering, and there's no clear warning at the dashboard level about simulated data, which can mislead users about data accuracy and freshness.

## What Changes
- Add date range filtering to sex, age, and mortality breakdown charts
- Enhance EMS Response Metrics component to respect the selected date range
- Add prominent dashboard-level warning about simulated data for all metrics
- Maintain existing date-range filtering logic that already works for Encounters and Conditions
- Improve UX clarity around real vs simulated data

## Impact
- **Affected specs:** data-filtering, ui-metrics
- **Affected code:**
  - `src/components/dashboard/SexPieChart.tsx`
  - `src/components/dashboard/AgeBarChart.tsx`
  - `src/components/dashboard/MortalityPieChart.tsx`
  - `src/components/dashboard/EmsMetricsChart.tsx`
  - `src/components/dashboard/TrendsChart.tsx`
  - `src/pages/Index.tsx` (dashboard-level warning)
  - `src/utils/metrics.ts` (utility functions)
