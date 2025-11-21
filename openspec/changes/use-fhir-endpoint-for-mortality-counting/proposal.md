# Change: Use FHIR Endpoint for Mortality Counting

## Why

The current implementation counts mortality using Observation resources with code system "http://www.roadsafetyph.doh.gov.ph/CodeSystem" and code "DIED" after fetching all observations. However, this approach is inefficient as it requires downloading all observations and then filtering them locally.

According to the user requirement, we should use the dedicated FHIR endpoint `https://cdr.fhirlab.net/fhir/Observation?value-concept=DIED` to count mortality, case fatality rate, and Mortality Breakdown (Observation died) / Patient. This approach is more efficient as it filters at the server side and reduces the amount of data transferred.

## What Changes

- Modify the `fetchObservationsByConcept` function to use `value-concept=DIED` parameter when fetching death observations
- Update the mortality calculation logic in `calculateMetrics` to properly count mortality using observations from the dedicated endpoint
- Ensure that mortality rate, case fatality rate, and Mortality Breakdown calculations use the data from the optimized endpoint
- Update dashboard data loading to use the `fetchObservationsByConcept` function with "DIED" parameter
- Maintain patient deduplication logic to count each unique patient only once
- Ensure the approach works without conditions, just using the dedicated endpoint

## Impact

- Affected code: `src/utils/fhirClient.ts` (update fetchObservationsByConcept)
- Affected code: `src/utils/metricsCalculator.ts` (update calculateMetrics and related functions)
- Affected code: `src/pages/Index.tsx` (update data fetching and metrics calculation)
- Improved performance by reducing data transfer and server-side filtering
- Test coverage: Update existing tests to verify the new approach

## Implementation Scope

**Out of Scope:**
- Changes to other observation-based metrics (non-mortality related)
- Changes to condition or encounter fetching logic
- Changes to other endpoints or ValueSet configurations

**In Scope:**
- Update `fetchObservationsByConcept` to properly handle the `value-concept=DIED` parameter
- Modify `calculateMetrics` to use observations fetched from the dedicated endpoint
- Update the mortality counting logic to properly count deaths per unique patient
- Ensure case fatality rate and mortality breakdown calculations use the optimized approach
- Update patient deduplication logic to work with the new approach
- Maintain backward compatibility where possible during transition

## Related Changes
- Builds upon previous observation-based outcome tracking implementation

## Acceptance Criteria
- Dashboard correctly counts deaths using the `value-concept=DIED` endpoint
- Mortality rate, case fatality rate, and total fatalities metrics calculate correctly using the optimized approach
- All existing tests pass with updated logic
- Performance is improved due to server-side filtering
- Patient deduplication is maintained to count each unique patient only once