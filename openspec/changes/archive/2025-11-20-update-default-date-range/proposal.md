# Change: Update Default Date Range

## Why
The current default date range of November 1-30, 2025 is too broad for typical analysis use cases. A more focused 5-day range (November 17-21, 2025) provides a more reasonable starting point for users while still demonstrating the dashboard's capabilities.

## What Changes
- Update the default date range initialization from `2025-11-01` to `2025-11-17` (start date)
- Update the default date range initialization from `2025-11-30` to `2025-11-21` (end date)
- Update the date-filter specification documentation to reflect the new default range

## Impact
- Affected specs: date-filter
- Affected code: src/pages/Index.tsx (lines 26-29)
