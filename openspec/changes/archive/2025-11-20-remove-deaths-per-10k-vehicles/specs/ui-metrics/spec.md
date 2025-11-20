requirementIdPrefix: UI-RM-DPV
specId: ui-metrics

Related spec: `ui-metrics` (src/pages/Index.tsx and src/utils/metricsCalculator.ts)

This delta modifies the UI metrics display by removing the "Deaths per 10k Vehicles" metric card.

## MODIFIED Requirements

### Requirement: Transport Accident Metrics Card

The dashboard SHALL NOT display a "Deaths per 10k Vehicles" metric card.

#### Scenario: Dashboard no longer displays Deaths per 10k Vehicles metric

- BEFORE: The metric card was displayed with title "Deaths per 10k Vehicles"
- BEFORE: The metric card calculated and displayed using `metrics.deathsPer10kVehicles`
- AFTER: This card is completely removed from the dashboard UI
- Rationale: Metric relies on static motor vehicle count data that does not reflect actual road usage
- Validation: Visual confirmation that the card no longer appears on the dashboard

## IMPACT ANALYSIS

- UI Components affected:
  - src/pages/Index.tsx: Line 353-360 (MetricCard component for deaths per 10k vehicles)
  - Removal reduces metric cards from 5 to 4

- Backend/Logic affected:
  - src/utils/metricsCalculator.ts DashboardMetrics interface (line 5-12)
  - src/utils/metricsCalculator.ts calculateMetrics function (line 129-130)
