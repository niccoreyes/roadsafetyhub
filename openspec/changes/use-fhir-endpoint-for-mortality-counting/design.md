# Design: Use FHIR Endpoint for Mortality Counting

## Design Decision: Use Dedicated FHIR Endpoint for Death Observations

### Current Approach (To Be Optimized)
- **Source**: All observations fetched and then filtered client-side for "DIED" code
- **Method**: Fetch all Observation resources, then filter using `.filter()` on the client
- **Efficiency**: Downloads all observations, then processes locally
- **Problems**: Inefficient data transfer, potential performance issues with large datasets

### Proposed Approach
- **Source**: Direct FHIR endpoint with server-side filtering: `https://cdr.fhirlab.net/fhir/Observation?value-concept=DIED`
- **Method**: Query the FHIR server with specific parameters to return only death observations
- **Efficiency**: Server-side filtering reduces data transfer and processing time
- **Benefits**: Better performance, reduced bandwidth usage, faster metrics calculation

#### FHIR Endpoint Parameters
```
GET https://cdr.fhirlab.net/fhir/Observation?value-concept=DIED&_lastUpdated=ge{startDate}&_lastUpdated=lt{endDate}
```
- `value-concept=DIED`: Filters for observations with "DIED" in the valueCodeableConcept
- `_lastUpdated=ge{startDate}&_lastUpdated=lt{endDate}`: Date range filtering (already implemented)

### Implementation Strategy

**1. Update fetchObservationsByConcept Function**
Current signature:
```typescript
export async function fetchObservationsByConcept(conceptValue: string, fromDate: string, toDate: string): Promise<any[]>
```

Updated approach:
```typescript
// Update the URL construction to use value-concept parameter
const url = `${FHIR_BASE_URL}/Observation?value-concept=${conceptValue}&_lastUpdated=ge${fromDate}&_lastUpdated=lt${toDate}`;
```

**2. Update Metrics Calculation Logic**

Current logic in `calculateMetrics()`:
```typescript
// Identify all patients with "DIED" observations who also have traffic-related conditions
const observationBasedTrafficDeaths = new Set<string>();
for (const obs of observations) {
  if (obs.valueCodeableConcept?.coding?.some((coding: any) =>
    coding?.system === "http://www.roadsafetyph.doh.gov.ph/CodeSystem" &&
    coding?.code === "DIED"
  )) {
    // ... logic to add patient IDs
  }
}
```

New logic after fetching from dedicated endpoint:
```typescript
// Since the endpoint already filters for DIED observations, 
// all returned observations are death observations
const deathObservations = await fetchObservationsByConcept("DIED", startDate, endDate);
const observationBasedTrafficDeaths = new Set<string>();
for (const obs of deathObservations) {
  const patientId = obs.subject?.reference?.replace("Patient/", "");
  if (patientId && trafficPatients.has(patientId)) {
    observationBasedTrafficDeaths.add(patientId);
  }
}
```

**3. Data Flow Changes**

Current flow:
```
Fetch ALL observations → Filter client-side for "DIED" → Process for mortality metrics
```

New flow:
```
Fetch "DIED" observations directly from FHIR endpoint → Process for mortality metrics
```

### Key Considerations

**Performance Benefits**
- Reduced data transfer: Only fetch relevant observations instead of all observations
- Server-side processing: Filtering happens on the FHIR server instead of client
- Faster response: Less data to process in the browser

**Patient Deduplication**
- The logic to count each unique patient only once must be preserved
- Multiple death observations for the same patient should still only count as one death
- Verify that the deduplication logic works correctly with the new approach

**Date Filtering**
- Ensure the date filtering using `_lastUpdated` parameter works as expected
- Verify that the same date range is applied in both the old and new approach for consistency

**Error Handling**
- Handle cases where the dedicated endpoint might be unavailable
- Maintain fallback mechanisms if needed
- Proper error logging and user feedback

**Backward Compatibility**
- Ensure the change doesn't break existing functionality
- The function signature remains the same, only the internal implementation changes

### Integration Points

**Files to Modify:**
1. `src/utils/fhirClient.ts` - Update fetchObservationsByConcept function
2. `src/utils/metricsCalculator.ts` - Verify metrics calculation works with new approach
3. `src/pages/Index.tsx` - Ensure the usage of the function remains consistent

**Functions Affected:**
- `fetchObservationsByConcept()` - Core change in fhirClient.ts
- `calculateMetrics()` - Will receive pre-filtered data instead of all observations
- Related death counting logic in metricsCalculator

### Migration Path

1. **Phase 1**: Update fetchObservationsByConcept function to use dedicated endpoint
   - Modify URL construction to use `value-concept=DIED`
   - Test with different concept values to ensure flexibility
   - Verify date filtering still works

2. **Phase 2**: Verify metrics calculations with new approach
   - Test that mortality, case fatality rate, and fatality counts are correct
   - Ensure patient deduplication is maintained
   - Run comprehensive tests

3. **Phase 3**: Performance validation
   - Compare performance before and after the change
   - Verify that the data integrity is maintained
   - Confirm that all metrics are computed correctly

### Risk Mitigation

- **Risk**: Endpoint format might be different than expected
  - **Mitigation**: Test the actual endpoint behavior and adjust implementation as needed
  - **Verification**: Write tests to validate the endpoint response

- **Risk**: Performance might not improve as expected
  - **Mitigation**: Add performance monitoring to measure before/after improvements
  - **Verification**: Compare loading times and data sizes

- **Risk**: Data filtering might not work as expected
  - **Mitigation**: Carefully validate that the server-side filtering matches the original client-side filtering
  - **Verification**: Create test cases with known data to verify correctness