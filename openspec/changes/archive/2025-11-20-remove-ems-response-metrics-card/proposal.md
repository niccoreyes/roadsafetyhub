# Change Proposal: Remove EMS Response Metrics Card

## Executive Summary
Remove the **EMS Response Metrics** chart component from the dashboard UI. This component displays EMS response time metrics that lack FHIR data support.

## Why
The EMS Response Metrics chart displays data that cannot be accurately sourced from the current FHIR implementation. The component was attempting to show meaningful metrics, but was relying on discrete EMS dispatch and arrival timestamps which are not consistently available in the FHIR resources, leading to unreliable data display.

## What Changes
- Removal of the `<EmsMetricsChart />` component from the dashboard UI
- Deletion of the component file from the codebase
- Adjustment of the grid layout to maintain optimal visual balance
- Cleanup of all related references and dependencies

## Change Type
**Removal** - Eliminating dashboard functionality

## Business Rationale
The EMS Response Metrics chart is attempting to display metrics that cannot be accurately sourced from the current FHIR implementation. The chart relies on discrete EMS dispatch and arrival timestamps which are not consistently available in the FHIR resources. This leads to:

1. **Data integrity concerns**: Undefined or missing data points degrade dashboard quality
2. **User confusion**: Displaying components without meaningful data creates a poor user experience
3. **Implementation complexity**: Significant FHIR resource mapping and transformation would be required to implement proper EMS response metrics

## Scope
**In Scope:**
- Removal of `<EmsMetricsChart />` component from `src/pages/Index.tsx`
- Deletion of component file `src/components/dashboard/EmsMetricsChart.tsx`
- Removal of associated styling and layout adjustments
- Cleanup of unused imports and references

**Out of Scope:**
- Other dashboard charts and metrics (SexPieChart, AgeBarChart, InjuryBarChart, MortalityPieChart)
- Core metrics cards and calculations
- FHIR data transformation logic

## User Impact
Users will no longer see the EMS Response Metrics chart in the Analytics & Trends section of the dashboard. This removes potentially confusing or inaccurate data from the visualization while maintaining all other analytical capabilities.

## Alternatives Considered
1. **Populate with mock data**: Rejected - would propagate misleading information
2. **Leave as placeholder**: Rejected - creates no value and confuses users
3. **Implement full FHIR mapping**: Rejected - exceeds current prioritization and requires significant FHIR resource redesign

## Success Criteria
- Component is fully removed from codebase
- Dashboard renders without reference errors
- No visual regressions in the Analytics & Trends grid layout
- All other dashboard functionality remains intact
