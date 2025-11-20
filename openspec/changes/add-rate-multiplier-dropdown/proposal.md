# Change: Add Rate Multiplier Dropdown Options

## Why
Currently, rate calculations use fixed multipliers (per 100k population, percentage). Users need flexibility to view rates at different scales (per 100, per 1000, per 10k, per 100k, per 1M) without manual calculations, making the dashboard more adaptable to different analytical contexts and user preferences.

## What Changes
- Add dropdown selectors to mortality rate and injury rate metric cards
- Allow users to dynamically switch between: per 100, per 1000, per 10,000, per 100,000, and per 1,000,000 population
- Update display units and tooltips to reflect selected multiplier
- Add UI state management for selected multipliers
- Maintain backward compatibility (default to current per 100k behavior)
- Update spec documentation to reflect new interactive behavior

## Impact
- Affected specs: ui-metrics
- Affected code:
  - src/pages/Index.tsx - Add dropdown controls to metric cards
  - src/components/dashboard/MetricCard.tsx - Make component support dropdown/controls
  - src/utils/metricsCalculator.ts - Potentially refactor to accept multiplier parameter
  - Dashboard state management for selected multipliers
