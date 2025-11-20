# dashboard-visualizations Specification

## Purpose
Defines the dashboard visualization components, including chart types, data presentation patterns, and component structure for the road safety analytics dashboard.

## Requirements

## REMOVED Requirements

### Requirement: EMS Response Metrics Chart Component

The dashboard SHALL NOT display an **EMS Response Metrics** chart component.

#### Scenario: Remove EMS metrics visualization from dashboard

- **BEFORE**: A chart component was rendered within a `grid` layout in the Analytics & Trends section
- **BEFORE**: The chart displayed `Time to Scene`, `Time to Hospital`, and `Total Response` metrics
- **BEFORE**: Component used `recharts` for bar chart visualization
- **BEFORE**: Data included average, median, and range values for each metric type
- **BEFORE**: Component was rendered from `EmsMetricsChart.tsx` with props `dateRange` and `isLoading`
- **BEFORE**: File location: `src/components/dashboard/EmsMetricsChart.tsx`
- **AFTER**: Component is completely removed from codebase
- **AFTER**: Grid layout in Analytics & Trends contains remaining charts: `SexPieChart`, `AgeBarChart`, `InjuryBarChart`, `MortalityPieChart`
- **Rationale: Lack of FHIR data support** - The component attempted to display EMS response times (average, median, range for time to scene, time to hospital, total response) but these metrics cannot be accurately derived from currently available FHIR resources
- **Validation: Component deletion
  - Verify `src/components/dashboard/EmsMetricsChart.tsx` no longer exists
  - Verify import statement removed from `src/pages/Index.tsx`
  - Verify JSX component usage removed from `Index.tsx` line 406-407
  - Verify no remaining references to `EmsMetricsChart` in codebase
  - Confirm dashboard UI renders without errors
  - Confirm grid layout in Analytics & Trends section displays correctly with remaining charts