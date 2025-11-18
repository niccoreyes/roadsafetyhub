# Change: Enhanced Date Filter and Specific Observation Metrics

## Why
The current dashboard uses separate start date and end date pickers, which is less intuitive for users. Additionally, the dashboard lacks targeted analytics for specific FHIR Observations using the PH Road Safety IG SNOMED CT code 274215009 for Transport accident. Users need to:
1. Select date ranges more efficiently with a unified date range picker component
2. Filter all FHIR resources (Encounters, Conditions, Observations) to only include those created within the selected date range
3. View specific metrics for observations matching the PH Road Safety IG SNOMED CT code 274215009 (http://snomed.info/sct/900000000000207008/version/20241001)

## What Changes
- Replace separate start date and end date pickers with a unified DateRangePicker component (shadcn/ui calendar with range mode)
- Update all FHIR resource queries to filter resources by `resource.meta.lastUpdated` or applicable date field within the date range
- Create new metric card component for counting Observation resources matching SNOMED CT code 274215009
- Add utility function to fetch and filter Observations within the specified date range
- Enhance metrics calculator to process observation-specific data
- Integrate new observation metrics card into the Key Metrics section of the dashboard

**Breaking Changes**: None

## Impact
- **Affected Specs**:
  - `date-filter`: Enhances date selection UX and data filtering logic
  - `observation-metrics`: Adds new capability for SNOMED CT code-specific observation counting
- **Affected Code**:
  - `src/pages/Index.tsx`: Replace date pickers with DateRangePicker component
  - `src/utils/fhirClient.ts`: Add `fetchObservations` function with date range filtering
  - `src/utils/metricsCalculator.ts`: Add observation processing utilities
  - `src/components/dashboard/`: New or updated metric card component
- **Dependencies**: Uses existing date-fns and react-day-picker (already in use via shadcn/ui Calendar)
- **Backwards Compatibility**: Maintained - configurable to use original behavior if needed

## Technical Notes
- Date range picker will use shadcn/ui Calendar component with `mode="range"`
- Observation filtering will check SNOMED CT code in `Observation.code.coding` array
- All resource queries respect the date range filter for consistent analytics

## Reviewers
- Frontend reviewers for React/shadcn/ui component implementation
- FHIR domain experts for SNOMED CT code handling and Observation resource structure
- Dashboard users for UX validation of date range picker
