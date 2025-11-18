## Context
The dashboard currently uses separate start and end date pickers which requires two separate interactions. For the PH Road Safety IG implementation, we need to:
1. Improve UX by combining date controls into a single intuitive component
2. Add filtering logic to ensure only resources created within the date range are counted
3. Support SNOMED CT code-based observation filtering for targeted analytics

## Goals
- Provide single-interaction date range selection
- Apply consistent date filtering to all FHIR resources
- Enable observation-specific metrics based on PH Road Safety IG codes
- Maintain performance with large FHIR datasets
- Follow shadcn/ui patterns for component consistency

## Non-Goals
- Build a custom calendar component (use existing react-day-picker)
- Implement FHIR subscription or real-time updates
- Create backend API for metrics aggregation
- Store historical metrics data

## Decisions

### 1. Date Range Picker Implementation
**Decision**: Use shadcn/ui Calendar component with `mode="range"` in a Popover
- **Rationale**: Leverages existing dependencies, maintains design consistency, and provides native date range support
- **Alternative considered**: Build custom component combining two calendars
- **Trade-offs**: Native implementation vs full customization - chosen for simplicity and maintenance

### 2. Date Filtering Logic
**Decision**: Filter resources by `meta.lastUpdated` for Encounters/Conditions/Observations
- **Rationale**: Most reliable timestamp across all FHIR resource types
- **Implementation**: Pass date range as query parameters and filter in fetch functions
- **Performance**: Apply filtering at fetch time rather than in-memory to minimize data transfer

### 3. SNOMED CT Code Filtering
**Decision**: Check `Observation.code.coding` array for exact code match (system + code)
- **Rationale**: PH Road Safety IG defines specific code system and versioned URLs
- **Implementation**:
  - System: `http://snomed.info/sct/900000000000207008/version/20241001`
  - Code: `274215009`
- **Extensibility**: Design utility function to support additional SNOMED codes

### 4. Observation Metrics Card
**Decision**: Add new MetricCard with title "Transport Accidents" in Key Metrics section
- **Rationale**: Consistent UX with existing metrics cards, positioned as key health assessment indicator
- **Icon**: Use Heart pulse or Activity icon from lucide-react
- **Loading**: Share loading state with other metrics or implement independent loading for better UX

## Risks / Trade-offs

### Risk: Date range may exclude resources unexpectedly
- **Impact**: Low - users can adjust range to include desired data
- **Mitigation**: Provide clear UI messaging about active date range
- **Monitor**: User feedback on default date range appropriateness

### Risk: Performance degradation with large observation datasets
- **Impact**: Medium - could affect dashboard responsiveness
- **Mitigation**: Implement virtual scrolling if needed, optimize filtering logic
- **Monitor**: Response times for observation queries in production metrics

### Trade-off: Single date range picker vs two separate inputs
- **Pro**: Better UX, fewer clicks, visually cleaner
- **Con**: Less flexibility for open-ended ranges (but not required by use case)

## Migration Plan

### Phase 1: Date Range Picker
1. Replace separate date controls with DateRangePicker component
2. Update state management and query parameter handling
3. Test backward compatibility with existing date validation logic

### Phase 2: Date Filtering
1. Add date range parameters to fetchEncounters and fetchConditions
2. Implement date filtering logic in client utilities
3. Verify metrics update correctly with filtered data

### Phase 3: Observation Metrics
1. Create fetchObservations function
2. Implement SNOMED CT filtering utility
3. Build new metrics card component
4. Integrate into dashboard Key Metrics section

### Phase 4: Validation
1. Manual testing with mocked FHIR data
2. Code review focusing on SNOMED CT handling
3. User acceptance testing for date picker UX

## Open Questions
- Should we include a "clear date range" button or reset to defaults?
- Should observation metrics show percentage in addition to count?
- Do we need to support multiple SNOMED CT codes in future iterations?
