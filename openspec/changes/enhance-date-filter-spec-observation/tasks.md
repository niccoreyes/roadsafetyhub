## 1. Date Range Picker Component
- [ ] 1.1 Replace separate date pickers in `src/pages/Index.tsx` with DateRangePicker
- [ ] 1.2 Update state management to use date range object `{ from: Date, to: Date }`
- [ ] 1.3 Preserve existing default date range (Jan 1, 2024 to Dec 31, 2024)
- [ ] 1.4 Verify UI styling matches existing design system with shadcn/ui

## 2. Date Range Filtering Implementation
- [ ] 2.1 Update query parameters to pass date range to all FHIR fetch functions
- [ ] 2.2 Modify `fetchEncounters()` to filter by date range (`meta.lastUpdated`)
- [ ] 2.3 Modify `fetchConditions()` to filter by date range
- [ ] 2.4 Create `fetchObservations()` function with date range parameter
- [ ] 2.5 Add date range validation (ensure start date <= end date)
- [ ] 2.6 Test date filter edge cases (same day,跨年, etc.)

## 3. SNOMED CT Observation Metrics
- [ ] 3.1 Create `fetchObservations()` function in `src/utils/fhirClient.ts`
- [ ] 3.2 Implement SNOMED CT code 274215009 filtering in observations fetch
- [ ] 3.3 Add utility function to count matching observations
- [ ] 3.4 Create new metrics card component for observation count
- [ ] 3.5 Integrate card into Key Metrics section (position after Case Fatality Rate)
- [ ] 3.6 Add loading state for observation metrics

## 4. Data Processing and Metrics
- [ ] 4.1 Enhance metrics calculator with observation analysis functions
- [ ] 4.2 Add helper function to extract SNOMED codes from Observation.code.coding
- [ ] 4.3 Implement performance optimizations for large observation datasets
- [ ] 4.4 Add error handling for missing or malformed observation data

## 5. Integration and Testing
- [ ] 5.1 Verify all dashboard metrics update correctly with date range changes
- [ ] 5.2 Test observation metrics with mock FHIR data
- [ ] 5.3 Validate SNOMED CT code filtering accuracy
- [ ] 5.4 Test edge cases: empty date ranges, no matching observations
- [ ] 5.5 Check responsive design for date range picker on mobile

## 6. Documentation and Validation
- [ ] 6.1 Add code comments for new date range filtering logic
- [ ] 6.2 Document SNOMED CT code handling approach
- [ ] 6.3 Update README with new observation metrics feature
- [ ] 6.4 Run `openspec validate --strict` and fix any issues
- [ ] 6.5 Verify implementation matches OpenSpec requirements

## Dependencies
- Requires `date-fns`, `react-day-picker` (already in package.json)
- Uses existing shadcn/ui Calendar component
- Depends on PH Road Safety IG ValueSets for SNOMED CT codes

## Validation Criteria
- [ ] Date range picker visually merges start/end date pickers into single component
- [ ] All FHIR resources filter correctly by date range
- [ ] Observation count for SNOMED CT 274215009 displays accurately
- [ ] Metrics refresh when date range changes
- [ ] No console errors or runtime exceptions
